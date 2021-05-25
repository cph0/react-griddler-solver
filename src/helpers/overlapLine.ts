import { Line } from "../classes/index";

export function overlapPart(line: Line, position: number, lineEnd: number, startIndex: number, endIndex: number) {
    let LinePosition = position;
    const LineFlagsForward: Set<string> = new Set();
    const LineFlagsBackward: Set<string> = new Set();

    for (let ItemIndex = startIndex; ItemIndex <= endIndex; ItemIndex++) {
        const { index, value } = line.items[ItemIndex];

        for (let Pos = 0; Pos < value; Pos++) {
            LineFlagsForward.add(`${LinePosition}_${index}`);
            LinePosition++;
        }
        LinePosition += line.dotCount(index);
    }
    LinePosition = 0;
    for (let itemIndex = endIndex; itemIndex >= startIndex; itemIndex--) {
        const { index, value } = line.items[itemIndex];

        for (let Pos = 0; Pos < value; Pos++) {
            LineFlagsBackward.add(`${lineEnd - LinePosition}_${index}`);
            LinePosition++;
        }
        LinePosition += line.dotCount(index, false);
    }
    for (let itemIndex = startIndex; itemIndex <= endIndex; itemIndex++) {
        const { index, colour } = line.items[itemIndex];

        for (let Pos = position; Pos <= lineEnd; Pos++) {
            if (LineFlagsForward.has(`${Pos}_${index}`) && LineFlagsBackward.has(`${Pos}_${index}`))
                line.addPoint(Pos, colour, itemIndex);
        }
    }
}

export default function overlapLine(lines: Line[]) {
    for (const line of lines) {
        if (!line.complete && line.lineValue < line.lineLength && line.lineValue > line.lineLength / 2) {
            overlapPart(line, 0, line.lineLength - 1, 0, line.lineItems - 1);
        }
    }
}