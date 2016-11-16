import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {MemoryAccess} from '../cache'

@Component({
  selector: 'app-radixed-value-editor',
  templateUrl: './radixed-value-editor.component.html',
  styleUrls: ['./radixed-value-editor.component.css']
})
export class RadixedValueEditorComponent implements OnInit {
  @Input() value: number; 
  @Output() onValueChange = new EventEmitter<number>();
  valueString: string;
  radix: number;
  
  radixes: Array<Object>;
  
  constructor() {
    this.radixes = [
      { name: 'hex', value: 16},
      { name: 'decimal', value: 10},
      { name: 'octal', value: 8}
    ];
    this.radix = 16; 
  }

  updateValue(nv) {
    this.onValueChange.emit(parseInt(this.valueString, this.radix));
  }

  changeRadix(event) {
    this.valueString = parseInt(this.valueString, this.radix).toString(event);
    this.radix = event;
  }

  ngOnInit() {
    this.valueString = this.value.toString(this.radix);
    this.value = null;
  }

}
