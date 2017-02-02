import { AlgebraicSet } from './set';
import { SetTreeExpr } from './set-expr';

export class SetMembershipTable {
    public header: Array<string>
    public data: Array<Array<boolean>>;

    private pad(n: string, width: number, padding: string = '0'): string {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
    }

    private genValues(curr: number, len: number): Array<boolean> {
        return this.pad((curr).toString(2), len).split('').map(char => char == '1')
    }

    private makeVarTable(expr: SetTreeExpr) {
        let vars = expr.getVariables();
        let table = new Map<string, AlgebraicSet>();
        vars.forEach((exprVar) => {
            table.set(exprVar.identifier, new AlgebraicSet());
        })
        return table;
    }

    private getSubexpressions(expr: SetTreeExpr): Array<SetTreeExpr> {
        return expr.getSubexpressions().reverse();
    }

    private buildHeader(exprs: SetTreeExpr[], vars: Map<string, AlgebraicSet>) {
        this.header = [];
        vars.forEach((val, id) => {
            this.header.push(id);
        });
        for (let expr of exprs) {
            this.header.push(expr.toString());
        }

    }

    public build(expr: SetTreeExpr, vars: Map<string, AlgebraicSet>) {
        let exprs = this.getSubexpressions(expr);
        this.buildHeader(exprs, vars);

        this.data = [];
        let combos = Math.pow(2, vars.size);
        for (let i = 0; i < combos; i++) {
            let boolVals = this.genValues(i, vars.size);
            let j = 0;

            vars.forEach(val => {
                if (boolVals[j])
                    val.add(i);
                j++;
            })

            for (let expr of exprs) {
                boolVals.push(expr.evaluate(vars).has(i));
            }
            this.data.push(boolVals);
        }
    }
}