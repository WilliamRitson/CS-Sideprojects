import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '@angular/material';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GraphSearchComponent } from './graph-search/graph-search.component';
import { ProgramEditorComponent } from './program-editor/program-editor.component';
import { PipelineDiagramComponent } from './pipeline-diagram/pipeline-diagram.component';
import { MemorySimulatorComponent } from './memory-simulator/memory-simulator.component';
import { MemoryUnitEditorComponent } from './memory-unit-editor/memory-unit-editor.component';
import { RadixedValueEditorComponent } from './radixed-value-editor/radixed-value-editor.component';
import { RadixPipe, AllRadixPipe } from './radix.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GraphSearchComponent,
    ProgramEditorComponent,
    PipelineDiagramComponent,
    MemorySimulatorComponent,
    MemoryUnitEditorComponent,
    RadixedValueEditorComponent,
    RadixPipe, AllRadixPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    RouterModule.forRoot([
      {
        path: 'cache', component: MemorySimulatorComponent, 
        data: {
          title: 'Cache Simulator'
        }
      },
      {
        path: 'pipe',
        component: PipelineDiagramComponent,
        data: {
          title: 'Pipeline Digram Generator'
        }
      },
      {
        path: 'graph',
        component: GraphSearchComponent,
        data: {
          title: 'Graph Search Demo'
        }
      },
      { path: '', component: HomeComponent },
      { path: '**', component: HomeComponent }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
