import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphSearchComponent } from './graph-search/graph-search.component';
import { MaterialModule } from '../material.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [GraphSearchComponent],
  exports: [GraphSearchComponent]
})
export class GraphTheoryModule { }
