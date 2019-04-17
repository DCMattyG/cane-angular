import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { ErrorService } from './error/error.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'cane-angular';
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private errorService: ErrorService,
    private router: Router) { }

  toggleMenu() {
    this.menuOpen = this.menuOpen == true ? false : true;
  }

  showProfile() {
    this.toggleMenu()
    this.router.navigate(['/profile']);
  }

  logout() {
    this.toggleMenu();
    this.authService.logout();
  }
}
