import { AlgebraicSet } from './set';
import { Component, OnInit } from '@angular/core';
import { Scanner, Token } from './set-scanner';
import { Parser } from './set-parser';
import { SetTreeExpr } from './set-expr';
import { SetMembershipTable } from './set-membership-table';


@Component({
  selector: 'app-set-algebra',
  templateUrl: './set-algebra.component.html',
  styleUrls: ['./set-algebra.component.scss']
})
export class SetAlgebraComponent implements OnInit {
  scanner: Scanner;
  parser: Parser;

  sources: Array<string>;
  exprs: Array<SetTreeExpr>;
  smts: Array<SetMembershipTable>;

  constructor() {
    this.sources = ['(A union B)^C', 'A^C intersection B^C'];
    this.smts = [new SetMembershipTable(), new SetMembershipTable()];

    this.scanner = new Scanner();
    this.parser = new Parser();    
  }

  run() {
    for (let i = 0; i < this.sources.length; i++) {
      let source = this.sources[i];
      let tokens = this.scanner.tokenize(source);
      let expr = this.parser.parse(source)
      this.smts[i].build(expr, this.smts[i].makeVarTable(expr));
    }
  }

  ngOnInit() {
    this.run();
  }

}
