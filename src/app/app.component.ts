import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'cane-angular';
  menuOpen = false;

  constructor(private authService: AuthService) { }

  toggleMenu() {
    console.log(event.target);
    this.menuOpen = this.menuOpen == true ? false : true;
  }

  logout() {
    this.toggleMenu();
    this.authService.logout();
  }
}
