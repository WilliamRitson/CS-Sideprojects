import { sumBy, minBy, maxBy } from 'lodash';
import { Line, Point } from '../line';

const getX = (p: Point) => p[0];
const getY = (p: Point) => p[1];

export class Optimizer {

    public score(data: Array<Point>, line: Line): number {
        return sumBy(data, point => Math.pow(line.getY(point[0]) - point[1], 2))
    }

    private multilineBacktrack(shadow: Array<number>, j: number):Array<number> {
        if (j == 0 )
            return [];
        else if (shadow[j]) {

        }
    }

    public optimizeMultiline(data: Array<Point>, lineCost: number): Array<Line> {
        let errors = new Array(data.length) as number[][];
        for (let j = 0; j < data.length; j++) {
            errors[j] = new Array(data.length);
            for (let i = 0; i < j; i++) {
                errors[i][j] = j - i <= 2 ?  0 : this.score(data, this.optimizeSingleline(data.slice(i, j)))
            }
        }
        let mins   = new Array(data.length).fill(Infinity);
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
        return [];
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