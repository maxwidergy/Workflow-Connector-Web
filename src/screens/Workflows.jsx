import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress,
  IconButton,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useQuery, useQueryClient } from '@tanstack/react-query';

async function fetchWorkflows() {
    const response = await fetch('https://localhost:5001/api/v1/workflows');
    if (!response.ok) {
        throw new Error('Error fetching workflows');
    }
    return await response.json();
}


function Workflows() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEdit = (id) => {
        navigate(`/Workflows/${id}`);
    };

    const handleAdd = () => {
        navigate('/Workflows/create');
    };

    const queryClient = useQueryClient();

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`https://localhost:5001/api/v1/workflows/${id}`, {
                method: 'DELETE',
            });
      
            if (!response.ok) {
            throw new Error('Error deleting workflow');
            }
      
            // Invalidate the workflows query to refetch the data and update the UI
            queryClient.invalidateQueries(['workflows']);
        } catch (error) {
            console.error('Error deleting workflow:', error);
        }
    };

    // Fetch your workflows data here
    const { isLoading, isError, data: workflows } = useQuery(['workflows'], fetchWorkflows);

    if (isLoading) return (
        <Box sx={{ display: 'flex' }}>
            <CircularProgress />
        </Box>
    );
  
    if (isError) {
        return <div>Error fetching workflows.</div>;
    }

    return (
        <Paper>
            <Box display="flex" justifyContent="flex-end" p={1}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleAdd}
            >
                Add
            </Button>
            </Box>
            <TableContainer>
                <Table stickyHeader>
                <TableHead>
                    <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Request Path</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {workflows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((workflow) => (
                        <TableRow key={workflow.id}>
                        <TableCell>{workflow.id}</TableCell>
                        <TableCell>{workflow.method}</TableCell>
                        <TableCell>{workflow.requestPath}</TableCell>
                        <TableCell>{workflow.workflowType}</TableCell>
                        <TableCell>{workflow.clientName}</TableCell>
                        <TableCell>
                            <IconButton color="primary" onClick={() => handleEdit(workflow.id)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(workflow.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={workflows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}

export default Workflows;
