import 'regenerator-runtime/runtime';
import { Line } from "../classes/index";
import forEachLine from './forEachLine';

export function* possibleIndexes(value: number, offset = 0) {
    for (let index = 0; index < value; index++) {
        yield offset + index;
    }
}

export function lineEdgeTL2(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const { value, colour } = line.items[0];
        const start = line.startOfFirstGap;
        let pointCount = 0;

        for (const index of possibleIndexes(value, start)) {
            if (line.points.has(index))
                pointCount++;
            else if (pointCount > 0) {
                line.addPoint(index, colour, 0);
                pointCount++;
            }
        }

        let extend = start + value;
        while (line.points.has(extend)) {
            extend++;
            pointCount++;
        }

        if (pointCount > value)
            console.error(`lineEdgeTL too big ${pointCount} ${value}`);

        line.addDots(start, extend - value - 1);

        if (pointCount === value)
            line.addDot(extend);
    }
}

export default function lineEdgeTL(lines: Line[]) {
    for (const line of lines) {
        if (!line.complete) {
            let linePosition = 0;
            let currentItem = 0;
            let endIndex = 0;
            let hadGap = false;

            for (let Pos = 0; Pos < line.lineLength; Pos++) {
                if (Pos - linePosition < line.items[currentItem].value
                    && line.points.has(Pos)) {

                    //forward shift and end dot
                    for (let i = Pos + 1; i < linePosition + line.items[currentItem].value - 1; i++) {
                        line.addPoint(i, line.items[currentItem].colour);
                    }

                    if (Pos - linePosition === 0
                        && Pos + line.items[currentItem].value < line.lineLength
                        && line.shouldAddDots(currentItem)[1]) {
                        line.addDot(Pos + line.items[currentItem].value);
                    }

                    //back dots
                    const backReach = Pos - line.items[currentItem].value + (1 - 1);
                    if (Pos - linePosition < line.items[currentItem].value
                        && backReach >= endIndex) {
                        for (let i = Pos + 1; i < linePosition + line.items[currentItem].value - 1; i++) {
                            line.addPoint(i, line.items[currentItem].colour);
                        }
                    }

                    if (currentItem === line.lineItems - 1)
                        break;

                    //3,4|---0-{LP}-{EI}----00
                    endIndex = Pos + line.items[currentItem].value;
                    linePosition += (line.items[currentItem].value + line.dotCount(currentItem));
                    currentItem++;
                }
                else if (line.dots.has(Pos) && !hadGap)
                    linePosition = Pos + 1;
                else
                    hadGap = true;
            }
        }
    }
}