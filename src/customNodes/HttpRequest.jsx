import React, { useState, useRef } from 'react';
import useStore from '../store';
import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import BaseNode from './BaseNode';

import {
  Node,
  NodeHeader,
  NodeContent,
} from './Styles';

import {
  Stack,
  TextField,
  FormControlLabel,
  MenuItem,
  Switch,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Alert,
  Badge,
  Box,
  Typography,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

// CONSTANTS -------------------------------------------------------------------

const methods = [
  {
      value: 'GET',
      label: 'GET',
  },
  {
      value: 'POST',
      label: 'POST',
  },
  {
      value: 'PUT',
      label: 'PUT',
  },
  {
      value: 'DELETE',
      label: 'DELETE',
  }
];

const contentTypes = [
  {
      value: 'text/plain',
      label: 'text/plain',
  },
  {
      value: 'text/html',
      label: 'text/html',
  },
  {
      value: 'application/json',
      label: 'application/json',
  },
  {
      value: 'application/xml',
      label: 'application/xml',
  },
  {
      value: 'application/x-www-form-urlencoded',
      label: 'application/x-www-form-urlencoded',
  }
];

const parserTypes = [
  {
      value: 'AUTO',
      label: 'AUTO',
  },
  {
      value: 'JSON',
      label: 'JSON',
  },
  {
      value: 'XML',
      label: 'XML',
  },
  {
      value: 'TEXT',
      label: 'TEXT',
  },
  {
      value: 'HTML',
      label: 'HTML',
  }
];

const name = 'HttpRequest';
const label = 'Http Request';

const inputs = ["IN"]
const outputs = ["OK", "FAILED"]

export const defaults = {
  label: label,
  method: 'GET',
  cached: false,
  contentType: '',
  headers: [],
  parserType: 'AUTO',
}

// CONSTUCTORS -----------------------------------------------------------------

export const asReactFlowNode = (id, data = defaults) => ({
  id,
  type: name,
  position: { x: Math.random() * window.innerWidth - 100, y: Math.random() * window.innerHeight },
  data: {...data, id: id},
})

// COMPONENTS ------------------------------------------------------------------

function HttpRequest ({ type, data, isConnectable, selected, xPos, yPos }) {
  const theme = useTheme();

  const updateNodeData = useStore((state) => state.updateNodeData);
  const updateNodeSelect = useStore((state) => state.updateNodeSelect);

  const [cached, setCached] = useState(data.cached);

  const [method, setMethod] = useState(data.method);

  const [contentType, setContentType] = useState(data.contentType);

  const [tempHeaders, setTempHeaders] = useState(data.headers || []);
  const [headers, setHeaders] = useState(data.headers || []);
  const [headerError, setHeaderError] = useState(null);

  const handleHeadersSave = () => {
    const isValid = tempHeaders.every(
      (h) => h.key.trim() !== '' && h.value.trim() !== ''
    );

    if (isValid) {
      setHeaderError(null);
      setHeaders(tempHeaders);
      const updatedData = { ...data, headers: tempHeaders };
      updateNodeData(data.id, updatedData);
      handleHeadersClose();
    } else {
      setHeaderError("Both key and value are required for all headers.");
    }
  };

  const handleChangeMethod = (event) => {
    setMethod(event.target.value);
    let updatedData = { ...data, method: event.target.value };

    if (event.target.value !== 'GET') {
      setCached(false);
      updatedData = { ...updatedData, cached: false };
    } else {
      setContentType('');
      setBodyText('');
      setDialogBodyText('');
      updatedData = { ...updatedData, contentType: '', body: '' };
    }
    
    updateNodeData(data.id, updatedData);
  };

  const handleChangeContentType = (event) => {
    setContentType(event.target.value);
    let updatedData = { ...data, contentType: event.target.value };
    
    updateNodeData(data.id, updatedData);
  };

  const [parserType, setParserType] = useState(data.parserType);

  const handleChangeParseType = (event) => {
    setParserType(event.target.value);
    const updatedData = { ...data, parserType: event.target.value };
    updateNodeData(data.id, updatedData);
  };

  const [open, setOpen] = useState(false);
  const [headersOpen, setHeadersOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleHeadersOpen = () => {
    setTempHeaders([...headers]);
    setHeadersOpen(true);
  };
  
  const handleHeadersClose = () => {
    setHeadersOpen(false);
  };  

  const handleSave = () => {
    // Update the bodyText state with the value from the dialog form
    const editorValue = editorRef.current.getValue();
    setBodyText(editorValue);
    setDialogBodyText(editorValue);

    // Update the node data
    const updatedData = { ...data, body: editorValue };
    updateNodeData(data.id, updatedData);
  
    // Close the modal window
    handleClose();
  };  
  
  const [bodyText, setBodyText] = useState(data.body);
  const [dialogBodyText, setDialogBodyText] = useState(data.body);

  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function checkLanguage(contentType) {
    switch (contentType) {
      case 'application/json':
        return 'json';
      case 'text/javascript':
      case 'application/javascript':
        return 'javascript';
      case 'text/css':
        return 'css';
      case 'application/xml':
      case 'text/xml':
        return 'xml';
      case 'text/html':
        return 'html';
      // Add more cases for other content types as needed
      default:
        return 'plaintext'; // Fallback to plain text if the content type is not recognized
    }
  };

  return (
    <BaseNode type={type} data={data} xPos={xPos} yPos={yPos} inputs={inputs} outputs={outputs}>
      <Node selected={selected} widht={400}>
        <NodeHeader>{data.label}</NodeHeader>
        <NodeContent>
          <Stack spacing={0}>
            <TextField
              required
              id="path"
              label="URL"
              defaultValue={data.path}
              variant="outlined"
              multiline
              className="nodrag"
              maxRows={8}
              size="small"
              margin="dense"
              onChange={(event) => {
                const { id, value } = event.target;
                const updatedData = { ...data, [id]: value };
                updateNodeData(data.id, updatedData);
              }}
              onMouseDown={() => {
                if (!selected)
                updateNodeSelect(data.id);
              }}
              />
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <TextField
                id="method"
                select
                label="Method"
                value={method}
                onMouseDown={() => {
                  if (!selected)
                  updateNodeSelect(data.id);
                }}
                onChange={handleChangeMethod}
                className="nodrag"
                size="small"
                margin="dense"
                sx={{ width: '33%' }}
                >
                  {methods.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                          {option.label}
                      </MenuItem>
                  ))}
              </TextField>
              <TextField
                id="contentType"
                select
                label="Content Type"
                value={contentType}
                onMouseDown={() => {
                  if (!selected)
                  updateNodeSelect(data.id);
                }}
                onChange={handleChangeContentType}
                className="nodrag"
                size="small"
                margin="dense"
                sx={{ width: '66%' }}
                disabled={method==='GET'}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {contentTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                          {option.label}
                      </MenuItem>
                  ))}
              </TextField>
            </Stack>
            <Stack direction="row" alignItems="center">
              <TextField
                id="body"
                label="Body"
                placeholder="Placeholder"
                multiline
                maxRows={8}
                value={bodyText}
                className="nodrag"
                onChange={(event) => {
                  const { id, value } = event.target;
                  setBodyText(value);
                  setDialogBodyText(value);
                  const updatedData = { ...data, [id]: value };
                  updateNodeData(data.id, updatedData);
                }}
                onMouseDown={() => {
                  if (!selected)
                  updateNodeSelect(data.id);
                }}
                disabled={method==='GET'}
                sx={{ flexGrow: 1 }}
                size="small"
                margin="dense"
              />
              <IconButton color="primary" aria-label="edit body" component="span" onClick={handleClickOpen} disabled={method==='GET'}>
                <EditIcon />
              </IconButton>
              <Box display="flex" alignItems="center">
              <Typography variant="body2">
                Headers
              </Typography>
                <IconButton color="primary" aria-label="edit headers" component="span" onClick={handleHeadersOpen}>
                  <Badge
                    badgeContent={headers.length}
                    color="secondary"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    max={999}
                  >
                    <ListIcon />
                  </Badge>
                </IconButton>
              </Box>
            </Stack>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
              <DialogTitle>Edit Body</DialogTitle>
              <DialogContent
                sx={{
                  minWidth: '600px',
                  width: '100%',
                  height: '500px',
                  position: 'relative',
                }}>
                  <Editor
                    value={dialogBodyText}
                    language={checkLanguage(contentType)}
                    theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                    height="100%"
                    width="100%"
                    options={{
                      minimap: { enabled: false },
                      automaticLayout: true,
                    }}
                    onMount={handleEditorDidMount}
                  />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={headersOpen} onClose={handleHeadersClose} sx={{ width: '100%', maxWidth: 'none' }}>
              <DialogTitle>Edit Headers</DialogTitle>
              <DialogContent sx={{ minWidth: '500px' }}>
                {tempHeaders.map((header, index) => (
                  <Stack key={index} direction="row" alignItems="center" spacing={1}>
                    <TextField
                      required
                      id={`header-key-${index}`}
                      label="Key"
                      value={header.key}
                      onChange={(event) => {
                        const newTempHeaders = [...tempHeaders];
                        newTempHeaders[index].key = event.target.value;
                        setTempHeaders(newTempHeaders);
                      }}
                      size="small"
                      margin="dense"
                    />
                    <TextField
                      required
                      id={`header-value-${index}`}
                      label="Value"
                      value={header.value}
                      onChange={(event) => {
                        const newTempHeaders = [...tempHeaders];
                        newTempHeaders[index].value = event.target.value;
                        setTempHeaders(newTempHeaders);
                      }}
                      size="small"
                      margin="dense"
                    />
                    <IconButton
                      color="error"
                      aria-label="delete header"
                      onClick={() => {
                        const newTempHeaders = tempHeaders.filter((_, i) => i !== index);
                        setTempHeaders(newTempHeaders);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                ))}
                <IconButton sx={{ marginTop: 2}}
                  color="primary"
                  aria-label="add header"
                  onClick={() => {
                    setTempHeaders([...tempHeaders, { key: '', value: '' }]);
                  }}
                >
                  <AddIcon />
                </IconButton>
              </DialogContent>
              {headerError && (
                <Alert severity="error" onClose={() => setHeaderError(null)}>
                  {headerError}
                </Alert>
              )}
              <DialogActions>
                <Button onClick={handleHeadersClose}>Cancel</Button>
                <Button type="submit" variant="contained" onClick={handleHeadersSave}>Save</Button>
              </DialogActions>
            </Dialog>
            <Stack direction="row" alignItems="baseline" spacing={2}>
              <TextField
                  id="outlined-select-parse"
                  select
                  label="Parse Response"
                  value={parserType}
                  onMouseDown={() => {
                    if (!selected)
                    updateNodeSelect(data.id);
                  }}
                  onChange={handleChangeParseType}
                  className="nodrag"
                  size="small"
                  margin="dense"
                  sx={{ flexGrow: 2 }}
                  >
                    {parserTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
              </TextField>
              <FormControlLabel control={
                <Switch
                  checked={cached}
                  onChange={(event) => {
                    setCached(event.target.checked);
                    const updatedData = { ...data, cached: event.target.checked };
                    updateNodeData(data.id, updatedData);
                  }}
                  disabled={method!=='GET'}
                  size="small"
                />
              } label="Cached" sx={{ marginTop: 0, marginBottom: 0, flexGrow: 1 }}/>
            </Stack>
          </Stack>
        </NodeContent>
      </Node>
    </BaseNode>
  );
};

export default HttpRequest;
