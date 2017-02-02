import { contains } from 'typescript-collections/dist/lib/arrays';
export class AlgebraicSet {
    private values: Set<any>;

    constructor() {
        this.values = new Set<any>();
    }

    add(item:any) {
        this.values.add(item);
    }

    clear() {
        this.values.clear();
    }

    has(item):boolean {
        return this.values.has(item);
    }

    public copy(): AlgebraicSet {
        let copy = new AlgebraicSet();
        this.values.forEach(entry => {
            copy.values.add(entry);
        })
        return copy;
    }

    public union(other: AlgebraicSet): AlgebraicSet {
        let copy = this.copy();
        other.values.forEach(entry => {
            copy.values.add(entry);
        });
        return copy;
    }

    public intersection(other: AlgebraicSet): AlgebraicSet {
        let copy = this.copy();
        copy.values.forEach(entry => {
            if (!other.values.has(entry))
                copy.values.delete(entry);
        });
        return copy;
    }

    public complement(universalSet:AlgebraicSet): AlgebraicSet {
        return  universalSet.difference(this);
    }

    public difference(other: AlgebraicSet): AlgebraicSet {
        let copy = this.copy();
        other.values.forEach(entry => {
            if (copy.values.has(entry))
                copy.values.delete(entry);
        });
        return copy;
    }
}




