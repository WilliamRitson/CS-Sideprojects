import { Component,  OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-enum-editor',
  templateUrl: './enum-editor.component.html',
  styleUrls: ['./enum-editor.component.css']
})
export class EnumEditorComponent implements OnInit {
  @Input('enum') enum: Object;
  @Input('value') value: number;
  @Output() onValueChange = new EventEmitter<number>();
  options: Array<string>;
  constructor() {}

  changeVal(val) {
    console.log('CV', val, this.value);
    this.onValueChange.emit(this.value);
  }

  parseInt(toParse: string) {
    return parseInt(toParse);
  }

  label(raw: string) {
    return this.enum[raw];
  }

  ngOnInit() { 
    this.options = [];
    for (let option in this.enum) {
      if (!isNaN(parseInt(option)))
        this.options.push(option);
    }
  }

}
