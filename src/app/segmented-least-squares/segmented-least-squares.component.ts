import { Component, OnInit } from '@angular/core';
import { random } from 'lodash';
import { Point, Line } from '../line';
import { Optimizer } from './least-squares-optimizer';

@Component({
  selector: 'app-segmented-least-squares',
  templateUrl: './segmented-least-squares.component.html',
  styleUrls: ['./segmented-least-squares.component.css']
})
export class SegmentedLeastSquaresComponent implements OnInit {

  optimizer: Optimizer = new Optimizer();;
  max: number = 100;
  graphSize = 400;
  lineCost: number = 100;
  pointCount: number = 30;
  lineCount: number = 2;
  noise: number = 5;

  points: Array<Point>;
  lines: Array<Line>;

  constructor() {
    this.generate();
  }

  fit() {
    this.lines = this.optimizer.optimizeMultiline(this.points, this.lineCost);
  }

  generate() {
    this.points = this.generatePointsOnLines(this.pointCount, this.lineCount, this.noise, 0);
    this.fit();
  }

  generateRandPoints(pointConut: number, max: number) {
    let points: Array<Point> = [];
    for (let i = 0; i < pointConut; i++) {
      points.push([random(0, max), random(0, max)]);
    }
    return points;
  }

  generatePointsOnLine(count: number, noise: number, line: Line): Array<Point> {
    let points = [];
    for (let i = 0; i < count; i++) {
      let x = random(line.p1[0], line.p2[0]);
      let y = line.getY(x) + random(-noise, noise);
      points.push([x, y]);
    }
    return points;
  }

  generatePointsOnLines(pointCount: number, lineCount: number, noise: number, correlation: number): Array<Point> {
    let secLen = this.max / lineCount;
    let points = [];
    let lastPoint = undefined
    for (let i = 0; i < lineCount; i++) {
      let line = new Line(lastPoint || [(i) * secLen, random(0, this.max)], [(i + 1) * secLen, random(this.max)]);
      points = points.concat(this.generatePointsOnLine(pointCount / lineCount, noise, line));
      lastPoint = line.p2;
    }
    return points;
  }

  ngOnInit() {
  }

}
