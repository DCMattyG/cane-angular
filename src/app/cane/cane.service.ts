import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { API, DeviceAccount } from './cane'

@Injectable({
  providedIn: 'root'
})
export class CaneService {
  private baseUrl = environment.baseUrl;
  private auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpemVkIjp0cnVlLCJjbGllbnQiOiIgIiwidGltZSI6MTU0Nzc5ODY5Mn0.ticg5h9271elVkjQBGrNn7tw3QMlVBw-ysgWx2Bcgsg';
  private headers = new HttpHeaders().set('Authorization', this.auth);

  constructor(private http:HttpClient) {
    this.headers.set('Access-Control-Allow-Methods', "GET, POST, PATCH, DELETE, OPTIONS");
  }

  createAccount(data) {
    return this.http.post(this.baseUrl + '/device', JSON.stringify(data), { headers: this.headers })
  }

  getAccount() {
    return this.http.get(this.baseUrl + '/device', { headers: this.headers })
  }

  getAccountDetail(account: string) {
    return this.http.get(this.baseUrl + '/device/' + account, { headers: this.headers })
  }

  updateAccount(account: string, data: any) {
    return this.http.patch(this.baseUrl + '/device/' + account, JSON.stringify(data), { headers: this.headers })
  }

  deleteAccount(account: string) {
    return this.http.delete(this.baseUrl + '/device/' + account, { headers: this.headers })
  }

  createApi(data) {
    return this.http.post(this.baseUrl + '/api', JSON.stringify(data), { headers: this.headers })
  }

  getApi(account: string) {
    return this.http.get(this.baseUrl + '/api/' + account, { headers: this.headers })
  }

  updateApi(account: string, api: string, data: any) {
    return this.http.patch(this.baseUrl + '/api/' + account + '/' + api, JSON.stringify(data), { headers: this.headers })
  }

  getApiDetail(account: string, api: string) {
    return this.http.get(this.baseUrl + '/api/' + account + '/' + api, { headers: this.headers })
  }

  deleteAccountApi(account: string, api: string) {
    return this.http.delete(this.baseUrl + '/api/' + account + '/' + api, { headers: this.headers })
  }

  getWorkflow() {
    return this.http.get(this.baseUrl + '/workflow', { headers: this.headers })
  }

  getWorkflowDetail(workflow: string) {
    return this.http.get(this.baseUrl + '/workflow/' + workflow, { headers: this.headers })
  }

  createWorkflow(data: any) {
    return this.http.post(this.baseUrl + '/workflow', JSON.stringify(data), { headers: this.headers })
  }

  updateWorkflow(workflow: string, data: any) {
    return this.http.patch(this.baseUrl + '/workflow/' + workflow, JSON.stringify(data), { headers: this.headers })
  }

  deleteWorkflow(workflow: string) {
    return this.http.delete(this.baseUrl + '/workflow/' + workflow, { headers: this.headers })
  }

  getClaim() {
    return this.http.get(this.baseUrl + '/claim', { headers: this.headers })
  }

  getClaimDetail(claim: string) {
    return this.http.get(this.baseUrl + '/claim/' + claim, { headers: this.headers })
  }

  /*
  getAccountPromise(): Promise<Object> {
    return this.http.get(this.baseUrl + '/device', { headers: this.headers }).toPromise()
  }

  getApiPromise(account: string): Promise<Object> {
    return this.http.get(this.baseUrl + '/api/' + account, { headers: this.headers }).toPromise()
  }

  getApiDetailPromise(account: string, api: string): Promise<Object> {
    return this.http.get(this.baseUrl + '/api/' + account + '/' + api, { headers: this.headers }).toPromise()
  }
  */
}
