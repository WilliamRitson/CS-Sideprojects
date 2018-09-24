import { Injectable } from '@angular/core';
import { MipsService, MipsInstruction } from './mips.service';
import { remove, lastIndexOf } from 'lodash';

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


class InstructionConfig {
  functionalUnit: FunctionalUnit;
  instruction: string;
  hasMemory: boolean;
  pointOfConsumption: string;
  pointOfCompletion: string;

  // TODO: Make POC rest to default after fu change
  constructor(instr: string, unit: FunctionalUnit, hasMemory = false) {
    this.instruction = instr;
    this.hasMemory = hasMemory;
    this.functionalUnit = unit;
    this.pointOfConsumption = S_POC[instr] || this.getExecuteName(1);
    this.pointOfCompletion = S_POP[instr] || this.getExecuteName(this.functionalUnit.executeLength);
  }
  
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
  remainingInstructions(instr: MipsInstruction): number {
    let stages = this.resolve();
    let index = stages.indexOf(instr.executionPhase)
    if (index == -1)
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
  needsData(instr: MipsInstruction, nextStage:string): boolean {
    return this.stageIs(nextStage, this.pointOfConsumption, (a, b) => a >= b);
  }
}

const rs_name = 'reservation-station';
const ro_name = 'reorder-buffer';
class FunctionalUnit {
  stationsInUse: number;
  currentUsers: Array<MipsInstruction>;
  name: string;
  isPipelined: boolean;
  executeLength: number;
  units: number;
  stations: number;
  constructor(name: string, length: number, units: number, stations: number, piped: boolean, ) {
    this.name = name;
    this.executeLength = length;
    this.units = units;
    this.isPipelined = piped;
    this.stations = stations
    this.stationsInUse = 0;
    this.currentUsers = [];
  }
  canReserve(instr:MipsInstruction, nextStage:string) {
    return instr.executionPhase == 'decode' &&
      this.stationsInUse < this.stations;
  }
  reserve(instr:MipsInstruction) {
    instr.executionPhase = rs_name;
    this.stationsInUse++;
  }
  unreserve() {
    this.stationsInUse--;
  }
  use(instr: MipsInstruction) {
    if (this.currentUsers.indexOf(instr) == -1)
      this.currentUsers.push(instr);
  }
  canUse(instr: MipsInstruction, parallelAllowed: boolean) {
    if (!parallelAllowed)
      return this.currentUsers.length == 0 || this.currentUsers[0] == instr;
    return this.currentUsers.length < this.units || this.currentUsers.indexOf(instr) != -1;
  }
  free(instr: MipsInstruction) {
    remove(this.currentUsers, i => i == instr);
  }
}

enum DependencyType {
  None = 0,
  WriteAfterWrite,
  WriteAfterRead,
  ReadAfterWrite
}

function depTypeShort(type: DependencyType) {
  switch (type) {
    case DependencyType.None:
      return 'None';
    case DependencyType.ReadAfterWrite:
      return 'RAW';
    case DependencyType.WriteAfterWrite:
      return 'WAW';
    case DependencyType.WriteAfterRead:
      return 'WAR';
  }
}

class ScoreboardDep {
  constructor(public line: DiagramLine, public type: DependencyType) { }
}


export class DiagramLine {
  id: string;
  forwards: {};
  stages: Array<string>;
  scoreboardDeps: Array<ScoreboardDep>;
  dependencies: Array<DiagramLine>;
  constructor(public instr: MipsInstruction, public lineNumber: number) {
    this.id = instr.source;
    this.stages = [];
    this.dependencies = [];
    this.scoreboardDeps = [];
    this.forwards = {};
  }
  dependencyString(): string {
    if (this.scoreboardDeps.length != 0)
      return this.scoreboardDeps.map(sd => sd.line.lineNumber).join(', ');
    return this.dependencies.map(d => d.lineNumber).join(", ");
  }
}

interface Set {
  [key: string]: boolean;
}

interface InstructionHash {
  [key: string]: MipsInstruction;
}

interface ConfigHash {
  [key: string]: InstructionConfig;
}

function isExe(stage: string) {
  if (stage === undefined) {
    return false;
  }
  return stage.indexOf('exe') != -1
}

export enum PipeAlgorithm {
  InOrder = 1,
  Tomasulo = 2,
  Scoreboarding = 3
}

@Injectable()
export class Pipeline {
  registers: InstructionHash;
  stages: InstructionHash;
  algorithm: PipeAlgorithm;
  functionalUnits: Array<FunctionalUnit>;
  instructionConfigurations: Array<InstructionConfig>
  configLookup: ConfigHash;
  remainingTime: Array<number>;
  doneWriteback: Array<boolean>;

