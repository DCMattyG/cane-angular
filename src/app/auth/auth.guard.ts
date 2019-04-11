import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  authenticated = false;

  constructor(
    private router: Router,
    private authService: AuthService
    ) {
      this.authService.isAuthenticated().subscribe(valid => this.authenticated = valid);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      if (this.authenticated) {
          // logged in so return true
          console.log(this.authenticated);
          console.log("AUTHENTICATED!");
          return true;
      }

      // not logged in so redirect to login page with the return url
      console.log("NOT AUTHENTICATED!");
      this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
      return false;
  }
}
