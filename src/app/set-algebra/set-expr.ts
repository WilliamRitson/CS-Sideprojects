import { tokenize } from '@angular/compiler/src/ml_parser/lexer';
import { AlgebraicSet } from './set';
import { Token } from './set-scanner';

type Context = Map<string, AlgebraicSet>;

export interface SetTreeExpr {
    evaluate(context: Context, universal:AlgebraicSet): AlgebraicSet;
    toString(): string;
    getVariables(): Array<Token>;
    getSubexpressions(): Array<SetTreeExpr>;
}

export interface SetExprNewable {
    new (token: Token, op1: SetTreeExpr, op2: SetTreeExpr): SetTreeExpr;
}

export class ParenSetExpr implements SetTreeExpr {
    constructor(token: Token, private grouped: SetTreeExpr, op2: SetTreeExpr) { }

    evaluate(context: Context, universal:AlgebraicSet) {
        return this.grouped.evaluate(context, universal);
    }

    toString(): string {
        return `(${this.grouped.toString()})`
    }

    getVariables() {
        return this.grouped.getVariables();
    }

    getSubexpressions(): Array<SetTreeExpr> {
        return this.grouped.getSubexpressions();
    }
}

export class UnionSetExpr implements SetTreeExpr {
    constructor(token: Token, private op1: SetTreeExpr, private op2: SetTreeExpr) { }

    evaluate(context: Context, universal:AlgebraicSet) {
        return this.op1.evaluate(context, universal).union(this.op2.evaluate(context, universal));
    }

    toString(): string {
        return `${this.op1.toString()} ∪ ${this.op2.toString()}`
    }

    getVariables() {
        return this.op1.getVariables().concat(this.op2.getVariables());
    }

    getSubexpressions(): Array<SetTreeExpr> {
        return [this as SetTreeExpr]
            .concat(this.op1.getSubexpressions())
            .concat(this.op2.getSubexpressions());
    }
}

export class IntersectionSetExpr implements SetTreeExpr {
    constructor(token: Token, private op1: SetTreeExpr, private op2: SetTreeExpr) { }

    evaluate(context: Context, universal:AlgebraicSet) {
        return this.op1.evaluate(context, universal).intersection(this.op2.evaluate(context, universal));
    }

    toString(): string {
        return `${this.op1.toString()} ∩ ${this.op2.toString()}`
    }

    getVariables() {
        return this.op1.getVariables().concat(this.op2.getVariables());
    }

    getSubexpressions(): Array<SetTreeExpr> {
        return [this as SetTreeExpr]
            .concat(this.op1.getSubexpressions())
            .concat(this.op2.getSubexpressions());
    }
}

export class DifferenceSetExpr implements SetTreeExpr {
    constructor(token: Token, private op1: SetTreeExpr, private op2: SetTreeExpr) { }

    evaluate(context: Context, universal:AlgebraicSet) {
        return this.op1.evaluate(context, universal).difference(this.op2.evaluate(context, universal));
    }

    toString(): string {
        return `${this.op1.toString()} - ${this.op2.toString()}`
    }

    getVariables() {
        return this.op1.getVariables().concat(this.op2.getVariables());
    }

    getSubexpressions(): Array<SetTreeExpr> {
        return [this as SetTreeExpr]
            .concat(this.op1.getSubexpressions())
            .concat(this.op2.getSubexpressions());
    }
}

export class VariableSetExpr implements SetTreeExpr {
    constructor(private token: Token, op1: SetTreeExpr, op2: SetTreeExpr) { }

    evaluate(context: Context, universal:AlgebraicSet) {
        return context.get(this.token.identifier).copy();
    }

    toString(): string {
        return this.token.identifier;
    }

    getVariables() {
        return [this.token];
    }

    getSubexpressions(): Array<SetTreeExpr> {
        return [];
    }
}

export class UniversalSetExpr implements SetTreeExpr {
    constructor(private token: Token, op1: SetTreeExpr, op2: SetTreeExpr) { }

    evaluate(context: Context, universal:AlgebraicSet) {
        return universal;
    }

    toString(): string {
        return '𝕌';
    }

    getVariables() {
        return [];
    }

    getSubexpressions(): Array<SetTreeExpr> {
        return [];
    }
}


const emptySet = new AlgebraicSet();
export class EmptySetExpr implements SetTreeExpr {
    constructor(private token: Token, op1: SetTreeExpr, op2: SetTreeExpr) { }

    evaluate(context: Context, universal:AlgebraicSet) {
        return emptySet
    }

    toString(): string {
        return '∅';
    }

    getVariables() {
        return [];
    }

    getSubexpressions(): Array<SetTreeExpr> {
        return [];
    }
}

export class ComplementSetExpr implements SetTreeExpr {
    constructor(token: Token, private op: SetTreeExpr, op2: SetTreeExpr) { }

    evaluate(context: Context, universal:AlgebraicSet) {
        return universal.difference(this.op.evaluate(context, universal));
    }

    toString(): string {
        return `${this.op.toString()}<sup>∁</sup>`;
    }

    getVariables() {
        return this.op.getVariables();
    }

    getSubexpressions(): Array<SetTreeExpr> {
        return [this as SetTreeExpr].concat(this.op.getSubexpressions());
    }
}
