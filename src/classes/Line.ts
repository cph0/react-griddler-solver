import 'regenerator-runtime/runtime';
import { Item, Block } from "../interfaces";

export class Index<T> {
    private indexes: Map<string, Map<any, number>>;
    private data: T[];

    constructor(indexes: string[], data: any[]) {
        this.indexes = new Map();
        this.data = data;

        for (const index of indexes) {
            const map = data.map((m, i) => [m[index], i]);
            //this.indexes.set(index, new Map(map));
        }
    }

    get(field: string, key: any) {
        const map = this.indexes.get(field);

        if (map) {
            const index = map.get(key);

            if (index)
                return this.data[index];
        }

        return null;
    }

}



export default class Line {
    private readonly _lineIndex: number;
    private _lineValue: number | undefined;
    private _minItem: number | undefined;
    private _maxItem: number | undefined;
    private _pairLines: Map<number, Line> = new Map();
    private readonly _gapsBySize: Map<number, Set<number>>;
    private readonly _gapsByStart: Map<number, Block>;
    //private readonly _blocksByStart: Map<number, Block>;
    //private _itemByPos: Map<number, number[]>;

    public readonly items: Item[];
    public readonly lineLength: number;
    //public readonly points: Map<number, string>;
    public readonly dots: Set<number>;
    public complete: boolean;

    get lineItems() {
        return this.items.length;
    }

    get lineValue() {

        if (!this._lineValue)
            this._lineValue = this.sum();

        return this._lineValue;
    }

    get minItem() {

        if (!this._minItem) {
            this._minItem = this.items.reduce((acc, item) => {
                if (!acc || item.value < acc)
                    return item.value;

                return acc;
            }, undefined as number | undefined) as number;
        }

        return this._minItem;
    }

    get maxItem() {

        if (!this._maxItem) {
            this._maxItem = this.items.reduce((acc, item) => {
                if (item.value > acc)
                    return item.value;

                return acc;
            }, 0);
        }

        return this._maxItem;
    }

    get lastItem() {
        return this.items[this.lineItems - 1];
    }

    get itemsOneValue() {
        return new Set(this.items.map(m => m.value)).size === 1;
    }

    get itemsUnique() {
        return new Set(this.items.map(m => m.value)).size === this.items.length;
    }

    get firstGap() {
        return this.findGapAtPos(-1);
    }

    get lastGap() {
        return this.findGapAtPosB(this.lineLength);
    }

    get startOfFirstGap() {
        if (this.firstGap)
            return this.firstGap.start;
        else
            return 0;
    }

    get endOfLastGap() {
        if (this.lastGap)
            return this.lastGap.end;
        else
            return this.lineLength - 1;
    }

    get points() {
        const pts = [];
        for (const gap of this._gapsByStart)
            pts.push(...gap[1].points.entries());
        return new Map(pts);
    }

    constructor(lineLength: number, index: number, items: Item[]) {
        this._lineIndex = index;
        this.lineLength = lineLength;
        this.items = items;
        //this.points = new Map();
        this.dots = new Set();
        this.complete = false;

        this._gapsBySize = new Map([[lineLength, new Set([0])]]);
        this._gapsByStart = new Map([[0, new Block(0, lineLength - 1)]]);

        //this._blocksByStart = new Map();
    }

    isItemHere(pos: number, linePos: number, itemIndex: number) {
        return pos - linePos < this.items[itemIndex].value;
    }

    setPairLines(lines: Line[]) {
        this._pairLines = new Map(lines.map(m => [m._lineIndex, m]));
    }

    filterItems(start: number, end: number = this.lineItems - 1) {
        return this.items.filter(f => f.index >= start && f.index <= end);
    }

    *getGaps() {
        for (let i = 0; i < this.lineLength; i++) {
            const gap = this._gapsByStart.get(i);
            if (gap)
                yield gap;
        }
    }

    *getBlocks() {
        for (const gap of this._gapsByStart) {
            for (const block of gap[1].getBlocks())
                yield block;
        }
    }

    getItemsAtPosition2(pos: number) {
        let item = 0;
        let valid = true;
        let equality = true;

        for (const gap of this.getGaps()) {
            if (!gap.canStartWith(this.items[item]))
                item--;
            else {
                if (gap.points.has(gap.start))
                    item++;
            }
        }

        return { valid, equality, item };
    }

    getItemsAtPosition(pos: number) {
        let item = pos;
        let valid = true;
        let equality = true;

        for (const gap of this.getGaps()) {
            let sum = 0;
            let itemShift = 0;

            for (let i = item; i < this.lineItems - 1; i++) {
                sum += this.items[i].value;

                if (sum <= gap.end - gap.start - 1) {
                    itemShift++;
                }

                sum += this.dotCount(i);
            }

            if (gap.points.size < gap.end - gap.start - 1 && (itemShift > 1 || (itemShift === 1 && gap.points.size)))
                equality = false;

            item += itemShift;

        }

        if (item >= this.lineLength)
            valid = false;

        return { valid, equality, item };
    }

    *getGapsBySize(size: number) {
        const gaps = this._gapsBySize.get(size) || new Set();

        for (const gap of gaps) {
            const gapD = this._gapsByStart.get(gap)

            if (gapD)
                yield gapD;
        }
    }

    private findGapAtPos(index: number) {
        let gap;

        for (let i = index; i <= this.lineLength - 1; i++) {
            gap = this._gapsByStart.get(i);

            if (gap)
                break;
        }

        return gap;
    }

    private findGapAtPosB(index: number) {
        let gap;

        for (let i = index; i >= 0; i--) {
            gap = this._gapsByStart.get(i);

            if (gap)
                break;
        }

        return gap;
    }

