import React from 'react';
import solve from './helpers/solver';
import { GriddlerFile } from './data/index';
import { Dots, Grid, LeftLabels, Points, TopLabels } from './renderers';

interface GriddlerProps {
    griddler: GriddlerFile;
    squareSize?: number;
}

export default function Griddler({
    griddler,
    squareSize = 20
}: GriddlerProps) {
    const width = griddler.width;
    const height = griddler.height;
    const rowDepth = griddler.rowDepth;
    const colDepth = griddler.colDepth;

    const rows = griddler.rows.map(f => {
        return f.map((value, index) => {
            const parts = value.toString().split('.');
            return {
                index,
                value: parseInt(parts[0]),
                colour: parts[1] === '1' ? 'green' : 'black'
            };
        });
    });

    const cols = griddler.cols.map(f => {
        return f.map((value, index) => {
            const parts = value.toString().split('.');
            return {
                index,
                value: parseInt(parts[0]),
                colour: parts[1] === '1' ? 'green' : 'black'
            };
        });
    });

    const { points, dots } = solve(rows, cols);

    console.log(cols, rows);

    return (
        <div className="m-2 d-inline-block"
            style={{ width: ((rowDepth + width) * squareSize) + "px" }}>
            <div style={{
                position: "relative", height: (colDepth * squareSize) + "px"
            }}>
                <TopLabels width={width} rowDepth={rowDepth} colDepth={colDepth}
                    squareSize={squareSize}
                    lines={cols} />
            </div>
            <div style={{ height: (height * squareSize) + "px" }}>
                <div style={{
                    position: "relative", display: "inline-block",
                    width: (rowDepth * squareSize) + "px"
                }}>
                    <LeftLabels width={width} rowDepth={rowDepth} colDepth={colDepth}
                        squareSize={squareSize}
                        lines={rows} />
                </div>
                <div style={{
                    position: "relative", display: "inline-block"
                }}>
                    <Grid width={width} height={height} squareSize={squareSize} />
                    <Points points={points} squareSize={squareSize} />
                    <Dots points={dots} squareSize={squareSize} />
                </div>
            </div>
        </div>
    );
}