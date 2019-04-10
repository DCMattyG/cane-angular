import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface workflowResult {
  apiAccount: string;
  apiCall: string;
  error: string;
  reqBody: string;
  resBody: string;
  status: number;
}

interface Job {
  claimCode: string;
  currentStatus: number;
  jobId: string;
  timestamp: string;
  results: workflowResult[];
}

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent {
  jobs: Job[];
  baseUrl: string;

  auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpemVkIjp0cnVlLCJjbGllbnQiOiIgIiwidGltZSI6MTU0Nzc5ODY5Mn0.ticg5h9271elVkjQBGrNn7tw3QMlVBw-ysgWx2Bcgsg';

  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseUrl;
    this.getJobs();
    this.jobs = [];
  }

  getJobs() {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.get(this.baseUrl + '/claim', { headers: headers }).subscribe((res : any[]) => {
      console.log(res);

      res['claims'].forEach(element => {
        this.getClaimDetails(element);
      });
    });
  }

  getClaimDetails(claimId) {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.get(this.baseUrl + '/claim/' + claimId, { headers: headers }).subscribe((res : any[]) => {
      console.log(res);

      let thisClaim: Job;
      
      thisClaim = {
        claimCode: res['claimCode'],
        currentStatus: res['currentStatus'],
        jobId: res['id'],
        timestamp: res['timestamp'],
        results: res['workflowResults']
      }
      
      this.jobs.push(thisClaim);
    });
  }
}
