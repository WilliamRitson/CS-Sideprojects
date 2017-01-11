import { Component, OnInit } from '@angular/core';
import { Minimax } from '../minimax';
import { MCTS } from '../mcts';
import { GameAI } from '../game-ai';

class Player {

  constructor(public isHuman: boolean, public ai: GameAI, public aiIndex: number) {}
}

@Component({
  selector: 'app-ai-games',
  templateUrl: './ai-games.component.html',
  styleUrls: ['./ai-games.component.css']
})
export class AiGamesComponent implements OnInit {
  aiChoices: Array<GameAI>;
  players: Array<Player>;
  aiNames: Array<string>;
  constructor() {
    this.aiChoices = [new Minimax(), new MCTS()];
    this.aiNames = ['minimax', 'mcts'];
    this.players = [
      new Player(true, this.aiChoices[0], 0),
      new Player(false, this.aiChoices[0], 1),
    ]
    console.log(this.players);
  }
  setAI(player:Player) {
    console.log('set ai for', player, this);
    player.ai = this.aiChoices[player.aiIndex];
  }

  ngOnInit() {
  }

}
