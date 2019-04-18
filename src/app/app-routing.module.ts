import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { ApiComponent } from './api/api.component';
import { HomeComponent } from './home/home.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { JobComponent } from './job/job.component';
import { WorkflowNewComponent } from './workflow-new/workflow-new.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { JobdetailComponent } from './job-detail/job-detail.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  // { path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'account',
    component: AccountComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'api',
    component: ApiComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'workflow',
    component: WorkflowComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'workflow/new',
    component: WorkflowNewComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'workflow/update',
    component: WorkflowNewComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'job',
    component: JobComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'job/:jobid',
    component: JobdetailComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  { path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
