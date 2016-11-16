import { Component, OnInit } from '@angular/core';
import { Cache, CacheConfiguraiton, MemoryAccess, SimulationResult } from '../cache';
import {clone} from 'lodash';

enum AccessType {
  read,
  write
}


const cache = new Cache();
@Component({
  selector: 'app-memory-simulator',
  templateUrl: './memory-simulator.component.html',
  styleUrls: ['./memory-simulator.component.css']
})
export class MemorySimulatorComponent implements OnInit {
  config: CacheConfiguraiton;
  accesses: Array<MemoryAccess>;
  results: Array<SimulationResult>;

  constructor() { 
    this.config = new CacheConfiguraiton();
    this.results = [];
    this.accesses = [
      new MemoryAccess(296, false),
      new MemoryAccess(3904, true),
      new MemoryAccess(10485841, false),
      new MemoryAccess(147, true),
      new MemoryAccess(67111748, false)
    ];
    this.runSimulation();
  }

  getAddress(i) {
    let n = this.accesses[i].address;
    return n;
  }

  runSimulation () {
    this.results = cache.runCacheSimulation(this.config, this.accesses.map(ma=> new MemoryAccess(ma.address, ma.isWrite)));
  }

  addAccess() {
    this.accesses.push(new MemoryAccess(0, false));
  }

  deleteAccess(index:number) {
    this.accesses.splice(index, 1);
  }

  maxAddress() {
    return Math.pow(2, this.config.addressSize.toBits()) - 1;
  }

  ngOnInit() {
  }

}
