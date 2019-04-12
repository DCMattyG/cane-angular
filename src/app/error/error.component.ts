import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { ErrorService } from '../error/error.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
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
export class ErrorComponent implements OnInit {
  errors = [];

  constructor(private error: ErrorService, private changeDetector: ChangeDetectorRef) { }

  getErrors() {
    this.error.getErrors()
    .subscribe(errors => this.errors = errors);
  }

  removeError(index: number) {
    this.error.removeError(index);
    this.getErrors();
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.getErrors();
  }
}
