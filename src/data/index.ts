import Bird10x10 from './Bird10x10.json';
import Coffee10x10 from './Coffee10x10.json';
import Face10x10 from './Face10x10.json';
import Heart10x10 from './Heart10x10.json';
import Leaf10x10 from './Leaf10x10.json';
import Man10x10 from './Man10x10.json';
import Mouse10x10 from './Mouse10x10.json';
import Notes10x10 from './Notes10x10.json';
import Rabbit10x10 from './Rabbit10x10.json';
import Snail10x10 from './Snail10x10.json';
import Tree10x10 from './Tree10x10.json';
import TV10x10 from './TV10x10.json';

interface GriddlerFile {
    name?: string;
    width: number;
    height: number;
    rows: number[][];
    cols: number[][];
}

export const griddlers: GriddlerFile[] = [
    Bird10x10, Coffee10x10 as GriddlerFile, Face10x10 as GriddlerFile,
    Heart10x10 as GriddlerFile, Leaf10x10, Man10x10, Mouse10x10,
    Notes10x10, Rabbit10x10, Snail10x10, Tree10x10, TV10x10
];