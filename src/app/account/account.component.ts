import { Component } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Account {
  authType: string;
  name: string;
  requireProxy: string;
  baseURL: string;
  status: number;
  endpoint: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  accounts: Account[];
  baseUrl = environment.baseUrl;
  newAccount = false;
  auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpemVkIjp0cnVlLCJjbGllbnQiOiIgIiwidGltZSI6MTU0Nzc5ODY5Mn0.ticg5h9271elVkjQBGrNn7tw3QMlVBw-ysgWx2Bcgsg';

  accountForm = this.fb.group({
    name: ['', [Validators.required, this.noWhitespaceValidator]],
    baseURL: ['', Validators.required],
    requireProxy: [false],
    authType: ['', Validators.required],
    authObj: this.fb.group({
      publicKey: [''],
      privateKey: [''],
      header: [''],
      key: [''],
      authBody: [''],
      authBodyMap: [''],
      cookielifetime: [''],
      username: [''],
      password: ['']
    })
  });

  constructor(private http:HttpClient, private fb: FormBuilder) { 
    this.getAccounts();
    this.accounts = [];
  }

  deleteAccount(dName) {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.delete(this.baseUrl + '/device/' + dName, { headers: headers }).subscribe((res : any[]) => {
      console.log(res);
      this.getAccounts();
    });
  }

  getAccounts() {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.accounts = [];
    this.http.get(this.baseUrl + '/device', { headers: headers }).subscribe((res : any[]) => {
      console.log(res);
      if(res) {
        res['devices'].forEach(element => {
          this.getAccountDetail(element);
        });
      }
    });
  }

  getAccountDetail(dName) {
    var headers = new HttpHeaders().set('Authorization', this.auth);

    this.http.get(this.baseUrl + '/device/' + dName, { headers: headers }).subscribe((res) => {
      console.log(res);
      res['status'] = "1";
      res['endpoint'] = this.baseUrl + "/" + dName;
      delete res['authObj'];
      console.log(res);
      this.accounts.push(<Account>res);
    });
  }

  resetModal() {
    this.accountForm.reset();   
  }

  closeModal() {
    this.resetModal();
    this.newAccount = false;
  }

  openModal() {
    console.log("Opening Modal...")
    this.newAccount = true;
  }

  openComponentModal() {
    // this.cuiModalService.showComponent(ModalContentComponent, { /* data */ });
  }

  onAuthChange(authValue) {
    //TODO move to nested form groups and rest instead
    this.accountForm.patchValue({
      authObj: {
        username: '',
        password: '',
        publicKey: '',
        privateKey: '',
        header: '',
        key: '',
        authBody: '',
        authBodyMap: '',
        cookieLifetime: ''
      }
    });
    
    console.log("reset auth fields");
  } 

  onSubmit() {
    console.log("submitting form");
    let data = this.accountForm.value;
    console.log(data);

    // remove all empty values
    for (let prop in data.authObj) {
      if (!data.authObj[prop]) {
          delete data.authObj[prop];
      }
    }

    /*
      headerSettings['Authorization'] = 'Bearer ' + token;
      headerSettings['Content-Type'] = 'application/json';
      const newHeader = new HttpHeaders(headerSettings);
    */

    var headers = new HttpHeaders().set('Authorization', this.auth);

    console.log(headers);
    console.log(JSON.stringify(data));

    this.http.post(this.baseUrl + '/device', JSON.stringify(data), { headers: headers, responseType: 'text'})
    .subscribe(data  => {
      console.log("POST Request is successful ", data);
      this.closeModal();
      this.getAccounts();
    },
    error  => {
      console.log("Error", error);
    });
  }

  // TODO this does not check for spaces inside
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}
