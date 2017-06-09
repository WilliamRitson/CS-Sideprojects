import { sumBy, minBy, maxBy } from 'lodash';
import { Line, Point } from '../line';

const getX = (p: Point) => p[0];
const getY = (p: Point) => p[1];

export class Optimizer {

    public score(data: Array<Point>, line: Line): number {
        return sumBy(data, point => Math.pow(line.getY(point[0]) - point[1], 2))
    }

    private multilineBacktrack(shadow: Array<number>, mins: Array<number>): Array<number> {
        let segments = [];
        let N = mins.length - 1;
        let j  = shadow[N];
        for (let i = N; i > 0; i = j - 1) {
            j = shadow[i];
            segments.push(i);
            segments.push(j);
        }
        return segments;
    }

    

    public optimizeMultiline(data: Array<Point>, lineCost: number): Array<Line> {
        data = data.sort((p1, p2) => p1[0] - p2[0]);

        let errors = new Array(data.length) as number[][];
        for (let j = 0; j < data.length; j++) {
            errors[j] = new Array(data.length);
            for (let i = 0; i < j; i++) {
                errors[i][j] = j - i <= 2 ? 0 : this.score(data, this.optimizeSingleline(data.slice(i, j)))
            }
        }
        let mins = new Array(data.length).fill(Infinity);
        let shadow = new Array(data.length);
        for (let j = 0; j < data.length; j++) {
            for (let i = 0; i < j; i++) {
                let val = errors[i][j] + lineCost + (mins[i - 1] || 0);
                if (val < mins[j]) {
                    mins[j] = val;
                    shadow[j] = i;
                }
            }
        }
        console.log(mins);
        console.log(shadow);
        let segs = this.multilineBacktrack(shadow, mins);
        console.log(segs);
        let lines = []
        while (segs.length > 0) {
            let start = segs.pop();
            let end = segs.pop();
            lines.push(this.optimizeSingleline(data.slice(start, end + 1)));
            console.log(data.slice(start, end + 1), lines[lines.length - 1]);
        }
        return lines;
    }

    public optimizeSingleline(data: Array<Point>): Line {
        let n = data.length;
        let sumOfX = sumBy(data, getX);
        let sumOfY = sumBy(data, getY);
        let sumOfXY = sumBy(data, p => p[0] * p[1])
        let sumOfXSquared = sumBy(data, p => p[0] * p[0]);

        let slope = (n * sumOfXY - sumOfX * sumOfY) /
            (n * sumOfXSquared - (sumOfX * sumOfX));
        let offset = (sumOfY - slope * sumOfX) / n;

        let minX = minBy(data, getX)[0];
        let maxX = maxBy(data, getX)[0];

        return new Line(
            [minX, minX * slope + offset],
            [maxX, maxX * slope + offset]
        );
    }
}