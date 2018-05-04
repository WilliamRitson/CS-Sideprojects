import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { StableMarriageComponent } from './stable-marriage/stable-marriage.component';
import { MaterialModule } from '../material.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { OrdinalPipe } from './ordinal.pipe';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [ScatterPlotComponent, StableMarriageComponent, OrdinalPipe],
  exports: [StableMarriageComponent]
})
export class GroupMatchingModule { }
