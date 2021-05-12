export default class Block {
    public start: number;
    public end: number;
    public readonly colour?: string;
    public readonly item?: number;

    get size() {
        return this.end - this.start + 1;
    }

    constructor(start: number, end: number, colour?: string, item?: number) {
        this.start = start;
        this.end = end;

        this.colour = colour;
        this.item = item;
    }
}