import 'regenerator-runtime/runtime';
import IndexMap from 'ts-index-map';
import { Colour, Item } from "../interfaces";
import Block from './Block';
import Gap from './Gap';
import LineSegment from './LineSegment';
import { Action } from './Path';

export default class Line {
    private readonly _lineIndex: number;
    private _lineValue: number | undefined;
    private _minItem: number | undefined;
    private _maxItem: number | undefined;
    private _itemsOneValue: boolean | undefined;
    private _itemsUnique: boolean | undefined;
    private _pairLines: Map<number, Line> = new Map();
    private readonly _gaps: IndexMap<Gap>;

    public readonly items: Item[];
    public readonly lineLength: number;
    public readonly points: Map<number, string> = new Map();
    public readonly dots: Set<number> = new Set();
    public complete = false;

    get lineItems() {
        return this.items.length;
    }

    get lineValue() {

        if (!this._lineValue)
            this._lineValue = this.sum();

        return this._lineValue;
    }

    get minItem() {

        if (!this._minItem)
            this._minItem = this.min();

        return this._minItem;
    }

    get maxItem() {

        if (!this._maxItem)
            this._maxItem = this.max();

        return this._maxItem;
    }

    get firstItem() {
        return this.items[0];
    }

    get lastItem() {
        return this.items[this.lineItems - 1];
    }

    get itemsOneValue() {
        if (this._itemsOneValue === undefined)
            this._itemsOneValue = new Set(this.items.map(m => m.value)).size === 1;

        return this._itemsOneValue;
    }

    get itemsUnique() {
        if (this._itemsUnique === undefined)
            this._itemsUnique = new Set(this.items.map(m => m.value)).size === this.items.length;

        return this._itemsUnique;
    }

    get firstGap() {
        return this.findGapAtPos(-1);
    }

