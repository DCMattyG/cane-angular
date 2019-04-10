import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable, of } from 'rxjs';

interface Error {
  title: string,
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  errors = [];

  constructor() { }

  public getErrors(): Observable<Error[]> {
    return of(this.errors);
  }

  public newError(title: string, message: string) {
    this.errors.push({ title: title, message: message });
  }

  public removeError(index: number) {
    this.errors.splice(index, 1);
  }
}
