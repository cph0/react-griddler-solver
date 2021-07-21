import { Line } from "../classes/index";
import { Item, Point } from "../interfaces";
import {
    fullLine, overlapLine, fullLineDots,
    lineEdgeTL2, lineEdgeBR2, lineGaps, completeItem, lineBlocks
} from './index';

export function isComplete(lines: Line[]) {
    return lines.every(e => e.complete);
}

export function createLines(rows: Item[][], cols: Item[][]) {
    const rs: Line[] = [];
    const cs: Line[] = [];

    rows.forEach((f: Item[], i: number) => {
        const line = new Line(cols.length, i, f);
        rs.push(line);
    });

    cols.forEach((f: Item[], i: number) => {
        const line = new Line(rows.length, i, f);
        cs.push(line);
    });

    rs.forEach(f => {
        f.setPairLines(cs);
    });

    cs.forEach(f => {
        f.setPairLines(rs);
    });

    return { rows: rs, cols: cs };
}

export default function solve(rs: Item[][], cs: Item[][]) {

    const { rows, cols } = createLines(rs, cs);

    fullLine(rows);
    fullLine(cols);

    overlapLine(rows);
    overlapLine(cols);

    let count = 0;
    const loopCount = 3;

    while (!isComplete(rows)) {
        const ptsCount = rows.reduce((acc, m) => acc + m.points.size, 0);
        const dtsCount = rows.reduce((acc, m) => acc + m.dots.size, 0);

        fullLineDots(rows);
        fullLineDots(cols);

        lineEdgeTL2(rows);
        lineEdgeTL2(cols);

        lineEdgeBR2(rows);
        lineEdgeBR2(cols);

        lineGaps(rows);
        lineGaps(cols);

        completeItem(rows);
        completeItem(cols);

        lineBlocks(rows);
        lineBlocks(cols);

        //if (count === 1)
        //    break;

        count++;

        //if (count === loopCount)
        //    break;

        const strayDogs = rows.flatMap((r, i) => Array.from(r.dots)
            .filter(s => r.points.has(s)).map(m => ({ x: m, y: i })));
        if (strayDogs.length > 0) {

            for (const strayDog of strayDogs)
                console.error(`Stray Dog x:${strayDog.x} y: ${strayDog.y}`);

            console.error(`Loop Count ${count - 1}`);

            break;
        }

        if (ptsCount === rows.reduce((acc, m) => acc + m.points.size, 0)
            && dtsCount === rows.reduce((acc, m) => acc + m.dots.size, 0))
            break;
    }

    //console.log(rows, cols);

    const points = rows.reduce((acc, row, index) => {
        const dts = Array.from(row.points.entries()).map(m => {
            return {
                x: m[0],
                y: index,
                colour: m[1]
            };
        });

        return [...acc, ...dts];
    }, [] as Point[]);

    const dots = rows.reduce((acc, row, index) => {
        const dts = Array.from(row.dots.keys()).map(m => {
            return {
                x: m,
                y: index
            };
        });

        return [...acc, ...dts];
    }, [] as Point[]);

    return { points, dots };
}