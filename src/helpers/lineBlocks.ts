import { Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function lineBlocks(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const lineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap] of line.getBlocks()) {

            //single item end
            if (lineIsolated && blockCount === line.lineItems - 1
                && block.start + line.items[blockCount].value < gap.end) {
                line.addDots(block.start + line.items[blockCount].value, gap.end);
            }

            blockCount++;
        }
    }
}