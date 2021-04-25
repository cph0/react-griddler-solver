import { Line } from "../classes/index";
import forEachLine from "./forEachLine";

export function fullPart(line: Line, linePosition: number, startIndex: number, endIndex: number) {
    for (let itemIndex = startIndex; itemIndex <= endIndex; itemIndex++) {
        const { value, colour } = line.items[itemIndex];

        line.addPoints(linePosition, linePosition + value - 1, colour, itemIndex);
        linePosition += value;

        if (line.shouldAddDots(itemIndex)[1]) {
            line.addDot(linePosition);
            linePosition++;
        }
    }
}

export default function fullLine(lines: Line[]) {
    for (const line of forEachLine(lines, l => l.lineValue === l.lineLength)) {        
        line.complete = true;
        fullPart(line, 0, 0, line.lineItems - 1);        
    }
}
