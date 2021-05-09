import { Item } from "../interfaces";

export class Range {
    public start: number;
    public end: number;
    public readonly colour?: string;
    public readonly item?: number;

    get size() {
        return this.end - this.start + 1;
    }

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }
}

//export class Gap extends Range {
//    private _nextEmpty: number;
//    private _nextEmptyB: number;
//    private readonly _possibleItems: number[];
//    private _blocksByStart: Map<number, Block>;

//    public readonly startItemsYes: Set<number>;
//    public readonly startItemsNo: Set<number>; 

//    get hasFirstPoint() {
//        return this._blocksByStart.has(this.start);
//    }

//    get hasPoints() {
//        return this._blocksByStart.size > 0;
//    }

//    get isFull() {
//        const firstBlock = this._blocksByStart.get(this.start);
//        return firstBlock && firstBlock.end === this.end;
//    }

//    constructor(start: number, end: number) {
//        super(start, end);
//        this._nextEmpty = start;
//        this._nextEmptyB = end;
//        this._possibleItems = [];
//        this._blocksByStart = new Map();

//        this.startItemsYes = new Set();
//        this.startItemsNo = new Set();
//    }

//    canStartWith(item: Item) {
//        return !this.startItemsNo.has(item.value);
//    }

//    *getBlocks() {
//        for (const block of this._blocksByStart) {
//            yield block[1];
//        }
//    }

//    private refreshStartItems() {
//        const firstBlock = this._blocksByStart.get(this.start);
//        while (firstBlock && firstBlock.end >= this._nextEmpty) {
//            if (this._nextEmpty - this.start > 0)
//                this.startItemsNo.add(this._nextEmpty - this.start);

//            this._nextEmpty++;
//        }

//        if (firstBlock) {
//            const blockIt = this._blocksByStart.keys();
//            blockIt.next();
//            for (const block of blockIt)
//                this.startItemsNo.add(block - this.start);
//        }
//    }

//    setStart(start: number) {
//        this.start = start;
//        this._nextEmpty = start;
//        this.refreshStartItems();
//    }

//    setEnd(end: number) {
//        this.end = end;
//        this._nextEmptyB = end;
//        //const lastBlock = this._blocksByStart.get(this.start);
//        while (this.points.has(this._nextEmptyB))
//            this._nextEmptyB--;
//    }

//    setBlocks(blocks: Map<number, Block>) {
//        this._blocksByStart = blocks;
//        this.refreshStartItems();
//    }

//    splitGap(index: number) {
//        const rightBlock = new Block(index + 1, this.end);
//        this.end = index - 1;
//        this._nextEmptyB = index - 1;

//        while (this.points.has(this._nextEmptyB))
//            this._nextEmptyB--;

//        const blocks: [number, Block][] = [];
//        //const currentBlocks = this._blocksByStart.values();
//        //for (const block of currentBlocks) {

//        //}

//        this._blocksByStart.forEach(f => {
//            if (f.start > index) {
//                blocks.push([f.start, f]);
//                this._blocksByStart.delete(f.start);
//            }
//        });

//        const points: [number, string][] = [];
//        this.points.forEach((f, k) => {
//            if (k > index) {
//                points.push([k, f]);
//                this.points.delete(k);
//            }
//        });

//        rightBlock.setBlocks(new Map(blocks));
//        rightBlock.points = new Map(points);
//        return rightBlock;
//    }

//    private findBlockAtPos(index: number) {
//        let block;

//        for (let i = index; i >= -1; i--) {
//            block = this._blocksByStart.get(i);

//            if (block)
//                break;
//        }

//        return block;
//    }
//}

export default class Block {

    private _nextEmpty: number;
    private _nextEmptyB: number;
    private readonly _possibleItems: number[];
    private _blocksByStart: Map<number, Block>;

    public readonly startItemsYes: Set<number>;
    public readonly startItemsNo: Set<number>;
    public points: Map<number, string>;

    public start: number;
    public end: number;
    public readonly colour?: string;
    public readonly item?: number;

    get size() {
        return this.end - this.start + 1;
    }

