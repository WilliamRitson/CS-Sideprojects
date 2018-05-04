import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { MatButtonModule, MatRadioModule, MatIconModule,
  MatTooltipModule, MatSnackBarModule, MatToolbarModule,
  MatProgressSpinnerModule, MatDialogModule, MatListModule,
  MatCardModule, MatSliderModule, MatCheckboxModule, MatPaginatorModule, MatOptionModule,
  MatTabsModule, MatSidenavModule} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';


import {
  LocationStrategy,
  HashLocationStrategy
} from '@angular/common';

import { SaveService } from './save.service';
import { MipsService } from './mips.service';
import { HelpService } from './help.service';

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
import { UltimateTicTacToeComponent } from './ultimate-tic-tac-toe/ultimate-tic-tac-toe.component';
import { ProbabilityDistributionComponent } from './probability-distribution/probability-distribution.component';
import { SegmentedLeastSquaresComponent } from './segmented-least-squares/segmented-least-squares.component';


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
    UltimateTicTacToeComponent,
    ProbabilityDistributionComponent,
    SegmentedLeastSquaresComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    MatButtonModule, MatRadioModule, MatIconModule,MatOptionModule,
    MatTooltipModule, MatSnackBarModule, MatToolbarModule,
    MatProgressSpinnerModule, MatDialogModule, MatListModule, 
    MatCardModule, MatSliderModule, MatCheckboxModule, MatPaginatorModule,
    MatSidenavModule,
    MatTabsModule,
    FlexLayoutModule,
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
        path: 'probability-dist', component: ProbabilityDistributionComponent,
        data: {
          title: 'Probability Distribution'
        }
      },
      {
        path: 'segmented-least-squares', component: SegmentedLeastSquaresComponent,
        data: {
          title: 'Probability Distribution'
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
        data: {
          helpUrl: 'https://www.williamritson.com/projects/2017/02/02/smt-generator'
        }
      },
      {
        path: 'pipe',
        component: PipelineDiagramComponent,
        data: {
          title: 'Pipeline Digram Generator',
          helpUrl: 'http://www.google.com'
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
  providers: [SaveService, HelpService, MipsService, { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
