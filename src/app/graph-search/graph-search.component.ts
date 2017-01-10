import { Component, OnInit } from '@angular/core';
import { Graph } from '../graph';
import { values, toPairs } from 'lodash';
import 'sigma';
//import 'sigma/forceAtlas2'

class Link {
  constructor(from, to, weight = 1) {
    this.from = from;
    this.to = to;
    this.directed = false;
    this.weight = weight;
  }
  from: string;
  to: string;
  directed: boolean;
  weight: number;
}


@Component({
  selector: 'app-graph-search',
  templateUrl: './graph-search.component.html',
  styleUrls: ['./graph-search.component.css']
})
export class GraphSearchComponent implements OnInit {
  sigma: SigmaJs.Sigma;
  graph: Graph<string>
  snapshot: Graph<string>
  snapshots: {
    dfs: Array<Graph<string>>;
    bfs: Array<Graph<string>>;
  }
  links: Array<Link>
  source: string;

  constructor() {
    this.links = [
      new Link('A', 'B', 5),
      new Link('A', '2', 2),
      new Link('B', 'C', 2),
      new Link('2', 'C', 3),
      new Link('A', 'X', -1),
      new Link('X', 'A', 0),
    ]
    this.graph = new Graph<string>();
    this.snapshot = this.graph;
    this.snapshots = { bfs: undefined, dfs: undefined }
    setTimeout(() => {
      this.sigma = new sigma('graph-render-target');
      this.rebuild();
      this.refresh();
    }, 50);
  }

  addLink() {
    this.links.push(new Link('', ''));
  }

  deleteLink(i: number) {
    this.links.splice(i, 1);
  }


  nextSnapShot(algorithm: string, source: string) {
    if (this.snapshots[algorithm] == undefined) {
      this.snapshots[algorithm] = this.graph.makeSnapshots(algorithm, source);
    }
    let i = this.snapshots[algorithm].indexOf(this.snapshot);
    i = i == this.snapshots[algorithm].length - 1 ? 0 : i + 1
    this.snapshot = this.snapshots[algorithm][i];
  }

  bellmanFord() {
    this.graph.bellmanFord(this.source);
    this.snapshot = this.graph;
    this.recolor(this.graph);
  }

  bfs() {
    this.graph.bfs(this.source);
    this.snapshot = this.graph;
    this.recolor(this.graph);
  }

  bfsStep() {
    this.nextSnapShot('bfs', this.source);
    this.recolor(this.snapshot);
  }

  dfs() {
    this.graph.dfs();
    this.snapshot = this.graph;
    this.recolor(this.graph);
  }

  dfsStep() {
    this.nextSnapShot('dfs', '');
    this.recolor(this.snapshot);
  }


  getNodes() {
    return toPairs(this.snapshot.nodes);
  }

  getNodesSingle() {
    return values(this.snapshot.nodes);
  }

  rebuild() {
    this.graph = new Graph<string>();
    this.snapshot = this.graph;
    this.snapshots.bfs = undefined;
    this.snapshots.dfs = undefined;
    this.source = this.links[0].from;
    this.links.forEach(l => {
      if (l.directed) {
        this.graph.addDirectedLink(l.from, l.to, l.weight);
      } else {
        this.graph.addLink(l.from, l.to, l.weight);
      }
    });
    this.refresh();

  }

  recolor(source: Graph<string>) {
    let renderNodes = this.sigma.graph.nodes();
    renderNodes.forEach(rn => {
      rn.color = source.nodes[rn.id].colorStr();
    })
    this.sigma.refresh();
  }

  refresh() {
    this.sigma.graph.clear();
    let edgeCount = 0;
    // Add Nodes
    for (let nodeName in this.graph.nodes) {
      let node = this.graph.nodes[nodeName];
      this.sigma.graph.addNode({
        id: nodeName,
        label: node.data,
        size: 1,
        x: Math.random() * 280,
        y: Math.random() * 280,
        color: node.colorStr()
      });
    }
    // Add Edges
    for (let nodeName in this.graph.nodes) {
      let node = this.graph.nodes[nodeName];
      for (let link in node.links) {
        this.sigma.graph.addEdge({
          id: 'e' + edgeCount,
          source: nodeName,
          target: link,
          type: "arrow",
          head: "arrow"
        });
        edgeCount++;
      }
    }
    this.sigma.refresh();
  }

  ngOnInit() {
  }

}
