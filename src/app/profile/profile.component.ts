import { Component, OnInit } from '@angular/core';
import { CaneUser } from '../cane/cane';
import { ClipboardService } from 'ngx-clipboard';
import { MessageService } from '../message/message.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  user: CaneUser;

  constructor(private messageService: MessageService) { }

  copySuccess() {
    this.messageService.newMessage('success', 'Copied', 'JWT Copied to Clipboard');
  }

  ngOnInit() {
    var tempUser = JSON.parse(localStorage.getItem('currentUser'));

    this.user = {
      fname: tempUser['fname'],
      lname: tempUser['lname'],
      token: tempUser['token'],
      username: tempUser['username']
    }
  }
}