  constructor(public mipsService: MipsService) {
    this.registers = {};
    this.stages = {};
    this.remainingTime = [];
    this.doneWriteback = [];
    this.forwarding = false;
    this.algorithm = PipeAlgorithm.InOrder;
    this.functionalUnits = [
      new FunctionalUnit('arithmetic', 1, 5, 3, false),
      new FunctionalUnit('add', 2, 5, 3, false),
      new FunctionalUnit('mult', 5, 5, 3, false)
    ];
    this.instructionConfigurations = mipsService.instructions.map((instr) => {
      let unit = this.functionalUnits[0];
      if (instr.indexOf('add') != -1)
        unit = this.functionalUnits[1];
      if (instr.indexOf('mult') != -1)
        unit = this.functionalUnits[2];
      return new InstructionConfig(instr, unit, MEM_INSTRUCITONS[instr] || false);
    });
    this.configLookup = {};
    this.instructionConfigurations.forEach(c => {
      this.configLookup[c.instruction] = c;
    });
  }

  analyzeScoreboardDeps(lines: Array<DiagramLine>) {
    for (let i = 0; i < lines.length - 1; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        let lineAfter = lines[j];
        let lineBefore = lines[i]
        let before = lineBefore.instr;
        let after = lineAfter.instr;
        //WAW
        if (before.returnRegister == after.returnRegister) {
          lineAfter.scoreboardDeps.push(new ScoreboardDep(lineBefore, DependencyType.WriteAfterWrite));
        }
        //WAR
        if (before.register1 == after.returnRegister || before.register2 == after.returnRegister) {
          lineAfter.scoreboardDeps.push(new ScoreboardDep(lineBefore, DependencyType.WriteAfterRead));
        }
        //RAW
        if (before.returnRegister == after.register1 || before.returnRegister == after.register2) {
          lineAfter.scoreboardDeps.push(new ScoreboardDep(lineBefore, DependencyType.ReadAfterWrite));
        }
      }
    }
  }

  clean() {
    this.registers = {};
    this.stages = {};
  }

  lastExe(instr: MipsInstruction) {
    return isExe(instr.executionPhase) && instr.executionSubphase >= this.instrConfig.functionalUnit.executeLength - 1;
  }

  getNextPhase(instr: MipsInstruction): string {
    let stages = this.instrStages;
    let index = stages.indexOf(instr.executionPhase);
    if (instr.executionPhase == rs_name) {
      return stages.find(isExe);
    }
    if (instr.executionPhase == ro_name) {
      return 'write';
    }
    if (index == -1) return stages[0];
    else if (index == stages.length - 1) return 'done';
    if (this.lastExe(instr)) {
      return stages[index + this.instrConfig.functionalUnit.executeLength];
    }
    return stages[index + 1];
  }

  getConfig(instr: MipsInstruction) {
    return this.configLookup[instr.instruction];
  }

  private instrConfig: InstructionConfig;
  private instrStages: Array<string>;
  execute(line: DiagramLine): string {
    let fu =  this.getConfig(line.instr).functionalUnit;
    this.instrConfig = this.getConfig(line.instr)
    this.instrStages = this.instrConfig.resolve();
    
    let failCode = this.cannotExecute(line);
    if (failCode && this.algorithm == PipeAlgorithm.Tomasulo) {
      if (fu.canReserve(line.instr, this.getNextPhase(line.instr))) {
        this.stages[line.instr.executionPhase] = undefined;
        fu.reserve(line.instr);
        return failCode.replace('decode', rs_name);
      }
    }
    if (failCode) {
      return failCode;
    }
    this.remainingTime[line.lineNumber] = this.instrConfig.remainingInstructions(line.instr);
    this.doneWriteback[line.lineNumber] = line.instr.executionPhase === 'write';
    return this.advanceExecution(line.instr);
  }

  private advanceExecution(instr: MipsInstruction): string {
    let nextStage = this.getNextPhase(instr);
    if (isExe(instr.executionPhase)) {
      instr.executionSubphase++;
    }
    if (instr.executionPhase === rs_name) {
      this.getConfig(instr).functionalUnit.unreserve();
    }
    this.markHardware(instr, nextStage);
    instr.executionPhase = nextStage;
    return nextStage;
  }

  private markHardware(instr: MipsInstruction, nextStage: string) {
    if (nextStage != 'done') {
      this.stages[nextStage] = instr;
    }
    if (!isExe(nextStage)) {
      this.instrConfig.functionalUnit.free(instr);
    } else {
      this.instrConfig.functionalUnit.use(instr);
    }
    this.stages[instr.executionPhase] = undefined;
  }

