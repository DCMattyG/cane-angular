import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { ErrorService } from '../error/error.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
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
