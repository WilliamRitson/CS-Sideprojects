import { Component, OnInit } from '@angular/core';
import { MipsService, MipsInstruction } from '../mips.service';


class DiagramLine {
  constructor(public instr: MipsInstruction, public lineNumber: number) {
    this.id = instr.source;
    this.stages = [];
    this.dependencies = [];
  }
  id: string;
  stages: Array<string>;
  dependencies: Array<MipsInstruction>;
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

    // Mark register dependencies
    if (nextStage == 'execute') {
      this.registers[inst.returnRegister] = inst;
    } else if (nextStage == 'done') {
      this.registers[inst.returnRegister] = undefined;
    }

    inst.executionPhase = nextStage;
    return nextStage;
  }

  private hasStructuralHazard(nextStage: string, inst: MipsInstruction, config: InstrucitonConfig): boolean {
    return (this.stages[nextStage] == inst) || (this.stages[nextStage] == undefined);
  }
  forwarding: false;
  private hasDataHazard(nextStage: string, line: DiagramLine, config: InstrucitonConfig): boolean {
    for (let i = 0; i < line.dependencies.length; i++) {
      // There is no forwarding and the instruciton has not written back
      if (!this.forwarding && !config.isDone(line.dependencies[i])) {
        return false;
      }
      // There is forwarding, but the result is not ready
      else if (!config.resultIsReady(line.dependencies[i])) {
        return false;
      }
    }
    return true;
  }


  cannotExecute(line: DiagramLine, config: InstrucitonConfig):string {
    let nextStage = this.getNextPhase(line.instr.executionPhase, config.resolve());
    if (!this.hasStructuralHazard(nextStage, line.instr, config))
      return 'stl-S';
    if (this.hasDataHazard(nextStage, line, config))
      return 'stl-D';
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


class InstrucitonConfig {
  constructor(instr: string, hasMemory = false, executeLength = 1) {
    this.instruciton = instr;
    this.hasMemory = hasMemory;
    this.executeLength = executeLength;
    this.pointOfConsumption = "execute0";
    this.pointOfCompletion = "execute" + this.executeLength;
  }
  instruciton: string;
  hasMemory: boolean;
  executeLength: number;
  pointOfConsumption: string;
  pointOfCompletion: string;
  resolve(): Array<string> {
    let results = ['fetch', 'decode'];
    for (let i = 1; i <= this.executeLength; i++) {
      results.push('execute' + i);
    }
    if (this.hasMemory) results.push('memory');
    results.push('write');
    return results;
  }
  isDone(instr:MipsInstruction ):boolean {
    return instr.executionPhase == 'done';
  }
  // Returns true if the result can be forwarded
  resultIsReady(instr:MipsInstruction ):boolean {
    let stages = this.resolve();
    return stages.indexOf(instr.executionPhase) > stages.indexOf(this.pointOfCompletion);
  }
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

  constructor(public mipsService: MipsService) {
    this.lines = [];
    this.currentPipe = new Pipeline();
    this.configs = mipsService.instrucitons.map((instr) => {
      return new InstrucitonConfig(instr, MEM_INSTRUCITONS[instr] || false, LONG_INSTRUCITONS[instr] || 1);
    });
    this.configLookup = {};
    this.configs.forEach(c => {
      this.configs[c.instruciton] = c;
    });
  }
  getProgram: () => string;

  lines: Array<DiagramLine>;

  iter(obj: Object): Array<[string, any]> {
    let arr = [];
    for (let prop in obj) {
      arr.push([prop, obj[prop]]);
    }
    return arr;
  }

  recompile() {
    let source = this.getProgram();
    let mips = this.mipsService.parseProgram(source);
    this.lines = mips.map((inst, n) => new DiagramLine(inst, n));
    this.lines = this.executeCode(new Pipeline(), this.lines);
  }

  findDependencies(lines: Array<DiagramLine>) {
    for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < i; j++) {
        if (lines[j].instr.returnRegister == lines[i].instr.register1 || lines[j].instr.returnRegister == lines[i].instr.register2) {
          lines[i].dependencies.push(lines[j].instr);
        }
      }
    }
  }

  currentPipe: Pipeline;
  runCycle() {
    if (this.currentPipe == undefined)
      this.currentPipe = new Pipeline();
    if (this.lines.length == 0) {
      let source = this.getProgram();
      let mips = this.mipsService.parseProgram(source);
      this.lines = mips.map((inst, n) => new DiagramLine(inst, n));
      this.findDependencies(this.lines);
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
    while (unfinshed) {
      unfinshed = false;
      for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].instr.executionPhase == 'done') {
          lines[i].stages.push('')
          continue;
        }

        let code = pipe.execute(lines[i].instr, this.configLookup[lines[i].instr.instruction]);
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
