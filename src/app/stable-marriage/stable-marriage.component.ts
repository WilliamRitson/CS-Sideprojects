import { Component, OnInit } from '@angular/core';

import { Chance } from 'chance';

import { galeShapley } from '../group-matcher';

@Component({
  selector: 'app-stable-marriage',
  templateUrl: './stable-marriage.component.html',
  styleUrls: ['./stable-marriage.component.css']
})
export class StableMarriageComponent implements OnInit {
  mensNames: Array<string>;
  womansNames: Array<string>;
  pairings: Array<number>;
  mensPrefs: Array<Array<number>>;
  womansPrefs: Array<Array<number>>;

  mensPairingValues: Array<number>;
  womensPairingValues: Array<number>;
  chance: Chance.Chance;

  womenPropose: boolean;
  randomPairCount: number;

  mensAverage: number;
  womensAverage: number;
  totalAverage: number;



  reinit() {
    this.pairings = [];
    this.mensNames = [];
    this.womansNames = [];
    this.mensPrefs = [];
    this.womansPrefs = [];
  }

  constructor() {
    this.chance = new Chance();
    this.randomPairCount = 10;

    this.makeRandomPairs();
    this.runGaleShapley
  }

  makeRandomPairs() {
    this.reinit();

    for (let i = 0; i < this.randomPairCount; i++) {
      this.addPair();
    }

    this.mensPrefs = this.mensPrefs.map(prefs => this.chance.shuffle(prefs));
    this.womansPrefs = this.womansPrefs.map(prefs => this.chance.shuffle(prefs));
  }

  perefenseList() {
    let len = this.mensNames.length;
    let inOrder = (new Array<number>(len)).fill(0).map((val, index) => index);
    return inOrder;
  }

  addPair() {
    let newIndex = this.mensNames.length;
    this.mensPrefs.forEach(prefs => prefs.push(newIndex));
    this.womansPrefs.forEach(prefs => prefs.push(newIndex));

    this.mensNames.push(this.chance.first({ gender: 'male' }));
    this.womansNames.push(this.chance.first({ gender: 'female' }));
    this.mensPrefs.push(this.perefenseList());
    this.womansPrefs.push(this.perefenseList());
  }

  invertArray(ordered: Array<number>) {
    let arr = new Array<number>(ordered.length).fill(0);
    for (let i = 0; i < ordered.length; i++) {
      let val = ordered[i];
      arr[val] = i;
    }
    return arr;
  }

  makeTable(prefs: Array<Array<number>>): number[][] {
    return prefs.map(this.invertArray);
  }

  invertPairings() {
    this.pairings = this.invertArray(this.pairings);
  }

  runGaleShapley() {
    let womensPrefTable = this.makeTable(this.womansPrefs);
    let mensPrefTable = this.makeTable(this.mensPrefs);

    if (this.womenPropose) {
      this.pairings = galeShapley(this.womansPrefs, mensPrefTable);
    } else {
      this.pairings = galeShapley(this.mensPrefs, womensPrefTable);
      this.invertPairings();
    }


    this.mensAverage = this.womensAverage = this.totalAverage = 0;

    this.mensPairingValues = [];
    this.womensPairingValues = [];

    this.pairings.forEach((man, woman) => {
      this.mensPairingValues[man] = mensPrefTable[man][woman] + 1;
      this.womensPairingValues[woman] = womensPrefTable[woman][man] + 1;

      this.mensAverage += mensPrefTable[man][woman] + 1;
      this.womensAverage += womensPrefTable[woman][man] + 1;
    });

    this.mensAverage /= this.mensPrefs.length;
    this.womensAverage /= this.womansPrefs.length;
    this.totalAverage = (this.mensAverage + this.womensAverage) / 2;
  }

  ngOnInit() {
  }

}