    get lastGap() {
        return this.findGapAtPos(this.lineLength, false);
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

    constructor(lineLength: number, index: number, items: Item[]) {
        this._lineIndex = index;
        this.lineLength = lineLength;
        this.items = items;
        this._gaps = new IndexMap(['size', 'start'], [new Gap(0, lineLength - 1)]);
    }

    setPairLines(lines: Line[]) {
        this._pairLines = new Map(lines.map(m => [m._lineIndex, m]));
    }

    filterItems(start: number, end: number = this.lineItems - 1) {
        [start, end] = [Math.min(start, end), Math.max(start, end)];
        return this.items.filter(f => f.index >= start && f.index <= end);
    }

    itemsInRange(ls: LineSegment, lsEnd?: LineSegment) {
        const rangeLeft = [ls.equalityIndex, ls.indexAtBlock];
        let range = rangeLeft;

        if (lsEnd) {
            const rangeRight = [lsEnd.indexAtBlock, lsEnd.equalityIndex];
            range = [Math.max(range[0], rangeRight[0]), Math.min(range[1], rangeRight[1])];
        }

        return this.filterItems(range[0], range[1]);
    }

    private ranOutOfItems(item: number, forward = true) {
        return forward ? item >= this.lineItems : item < 0;
    }

    sumWhileO(start: number, startPos: number, endPos: number, forward = true) {
        let [sum, shift] = [0, 0];

        for (let i = start; forward ? i < this.lineItems : i >= 0; forward ? i++ : i--) {
            sum += this.items[i].value;

            while (this.points.get(forward ? startPos + sum : endPos - sum) === this.items[i].colour)
                sum++;

            if (sum <= endPos - startPos + 1)
                shift++;
            else
                break;

            sum += this.dotCount(i, forward);
        }

        return shift;
    }

    sumWhile(start: number, gap: Gap, block?: Block, forward = true) {
        let [sum, shift] = [0, 0];
        let startPos = gap.start;
        let endPos = gap.end;
        let range = gap.size;

        if (block && forward) {
            if (forward)
                endPos = block.start;
            else
                startPos = block.end;
            range = endPos - startPos - 1;
        }

        for (let i = start; forward ? i < this.lineItems : i >= 0; forward ? i++ : i--) {
            sum += this.items[i].value;

            while (this.points.get(forward ? startPos + sum : endPos - sum) === this.items[i].colour)
                sum++;

            if (sum <= range)
                shift++;
            else {
                if (block && sum > gap.size)
                    shift--;

                break;
            }

            sum += this.dotCount(i, forward);
        }

        return shift;
    }

    private adjustItemIndexes(gap: Gap, ei: number, ie: [number, boolean], forward = true) {
        const itemShift = this.sumWhile(ie[0], gap, undefined, forward);
        let iei = [...ie, itemShift] as [number, boolean, number];

        if (!gap.isFull && (iei[2] > 1 || (iei[2] === 1 && !gap.hasPoints)))
            iei[1] = false;

        if (gap.isFull && (!iei[1] || this.ranOutOfItems(iei[0], forward)
            || gap.size !== this.items[iei[0]].value)) {
            const items = this.filterItems(ei, iei[0]);
            let uniqueItems = items.filter(f => f.value === gap.size);
            let itm;

            if (uniqueItems.length === 1)
                itm = uniqueItems[0];
            else {
                const lastGap = this.findGapAtPos(gap.start + (forward ? -1 : 1), !forward);
                if (lastGap && lastGap.isFull) {
                    uniqueItems = this.filter(this.pair(), f => {
                        if (lastGap) {
                            return f[forward ? 0 : 1].value === lastGap.size
                                && f[forward ? 1 : 0].value === gap.size;
                        }
                        return false;
                    }).map(m => m[forward ? 1 : 0]);

                    if (uniqueItems.length === 1)
                        itm = uniqueItems[0];
                }
            }

            if (!itm)
                itm = this.find(this.loopItr(items, !forward), f => f.value === gap.size);

            iei = [itm ? itm.index : -1, uniqueItems.length === 1, 1];
        } else if (!gap.isFull && gap.hasPoints && !iei[1]) {
            const lastBlock = gap.getLastBlock(gap.end);
            if (lastBlock) {
                const toItm = iei[0] + ((forward ? 1 : -1) * (itemShift - 1))
                const items = this.filterItems(ei, toItm);
                const uniqueItems = items.filter(f => lastBlock && f.value >= lastBlock.size);
                if (uniqueItems.length === 1 && uniqueItems[0].index === toItm)
                    iei[1] = true;
            }
        }

        return iei;
    }

    *loopItr(itr: Item[], forward = true) {
        for (let i = forward ? 0 : itr.length - 1; forward ? i < itr.length : i >= 0; forward ? i++ : i--) {
            yield itr[i];
        }
    }

    unique<T>(itr: Generator<T, void, unknown> | Array<T>, func: (f: T) => boolean) {
        let count = 0;
        for (const value of itr) {
            if (func(value)) {
                if (count === 1)
                    return false;

                count++;
            }
        }
        return true;
    }

    filter<T>(itr: Generator<T, void, unknown> | Array<T>, func: (f: T) => boolean) {
        const items = [];

        for (const value of itr) {
            if (func(value))
                items.push(value);
        }

        return items;
    }

    find<T>(itr: Generator<T, void, unknown> | Array<T>, func: (f: T) => boolean) {
        for (const value of itr) {
            if (func(value))
                return value;
        }
    }

    some<T>(itr: Generator<T, void, unknown> | Array<T>, func: (f: T) => boolean) {
        return !!this.find(itr, func);
    }

    *pair(arr = this.items) {
        for (let i = 0; i < arr.length - 1; i++)
            yield [arr[i], arr[i + 1]];
    }

    *triple(arr = this.items) {
        for (let i = 0; i < arr.length - 2; i++)
            yield [arr[i], arr[i + 1], arr[i + 2]];
    }

    *getGaps(includeItems = false) {
        let [item, equalityItem, equality] = [0, 0, true];
        const skip = { i: 0 };

        for (skip.i = 0; skip.i < this.lineLength; skip.i++) {
            const gap = this._gaps.get('start', skip.i)[0];

            if (gap) {

                const theItem = item < this.lineItems ? this.items[item] : null;
                const ls = new LineSegment(theItem, item, equalityItem);
                yield [gap, ls, skip] as [Gap, LineSegment, { i: number; b: boolean }];

                if (includeItems) {

                    let itemShift = 0;
                    [item, equality, itemShift]
                        = this.adjustItemIndexes(gap, equalityItem, [item, equality]);

                    if (equality)
                        equalityItem = item + itemShift;
                    else if (gap.hasPoints)
                        equalityItem++;

                    item += itemShift;
                }
            }
        }
    }

    *getGapsB(pos: number) {
        for (let i = this.lineLength - 1; i >= pos; i--) {
            const gap = this._gaps.get('start', i)[0];
            if (gap)
                yield gap;
        }
    }

    *getGapsBySize(size: number) {
        const gaps = this._gaps.get('size', size);

        for (const gap of gaps)
            yield gap;
    }

    isolatedPart(currentItem: number, block: Block, lastBlock: Block, forward = true) {
        const item = this.items[currentItem].value;
        let reachIndex;

        if (forward)
            reachIndex = lastBlock.start + item - 1;
        else
            reachIndex = lastBlock.end - item + 1;

        //previous reach current
        if (forward && block.end <= reachIndex)
            return false;
        else if (!forward && block.start >= reachIndex)
            return false;

        return true;
    }

    *getBlocks(includeItems = false) {
        for (const gap of this.getGaps(includeItems)) {
            for (const block of gap[0].getBlocks()) {
                gap[1].indexAtBlock += this.sumWhile(gap[1].index, gap[0], block);
                yield [block, ...gap] as [Block, Gap, LineSegment, { i: number }];
            }
        }
    }

    getItemsAtPositionB(currentGap: Gap, block?: Block) {
        let [item, equality] = [this.lineItems - 1, true];
        let equalityItem = item;

        for (const gap of this.getGapsB(currentGap.end + 1)) {
            let itemShift = 0;
            [item, equality, itemShift]
                = this.adjustItemIndexes(gap, equalityItem, [item, equality], false);

            if (equality)
                equalityItem = item - itemShift;
            else if (gap.hasPoints)
                equalityItem--;

            item -= itemShift;
        }

        const theItem = item >= 0 ? this.items[item] : null;
        const lsEnd = new LineSegment(theItem, item, equalityItem);

        if (block)
            lsEnd.indexAtBlock = item - this.sumWhileO(item, block.end + 2, currentGap.end, false);

        return lsEnd;
    }

    findGapAtPos(index: number, forward = true) {
        let gap;

        for (let i = index; forward ? i <= this.lineLength - 1 : i >= 0; forward ? i++ : i--) {
            gap = this._gaps.get('start', i)[0];

            if (gap)
                break;
        }

        return gap;
    }

    private addGap(index: number) {
        const gapAtPos = this.findGapAtPos(index, false);
        if (gapAtPos) {
            const { start, end } = gapAtPos;

            if (index === start && index === end)
                this._gaps.delete('start', start);
            else if (index === start) {
                this._gaps.delete('start', start);
                gapAtPos.setStart(index + 1);
                this._gaps.add(gapAtPos);
            }
            else if (index === end) {
                this._gaps.delete('start', start);
                gapAtPos.setEnd(index - 1);
                this._gaps.add(gapAtPos);
            }
            else {
                this._gaps.delete('start', start);
                const rightGap = gapAtPos.splitGap(index);
                this._gaps.add(gapAtPos);
                this._gaps.add(rightGap);
            }
        }
    }

    addPoints(start: number, end: number, colour: string, action: Action, itemIndex?: number) {
        for (let i = start; i <= end; i++)
            this.addPoint(i, colour, action, itemIndex);
    }

    addPoint(index: number, colour: string, action: Action, itemIndex?: number, fromPair = false) {
        if (!this.points.has(index)) {
            const gap = this.findGapAtPos(index, false);
            this.points.set(index, colour);

            if (gap)
                gap.addPoint(index, colour, action, itemIndex);

            if (!fromPair) {
                const pairLine = this._pairLines.get(index);

                if (pairLine)
                    pairLine.addPoint(this._lineIndex, colour, action, undefined, true);
            }
        }
    }

    addDots(start: number, end: number, action: Action) {
        for (let i = start; i <= end; i++)
            this.addDot(i, action);
    }

    addDot(index: number, action: Action, fromPair = false) {
        if (!this.dots.has(index) && index >= 0 && index <= this.lineLength - 1) {

            this.dots.add(index);
            this.addGap(index);

            if (!fromPair) {
                const pairLine = this._pairLines.get(index);

                if (pairLine)
                    pairLine.addDot(this._lineIndex, action, true);
            }
        }
    }

    min(arr = this.items, min = 1) {
        return arr.reduce((acc, item) => {
            if (item.value >= min && (!acc || item.value < acc))
                return item.value;
            return acc;
        }, 0);
    }

    max(arr = this.items) {
        return arr.reduce((acc, item) => {
            if (item.value > acc)
                return item.value;
            return acc;
        }, 0);
    }

    sum(includeDots = true, arr = this.items) {
        return arr.reduce((acc, item, index) => {
            return acc + item.value + (includeDots && index < arr.length - 1 ? this.dotCount(index) : 0);
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

    dotCount(index: number, forward = true) {
        return this.shouldAddDots(index)[forward ? 1 : 0] ? 1 : 0;
    }

    dotBetween(first: Colour, second: Colour) {
        return first.colour === second.colour ? 1 : 0;
    }

    spaceBetween(block: Block, nextBlock: Block, item: Item) {
        const diff = 1 + this.dotBetween(block, item)
            + this.dotBetween(nextBlock, item);
        return nextBlock.start - block.end - diff;
    }

    fitsInSpace(block: Block, nextBlock: Block, item: Item) {
        return item.value <= this.spaceBetween(block, nextBlock, item);
    }

    isLineIsolated() {
        let isIsolated = true;
        let lastBlock: Block | undefined;
        let blockCount = 0;
        let currentItem = 0;
        let reachIndex = 0;

        for (const [block] of this.getBlocks()) {

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
}