import { Line } from "../classes/index";
import {
    fullLine, overlapLine, fullLineDots,
    lineEdgeTL2, lineEdgeBR2, lineGaps, completeItem, lineBlocks
} from './index';

export function isComplete(lines: Line[]) {
    let complete = true;

    for (const line of lines) {

        if (line.linePointsValue(true) !== line.lineLength) {
            complete = false;
            break;
        }
        else
            line.complete = true;
    }

    return complete;
}

export default function solve(rows: Line[], cols: Line[]) {
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
       
        count++;

        //if (count === loopCount)
        //    break;

        if (ptsCount === rows.reduce((acc, m) => acc + m.points.size, 0)
            && dtsCount === rows.reduce((acc, m) => acc + m.dots.size, 0))
            break;

    }
}