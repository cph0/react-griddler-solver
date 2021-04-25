import 'regenerator-runtime/runtime';
//import { renderHook } from '@testing-library/react-hooks'
import { fullLine, overlapLine } from '../helpers/index';
import { Item, Line } from '../interfaces';

function createData() {
    const data = {
        rows: [
            [1],
            [2],
            [1, 3],
            [5],
            [5],
            [2, 2],
            [2, 1, 1],
            [1, 1]
        ],
        cols: [
            [1, 1],
            [5],
            [3],
            [2],
            [2],
            [8],
            [2, 1],
            [1, 1]
        ],
        grid: null
    };

    const rows: Line[] = [];
    const cols: Line[] = [];

    data.rows.forEach((f, i) => {
        const items: Item[] = f.map((value, index) => ({ index, value, colour: "black" }));
        const line = new Line(8, i, items);
        rows.push(line);
    })

    data.cols.forEach((f, i) => {
        const items: Item[] = f.map((value, index) => ({ index, value, colour: "black" }));
        const line = new Line(8, i, items);
        cols.push(line);
    })

    rows.forEach(f => {
        f.setPairLines(cols);
    });

    cols.forEach(f => {
        f.setPairLines(rows);
    });

    return [rows, cols];
}

describe('actions', () => {

    it("fullLine", () => {

        const [, cols] = createData();
        const col = cols[5];

        fullLine([col]);

        const correctPoints = new Set([0, 1, 2, 3, 4, 5, 6, 7]);
        const pointsCorrect = col.points.size === correctPoints.size
            && !Array.from(col.points.keys()).some(s => !correctPoints.has(s));

        expect(pointsCorrect).toBe(true);
        expect(col.dots.size).toBe(0);
    });

    it("overlapLine", () => {

        const [, cols] = createData();
        const col = cols[1];

        overlapLine([col]);

        const correctPoints = new Set([3, 4]);
        const pointsCorrect = col.points.size === correctPoints.size
            && !Array.from(col.points.keys()).some(s => !correctPoints.has(s));

        expect(pointsCorrect).toBe(true);
        expect(col.dots.size).toBe(0);
    });

});