import { Component, OnInit, Input } from '@angular/core';
import { Line, Point } from '../line';


@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {

  @Input() size: number;
  pointRadius: number;
  @Input() data: Array<Point>;
  @Input() lines: Array<Line>;
  @Input() maxValX: number;
  @Input() maxValY: number;
  @Input() xAxisLabel: string;
  @Input() yAxisLabel: string;

  axisSize: number;

  constructor() {
    this.size = 300;
    this.axisSize = 20;
    this.pointRadius = 3;
    this.maxValX = 10;
    this.maxValY = 10;
    this.data = [];
    this.lines = [];
  }

  getX(point: [number, number]) {
    return this.axisSize + this.pointRadius + point[0] * this.size / this.maxValX;
  }
  getY(point: [number, number]) {
    let tradYCord = this.axisSize + this.pointRadius + point[1] * this.size / this.maxValY;
    return this.size - tradYCord;
  }

  ngOnInit() {
  }

}
