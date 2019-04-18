import { Component, OnInit } from '@angular/core';
import {CaneUser } from '../cane/cane';
import { CaneService } from '../cane/cane.service';
import { ClipboardService } from 'ngx-clipboard';
import { MessageService } from '../message/message.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {

  user: CaneUser;

  constructor(    private messageService: MessageService    ) { 
    var tempUser = JSON.parse(localStorage.getItem('currentUser'));

    this.user = {
      fname: tempUser['fname'],
      lname: tempUser['lname'],
      token: tempUser['token'],
      username: tempUser['username']
    }

    console.log(this.user);
  }

  ngOnInit() {
  }

  copied(event: string) {
    console.log('copied text');
    console.log(event);
    this.messageService.newMessage('success', 'Success', 'JWT Copied to Clipboard');

  }
}
