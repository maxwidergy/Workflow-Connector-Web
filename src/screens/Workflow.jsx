// React imports
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useStore from '../store.js';
import { shallow } from 'zustand/shallow';

// Custom Nodes imports
import * as HttpRequest from '../customNodes/HttpRequest';
import * as PostIt from '../customNodes/PostIt';
import * as Mapping from '../customNodes/Mapping';
import InputNode from '../customNodes/InputNode.jsx';

// Custom Edges imports
import CustomEdge from '../customNodes/CustomEdge.jsx';

// React Flow imports
import ReactFlow, { Background, MiniMap, SelectionMode, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import { createReactFlowData, createWorkflow } from '../utils.js';

// Material UI imports
import {
    Alert,
    Box,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Popover,
    Snackbar,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Divider,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

import { useTheme } from '@mui/material';

// Constants and variables
const proOptions = { hideAttribution: true }
const panOnDrag = [1, 2]
const duration = 500

// Node types
const nodeTypes = {
    InputNode: InputNode,
    PostIt: PostIt.default,
    HttpRequest: HttpRequest.default,
    Mapping: Mapping.default,
};

const edgeTypes = {
    CustomEdge,
}

async function fetchWorkflowData(workflowId) {
    const response = await fetch(`https://localhost:5001/api/v1/workflows/${workflowId}`);
    const data = await response.json();

    return data;
}

function Workflow() {
    const theme = useTheme();
    const backgroundColor = theme.palette.background.default;

    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const { workflowId } = useParams();
    const { data: workflowData, isLoading, isError, error } = useQuery(['workflowData', workflowId], () => fetchWorkflowData(workflowId));

    const [workflowIdState, setWorkflowIdState] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [saveDialogOpen, setSaveDialogOpen] = useState(false);

    const handleSaveConfirmation = () => {
        const inputNode = nodes.find((node) => node.type === "InputNode");
        const inputNodeConnections = edges.filter((edge) => edge.source === inputNode.id);

        if (!inputNode) {
            setErrorMessage("Error: Input node not found. Please add an Input node to the workflow.");
            setSnackbarOpen(true);
            return;
        }
    
        if (inputNodeConnections.length === 0) {
            setSaveDialogOpen(true);
        } else {
            handleSaveAndPut();
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setSnackbarOpen(false);
        setErrorMessage(null);
    };

    useEffect(() => {
        if (workflowData) {
            setWorkflowData(workflowData);
        }
    }, [workflowData]);

    const setWorkflowData = (data) => {
        setWorkflowIdState(data.id);
        const { nodes, edges, maxNodeId } = createReactFlowData(data.activities);
        setNodes(nodes);
        setEdges(edges);
        setMaxNodeId(maxNodeId);
    }

    const handleSaveAndPut = async () => {
        const workflow = createWorkflow(workflowIdState, nodes, edges);

        const response = await fetch(`https://localhost:5001/api/v1/workflows/${workflowId}`,
            {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
                body: JSON.stringify(workflow),
            }
        );

        if (response.ok) {
            setSnackbarOpen(true);
            setErrorMessage(null);
        } else {
            const errorData = await response.json();
            setErrorMessage(errorData.message || "An error occurred while saving the workflow.");
            setSnackbarOpen(true);
        }
    };

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const {
        nodes,
        edges,
        maxNodeId,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode: storeAddNode,
        addEdge,
        setNodes,
        setEdges,
        setMaxNodeId,
    } = useStore(
        (state) => ({
            nodes: state.nodes,
            edges: state.edges,
            maxNodeId: state.maxNodeId,
            onNodesChange: state.onNodesChange,
            onEdgesChange: state.onEdgesChange,
            onConnect: state.onConnect,
            addNode: state.addNode,
            addEdge: state.addEdge,
            setNodes: state.setNodes,
            setEdges: state.setEdges,
            setMaxNodeId: state.setMaxNodeId,
        }),
        shallow
    );

    const createNode = (constructor) => (_) => {
        const newMaxNodeId = maxNodeId + 1;
        const node = constructor(`${newMaxNodeId}`, undefined);
        storeAddNode(node);
        setMaxNodeId(newMaxNodeId);
        handleClose();
        setTimeout(() => fitView({ duration }), 10);
    };

    const actions = [
        { 
            icon: <AddIcon />,
            name: 'Http Request',
            onClick: createNode(HttpRequest.asReactFlowNode),
        },
        {
            icon: <AddIcon />,
            name: 'Post It',
            onClick: createNode(PostIt.asReactFlowNode),
        },
        {
            icon: <AddIcon />,
            name: 'Mapping',
            onClick: createNode(Mapping.asReactFlowNode),
        },
    ];

    const handleUndo = () => {
        useStore.getState().undo();
    };
    
    const handleRedo = () => {
        useStore.getState().redo();
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CircularProgress />
            </Box> 
        )
    }

    if (isError) {
        return (
            <div>
            Error: {error.message}
            {/* Display the error message or a custom error message */}
            </div>
        );
    }

    const handleAddClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    return (
        <div style={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
            <ReactFlow style={{background: backgroundColor, cursor: 'pointer' }}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={addEdge}
                fitView
                panOnScroll
                selectionOnDrag
                panOnDrag={panOnDrag}
                selectionMode={SelectionMode.Partial}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                proOptions={proOptions}
            >
                <Background style={{background: backgroundColor}} />
                <MiniMap style={{background: backgroundColor}}/>
            </ReactFlow>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 1,
                    padding: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                >
                <IconButton onClick={() => zoomOut({ duration })} color="primary">
                    <ZoomOutIcon />
                </IconButton>
                <IconButton onClick={() => zoomIn({ duration })} color="primary">
                    <ZoomInIcon />
                </IconButton>
                <IconButton onClick={() => fitView({ duration })} color="primary">
                    <CenterFocusStrongIcon />
                </IconButton>
                <Divider orientation="vertical" variant="middle" flexItem />
                <IconButton onClick={handleUndo} color="primary">
                    <UndoIcon />
                </IconButton>
                <IconButton onClick={handleRedo} color="primary">
                    <RedoIcon />
                </IconButton>
                <IconButton onClick={handleSaveConfirmation} color="primary">
                    <SaveIcon />
                </IconButton>
                <IconButton onClick={handleAddClick} color="primary">
                    <AddIcon />
                </IconButton>
                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <List>
                        {actions.map((action) => (
                            <ListItem key={action.name} button onClick={action.onClick}>
                                <ListItemIcon>
                                    {action.icon}
                                </ListItemIcon>
                                <ListItemText primary={action.name} />
                            </ListItem>
                        ))}
                    </List>
                </Popover>
            </Box>
            <Dialog
                open={saveDialogOpen}
                onClose={() => setSaveDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Save Workflow</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        The input node has no connections. The workflow won't work properly. Are you sure you want to save?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleSaveAndPut();
                            setSaveDialogOpen(false);
                        }}
                        color="primary"
                        autoFocus
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                {errorMessage ? (
                    <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                        {errorMessage}
                    </Alert>
                ) : (
                    <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                        Workflow saved successfully!
                    </Alert>
                )}
            </Snackbar>
        </div>
    );
}

function WorkflowWithProvider() {
    return (
        <ReactFlowProvider>
            <Workflow/>
        </ReactFlowProvider>
    );
}

export default WorkflowWithProvider;
