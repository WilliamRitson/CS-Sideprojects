
// All code adapted from https://llimllib.github.io/pymag-trees/

export class DrawableTree {
    constructor (public data, public children: Array<DrawableTree> = []) {

    }
}

export class DrawTree {
    x: number;
    y: number;
    tree: DrawableTree;
    parent: DrawTree;
    children: Array<DrawTree>
    offset: number;
    ancestor: DrawTree;
    shift: number;
    change: number;
    mod: number;
    thread: any;
    private lmost_sibling: DrawTree;
    number: number;

    constructor(tree: DrawableTree, parent: DrawTree = undefined, depth = 0, number = 0) {
        this.x = -1.
        this.y = depth
        this.tree = tree
        this.children = tree.children.map((child, i) =>
            new DrawTree(child, this, depth + 1, i + 1));

        this.parent = parent
        this.thread = undefined;
        this.offset = 0
        this.ancestor = this
        this.change = this.shift = 0
        this.lmost_sibling = undefined
        //this is the number of the node in its group of siblings 1..n
        this.number = number
    }

    left() {
        return this.thread || this.children.length && this.children[0]
    }

    right() {
        return this.thread || this.children.length && this.children[-1]
    }

    left_brother(): DrawTree {
        let n = undefined
        if (this.parent)
            for (let node of this.parent.children) {
                if (node == this) return n
                else n = node
            }
        return n
    }

    get_lmost_sibling() {
        if (!this.lmost_sibling && this.parent && this != this.parent.children[0]) {
            this.lmost_sibling = this.parent.children[0]
            return this.lmost_sibling
        }
    }


}


export function buchheim(tree) {
    let dt = firstwalk(tree)
    second_walk(dt)
    return dt
}

function firstwalk(v: DrawTree, distance = 1.) {
    if (v.children.length == 0) {
        if (v.get_lmost_sibling())
            v.x = v.left_brother().x + distance
        else
            v.x = 0.
    } else {
        let default_ancestor = v.children[0]
        for (let w of v.children) {
            firstwalk(w)
            default_ancestor = apportion(w, default_ancestor,
                distance)
        }

        execute_shifts(v)
        let midpoint = (v.children[0].x + v.children[-1].x) / 2

        let ell = v.children[0]
        let arr = v.children[-1]
        let w = v.left_brother()
        if (w) {
            v.x = w.x + distance
            v.mod = v.x - midpoint
        } else
            v.x = midpoint
    }
    return v
}

function apportion(v:DrawTree, default_ancestor, distance) {
    let w = v.left_brother()
    if (w != undefined) {
        //#in buchheim notation:
        //  #i == inner; o == outer; r == right; l == left;
        let vor, sor;
        let vir = vor = v
        let vil = w
        let vol = v.get_lmost_sibling()
        let sir = sor = v.mod
        let sil = vil.mod
        let sol = vol.mod
        while (vil.right() && vir.left()) {
            vil = vil.right()
            vir = vir.left()
            vol = vol.left()
            vor = vor.right()
            vor.ancestor = v
            let shift = (vil.x + sil) - (vir.x + sir) + distance
            if (shift > 0) {
                let a = ancestor(vil, v, default_ancestor)
                move_subtree(a, v, shift)
                sir = sir + shift
                sor = sor + shift
            }
            sil += vil.mod
            sir += vir.mod
            sol += vol.mod
            sor += vor.mod
        }
        if (vil.right() && !vor.right()) {
            vor.thread = vil.right()
            vor.mod += sil - sor
        }
        else {
            if (vir.left() && !vol.left()) {
                vol.thread = vir.left()
                vol.mod += sir - sol
            }
            default_ancestor = v
        }

    }
    return default_ancestor
}

function move_subtree(wl, wr, shift) {
    let subtrees = wr.number - wl.number
    wr.change -= shift / subtrees
    wr.shift += shift
    wl.change += shift / subtrees
    wr.x += shift
    wr.mod += shift
}

function execute_shifts(v:DrawTree) {

    let change, shift = change = 0
    for (let w of v.children.reverse()) {
        w.x += shift
        w.mod += shift
        change += w.change
        shift += w.shift + change
    }
}

function ancestor(vil, v, default_ancestor) {
    if (vil.ancestor in v.parent.children) 
        return vil.ancestor
    else
        return default_ancestor
}

function second_walk(v: DrawTree, m = 0, depth = 0) {
    v.x += m
    v.y = depth
    for (let w of v.children)
        second_walk(w, m + v.mod, depth + 1)
}
