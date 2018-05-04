import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AiGamesComponent } from './ai/ai-games/ai-games.component';
import { AiModule } from './ai/ai.module';
import { AppComponent } from './app.component';
import { GraphSearchComponent } from './graph-theory/graph-search/graph-search.component';
import { GraphTheoryModule } from './graph-theory/graph-theory.module';
import { GroupMatchingModule } from './group-matching/group-matching.module';
import { StableMarriageComponent } from './group-matching/stable-marriage/stable-marriage.component';
import { HelpService } from './help.service';
import { HomeComponent } from './home/home.component';
import { MaterialModule } from './material.module';
import { MemorySimulatorComponent } from './memory/memory-simulator/memory-simulator.component';
import { MemoryModule } from './memory/memory.module';
import { SaveService } from './memory/save.service';
import { MipsModule } from './mips/mips.module';
import { MipsService } from './mips/mips.service';
import { PipelineDiagramComponent } from './mips/pipeline-diagram/pipeline-diagram.component';
import { SetAlgebraComponent } from './set-theory/set-algebra/set-algebra.component';
import { SetTheoryModule } from './set-theory/set-theory.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    AiModule,
    MipsModule,
    MemoryModule,
    GraphTheoryModule,
    GroupMatchingModule,
    SetTheoryModule,
    RouterModule.forRoot([
 
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
