import React from 'react';
import { BaseEdge, getBezierPath } from 'reactflow';
import { useTheme } from '@mui/material';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    selected,
}) {
    const theme = useTheme();

    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const customStyle = {
        stroke: selected ? 'red' : theme.palette.primary.main, // Change the color based on the selection state
        strokeWidth: selected ? 4 : 3, // Change the stroke width based on the selection state
        ...style,
    };

    return (
        <BaseEdge path={edgePath} style={customStyle} id={id} className="react-flow__edge-path" />
    );
};
