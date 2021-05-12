import IndexMap from "ts-index-map";
import { Item } from "../interfaces";
import Block from "./Block";

export default class Gap extends Block {
    private _nextEmpty: number;
    private _nextEmptyB: number;
    private readonly _blocks: IndexMap<Block>;
    public readonly points: Map<number, string>;

    public readonly startItemsYes: Set<number>;
    public readonly startItemsNo: Set<number>;

    get hasFirstPoint() {
        return this._blocks.has('start', this.start);
    }

    get hasLastPoint() {
        return this._blocks.has('end', this.end);
    }

    get hasPoints() {
        return this._blocks.size > 0;
    }

    get isFull() {
        const firstBlock = this._blocks.get('start', this.start)[0];
        return firstBlock && firstBlock.end === this.end;
    }

    constructor(start: number, end: number, blocks?: Block[], points?: [number, string][]) {
        super(start, end);
        this._nextEmpty = start;
        this._nextEmptyB = end;
        this._blocks = new IndexMap(['start', 'end'], blocks || []);
        this.points = new Map(points || []);
        this.startItemsYes = new Set();
        this.startItemsNo = new Set();
        this.refreshStartItems();
    }

    canStartWith(item: Item) {
        return !this.startItemsNo.has(item.value);
    }

    *getBlocks() {
        for (let i = this.start; i <= this.end; i++) {
            const block = this._blocks.get('start', i)[0];

            if(block)
                yield block;
        }
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

                if(block)
                    this.startItemsNo.add(block.start - this.start);
            }
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
        while (this.points.has(this._nextEmptyB))
            this._nextEmptyB--;
    }

    splitGap(index: number) {
        this._nextEmptyB = index - 1;

        while (this.points.has(this._nextEmptyB))
            this._nextEmptyB--;

        const blocks: Block[] = [];
        for (let i = index + 1; i <= this.end; i++) {
            const block = this._blocks.get('start', i)[0];
            if (block) {
                blocks.push(block);
                this._blocks.delete('start', i);
            }
        }

        const points: [number, string][] = [];
        this.points.forEach((f, k) => {
            if (k > index) {
                points.push([k, f]);
                this.points.delete(k);
            }
        });

        const rightGap = new Gap(index + 1, this.end, blocks, points);
        this.end = index - 1;
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

    addPoint(index: number, colour: string, item?: number) {
        if (!this.points.has(index)) {
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
}