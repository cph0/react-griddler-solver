import Range from "./Range";
import { Colour, Item } from "../interfaces";

export default class Block extends Range implements Colour {
    public readonly colour: string;
    public readonly item?: number;

    constructor(start: number, end: number, colour: string, item?: number) {
        super(start, end);
        this.colour = colour;
        this.item = item;
    }

    is(item: Item) {
        return this.size === item.value && this.colour === item.colour;
    }

    canBe(item: Item) {
        return this.size <= item.value && this.colour === item.colour;
    }
}