import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable, of } from 'rxjs';

interface Message {
  type: string,
  title: string,
  body: string
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messages = [];

  constructor() { }

  public getMessages(): Observable<Message[]> {
    return of(this.messages);
  }

  public newMessage(type: string, title: string, body: string) {
    this.messages.push({ type: type, title: title, body: body });
  }

  public removeMessage(index: number) {
    this.messages.splice(index, 1);
  }
}
