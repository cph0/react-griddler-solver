import { Action, Block, Line } from "../classes/index";
import { Item } from "../interfaces";
import forEachLine from "./forEachLine";
import { overlapPart } from "./overlapLine";

export default function lineBlocks(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const lineIsolated = line.isLineIsolated();
        let lastBlock: Block | undefined;
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {

            if (gap.isFull) {
                blockCount++;
                continue;
            }

            const { index, equalityIndex, equality, valid, indexAtBlock } = ls;
            const lsEnd = line.getItemsAtPositionB(gap, block);
            const { index: indexE, equalityIndex: equalityIndexE,
                equality: equalityE, valid: validE } = lsEnd;

            //no join
            if (!line.dots.has(block.end + 1) && line.points.has(block.end + 2)) {
                const nextBlock = gap.getBlockAtStart(block.end + 2);
                if (nextBlock && block.colour === nextBlock.colour
                    && line.items.every(e => (e.value > 1 || e.colour === block.colour)
                        && e.value < nextBlock.end - block.start + 1)) {
                    line.addDot(block.end + 1, Action.NoJoin);
                    blockCount++;
                    continue;
                }
            }

            //must join
            if (!line.dots.has(block.end + 1) && !line.points.has(block.end + 1)
                && line.points.has(block.end + 2)
                && !line.some(line.pair(), s => block.canBe(s[0])
                    && s[0].value <= block.end - gap.start + 1
                    && s[1].value <= gap.end - (block.end + 1 + line.dotCount(s[0].index)) + 1)) {
                line.addPoint(block.end + 1, block.colour, Action.MustJoin);
            } else if (equality && equalityE && index + 1 === indexE) {
                const lastBlock = gap.getLastBlock(block.start - 1);
                const nextBlock = gap.getNextBlock(block.end + 1);

                if (lastBlock && nextBlock) {
                    const isolated = line.isolatedPart(index, block, lastBlock);

                    if (isolated)
                        line.addPoints(block.end + 1, nextBlock.start - 1, block.colour, Action.MustJoin);
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

                if (index === 0 && block.end === gap.end && blockCount === 1) {
                    const iS = line.sumWhile(0, gap);
                    if (iS === 2 && lastBlock
                        && line.isolatedPart(iS - 2, block, lastBlock))
                        return line.items[iS - 1].value;
                }

                return line.min(line.itemsInRange(ls, lsEnd), block);
            }
            const mB = minItemBackwards();
            if (gap.end - mB + 1 < block.start)
                line.addPoints(gap.end - mB + 1, block.start - 1, block.colour, Action.MinItem);

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
            if (gap.start + m - 1 > block.end)
                line.addPoints(block.end + 1, gap.start + m - 1, block.colour, Action.MinItem);

            //single item start
            const singleItemStart = () => {
                let singleItem;

                if (lineIsolated && (gap.numberOfBlocks === 1 || blockCount === 0
                    || !gap.getLastBlock(block.start - 1))
                    && block.end - line.items[blockCount].value >= gap.start) {
                    singleItem = line.items[blockCount].value;
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
                    || blockCount === line.lineItems - 1 || !gap.getNextBlock(block.end + 1))) {
                    singleItem = line.items[blockCount].value;
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

            //sum dot forward - for little20x20 breaks joker30x30
            //if (valid && indexAtBlock - 1 >= 0 && indexAtBlock - 1 <= line.lineItems - 1
            //    && line.filterItems(equalityIndex, indexAtBlock - 1)
            //        .every(e => block.is(e))
            //    && gap.start + line.sum(true, line.filterItems(index, indexAtBlock - 1)) - 1
            //    === block.start - 1 - line.dotCount(indexAtBlock - 1)) {
            //    line.addDot(block.start - 1, Action.SumDotForward);

            //    if (block.start - 1 > gap.start) {
            //        blockCount--;
            //        continue;
            //    }
            //    else
            //        skip.i = block.end;
            //}

            //half gap overlap backwards
            const uniqueItems = line.itemsInRange(ls, lsEnd).filter(f => block.canBe(f));
            if (uniqueItems.length === 1 && uniqueItems[0].index > index) {
                const sum = line.sum(true, line.filterItems(index, uniqueItems[0].index - 1));
                const dotCount = line.dotCount(uniqueItems[0].index, false);
                const space = block.start - gap.start - 1 - dotCount;//line.spaceBetween(,); 
                if (sum <= space && sum > space / 2)
                    overlapPart(line, gap.start, block.start - 1 - dotCount, index, uniqueItems[0].index - 1, Action.HalfGapOverlap);
            }

            //half gap overlap forwards
            //if (uniqueItems.length === 1 && uniqueItems[0].index < indexE) {
            //    const sum = line.sum(true, line.filterItems(uniqueItems[0].index, indexE));
            //    const dotCount = line.dotCount(uniqueItems[0].index);
            //    const space = gap.end - (block.end + dotCount);
            //    if (sum <= space && sum > space / 2)
            //        overlapPart(line, block.end + 1 + dotCount, gap.end, uniqueItems[0].index, indexE, Action.HalfGapOverlap);
            //}

            //isolated items reach
            if (lineIsolated && gap.numberOfBlocks > 1
                && blockCount < line.lineItems - 1) {
                const nextItem = line.items[blockCount + 1];
                const start = block.start + line.items[blockCount].value;
                const nextBlock = gap.getNextBlock(block.end + 1);

                if (nextBlock)
                    line.addDots(start, nextBlock.end - nextItem.value, Action.IsolatedItemsReach);
            }

            blockCount++;
            lastBlock = block;
        }
    }
}