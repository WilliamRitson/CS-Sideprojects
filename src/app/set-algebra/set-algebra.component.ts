import { AlgebraicSet } from './set';
import { Component, OnInit } from '@angular/core';
import { Scanner, Token } from './set-scanner';
import { Parser } from './set-parser';
import { SetTreeExpr } from './set-expr';
import { SetMembershipTable } from './set-membership-table';

import { HelpService } from '../help.service';

import { Router, ActivatedRoute, Params } from '@angular/router';



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

  constructor(private route: ActivatedRoute, private help: HelpService) {
    this.sources = [
      route.snapshot.params['expr1'] || '(A union B)^C',
      route.snapshot.params['expr2'] || 'A^C intersection B^C'
    ];
    this.smts = [new SetMembershipTable(), new SetMembershipTable()];
    this.scanner = new Scanner();
    this.parser = new Parser();

    route.data.subscribe(data => {
      help.setHelpUrl(data['helpUrl']);
    })
    route.params.subscribe(params => {
      this.sources[0] = params['expr1'] || this.sources[0];
      this.sources[1] = params['expr2'] || this.sources[1];
      this.run();
    })
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
