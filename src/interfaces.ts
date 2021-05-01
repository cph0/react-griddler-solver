import { Line } from "./classes/index";

export interface Griddler {
    width: number;
    height: number;
    rows: Line[];
    columns: Line[];
    points: Point[];
    dots: Point[];
}

export interface Item {
    index: number;
    value: number;
    colour: string;
}

export interface Point {
    x: number;
    y: number;
    colour?: string;
}