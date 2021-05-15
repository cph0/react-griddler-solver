import Gap from "../classes/Gap";
import { Line } from "../classes/index";
import { Item } from "../interfaces";
import forEachLine from "./forEachLine";
import { fullPart } from "./fullLine";
import { possibleIndexes } from "./lineEdgeTL";
import { overlapPart } from "./overlapLine";

type B = boolean;
const noItemForGap = (g: Gap, e: B, i: Item | null) => e && (!i || g.size < i.value);
const itemFillsGap = (g: Gap, e: B, i: Item | null) => e && g.hasPoints && i && g.size === i.value;
const itemAtEdgeOfGap = (a: B, e: B, l: Line, i: Item | null) => i && a && (e || l.itemsOneValue);
export default function lineGaps(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        //min item
        for (const index of possibleIndexes(line.minItem - 1, 1)) {
            const gapsBySize = line.getGapsBySize(index);
            for (const gap of gapsBySize)
                line.addDots(gap.start, gap.end);
        }

        for (const [gap, ls, skip] of line.getGaps(true)) {
            const { item, equality, index } = ls;
            if (noItemForGap(gap, equality, item))
                line.addDots(gap.start, gap.end);
            else if (itemFillsGap(gap, equality, item) && item)
                line.addPoints(gap.start, gap.end, item.colour, item.index);
            else if (itemAtEdgeOfGap(gap.hasFirstPoint, equality, line, item) && item) {
                line.addPoints(gap.start + 1, gap.start + item.value - 1, item.colour, item.index);
                line.addDot(gap.start + item.value);
                skip.i = gap.start + item.value;
            }
            else {
                const lsEnd = line.getItemsAtPositionB(gap.end + 1);
                const { item: itemE, equality: equalityE, index: indexE } = lsEnd;
                const range = ls.with(lsEnd);
                const sum = line.sum(true, range[0], range[1]);

                if (noItemForGap(gap, equalityE, itemE)
                    || (equality && equalityE && index > indexE)
                    || (equality && equalityE && sum > gap.size)
                )
                    line.addDots(gap.start, gap.end);
                else if (itemFillsGap(gap, equalityE, itemE) && itemE)
                    line.addPoints(gap.start, gap.end, itemE.colour, itemE.index);
                else if (itemAtEdgeOfGap(gap.hasLastPoint, equalityE, line, itemE) && itemE) {
                    line.addPoints(gap.end - itemE.value + 1, gap.end - 1, itemE.colour, itemE.index);
                    line.addDot(gap.end - itemE.value);
                    skip.i = gap.end;
                }
                else if (item && itemE && sum === gap.size) {
                    fullPart(line, gap.start, item.index, itemE.index);
                    skip.i = gap.end;
                }
                else if (item && itemE && (index === indexE || equality || equalityE)
                        && sum < gap.size && sum > gap.size / 2)
                    overlapPart(line, gap.start, gap.end, item.index, itemE.index);
            }
        }
    }
}