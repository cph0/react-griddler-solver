import React, { CSSProperties } from 'react';
import { PointsProps, PointProps } from './Points';

function Dot({ pt, squareSize }: PointProps) {
    const sClass: CSSProperties = {
        position: "absolute",
        backgroundColor: "black",
        width: "4px",
        height: "4px"
    };
    return <div style={ { ...sClass, top: (pt.y * squareSize) + 8, left: (pt.x * squareSize) + 8 } } />;
}

export default function Dots({ points, squareSize }: PointsProps) {
    return (
        <>
            {points.map(m => <Dot key={`${m.x}_${m.y}`} pt={m} squareSize={squareSize} />)}
        </>
    );
}