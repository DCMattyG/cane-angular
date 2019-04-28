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

  statusMap = {
    "-1": "Error",
    "0": "Not Started",
    "1": "In Progress",
    "2": "Success"
  }

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

        console.log(res['workflowResults']);


        /* reparse the request/response bodies 
        so that they can be properly displayed */

        let tempArray: workflowResult[] = [];
        let disobj = res["workflowResults"];
        let i = 1;
        for (let entry of Object.keys(disobj)) {
          let result: workflowResult = disobj[entry];

          try {
            result['resBody'] = JSON.parse(result['resBody']);
          } catch (e) {
            if (e instanceof SyntaxError) {
              result['resBody'] = JSON.parse("{}");
            } else {
                console.log(e);
            }
          }

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
