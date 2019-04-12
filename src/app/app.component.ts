import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { ErrorService } from './error/error.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'cane-angular';
  menuOpen = false;

  constructor(private authService: AuthService, private errorService: ErrorService) { }

  toggleMenu() {
    this.menuOpen = this.menuOpen == true ? false : true;
  }

  logout() {
    this.toggleMenu();
    this.authService.logout();
  }

  testError() {
    this.errorService.newError('Test', 'This is a test error.');
  }
}
