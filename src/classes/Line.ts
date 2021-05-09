import 'regenerator-runtime/runtime';
//import IndexMap from 'ts-index-map';
import { Item } from "../interfaces";
import Block from './Block';
import { LineSegment } from './LineSegment';

class IndexMap<T, K extends keyof T> {
    private _data: Map<number, T>;
    private _indexes: Map<K, Map<T[K], Set<number>>> = new Map();
    private _spareDataIds: number[] = [];

    get size() {
        return this._data.size;
    }

    get indexes() {
        return this._indexes.size;
    }

    constructor(data?: T[], indexes?: K[]) {
        const dataMap = (data || []).map((m, i) => [i, m] as [number, T]);
        this._data = new Map(dataMap);

        if (indexes)
            this._indexes = new Map(indexes.map(m => [m, new Map()]));

        if (data && indexes) {
            for (const index of indexes)
                this.setIndex(dataMap, index);
        }
    }

    private setIndex(data: [number, T][], field: K) {
        const map = new Map<T[K], Set<number>>();
        const uniqueData = new Set(data.map(m => m[1][field]));

        for (const unique of uniqueData) {
            const dataAtKey = data.filter(f => f[1][field] === unique).map(f => f[0]);
            map.set(unique, new Set(dataAtKey));
        }
        this._indexes.set(field, new Map(map));
    }

    addIndex(field: K) {
        if (!this._indexes.has(field)) {
            const data = Array.from(this._data.entries());
            this.setIndex(data, field);
        }
    }

    removeIndex(field: K) {
        if (this._indexes.has(field))
            this._indexes.delete(field);
    }

    get(field: K, key: T[K]) {
        const map = this._indexes.get(field);

        if (map) {
            const dataIndexes = map.get(key);

            if (dataIndexes) {
                const matches: T[] = [];

                for (const dataIndex of dataIndexes) {
                    const match = this._data.get(dataIndex);
                    if (match)
                        matches.push(match);
                }

                return matches;
            }
        }

        return Array.from(this._data.values()).filter(f => f[field] === key);
    }

    add(...values: T[]) {
        for (const value of values) {
            const spareDataIndex = this._spareDataIds.pop();
            const dataIndex = spareDataIndex || this._data.size;
            this._data.set(dataIndex, value);

            for (const index of this._indexes) {
                const set = index[1].get(value[index[0]]);

                if (set)
                    set.add(dataIndex);
                else
                    index[1].set(value[index[0]], new Set([dataIndex]));
            }
        }
    }

    delete(field: K, key: T[K]) {
        const map = this._indexes.get(field);

        if (map) {
            const dataIndexes = map.get(key);

            if (dataIndexes) {

                for (const dataIndex of dataIndexes) {
                    const data = this._data.get(dataIndex);

                    if (data) {
                        for (const index of this._indexes) {
                            const dataAtIndex = data[index[0]];
                            const matches = index[1].get(dataAtIndex);

                            if (matches && matches.has(dataIndex))
                                matches.delete(dataIndex);

                            if (matches && matches.size === 0)
                                index[1].delete(dataAtIndex);

                            if (index[1].size === 0)
                                this._indexes.delete(index[0]);
                        }

                        this._data.delete(dataIndex);
                        this._spareDataIds.push(dataIndex);
                    }
                }
            }
        }
    }
}

export default class Line {
    private readonly _lineIndex: number;
    private _lineValue: number | undefined;
    private _minItem: number | undefined;
    private _maxItem: number | undefined;
    private _itemsOneValue: boolean | undefined;
    private _itemsUnique: boolean | undefined;
    private _pairLines: Map<number, Line> = new Map();
    //private readonly _gapsBySize: Map<number, Set<number>>;
    //private readonly _gapsByStart: Map<number, Block>;
    private readonly _gaps: IndexMap<Block, 'size' | 'start'>;

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
        //this.points = new Map();
        this.dots = new Set();
        this.complete = false;

        this._gaps = new IndexMap([new Block(0, lineLength - 1)], ['size', 'start']);
        //this._gapsBySize = new Map([[lineLength, new Set([0])]]);
        //this._gapsByStart = new Map([[0, new Block(0, lineLength - 1)]]);
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

