import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Graph } from '../graph';
import { DrawableTree, DrawTree, buchheim } from './draw-tree';
import 'sigma';
//import 'treant-js';

declare var Treant: any;
declare var treant: any;




@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    console.log('mello');
    console.log(Treant);

    let simple_chart_config = {
      chart: {
        container: "#tree-render-target"
      },

      nodeStructure: { 
        text: { name: "Parent node" },
        children: [
          {
            text: { name: "First child" }
          },
          {
            text: { name: "Second child" }
          }
        ]
      }
    };

    let my_chart = new Treant(simple_chart_config);
  }


}
