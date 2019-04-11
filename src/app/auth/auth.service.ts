import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticated = false;
  currentUser = '';

  constructor(private router: Router, private http: HttpClient) {
    var user = JSON.parse(localStorage.getItem('currentUser'));

    if (user && user.token) {
      this.authenticated = true;
      this.currentUser = user['username'];
    }
  }

  public isAuthenticated(): Observable<boolean> {
    if (localStorage.getItem('currentUser')) {
      // Logged In
      this.authenticated = true;
    } else {
      // Not Logged In
      this.authenticated = false;
    }

    return of(this.authenticated);
  }

  public getCurrentUser(): Observable<string> {
    return of(this.currentUser);
  }

  public login(username: string, password: string) {
    return this.http.post<any>('http://127.0.0.1:8005/login', { username: username, password: password })
      .pipe(map(user => {
        // login successful if there's a jwt token in the response
        if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.authenticated = true;
            this.currentUser = user['username'];
        }

        return user;
      }));
  }

  public logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.authenticated = false;
    this.currentUser = '';
    this.router.navigate(['/']);
  }
}
