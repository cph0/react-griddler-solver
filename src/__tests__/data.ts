import 'regenerator-runtime/runtime';
import { Line } from '../classes';
import { griddlers } from '../data';
import solve from '../helpers/solver';
import { Item } from '../interfaces';

describe("data", () => {

    test.each(griddlers)('', (griddler) => {

        const width = griddler.width;
        const height = griddler.height;
        const rows: Line[] = [];
        const cols: Line[] = [];

        griddler.rows.forEach((f: number[], i: number) => {
            const items: Item[] = f.map((value, index) => ({ index, value, colour: "black" }));
            const line = new Line(width, i, items);
            rows.push(line);
        })

        griddler.cols.forEach((f: number[], i: number) => {
            const items: Item[] = f.map((value, index) => ({ index, value, colour: "black" }));
            const line = new Line(height, i, items);
            cols.push(line);
        })

        rows.forEach(f => {
            f.setPairLines(cols);
        });

        cols.forEach(f => {
            f.setPairLines(rows);
        });

        solve(rows, cols);

        //const correctPoints = new Set([0, 1, 2, 3, 4, 5, 6, 7]);
        //const pointsCorrect = col.points.size === correctPoints.size
        //    && !Array.from(col.points.keys()).some(s => !correctPoints.has(s));

        //expect(pointsCorrect).toBe(true);
        //expect(col.dots.size).toBe(0);
    });
});