    *getGaps(includeItems = false) {
        let item = 0;
        let equality = true;

        for (let i = 0; i < this.lineLength; i++) {
            //const gap = this._gapsByStart.get(i);
            const gap = this._gaps.get('start', i)[0];

            if (gap) {

                const theItem = item < this.lineItems ? this.items[item] : null;
                yield [gap, new LineSegment(theItem, equality, true)] as [Block, LineSegment];

                if (includeItems) {

                    let sum = 0;
                    let itemShift = 0;

                    for (let i = item; i < this.lineItems; i++) {
                        sum += this.items[i].value;

                        if (sum <= gap.size) {
                            itemShift++;
                        }
                        else
                            break;

                        sum += this.dotCount(i);
                    }

                    if (!gap.isFull && (itemShift > 1 || (itemShift === 1 && !gap.points.size)))
                        equality = false;

                    if (item >= this.lineItems && gap.isFull && this.itemsUnique) {
                        const temp = this.items.find(f => f.value === gap.size);
                        item = temp ? temp.index + 1 : -1;
                        equality = !!temp;
                    }

                    item += itemShift;
                }
            }
        }
    }

    *getGapsB(pos: number) {
        for (let i = this.lineLength - 1; i >= pos; i--) {
            //const gap = this._gapsByStart.get(i);
            const gap = this._gaps.get('start', i)[0];
            if (gap)
                yield gap;
        }
    }

    *getBlocks() {
        for (let i = 0; i < this.lineLength; i++) {
            const gaps = this._gaps.get('start', i);
            for (const gap of gaps) {
                for (const block of gap.getBlocks())
                    yield [block, gap];
            }
        }
    }

    getItemsAtPositionB(pos: number) {
        let item = this.lineItems - 1;
        let valid = true;
        let equality = true;

        for (const gap of this.getGapsB(pos)) {
            let sum = 0;
            let itemShift = 0;

            for (let i = item; i >= 0; i--) {
                sum += this.items[i].value;

                if (sum <= gap.size) {
                    itemShift++;
                }
                else
                    break;

                sum += this.dotCountB(i);
            }

            if (!gap.isFull && (itemShift > 1 || (itemShift === 1 && !gap.points.size)))
                equality = false;

            item -= itemShift;
        }

        if (item < 0)
            valid = false;

        const theItem = valid ? this.items[item] : null;        
        return new LineSegment(theItem, equality);
    }

    *getGapsBySize(size: number) {
        //const gaps = this._gapsBySize.get(size) || new Set();
        const gaps = this._gaps.get('size', size);

        for (const gap of gaps) {
            yield gap;
            //const gapD = this._gapsByStart.get(gap)

            //if (gapD)
            //    yield gapD;
        }
    }

    private findGapAtPos(index: number) {
        let gap;

        for (let i = index; i <= this.lineLength - 1; i++) {
            //gap = this._gapsByStart.get(i);
            gap = this._gaps.get('start', i)[0];

            if (gap)
                break;
        }

        return gap;
    }

    private findGapAtPosB(index: number) {
        let gap;

        for (let i = index; i >= 0; i--) {
            //gap = this._gapsByStart.get(i);
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
            //const leftGapSize = index - gapAtPos.start;
            //const rightGapSize = gapAtPos.end - index;
            //const gapsByOldSize = this._gapsBySize.get(size);
            //const gapsByLeftSize = this._gapsBySize.get(leftGapSize);
            //const gapsByRightSize = this._gapsBySize.get(rightGapSize);

            //if (gapsByOldSize) {
            //    gapsByOldSize.delete(start);

            //    if (gapsByOldSize.size === 0)
            //        this._gapsBySize.delete(size);
            //}

            //if (leftGapSize > 0) {
            //    if (gapsByLeftSize)
            //        gapsByLeftSize.add(start);
            //    else
            //        this._gapsBySize.set(leftGapSize, new Set([start]));
            //}

            //if (rightGapSize > 0) {
            //    if (gapsByRightSize)
            //        gapsByRightSize.add(index + 1);
            //    else
            //        this._gapsBySize.set(rightGapSize, new Set([index + 1]));
            //}

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

            //if (index === start && index === end)
            //    this._gapsByStart.delete(start);
            //else if (index === start) {
            //    this._gapsByStart.delete(start);
            //    gapAtPos.setStart(index + 1);
            //    this._gapsByStart.set(index + 1, gapAtPos);
            //}
            //else if (index === end)
            //    gapAtPos.setEnd(index - 1);
            //else {
            //    const rightGap = gapAtPos.splitGap(index);
            //    this._gapsByStart.set(index + 1, rightGap);
            //}
        }
    }

    addPoints(start: number, end: number, colour: string, itemIndex?: number) {
        for (let i = start; i <= end; i++)
            this.addPoint(i, colour, itemIndex);
    }

    addPoint(index: number, colour: string, itemIndex?: number, fromPair = false) {
        const gap = this.findGapAtPosB(index);

        if (gap)
            gap.addPoint(index, colour, itemIndex);

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