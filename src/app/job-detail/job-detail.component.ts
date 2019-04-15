import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CaneService } from '../cane/cane.service';
import {workflowResult, Job } from '../cane/cane';

@Component({
  selector: 'app-jobdetail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobdetailComponent implements OnInit {

  baseUrl: string;
  jobId: string;
  job: Job = <Job>{};
  auth: string;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private caneService: CaneService) {
    this.baseUrl = environment.baseUrl;
    this.jobId = '';
   }

  ngOnInit() {
    this.jobId = this.route.snapshot.params.jobid;
    this.getClaimDetails(this.jobId);
  }

  getClaimDetails(claimId: string) {
    this.caneService.getClaimDetail(claimId).subscribe(
      res => {
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
          result['reqBody'] = reqJson;
          result['resBody'] = resJson;
          result['step'] = i;
          tempArray.push(result);
          i++;
      }

      thisClaim.results = tempArray;
      this.job = thisClaim;

      console.log(this.job);
    });
  }
}
