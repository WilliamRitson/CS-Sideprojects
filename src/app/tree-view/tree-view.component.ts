import { Component, OnInit, Input } from '@angular/core';
import { Graph } from '../graph';
import { DrawableTree, DrawTree, buchheim } from './draw-tree';
import 'sigma';



@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnInit {
  sigma: SigmaJs.Sigma;
  @Input() tree: DrawTree;
  source: string;

  constructor() {
    let dt = new DrawableTree("A", [
      new DrawableTree("B"),
      new DrawableTree("C"),
    ]);
    console.log(dt);
    let layout = buchheim(new DrawTree(dt));
    console.log(layout);
  }

  refresh() {
    this.sigma.graph.clear();
    let edgeCount = 0;
    // Add Nodes
    /*
    for (let nodeName in this.graph.nodes) {
      let node = this.graph.nodes[nodeName];
      this.sigma.graph.addNode({
        id: nodeName,
        label: node.data,
        size: 1,
        x: Math.random() * 280,
        y: Math.random() * 280,
        color: node.colorStr()n
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
    */
    this.sigma.refresh();
  }


  ngOnInit() {
    this.sigma = new sigma('tree-render-target');
  }

}
