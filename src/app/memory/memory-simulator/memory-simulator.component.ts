import { Component, OnInit } from '@angular/core';
import { Cache, CacheBlock, MemoryQuantity, MemoryUnit, CacheConfiguraiton, MemoryAccess, SimulationResult } from '../cache';
import { clone, maxBy, sumBy } from 'lodash';
import { SaveService } from '../save.service';
import { HelpService } from '../../help.service';

enum AccessType {
  read,
  write
}

@Component({
  selector: 'app-memory-simulator',
  templateUrl: './memory-simulator.component.html',
  styleUrls: ['./memory-simulator.component.css']
})
export class MemorySimulatorComponent implements OnInit {
  config: CacheConfiguraiton;
  accesses: Array<MemoryAccess>;
  results: Array<SimulationResult>;
  cache: Cache;
  sparseCache: Array<Array<CacheBlock>>;
  sparseCacheIndexes: Array<number>;
  sparseCacheLongestSet: Array<CacheBlock>;

  getSaveData(): Object {
    return {
      config: this.config,
      accesses: this.accesses
    }
  }

  unloadSaveData(saveData: any) {
    let loaded = saveData.config as CacheConfiguraiton;
    this.config = new CacheConfiguraiton();
    this.config.minimumAddressableUnit = new MemoryQuantity(loaded.minimumAddressableUnit.amount, loaded.minimumAddressableUnit.unit);
    this.config.cacheSize = new MemoryQuantity(loaded.cacheSize.amount, loaded.cacheSize.unit);
    this.config.blockSize = new MemoryQuantity(loaded.blockSize.amount, loaded.blockSize.unit);
    this.config.addressSize = new MemoryQuantity(loaded.addressSize.amount, loaded.addressSize.unit);
    this.config.setSize = loaded.setSize;
    this.config.lruPolicy = loaded.lruPolicy;

    this.accesses = []
    let loadedAccesses = saveData.accesses as Array<MemoryAccess>;
    for(let i = 0; i < loadedAccesses.length; i++) {
      this.accesses.push(new MemoryAccess(loadedAccesses[i].address, loadedAccesses[i].isWrite));
    }
  }

  constructor(public saver: SaveService, private help:HelpService) {
    this.config = new CacheConfiguraiton();
    this.config.minimumAddressableUnit = new MemoryQuantity(1, MemoryUnit.byte);
    this.config.cacheSize = new MemoryQuantity(1, MemoryUnit.kibibyte);
    this.config.blockSize = new MemoryQuantity(32, MemoryUnit.byte);
    this.config.addressSize = new MemoryQuantity(32, MemoryUnit.bit);
    this.config.setSize = 1;
    this.config.lruPolicy = true;

    saver.load(this.unloadSaveData.bind(this), 'memory-sim');
    help.setHelpUrl('https://www.williamritson.com/projects/2017/02/07/cache-simulator');

    this.cache = new Cache();
    this.results = [];
    this.accesses = [
      new MemoryAccess(0, true),
      new MemoryAccess(1025, false),
      new MemoryAccess(1027, false),
      new MemoryAccess(512, false),
      new MemoryAccess(0, false),
      new MemoryAccess(16, false),
    ];
    this.sparseCache = [];
    this.runSimulation();
    saver.autosave(this.getSaveData.bind(this), 'memory-sim');
  }

  getHitRate() {
    let hits = sumBy(this.results, r => r.isHit ? 1 : 0);
    return hits / this.results.length;
  }

  buildSpaseCache() {
    this.sparseCacheIndexes = [];
    let nonEmptySets = this.cache.sets.filter((set, index) => {
      let cond = set.find(block => block.valid) !== undefined;
      if (cond)
        this.sparseCacheIndexes.push(index);
      return cond;
    });
    // Clone the sets
    this.sparseCache = nonEmptySets.map(set => set.map(block => clone(block)));
    this.sparseCacheLongestSet = this.getLongestSet(this.sparseCache);
  }

  getLongestSet(sets: Array<Array<CacheBlock>>) {
    let longestSet = maxBy(sets, set => sumBy(set, block => block.valid ? 1 : 0)) || [];
    return this.getIntrestingBlocks(longestSet);
  }

  getIndex(set) {
    return this.cache.sets.indexOf(set);
  }

  getIntrestingBlocks(set: Array<CacheBlock>) {
    return set.filter(block => {
      return block.valid;
    })
  }

  getAddress(i) {
    return this.accesses[i].address;
  }

  runSimulation() {
    this.results = this.cache.runCacheSimulation(this.config, this.accesses.map(ma => new MemoryAccess(ma.address, ma.isWrite)));
    this.buildSpaseCache();
  }

  runSimulationStep() {
    if (this.results.length == this.accesses.length) {
      this.cache.stepTime = undefined;
      this.results = [];
    }
    this.results.push(
      clone(this.cache.runCacheSimulationStep(this.config, this.accesses.map(ma => new MemoryAccess(ma.address, ma.isWrite))))
    );
    this.buildSpaseCache();
  }

  addAccess() {
    this.accesses.push(new MemoryAccess(0, false));
  }

  deleteAccess(index: number) {
    this.accesses.splice(index, 1);
  }

  maxAddress() {
    return Math.pow(2, this.config.addressSize.toBits()) - 1;
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.saver.removeAutosave();
  }

}
