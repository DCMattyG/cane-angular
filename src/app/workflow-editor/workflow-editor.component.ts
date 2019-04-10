import { Component, AfterViewInit, OnInit, ViewChildren, QueryList, ChangeDetectorRef, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormGroup, FormBuilder, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { CodeEditorComponent } from '../code-editor/code-editor.component';

import * as dot from 'dot-object';

const VALID_NAME = /^([a-zA-Z]+)(\.(([a-zA-Z]+)|(\d+\.[a-zA-Z]+)))*(\.\d+)?$/;

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
  @ViewChildren('responseEditor') responseEditors: QueryList<CodeEditorComponent>;

  fakeApis = {
    "webex" : {
      "listRooms": {verb: "GET", api: "https://api.ciscospark.com/v1/rooms"},
      "createRoom": {verb: "POST", api: "https://api.ciscospark.com/v1/rooms"},
      "deleteRoom": {verb: "DELETE", api: "https://api.ciscospark.com/v1/rooms/{roomId}"}
    },
    "meraki": {
      "newAdmin": {verb: "POST", api: "https://api.meraki.com/api/v0/organizations/{organizationId}/admins"},
      "newNetwork": {verb: "POST", api: "https://api.meraki.com/api/v0/organizations/{organizationId}/networks"},
      "newOrg": {verb: "POST", api: "https://api.meraki.com/api/v0/organizations"}
    }
  }

  stateTracker = {
    activeParamDrop: null,
    activeFieldDrop: null,
    openEditor: null,
    steps: []
  };

  public workflowEditor: FormGroup;
  public newWorkflowStep: FormGroup;
  private newEditor = false;

  constructor(private _fb: FormBuilder, private changeDetector: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.initTracker();

    this.workflowEditor = this._fb.group({
      workflowName: [''],
      steps: this._fb.array([
          // this.initSteps(),
      ])
    });

    this.newWorkflowStep = this._fb.group({
      stepTitle: ['', Validators.required],
      stepAccount: ['', Validators.required],
      stepAPI: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log("Saving...");
  }

  initTracker() {
    this.stateTracker.steps.push({
      currentTab: 'req',
      requestWindow: 'param',
    });
  }

  initSteps(title: string, account: string, api: string, verb: string) {
    return this._fb.group({
      stepTitle: [title],
      stepAccount: [account],
      stepAPI: [api],
      stepVerb: [verb],
      selected: [false],
      params: this._fb.array([
        this.initParams(),
      ]),
      headers: this._fb.array([
        this.initHeaders(),
      ]),
      variables: this._fb.array([
        this.initVariables(),
      ])
    });
  }

  initParams() {
    return this._fb.group({
      selected: [false],
      name: ['', Validators.pattern(VALID_NAME)],
      value: [''],
      paramType: [''],
      fieldType: ['']
    }, {
      validator: [this.validateGroup, this.validateType]
    });
  }

  initHeaders() {
    return this._fb.group({
      selected: [false],
      name: [''],
      value: ['']
    });
  }

  initVariables() {
    return this._fb.group({
      selected: [false],
      name: [''],
      value: ['']
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

  addParam(index: number) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('params') as FormArray;
    control.push(this.initParams());
  }

  removeParam(index: number) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('params') as FormArray;

    for(var i = (control.controls.length - 1); i >= 0; i--) {
      if(control.at(i).get('selected').value == true) {
        control.removeAt(i);
      }
    }
  }

  addHeader(index: number) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('headers') as FormArray;
    control.push(this.initHeaders());
  }

  removeHeader(index: number) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('headers') as FormArray;

    for(var i = (control.controls.length - 1); i >= 0; i--) {
      if(control.at(i).get('selected').value == true) {
        control.removeAt(i);
      }
    }
  }

  addVariable(index: number) {
    const control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('variables') as FormArray;
    control.push(this.initVariables());
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

  addStep() {
    this.closeModal();

    var newTitle = this.newWorkflowStep.value.stepTitle;
    var newAccount = this.newWorkflowStep.value.stepAccount;
    var newAPI = this.fakeApis[newAccount][this.newWorkflowStep.value.stepAPI].api;
    var newVerb = this.fakeApis[newAccount][this.newWorkflowStep.value.stepAPI].verb;

    const control = <FormArray>this.workflowEditor.controls['steps'];
    control.push(this.initSteps(newTitle, newAccount, newAPI, newVerb));

    this.initTracker();
    this.newWorkflowStep.reset();
    this.changeDetector.detectChanges();
  }

  remStep() {
    const control = <FormArray>this.workflowEditor.controls['steps'];

    for(var i = (control.controls.length - 1); i >= 0; i--) {
      if(control.at(i).get('selected').value == true) {
        control.removeAt(i);
      }
    }
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

  setRequestWindow(index: number, state: string) {
    this.stateTracker.steps[index].requestWindow = state;
  }

  setEditorTab(index: number, tab: string) {
    this.stateTracker.steps[index].currentTab = tab;
  }

  // updateResponse(event: Event, index: number) {
  //   console.log("Update Response Editor " + index);
  //   console.log(event);

  // }

  updateRequest(index: number) {
    var selectedEditor = this.requestEditors.find(editor => editor.id == index);
    var editorValue = selectedEditor.codeEditor.getSession().getValue();
    // var editorError = selectedEditor.codeEditor.getSession().getAnnotations()

    var objVal = JSON.parse(editorValue.trim());
    var target = {};
    dot.dot(objVal, target);

    var paramName = "";
    var fieldType = "";

    var control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('params') as FormArray;

    while(control.controls.length != 0) {
      control.removeAt(0);
    }

    Object.keys(target).forEach((key) => {
      paramName = key;

      if(typeof(target[key]) == "number") {
        // console.log(key + " => " + (+tgt[key]) + "(num)");
        fieldType = "number"
      } else if(typeof(target[key]) == "boolean") {
        // console.log(key + " => " + tgt[key] + "(bool)");
        fieldType = "boolean"
      } else if(typeof(target[key]) == "string"){
        // console.log(key + " => " + tgt[key] + "(str)");
        fieldType = "string"
      } else {
        console.log("Unkown Type: " + target[key]);
      }

      var newControl = this._fb.group({
        selected: [false],
        name: [paramName],
        descr: [''],
        paramType: ['body'],
        fieldType: [fieldType],
        value: [target[key]]
      });

      control.push(newControl);
    });
  }

  paramToRAW(index: number) {
    var control = (<FormArray>this.workflowEditor.controls['steps']).at(index).get('params') as FormArray;
    var selectedEditor = this.requestEditors.find(editor => editor.id == index);
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
      }
    }

    dot.object(tgt);

    var prettyObj = JSON.stringify(tgt, null, 4);
    selectedEditor.codeEditor.getSession().setValue(prettyObj);
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

  openModal() {
    this.newEditor = true;
  }

  closeModal() {
    this.newEditor = false;
  }

  getAccounts() {
    return Object.keys(this.fakeApis);
  }

  getApis(account: string) {
    if(account) {
      return Object.keys(this.fakeApis[account]);
    }
  }

  getVerb(account: string, api: string) {

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

  executeRequest() {
    console.log("Executing Request!");
  }
}
