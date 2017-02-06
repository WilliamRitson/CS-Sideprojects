import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '@angular/material';

import {
  LocationStrategy,
  HashLocationStrategy
} from '@angular/common';

import { SaveService } from './save.service';
import { MipsService } from './mips.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GraphSearchComponent } from './graph-search/graph-search.component';
import { ProgramEditorComponent } from './program-editor/program-editor.component';
import { PipelineDiagramComponent } from './pipeline-diagram/pipeline-diagram.component';
import { MemorySimulatorComponent } from './memory-simulator/memory-simulator.component';
import { MemoryUnitEditorComponent } from './memory-unit-editor/memory-unit-editor.component';
import { RadixedValueEditorComponent } from './radixed-value-editor/radixed-value-editor.component';
import { RadixPipe, AllRadixPipe } from './radix.pipe';
import { EnumEditorComponent } from './enum-editor/enum-editor.component';
import { AiGamesComponent } from './ai-games/ai-games.component';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { StableMarriageComponent } from './stable-marriage/stable-marriage.component';
import { OrdinalPipe } from './ordinal.pipe';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { SetAlgebraComponent } from './set-algebra/set-algebra.component';


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
    RadixPipe, AllRadixPipe,
    EnumEditorComponent,
    AiGamesComponent,
    TicTacToeComponent,
    TreeViewComponent,
    StableMarriageComponent,
    OrdinalPipe,
    ScatterPlotComponent,
    SetAlgebraComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    RouterModule.forRoot([
      {
        path: 'tree', component: TreeViewComponent,
      },
      {
        path: 'cache', component: MemorySimulatorComponent,
        data: {
          title: 'Cache Simulator'
        }
      },
      {
        path: 'ai-games', component: AiGamesComponent,
        data: {
          title: 'AI Games'
        }
      },
      {
        path: 'set-algebra', component: SetAlgebraComponent,
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
      {
        path: 'stable-marriage',
        component: StableMarriageComponent,
        data: {
          title: 'Stable Marriage Demo'
        }
      },
      { path: '', component: HomeComponent },
      { path: '**', component: HomeComponent }
    ])
  ],
  providers: [SaveService, MipsService, { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
