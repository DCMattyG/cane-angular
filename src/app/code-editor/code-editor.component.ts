import { Component, ViewChild, ElementRef, OnInit, Output, EventEmitter, Input, AfterViewInit, forwardRef, HostBinding, OnChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS, FormControl, Validator } from '@angular/forms';

import * as dot from 'dot-object';

import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import "ace-builds/webpack-resolver";

const THEME = 'ace/theme/chrome'; 
const LANG = 'ace/mode/javascript';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeEditorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CodeEditorComponent),
      multi: true,
    }
  ]
})
export class CodeEditorComponent implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor, Validator {
  @ViewChild('codeEditor') codeEditorElmRef: ElementRef;
  // @Output() editorData: EventEmitter<any> = new EventEmitter<any>();
  @Input() id: number;
  @Input() size: number;
  
  @Input() value: object;
  @Input() disabled = false;
  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? 0.25 : 1;
  }

  public codeEditor: ace.Ace.Editor;
  public parseError: boolean;

  constructor() { }

  onChange = (delta: any) => {};

  onTouched = () => {};

  writeValue(body: object): void {
    if(body) {
      dot.object(body);

      var prettyObj = JSON.stringify(body, null, 4);
      this.codeEditor.setValue(prettyObj, 1);

      this.value = body;
      this.parseError = false;

      this.onChange(this.value);
      this.onTouched();
    }
  }

  registerOnChange(fn: (v: any) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if(isDisabled) {
      this.codeEditor.setReadOnly(true);
    } else {
      this.codeEditor.setReadOnly(false);
    }
  }

  validate(c: FormControl) {
    return (!this.parseError) ? null : {
      jsonParseError: {
          valid: false,
      },
    };
  }

  ngOnInit() {
    const element = this.codeEditorElmRef.nativeElement;

    const editorOptions: Partial<ace.Ace.EditorOptions> = {
        highlightActiveLine: true,
        // minLines: this.size || 20,
        // maxLines: this.size || 20,
    };

    this.codeEditor = ace.edit(element, editorOptions);
    this.codeEditor.setTheme(THEME);
    this.codeEditor.getSession().setMode(LANG);
    this.codeEditor.setShowFoldWidgets(true);

    this.codeEditor.on('change', (eventName, ...args) => {
      var obj;

      try {
        obj = JSON.parse(this.codeEditor.getSession().getValue())
        this.parseError = false;
      } catch (ex) {
        obj = this.codeEditor.getSession().getValue();
        this.parseError = true;
      }

      this.onChange(obj);
      this.onTouched();
    });
  }

  ngAfterViewInit() {
    this.codeEditor.container.style.height = "200px";
    this.codeEditor.resize();
  }

  ngOnChanges() {
    // if (this.codeEditor) {
    //   var body = this.value;
    //   dot.object(body);

    //   var prettyObj = JSON.stringify(body, null, 4);
    //   this.codeEditor.setValue(prettyObj, 1);
    //   // this.codeEditor.getSession().setValue(this.value);
    // }
  }
}
