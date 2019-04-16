import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../error/error.service';
import { CaneService } from '../cane/cane.service';

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

  constructor(private http: HttpClient,
    private errorService: ErrorService,
    private caneService: CaneService) {
    this.getCaneWorkflow();
  }

  getCaneWorkflow() {
    this.caneService.getWorkflow()
    .pipe(
      catchError(err => {
        console.log("Caught:");
        console.log(err);
        console.error(err['message']);
        console.log("Error is handled!");
        this.errorService.newError(err.statusText, err.message);
        return throwError("Error thrown from catchError");
      })
    ).subscribe(res => {
      // console.log(res);

      res['workflows'].forEach(element => {
        this.getCaneWorkflowDetail(element);
      });
    });
  }

  getCaneWorkflowDetail(wfName) {
    this.caneService.getWorkflowDetail(wfName)
    .subscribe((res : Workflow)=>{
      // console.log(res);
      this.workflows.push(res);
    });
  }
}
