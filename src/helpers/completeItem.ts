import { Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function completeItem(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const isLineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, , skip] of line.getBlocks()) {

            //max item
            if (line.maxItem === block.size) {
                line.addDot(block.start - 1);
                line.addDot(block.end + 1);
                skip.i = block.end + 1;
            }
            else if (isLineIsolated && blockCount < line.lineItems
                && line.items[blockCount].value === block.size) {
                line.addDot(block.start - 1);
                line.addDot(block.end + 1);
                skip.i = block.end + 1;
            }

            blockCount++;
        }

    }
}