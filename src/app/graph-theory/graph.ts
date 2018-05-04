import { keys, mapValues } from 'lodash';

interface NodeHash<T> {
    [name: string]: GraphNode<T>;
}

interface NumericHash {
    [name: string]: number;
}

enum NodeColor {
    white = 1,
    gray = 2,
    black = 3
}

class GraphNode<T> {
    constructor(data: T) {
        this.data = data;
        this.distance = Infinity;
        this.parent = null;
        this.color = NodeColor.white;
        this.links = {};
        this.linkWeights = {};
        this.startTime = Infinity;
        this.finishTime = Infinity;
    }
    data: T;
    distance: number;
    parent: GraphNode<T>;
    color: NodeColor;
    links: NodeHash<T>;
    linkWeights: NumericHash;
    startTime: number;
    finishTime: number;
    colorName(): string {
        return NodeColor[this.color];
    }
    colorStr(): string {
        switch (this.color) {
            case NodeColor.white:
                return '#eee';
            case NodeColor.gray:
                return '#777';
            case NodeColor.black:
                return '#111';
        }
    }
}

class Queue<T> {
    constructor() {
        this.storage = [];
    }
    storage: Array<T>;
    enqueue(item: T) {
        this.storage.push(item);
    }
    dequeue(): T {
        return this.storage.shift();
    }
    isEmpty(): boolean {
        return this.storage.length == 0;
    }
}


export class Graph<T> {
    nodes: NodeHash<T>;
    snapshots: Array<Graph<T>>;

    constructor() {
        this.nodes = {};
    }
    repr(): string {
        let str = '';
        for (let nodeName in this.nodes) {
            str += nodeName + ': ' + keys(this.nodes[nodeName].links).join(' ') + '\n';
        }
        return str;
    }

    addLink(source: T, dest: T, weight: number) {
        this.addDirectedLink(source, dest, weight);
        this.addDirectedLink(dest, source, weight);
    }

    addDirectedLink(source: T, dest: T, weight: number) {
        if (this.nodes[source.toString()] == undefined) {
            this.nodes[source.toString()] = new GraphNode(source);
        }
        if (this.nodes[dest.toString()] == undefined) {
            this.nodes[dest.toString()] = new GraphNode(dest);
        }
        this.nodes[source.toString()].links[dest.toString()] = this.nodes[dest.toString()];
        this.nodes[source.toString()].linkWeights[dest.toString()] = weight;
    }

    makeSnapshots(algorithm: string, source: T = undefined) {
        this.snapshots = [];
        switch (algorithm) {
            case 'bfs': {
                this.makeBfsSnapshots(source)
                return this.snapshots;
            } case 'dfs': {
                this.makeDfsSnapshots()
                return this.snapshots;
            }
        }

    }

    snapshot() {
        this.snapshots.push(this.clone());
    }

    hash(node: GraphNode<T>): string {
        return node.data.toString();
    }

    clone(): Graph<T> {
        let clone = new Graph<T>();
        // Clone basic data for all nodes
        for (let nodeName in this.nodes) {
            let oldNode = this.nodes[nodeName];
            clone.nodes[nodeName] = new GraphNode(oldNode.data);
            let cloneNode = clone.nodes[nodeName];

            cloneNode.data = oldNode.data;
            cloneNode.distance = oldNode.distance;
            cloneNode.color = oldNode.color;
            cloneNode.startTime = oldNode.startTime;
            cloneNode.finishTime = oldNode.finishTime;
        }
        // Restore parents and links
        for (let nodeName in this.nodes) {
            let oldNode = this.nodes[nodeName];
            let cloneNode = clone.nodes[nodeName];
            cloneNode.linkWeights = oldNode.linkWeights;

            if (oldNode.parent)
                cloneNode.parent = clone.nodes[clone.hash(oldNode.parent)];
            cloneNode.links = mapValues(oldNode.links, n => {
                return clone.nodes[clone.hash(n)];
            });
        }

        return clone;
    }

    getNode(data: T): GraphNode<T> {
        return this.nodes[data.toString()];
    }

