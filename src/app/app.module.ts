import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ProgramEditorComponent } from './program-editor/program-editor.component';
import { PipelineDiagramComponent } from './pipeline-diagram/pipeline-diagram.component';


@NgModule({
  declarations: [
    AppComponent,
    ProgramEditorComponent,
    PipelineDiagramComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
