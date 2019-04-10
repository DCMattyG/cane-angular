import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { ApiComponent } from './api/api.component';
import { HomeComponent } from './home/home.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { JobComponent } from './job/job.component';
import { WorkflowNewComponent } from './workflow-new/workflow-new.component';

const routes: Routes = [
  { path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'account',
    component: AccountComponent
  },
  {
    path: 'api',
    component: ApiComponent
  },
  {
    path: 'workflow',
    component: WorkflowComponent
  },
  {
    path: 'workflow/new',
    component: WorkflowNewComponent
  },
  {
    path: 'job',
    component: JobComponent
  },
  { path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
