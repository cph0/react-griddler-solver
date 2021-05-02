import { Line } from "../classes/index";
import forEachLine from "./forEachLine";
import { fullPart } from "./fullLine";
import { possibleIndexes } from "./lineEdgeTL";
import { overlapPart } from "./overlapLine";

export default function lineGaps(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        //min item
        for (const index of possibleIndexes(line.minItem - 1, 1)) {
            const gapsBySize = line.getGapsBySize(index);
            for (const gap of gapsBySize)
                line.addDots(gap.start, gap.end);
        }

        for (const [gap, ls] of line.getGaps(true)) {
            const { item, equality, index } = ls;
            if (equality && (!item || gap.size < item.value))
                line.addDots(gap.start, gap.end);            
            else if (equality && gap.hasPoints && item && gap.size === item.value)
                line.addPoints(gap.start, gap.end, item.colour, item.index);
            else if (item && gap.hasFirstPoint && (equality || line.itemsOneValue))
                line.addPoints(gap.start + 1, gap.start + item.value - 1, item.colour, item.index);
            else {
                const lsEnd = line.getItemsAtPositionB(gap.end + 1);
                const { item: itemE, equality: equalityE, index: indexE } = lsEnd;
                const range = ls.with(lsEnd);
                const sum = line.sum(true, range[0], range[1]);

                if (equalityE && (!itemE || gap.size < itemE.value))
                    line.addDots(gap.start, gap.end);
                else if (equality && equalityE && index > indexE)
                    line.addDots(gap.start, gap.end);
                //else if (equality && equalityE && sum > gap.size)
                //    line.addDots(gap.start, gap.end);
                else if (equalityE && gap.hasPoints && itemE && gap.size === itemE.value)
                    line.addPoints(gap.start, gap.end, itemE.colour, itemE.index);
                else if (item && itemE && sum === gap.size)
                    fullPart(line, gap.start, item.index, itemE.index);
                else if (item && itemE && (index === indexE || equality || equalityE)
                        && sum < gap.size && sum > gap.size / 2)
                    overlapPart(line, gap.start, gap.end, item.index, itemE.index);
            }
        }
    }
}