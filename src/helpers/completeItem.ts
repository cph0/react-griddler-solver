import { Action, Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function completeItem(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const isLineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {
            const { indexAtBlock, equalityIndex } = ls;

            const compItem = () => {
                //max item
                if (line.maxItem === block.size)
                    return true;
                else if (isLineIsolated && blockCount < line.lineItems
                    && line.items[blockCount].value === block.size) {
                    return true;
                }
                else if (line.filterItems(equalityIndex, indexAtBlock)
                    .every(e => e.value <= block.size)) {
                    return true;
                }
                else {
                    const lsEnd = line.getItemsAtPositionB(gap.end + 1);
                    const { equalityIndex: equalityIndexE, index: indexE } = lsEnd;
                    const sum = gap.end - block.end - 1;
                    const indexAtBlockE = indexE - line.sumWhile(indexE, s => s <= sum, false);
                    const range = ls.with(lsEnd, false);
                    const itemsInRange = line.filterItems(range[0], range[1]);
                    if (itemsInRange.every(e => e.value <= block.size))
                        return true;
                    else if (line.filterItems(indexAtBlockE, equalityIndexE)
                        .every(e => e.value <= block.size)) {
                        return true;
                    }
                }
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