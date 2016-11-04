import { Component, OnInit } from '@angular/core';
import {MipsService} from '../mips.service';

@Component({
  selector: 'app-program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['./program-editor.component.css'],
  providers: [MipsService]
})
export class ProgramEditorComponent implements OnInit {
  program:string
  constructor(public mips:MipsService ) { 
    this.program = mips.currentProgram;
  }

  ngOnInit() {
  }

}
