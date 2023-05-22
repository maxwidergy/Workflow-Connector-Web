import { Paper, IconButton, Tooltip } from '@mui/material';
import { Position, NodeToolbar, Handle } from 'reactflow';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useStore from '../store';

const distribute = (min, max, n, i) => min + ((i + 1) * (max - min)) / (n + 1);

export default function BaseNode({
    type,
    data,
    xPos,
    yPos,
    inputs,
    outputs,
    children,
    standalone = false,
    deletable = true,
    copyable = true,
}) {
    const removeNode = useStore((state) => state.removeNode);
    const addNode = useStore((state) => state.addNode);
    const maxNodeId = useStore((state) => state.maxNodeId);
    const setMaxNodeId = useStore((state) => state.setMaxNodeId);

    const deleteNodeById = (id) => {
        removeNode(id);
    };

    const copyNode = () => {
        const newId = `${maxNodeId + 1}`;

        const newNode = {
            id: newId,
            type: type,
            position: { x: xPos + 200, y: yPos + 200 },
            data: {
                ...data,
                id: newId,
            },
        };

        addNode(newNode);
        setMaxNodeId(newId);
    };

    return (
    <>
        { (deletable || copyable) &&
            <NodeToolbar position={Position.Top} nodeId={data.id}>
            <Paper elevation={3}>
                {deletable &&
                    <Tooltip title="Delete" placement="top" disableInteractive>
                        <IconButton onClick={() => deleteNodeById(data.id)} color="primary">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                }
                {copyable && 
                    <Tooltip title="Copy" placement="top" disableInteractive>
                        <IconButton onClick={() => copyNode()} color="primary">
                            <ContentCopyIcon />
                        </IconButton>
                    </Tooltip>
                }
            </Paper>
            </NodeToolbar>
        }
        {!standalone && inputs.map((id, i) => (
            <Handle
                key={id}
                id={id ? `${id}` : 'in'}
                title={id || 'in'}
                position={Position.Left}
                style={{
                    top: distribute(0, 100, inputs.length, i) + '%',
                }}
                type="target"
            />
        ))}
        {children}
        {!standalone && outputs.map((id, i) => (
            <Handle
                key={id}
                id={id ? `${id}` : 'out'}
                title={id || 'out'}
                position={Position.Right}
                style={{
                    top: distribute(0, 100, outputs.length, i) + '%',
                }}
                type="source"
            />
        ))}
    </>
    );
};
