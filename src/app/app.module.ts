import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccountComponent } from './account/account.component';
import { ApiComponent } from './api/api.component';
import { HomeComponent } from './home/home.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { JobComponent } from './job/job.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { WorkflowEditorComponent } from './workflow-editor/workflow-editor.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { WorkflowNewComponent } from './workflow-new/workflow-new.component';
import { MessageComponent } from './message/message.component';
import { LoginComponent } from './login/login.component';
import { JobdetailComponent } from './job-detail/job-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    AppComponent,
    AccountComponent,
    ApiComponent,
    HomeComponent,
    WorkflowComponent,
    JobComponent,
    WorkflowEditorComponent,
    CodeEditorComponent,
    WorkflowNewComponent,
    MessageComponent,
    LoginComponent,
    JobdetailComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ClipboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
