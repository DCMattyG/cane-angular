import { Component, AfterViewInit, OnInit, ViewChildren, QueryList, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormGroup, FormBuilder, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { CodeEditorComponent } from '../code-editor/code-editor.component';

import * as dot from 'dot-object';
import { CaneService } from '../cane/cane.service';
import { MessageService } from '../message/message.service';
import { WorkflowService } from '../workflow/workflow.service';
import { Router } from '@angular/router';

const VALID_NAME = /^(\$*[a-zA-Z0-9]+)(\.(([a-zA-Z0-9]+)|(\d+\.[a-zA-Z0-9]+)))*(\.\d+)?$/;
const VALID_QUERY = /^(([$.]?[\w-]+(=[\w-' ]+))?(&[$.]?[\w-]+(=[\w-'. ]+))*)?$/;

@Component({
  selector: 'app-workflow-editor',
  templateUrl: './workflow-editor.component.html',
  styleUrls: ['./workflow-editor.component.scss'],
  animations: [
    trigger('openClose', [
      state('opened', style({
        visibility: 'visible',
        maxHeight: '500px'
      })),
      state('closed', style({
        visibility: 'hidden',
        maxHeight: '0px'
      })),
      state('*', style({
        visibility: 'hidden',
        maxHeight: '0px'
      })),
      transition('opened=>closed', animate('750ms')),
      transition('closed=>opened', animate('750ms 194ms')),
      transition('opened=>*', animate('750ms')),
      transition('*=>opened', animate('750ms 194ms'))
    ]),
  ]
})

export class WorkflowEditorComponent implements AfterViewInit, OnInit {
  @ViewChildren('requestEditor') requestEditors: QueryList<CodeEditorComponent>;
  @ViewChildren('queryEditor') queryEditors: QueryList<ElementRef>;
  @ViewChildren('responseEditor') responseEditors: QueryList<CodeEditorComponent>;

  stateTracker = {
    activeParamDrop: null,
    activeFieldDrop: null,
    activeVerbDrop: null,
    openEditor: null,
    steps: []
  };

  public workflowEditor: FormGroup;
  public newWorkflowStep: FormGroup;
  public editWorkflowDetails: FormGroup;
  private newEditor = false;
  private editDetails = false;
  private accountList;
  private apiList;

  private settingsDrop = false;
  private accountDrop = false;
  private apiDrop = false;
  private verbDrop = false;

  private verbs = {
    "GET" : 31,
    "POST": 40,
    "PATCH" : 50,
    "DELETE" : 55
  };

  private categories = [
    "General",
    "Compute",
    "Network",
    "Storage",
    "Cloud"
  ];

  constructor(
    private _fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private caneService: CaneService,
    private messageService: MessageService,
    private workflowService: WorkflowService,
    private router: Router) {
      if(this.router.url == '/workflow/update' && this.workflowService.currentOperation != 'update') {
        this.router.navigate(['/workflow']);
      }

      if(this.workflowService.currentOperation == 'update') {
        this.loadWorkflow();
      }
    }

  ngAfterViewInit() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.initTracker();

    this.workflowEditor = this._fb.group({
      workflowName: ['newWorkflow'],
      workflowDescription: ['New Workflow...'],
      workflowCategory: ['General'],
      steps: this._fb.array([
          // this.initSteps(),
      ])
    }, {
      validator: [this.validateSteps]
    });

    this.newWorkflowStep = this._fb.group({
      stepTitle: ['', Validators.required],
      stepAccount: ['', Validators.required],
      stepAPI: ['', Validators.required]
    });

    this.editWorkflowDetails = this._fb.group({
      workflowName: ['', Validators.required],
      workflowDescription: ['', Validators.required],
      workflowCategory: ['', Validators.required]
    });

    this.refreshDevices();
  }

  onSubmit() {
    console.log("Saving...");
    console.log(this.workflowEditor.value);
    this.saveWorkflow(this.workflowEditor.value);
  }

  initTracker() {
    this.stateTracker.steps.push({
      currentTab: 'req',
      requestWindow: 'param'
    });
  }

  initStep(title: string, account: string, api: string, apiDetail: string, verb: string) {
    return this._fb.group({
      stepTitle: [title],
      stepAccount: [account],
      stepAPI: [api],
      stepAPIDetail: [apiDetail],
      stepVerb: [verb],
      selected: [false],
      params: this._fb.array([
        // this.initParam(),
      ]),
      headers: this._fb.array([
        // this.initHeader(),
      ]),
      variables: this._fb.array([
        // this.initVariable(),
      ])
    });
  }

  initParam(name: string, value: string, paramType: string, fieldType: string) {
    return this._fb.group({
      selected: [false],
      name: [name, Validators.pattern(VALID_NAME)],
      value: [value],
      paramType: [paramType],
      fieldType: [fieldType]
    }, {
      validator: [this.validateGroup, this.validateType]
    });
  }

  initHeader(name: string, value: string) {
    return this._fb.group({
      selected: [false],
      name: [name],
      value: [value]
    }, {
      validator: [this.validateGroup]
    });
  }

  initVariable(name: string, value: string) {
    return this._fb.group({
      selected: [false],
      name: [name],
      value: [value]
    }, {
      validator: [this.validateGroup]
    });
  }

  debug() {
    console.log(this.workflowEditor);
  }

  isValid(step: number, name: string) {
    var control = (<FormArray>this.workflowEditor.controls['steps']).at(step).get(name) as FormArray;

    return control.valid;
  }

  validateGroup(group: FormGroup) {
    if(group) {
      var errors = {};
      
      Object.keys(group.controls).forEach((key) => {
        if(key != "selected") {
          if(group.controls[key].value == "") {
            errors[key] = "";
          }
        }
      });

      if(Object.keys(errors).length > 0) {
        return errors;
      }

      return null;
    }
  }
  
  validateType (group: FormGroup) {
    if(group) {
      var valueVal = group.controls['value'].value;
      var fieldTypeVal = group.controls['fieldType'].value;

      switch(fieldTypeVal) {
        case 'number':
          if(!isNaN(valueVal)) {
            return null;
          }
          break;
        case 'boolean':
          if(valueVal.toLowerCase() == "true" || valueVal.toLowerCase() == "false") {
            return null;
          }
          break;
        case 'string':
          return null;
      }

      return { isValid: false };
    }
  }

  validateSteps (group: FormGroup) {
    if(group) {
      var numSteps = group.controls['steps'].value.length;
      
      if(numSteps > 0) {
        return null;
      }

      return { isValid: false };
    }
  }

  addParam(index: number, name: string, value: string, paramType: string, fieldType: string) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('params') as FormArray;
    control.push(this.initParam(name, value, paramType, fieldType));
  }

  removeParam(index: number) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('params') as FormArray;

    for(var i = (control.controls.length - 1); i >= 0; i--) {
      if(control.at(i).get('selected').value == true) {
        control.removeAt(i);
      }
    }
  }

  addHeader(index: number, name: string, value: string) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('headers') as FormArray;
    control.push(this.initHeader(name, value));
  }

  removeHeader(index: number) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('headers') as FormArray;

    for(var i = (control.controls.length - 1); i >= 0; i--) {
      if(control.at(i).get('selected').value == true) {
        control.removeAt(i);
      }
    }
  }

  addVariable(index: number, name: string, value: string) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('variables') as FormArray;
    control.push(this.initVariable(name, value));
  }

  removeVariable(index: number) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('variables') as FormArray;

    for(var i = (control.controls.length - 1); i >= 0; i--) {
      if(control.at(i).get('selected').value == true) {
        control.removeAt(i);
      }
    }
  }

  updateParamType(step: number, param: number, value: string) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(step).get('params') as FormArray;

    control.at(param).get('paramType').setValue(value);
    this.stateTracker.activeParamDrop = "";
  }

  updateFieldType(step: number, param: number, value: string) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(step).get('params') as FormArray;

    control.at(param).get('fieldType').setValue(value);
    this.stateTracker.activeFieldDrop = "";
  }

  addStep(): Promise<any> {
    this.closeModal('add');

    console.log(this.newWorkflowStep);

    var newTitle = this.newWorkflowStep.value.stepTitle;
    var newAccount = this.newWorkflowStep.value.stepAccount;
    var newAPI = this.newWorkflowStep.value.stepAPI
    var newAccountDetail;
    var newAPIDetail;
    var newVerb = 'GET';

    return new Promise((resolve) => {
      this.caneService.getAccountDetail(newAccount).toPromise()
      .then(
        res=> {
          newAccountDetail = res['baseURL']
        }
      )
      .then(
        ()=> {
          this.caneService.getApiDetail(newAccount, newAPI).toPromise()
          .then(
            res=> {
              newAPIDetail = res['path'];
              // newVerb = res['method']
            }
          )
          .then(
            () => {
              const control = <FormArray>this.workflowEditor.controls['steps'];
              control.push(this.initStep(newTitle, newAccount, newAPI, (newAccountDetail + newAPIDetail), newVerb));
          
              this.initTracker();
              this.newWorkflowStep.reset();
              this.changeDetector.detectChanges();
              resolve(null);
            }
          )
        }
      )
    });
  }

  remStep() {
    const control = <FormArray>this.workflowEditor.controls['steps'];

    for(var i = (control.controls.length - 1); i >= 0; i--) {
      if(control.at(i).get('selected').value == true) {
        control.removeAt(i);
      }
    }
  }

  modifyDetails() {
    this.workflowEditor.patchValue({ workflowName: this.editWorkflowDetails.value.workflowName });
    this.workflowEditor.patchValue({ workflowDescription: this.editWorkflowDetails.value.workflowDescription });
    this.workflowEditor.patchValue({ workflowCategory: this.editWorkflowDetails.value.workflowCategory });

    this.closeModal('edit');
  }

  // getDropState(index: number) {
  //   if(this.stateTracker.openEditor == index) {
  //     return 'opened';
  //   }

  //   return 'closed';
  // }

  toggleEditor(event: any, index: number) {
    if(event.target.tagName != "DIV") {
      event.stopPropagation();
      return;
    }

    if(this.stateTracker.openEditor == index) {
      this.stateTracker.openEditor = null;
    } else {
      this.stateTracker.openEditor = index;
    }
  }

  toggleParamDrop(step: number, param: number) {
    if(this.stateTracker.activeParamDrop == `${step}x${param}`) {
      this.stateTracker.activeParamDrop = null;
    } else {
      this.stateTracker.activeParamDrop = `${step}x${param}`;
    }
  }

  toggleFieldDrop(step: number, field: number) {
    if(this.stateTracker.activeFieldDrop == `${step}x${field}`) {
      this.stateTracker.activeFieldDrop = null;
    } else {
      this.stateTracker.activeFieldDrop = `${step}x${field}`;
    }
  }

  toggleSettingsDrop() {
    this.settingsDrop = this.settingsDrop ? false : true;
  }

  toggleAccountDrop() {
    this.accountDrop = this.accountDrop ? false : true;
  }

  toggleApiDrop() {
    this.apiDrop = this.apiDrop ? false : true;
  }

  toggleVerbDrop(id: number) {
    this.stateTracker.activeVerbDrop = this.stateTracker.activeVerbDrop == id ? null : id;
  }

  setRequestWindow(index: number, state: string) {
    this.stateTracker.steps[index].requestWindow = state;
  }

  setEditorTab(index: number, tab: string) {
    this.stateTracker.steps[index].currentTab = tab;
  }

  setCategory(category: string) {
    this.toggleSettingsDrop();
    this.editWorkflowDetails.patchValue({ workflowCategory: category });
    // this.changeDetector.detectChanges();
  }

  setAccount(account: string) {
    this.toggleAccountDrop();
    this.newWorkflowStep.patchValue({ stepAccount: account });
    this.newWorkflowStep.patchValue({ stepAPI: '' });
    this.refreshApis(account)
    // this.changeDetector.detectChanges();
  }

  setApi(api: string) {
    this.toggleApiDrop();
    this.newWorkflowStep.patchValue({ stepAPI: api });
    // this.changeDetector.detectChanges();
  }

  setVerb(index: number, verb: string) {
    (<FormArray>this.workflowEditor.controls['steps']).at(index).patchValue({ stepVerb: verb });
    this.stateTracker.activeVerbDrop = null;
  }

  // updateResponse(event: Event, index: number) {
  //   console.log("Update Response Editor " + index);
  //   console.log(event);

  // }

  updateRequest(index: number) {
    var control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('params') as FormArray;
    var selectedEditor = this.requestEditors.find(editor => editor.id == index);
    var editorValue = selectedEditor.codeEditor.getSession().getValue();

    var objVal = JSON.parse(editorValue.trim());
    var bodyObj = {};
    dot.dot(objVal, bodyObj);

    var paramName = "";
    var fieldType = "";

    var queryObj = {}
    var split;

    while(control.controls.length != 0) {
      control.removeAt(0);
    }

    Object.keys(bodyObj).forEach((key) => {
      paramName = key;

      if(typeof(bodyObj[key]) == "number") {
        fieldType = "number"
      } else if(typeof(bodyObj[key]) == "boolean") {
        fieldType = "boolean"
      } else if(typeof(bodyObj[key]) == "string"){
        fieldType = "string"
      } else {
        console.log("Unkown Type: " + bodyObj[key]);
      }

      var newControl = this._fb.group({
        selected: [false],
        name: [paramName],
        descr: [''],
        paramType: ['body'],
        fieldType: [fieldType],
        value: [bodyObj[key]]
      });

      control.push(newControl);
    });

    if(this.queryEditors) {
      var selectedQuery = this.queryEditors.find(query => query.nativeElement.id == index.toString());
      var data = selectedQuery.nativeElement.value;
      split = data.split('&');

      split.forEach((item) => {
        var temp = item.split('=')
        if(temp[0] && temp[1]) {
          if(temp[0].length > 0 && temp[1].length > 0) {
            queryObj[temp[0]] = temp[1]
          }
        }
      })
    } else {
      console.log("Cannot Locate queryEditors!");
    }

    Object.keys(queryObj).forEach((key) => {
      paramName = key;

      if(!isNaN(queryObj[key])) {
        fieldType = "number"
      } else if(queryObj[key].toLowerCase() == "true" || queryObj[key].toLowerCase() == "false") {
        fieldType = "boolean"
      } else if(typeof(queryObj[key]) == "string"){
        fieldType = "string"
      } else {
        console.log("Unkown Type: " + queryObj[key]);
      }

      var newControl = this._fb.group({
        selected: [false],
        name: [paramName],
        descr: [''],
        paramType: ['query'],
        fieldType: [fieldType],
        value: [queryObj[key]]
      });

      control.push(newControl);
    });
  }

  paramToRAW(index: number) {
    var control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('params') as FormArray;
    var selectedQuery = this.queryEditors.find(query => query.nativeElement.id == index.toString());
    var selectedEditor = this.requestEditors.find(editor => editor.id == index);
    var queryArray = [];
    var tgt = {};

    for(var i = (control.controls.length - 1); i >= 0; i--) {
      if(control.at(i).get('paramType').value == 'body') {
        var key = control.at(i).get('name').value;
        var value;

        switch(control.at(i).get('fieldType').value) {
          case 'string':
            value = control.at(i).get('value').value;
            break;
          case 'number':
            value = +(control.at(i).get('value').value);
            break;
          case 'boolean':
            if(String((control.at(i).get('value').value)).toLowerCase() == 'true') {
              value = true;
            } else {
              value = false;
            }
            break;
          default:
            console.log("Unknown fieldType!")
        }

        tgt[key] = value;
      } else if(control.at(i).get('paramType').value == 'query') {
        var queryTemp = control.at(i).get('name').value;
        queryTemp += '=';
        queryTemp += control.at(i).get('value').value;

        queryArray.push(queryTemp);
      }
    }

    dot.object(tgt);

    var prettyObj = JSON.stringify(tgt, null, 4);
    selectedEditor.codeEditor.getSession().setValue(prettyObj);
    selectedQuery.nativeElement.value = queryArray.join('&');
  }

  editorUndo(index: number) {
    var selectedEditor = this.requestEditors.find(editor => editor.id == index);
    selectedEditor.codeEditor.undo();
  }

  editorRedo(index: number) {
    var selectedEditor = this.requestEditors.find(editor => editor.id == index);
    selectedEditor.codeEditor.redo();
  }

  editorErrors(index: number) {
    if(this.requestEditors) {
      var selectedEditor = this.requestEditors.find(editor => editor.id == index);

      if(selectedEditor) {
        var errors = selectedEditor.codeEditor.getSession().getAnnotations();

        return errors.length;
      }
    }
  }

  queryErrors(index: number) {
    var regex = new RegExp(VALID_QUERY);

    if(this.queryEditors) {
      var selectedEditor = this.queryEditors.find(query => query.nativeElement.id == index.toString());

      if(selectedEditor) {
        var queryValue = selectedEditor.nativeElement.value;

        return regex.test(queryValue);
      }
    }
  }

  openModal(target: string) {
    if(target == 'add') {
      this.newEditor = true;
    } else if(target == 'edit') {
      this.editWorkflowDetails.patchValue({ workflowName: this.workflowEditor.value.workflowName });
      this.editWorkflowDetails.patchValue({ workflowDescription: this.workflowEditor.value.workflowDescription });
      this.editWorkflowDetails.patchValue({ workflowCategory: this.workflowEditor.value.workflowCategory });

      this.editDetails = true;
    }
  }

  closeModal(target: string) {
    if(target == 'add') {
      this.newEditor = false;
      // this.newWorkflowStep.reset();
    } else if(target == 'edit') {
      this.editDetails = false;
    }
  }

  refreshDevices() {
    this.caneService.getAccount().toPromise()
    .then(
      res => {
        this.accountList = res['devices'];
      }
    )
  }

  refreshApis(account: string) {
    this.caneService.getApi(account).toPromise()
    .then(
      res => {
        this.apiList = res['apis'];
      }
    )
  }

  moveStep(direction: string) {
    var control = <FormArray>this.workflowEditor.controls['steps'];
    var tempControl: AbstractControl;
    var tempState;

    this.stateTracker.activeFieldDrop = null;
    this.stateTracker.activeParamDrop = null;

    if(direction == 'up') {
      for(var i = 0; i <= (control.controls.length - 1); i++) {
        if(i > 0) {
          if(control.at(i).get('selected').value == true) {
            tempControl = control.at(i);
            control.removeAt(i);
            control.insert((i-1), tempControl);
            tempState = this.stateTracker.steps[i];
            this.stateTracker.steps.splice(i, 1);
            this.stateTracker.steps.splice((i-1), 0, tempState);

            if(this.stateTracker.openEditor == i) {
              this.stateTracker.openEditor = (i-1);
            } else if(this.stateTracker.openEditor == (i-1)) {
              this.stateTracker.openEditor = i;
            }
          }
        }
      }
    }

    if (direction == 'down') {
      for(var i = (control.controls.length - 1); i >= 0; i--) {
        if( i < (control.controls.length - 1)) {
          if(control.at(i).get('selected').value == true) {
            tempControl = control.at(i);
            control.removeAt(i);
            control.insert((i+1), tempControl);
            tempState = this.stateTracker.steps[i];
            this.stateTracker.steps.splice(i, 1);
            this.stateTracker.steps.splice((i+1), 0, tempState);

            if(this.stateTracker.openEditor == i) {
              this.stateTracker.openEditor = (i+1);
            } else if (this.stateTracker.openEditor == (i+1)) {
              this.stateTracker.openEditor = i;
            }
          }
        }
      }
    }

    this.changeDetector.detectChanges();
  }

  checkUncheck(target: HTMLInputElement, step: number, type: string) {
    var control = (<FormArray>this.workflowEditor.controls['steps']).at(step).get(type) as FormArray;

    for(var i = 0; i <= (control.controls.length - 1); i++) {
      if(target.checked) {
        control.at(i).get('selected').setValue(true);
      } else {
        control.at(i).get('selected').setValue(false);
      }
    }

    this.changeDetector.detectChanges();
  }

