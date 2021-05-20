import { Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function lineBlocks(lines: Line[]) {
    for (const line of forEachLine(lines)) {
        const lineIsolated = line.isLineIsolated();
        let blockCount = 0;

        for (const [block, gap, ls, skip] of line.getBlocks(true)) {

            if (gap.isFull) {
                blockCount++;
                continue;
            }

            const { index, equalityIndex, equality, item } = ls;
            const lsEnd = line.getItemsAtPositionB(gap.end + 1);
            const { index: indexE, equalityIndex: equalityIndexE } = lsEnd;

            //no join
            if (!line.dots.has(block.end + 1) && line.points.has(block.end + 2)) {
                const nextBlock = gap.getBlockAtStart(block.end + 2);
                if (nextBlock && line.items.every(e => e.value < nextBlock.end - block.start + 1)) {
                    line.addDot(block.end + 1);
                    skip.i = block.end + 2;
                    blockCount++;
                    continue;
                }
            }

            //must join
            if (!line.dots.has(block.end + 1) && !line.points.has(block.end + 1)
                && line.points.has(block.end + 2)) {
                if (!line.some(line.pair(), s => s[0].value >= block.size
                    && s[0].value <= block.end - gap.start + 1
                    && s[1].value <= gap.end - (block.end + 2) + 1)) {
                    line.addPoint(block.end + 1, block.colour as string);
                }
            }

            //min item backwards
            const minItemBackwards = () => {
                let minItem = line.minItem;

                if (indexE > 0 || equalityIndexE < line.lineItems - 1)
                    minItem = line.min(indexE, equalityIndexE, block.size);

                return minItem;
            }
            const mB = minItemBackwards();
            if (gap.end - mB + 1 < block.start) {
                line.addPoints(gap.end - mB + 1, block.start - 1, "black");
            }

            //min item forwards
            const minItemForwards = () => {
                let minItem = line.minItem;
                const distinctItems = new Set(line.items
                    .filter(f => f.value >= block.size)
                    .map(m => m.value));

                if (distinctItems.size === 1)
                    minItem = line.items.map(m => m.value).find(f => f >= block.size) as number;
                else if (equalityIndex > 0 || index < line.lineItems - 1)
                    minItem = line.min(equalityIndex, index, block.size);

                return minItem;
            }
            const m = minItemForwards();
            if (gap.start + m - 1 > block.end) {
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

            //single item end
            const singleItemEnd = () => {
                let singleItem;

                if (lineIsolated && (gap.numberOfBlocks === 1
                    || blockCount === line.lineItems - 1)) {
                    singleItem = line.items[blockCount].value;
                }
                else if ((indexE > 0 || equalityIndexE < line.lineItems - 1)
                            && line.min(indexE, equalityIndexE) >= gap.end - block.end) {
                    singleItem = line.max(indexE, equalityIndexE);
                }

                return singleItem;
            }
            const sie = singleItemEnd();
            if (sie && block.start + sie <= gap.end) {
                line.addDots(block.start + sie, gap.end);
                skip.i = block.end;
            }

            blockCount++;
        }
    }
}