import { Injectable } from '@angular/core';

const J_TYPE = [
  'j', 'jal'
];
const R_TYPE = [
  'add', 'addu', 'and',
  'addu', 'and', 'div',
  'divu', 'jr', 'mfhi',
  'mflo', 'mfc0', 'mult',
  'multu', 'nor', 'xor',
  'or', 'slt', 'sltu',
  'sll', 'srl', 'sra',
  'sub', 'subu'
];
const I_TYPE = [
  'addi', 'addiu', 'andi',
  'beq', 'bne', 'lbu',
  'lhu', 'lui', 'lw',
  'ori', 'lw', 'ori',
  'sb', 'sh', 'slti',
  'sltiu', 'sw'
];
const TYPE_LOOKUP = {};
function addToLookup(type:string, names:Array<string>) {
  names.forEach(name => {
    TYPE_LOOKUP[name] = type;
  });
}
addToLookup('J', J_TYPE);
addToLookup('R', R_TYPE);
addToLookup('I', I_TYPE);
console.log(TYPE_LOOKUP);

const comment = /#.+/g;
const registerOrImmediate = /\$?[0-9]+/g;

@Injectable()
export class MipsService {

  constructor() { }

  private parseLine(line:string) {

  }

  parseProgram(source:string):Array<MipsInstruction> {
    let lines = source.split("\n");
    let result = Array<MipsInstruction>();

    for (let i = 0; i<= lines.length; i++) {
      try {
        result.push(new MipsInstruction(lines[i]));
      } catch (error) {
        
      }
    }
    return result;

  }

}

// addi $s1, S4, 3
export class MipsInstruction {
  type: string;
  instruction: string;
  returnRegister: string;
  register1: string;
  register2: string;
  immediate: string;
  executionPhase: string;
  source: string;

  constructor(source: string) {
    this.source = source.replace(comment, '');
    this.read(source);
  }

  read(source: string) {
    // Remove comments
    source = source.replace(comment, '');
    // Tokenize
    let tokens = source.trim().split(/\s*,\s*|\s+/);
    console.log(source, 'tokens', tokens);
    // Get the instruction
    this.instruction = tokens[0];
    if (TYPE_LOOKUP[this.instruction] == undefined) {
      throw new Error('Cannot read MIPS instruction ' + this.instruction);
    }

    // Get it's type
    this.type = TYPE_LOOKUP[this.instruction];

    switch(this.type) {
      case 'I':
        this.returnRegister = tokens[1];
        this.register1 = tokens[2];
        this.immediate = tokens[3];
      break;
      case 'R':
        this.returnRegister = tokens[1];
        this.register1 = tokens[2];
        this.register2 = tokens[3];
      break;
      case 'J':
        this.immediate = tokens[2];
      break;
    }

  }
}
