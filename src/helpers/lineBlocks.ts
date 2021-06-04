import { Action, Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function lineBlocks(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const lineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {

            if (gap.isFull) {
                blockCount++;
                continue;
            }

            const { index, equalityIndex, equality, valid } = ls;
            const lsEnd = line.getItemsAtPositionB(gap.end + 1);
            const { index: indexE, equalityIndex: equalityIndexE,
                equality: equalityE, valid: validE } = lsEnd;

            //no join
            if (!line.dots.has(block.end + 1) && line.points.has(block.end + 2)) {
                const nextBlock = gap.getBlockAtStart(block.end + 2);
                if (nextBlock && line.items.every(e => e.value < nextBlock.end - block.start + 1)) {
                    line.addDot(block.end + 1, Action.NoJoin);
                    blockCount++;
                    continue;
                }
            }

            //must join
            if (!line.dots.has(block.end + 1) && !line.points.has(block.end + 1)
                && line.points.has(block.end + 2)
                && !line.some(line.pair(), s => s[0].value >= block.size
                    && s[0].value <= block.end - gap.start + 1
                    && s[1].value <= gap.end - (block.end + 2) + 1)) {                
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
                let minItem = line.minItem;

                if ((indexE > 0 || equalityIndexE < line.lineItems - 1)
                    && !line.filterItems(indexE, equalityIndexE)
                        .some(s => gap.end - s.value > block.end)) {
                    minItem = line.min(indexE, equalityIndexE, block.size);
                } else if (equalityE && validE) {
                    const nextBlock = gap.getNextBlock(block.start + 1);
                    if (nextBlock) {
                        const sum = gap.end - block.end - 1;
                        const itemShift = line.sumWhile(indexE, s => s <= sum, false);
                        const isolated = line.isolatedPart(indexE, block, nextBlock, false);

                        if (itemShift === 1 && isolated) {
                            minItem = line.sum(true, indexE - 1, indexE);
                        }
                    }
                }

                return minItem;
            }
            const mB = minItemBackwards();
            if (gap.end - mB + 1 < block.start)
                line.addPoints(gap.end - mB + 1, block.start - 1, "black", Action.MinItem);

            //min item forwards
            const minItemForwards = () => {
                let minItem = line.minItem;
                const distinctItems = new Set(line.items
                    .filter(f => f.value >= block.size)
                    .map(m => m.value));

                if (distinctItems.size === 1)
                    minItem = line.items.map(m => m.value).find(f => f >= block.size) as number;
                else if ((equalityIndex > 0 || index < line.lineItems - 1)
                    && !line.filterItems(equalityIndex, index)
                        .some(s => gap.start + s.value < block.start)) {
                    minItem = line.min(equalityIndex, index, block.size);
                } else if (equality && valid) {
                    const lastBlock = gap.getLastBlock(block.start - 1);
                    if (lastBlock) {
                        const sum = block.start - gap.start - 1;
                        const itemShift = line.sumWhile(index, s => s <= sum);
                        const isolated = line.isolatedPart(index, block, lastBlock);

                        if (itemShift === 1 && isolated) {
                            minItem = line.sum(true, index, index + 1);
                        }
                    }
                }

                return minItem;
            }
            const m = minItemForwards();
            if (gap.start + m - 1 > block.end)
                line.addPoints(block.end + 1, gap.start + m - 1, "black", Action.MinItem);

            //single item start
            const singleItemStart = () => {
                let singleItem;

                if (lineIsolated && (gap.numberOfBlocks === 1 || blockCount === 0)
                    && block.end - line.items[blockCount].value >= gap.start) {
                    singleItem = line.items[blockCount].value;
                }
                else if (equality && equalityE && index === indexE
                    && gap.numberOfBlocks === 1) {
                    singleItem = line.filterItems(index, indexE)[0].value;
                }
                else if ((equalityIndex > 0 || index < line.lineItems - 1)
                    && line.min(equalityIndex, index) >= block.start - gap.start) {
                    singleItem = line.max(equalityIndex, index);
                }
                else if (line.items.filter(f => f.value >= block.size).length === 1) {
                    const itm = line.items.find(f => f.value >= block.size);
                    if (itm && itm.index === 0)
                        singleItem = itm.value;
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
                    || blockCount === line.lineItems - 1)) {
                    singleItem = line.items[blockCount].value;
                }
                else if ((indexE > 0 || equalityIndexE < line.lineItems - 1)
                            && line.min(indexE, equalityIndexE) >= gap.end - block.end) {
                    singleItem = line.max(indexE, equalityIndexE);
                }
                else if (line.items.filter(f => f.value >= block.size).length === 1) {
                    const itm = line.items.find(f => f.value >= block.size);
                    if(itm && itm.index === line.lineItems - 1)
                        singleItem = line.items.map(m => m.value).find(f => f >= block.size);
                }

                return singleItem;
            }
            const sie = singleItemEnd();
            if (sie && block.start + sie <= gap.end)
                line.addDots(block.start + sie, gap.end, Action.ItemForwardReach);

            //isolated items reach
            if (lineIsolated && gap.numberOfBlocks > 1
                && blockCount < line.lineItems - 1) {
                const nextItem = line.items[blockCount + 1];
                const start = block.start + line.items[blockCount].value;
                const nextBlock = gap.getNextBlock(start);

                if(nextBlock)
                    line.addDots(start, nextBlock.end - nextItem.value, Action.IsolatedItemsReach);
            }

            blockCount++;
        }
    }
}