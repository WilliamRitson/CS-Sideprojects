import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineDiagramComponent } from './pipeline-diagram/pipeline-diagram.component';
import { MaterialModule } from '../material.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ProgramEditorComponent } from './program-editor/program-editor.component';
import { EnumEditorComponent } from './enum-editor/enum-editor.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [PipelineDiagramComponent, ProgramEditorComponent, EnumEditorComponent],
  exports: [PipelineDiagramComponent]
})
export class MipsModule { }
