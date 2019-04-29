import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { CaneService } from '../cane/cane.service';

interface ApiDetail {
  name: string;
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
  modalFunction = 'new';
  apis: Api[] = [];
  accounts = [];
  messageTitle = "";
  messageText = "";
  baseUrl = environment.baseUrl;

  accountDrop = false;
  typeDrop = false;
  methodDrop = false;

  typeList : string[] = [
    "JSON",
    "XML"
  ];

  newApiForm = this.fb.group({
    name: ['', [Validators.required, this.noWhitespaceValidator]],
    deviceAccount: ['', Validators.required],
    type: ['', Validators.required],
    path: ['', [Validators.required, this.noWhitespaceValidator]]
  });

  constructor(private caneService: CaneService, private http:HttpClient, private fb: FormBuilder) {}

  refreshApis() {
    this.apis = [];
    this.accounts = [];

    this.caneService.getAccount().toPromise()
    .then((res: any[]) => {
      if(res['devices'] && res['devices'].length > 0) {
        res['devices'].forEach((account) => {
          this.caneService.getApi(account).toPromise()
          .then((res) => {
            if(res) {
              res['apis'].forEach((api) => {
                this.caneService.getApiDetail(account, api).toPromise()
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
      }
    });
  }

  deleteAccountApi(accountName: string, apiName: string) {
    this.caneService.deleteAccountApi(accountName, apiName)
    .subscribe((res) => {
      console.log(res);

      this.refreshApis();
    });
  }

  onSubmit() {
    let data = this.newApiForm.value;
    
    if(this.modalFunction == 'new') {
      this.caneService.createApi(data)
      .subscribe(
        data  => {
          console.log("POST Request Success: ", data);
          this.closeModal();
          this.refreshApis();
        },
        error  => {
          console.log("Error: ", error);
          console.log(data);
        }
      );
    } else if (this.modalFunction == 'edit') {
      let api = data['name'];
      let account = data['deviceAccount'];

      console.log("API: " + api);
      console.log("ACCOUNT: " + account);

      delete data['name'];
      delete data['deviceAccount'];

      console.log(data);

      this.caneService.updateApi(account, api, data)
      .subscribe(
        res => {
          console.log(res);
          this.closeModal();
          this.refreshApis();
        });
    }
  }

  openModal() {
    this.newApi = true;
  }

  closeModal() {
    this.newApi = false;

    this.accountDrop = false;
    this.typeDrop = false;
    this.methodDrop = false;

    this.newApiForm.reset();
  }

  toggleDrop(target: string) {
    if(target == 'account') {
      this.accountDrop = this.accountDrop ? false : true;
    }
    
    if(target == 'type') {
      this.typeDrop = this.typeDrop ? false : true;
    }
  }

  setDrop(target: string, data: string) {
    if(target == 'account') {
      this.newApiForm.patchValue({ deviceAccount: data });
      this.toggleDrop('account');
    }

    if(target == 'type') {
      this.newApiForm.patchValue({ type: data });
      this.toggleDrop('type');
    }
  }

  addApi() {
    this.modalFunction = 'new';
    this.openModal();
  }

  editApi(account: string, api: string) {
    console.log(account);
    console.log(api);
    this.modalFunction = 'edit';

    this.caneService.getApiDetail(account, api).toPromise()
    .then((res: ApiDetail) => {
      console.log(res);

      this.newApiForm.patchValue({
        name: res['name'],
        deviceAccount: res['deviceAccount'],
        type: res['type'].toUpperCase(),
        path: res['path']
      });
    });

    this.openModal();
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
