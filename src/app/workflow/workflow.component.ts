import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../error/error.service';

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
  workflows: Workflow[];
  baseUrl: string;

  auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpemVkIjp0cnVlLCJjbGllbnQiOiIgIiwidGltZSI6MTU0Nzc5ODY5Mn0.ticg5h9271elVkjQBGrNn7tw3QMlVBw-ysgWx2Bcgsg';

  constructor(private http: HttpClient, private errorService: ErrorService) {
    this.baseUrl = environment.baseUrl;
    this.getCaneWorkflow();
    this.workflows = [];
  }

  getCaneWorkflow() {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.get(this.baseUrl + '/workflow', { headers: headers })
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
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.get(this.baseUrl + '/workflow/' + wfName, { headers: headers })
    .subscribe((res : Workflow)=>{
      // console.log(res);
      this.workflows.push(res);
    });
  }
}
