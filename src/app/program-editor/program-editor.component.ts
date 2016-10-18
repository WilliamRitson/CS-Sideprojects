import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['./program-editor.component.css'],
  inputs: ['program']
})
export class ProgramEditorComponent implements OnInit {
  program:string
  constructor() { }

  ngOnInit() {
  }

}
