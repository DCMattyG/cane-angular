import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

interface workflowResult {
  apiAccount: string;
  apiCall: string;
  error: string;
  reqBody: string;
  resBody: string;
  status: number;
  step: number;
}

interface Job {
  claimCode: string;
  currentStatus: number;
  jobId: string;
  timestamp: string;
  results: workflowResult[];
}

@Component({
  selector: 'app-jobdetails',
  templateUrl: './jobdetails.component.html',
  styleUrls: ['./jobdetails.component.scss']
})
export class JobdetailsComponent implements OnInit {

  baseUrl: string;
  jobId: string;
  job: Job;
  auth: string;

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.baseUrl = environment.baseUrl;
    this.jobId = '';
    this.auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpemVkIjp0cnVlLCJjbGllbnQiOiIgIiwidGltZSI6MTU0Nzc5ODY5Mn0.ticg5h9271elVkjQBGrNn7tw3QMlVBw-ysgWx2Bcgsg';

   }

  ngOnInit() {
    this.jobId = this.route.snapshot.params.jobid;
    this.getClaimDetails(this.jobId);
  }

  getClaimDetails(claimId: string) {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.get(this.baseUrl + '/claim/' + claimId, { headers: headers }).subscribe((res : any[]) => {
      //console.log(res);

      let thisClaim: Job;

      thisClaim = {
        claimCode: res['claimCode'],
        currentStatus: res['currentStatus'],
        jobId: res['id'],
        timestamp: res['timestamp'],
        results: res['workflowResults'],
      };


      /* reparse the request/response bodies 
      so that they can be properly displayed */

      let tempArray: workflowResult[] = [];
      let disobj = res["workflowResults"];
      let i = 1;
      for (let entry of Object.keys(disobj)) {
        let result: workflowResult = disobj[entry];
        let reqJson = JSON.parse(result.reqBody);
        let resJson = JSON.parse(result.resBody);
        result.reqBody = reqJson;
        result.resBody = resJson;
        result.step = i;
        tempArray.push(result);
        i++;
      }

      thisClaim.results = tempArray;
      this.job = thisClaim;

      console.log(this.job);

    });
  }

}
