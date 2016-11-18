import { Component, OnInit } from '@angular/core';
import { Cache, CacheBlock, MemoryQuantity, MemoryUnit, CacheConfiguraiton, MemoryAccess, SimulationResult } from '../cache';
import { clone, maxBy, sumBy } from 'lodash';

enum AccessType {
  read,
  write
}

const setZero= [
  new MemoryAccess(0, false),
  new MemoryAccess(2, false),
  new MemoryAccess(4, false),
  new MemoryAccess(8, false),
  new MemoryAccess(16, false),
  new MemoryAccess(32, false),
  new MemoryAccess(64, false),
  new MemoryAccess(128, false)
]
const setOne = [
  new MemoryAccess(0, false),
  new MemoryAccess(1024, false),
  new MemoryAccess(2048, false),
  new MemoryAccess(3072, false),
  new MemoryAccess(4096, false),
  new MemoryAccess(3072, false),
  new MemoryAccess(2048, false),
  new MemoryAccess(1024, false),
  new MemoryAccess(0, false)
]
const setTwo = [
  new MemoryAccess(0, false),
  new MemoryAccess(256, false),
  new MemoryAccess(512, false),
  new MemoryAccess(1024, false),
  new MemoryAccess(2048, false),
  new MemoryAccess(1024, false),
  new MemoryAccess(512, false),
  new MemoryAccess(256, false),
  new MemoryAccess(0, false)
]

const setThree = [
  new MemoryAccess(0, false), 
  new MemoryAccess(512, false), 
  new MemoryAccess(2048, false),
  new MemoryAccess(0, false), 
  new MemoryAccess(1536, false), 
  new MemoryAccess(0, false), 
  new MemoryAccess(1024, false), 
  new MemoryAccess(512, false)

]
const setOld = [
new MemoryAccess(296, false),
new MemoryAccess(3904, true),
new MemoryAccess(10485841, false),
new MemoryAccess(147, true),
new MemoryAccess(67111748, false),
]

const allSets = [setZero, setOne, setTwo, setThree];
const setEV = [4/8, 3/9, 4/9, 2/8];
const associativeOptions = [1, 2, 4];
const blockSizeOptions = [1, 2, 4, 8, 16,  32];
const cacheSizeOptions = [1024, 2048];
const lruPolicyOptions = [true, false];

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

  testAll () {
    this.config.addressSize = new MemoryQuantity(13, MemoryUnit.bit);
    let tn = 0;
    associativeOptions.forEach(ao => {
      blockSizeOptions.forEach(bso => {
        cacheSizeOptions.forEach(cso => {
          lruPolicyOptions.forEach(lro => {
            let failed = false;
            tn++;
            console.log("test", tn);
            console.log("Associativity", ao, "block size", bso, "cache size", cso, "use lru", lro);
            let good = 0;
            allSets.forEach((test, i) => {
              
              this.config.cacheSize = new MemoryQuantity(cso, MemoryUnit.bit);
              this.config.blockSize = new MemoryQuantity(bso, MemoryUnit.byte);
              this.config.setSize = ao
              this.config.lruPolicy = lro;
              this.accesses = test;
              this.runSimulation();
              let result = this.getHitRate();
              console.log(i, "r", result, "ev", setEV[i], result== setEV[i]);
              if (result != setEV[i]) {
                failed = true;
              } else {
                good++;
              }
            })
            console.log('good', good);
            if (!failed)
             console.log('hazah');            
          })
        })
      })
    })

  }

  constructor() {
    this.config = new CacheConfiguraiton();
    this.config.minimumAddressableUnit = new MemoryQuantity(1, MemoryUnit.byte);
    this.config.cacheSize =   new MemoryQuantity(2048, MemoryUnit.bit);
    this.config.blockSize =   new MemoryQuantity(32, MemoryUnit.byte);
    this.config.addressSize = new MemoryQuantity(13, MemoryUnit.bit);
    this.config.setSize = 4;
    this.config.lruPolicy = true;
    this.cache = new Cache();
    this.results = [];
    this.accesses = setTwo; //setThree;
    this.sparseCache = [];
    this.runSimulation();
    //this.testAll();
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
    let n = this.accesses[i].address;
    return n;
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

}
