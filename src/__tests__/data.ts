import 'regenerator-runtime/runtime';
import { Line } from '../classes';
import { griddlers } from '../data';
import solve from '../helpers/solver';
import { Item } from '../interfaces';

function solveGriddler(griddler: any, rows: Line[], cols: Line[]) {
    const width = griddler.width;
    const height = griddler.height;
    
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
}

describe("data", () => {

    it("Bird10x10", () => {
        const griddler = griddlers[1];
        const points: Set<string> = new Set(griddler.points.map(m => `${m.yPos}_${m.xPos}`));
        const dots: Set<string> = new Set();
        const rows: Line[] = [];
        const cols: Line[] = [];

        solveGriddler(griddler, rows, cols);

        for (let x = 0; x < griddler.width; x++) {
            for (let y = 0; y < griddler.height; y++) {
                if (!points.has(`${y}_${x}`))
                    dots.add(`${y}_${x}`);
            }
        }

        const pointsOut = rows.flatMap((f, i) => Array.from(f.points.keys()).map(m => `${i}_${m}`));
        const dotsOut = rows.flatMap((f, i) => Array.from(f.dots.keys()).map(m => `${i}_${m}`));
        const pointsCorrect = pointsOut.length === points.size
            && !pointsOut.some(o => !points.has(o));
        const dotsCorrect = dotsOut.length === dots.size
            && !dotsOut.some(o => !dots.has(o));

        expect(pointsCorrect).toBe(true);
        expect(dotsCorrect).toBe(true);
    });

    //test.each(griddlers)('', (griddler) => {

    //    const rows: Line[] = [];
    //    const cols: Line[] = [];

    //    solveGriddler(griddler, rows, cols);

    //    //const correctPoints = new Set([0, 1, 2, 3, 4, 5, 6, 7]);
    //    //const pointsCorrect = col.points.size === correctPoints.size
    //    //    && !Array.from(col.points.keys()).some(s => !correctPoints.has(s));

    //    //expect(pointsCorrect).toBe(true);
    //    //expect(col.dots.size).toBe(0);
    //});
});