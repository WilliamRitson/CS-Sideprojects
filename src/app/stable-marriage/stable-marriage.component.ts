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
  menPrefs: Array<Array<number>>;
  womanPrefs: Array<Array<number>>;
  chance: Chance.Chance;


  constructor() {
    this.pairings = [];
    this.mensNames = [];
    this.womansNames = [];
    this.menPrefs = [];
    this.womanPrefs = [];

    this.chance = new Chance();

    for (let i = 0; i < 5; i++) {
      this.addPair();
    }

    //this.menPrefs = this.menPrefs.map(this.chance.shuffle);
    //this.womanPrefs = this.womanPrefs.map(this.chance.shuffle);
  }

  randomPreferenseList() {
    let len = this.mensNames.length;
    let inOrder = (new Array<number>(len)).fill(0).map((val, index) => index);
    return chance.shuffle(inOrder);
  }

  addPair() {
    let newIndex = this.mensNames.length;
    this.menPrefs.forEach(prefs => prefs.push(newIndex));
    this.womanPrefs.forEach(prefs => prefs.push(newIndex));


    this.mensNames.push(this.chance.first({ gender: 'male' }));
    this.womansNames.push(this.chance.first({ gender: 'female' }));
    this.menPrefs.push(this.randomPreferenseList());
    this.womanPrefs.push(this.randomPreferenseList());

    
  }

  makeTable(prefs: Array<Array<number>>): number[][] {
    let table = Array<Array<number>>(prefs.length).fill([]);

    for (let i = 0; i < prefs.length; i++) {
      for (let j = 0; j < prefs.length; j++) {
        table[i][prefs[i][j]] = prefs.length - j;
      }
    }

    return table;
  }

  runGaleShapley() {
    this.pairings = galeShapley(this.menPrefs, this.makeTable(this.womanPrefs));
  }

  ngOnInit() {
  }

}
