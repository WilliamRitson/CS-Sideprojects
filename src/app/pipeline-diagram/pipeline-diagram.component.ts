import { Component, OnInit } from '@angular/core';
import { MipsService, MipsInstruction } from '../mips.service';

let pgrm =
  ` addi $s0, $0, 10
  sll $s1, $0, 30
  srl $s2, $s0, 31
  `;

class DiagramLine {
  constructor(public instr: MipsInstruction) {
    this.id = instr.source;
    this.stages = [];
  }
  id: string;
  stages: Array<string>;
}

interface Set {
  [key: string]: boolean;
}

interface StageHash {
  [key: string]: MipsInstruction;
}

const STAGE_ORDER = ['fetch', 'decode', 'execute', 'exe2', 'exe3', 'exe4', 'write'];
class Pipeline {
  stages: StageHash
  registers: StageHash;
  constructor() {
    this.registers = {};
    this.stages = {};
  }

  getNextPhase(currentStage: string): string {
    let index = STAGE_ORDER.indexOf(currentStage);
    if (index == -1) return STAGE_ORDER[0];
    else if (index == STAGE_ORDER.length - 1) return 'done';
    return STAGE_ORDER[index + 1];
  }
  execute(inst: MipsInstruction): string {
    if (!this.canExcute(inst)) {
      return 'stall';
    }
    let nextStage = this.getNextPhase(inst.executionPhase);

    // Mark hardware in use
    if (nextStage != 'done') {
      this.stages[nextStage] = inst;
    }

    this.stages[inst.executionPhase] = undefined;


    // Mark register dependencies
    if (nextStage == 'fetch') {
      this.registers[inst.returnRegister] = inst;
    } else if (nextStage == 'done') {
      this.registers[inst.returnRegister] = undefined;
    }

    inst.executionPhase = nextStage;
    return nextStage;
  }

  canExcute(inst: MipsInstruction) {
    let nextStage = this.getNextPhase(inst.executionPhase);
    let canUseStage = (this.stages[nextStage] == inst) || (this.stages[nextStage] == undefined);
    let canUseRegister = !(this.registers[inst.register1] || this.registers[inst.register2]);

    if (nextStage == 'execute') {
      return canUseRegister && canUseStage;
    }
    return canUseStage;
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

  constructor(public mipsService: MipsService) {
    this.lines = [];
  }

  getProgram: () => string;
  lines: Array<DiagramLine>;

  recompile() {
    let source = pgrm;//this.getProgram();
    let mips = this.mipsService.parseProgram(source);
    let lines = mips.map(inst => new DiagramLine(inst));
    this.lines = this.executeCode(new Pipeline(), lines);
  }

  getStages(): Array<string> {
    if (this.lines.length >= 1)
      return this.lines[0].stages;
    return [];
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

        let code = pipe.execute(lines[i].instr);
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
