import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CaneService } from '../cane/cane.service';

interface Account {
  name: string;
  baseURL: string;
  requireProxy: string;
  authType: string;
  status: number;
  endpoint: string;
}

// interface AuthObj {
//   publicKey: string,
//   privateKey: string,
//   header: string,
//   key: string,
//   authBody: string,
//   authBodyMap: string,
//   cookielifetime: number,
//   username: string,
//   password: string
// }

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  accounts: Account[] = [];
  baseUrl = environment.baseUrl;
  newAccount = false;
  modalFunction = 'new';

  typeDrop = false;

  authMap = {
    'none': 'None',
    'basic': 'Basic',
    'session': 'Session',
    'apikey': 'APIKey',
    'rfc3447': 'RFC 3447'
  }

  accountForm = this.fb.group({
    name: ['', [Validators.required, this.noWhitespaceValidator]],
    baseURL: ['', Validators.required],
    requireProxy: [false],
    authType: ['none', Validators.required],
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

  constructor(private caneService: CaneService,
    private http:HttpClient,
    private fb: FormBuilder) { }

  deleteAccount(accountName: string) {
    this.caneService.deleteAccount(accountName)
    .subscribe(
      res => {
        console.log(res);
        this.refreshAccounts();
    });
  }

  refreshAccounts() { 
    this.accounts = []; 

    this.caneService.getAccount().toPromise() 
    .then( 
      (res: any[]) => { 
        if(res && res['devices'].length > 0) { 
          res['devices'].forEach( 
            account => { 
              this.caneService.getAccountDetail(account).toPromise() 
              .then((res) => { 
                if(res) { 
                  res['status'] = "1"; 
                  res['endpoint'] = this.baseUrl + "/" + account; 
                  delete res['authObj']; 
                  this.accounts.push(<Account>res); 
                }
            }); 
          }); 
        } 
    }); 
  } 

  resetModal() {
    this.accountForm.reset();   
  }

  closeModal() {
    this.resetModal();
    this.newAccount = false;
    this.modalFunction = 'new';
  }

  openModal() {
    console.log("Opening Modal...")
    this.newAccount = true;
  }

  toggleDrop(target: string) {
    if(target == 'type') {
      this.typeDrop = this.typeDrop ? false : true;
    }
  }

  setDrop(target: string, data: string) {
    if(target == 'type') {
      this.accountForm.patchValue({ authType: data });
      this.toggleDrop('type');
    }
  }

  editAccount(account: string) {
    console.log(account);
    this.modalFunction = 'edit';

    this.caneService.getAccountDetail(account).toPromise()
    .then((res) => {
      console.log(res);

      this.accountForm.patchValue({
        name: res['name'],
        baseURL: res['baseURL'],
        requireProxy: res['requireProxy'],
        authType: res['authType']
        })

      if(res['authObj']['publicKey']) {
        this.accountForm.patchValue({ authObj: { publicKey: res['authObj']['publicKey'] }})
      }

      if(res['authObj']['privateKey']) {
        this.accountForm.patchValue({ authObj: { privateKey: res['authObj']['privateKey'] }})
      }

      if(res['authObj']['header']) {
        this.accountForm.patchValue({ authObj: { header: res['authObj']['header'] }})
      }

      if(res['authObj']['key']) {
        this.accountForm.patchValue({ authObj: { key: res['authObj']['key'] }})
      }

      if(res['authObj']['authBody']) {
        this.accountForm.patchValue({ authObj: { authBody: res['authObj']['authBody'] }})
      }

      if(res['authObj']['authBodyMap']) {
        this.accountForm.patchValue({ authObj: { authBodyMap: res['authObj']['authBodyMap'] }})
      }

      if(res['authObj']['cookieLifetime']) {
        this.accountForm.patchValue({ authObj: { cookieLifetime: res['authObj']['cookieLifetime'] }})
      }

      if(res['authObj']['username']) {
        this.accountForm.patchValue({ authObj: { username: res['authObj']['username'] }})
      }

      if(res['authObj']['password']) {
        this.accountForm.patchValue({ authObj: { password: res['authObj']['password'] }})
      }
    });

    this.openModal();
  }

  onAuthChange() {
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

    if(this.modalFunction == 'new') {
      this.caneService.createAccount(data)
      .subscribe(data  => {
        console.log("POST Request is successful ", data);
        this.closeModal();
        this.refreshAccounts();
      },
      error  => {
        console.log("Error", error);
      });
    } else if(this.modalFunction == 'edit') {
      let account = data['name'];

      delete data['name'];

      this.caneService.updateAccount(account, data)
      .subscribe(data  => {
        console.log("POST Request is successful ", data);
        this.closeModal();
        this.refreshAccounts();
      },
      error  => {
        console.log("Error", error);
      });
    }
  }

  // TODO this does not check for spaces inside
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  ngOnInit() {
    this.refreshAccounts()
  }
}
