import { AlgebraicSet } from './set';
import { SetTreeExpr } from './set-expr';

export class SetMembershipTable {
    public header: Array<string>
    public data: Array<Array<boolean>>;
    private bitstring: string;

    private pad(n: string, width: number, padding: string = '0'): string {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
    }

    private genValues(curr: number, len: number): Array<boolean> {
        return this.pad((curr).toString(2), len).split('').map(char => char == '1')
    }

    public makeVarTable(expr: SetTreeExpr) {
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

    public isSame(other: SetMembershipTable): boolean {
        return this.bitstring === other.bitstring;
    }

    public compare(other: SetMembershipTable): Array<number> {
        let diffs = [];
        console.log('comp', this.bitstring, other.bitstring);
        for (let i = 0; i < Math.min(this.bitstring.length, other.bitstring.length); i++) {
            if (this.bitstring[i] != other.bitstring[i])
                diffs.push(i + 1);
        }
        return diffs;
    }

    private buildHeader(exprs: SetTreeExpr[], lexical: Array<string>) {
        this.header = [];

        lexical.forEach((val) => {
            this.header.push(val);
        });
        for (let expr of exprs) {
            this.header.push(expr.toString());
        }

    }

    public build(expr: SetTreeExpr, vars: Map<string, AlgebraicSet>) {
        let exprs = this.getSubexpressions(expr);
        let lexical = Array.from(vars.keys()).sort();

        this.buildHeader(exprs, lexical);

        let universalSet = new AlgebraicSet();

        this.bitstring = '';

        this.data = [];
        let combos = Math.pow(2, vars.size);
        for (let i = 0; i < combos; i++) {
            let boolVals = this.genValues(i, vars.size);
            let j = 0;

            universalSet.add(i);
            lexical.forEach(id => {
                if (boolVals[j])
                    vars.get(id).add(i);
                j++;
            })

            for (let expr of exprs) {
                boolVals.push(expr.evaluate(vars, universalSet).has(i));
            }

            this.bitstring += expr.evaluate(vars, universalSet).has(i) ? '1' : '0';
            this.data.push(boolVals);
        }
    }
}