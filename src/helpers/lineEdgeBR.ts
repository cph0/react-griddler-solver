import 'regenerator-runtime/runtime';
import { Action, Line } from "../classes/index";
import forEachLine from './forEachLine';

export function* possibleIndexesB(lineLength: number, value: number, offset = 0) {
    for (let index = lineLength - 1; index >= lineLength - value; index--) {
        yield index - offset;
    }
}

export function lineEdgeBR2(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const { value, colour } = line.items[line.lineItems - 1];
        const end = line.endOfLastGap;
        const offset = line.lineLength - 1 - end;
        let pointCount = 0;

        for (const index of possibleIndexesB(line.lineLength, value, offset)) {
            const pt = line.points.get(index);

            if (pt && pt !== colour)
                break;

            if (pt)
                pointCount++;
            else if (pointCount > 0) {
                line.addPoint(index, colour, Action.LineBackwardShift, line.lineItems - 1);
                pointCount++;
            }
        }

        let extend = end - value;
        while (line.points.get(extend) === colour) {
            extend--;
            pointCount++;
        }

        if (pointCount > value)
            console.error(`lineEdgeBR too big ${pointCount} ${value}`);

        line.addDots(extend + value + 1, end, Action.LineBackDots);

        if (pointCount === value && line.shouldAddDots(line.lineItems - 1)[0])
            line.addDot(extend, Action.CompleteItem);
    }
}