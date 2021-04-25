import 'regenerator-runtime/runtime';
import { Line } from "../classes/index";

export default function* forEachLine(lines: Line[], run?: (l: Line) => boolean, minLineValue = 1) {
    for (const l of lines) {
        if (l.lineValue >= minLineValue && !l.complete && (!run || run(l))) {
            yield l;
        }
    }
}