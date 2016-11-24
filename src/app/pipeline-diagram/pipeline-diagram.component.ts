import { Component, OnInit } from '@angular/core';
import { MipsService, MipsInstruction } from '../mips.service';
import { DiagramLine, Pipeline, PipeAlgorithm } from '../pipeline.service';

let otherProg = `mult r3, r1, r2
add r5, r4, r3
add r6, r4, r1
mult r7, r8, r9
add r4, r3, r7
mult r10, r5, r6
j l1`;

@Component({
  selector: 'app-pipeline-diagram',
  templateUrl: './pipeline-diagram.component.html',
  styleUrls: ['./pipeline-diagram.component.css'],
  inputs: ['getProgram'],
  providers: [Pipeline]
})
export class PipelineDiagramComponent implements OnInit {
  program: string;
  mips: Array<MipsInstruction>;
  lines: Array<DiagramLine>;

  constructor(public mipsService: MipsService, public pipeline: Pipeline) {
    this.program = otherProg; /*
     `lw r3, r2
mult r4, r3, r3
mult r3, r3, r1
addiu r0, r0, 1
div r3, r4, r3
sw r3, r2
addiu r2, r2, 4
bne r0, r1, -8`; */
    this.lines = [];
    this.pipeline.algorithm = PipeAlgorithm.InOrder;
    this.algorithms = PipeAlgorithm;
  }

  algorithms: Object;
  setAlgorithm(newVal: number) {
    let val = PipeAlgorithm[newVal];
    switch (val) {
      case 'InOrder':
        this.pipeline.algorithm = PipeAlgorithm.InOrder;
        break;
      case 'Scoreboarding':
        this.pipeline.algorithm = PipeAlgorithm.Scoreboarding;
        break;
      case 'Tomasulo':
        this.pipeline.algorithm = PipeAlgorithm.Tomasulo;
        break;

    }

  }

  iter(obj: Object): Array<[string, any]> {
    let arr = [];
    for (let prop in obj) {
      arr.push([prop, obj[prop]]);
    }
    return arr;
  }

  init() {
    this.mips = this.mipsService.parseProgram(this.program);
    this.lines = this.mips.map((inst, n) => new DiagramLine(inst, n + 1));
    this.findDependencies(this.lines);
    if (this.pipeline.algorithm == PipeAlgorithm.Scoreboarding)
      this.pipeline.analyzeScorboardDeps(this.lines);
  }

  recompile() {
    this.init();
    this.lines = this.executeCode(this.lines);
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

  runCycle() {
    if (this.lines.length == 0) {
      this.init();
    }
    this.executeCycle(this.lines);
  }

  getStages(): Array<string> {
    if (this.lines.length >= 1)
      return this.lines[0].stages;
    return [];
  }

  executeCycle(lines: Array<DiagramLine>) {
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].instr.executionPhase == 'done') {
        lines[i].stages.push('')
        continue;
      }
      let code = this.pipeline.execute(lines[i]);
      if (lines[i].instr.executionPhase != undefined && code != 'done')
        lines[i].stages.push(code);
      else lines[i].stages.push('');
    }
  }

  executeCode(lines: Array<DiagramLine>): Array<DiagramLine> {
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
        let code = this.pipeline.execute(lines[i]);
        if (lines[i].instr.executionPhase != undefined && code != 'done')
          lines[i].stages.push(code);
        else lines[i].stages.push('');
        if (code != 'done')
          unfinshed = true;
      }
    }
    return lines;
  }

  ngOnInit() { }

}
