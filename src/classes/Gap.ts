import IndexMap from "ts-index-map";
import { Item } from "../interfaces";
import Range from "./Range";
import Block from "./Block";
import { Action } from "./Path";

export default class Gap extends Range {
    private _nextEmpty: number;
    private _nextEmptyB: number;
    private readonly _blocks: IndexMap<Block>;

    public readonly startItemsYes: Set<number>;
    public readonly startItemsNo: Set<number>;

    get hasFirstPoint() {
        return this._blocks.has('start', this.start);
    }

    get hasLastPoint() {
        return this._blocks.has('end', this.end);
    }

    get numberOfBlocks() {
        return this._blocks.size;
    }

    get hasPoints() {
        return this._blocks.size > 0;
    }

    get isFull() {
        const firstBlock = this._blocks.get('start', this.start)[0];
        return firstBlock && firstBlock.end === this.end;
    }

    constructor(start: number, end: number, blocks?: Block[]) {
        super(start, end);
        this._nextEmpty = start;
        this._nextEmptyB = end;
        this._blocks = new IndexMap(['start', 'end'], blocks || []);
        this.startItemsYes = new Set();
        this.startItemsNo = new Set();
        this.refreshStartItems();
        this.refreshEndItems();
    }

    canStartWith(item: Item) {
        return !this.startItemsNo.has(item.value);
    }

    *getBlocks() {
        for (let i = this.start; i <= this.end; i++) {
            const block = this._blocks.get('start', i)[0];

            if (block)
                yield block;            
        }
    }

    getBlockAtStart(start: number) {
        return this._blocks.get('start', start)[0];
    }

    getBlockAtEnd(end: number) {
        return this._blocks.get('end', end)[0];
    }

    getLastBlock(start: number) {
        let lastBlock;

        for (let i = start; i >= this.start; i--) {
            lastBlock = this.getBlockAtEnd(i);

            if (lastBlock)
                break;
        }

        return lastBlock;
    }

    getNextBlock(start: number) {
        let nextBlock;

        for (let i = start; i <= this.end; i++) {
            nextBlock = this.getBlockAtStart(i);

            if (nextBlock)
                break;
        }

        return nextBlock;
    }

    private refreshStartItems() {
        const firstBlock = this._blocks.get('start', this.start)[0];
        while (firstBlock && firstBlock.end >= this._nextEmpty) {
            if (this._nextEmpty - this.start > 0)
                this.startItemsNo.add(this._nextEmpty - this.start);

            this._nextEmpty++;
        }

        if (firstBlock) {
            for (let i = this.start + 1; i <= this.end; i++) {
                const block = this._blocks.get('start', i)[0];

                if (block)
                    this.startItemsNo.add(block.start - this.start);
            }
        }
    }

    private refreshEndItems() {
        const lastBlock = this._blocks.get('end', this.end)[0];
        while (lastBlock && lastBlock.start <= this._nextEmptyB) {
            this._nextEmptyB--;
        }
    }

    setStart(start: number) {
        super.setStart(start);
        this._nextEmpty = start;
        this.refreshStartItems();
    }

    setEnd(end: number) {
        super.setEnd(end);
        this._nextEmptyB = end;
        this.refreshEndItems();
    }

    splitGap(index: number) {

        const blocks: Block[] = [];
        for (let i = index + 1; i <= this.end; i++) {
            const block = this._blocks.get('start', i)[0];
            if (block) {
                blocks.push(block);
                this._blocks.delete('start', i);
            }
        }

        const rightGap = new Gap(index + 1, this.end, blocks);
        this.setEnd(index - 1);
        return rightGap;
    }

    private addBlock(index: number, colour: string, item?: number) {
        const leftBlock = this._blocks.get('end', index - 1)[0];
        const rightBlock = this._blocks.get('start', index + 1)[0];
        let start = index;
        let end = index;

        if (leftBlock && leftBlock.colour === colour) {
            this._blocks.delete('end', index - 1);
            start = leftBlock.start;
        }

        if (rightBlock && rightBlock.colour === colour) {
            this._blocks.delete('start', index + 1);
            end = rightBlock.end;
        }

        this._blocks.add(new Block(start, end, colour, item));
    }

    addPoint(index: number, colour: string, action: Action, item?: number) {
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