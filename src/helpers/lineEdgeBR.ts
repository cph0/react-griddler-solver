import 'regenerator-runtime/runtime';
import { Line } from "../classes/index";
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
            if (line.points.has(index))
                pointCount++;
            else if (pointCount > 0) {
                line.addPoint(index, colour, line.lineItems - 1);
                pointCount++;
            }
        }

        let extend = end - value;
        while (line.points.has(extend)) {
            extend--;
            pointCount++;
        }

        if (end - extend - 1 > value)
            throw new Error(`lineEdgeBR too big ${extend} ${end} ${value}`);

        line.addDots(extend + value + 1, end);

        if (pointCount === value)
            line.addDot(extend);
    }
}