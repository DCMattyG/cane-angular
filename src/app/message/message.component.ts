import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { MessageService } from './message.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(100%)'}),
        animate('250ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class MessageComponent implements OnInit {
  messages = [];

  constructor(private error: MessageService, private changeDetector: ChangeDetectorRef) { }

  getMessages() {
    this.error.getMessages()
    .subscribe(messages => this.messages = messages);
  }

  removeMessage(index: number) {
    this.error.removeMessage(index);
    this.getMessages();
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.getMessages();
  }
}
