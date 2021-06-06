import { Line, Gap, Action } from "../classes/index";
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
        let lastGap: Gap | undefined;

        //min item
        for (const index of possibleIndexes(line.minItem - 1, 1)) {
            const gapsBySize = line.getGapsBySize(index);
            for (const gap of gapsBySize)
                line.addDots(gap.start, gap.end, Action.MinItem);
        }

        for (const [gap, ls, skip] of line.getGaps(true)) {
            const { item, equality, index } = ls;
            if (noItemForGap(gap, equality, item))
                line.addDots(gap.start, gap.end, Action.GapDots);
            else if (itemFillsGap(gap, equality, item) && item)
                line.addPoints(gap.start, gap.end, item.colour, Action.GapFull, item.index);
            else if (itemAtEdgeOfGap(gap.hasFirstPoint, equality, line, item) && item) {
                line.addPoints(gap.start + 1, gap.start + item.value - 1, item.colour, Action.CompleteItem, item.index);
                line.addDot(gap.start + item.value, Action.CompleteItem);
            }
            else {
                const lsEnd = line.getItemsAtPositionB(gap);
                const { item: itemE, equality: equalityE, index: indexE } = lsEnd;
                const range = ls.with(lsEnd);
                const sum = line.sum(true, line.filterItems(range[0], range[1]));

                const combinedEqualityNoItem = () => {
                    if (equalityE && lastGap && lastGap.isFull && index > indexE) {
                        const iS = line.sumWhile(indexE, gap, undefined, false);
                        if (!line.some(line.filterItems(indexE - iS, indexE - 1),
                            f => !!lastGap && f.value === lastGap.size))
                            return true;
                    }

                    if (equality && index > indexE) {
                        const nextGap = line.findGapAtPos(gap.end + 1);
                        if (nextGap && nextGap.isFull) {
                            const iS = line.sumWhile(index, gap);
                            if (!line.some(line.filterItems(index + 1, index + iS),
                                f => f.value === nextGap.size))
                            return true;
                        }
                    }
                }

                if (noItemForGap(gap, equalityE, itemE)
                    || (equality && equalityE && index > indexE)
                    || (equality && equalityE && sum > gap.size)
                    || combinedEqualityNoItem()
                )
                    line.addDots(gap.start, gap.end, Action.GapDots);
                else if (itemFillsGap(gap, equalityE, itemE) && itemE)
                    line.addPoints(gap.start, gap.end, itemE.colour, Action.GapFull, itemE.index);
                else if (itemAtEdgeOfGap(gap.hasLastPoint, equalityE, line, itemE) && itemE) {
                    if (gap.end - itemE.value === gap.start)
                        skip.i = gap.end;
                    line.addPoints(gap.end - itemE.value + 1, gap.end - 1, itemE.colour, Action.CompleteItem, itemE.index);
                    line.addDot(gap.end - itemE.value, Action.CompleteItem);
                }
                else if (gap.hasLastPoint && itemE
                    && new Set(line.filterItems(itemE.index).map(m => m.value)).size === 1) {
                    if (gap.end - itemE.value === gap.start)
                        skip.i = gap.end;
                    line.addPoints(gap.end - itemE.value + 1, gap.end - 1, itemE.colour, Action.CompleteItem, itemE.index);
                    line.addDot(gap.end - itemE.value, Action.CompleteItem);
                }
                else if (item && itemE && sum === gap.size)
                    fullPart(line, gap.start, item.index, itemE.index, Action.GapFull);
                else if (item && itemE && (index === indexE || equality || equalityE)
                    && sum < gap.size && sum > gap.size / 2)
                    overlapPart(line, gap.start, gap.end, item.index, itemE.index, Action.GapOverlap);
            }

            lastGap = gap;
        }
    }
}