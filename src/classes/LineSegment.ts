import { Item } from "../interfaces";

export default class LineSegment {
    public readonly index: number;
    public readonly equalityIndex: number;
    public readonly item: Item | null;
    public indexAtBlock: number;
    public isIsolated = true;

    get valid() {
        return !!this.item;
    }

    get equality() {
        return this.index === this.equalityIndex;
    }

    constructor(item: Item | null, index: number, equalityIndex: number) {
        this.index = index;
        this.equalityIndex = equalityIndex;
        this.item = item;
        this.indexAtBlock = index;
    }

    with(ls: LineSegment, gapOnly = true) {
        if (gapOnly)
            return [Math.min(this.index, ls.index), Math.max(this.index, ls.index)];
        else
            return [Math.max(this.equalityIndex, ls.indexAtBlock),
            Math.min(this.indexAtBlock, ls.equalityIndex)];
    }
}