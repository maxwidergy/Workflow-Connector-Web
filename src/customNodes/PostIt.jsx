import { TextField } from '@mui/material';
import BaseNode from './BaseNode';
import useStore from '../store';

// CONSTANTS -------------------------------------------------------------------

const name = 'PostIt'
const label = 'Post It'

const inputs = []
const outputs = []

export const defaults = {
    label: label,
    text: 'Write something',
}

// CONSTUCTORS -----------------------------------------------------------------

export const asReactFlowNode = (id, data = defaults) => ({
    id,
    type: name,
    position: { x: Math.random() * window.innerWidth - 100, y: Math.random() * window.innerHeight },
    data: {...data, id: id},
})

// COMPONENTS ------------------------------------------------------------------

const PostIt = ({ type, data, xPos, yPos }) => {
    const updateNodeData = useStore((state) => state.updateNodeData);

    return (
        <BaseNode type={type} data={data} xPos={xPos} yPos={yPos} inputs={inputs} outputs={outputs}>
            <TextField
                id="text"
                label="Text"
                defaultValue={data.text}
                variant="outlined"
                multiline
                maxRows={8}
                size="small"
                margin="dense"
                onChange={(event) => {
                    const { id, value } = event.target;
                    const updatedData = { ...data, [id]: value };
                    updateNodeData(data.id, updatedData);
                }}
            />
        </BaseNode>
    );
};

export default PostIt;
