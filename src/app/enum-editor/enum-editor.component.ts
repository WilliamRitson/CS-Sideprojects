import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-enum-editor',
  templateUrl: './enum-editor.component.html',
  styleUrls: ['./enum-editor.component.css']
})
export class EnumEditorComponent implements OnInit {
  @Input() enum: any;
  @Input() value:string;
  options: Array<string>;
  constructor() {
    this.options = [];
    for (let option in this.enum) {
      if (parseInt(option))
        this.options.push(option);
    }
  }

  parseInt(toParse:string) {
    return parseInt(toParse);
  }

  label(raw:string) {
    return this.enum[raw];
  } 


  ngOnInit() {}

}
