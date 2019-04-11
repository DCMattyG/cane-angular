import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'cane-angular';
  user = 'none';
  menuOpen = false;

  constructor(private authService: AuthService) { }

  toggleMenu() {
    this.menuOpen = this.menuOpen == true ? false : true;
  }

  logout() {
    this.authService.logout();
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'))['username'];
  }
}
