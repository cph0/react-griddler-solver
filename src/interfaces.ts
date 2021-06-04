import { Line } from "./classes/index";

export interface Griddler {
    width: number;
    height: number;
    rows: Line[];
    columns: Line[];
    points: Point[];
    dots: Point[];
}

export interface Colour {
    colour: string;
}

export interface Item extends Colour {
    index: number;
    value: number;
}

export interface Point {
    x: number;
    y: number;
    colour?: string;
}