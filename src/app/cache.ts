import { minBy } from 'lodash';

export enum MemoryUnit {
    bit = 1,
    byte = 8,
    halfWord = 2 * byte,
    word = 4 * byte,
    kibibyte = 1024 * byte,
    mebibyte = 1024 * kibibyte,
    tebibyte = 1024 * mebibyte,
}

export class MemoryAccess {
    constructor(public address: number, public isWrite: boolean, public dataSize: number) { }
}

export class MemoryQuantity {
    constructor(amount: number, unit: MemoryUnit) {
        this.amount = amount;
        this.unit = unit;
    }
    amount: number;
    unit: MemoryUnit;
    toBits(): number {
        return this.convert(MemoryUnit.bit).amount;
    }
    toString(): string {
        return this.amount + ' ' + MemoryUnit[this.unit] + (this.amount != 1 ? 's' : '');
    }
    convert(unit: MemoryUnit) {
        return new MemoryQuantity(this.amount * this.unit / unit, unit);
    }
    unitlessBinaryOp(operator: (a: number, b: number) => number, operand: number) {
        return new MemoryQuantity(operator(this.amount, operand), this.unit);
    }
    unitlessUnaryOp(operator: (a: number) => number) {
        return new MemoryQuantity(operator(this.amount), this.unit);
    }
    log2() {
        return new MemoryQuantity(log2(this.convert(MemoryUnit.bit).amount), MemoryUnit.bit);
    }


    times(m: MemoryQuantity | number) {
        if ((<MemoryQuantity>m).convert) {
            return new MemoryQuantity(this.amount * (<MemoryQuantity>m).convert(this.unit).amount, this.unit);
        } else {
            return new MemoryQuantity(this.amount * <number>m, this.unit);
        }
    }
    plus(m: MemoryQuantity) {
        return new MemoryQuantity(this.amount + m.convert(this.unit).amount, this.unit);
    }
    sub(m: MemoryQuantity) {
        return this.plus(m.times(-1));
    }
    div(m: MemoryQuantity) {
        return new MemoryQuantity(this.amount / m.convert(this.unit).amount, MemoryUnit.bit);
    }
}

function log2(n: number) {
    return Math.log(n) / Math.log(2);
}

export class CacheConfiguraiton {
    /** Smallest addresable unit */
    minimumAddressableUnit: MemoryQuantity;
    /** Size of memory addresses. Usually 16, 32, or 64 bits */
    addressSize: MemoryQuantity;
    /** Total size of the cache */
    cacheSize: MemoryQuantity;
    /** Block Size*/
    blockSize: MemoryQuantity;
    /** Number of blocks in each cache (1 implies directly mapped cache) */
    setSize: number;
    /** Size of the offset in the address */
    offsetSize: MemoryQuantity;
    /** Size of the index in the address*/
    indexSize: MemoryQuantity;
    /** Size of the tag in the address*/
    tagSize: MemoryQuantity;

    constructor() {
        this.minimumAddressableUnit = new MemoryQuantity(1, MemoryUnit.byte);
        this.cacheSize = new MemoryQuantity(512, MemoryUnit.kibibyte);
        this.blockSize = new MemoryQuantity(64, MemoryUnit.word);
        this.addressSize = new MemoryQuantity(32, MemoryUnit.bit);
        this.setSize = 1;
        this.computeAddressParts();
    }
    getOffsetSize() {
        this.computeAddressParts();
        return this.offsetSize;
    }
    getAddressSize() {
        this.computeAddressParts();
        return this.addressSize;
    }
    getTagSize() {
        this.computeAddressParts();
        return this.tagSize;
    }
    computeAddressParts() {
        this.offsetSize = this.blockSize.div(this.minimumAddressableUnit).log2();
        this.indexSize = this.cacheSize.div(this.blockSize.times(this.setSize)).log2();
        this.tagSize = this.addressSize.sub(this.offsetSize).sub(this.indexSize);
    }
}

export class SimulationResult {
    access: MemoryAccess;
    cacheIndex: number;
    isHit: boolean;
    tag: number;
    modified: boolean;
    causedReplace: boolean;
    writeBack: boolean;
}

class CacheBlock {
    constructor() {
        this.lastUsed = 0;
        this.valid = false;
        this.tag = -1;
    }
    valid: boolean;
    tag: number;
    lastUsed: number;
    modified: boolean;
}

function pad(pad: string, text: string, len: number) {
    return (pad.repeat(len) + text).slice(-len)
}

function dec2bin(dec: number, bits: number = 32): string {
    return pad('0', (dec >>> 0).toString(2), bits);
}
function bin2dec(dec: string): number {
    return parseInt(dec, 2);
}

function getNBits(n: number, start: number, end: number) {
    return (n & ((1 << end) - 1) << start) >>> 0;
}

class SplitAddress {
    constructor(address: number, config: CacheConfiguraiton) {
        this.decimal = address;
        this.binary = dec2bin(address);
        this.tagBinary = this.binary.substring(0, config.tagSize.toBits());
        this.indexBinary = this.binary.substring(config.tagSize.toBits(), config.tagSize.toBits() + config.indexSize.toBits());
        this.offsetBinary = this.binary.substring(config.tagSize.toBits() + config.indexSize.toBits(), config.addressSize.toBits());
        this.tag = bin2dec(this.tagBinary);
        this.index = bin2dec(this.indexBinary);
        this.offset = bin2dec(this.offsetBinary);
    }
    binary: string;
    tagBinary: string;
    indexBinary: string;
    offsetBinary: string;
    decimal: number;
    tag: number;
    index: number;
    offset: number;
}

export class Cache {

    runCacheSimulation(config: CacheConfiguraiton, accesses: Array<MemoryAccess>): Array<SimulationResult> {
        let blockCount = config.cacheSize.div(config.blockSize).amount;
        let setCount = blockCount / config.setSize;
        config.computeAddressParts();


        let sets = new Array<Array<CacheBlock>>();
        for (let i = 0; i < setCount; i += 1) {
            sets.push([]);
            for (let j = 0; j < config.setSize; j += 1) {
                sets[i].push(new CacheBlock());
            }
        }

        let time = 0;
        return accesses.map(access => {
            let address = new SplitAddress(access.address, config);

            let res = new SimulationResult();
            res.access = access;
            res.cacheIndex = address.index;
            res.tag = address.tag; 
            time++;

            let set = sets[res.cacheIndex];
            let block = set.find(block => block.tag == address.tag);

            if (block) {
                res.isHit = true;
                block.lastUsed = time;
            } else {
                res.isHit = false;
                // LRU policy
                block = minBy(set, block => block.lastUsed);
                if (block.modified) {
                    res.writeBack = true;
                    block.modified = false;
                }
                block.lastUsed = time;
                res.causedReplace = block.valid;
                block.valid = true;
                block.tag = address.tag;
            }
            if (access.isWrite) {
                res.modified = true;
                block.modified = true;
            }

            return res;
        });
    }

}