    private addGap(index: number) {
        const gapAtPos = this.findGapAtPosB(index);
        if (gapAtPos) {
            const { start, end, size } = gapAtPos;
            const leftGapSize = index - gapAtPos.start;
            const rightGapSize = gapAtPos.end - index;
            const gapsByOldSize = this._gapsBySize.get(size);
            const gapsByLeftSize = this._gapsBySize.get(leftGapSize);
            const gapsByRightSize = this._gapsBySize.get(rightGapSize);

            if (gapsByOldSize) {
                gapsByOldSize.delete(start);

                if (gapsByOldSize.size === 0)
                    this._gapsBySize.delete(size);
            }

            if (leftGapSize > 0) {                
                if (gapsByLeftSize)
                    gapsByLeftSize.add(start);
                else
                    this._gapsBySize.set(leftGapSize, new Set([start]));
            }

            if (rightGapSize > 0) {
                if (gapsByRightSize)
                    gapsByRightSize.add(index + 1);
                else
                    this._gapsBySize.set(rightGapSize, new Set([index + 1]));
            }

            if (index === start && index === end)
                this._gapsByStart.delete(start);
            else if (index === start) {
                this._gapsByStart.delete(start);
                gapAtPos.setStart(index + 1);
                this._gapsByStart.set(index + 1, gapAtPos);
            }
            else if (index === end)
                gapAtPos.setEnd(index - 1);
            else {
                const rightGap = gapAtPos.splitGap(index);
                this._gapsByStart.set(index + 1, rightGap);
            }
        }
    }

    //private findBlockAtPos(index: number) {
    //    let block;

    //    for (let i = index; i >= -1; i--) {
    //        block = this._blocksByStart.get(i);

    //        if (block)
    //            break;
    //    }

    //    return block;
    //}

    //private addBlock(index: number, colour: string, item?: number) {
    //    const leftSolid = this.points.get(index - 1);
    //    const rightBlock = this._blocksByStart.get(index + 1);
    //    let end = index;

    //    if (rightBlock && rightBlock.colour === colour)
    //        end = rightBlock.end;

    //    if (leftSolid === colour) {
    //        const leftBlock = this.findBlockAtPos(index - 1);

    //        if (leftBlock) {
    //            this._blocksByStart.delete(index + 1);
    //            leftBlock.end = end;
    //        }
    //    }
    //    else
    //        this._blocksByStart.set(index, new Block(index, end, colour, item));
    //}

    addPoints(start: number, end: number, colour: string, itemIndex?: number) {
        for (let i = start; i <= end; i++)
            this.addPoint(i, colour, itemIndex);
    }

    addPoint(index: number, colour: string, itemIndex?: number, fromPair = false) {
        const gap = this.findGapAtPosB(index);

        if (gap)
            gap.addPoint(index, colour, itemIndex);

        //this.points.set(index, colour);
        //this.addBlock(index, colour, itemIndex);

        if (!fromPair) {
            const pairLine = this._pairLines.get(index);

            if (pairLine)
                pairLine.addPoint(this._lineIndex, colour, undefined, true);
        }
    }

    addDots(start: number, end: number) {
        for (let i = start; i <= end; i++)
            this.addDot(i);
    }

    addDot(index: number, fromPair = false) {
        const hasDot = this.dots.has(index);
        if (!hasDot && index >= 0 && index <= this.lineLength - 1) {

            this.dots.add(index);
            this.addGap(index);

            if (!fromPair) {
                const pairLine = this._pairLines.get(index);

                if (pairLine)
                    pairLine.addDot(this._lineIndex, true);
            }
        }
    }

    sum(includeDots = true, start = 0, end = this.lineItems - 1) {
        return this.items.reduce((acc, item, index) => {
            if (index >= start && index <= end)
                return acc + item.value + (includeDots ? this.dotCount(index) : 0);
            else
                return acc;
        }, 0);
    }

    linePointsValue(includeDots = false) {
        return this.points.size + (includeDots ? this.dots.size : 0);
    }

    shouldAddDots(index: number) {
        const start = index > 0 && this.items[index].colour === this.items[index - 1].colour;
        const end = index < this.items.length - 1 && this.items[index].colour === this.items[index + 1].colour;
        return [start, end];
    }

    dotCount(index: number) {
        return this.shouldAddDots(index)[1] ? 1 : 0;
    }

    dotCountB(index: number) {
        return this.shouldAddDots(index)[0] ? 1 : 0;
    }

    isLineIsolated() {
        let isIsolated = true;
        let lastBlock: Block | undefined;
        let blockCount = 0;
        let currentItem = 0;
        let reachIndex = 0;

        for (const block of this.getBlocks()) {

            if (lastBlock && currentItem < this.lineItems) {
                const reachIndexCurrent = lastBlock.start + this.items[currentItem].value - 1;

                if (reachIndexCurrent > reachIndex)
                    reachIndex = reachIndexCurrent;

                //previous reach current
                if (block.end <= reachIndexCurrent) {
                    isIsolated = false;
                    break;
                }

                currentItem++;

                if (currentItem < this.lineItems) {
                    const backReach = block.end - this.items[currentItem].value + 1

                    //current reach previous
                    if (backReach <= lastBlock.start) {
                        isIsolated = false;
                        break;
                    }
                }
            }

            blockCount++;
            lastBlock = block;
        }

        if (blockCount !== this.lineItems)
            isIsolated = false;

        return isIsolated;
    }


    isEqAtPos(pos: number): [boolean, Item | undefined] {
        const gapBeforePos = this.findGapAtPosB(pos - 1);
        let equality = true;
        let item: Item | undefined;

        if (gapBeforePos) {
            //more checks




            equality = false;
        }
        else
            item = this.items[0];


        return [equality, item];
    }
}