
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../src/pages/login';
import './index.css';
import Bill from './pages/bill';
import Logout from './pages/logout';



function Main() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/bill" element={<Bill/>}/>
          <Route path="/logout" element={<Logout/>}/>
        </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