    bellmanFord(source: T) {
        let edges = [];

        for (let nodeName in this.nodes) {
            this.nodes[nodeName].distance = Infinity;
            this.nodes[nodeName].parent = null;
            for (let linkName in this.nodes[nodeName].links) {
                edges.push({
                    u: this.nodes[nodeName],
                    v: this.nodes[linkName],
                    w: this.nodes[nodeName].linkWeights[linkName]
                });
            }

        }

        let sourceNode = this.getNode(source);
        sourceNode.distance = 0;

        for (let nodeName in this.nodes) {
            edges.forEach(edge => {
                if (edge.u.distance + edge.w < edge.v.distance) {
                    edge.v.distance = edge.u.distance + edge.w
                    edge.v.parent = edge.u;
                }
            });
        }

        edges.forEach(edge => {
            if (edge.u.distance + edge.w < edge.v.distance) {
                alert("Graph contains a negative-weight cycle");
                return;
            }
        });
    }


    queue: Queue<GraphNode<T>>;
    makeBfsSnapshots(source: T) {
        for (let nodeName in this.nodes) {
            this.nodes[nodeName].color = NodeColor.white;
            this.nodes[nodeName].distance = Infinity;
            this.nodes[nodeName].parent = null;
        }

        let sourceNode = this.nodes[source.toString()];
        sourceNode.color = NodeColor.gray;
        sourceNode.distance = 0;
        this.queue = new Queue<GraphNode<T>>();
        this.queue.enqueue(sourceNode);
        this.snapshot();
        while (!this.queue.isEmpty()) {
            let current = this.queue.dequeue();
            for (let nodeName in current.links) {
                let neighbor = current.links[nodeName];
                if (neighbor.color == NodeColor.white) {
                    neighbor.parent = current;
                    neighbor.distance = current.distance + 1;
                    neighbor.color = NodeColor.gray;
                    this.queue.enqueue(neighbor);
                    this.snapshot();
                }
            }
            current.color = NodeColor.black;
            this.snapshot();
        }
        this.queue = undefined;
    }


    bfs(source: T) {
        for (let nodeName in this.nodes) {
            this.nodes[nodeName].color = NodeColor.white;
            this.nodes[nodeName].distance = Infinity;
            this.nodes[nodeName].parent = null;
        }

        let sourceNode = this.nodes[source.toString()];
        sourceNode.color = NodeColor.gray;
        sourceNode.distance = 0;
        this.queue = new Queue<GraphNode<T>>();
        this.queue.enqueue(sourceNode);
        while (!this.queue.isEmpty()) {
            let current = this.queue.dequeue();
            for (let nodeName in current.links) {
                let neighbor = current.links[nodeName];
                if (neighbor.color == NodeColor.white) {
                    neighbor.parent = current;
                    neighbor.distance = current.distance + 1;
                    neighbor.color = NodeColor.gray;
                    this.queue.enqueue(neighbor);
                }
            }
            current.color = NodeColor.black;
        }
        this.queue = undefined;
    }

    time: number;
    dfs() {
        for (let nodeName in this.nodes) {
            this.nodes[nodeName].color = NodeColor.white;
            this.nodes[nodeName].parent = null;
        }
        this.time = 0;
        for (let nodeName in this.nodes) {
            if (this.nodes[nodeName].color == NodeColor.white) {
                this.dfsVisit(this.nodes[nodeName]);
            }
        }
    }

    dfsVisit(node: GraphNode<T>) {
        this.time++;
        node.startTime = this.time;
        node.color = NodeColor.gray;

        for (let nodeName in node.links) {
            let neighbor = node.links[nodeName];
            if (neighbor.color == NodeColor.white) {
                neighbor.parent = node;
                this.dfsVisit(neighbor);
            }
        }

        node.color = NodeColor.black;
        this.time++;
        node.finishTime = this.time;
    }

    makeDfsSnapshots() {
        for (let nodeName in this.nodes) {
            this.nodes[nodeName].color = NodeColor.white;
            this.nodes[nodeName].parent = null;
        }
        this.time = 0;
        for (let nodeName in this.nodes) {
            if (this.nodes[nodeName].color == NodeColor.white) {
                this.dfsVisitSnapshots(this.nodes[nodeName]);
            }
        }
    }
    dfsVisitSnapshots(node: GraphNode<T>) {
        this.time++;
        node.startTime = this.time;
        node.color = NodeColor.gray;
        this.snapshot();

        for (let nodeName in node.links) {
            let neighbor = node.links[nodeName];
            if (neighbor.color == NodeColor.white) {
                neighbor.parent = node;
                this.dfsVisitSnapshots(neighbor);
            }
        }

        node.color = NodeColor.black;
        this.time++;
        node.finishTime = this.time;
        this.snapshot();
    }
}
