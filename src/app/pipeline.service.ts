import { Injectable } from '@angular/core';
import { MipsService, MipsInstruction } from './mips.service';
import {remove, lastIndexOf} from 'lodash';

const LONG_INSTRUCITONS = {
  mult: 4,
  multu: 4,
  add: 2,
  addu: 2,
  addi: 2,
  addiu: 2
}

const MEM_INSTRUCITONS = {
  lw: true,
  sw: true
}

const S_POC = {
  sw: "memory",
  bne: "decode"
}

const S_POP = {
  lw: "memory"
}


class InstrucitonConfig {
  constructor(instr: string, unit: FunctionalUnit, hasMemory = false) {
    this.instruciton = instr;
    this.hasMemory = hasMemory;
    this.functionalUnit = unit;
    this.pointOfConsumption = S_POC[instr] || this.getExecuteName(1);
    this.pointOfCompletion = S_POP[instr] || this.getExecuteName(this.functionalUnit.executeLength);
  }
  functionalUnit: FunctionalUnit;
  instruciton: string;
  hasMemory: boolean;
  pointOfConsumption: string;
  pointOfCompletion: string;
  resolve(): Array<string> {
    let results = ['fetch', 'decode'];
    for (let i = 1; i <= this.functionalUnit.executeLength; i++) {
      results.push(this.getExecuteName(i));
    }
    if (this.hasMemory)
      results.push('memory');
    results.push('write');
    return results;
  }
  remainingInstructions(instr:MipsInstruction):number {
    let stages = this.resolve();
    let index = stages.indexOf(instr.executionPhase)
    if ( index == -1)
      return 0;
    return stages.length - index - instr.executionSubphase; 
  }
  getExecuteName(stage: number) {
    return 'execute-' + this.functionalUnit.name + (this.functionalUnit.isPipelined ? '-' + stage : '');
  }
  nextPhase(current: string) {
    let stages = this.resolve();
    return stages[stages.indexOf(current) + 1];
  }
  isDone(instr: MipsInstruction): boolean {
    return instr.executionPhase == 'done';
  }
  private stageIs(stage1: string, stage2: string, relation: (a: number, b: number) => boolean) {
    let stages = this.resolve();
    return relation(stages.indexOf(stage1), stages.indexOf(stage2));
  }
  // Returns true if the result can be forwarded
  resultIsReady(instr: MipsInstruction): boolean {
    let stages = this.resolve();
    return lastIndexOf(stages, this.pointOfCompletion) < stages.indexOf(instr.executionPhase);
  }
  // Returns true if we need the operands to have completed
  needsData(instr: MipsInstruction): boolean {
    return this.stageIs(instr.executionPhase, this.pointOfConsumption, (a, b) => a + 1 >= b);
  }
}

class FunctionalUnit {
  constructor(name: string, length: number, units: number, stations: number, piped: boolean, ) {
    this.name = name;
    this.executeLength = length;
    this.units = units;
    this.isPipelined = piped;
    this.stations = stations
    this.currentUsers = [];
  }
  currentUsers: Array<MipsInstruction>;
  use(instr: MipsInstruction) {
    this.currentUsers.push(instr);
  }
  canUse(instr: MipsInstruction, parallelAllowed: boolean) {
    if (!parallelAllowed)
      return this.currentUsers.length == 0 || this.currentUsers[0] == instr;
    return this.currentUsers.length < this.units || this.currentUsers.indexOf(instr) != -1;
  }
  free(instr: MipsInstruction) {
    console.log('free', instr);
    remove(this.currentUsers, i => i == instr);
  }
  name: string;
  isPipelined: boolean;
  executeLength: number;
  units: number;
  stations: number;
}


export class DiagramLine {
  constructor(public instr: MipsInstruction, public lineNumber: number) {
    this.id = instr.source;
    this.stages = [];
    this.dependencies = [];
    this.forwards = {};
  }
  dependencyString(): string {
    return this.dependencies.map(d => d.lineNumber).join(", ");
  }
  id: string;
  forwards: {};
  stages: Array<string>;
  dependencies: Array<DiagramLine>;
}

interface Set {
  [key: string]: boolean;
}

interface InstructionHash {
  [key: string]: MipsInstruction;
}

interface ConfigHash {
  [key: string]: InstrucitonConfig;
}

function isExe(stage: string) {
  return stage.indexOf('exe') != -1
}

enum PipeAlgorithm {
  InOrder,
  Tomasulo,
  Scoreboarding
}

@Injectable()
export class Pipeline {
  registers: InstructionHash;
  stages: InstructionHash;
  algorithm: PipeAlgorithm;
  functionalUnits: Array<FunctionalUnit>;
  instructionConfigurations: Array<InstrucitonConfig>
  configLookup: ConfigHash;
  remainingTime: Array<number>;

