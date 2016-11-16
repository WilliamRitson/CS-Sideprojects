import { Component, OnInit } from '@angular/core';
import { MipsService, MipsInstruction } from '../mips.service';


class DiagramLine {
  constructor(public instr: MipsInstruction, public lineNumber: number, public config: InstrucitonConfig) {
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

interface StageHash {
  [key: string]: MipsInstruction;
}

class Pipeline {
  stages: StageHash
  registers: StageHash;
  constructor() {
    this.registers = {};
    this.stages = {};
    this.forwarding = false;
  }

  getNextPhase(currentStage: string, stages: Array<string>): string {
    let index = stages.indexOf(currentStage);
    if (index == -1) return stages[0];
    else if (index == stages.length - 1) return 'done';
    return stages[index + 1];
  }

  execute(line: DiagramLine, config: InstrucitonConfig): string {
    let stages = config.resolve();
    let inst = line.instr;
    var failCode = this.cannotExecute(line, config);
    if (failCode) {
      return failCode;
    }
    let nextStage = this.getNextPhase(inst.executionPhase, stages);

    // Mark hardware in use
    if (nextStage != 'done') {
      this.stages[nextStage] = inst;
    }
    this.stages[inst.executionPhase] = undefined;

    inst.executionPhase = nextStage;
    return nextStage;
  }

  private hasStructuralHazard(nextStage: string, inst: MipsInstruction, config: InstrucitonConfig): boolean {
    return (this.stages[nextStage] == inst) || (this.stages[nextStage] == undefined);
  }
  forwarding: boolean;
  private hasDataHazard(nextStage: string, line: DiagramLine, config: InstrucitonConfig): boolean {
    // check if we are at the stage where we need our soure registers to be avalible
    if (!config.needsData(line.instr))
      return true;

    let potentialForwards = [];
    for (let i = 0; i < line.dependencies.length; i++) {
      let dep = line.dependencies[i];
      if (dep.config.isDone(dep.instr)) {
        continue;
      } else if (this.forwarding && dep.config.resultIsReady(dep.instr)) {
        potentialForwards.push([line.forwards, line.config.nextPhase(line.instr.executionPhase)]);
        potentialForwards.push([dep.forwards, dep.instr.executionPhase]);
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
  cannotExecute(line: DiagramLine, config: InstrucitonConfig): string {
    let nextStage = this.getNextPhase(line.instr.executionPhase, config.resolve());
    if (!this.hasStructuralHazard(nextStage, line.instr, config))
      return `stall-SH (${line.instr.executionPhase})`; // Stall for structural hazard
    if (!this.hasDataHazard(nextStage, line, config))
      return `stall-DH (${line.instr.executionPhase})`; // Stall for data hazard
    return undefined;
  }
}

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
  constructor(instr: string, hasMemory = false, executeLength = 1) {
    this.instruciton = instr;
    this.hasMemory = hasMemory;
    this.executeLength = executeLength;
    this.functionalUnit = 'arithmetic';
    if (instr.indexOf('mult') != -1)
      this.functionalUnit = 'mult';
    if (instr.indexOf('add') != -1)
      this.functionalUnit = 'add';
    this.pointOfConsumption = S_POC[instr] || `execute-${this.functionalUnit}-${1}`;
    this.pointOfCompletion = S_POP[instr] || `execute-${this.functionalUnit}-${this.executeLength}`;
  }
  functionalUnit: string;
  instruciton: string;
  hasMemory: boolean;
  executeLength: number;
  pointOfConsumption: string;
  pointOfCompletion: string;
  resolve(): Array<string> {
    let results = ['fetch', 'decode'];
    for (let i = 1; i <= this.executeLength; i++) {
      results.push(`execute-${this.functionalUnit}-${i}`);
    }
    if (this.hasMemory) results.push('memory');
    results.push('write');
    return results;
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
    return this.stageIs(instr.executionPhase, this.pointOfCompletion, (a, b) => a > b);
  }
  // Returns true if we need the operands to have completed
  needsData(instr: MipsInstruction): boolean {
    return this.stageIs(instr.executionPhase, this.pointOfConsumption, (a, b) => a + 1 >= b);
  }
}

class FunctionalUnit {
  constructor(name, length, units, piped) {
    this.name = name;
    this.executeLength = length;
    this.units = units;
    this.isPipelined = piped;
  }
  name: string;
  isPipelined: boolean;
  executeLength: number;
  units: number;

}

@Component({
  selector: 'app-pipeline-diagram',
  templateUrl: './pipeline-diagram.component.html',
  styleUrls: ['./pipeline-diagram.component.css'],
  inputs: ['getProgram'],
  providers: [MipsService]
})
export class PipelineDiagramComponent implements OnInit {

  configs: Array<InstrucitonConfig>
  configLookup: {};

  functionalUnits: Array<FunctionalUnit>;

  constructor(public mipsService: MipsService) {
    this.program = `
      lw r3, r2
      mult r4, r3, r3
      mult r3, r3, r1
      addiu r0, r0, 1
      div r3, r4, r3
      sw r3, r2
      addiu r2, r2, 4
      bne r0, r1, -8`;
    this.lines = [];
    this.functionalUnits = [
      new FunctionalUnit('arithmetic', 1, 1, false),
      new FunctionalUnit('add', 2, 1, true),
      new FunctionalUnit('mult', 4, 1, false)
    ];
    this.currentPipe = new Pipeline();
    this.configs = mipsService.instrucitons.map((instr) => {
      return new InstrucitonConfig(instr, MEM_INSTRUCITONS[instr] || false, LONG_INSTRUCITONS[instr] || 1);
    });
    this.configLookup = {};
    this.configs.forEach(c => {
      this.configLookup[c.instruciton] = c;
    });
  }
  program: string;

  lines: Array<DiagramLine>;

  iter(obj: Object): Array<[string, any]> {
    let arr = [];
    for (let prop in obj) {
      arr.push([prop, obj[prop]]);
    }
    return arr;
  }

  mips: Array<MipsInstruction>;
  init() {
      this.mips = this.mipsService.parseProgram(this.program);
      this.lines = this.mips.map((inst, n) => new DiagramLine(inst, n + 1, this.configLookup[inst.instruction]));
      this.findDependencies(this.lines);
  }

  recompile() {
    this.init();
    this.lines = this.executeCode(this.currentPipe, this.lines);
  }

  findDependencies(lines: Array<DiagramLine>) {
    for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < i; j++) {
        if (lines[j].instr.returnRegister == lines[i].instr.register1 || lines[j].instr.returnRegister == lines[i].instr.register2) {
          lines[i].dependencies.push(lines[j]);
        }
      }
    }
  }

  currentPipe: Pipeline;
  runCycle() {
    if (this.currentPipe == undefined)
      this.currentPipe = new Pipeline();
    if (this.lines.length == 0) {
      this.init();
    }
    this.executeCycle(this.currentPipe, this.lines);
  }

  getStages(): Array<string> {
    if (this.lines.length >= 1)
      return this.lines[0].stages;
    return [];
  }

  executeCycle(pipe: Pipeline, lines: Array<DiagramLine>) {
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].instr.executionPhase == 'done') {
        lines[i].stages.push('')
        continue;
      }

      let code = pipe.execute(lines[i], this.configLookup[lines[i].instr.instruction]);
      if (lines[i].instr.executionPhase != undefined && code != 'done')
        lines[i].stages.push(code);
      else lines[i].stages.push('');
    }
  }

  executeCode(pipe: Pipeline, lines: Array<DiagramLine>): Array<DiagramLine> {
    let unfinshed: boolean = true;
    let limit = this.lines.length * 20;;
    while (unfinshed && limit > 0) {
      limit--;
      unfinshed = false;
      for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].instr.executionPhase == 'done') {
          lines[i].stages.push('')
          continue;
        }
        let code = pipe.execute(lines[i], this.configLookup[lines[i].instr.instruction]);
        if (lines[i].instr.executionPhase != undefined && code != 'done')
          lines[i].stages.push(code);
        else lines[i].stages.push('');
        if (code != 'done')
          unfinshed = true;
      }
    }
    return lines;
  }

  ngOnInit() {
  }

}
