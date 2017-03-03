export type Point = [number, number];

export class Line {
    slope: number;
    offset: number;
    start: Point;
    end: Point;

    constructor(public p1: Point, public p2: Point) {
        this.slope = (p1[1] - p2[1]) / (p1[0] - p2[0]);
        this.offset = p1[1] - this.slope * p1[0];
    }

    getY(x: number) {
        return this.slope * x + this.offset;
    }

}