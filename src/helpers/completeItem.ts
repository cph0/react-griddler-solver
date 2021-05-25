import { Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function completeItem(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const isLineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {
            const { indexAtBlock, equalityIndex } = ls;

            //max item
            if (line.maxItem === block.size) {
                line.addDot(block.start - 1);
                line.addDot(block.end + 1);
                
                if (block.start - 1 > gap.start)
                    blockCount--;
                else
                    skip.i = block.end;
            }
            else if (isLineIsolated && blockCount < line.lineItems
                && line.items[blockCount].value === block.size) {
                if (block.start - 1 > gap.start)
                    blockCount--;
                else
                    skip.i = block.end;

                line.addDot(block.start - 1);
                line.addDot(block.end + 1);                
            }
            else if (line.filterItems(equalityIndex, indexAtBlock).every(e => e.value <= block.size)) {
                if (block.start - 1 > gap.start)
                    blockCount--;
                else
                    skip.i = block.end;

                line.addDot(block.start - 1);
                line.addDot(block.end + 1);
            }
            else {
                const lsEnd = line.getItemsAtPositionB(gap.end + 1);
                //const { item: itemE, equality: equalityE, index: indexE } = lsEnd;
                const range = ls.with(lsEnd, false);
                const itemsInRange = line.filterItems(range[0], range[1]);
                if (itemsInRange.every(e => e.value <= block.size)) {
                    if (block.start - 1 > gap.start)
                        blockCount--;
                    else
                        skip.i = block.end;

                    line.addDot(block.start - 1);
                    line.addDot(block.end + 1);
                }
            }

            blockCount++;
        }
    }
}