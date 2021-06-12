import { Action, Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function completeItem(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const isLineIsolated = line.isLineIsolated();
        const lineOneColour = line.itemsOneColour;
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {
            const { equalityIndex } = ls;
            const compItem = () => {
                if (line.maxItem === block.size)
                    return [lineOneColour, lineOneColour];
                else if (isLineIsolated && blockCount < line.lineItems
                    && line.items[blockCount].value === block.size) {
                    return line.shouldAddDots(blockCount);
                }
                else if (line.itemsInRange(ls).every(e => e.value <= block.size))
                    return [lineOneColour, lineOneColour];

                const lastBlock = gap.getLastBlock(block.start - 1);
                if (lastBlock) {
                    const items = line.itemsInRange(ls);
                    const lastItem = items.find(f => f.value >= lastBlock.size);
                    if (lastItem && items.every(e => line.isolatedPart(e.index, block, lastBlock))
                        && !line.some(items.filter(f => f.index > lastItem.index), f => f.value > block.size)                    )
                        return [lineOneColour, lineOneColour];
                }

                const lsEnd = line.getItemsAtPositionB(gap, block);
                const { equalityIndex: equalityIndexE } = lsEnd;

                if (lastBlock) {
                    const itemsInRange = line.filterItems(equalityIndex, equalityIndexE);
                    if (itemsInRange.some(s => s.value === block.size)
                        && !itemsInRange.some(s => line.fitsInSpace(lastBlock, block, s)) //relax this!
                        && !line.some(line.pair(itemsInRange), f => f[0].value >= lastBlock.size && f[1].value > block.size)
                        && itemsInRange.every(e => line.isolatedPart(e.index, block, lastBlock)))
                        return [lineOneColour, lineOneColour];
                }

                const nextBlock = gap.getNextBlock(block.end + 1);
                if (nextBlock) {
                    const items = line.itemsInRange(lsEnd);
                    const lastItem = line.find(line.loopItr(items, false), f => f.value >= nextBlock.size);
                    if (lastItem && items.every(e => line.isolatedPart(e.index, block, nextBlock, false))
                        && !line.some(items.filter(f => f.index < lastItem.index), f => f.value > block.size))
                        return [lineOneColour, lineOneColour];
                }

                if (nextBlock) {
                    const nextItem = line.filter(line.items, f => f.value >= nextBlock.size);
                    const endIndex = nextItem.length === 1 ? nextItem[0].index : equalityIndexE;
                    const itemsInRange = line.filterItems(equalityIndex, endIndex - 1);
                    if (itemsInRange.every(e => e.value === block.size)
                        && line.isolatedPart(endIndex, block, nextBlock, false))
                        return [lineOneColour, lineOneColour];
                }

                if (line.itemsInRange(ls, lsEnd).every(e => e.value <= block.size))
                    return [lineOneColour, lineOneColour];
            }

            const compItm = compItem();
            if (compItm) {
                if (block.start - 1 > gap.start)
                    blockCount--;
                else
                    skip.i = block.end;

                if (compItm[0])
                    line.addDot(block.start - 1, Action.CompleteItem);

                if (compItm[1])
                    line.addDot(block.end + 1, Action.CompleteItem);
            }

            blockCount++;
        }
    }
}