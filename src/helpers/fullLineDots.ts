import { Action, Line } from "../classes/index";
import forEachLine from "./forEachLine";

export default function fullLineDots(lines: Line[]) {
    const run = (l: Line) => l.sum(false) === l.linePointsValue();
    for (const line of forEachLine(lines, run, 0)) {
        for (let Pos = 0; Pos < line.lineLength; Pos++) {
            if (!line.points.has(Pos))
                line.addDot(Pos, Action.FullLineDots);
        }
    }
}