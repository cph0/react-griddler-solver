import React, { CSSProperties, useState } from 'react';
import solve from './helpers/solver';
import { Item, Point } from './interfaces';
import { Line } from './classes/index';
import { griddlers } from './data/index';

interface GridProps {
    width: number;
    height: number;
    squareSize: number;
}

interface PointProps {
    pt: Point;
    squareSize: number;
}

interface PointsProps {
    points: Point[];
    squareSize: number;
}

interface LabelsProps {
    lines: Line[];
    width: number;
    depth: number;
    squareSize: number;
}

export function Grid({ width, height, squareSize }: GridProps) {
    const grid = [];

    const gridStyle: CSSProperties = {
        position: "absolute",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
        width: squareSize + "px",
        height: squareSize + "px"
    };

    for (let i = 0; i < width; i++) {
        for (let c = 0; c < height; c++) {
            const sClass = { ...gridStyle };

            if (i % 5 === 0)
                sClass.borderLeft = "1px solid black";

            if (c % 5 === 0)
                sClass.borderTop = "1px solid black";

            grid.push(
                <div key={`${i}_${c}`} style={{
                    ...sClass, top: c * squareSize, left: i * squareSize
                }}></div>
            );
        }
    }

    return <>{grid}</>;
}

export function PointCell({ pt, squareSize }: PointProps) {
    const sClass: CSSProperties = {
        position: "absolute",
        width: squareSize + "px",
        height: squareSize + "px",
        backgroundColor: pt.colour
    };
    return <div style={{ ...sClass, top: pt.y, left: pt.x }} />;
}

export function Points({ points, squareSize }: PointsProps) {
    return <>{points.map(m => <PointCell key={`${m.x}_${m.y}`} pt={m} squareSize={squareSize} />)}</>;
}

export function Dot({ pt }: PointProps) {
    const sClass: CSSProperties = {
        position: "absolute",
        backgroundColor: "black",
        width: "4px",
        height: "4px"
    };
    return <div style={{ ...sClass, top: pt.y + 8, left: pt.x + 8 }} />;
}

export function Dots({ points, squareSize }: PointsProps) {
    return <>{points.map(m => <Dot key={`${m.x}_${m.y}`} pt={m} squareSize={squareSize} />)}</>;
}

export function TopLabels({ lines, width, depth, squareSize }: LabelsProps) {

    const lbls = [];

    for (let i = 0; i < width; i++) {
        for (let c = 0; c < depth; c++) {
            const left = (depth * squareSize) + (i * squareSize);
            const item = lines[i].items[c];

            if (item) {
                lbls.push((
                    <input key={`${i}_${c}`} type="text" value={item.value}
                        onChange={() => { }}
                        style={{
                            width: squareSize + "px",
                            height: squareSize + "px",
                            position: "absolute",
                            left: left,
                            top: c * squareSize,
                            backgroundColor: item.colour !== "black" ? item.colour : ""
                        }} />
                ));
            }
        }
    }

    return <>{lbls}</>;
}

export function LeftLabels({ lines, width, depth, squareSize }: LabelsProps) {

    const lbls = [];

    for (let i = 0; i < width; i++) {
        for (let c = 0; c < depth; c++) {
            const top = (depth * squareSize) + (i * squareSize);
            const item = lines[i].items[c];

            if (item) {
                lbls.push((
                    <input key={`${i}_${c}`} type="text" value={item.value}
                        onChange={() => { }}
                        style={{
                            width: squareSize + "px",
                            height: squareSize + "px",
                            position: "absolute",
                            left: c * squareSize,
                            top,
                            backgroundColor: item.colour !== "black" ? item.colour : ""
                        }} />
                ));
            }
        }
    }

    return <>{lbls}</>;
}

export default function Griddler() {

    const [sG, setSg] = useState(0);

    const griddler = griddlers[sG];

    const width = griddler.width;
    const height = griddler.height;
    const depth = 4;

    const data = {
        rows: [
            [1],
            [2],
            [1, 3],
            [5],
            [5],
            [2, 2],
            [2, 1, 1],
            [1, 1]
        ],
        cols: [
            [1, 1],
            [5],
            [3],
            [2],
            [2],
            [8],
            [2, 1],
            [1, 1]
        ],
        grid: null
    };

    const data2 = {
        rows: [
            [1, 1],
            [2],
            [1, 1],
            [1, 1]
        ],
        cols: [
            [2],
            [1],
            [1],
            [4]
        ]
    }

    const rows: Line[] = [];
    const cols: Line[] = [];

    griddler.rows.forEach((f: number[], i: number) => {
        const items: Item[] = f.map((value, index) => ({ index, value, colour: "black" }));
        const line = new Line(width, i, items);
        rows.push(line);
    })

    griddler.cols.forEach((f: number[], i: number) => {
        const items: Item[] = f.map((value, index) => ({ index, value, colour: "black" }));
        const line = new Line(height, i, items);
        cols.push(line);
    })

    rows.forEach(f => {
        f.setPairLines(cols);
    });

    cols.forEach(f => {
        f.setPairLines(rows);
    });

    solve(rows, cols);

    console.log(cols, rows);

    const squareSize = 20;
    const points = rows.reduce((acc, row, index) => {
        const dts = Array.from(row.points.entries()).map(m => {
            return {
                x: squareSize * m[0],
                y: squareSize * index,
                colour: m[1]
            };
        });

        return [...acc, ...dts];
    }, [] as { x: number; y: number; colour: string }[]);
    const dots = rows.reduce((acc, row, index) => {
        const dts = Array.from(row.dots.keys()).map(m => {
            return {
                x: squareSize * m,
                y: squareSize * index
            };
        });

        return [...acc, ...dts];
    }, [] as { x: number; y: number }[]);

    const onSelectGriddler = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSg(parseInt(event.target.value));
    }

    const renderGriddlerList = () => {
        let html = null;
        let items = [];

        items = griddlers.map((g, i) => <option key={g.name} value={i}>{g.name}</option>);

        html = (
            <select className="form-control" onChange={(e) => onSelectGriddler(e)} value={sG}>
                {items}
            </select>
        );

        return html;
    }

    const square = (depth * 20) + "px";

    return (
        <>
            <div className="row">
                <div className="col-md-6">
                    {renderGriddlerList()}
                </div>
            </div>
            <div className="row">
                <div className="col" style={{ overflowY: "auto", height: "calc(78vh)" }}>
                    <div style={{
                        position: "relative", display: "inline-block",
                        width: square, height: square
                    }}>
                        <TopLabels width={width} depth={depth} squareSize={squareSize}
                            lines={cols} />
                        <LeftLabels width={width} depth={depth} squareSize={squareSize}
                            lines={rows} />
                    </div>
                    <div style={{ position: "relative", display: "inline-block" }}>
                        <Grid width={width} height={height} squareSize={squareSize} />
                        <Points points={points} squareSize={squareSize} />
                        <Dots points={dots} squareSize={squareSize} />
                    </div>
                </div>
            </div>
        </>
    );
}