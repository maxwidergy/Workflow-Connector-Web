import BaseNode from './BaseNode';
import { useState } from 'react';
import useStore from '../store';
import { styled } from '@mui/material/styles';

import {
    Node,
    NodeHeader,
    NodeContent,
  } from './Styles';

import {
    Stack,
    TextField,
    IconButton,
    Typography,
    FormControlLabel,
    Switch,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';


// CONSTANTS -------------------------------------------------------------------

const name = 'Mapping'
const label = 'Mapping'

const inputs = ["IN"]
const outputs = ["OUT"]

export const defaults = {
    label: label,
    mappings: [],
    isJsonPath: true,
}

// CONSTUCTORS -----------------------------------------------------------------

export const asReactFlowNode = (id, data = defaults) => ({
    id,
    type: name,
    position: { x: Math.random() * window.innerWidth - 100, y: Math.random() * window.innerHeight },
    data: {...data, id: id},
})

// COMPONENTS ------------------------------------------------------------------

const CustomSwitch = styled(Switch)(({ theme }) => ({
    width: 48,
    height: 26,
    padding: 5,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(4px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(18px)',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: '#aab4be',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: '#001e3c',
        width: 24,
        height: 24,
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        borderRadius: 20 / 2,
    },
}));


export default function Mapping({ type, data, xPos, yPos, selected }) {
    const [mappings, setMappings] = useState(data.mappings.map(mapping => ({...mapping, isValid: true, isJsonPath: true})) || []);
    const [isJsonPath, setIsJsonPath] = useState(data.isJsonPath ?? true);

    const updateNodeData = useStore((state) => state.updateNodeData);

    const validateJsonPath = (mappingValue) => {
        const jsonPathRegexOld = /^(\$|@)(\..+)*$/;
        const jsonPathRegex = /^(\$|\@)(\.\w+|\['\w+'\]|\[\d+\])*$/;
        return jsonPathRegex.test(mappingValue);
    };

    const validateXPath = (mappingValue) => {
        try {
            document.evaluate(mappingValue, document, null, XPathResult.ANY_TYPE, null);
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleSwitchChange = () => {
        const newMappings = mappings.map(mapping => {
            const newMapping = { ...mapping };
            newMapping.isValid = isJsonPath ? validateXPath(newMapping.value) : validateJsonPath(newMapping.value);
            return newMapping;
        });
        setMappings(newMappings);
        setIsJsonPath(!isJsonPath);
        const updatedData = { ...data, isJsonPath: !isJsonPath};
        updateNodeData(data.id, updatedData);
    };

    return (
        <BaseNode type={type} data={data} xPos={xPos} yPos={yPos} inputs={inputs} outputs={outputs}>
            <Node selected={selected}>
                <NodeHeader>
                    {data.label}
                </NodeHeader>
                <NodeContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>XML</Typography>
                        <FormControlLabel
                        control={
                            <CustomSwitch
                                checked={isJsonPath}
                                onChange={handleSwitchChange}
                                name="mapping-switch"
                                color="primary"
                            />
                            }
                        />
                        <Typography>JSON</Typography>
                    </Stack>
                    {mappings.map((mapping, index) => (
                        <Stack key={index} direction="row" alignItems="center" spacing={1}>
                            <TextField
                                required
                                id={`mapping-key-${index}`}
                                label="Variable"
                                value={mapping.key}
                                onChange={(event) => {
                                    const newMappings = [...mappings];
                                    newMappings[index].key = event.target.value;
                                    setMappings(newMappings);
                                    const updatedData = { ...data, mappings: newMappings };
                                    updateNodeData(data.id, updatedData);
                                }}
                                size="small"
                                margin="dense"
                            />
                            <TextField
                                required
                                id={`mapping-value-${index}`}
                                label={isJsonPath ? "JSON Path" : "XPath"}
                                value={mapping.value}
                                error={!mapping.isValid}
                                //helperText={!mapping.isValid ? (isJsonPath ? "Invalid JSONPath" : "Invalid XPath") : ""}
                                onChange={(event) => {
                                    const newMappings = [...mappings];
                                    newMappings[index].value = event.target.value;
                                    newMappings[index].isValid = isJsonPath ? validateJsonPath(event.target.value) : validateXPath(event.target.value);
                                    setMappings(newMappings);
                                    const updatedData = { ...data, mappings: newMappings.map(mapping => ({key: mapping.key, value: mapping.value})) };
                                    updateNodeData(data.id, updatedData);
                                }}
                                size="small"
                                margin="dense"
                            />
                            <IconButton
                                color="error"
                                aria-label="delete mapping"
                                onClick={() => {
                                    const newMappings = mappings.filter((_, i) => i !== index);
                                    setMappings(newMappings);
                                    const updatedData = { ...data, mappings: newMappings };
                                    updateNodeData(data.id, updatedData);
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    ))}
                    <IconButton sx={{ marginTop: 2}}
                        color="primary"
                        aria-label="add mapping"
                        onClick={() => {
                            setMappings([...mappings, { key: '', value: '', isValid: true }]);
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </NodeContent>
            </Node>
        </BaseNode>
    );
}
