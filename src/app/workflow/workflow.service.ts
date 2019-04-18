import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  public currentOperation = 'new';
  public targetWorkflow = '';

  constructor(private router: Router) { }

  newWorkflow() {
    this.currentOperation = 'new';
    this.targetWorkflow = '';
    this.router.navigate(['/workflow/new']);
  }

  updateWorkflow(target: string) {
    this.currentOperation = 'update';
    this.targetWorkflow = target;
    this.router.navigate(['/workflow/new']);
  }
}