  constructor(public mipsService: MipsService) {
    this.registers = {};
    this.stages = {};
    this.remainingTime = [];
    this.forwarding = false;
    this.algorithm = PipeAlgorithm.InOrder;

    this.functionalUnits = [
      new FunctionalUnit('arithmetic', 1, 1, 3, false),
      new FunctionalUnit('add', 2, 1, 3, true),
      new FunctionalUnit('mult', 4, 1, 3, false)
    ];
    this.instructionConfigurations = mipsService.instrucitons.map((instr) => {
      let unit = this.functionalUnits[0];
      if (instr.indexOf('add') != -1)
        unit = this.functionalUnits[1];
      if (instr.indexOf('mult') != -1)
        unit = this.functionalUnits[2];
      return new InstrucitonConfig(instr, unit, MEM_INSTRUCITONS[instr] || false);
    });
    this.configLookup = {};
    this.instructionConfigurations.forEach(c => {
      this.configLookup[c.instruciton] = c;
    });
  }

  clean() {
    this.registers = {};
    this.stages = {};
  }

  getNextPhase(instr: MipsInstruction): string {
    let stages = this.instrStages;
    let index = stages.indexOf(instr.executionPhase);
    if (index == -1) return stages[0];
    else if (index == stages.length - 1) return 'done';
    if (isExe(instr.executionPhase) && instr.executionSubphase == this.instrConfig.functionalUnit.executeLength) {
      return stages[index + this.instrConfig.functionalUnit.executeLength];
    }
    return stages[index + 1];
  }

  getConfig(instr: MipsInstruction) {
    return this.configLookup[instr.instruction];
  }

  private instrConfig: InstrucitonConfig;
  private instrStages: Array<string>;
  execute(line: DiagramLine): string {
    this.instrConfig = this.getConfig(line.instr)
    this.instrStages = this.instrConfig.resolve();
    var failCode = this.cannotExecute(line);

    if (failCode) {
      return failCode;
    }
    this.remainingTime[line.lineNumber] = this.instrConfig.remainingInstructions(line.instr);
    return this.advanceExecution(line.instr);
  }

  private advanceExecution(instr: MipsInstruction): string {
    let nextStage = this.getNextPhase(instr);
    if (nextStage == instr.executionPhase) {
      instr.executionSubphase++;
      nextStage = this.getNextPhase(instr);
    }
    this.markHardware(instr, nextStage);
    instr.executionPhase = nextStage;
    return nextStage;
  }

  private markHardware(instr: MipsInstruction, nextStage: string) {
    if (nextStage != 'done') {
      this.instrConfig.functionalUnit.use(instr);
      this.stages[nextStage] = instr;
    }
    if (!isExe(nextStage)) {
      this.instrConfig.functionalUnit.free(instr);
    }
    this.stages[instr.executionPhase] = undefined;
  }

  private hasStructuralHazard(nextStage: string, instr: MipsInstruction): boolean {
    let fu = this.getConfig(instr).functionalUnit;
    if (!fu.isPipelined && isExe(nextStage))
      return this.getConfig(instr).functionalUnit.canUse(instr, false);
    return (this.stages[nextStage] == instr) || (this.stages[nextStage] == undefined);
  }

  forwarding: boolean;
  private hasDataHazard(nextStage: string, line: DiagramLine): boolean {
    // check if we are at the stage where we need our soure registers to be avalible
    if (!this.instrConfig.needsData(line.instr))
      return true;

    let potentialForwards = [];
    for (let i = 0; i < line.dependencies.length; i++) {
      let dep = line.dependencies[i];
      let config = this.getConfig(dep.instr);
      if (config.isDone(dep.instr)) {
        continue;
      } else if (this.forwarding && config.resultIsReady(dep.instr)) {
        potentialForwards.push([line.forwards, line.stages.length]);
        potentialForwards.push([dep.forwards,  lastIndexOf(dep.stages, dep.instr.executionPhase)]);
        continue;
      }
      return false;
    }
    // Commit forwards
    potentialForwards.forEach(f => {
      f[0][f[1]] = true;
    })
    return true;
  }

  stallInOrder(line:DiagramLine): boolean {
    if (line.lineNumber == 0 || line.instr.executionPhase != 'decode')
      return false;
    let prevTime = this.remainingTime[line.lineNumber - 1];
    return this.instrConfig.remainingInstructions(line.instr) <= prevTime;
  }

  cannotExecute(line: DiagramLine): string {
    let nextStage = this.getNextPhase(line.instr);
    if (!this.hasStructuralHazard(nextStage, line.instr))
      return `stall-SH (${line.instr.executionPhase})`; // Stall for structural hazard
    if (this.stallInOrder(line))
      return `stall-II (${line.instr.executionPhase})`; // Stall for in order execution
    if (!this.hasDataHazard(nextStage, line))
      return `stall-DH (${line.instr.executionPhase})`; // Stall for data hazard
    return undefined;
  }
}
