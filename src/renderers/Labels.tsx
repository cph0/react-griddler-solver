import React from 'react';
import { Item } from '../interfaces';

interface LabelsProps {
    lines: Item[][];
    width: number;
    rowDepth: number;
    colDepth: number;
    squareSize: number;
}

export function TopLabels({ lines, width, rowDepth, colDepth, squareSize }: LabelsProps) {

    const lbls = [];

    for (let i = 0; i < width; i++) {
        for (let c = 0; c < colDepth; c++) {
            const left = (rowDepth * squareSize) + (i * squareSize);
            const item = lines[i][c];

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

export function LeftLabels({ lines, width, rowDepth, squareSize }: LabelsProps) {

    const lbls = [];

    for (let i = 0; i < width; i++) {
        for (let c = 0; c < rowDepth; c++) {
            const top = (i * squareSize);
            const item = lines[i] ? lines[i][c] : null;

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
