import 'regenerator-runtime/runtime';
import IndexMap from 'ts-index-map';
import { Item } from "../interfaces";
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
        for (const gap of this.getGaps())
            pts.push(...gap[0].points.entries());
        return new Map(pts);
    }

    constructor(lineLength: number, index: number, items: Item[]) {
        this._lineIndex = index;
        this.lineLength = lineLength;
        this.items = items;
        this.dots = new Set();
        this.complete = false;
        this._gaps = new IndexMap(['size', 'start'], [new Gap(0, lineLength - 1)]);
    }

    setPairLines(lines: Line[]) {
        this._pairLines = new Map(lines.map(m => [m._lineIndex, m]));
    }

    filterItems(start: number, end: number = this.lineItems - 1) {
        [start, end] = [Math.min(start, end), Math.max(start, end)];
        return this.items.filter(f => f.index >= start && f.index <= end);
    }

    private ranOutOfItems(item: number, forward = true) {
        return forward ? item >= this.lineItems : item < 0;
    }

    sumWhile(start: number, func: (sum: number) => boolean, forward = true) {
        let [sum, shift] = [0, 0];

        for (let i = start; forward ? i < this.lineItems : i >= 0; forward ? i++ : i--) {
            sum += this.items[i].value;

            if (func(sum))
                shift++;
            else
                break;

            sum += this.dotCount(i, forward);
        }

        return shift;
    }

    private adjustItemIndexes(gap: Gap, ei: number, ie: [number, boolean], forward = true) {
        const itemShift = this.sumWhile(ie[0], s => s <= gap.size, forward);
        let iei = [...ie, itemShift] as [number, boolean, number];

        if (!gap.isFull && (iei[2] > 1 || (iei[2] === 1 && !gap.points.size)))
            iei[1] = false;

        if (gap.isFull && (!iei[1] || this.ranOutOfItems(iei[0], forward)
            || gap.size !== this.items[iei[0]].value)) {
            const items = this.filterItems(ei, iei[0]);
            const uniqueItems = items.filter(f => f.value === gap.size);
            let itm;

            if (uniqueItems.length === 1)
                itm = uniqueItems[0];
            else
                itm = this.find(this.loopItr(items, !forward), f => f.value === gap.size);

            iei = [itm ? itm.index : -1, uniqueItems.length === 1, 1];
        }

        return iei;
    }

    *loopItr(itr: Item[], forward = true) {
        for (let i = forward ? 0 : itr.length - 1; forward ? i < itr.length : i >= 0; forward ? i++ : i--) {
            yield itr[i];
        }
    }

    find<T>(itr: Generator<T, void, unknown>, func: (f: T) => boolean) {
        for (const value of itr) {
            if (func(value))
                return value;
        }
    }

    some<T>(itr: Generator<T, void, unknown>, func: (f: T) => boolean) {
        for (const value of itr) {
            if (func(value))
                return true;
        }
        return false;
    }

    *pair() {
        for (let i = 0; i < this.lineItems - 1; i++)
            yield [this.items[i], this.items[i + 1]];
    }

    *triple() {
        for (let i = 0; i < this.lineItems - 2; i++)
            yield [this.items[i], this.items[i + 1], this.items[i + 2]];
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

    *getBlocks(includeItems = false) {
        for (const gap of this.getGaps(includeItems)) {
            for (const block of gap[0].getBlocks()) {
                const sum = block.start - gap[0].start - 1;
                gap[1].indexAtBlock += this.sumWhile(gap[1].index, s => s <= sum);
                yield [block, ...gap] as [Block, Gap, LineSegment, { i: number }];
            }
        }
    }

    getItemsAtPositionB(pos: number) {
        let [item, equality] = [this.lineItems - 1, true];
        let equalityItem = item;

        for (const gap of this.getGapsB(pos)) {
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
        return new LineSegment(theItem, item, equalityItem);
    }

    private findGapAtPos(index: number) {
        let gap;

        for (let i = index; i <= this.lineLength - 1; i++) {
            gap = this._gaps.get('start', i)[0];

            if (gap)
                break;
        }

        return gap;
    }

    private findGapAtPosB(index: number) {
        let gap;

        for (let i = index; i >= 0; i--) {
            gap = this._gaps.get('start', i)[0];

            if (gap)
                break;
        }

        return gap;
    }

    private addGap(index: number) {
        const gapAtPos = this.findGapAtPosB(index);
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
        const gap = this.findGapAtPosB(index);

        if (gap)
            gap.addPoint(index, colour, action, itemIndex);

        if (!fromPair) {
            const pairLine = this._pairLines.get(index);

            if (pairLine)
                pairLine.addPoint(this._lineIndex, colour, action, undefined, true);
        }
    }

    addDots(start: number, end: number, action: Action) {
        for (let i = start; i <= end; i++)
            this.addDot(i, action);
    }

    addDot(index: number, action: Action, fromPair = false) {
        const hasDot = this.dots.has(index);
        if (!hasDot && index >= 0 && index <= this.lineLength - 1) {

            this.dots.add(index);
            this.addGap(index);

            if (!fromPair) {
                const pairLine = this._pairLines.get(index);

                if (pairLine)
                    pairLine.addDot(this._lineIndex, action, true);
            }
        }
    }

    min(start: number, end: number, min = 1) {
        return this.items.reduce((acc, item, index) => {
            if (index >= start && index <= end
                && item.value >= min && (!acc || item.value < acc))
                return item.value;
            return acc;
        }, undefined as number | undefined) as number;
    }

    max(start: number, end: number) {
        return this.items.reduce((acc, item, index) => {
            if (index >= start && index <= end && item.value > acc)
                return item.value;
            return acc;
        }, 0);
    }

    sum(includeDots = true, start = 0, end = this.lineItems - 1) {
        return this.items.reduce((acc, item, index) => {
            if (index >= start && index <= end)
                return acc + item.value + (includeDots && index < end ? this.dotCount(index) : 0);
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

    dotCount(index: number, forward = true) {
        return this.shouldAddDots(index)[forward ? 1 : 0] ? 1 : 0;
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