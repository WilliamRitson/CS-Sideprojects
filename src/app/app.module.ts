import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';


import { AppComponent } from './app.component';
import { ProgramEditorComponent } from './program-editor/program-editor.component';
import { PipelineDiagramComponent } from './pipeline-diagram/pipeline-diagram.component';
import { MemorySimulatorComponent } from './memory-simulator/memory-simulator.component';
import { MemoryUnitEditorComponent } from './memory-unit-editor/memory-unit-editor.component';
import { RadixedValueEditorComponent } from './radixed-value-editor/radixed-value-editor.component';
import { RadixPipe } from './radix.pipe';


@NgModule({
  declarations: [
    AppComponent,
    ProgramEditorComponent,
    PipelineDiagramComponent,
    MemorySimulatorComponent,
    MemoryUnitEditorComponent,
    RadixedValueEditorComponent,
    RadixPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
     RouterModule.forRoot([
      { path: 'cache', component: MemorySimulatorComponent },
      {
        path: 'pipe',
        component: PipelineDiagramComponent,
        data: {
          title: 'Pipeline Digram Generator'
        }
      },
      { path: '', component: MemorySimulatorComponent },
      { path: '**', component: MemorySimulatorComponent }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
