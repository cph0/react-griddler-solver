import { Action, Line } from "../classes/index";
import { Item } from "../interfaces";
import forEachLine from "./forEachLine";
import { fullPart } from "./fullLine";
import { overlapPart } from "./overlapLine";

export default function lineBlocks(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const [lineIsolated, isolatedItems] = line.isLineIsolated();
        for (const [block, gap, ls, skip] of line.getBlocks(true)) {
            const isolatedItem = isolatedItems.get(skip.blockCount);
            const { index, equalityIndex, equality, valid, indexAtBlock } = ls;
            const lsEnd = line.getItemsAtPositionB(gap, block);
            const { index: indexE, equalityIndex: equalityIndexE,
                equality: equalityE, valid: validE, indexAtBlock: indexAtBlockE } = lsEnd;

            //no join
            if (!line.dots.has(block.end + 1) && line.points.has(block.end + 2)) {
                const nextBlock = gap.getBlockAtStart(block.end + 2);
                if (nextBlock && block.colour === nextBlock.colour
                    && line.items.every(e => (e.value > 1 || e.colour === block.colour)
                        && e.value < nextBlock.end - block.start + 1)) {
                    line.addDot(block.end + 1, Action.NoJoin);
                    continue;
                }
            }

            //must join
            if (!line.dots.has(block.end + 1) && !line.points.has(block.end + 1)
                && line.points.has(block.end + 2)
                && !line.some(line.pair(), s => block.canBe(s[0])
                    && s[0].value <= block.end - gap.start + 1
                    && s[1].value <= gap.end - (block.end + 1 + line.dotCount(s[0].index)) + 1)) {
                const pointsChange = line.points.size;
                line.addPoint(block.end + 1, block.colour, Action.MustJoin);
                if(pointsChange != line.points.size)
                    break;
            } else if (equality && equalityE && index + 1 === indexE) {
                const lastBlock = gap.getLastBlock(block.start - 1);
                const nextBlock = gap.getNextBlock(block.end + 1);

                if (lastBlock && nextBlock) {
                    const isolated = line.isolatedPart(index, block, lastBlock);

                    if (isolated) {
                        const pointsChange = line.points.size;
                        line.addPoints(block.end + 1, nextBlock.start - 1, block.colour, Action.MustJoin);
                        if(pointsChange != line.points.size)
                            break;
                    }
                }
            }

            //min item backwards
            const minItemBackwards = () => {

                if (equalityE && validE) {
                    const nextBlock = gap.getNextBlock(block.start + 1);
                    if (nextBlock) {
                        const itemShift = line.sumWhile(indexE, gap, block, false);
                        const isolated = line.isolatedPart(indexE, block, nextBlock, false);

                        if (itemShift === 1 && isolated)
                            return line.sum(true, line.filterItems(indexE - 1, indexE));
                    }
                }

                if (index === 0 && block.end === gap.end && skip.blockCount === 1) {
                    const iS = line.sumWhile(0, gap);
                    if (iS === 2 && skip.lastBlock
                        && line.isolatedPart(iS - 2, block, skip.lastBlock))
                        return line.items[iS - 1].value;
                }

                return line.min(line.itemsInRange(ls, lsEnd), block);
            }
            const mB = minItemBackwards();
            if (gap.end - mB + 1 < block.start) {
                line.addPoints(gap.end - mB + 1, block.start - 1, block.colour, Action.MinItem);
                continue;
            }

            //min item forwards
            const minItemForwards = () => {
                const distinctItems = new Set(line.items
                    .filter(f => block.canBe(f))
                    .map(m => m.value));

                if (distinctItems.size === 1)
                    return (line.items.find(f => block.canBe(f)) as Item).value;

                if (equality && valid) {
                    const lastBlock = gap.getLastBlock(block.start - 1);
                    if (lastBlock) {
                        const itemShift = line.sumWhile(index, gap, block);
                        const isolated = line.isolatedPart(index, block, lastBlock);

                        if (itemShift === 1 && isolated)
                            return line.sum(true, line.filterItems(index, index + 1));
                    }
                }

                return line.min(line.itemsInRange(ls, lsEnd), block);
            }
            const m = minItemForwards();
            if (gap.start + m - 1 > block.end) {
                const pointsChange = line.points.size;
                line.addPoints(block.end + 1, gap.start + m - 1, block.colour, Action.MinItem);
                if(pointsChange != line.points.size)
                    break;
            }

            //single item start
            const singleItemStart = () => {
                let singleItem;

                if (lineIsolated && (gap.numberOfBlocks === 1 || skip.blockCount === 0
                    || !gap.getLastBlock(block.start - 1))
                    && block.end - line.items[skip.blockCount].value >= gap.start) {
                    singleItem = line.items[skip.blockCount].value;
                }
                else if (isolatedItem && (gap.numberOfBlocks === 1 || skip.blockCount === 0
                    || !gap.getLastBlock(block.start - 1))
                    && block.end - line.items[isolatedItem].value >= gap.start) {
                    singleItem = line.items[isolatedItem].value;
                }
                else if (equality && equalityE && index === indexE
                    && gap.numberOfBlocks === 1) {
                    singleItem = line.filterItems(index, indexE)[0].value;
                }
                else {
                    const items = line.filter(line.itemsInRange(ls), f => block.canBe(f));
                    if (items.length === 1 && items[0].index === equalityIndex)
                        singleItem = items[0].value;
                }

                return singleItem;
            }
            const sis = singleItemStart();
            if (sis && block.end - sis >= gap.start) {
                line.addDots(gap.start, block.end - sis, Action.ItemBackwardReach);
                skip.i = block.end;
            }

            //single item end
            const singleItemEnd = () => {
                let singleItem;

                if (lineIsolated && (gap.numberOfBlocks === 1
                    || skip.blockCount === line.lineItems - 1 || !gap.getNextBlock(block.end + 1))) {
                    singleItem = line.items[skip.blockCount].value;
                }
                //breaks sevenswansswimming45x35, daffodills30x35, +1 more
                //else if (isolatedItem && (gap.numberOfBlocks === 1
                //    || isolatedItem === line.lineItems - 1 || !gap.getNextBlock(block.end + 1))) {
                //    singleItem = line.items[isolatedItem].value;
                //}
                else if (equality && indexAtBlock === index && gap.numberOfBlocks === 1
                    && (index + 1 > line.lineItems - 1 || !line.fitsInSpace(block, gap, index + 1))) {
                    singleItem = line.items[index].value;
                }
                else {
                    const items = line.filter(line.itemsInRange(lsEnd), f => block.canBe(f));
                    if (items.length === 1 && items[0].index === equalityIndexE)
                        singleItem = items[0].value;
                }

                return singleItem;
            }
            const sie = singleItemEnd();
            if (sie && block.start + sie <= gap.end)
                line.addDots(block.start + sie, gap.end, Action.ItemForwardReach);

            //sum dot forward
            if (valid && indexAtBlock - 1 >= 0 && indexAtBlock - 1 <= line.lineItems - 1
                && line.filterItems(equalityIndex, indexAtBlock - 1).every(e => block.is(e))
                && gap.start + line.sum(true, line.filterItems(index, indexAtBlock - 1)) - 1
                === block.start - 1 - line.dotCount(indexAtBlock - 1)) {
                const gapStart = gap.start;
                line.addDot(block.start - 1, Action.SumDotForward);

                if (block.start - 1 > gapStart) {
                    skip.blockCount--;
                    continue;
                }
                else
                    skip.i = block.end;
            }

            //sum dot backward
            if (validE && indexAtBlockE >= 0 && indexAtBlockE + 1 <= line.lineItems - 1
                && line.filterItems(indexAtBlockE + 1, equalityIndexE).every(e => block.is(e)
                && gap.end - line.sum(true, line.filterItems(indexAtBlockE + 1, indexE)) + 1
                === block.end + 1 + line.dotCount(indexAtBlockE))) {
                line.addDot(block.end + 1, Action.SumDotBackward);
            }

            //half gap overlap backwards
            const uniqueItems = line.itemsInRange(ls, lsEnd).filter(f => block.canBe(f));
            const halfGapOverlapBackwards = () => {
                if (uniqueItems.length === 1 && uniqueItems[0].index > index)
                    return [index, uniqueItems[0].index];
                else if (validE && equality && indexAtBlockE - 1 >= 0)
                    return [equalityIndex, indexAtBlockE];
            }
            const hGapOvBck = halfGapOverlapBackwards();
            if (hGapOvBck) {
                const sum = line.sum(true, line.filterItems(hGapOvBck[0], hGapOvBck[1] - 1));
                const space = line.spaceBetween(gap, block, line.items[hGapOvBck[1] - 1]);
                if (sum < space[0] && sum > space[0] / 2) {
                    const pointsChange = line.points.size;
                    overlapPart(line, gap.start, block.start - 1 - space[2], hGapOvBck[0], hGapOvBck[1] - 1, Action.HalfGapOverlap);
                    if(pointsChange != line.points.size)
                        break;
                }
            }

            //half gap overlap forwards
            const halfGapOverlapForwards = () => {
                if (valid && equalityE && indexAtBlock + 1 <= line.lineItems - 1)
                    return [indexAtBlock, equalityIndexE];
            }
            const hGapOvFor = halfGapOverlapForwards();
            if (hGapOvFor) {
                const sum = line.sum(true, line.filterItems(hGapOvFor[0] + 1, hGapOvFor[1]));
                const space = line.spaceBetween(block, gap, line.items[hGapOvFor[0]]);
                if (sum < space[0] && sum > space[0] / 2) {
                    const pointsChange = line.points.size;
                    overlapPart(line, block.end + 1 + space[1], gap.end, hGapOvFor[0] + 1, hGapOvFor[1], Action.HalfGapOverlap);
                    if(pointsChange != line.points.size)
                        break;
                }
            }

            //half gap full part forwards
            if (hGapOvFor) {
                const sum = line.sum(true, line.filterItems(hGapOvFor[0] + 1, hGapOvFor[1]));
                const space = line.spaceBetween(block, gap, line.items[hGapOvFor[0]]);
                if(sum === space[0])
                    fullPart(line, block.end + 1 + space[1], hGapOvFor[0] + 1, hGapOvFor[1], Action.HalfGapFullPart);
            }

            //half gap full part backwards
            //if (hGapOvBck) {
            //    const sum = line.sum(true, line.filterItems(hGapOvBck[0], hGapOvBck[1] - 1));
            //    const space = line.spaceBetween(gap, block, line.items[hGapOvBck[1] - 1]);
            //    if (sum === space[0]) {
            //        const pointsChange = line.points.size;
            //        overlapPart(line, gap.start, block.start - 1 - space[2], hGapOvBck[0], hGapOvBck[1] - 1, Action.HalfGapOverlap);
            //        if(pointsChange != line.points.size)
            //            break;
            //    }
            //}

            //isolated items reach
            if (lineIsolated && gap.numberOfBlocks > 1
                && skip.blockCount < line.lineItems - 1) {
                const nextItem = line.items[skip.blockCount + 1];
                const start = block.start + line.items[skip.blockCount].value;
                const nextBlock = gap.getNextBlock(block.end + 1);

                if (nextBlock)
                    line.addDots(start, nextBlock.end - nextItem.value, Action.IsolatedItemsReach);
            }
            else if (isolatedItem && isolatedItem !== isolatedItems.get(skip.blockCount + 1)
                && gap.numberOfBlocks > 1 && isolatedItem < line.lineItems - 1) {
                const nextItem = line.items[isolatedItem + 1];
                const start = block.start + line.items[isolatedItem].value;
                const nextBlock = gap.getNextBlock(block.end + 1);

                if (nextBlock)
                    line.addDots(start, nextBlock.end - nextItem.value, Action.IsolatedItemsReach);
            }
        }
    }
}