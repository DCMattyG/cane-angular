import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CaneService } from '../cane/cane.service';
import { Job } from '../cane/cane';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent {
  jobs: Job[];
  baseUrl: string;

  constructor(private http: HttpClient, private caneService: CaneService) {
    this.baseUrl = environment.baseUrl;
    this.getJobs();
    this.jobs = [];
  }

  getJobs() {
    this.caneService.getClaim().subscribe(
      res => {
        console.log(res);

        res['claims'].forEach(element => {
          this.getClaimDetails(element);
      });
    });
  }

  getClaimDetails(claimId) {
    this.caneService.getClaimDetail(claimId).subscribe(
      res => {
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
