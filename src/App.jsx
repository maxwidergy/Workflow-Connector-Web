import { Routes, Route } from "react-router-dom";
import * as React from 'react';
import Dashboard from "./screens/Dashboard";
import Workflows from "./screens/Workflows";
import Workflow from "./screens/Workflow";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateWorkflow from "./screens/CreateWorkflow";
import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

const queryClient = new QueryClient();

export default function App() {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      background: {
        default: prefersDarkMode ? '#303030' : '#fafafa',
        paper: prefersDarkMode ? '#424242' : '#fff'
      }
    },
  }), [prefersDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/create" element={<CreateWorkflow />} />
          <Route path="/workflows/:workflowId" element={<Workflow />} />
        </Route>
      </Routes>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
