import { Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function lineBlocks(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const lineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {
            const { equality, item } = ls;

            //no join
            //if (!line.dots.has(block.end + 1) && line.points.has(block.end + 2)) {
            //    const nextBlock = line.getBlocks();

            //    if (line.items.every(e => e.value < nextBlock.end - block.start - 1))
            //        line.addDot(block.end + 1);
            //}

            //single item start
            if (equality && item && gap.start + item.value >= block.start
                && block.end - item.value >= gap.start) {
                line.addDots(gap.start, block.end - item.value);
                skip.i = gap.end;
            }
            else if (lineIsolated && blockCount === 0
                    && block.end - line.items[blockCount].value >= gap.start) {
                line.addDots(gap.start, block.end - line.items[blockCount].value);
                skip.i = gap.end;
            }
            else if (lineIsolated && blockCount === line.lineItems - 1
                && block.start + line.items[blockCount].value <= gap.end) {
                line.addDots(block.start + line.items[blockCount].value, gap.end);
                skip.i = gap.end;
            }

            blockCount++;
        }
    }
}