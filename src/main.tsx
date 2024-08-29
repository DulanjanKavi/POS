
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route } from 'react-router-dom';
import Login from '../src/pages/login';
import './index.css';
import Bill from './pages/bill';
import Logout from './pages/logout';
import Report from './pages/report';
import Chasier from './pages/cashier';
import Refund from './pages/refund'
import SettingsPage from './pages/Settings';
import { Router } from 'electron-router-dom';



function Main() {
  /*return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/bill" element={<Bill/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/report" element={<Report/>}/>
          <Route path="/cashier" element={<Chasier/>}/>
          <Route path="/refund" element={<Refund/>}/>
          <Route path="/settings" element={<SettingsPage />}/>
        </Routes>
    </BrowserRouter>
  );*/

  return (
    <Router 
      main={<>
        <Route path="/" element={<Login />} />
        <Route path="/bill" element={<Bill/>}/>
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/report" element={<Report/>}/>
        <Route path="/cashier" element={<Chasier/>}/>
        <Route path="/refund" element={<Refund/>}/>
      </>}

      settings={
        <Route path="/" element={<SettingsPage />}/>
      }
    />
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
