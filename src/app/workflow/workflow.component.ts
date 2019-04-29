import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { MessageService } from '../message/message.service';
import { CaneService } from '../cane/cane.service';
import { WorkflowService } from './workflow.service';
import { FormBuilder, Validators } from '@angular/forms';

interface Workflow {
  description: string;
  name:string;
  steps:string;
  type:string;
  _id:string;
}

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent {
  workflows: Workflow[] =[];
  callWorkflow = false;

  workflowBegin = this.fb.group({
    workflow: [''],
    editor: [''],
  });

  constructor(private http: HttpClient,
    private caneService: CaneService,
    private workflowService: WorkflowService,
    private messageService: MessageService,
    private fb: FormBuilder) {
    this.getCaneWorkflow();
    this.workflowService.currentOperation = '';
    this.workflowService.targetWorkflow = '';
  }

  getCaneWorkflow() {
    this.workflows = [];
    
    this.caneService.getWorkflow()
    .subscribe(res => {
      if(res['workflows']) {
        res['workflows'].forEach(element => {
          this.getCaneWorkflowDetail(element);
        });
      }
    });
  }

  /*
  import { throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';

    .pipe(
      catchError(err => {
        console.log("Caught:");
        console.log(err);
        console.error(err['message']);
        console.log("Error is handled!");
        this.errorService.newError(err.statusText, err.message);
        return throwError("Error thrown from catchError");
      })
    )
  */

  getCaneWorkflowDetail(wfName) {
    this.caneService.getWorkflowDetail(wfName)
    .subscribe((res : Workflow)=>{
      this.workflows.push(res);
    });
  }

  updateWorkflow(target: string) {
    this.workflowService.updateWorkflow(target);
  }

  deleteWorkflow(target: string) {
    this.caneService.deleteWorkflow(target)
    .subscribe(
      () => {
        this.messageService.newMessage('success', 'Workflow Deleted', `Workflow "${target}" successfully deleted!`);
        this.getCaneWorkflow();
      },
      error => {
        this.messageService.newMessage('error', 'Error', `Error deleting workflow "${target}"!`);
      }
    )
  }

  isVariable(value: string): boolean {
    if(value.startsWith('{{') && value.endsWith('}}')) {
      return true;
    }

    return false;
  }

  async generateZero(workflow: string) {
    // var prevStep: object;
    var zeroBody: object = {};
    var varPool: Array<string> = [];

    var result = await this.caneService.getWorkflowDetail(workflow).toPromise()

    for(var step of result['steps']) {
      var stepAccount = step['deviceAccount'];
      var stepApi = step['apiCall'];

      var apiDetail = await this.caneService.getApiDetail(stepAccount, stepApi).toPromise()
      var path = apiDetail['path'];
      
      var pathVars = path.match(/{{[a-zA-Z]+}}/g);

      if(pathVars) {
        pathVars.forEach((val: string) => {
          val = val.replace('{{', '');
          val = val.replace('}}', '');

          if(!varPool.includes(val)){
            zeroBody[val] = '<string>';
          }
        });
      }

      step['body'].forEach((body: object) => {
        var bodyVal:string = Object.values(body)[0];
        var bodyVars = bodyVal.match(/{{[a-zA-Z]+}}/g);

        if(bodyVars) {
          bodyVars.forEach((val: string) => {
            val = val.replace('{{', '');
            val = val.replace('}}', '');

            if(!varPool.includes(val)){
              zeroBody[val] = '<string>';
            }
          })
        }
      });

      step['query'].forEach((query: object) => {
        var queryVal:string = Object.values(query)[0];
        var queryVars = queryVal.match(/{{[a-zA-Z]+}}/g);

        if(queryVars) {
          queryVars.forEach((val: string) => {
            val = val.replace('{{', '');
            val = val.replace('}}', '');

            if(!varPool.includes(val)){
              zeroBody[val] = '<string>';
            }
          })
        }
      });

      step['headers'].forEach((header: object) => {
        var val:string = Object.values(header)[0];
        if(this.isVariable(val)) {
          val = val.replace('{{', '');
          val = val.replace('}}', '');

          if(!varPool.includes(val)){
            zeroBody[val] = '<string>';
          }
        }
      });

      step['variables'].forEach((variable: object) => {
        var key:string = Object.keys(variable)[0];
          if(!varPool.includes(key))
            varPool.push(key)
      });

      // if(prevStep) {
      //   prevStep['variables'].forEach((variable: object) => {
      //     var val:string = Object.keys(variable)[0];
      //     if(zeroBody[val]) {
      //       delete zeroBody[val];
      //     }
      //   });
      // }

      // prevStep = step;
    }

    return zeroBody;
  }

  openModal(workflow: string) {
    console.log("Modal opened with:" + workflow);

    this.generateZero(workflow)
    .then((res) => {
      this.workflowBegin.patchValue({ workflow: workflow });
      this.workflowBegin.patchValue({ editor: res });
      this.callWorkflow = true;
    })
  }

  closeModal() {
    this.callWorkflow = false;
    this.workflowBegin.reset();
  }

  onSubmit() {
    console.log(this.workflowBegin.value);
    var workflow = this.workflowBegin.value['workflow'];
    var data = this.workflowBegin.value['editor'];

    this.caneService.callWorkflow(workflow, data)
    .subscribe((res) => {
      this.messageService.newMessage('success', 'Workflow Started', `Claim code: ${res['claimCode']}`);
    },error => {
        this.messageService.newMessage('error', 'Error', `Error executing workflow "${workflow}"!`);
    });

    this.closeModal();
  }

  executeWorkflow(name: string) {
    console.log("Executing Workflow: " + name);
  }
}
