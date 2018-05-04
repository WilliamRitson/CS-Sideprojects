import { Component, Directive, Input, OnInit } from '@angular/core';
import { MemoryQuantity, MemoryUnit } from '../cache';

@Component({
  selector: 'app-memory-unit-editor',
  templateUrl: './memory-unit-editor.component.html',
  styleUrls: ['./memory-unit-editor.component.css'],
})
export class MemoryUnitEditorComponent implements OnInit {
  units: Array<string>;
  @Input() value: MemoryQuantity
  constructor() {
    this.units = [];
    for (let unit in MemoryUnit) {
      if (parseInt(unit))
        this.units.push(unit);
    }
  }

  parseInt(toParse: string) {
    return parseInt(toParse);
  }

  label(raw: string) {
    return MemoryUnit[raw];
  }

  ngOnInit() {
  }

}
