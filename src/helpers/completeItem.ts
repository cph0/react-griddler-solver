import { Action, Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function completeItem(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const isLineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {

            const compItem = () => {
                if (line.maxItem === block.size)
                    return true;
                else if (isLineIsolated && blockCount < line.lineItems
                    && line.items[blockCount].value === block.size) {
                    return true;
                }
                else if (line.itemsInRange(ls).every(e => e.value <= block.size))
                    return true;
                else {
                    const nextBlock = gap.getNextBlock(block.end + 1);
                    if (nextBlock) {
                        const nextItem = line.filter(line.items, f => f.value >= nextBlock.size);
                        if (nextItem.length === 1 && nextItem[0].index > 0
                            && line.items[nextItem[0].index - 1].value === block.size
                            && !line.some(line.filterItems(0, nextItem[0].index - 1),
                                f => line.fitsInSpace(block, nextBlock, f))
                            && line.isolatedPart(nextItem[0].index, block, nextBlock, false))
                            return true;
                    }
                }

                const lsEnd = line.getItemsAtPositionB(gap.end + 1, block);
                if (line.itemsInRange(ls, lsEnd).every(e => e.value <= block.size))
                    return true;                
            }

            if (compItem()) {
                if (block.start - 1 > gap.start)
                    blockCount--;
                else
                    skip.i = block.end;

                line.addDot(block.start - 1, Action.CompleteItem);
                line.addDot(block.end + 1, Action.CompleteItem);
            }

            blockCount++;
        }
    }
}