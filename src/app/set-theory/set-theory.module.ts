import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../material.module';
import { SetAlgebraComponent } from './set-algebra/set-algebra.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [SetAlgebraComponent],
  exports: [SetAlgebraComponent]
})
export class SetTheoryModule { }
