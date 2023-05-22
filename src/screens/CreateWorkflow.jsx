import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Paper,
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { useClients } from '../hooks/useClients';

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];

function CreateWorkflow() {
    const navigate = useNavigate();

    const [method, setMethod] = useState('');
    const [requestPath, setRequestPath] = useState('');
    const [workflowType, setWorkflowType] = useState('');
    const [client, setClient] = useState('');

    const [requestPathError, setRequestPathError] = useState(false);

    // Fetch clients data
    const { isLoading, isError, data: clients } = useClients();

    if (isLoading) return <div>Loading...</div>;

    if (isError) {
        return <div>Error fetching clients.</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!requestPathError) {
            try {
                const response = await fetch('https://localhost:5001/api/v1/workflows', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        method,
                        requestPath,
                        workflowType,
                        clientId: client,
                        activities: [{ id: 1, activityType: 'InputNode', xPosition: 100, yPosition: 100 }]
                    }),
                });

                if (response.ok) {
                    const responseData = await response.json();
                    navigate(`/Workflows/${responseData.id}`);
                } else {
                    console.error('Error creating workflow:', response.statusText);
                }
            } catch (error) {
                console.error('Error creating workflow:', error);
            }
        }
    };

    const handleRequestPathChange = (e) => {
        setRequestPath(e.target.value)
        const value = e.target.value;
        const requestPathPattern = /^\/[\w-.~!$&'()*+,;=:@/]*$/;

        if (!value || requestPathPattern.test(value)) {
            setRequestPathError(false);
        } else {
            setRequestPathError(true);
        }
    };

    return (
        <Paper>
            <Box p={2} maxWidth={500} mx="auto">
            <Typography variant="h4" mb={2}>
                Create New Workflow
            </Typography>
            <form onSubmit={handleSubmit}>
                <FormControl required fullWidth margin="normal">
                    <InputLabel id="method-select-label">Method</InputLabel>
                    <Select
                        labelId="method-select-label"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        label="Method"
                    >
                        {httpMethods.map((method) => (
                        <MenuItem key={method} value={method}>
                            {method}
                        </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    value={requestPath}
                    label="Request Path"
                    fullWidth
                    required
                    margin="normal"
                    error={requestPathError}
                    helperText={requestPathError ? 'Invalid request path. Please enter a valid request path starting with a “/” and without any URL scheme, domain or query string.' : ''}
                    onChange={handleRequestPathChange}
                />
                <TextField
                    value={workflowType}
                    onChange={(e) => setWorkflowType(e.target.value)}
                    label="Workflow Type"
                    fullWidth
                    required
                    margin="normal"
                />
                <FormControl required fullWidth margin="normal">
                <InputLabel id="client-select-label">Client</InputLabel>
                    <Select
                        labelId="client-select-label"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        label="Client"
                    >
                        {clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                                {client.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                    <Box mt={2} display="flex" justifyContent="space-between">
                    <Button onClick={() => navigate('/Workflows')}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Create
                    </Button>
                </Box>
            </form>
            </Box>
        </Paper>
    );
}

export default CreateWorkflow;
