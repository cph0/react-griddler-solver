import { Item } from "../interfaces";

export class LineSegment {
    private readonly _forward: boolean;

    public readonly index: number;
    public readonly item: Item | null;
    public readonly equality: boolean;

    constructor(item: Item | null, equality: boolean, forward = false) {
        this._forward = forward;

        this.index = item ? item.index : forward ? 999 : -1;
        this.item = item;
        this.equality = equality;
    }

    with(ls: LineSegment) {
        return [Math.min(this.index, ls.index), Math.max(this.index, ls.index)];
    }
}