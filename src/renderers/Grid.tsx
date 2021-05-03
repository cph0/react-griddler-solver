import React, { CSSProperties } from 'react';

interface GridProps {
    width: number;
    height: number;
    squareSize: number;
}

export default function Grid({ width, height, squareSize }: GridProps) {
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
                }} />
            );
        }
    }

    return <>{grid}</>;
}
