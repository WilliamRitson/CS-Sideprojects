import { Args } from 'webdriver-manager/built/lib/cli';
import { Component, OnInit } from '@angular/core';

import { Chance } from 'chance';

import { galeShapley } from '../group-matcher';

import { sortBy } from 'lodash';

@Component({
  selector: 'app-stable-marriage',
  templateUrl: './stable-marriage.component.html',
  styleUrls: ['./stable-marriage.component.css']
})
export class StableMarriageComponent implements OnInit {
  mensNames: Array<string>;
  womensNames: Array<string>;
  pairings: Array<number>;
  mensPrefs: Array<Array<number>>;
  womansPrefs: Array<Array<number>>;

  mensPairingValues: Array<number>;
  womensPairingValues: Array<number>;
  chance: Chance.Chance;

  womenPropose: boolean;
  randomPairCount: number;
  correlationFactor: number;

  mensAverage: number;
  womensAverage: number;
  totalAverage: number;

  worstRes: number;
  resultsCords: Array<[number, number]>;



  reinit() {
    this.worstRes = 10;
    this.pairings = [];
    this.mensNames = [];
    this.womensNames = [];
    this.mensPrefs = [];
    this.womansPrefs = [];
    this.resultsCords = [];
  }

  constructor() {
    this.chance = new Chance();
    this.randomPairCount = 10;
    this.correlationFactor = 0;

    this.makeRandomPairs();
    this.runGaleShapley
  }

  correlatedShuffle<T>(arr: Array<T>, corelation: number): Array<T> {
    return arr
      .map((val, index) => {
        return {
          value: val,
          key: (index + 1) / arr.length * corelation + Math.random() * (1 - corelation)
        }
      })
      .sort((p1, p2) => p1.key - p2.key)
      .map(pair => pair.value);
  }

  makeRandomPairs() {
    this.reinit();

    for (let i = 0; i < this.randomPairCount; i++) {
      this.addPairOfSize(this.randomPairCount);
    }

    this.mensPrefs = this.mensPrefs.map(prefs => this.correlatedShuffle(prefs, this.correlationFactor / 1000));
    this.womansPrefs = this.womansPrefs.map(prefs => this.correlatedShuffle(prefs, this.correlationFactor / 1000));
  }

  preferenceList(size: number) {
    let list = [];
    for (let i = 0; i < size; i++) {
      list.push(i);
    }
    return list;
  }

  addPairOfSize(size: number) {
    this.mensNames.push(this.chance.first({ gender: 'male' }));
    this.womensNames.push(this.chance.first({ gender: 'female' }));
    this.mensPrefs.push(this.preferenceList(size));
    this.womansPrefs.push(this.preferenceList(size));
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

  getList(prefs: Array<number>, names: Array<string>, limit: number): string {
    let end = Math.min(prefs.length, limit - 1);
    let namedPrefs = prefs.map(pref => names[pref]);
    return namedPrefs.slice(0, end).join(', ');
  }



  runGaleShapley() {
    let womensPrefTable = this.makeTable(this.womansPrefs);
    let mensPrefTable = this.makeTable(this.mensPrefs);

    if (this.womenPropose) {
      this.pairings = galeShapley(this.womansPrefs, mensPrefTable);
      this.invertPairings();
    } else {
      this.pairings = galeShapley(this.mensPrefs, womensPrefTable);
    }


    this.mensAverage = this.womensAverage = this.totalAverage = 0;
    this.mensPairingValues = [];
    this.womensPairingValues = [];

    this.pairings.forEach((man, woman) => {
      this.mensPairingValues[man] = mensPrefTable[man][woman] + 1;
      this.womensPairingValues[woman] = womensPrefTable[woman][man] + 1;

      this.mensAverage += this.mensPairingValues[man];
      this.womensAverage += this.womensPairingValues[woman];
    });

    this.resultsCords = this.pairings.map((man, woman) =>
      [this.womensPairingValues[woman], this.mensPairingValues[man]] as [number, number]);
    this.worstRes = Math.max(
      Math.max(...this.mensPairingValues),
      Math.max(...this.womensPairingValues)
    ) + 1;

    this.mensAverage /= this.mensPrefs.length;
    this.womensAverage /= this.womansPrefs.length;
    this.totalAverage = (this.mensAverage + this.womensAverage) / 2;
  }

  ngOnInit() {
  }

}
