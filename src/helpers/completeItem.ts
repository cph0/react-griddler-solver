import { Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function completeItem(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const isLineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {

            //max item
            if (line.maxItem === block.size) {
                line.addDot(block.start - 1);
                line.addDot(block.end + 1);
                skip.i = block.end;
            }
            else if (isLineIsolated && blockCount < line.lineItems
                && line.items[blockCount].value === block.size) {
                line.addDot(block.start - 1);
                line.addDot(block.end + 1);
                skip.i = block.end;
            }
            else {
                const lsEnd = line.getItemsAtPositionB(gap.end + 1);
                //const { item: itemE, equality: equalityE, index: indexE } = lsEnd;
                const range = ls.with(lsEnd, false);
                const itemsInRange = line.filterItems(range[0], range[1]);
                if (itemsInRange.every(e => e.value <= block.size)) {
                    line.addDot(block.start - 1);
                    line.addDot(block.end + 1);
                    skip.i = block.end;
                }
            }

            blockCount++;
        }

    }
}