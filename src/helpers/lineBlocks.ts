import { Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function lineBlocks(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const lineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {
            const { equality, item } = ls;

            //no join
            if (!line.dots.has(block.end + 1) && line.points.has(block.end + 2)) {
                const nextBlock = gap.getBlockAtStart(block.end + 2);
                if (nextBlock && line.items.every(e => e.value < nextBlock.end - block.start + 1))
                    line.addDot(block.end + 1);
            }

            //must join
            if (!line.dots.has(block.end + 1) && !line.points.has(block.end + 1)
                && line.points.has(block.end + 2)) {
                if (!line.some(line.pair(), s => s[0].value >= block.size
                    && s[0].value <= block.end - gap.start + 1
                    && s[1].value <= gap.end - (block.end + 2) + 1))
                    line.addPoint(block.end + 1, block.colour as string);
            }

            //min item backwards
            if (gap.end - line.minItem < block.start) {
                line.addPoints(gap.end - line.minItem + 1, block.start - 1, "black");
            }

            //min item forwards
            const minItem = () => {
                let minItem = line.minItem;
                const distinctItems = new Set(line.items
                    .filter(f => f.value >= block.size)
                    .map(m => m.value));

                if (distinctItems.size === 1)
                    minItem = line.items.map(m => m.value).find(f => f >= block.size) as number;

                if (equality && item && gap.start + item.value >= block.start)
                    minItem = item.value;

                return minItem;
            }
            const m = minItem();
            if (gap.start + m > block.start) {
                line.addPoints(block.end + 1, gap.start + m - 1, "black");
            }

            //single item start
            if (equality && item && gap.start + item.value >= block.start
                && block.end - item.value >= gap.start) {
                line.addDots(gap.start, block.end - item.value);
                skip.i = block.end;
            }
            else if (lineIsolated && (gap.numberOfBlocks === 1 || blockCount === 0)
                && block.end - line.items[blockCount].value >= gap.start) {
                line.addDots(gap.start, block.end - line.items[blockCount].value);
                skip.i = block.end;
            }
            else if (lineIsolated && (gap.numberOfBlocks === 1 || blockCount === line.lineItems - 1)
                && block.start + line.items[blockCount].value <= gap.end) {
                line.addDots(block.start + line.items[blockCount].value, gap.end);
                skip.i = block.end;
            }

            blockCount++;
        }
    }
}