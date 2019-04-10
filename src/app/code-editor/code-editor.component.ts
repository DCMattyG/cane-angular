import { Component, ViewChild, ElementRef, OnInit, Output, EventEmitter, Input } from '@angular/core';

import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import "ace-builds/webpack-resolver";

const THEME = 'ace/theme/chrome'; 
const LANG = 'ace/mode/javascript';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit{
  @ViewChild('codeEditor') codeEditorElmRef: ElementRef;
  // @Output() editorData: EventEmitter<any> = new EventEmitter<any>();
  @Input() id: number;
  public codeEditor: ace.Ace.Editor;

  constructor() { }

  // sendUpdate()
  // {
  //   var update = {
  //     value: this.codeEditor.getSession().getValue(),
  //     error: this.codeEditor.getSession().getAnnotations()
  //   }

  //   this.editorData.emit(update);
  // }

  ngOnInit() {
    const element = this.codeEditorElmRef.nativeElement;

    const editorOptions: Partial<ace.Ace.EditorOptions> = {
        highlightActiveLine: true,
        minLines: 20,
        maxLines: 20,
    };

    this.codeEditor = ace.edit(element, editorOptions);
    this.codeEditor.setTheme(THEME);
    this.codeEditor.getSession().setMode(LANG);
    this.codeEditor.setShowFoldWidgets(true);
    // this.codeEditor.on("blur", () => {
    //   var update = {
    //     value: this.codeEditor.getSession().getValue(),
    //     error: this.codeEditor.getSession().getAnnotations()
    //   }
  
    //   this.editorData.emit(update);
    // });
  }
}
