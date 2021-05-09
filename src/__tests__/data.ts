import 'regenerator-runtime/runtime';
import { GriddlerFile, griddlers } from '../data';
import solve from '../helpers/solver';

function solveGriddler(griddler: GriddlerFile) {
    const rows = griddler.rows.map(f => {
        return f.map((value, index) => {
            const parts = value.toString().split('.');
            return {
                index,
                value: parseInt(parts[0]),
                colour: parts[1] === '1' ? 'green' : 'black'
            };
        });
    });

    const cols = griddler.cols.map(f => {
        return f.map((value, index) => {
            const parts = value.toString().split('.');
            return {
                index,
                value: parseInt(parts[0]),
                colour: parts[1] === '1' ? 'green' : 'black'
            };
        });
    });

    return solve(rows, cols);
}

function testGriddler(griddler: GriddlerFile) {
    const points: Map<string, string> = new Map(griddler.points.map(m => [`${m.yPos}_${m.xPos}`, m.colour]));
    const dots: Set<string> = new Set();

    const { points: pts, dots: dts } = solveGriddler(griddler);

    for (let x = 0; x < griddler.width; x++) {
        for (let y = 0; y < griddler.height; y++) {
            if (!points.has(`${y}_${x}`))
                dots.add(`${y}_${x}`);
        }
    }

    const pointsOut = pts.map(m => [`${m.y}_${m.x}`, m.colour] as [string, string]);
    const dotsOut = dts.map(m => `${m.y}_${m.x}`);
    const pointsCorrect = pointsOut.length === points.size
        && !pointsOut.some(o => !points.has(o[0]) || points.get(o[0]) !== o[1]);
    const dotsCorrect = dotsOut.length === dots.size
        && !dotsOut.some(o => !dots.has(o));

    return [pointsCorrect, dotsCorrect];
}

describe("data", () => {
    test.each(griddlers)('multi', (griddler) => {
        const [pointsCorrect, dotsCorrect] = testGriddler(griddler);
        const ResultString = pointsCorrect && dotsCorrect ? '\u001b[42m PASS' : '\u001b[41m FAIL';
        console.log('\u001b[30m ' + ResultString, '\u001b[37m \u001b[40m' + griddler.name);
        expect(pointsCorrect).toBe(true);
        expect(dotsCorrect).toBe(true);
    });
});