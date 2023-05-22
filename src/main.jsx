import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App'
//import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div style={{height:"100vh",width:"100vw"}}>
        <App />
      </div>
    </BrowserRouter>
  </StrictMode>
)
