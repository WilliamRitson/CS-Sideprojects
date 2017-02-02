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
  tokens: Array<Token>;
  source: string;
  expr: SetTreeExpr;
  parsedString: string;
  smt: SetMembershipTable;

  constructor() {
    this.source = '(B or K)! or M! ';

    this.scanner = new Scanner();
    this.parser = new Parser();
    this.smt = new SetMembershipTable();
  }


  run() {
    this.tokens = this.scanner.tokenize(this.source);
    console.log(this.tokens);
    this.expr = this.parser.parse(this.source);
    this.parsedString = this.expr.toString();
    this.smt.build(this.expr,  this.smt.makeVarTable(this.expr));
  }

  ngOnInit() {
    this.run();
  }

}
