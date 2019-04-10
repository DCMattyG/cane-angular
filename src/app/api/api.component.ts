import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Validators, FormBuilder, FormControl } from '@angular/forms';

interface ApiDetail {
  name: string;
  method: string;
  type: string;
  path: string;
}

interface Api {
  name: string;
  apiCall: ApiDetail;
}

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent implements OnInit{
  newApi = false;
  showMessage = false;
  apis: Api[] = [];
  accounts = [];
  messageTitle = "";
  messageText = "";
  baseUrl = environment.baseUrl;

  typeList : string[] = [
    "JSON",
    "XML"
  ];

  methodList : string[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE"
  ];

  auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpemVkIjp0cnVlLCJjbGllbnQiOiIgIiwidGltZSI6MTU0Nzc5ODY5Mn0.ticg5h9271elVkjQBGrNn7tw3QMlVBw-ysgWx2Bcgsg';

  newApiForm = this.fb.group({
    name: ['', [Validators.required, this.noWhitespaceValidator]],
    deviceAccount: ['', Validators.required],
    type: ['', Validators.required],
    method: ['', Validators.required],
    path: ['', [Validators.required, this.noWhitespaceValidator]],
    body: [''],
  });

  constructor(private http:HttpClient, private fb: FormBuilder) {}

  refreshApis() {
    this.apis = [];
    this.accounts = [];

    this.getAccountPromise()
    .then((res) => {
      res['devices'].forEach((account) => {
        this.getApiPromise(account)
        .then((res) => {
          if(res) {
            res['apis'].forEach((api) => {
              this.getApiDetailPromise(account, api)
              .then((res: ApiDetail) => {
                let thisAccount: Api;
      
                thisAccount = {
                  name: account,
                  apiCall: res
                };
  
                this.apis.push(thisAccount);
              })
            });
          }
        });

        this.accounts.push(account);
      });
    });
  }

  getAccountPromise(): Promise<Object> {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    return this.http.get(this.baseUrl + '/device', { headers: headers }).toPromise()
  }

  getApiPromise(account: string): Promise<Object> {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    return this.http.get(this.baseUrl + '/api/' + account, { headers: headers }).toPromise()
  }

  getApiDetailPromise(account: string, api: string): Promise<Object> {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    return this.http.get(this.baseUrl + '/api/' + account + '/' + api, { headers: headers }).toPromise()
  }

  deleteDeviceApi(dName, apiName) {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.delete(this.baseUrl + '/api/' + dName + '/' + apiName, { headers: headers })
    .subscribe((res) => {
      console.log(res);

      this.refreshApis();
	  });
  }

  setDefaultValues() {
    this.newApiForm
    .setValue({
      type: this.typeList[0],
      method: this.methodList[0]
    })
  }

  onSubmit() {
	  let data = this.newApiForm.value;

	  var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.post(this.baseUrl + '/api', JSON.stringify(data), { headers: headers })
    .subscribe((data)  => {
      console.log("POST Request Success: ", data);
      this.closeModal();
      this.refreshApis();
    },
    error  => {
      console.log("Error: ", error);
      console.log(data);
    });
  }

  openModal() {
    this.newApi = true;
  }

  closeModal() {
    this.newApi = false;
    this.newApiForm.reset();
  }

  // TODO this does not check for spaces inside
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;

    return isValid ? null : { 'whitespace': true };
  }

  ngOnInit() {
    this.refreshApis();
  }
}
