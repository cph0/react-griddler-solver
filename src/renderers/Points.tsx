import React, { CSSProperties } from 'react';
import { Point } from '../interfaces';

export interface PointProps {
    pt: Point;
    squareSize: number;
}

export interface PointsProps {
    points: Point[];
    squareSize: number;
}

function PointCell({ pt, squareSize }: PointProps) {
    const sClass: CSSProperties = {
        position: "absolute",
        width: squareSize + "px",
        height: squareSize + "px",
        backgroundColor: pt.colour
    };
    return <div style={{ ...sClass, top: pt.y * squareSize, left: pt.x * squareSize }} />;
}

export default function Points({ points, squareSize }: PointsProps) {
    return <>{points.map(m => <PointCell key={`${m.x}_${m.y}`} pt={m} squareSize={squareSize} />)}</>;
}