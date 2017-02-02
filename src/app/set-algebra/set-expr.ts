import { tokenize } from '@angular/compiler/src/ml_parser/lexer';
import { GroupedObservable } from 'angular2-google-chart/node_modules/rxjs/operator/groupBy';
import { AlgebraicSet } from './set';
import { Token } from './set-scanner';

type Context = Map<string, AlgebraicSet>;

const universalSetId = 'Ω';

export interface SetTreeExpr {
    evaluate(context: Context): AlgebraicSet;
    toString(): string;
    getVariables(): Array<Token>;
}

export interface SetExprNewable {
    new (token: Token, op1: SetTreeExpr, op2: SetTreeExpr): SetTreeExpr;
}

export class ParenSetExpr implements SetTreeExpr {
    constructor(token: Token, private grouped: SetTreeExpr, op2: SetTreeExpr) { }

    evaluate(context: Context) {
        return this.grouped.evaluate(context);
    }

    toString(): string {
        return `(${this.grouped.toString()})`
    }

    getVariables() {
        return this.grouped.getVariables();
    }
}

export class UnionSetExpr implements SetTreeExpr {
    constructor(token: Token, private op1: SetTreeExpr, private op2: SetTreeExpr) { }

    evaluate(context: Context) {
        return this.op1.evaluate(context).union(this.op2.evaluate(context));
    }

    toString(): string {
        return `${this.op1.toString()} ∪ ${this.op2.toString()}`
    }

    getVariables() {
        return this.op1.getVariables().concat(this.op2.getVariables());
    }
}

export class IntersectionSetExpr implements SetTreeExpr {
    constructor(token: Token, private op1: SetTreeExpr, private op2: SetTreeExpr) { }

    evaluate(context: Context) {
        return this.op1.evaluate(context).intersection(this.op2.evaluate(context));
    }

    toString(): string {
        return `${this.op1.toString()} ∩ ${this.op2.toString()}`
    }

    getVariables() {
        return this.op1.getVariables().concat(this.op2.getVariables());
    }
}

export class DifferenceSetExpr implements SetTreeExpr {
    constructor(token: Token, private op1: SetTreeExpr, private op2: SetTreeExpr) { }

    evaluate(context: Context) {
        return this.op1.evaluate(context).difference(this.op2.evaluate(context));
    }

    toString(): string {
        return `${this.op1.toString()} - ${this.op2.toString()}`
    }

    getVariables() {
        return this.op1.getVariables().concat(this.op2.getVariables());
    }
}

export class VariableSetExpr implements SetTreeExpr {
    constructor(private token: Token, op1: SetTreeExpr, op2: SetTreeExpr) { }

    evaluate(context: Context) {
        return context.get(this.token.identifier).copy();
    }

    toString(): string {
        return this.token.identifier;
    }

    getVariables() {
        return [this.token];
    }
}

export class ComplementSetExpr implements SetTreeExpr {
    constructor(token: Token, private op: SetTreeExpr, op2: SetTreeExpr) { }

    evaluate(context: Context) {
        return context.get(universalSetId).difference(this.op.evaluate(context));
    }

    toString(): string {
        return `${this.op.toString()}^∁`;
    }

    getVariables() {
        return this.op.getVariables();
    }
}
