import { createLines } from '../helpers/solver';
import { fullLine, overlapLine } from '../helpers/index';

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

    const rowItems = data.rows.map(r => {
        return r.map((value, index) => ({ index, value, colour: 'black' }));
    });

    const colItems = data.cols.map(r => {
        return r.map((value, index) => ({ index, value, colour: 'black' }));
    });

    const { rows, cols } = createLines(rowItems, colItems);
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