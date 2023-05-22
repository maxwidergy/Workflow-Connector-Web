import BaseNode from './BaseNode';

import {
    Node,
    NodeHeader,
} from './Styles';

// CONSTANTS -------------------------------------------------------------------

const name = 'InputNode'
const label = 'Input Node'

const inputs = []
const outputs = ["OUT"]

// COMPONENTS ------------------------------------------------------------------

export default function InputNode({ type, data, xPos, yPos, selected }) {
    return (
        <BaseNode type={type} data={data} xPos={xPos} yPos={yPos} inputs={inputs} outputs={outputs} deletable={false} copyable={false}>
            <Node selected={selected}>
                <NodeHeader>
                    {data.label}
                </NodeHeader>
            </Node>
        </BaseNode>
    );
}
