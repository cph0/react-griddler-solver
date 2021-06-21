import { Action, Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function completeItem(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const [isLineIsolated, isolatedItems] = line.isLineIsolated();
        const lineOneColour = line.itemsOneColour;
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {
            const { equalityIndex } = ls;
            const isolatedItem = isolatedItems.get(blockCount);

            const compItem = () => {
                if (line.maxItem === block.size)
                    return [lineOneColour, lineOneColour];
                else if (isLineIsolated && blockCount < line.lineItems
                    && line.items[blockCount].value === block.size) {
                    return line.shouldAddDots(blockCount);
                }
                else if (isolatedItem && isolatedItem < line.lineItems
                    && line.items[isolatedItem].value === block.size) {
                    return line.shouldAddDots(isolatedItem);
                }
                else if (line.itemsInRange(ls).every(e => block.isOrCantBe(e)))
                    return [lineOneColour, lineOneColour];

                const lastBlock = gap.getLastBlock(block.start - 1);
                if (lastBlock) {
                    const items = line.itemsInRange(ls);
                    const lastItem = items.find(f => lastBlock.canBe(f));

                    if (lastItem && items.every(e => line.isolatedPart(e.index, block, lastBlock))
                        && line.every(items.filter(f => f.index > lastItem.index), f => block.isOrCantBe(f)))
                        return [lineOneColour, lineOneColour];
                }

                const lsEnd = line.getItemsAtPositionB(gap, block);
                const { equalityIndex: equalityIndexE } = lsEnd;

                if (lastBlock) {
                    const itemsInRange = line.filterItems(equalityIndex, equalityIndexE);
                    if (itemsInRange.some(s => block.is(s))
                        && !itemsInRange.some(s => line.fitsInSpace(lastBlock, block, s)) //relax this!
                        && !line.some(line.pair(itemsInRange), f => lastBlock.canBe(f[0]) && f[1].value > block.size)
                        && itemsInRange.every(e => line.isolatedPart(e.index, block, lastBlock)))
                        return [lineOneColour, lineOneColour];
                }

                const nextBlock = gap.getNextBlock(block.end + 1);
                if (nextBlock) {
                    const items = line.itemsInRange(lsEnd);
                    const lastItem = line.find(line.loopItr(items, false), f => nextBlock.canBe(f));
                    if (lastItem && items.every(e => line.isolatedPart(e.index, block, nextBlock, false))
                        && line.every(items.filter(f => f.index < lastItem.index), f => block.isOrCantBe(f)))
                        return [lineOneColour, lineOneColour];
                }

                if (nextBlock) {
                    const nextItem = line.filter(line.items, f => nextBlock.canBe(f));
                    const endIndex = nextItem.length === 1 ? nextItem[0].index : equalityIndexE;
                    const itemsInRange = line.filterItems(equalityIndex, endIndex - 1);
                    if (itemsInRange.every(e => block.isOrCantBe(e))
                        && line.isolatedPart(endIndex, block, nextBlock, false))
                        return [lineOneColour, lineOneColour];
                }

                if (line.itemsInRange(ls, lsEnd).every(e => block.isOrCantBe(e)))
                    return [lineOneColour, lineOneColour];
            }

            const compItm = compItem();
            if (compItm) {
                if (compItm[0]) {
                    if (block.start - 1 > gap.start)
                        blockCount--;
                    else
                        skip.i = block.end;

                    line.addDot(block.start - 1, Action.CompleteItem);
                }

                if (compItm[1])
                    line.addDot(block.end + 1, Action.CompleteItem);
            }

            blockCount++;
        }
    }
}