    get hasFirstPoint() {
        return this._blocksByStart.has(this.start);
    }

    get hasPoints() {
        return this._blocksByStart.size > 0;
    }

    get isFull() {
        const firstBlock = this._blocksByStart.get(this.start);
        return firstBlock && firstBlock.end === this.end;
    }

    constructor(start: number, end: number, colour?: string, item?: number) {
        this._nextEmpty = start;
        this._nextEmptyB = end;
        this._possibleItems = [];
        this._blocksByStart = new Map();
        this.start = start;
        this.end = end;
        this.colour = colour;
        this.item = item;

        this.startItemsYes = new Set();
        this.startItemsNo = new Set();
        this.points = new Map();
    }

    canStartWith(item: Item) {
        return !this.startItemsNo.has(item.value);
    }

    *getBlocks() {
        for (const block of this._blocksByStart) {
            yield block[1];
        }
    }

    private refreshStartItems() {
        const firstBlock = this._blocksByStart.get(this.start);
        while (firstBlock && firstBlock.end >= this._nextEmpty) {
            if (this._nextEmpty - this.start > 0)
                this.startItemsNo.add(this._nextEmpty - this.start);

            this._nextEmpty++;
        }

        if (firstBlock) {
            const blockIt = this._blocksByStart.keys();
            blockIt.next();
            for (const block of blockIt)
                this.startItemsNo.add(block - this.start);
        }
    }

    setStart(start: number) {
        this.start = start;
        this._nextEmpty = start;
        this.refreshStartItems();
    }

    setEnd(end: number) {
        this.end = end;
        this._nextEmptyB = end;
        //const lastBlock = this._blocksByStart.get(this.start);
        while (this.points.has(this._nextEmptyB))
            this._nextEmptyB--;
    }

    setBlocks(blocks: Map<number, Block>) {
        this._blocksByStart = blocks;
        this.refreshStartItems();
    }

    splitGap(index: number) {
        const rightBlock = new Block(index + 1, this.end);
        this.end = index - 1;
        this._nextEmptyB = index - 1;

        while (this.points.has(this._nextEmptyB))
            this._nextEmptyB--;

        const blocks: [number, Block][] = [];
        //const currentBlocks = this._blocksByStart.values();
        //for (const block of currentBlocks) {

        //}

        this._blocksByStart.forEach(f => {
            if (f.start > index) {
                blocks.push([f.start, f]);
                this._blocksByStart.delete(f.start);
            }
        });

        const points: [number, string][] = [];
        this.points.forEach((f, k) => {
            if (k > index) {
                points.push([k, f]);
                this.points.delete(k);
            }
        });

        rightBlock.setBlocks(new Map(blocks));
        rightBlock.points = new Map(points);
        return rightBlock;
    }

    private findBlockAtPos(index: number) {
        let block;

        for (let i = index; i >= -1; i--) {
            block = this._blocksByStart.get(i);

            if (block)
                break;
        }

        return block;
    }

    private addBlock(index: number, colour: string, item?: number) {
        const leftSolid = this.points.get(index - 1);
        const rightBlock = this._blocksByStart.get(index + 1);
        let end = index;

        if (rightBlock && rightBlock.colour === colour)
            end = rightBlock.end;

        if (leftSolid === colour) {
            const leftBlock = this.findBlockAtPos(index - 1);

            if (leftBlock) {
                this._blocksByStart.delete(index + 1);
                leftBlock.end = end;
            }
        }
        else
            this._blocksByStart.set(index, new Block(index, end, colour, item));
    }

    addPoint(index: number, colour: string, item?: number) {
        this.points.set(index, colour);
        this.addBlock(index, colour, item);


        if (index === this._nextEmpty) {
            this.startItemsNo.add(this._nextEmpty - this.start);
            this.startItemsYes.add(1);
            this._nextEmpty++;
        }
        else if (this._nextEmpty > this.start) //index >= this._nextEmpty + 1
            this.startItemsNo.add(index - this.start);

        if (index === this._nextEmptyB) {
            this._nextEmptyB--;
        }
    }

}