export default class Range {
    private _start: number;
    private _end: number;

    get start() {
        return this._start;
    }

    get end() {
        return this._end;
    }

    get size() {
        return this.end - this.start + 1;
    }

    constructor(start: number, end: number) {
        this._start = start;
        this._end = end;
    }

    protected setStart(start: number) {
        this._start = start;
    }

    protected setEnd(end: number) {
        this._end = end;
    }
}
