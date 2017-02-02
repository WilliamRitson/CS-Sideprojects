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
    this.source = '(B ∩ C) ∩ (B ∩ K) ';

    this.scanner = new Scanner();
    this.parser = new Parser();
    this.smt = new SetMembershipTable();
  }


  makeVarTable(expr: SetTreeExpr) {
    let vars = expr.getVariables();
    let table = new Map<string, AlgebraicSet>();
    vars.forEach((exprVar) => {
      table.set(exprVar.identifier, new AlgebraicSet());
    })
    return table;
  }

  run() {
    this.tokens = this.scanner.tokenize(this.source);
    this.expr = this.parser.parse(this.source);
    this.parsedString = this.expr.toString();
    this.smt.build(this.expr, this.makeVarTable(this.expr));
  }

  ngOnInit() {
    this.run();
  }

}
