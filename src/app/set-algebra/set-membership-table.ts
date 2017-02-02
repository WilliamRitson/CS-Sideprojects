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
        let subs = [];

        return subs;
    }

    public build(expr: SetTreeExpr, vars: Map<string, AlgebraicSet>) {
        this.header = [];
        vars.forEach((val, id) => {
            this.header.push(id);
        });
        this.header.push(expr.toString());

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

            let res = expr.evaluate(vars);
            boolVals.push(expr.evaluate(vars).has(i));
            this.data.push(boolVals);
        }
    }
}