/*
// Workflow Struct
type Workflow struct {
	Name        string
	Description string
	Type        string
	Steps       []Step
	// Note, add OutputMap []map[string]string
}

// Step Struct
type Step struct {
	title         string
	description   string
	apiCall       string
	deviceAccount string
	varMap        []map[string]string
}

// New Step Struct
type Step struct {
	title         string
	description   string
	apiCall       string
	deviceAccount string
  headers       []map[string]string
  variables     []map[string]string
  body          []map[string]string
  query         []map[string]string
}
*/

  saveWorkflow(data: object) {
    var newWorkflow = {
      name: '',
      description: '',
      category: '',
      type: '',
      steps: []
    };

    newWorkflow.name = data['workflowName'];
    newWorkflow.description = data['workflowDescription'];
    newWorkflow.category = data['workflowCategory'].toLowerCase();

    data['steps'].forEach(
      step => {
        var newStep = {
          title: '',
          description: '',
          apiCall: '',
          verb: '',
          deviceAccount: '',
          headers: [],
          variables: [],
          body: [],
          query: []
        };

        newStep.title = step['stepTitle'];
        newStep.deviceAccount = step['stepAccount'];
        newStep.apiCall = step['stepAPI'];
        newStep.verb = step['stepVerb'];

        step['headers'].forEach(
          header => {
            var newHeader = {};
            newHeader[header['name']] = header['value'];
            newStep.headers.push(newHeader);
          });
        step['params'].forEach(
          param => {
            if(param['paramType'] == 'body') {
              var newBody = {};
              newBody[param['name']] = param['value'];
              newStep.body.push(newBody);
            }

            if(param['paramType'] == 'query') {
              var newQuery = {};
              newQuery[param['name']] = param['value'];
              newStep.query.push(newQuery);
            }
          });
        step['variables'].forEach(
          variable => {
            var newVariable = {};
            newVariable[variable['name']] = variable['value'];
            newStep.variables.push(newVariable);
          });

        newWorkflow.steps.push(newStep);
      });

      console.log(newWorkflow);
      if(this.workflowService.currentOperation == 'update') {
        this.caneService.updateWorkflow(this.workflowService.targetWorkflow, newWorkflow)
        .subscribe(
          res => {
            console.log(res);
            this.messageService.newMessage('success', 'Workflow Updated', `Workflow "${this.workflowService.targetWorkflow}" has been successfully updated!`);
            this.router.navigate(['/workflow']);
          },
          error => {
            console.log(error);
            this.messageService.newMessage('error', error['statusText'], error['error']['message']);
          });
      } else {
        this.caneService.createWorkflow(newWorkflow)
        .subscribe(
          res => {
            console.log(res);
            this.messageService.newMessage('success', 'Workflow Saved', `Workflow "${newWorkflow.name}" has been successfully saved!`);
            this.router.navigate(['/workflow']);
          },
          error => {
            console.log(error);
            this.messageService.newMessage('error', error['statusText'], error['error']['message']);
          });
      }
  }

  varType(variable: any) {
    var varType = '';

    if(!isNaN(variable)) {
      varType = 'number';
    } else if(variable.toLowerCase() == "true" || variable.toLowerCase() == "false") {
      varType = 'bool';
    } else {
      varType = 'string';
    }

    return varType;
  }

  loadWorkflow() {
    this.caneService.getWorkflowDetail(this.workflowService.targetWorkflow)
    .subscribe(
      res => {
        if(res) {
          this.workflowEditor.patchValue({ workflowName: res['name']});
          this.workflowEditor.patchValue({ workflowDescription: res['description']});
          this.workflowEditor.patchValue({ workflowCategory: (res['category'].charAt(0).toUpperCase() + res['category'].slice(1))});

          let index = 0;

          res['steps'].forEach(
            step => {
              this.newWorkflowStep.patchValue({ stepTitle: step['title'] });
              this.newWorkflowStep.patchValue({ stepAccount: step['deviceAccount'] });
              this.newWorkflowStep.patchValue({ stepAPI: step['apiCall'] });

              this.addStep().then(
                () => {
                  step['body'].forEach(
                    body => {
                      let key = Object.keys(body);
                      let name = key[0];
                      let value = body[name];
                      let type = this.varType(value);
    
                      this.addParam(index, name, value, 'body', type);
                    })
                }
              ).then(
                () => {
                  step['query'].forEach(
                    query => {
                      let key = Object.keys(query);
                      let name = key[0];
                      let value = query[name];
                      let type = this.varType(value);
    
                      this.addParam(index, name, value, 'query', type);
                    })
                }
              ).then(
                () => {
                  step['headers'].forEach(
                    header => {
                      let key = Object.keys(header);
                      let name = key[0];
                      let value = header[name];
    
                      this.addHeader(index, name, value);
                    })
                }
              ).then(
                () => {
                  step['variables'].forEach(
                    variable => {
                      let key = Object.keys(variable);
                      let name = key[0];
                      let value = variable[name];
    
                      this.addVariable(index, name, value);
                    })
                }
              ).then(
                () => {
                  this.setVerb(index, step['verb']);
                  index++;
                }
              )
            }
          )
        }
      }
    )
  }

  getVerbs() {
    return Object.keys(this.verbs);
  }

  verbWidth(verb: string) {
    return this.verbs[verb];
  }

  executeRequest() {
    console.log("Executing Request!");
  }

  detectChanges() {
    this.changeDetector.detectChanges();
  }
}