  multipleExecutionAllowed(): boolean {
    return this.algorithm != PipeAlgorithm.InOrder;
  }

  private hasStructuralHazard(nextStage: string, instr: MipsInstruction): boolean {
    let fu = this.getConfig(instr).functionalUnit;
    if (isExe(nextStage)) {
      if (this.multipleExecutionAllowed()) {
        return this.getConfig(instr).functionalUnit.canUse(instr, true);
      } else if (!fu.isPipelined)
        return this.getConfig(instr).functionalUnit.canUse(instr, false);
    }
    return (this.stages[nextStage] == instr) || (this.stages[nextStage] == undefined);
  }

  forwarding: boolean;
  private hasDataHazard(nextStage: string, line: DiagramLine): boolean {
    // check if we are at the stage where we need our source registers to be available
    if (!this.instrConfig.needsData(line.instr, this.getNextPhase(line.instr)))
      return true;
    let potentialForwards = [];
    for (let i = 0; i < line.dependencies.length; i++) {
      let dep = line.dependencies[i];
      let config = this.getConfig(dep.instr);
      if (config.isDone(dep.instr)) {
        continue;
      } else if (this.hasForwarding() && config.resultIsReady(dep.instr)) {
        potentialForwards.push([line.forwards, line.stages.length]);
        potentialForwards.push([dep.forwards, lastIndexOf(dep.stages, dep.instr.executionPhase)]);
        continue;
      }
      return false;
    }
    // Commit forwards
    potentialForwards.forEach(f => {
      f[0][f[1]] = true;
    });
    return true;
  }

  stallInOrder(line: DiagramLine): boolean {
    if (line.lineNumber == 0 || line.instr.executionPhase != 'decode')
      return false;
    let prevTime = this.remainingTime[line.lineNumber - 1];
    return this.instrConfig.remainingInstructions(line.instr) <= prevTime;
  }

  stallReOrder(line:DiagramLine):boolean {
    let next = this.getNextPhase(line.instr);
    let prevDone = this.doneWriteback[line.lineNumber - 1] || line.lineNumber === 1;
    if  (next == 'write' && !prevDone) {
      this.instrConfig.functionalUnit.free(line.instr);
      this.stages[line.instr.executionPhase] = undefined;
      line.instr.executionPhase = ro_name;
      return true;
    } 
    return false;
  }

  hasForwarding() {
    return this.forwarding || this.algorithm == PipeAlgorithm.Tomasulo;
  }

  readyForScoreboard(dep: DiagramLine, curr: DiagramLine) {
    let done = this.getConfig(dep.instr).isDone(dep.instr);
    if (this.hasForwarding()) {
      return done || this.getConfig(dep.instr).resultIsReady(dep.instr)
    }
    return done && dep.stages.indexOf('write') < curr.stages.length - 1
  }

  stallForScoreboard(nextStage: string, line: DiagramLine): DependencyType {
    if (!isExe(nextStage))
      return DependencyType.None;
    for (let i = 0; i < line.scoreboardDeps.length; i++) {
      let dep = line.scoreboardDeps[i].line.instr;
      let type = line.scoreboardDeps[i].type;

      if (type != DependencyType.WriteAfterRead && !this.readyForScoreboard(line.scoreboardDeps[i].line, line)) {
        return line.scoreboardDeps[i].type;
      }
      if (type == DependencyType.WriteAfterRead && nextStage == 'write') {
        return line.scoreboardDeps[i].type;
      }
    }
    return DependencyType.None;
  }

  cannotExecute(line: DiagramLine): string {
    let nextStage = this.getNextPhase(line.instr);
    if (this.algorithm == PipeAlgorithm.Tomasulo && this.stallReOrder(line))
      return `stall-RO (${line.instr.executionPhase})`; // Stall in reorder buffer for in order writeback
    if (!this.hasStructuralHazard(nextStage, line.instr))
      return `stall-SH (${line.instr.executionPhase})`; // Stall for structural hazard
    if (this.algorithm == PipeAlgorithm.InOrder && this.stallInOrder(line))
      return `stall-II (${line.instr.executionPhase})`; // Stall for in order execution
    if (this.algorithm == PipeAlgorithm.Scoreboarding) {
      let type = this.stallForScoreboard(nextStage, line);
      if (type != DependencyType.None)
        return `stall-${depTypeShort(type)} (${line.instr.executionPhase})`; // Stall for scoreboard WAW, WAR or RAW
    }
    
    if (!this.hasDataHazard(nextStage, line))
      return `stall-DH (${line.instr.executionPhase})`; // Stall for data hazard
     
    return undefined;
  }
}
