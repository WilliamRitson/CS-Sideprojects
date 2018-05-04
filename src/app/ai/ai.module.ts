import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AiGamesComponent } from './ai-games/ai-games.component';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { UltimateTicTacToeComponent } from './ultimate-tic-tac-toe/ultimate-tic-tac-toe.component';
import { MaterialModule } from '../material.module';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  declarations: [
    AiGamesComponent,
    TicTacToeComponent,
    UltimateTicTacToeComponent
  ],
  exports: [AiGamesComponent]
})
export class AiModule { }
