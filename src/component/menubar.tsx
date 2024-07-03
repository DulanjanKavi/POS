import React from 'react';
import { useNavigate } from 'react-router-dom';

function Menubar() {
  const navigate = useNavigate(); 

  const handleCachier = () => {
    navigate('/cashier'); 
  };

  const handleBill=()=>{
    navigate('/bill')
  }
  
  const handleReport=()=>{
    navigate('/report')
  }

  return (
    <div className="bg-gray-800 text-white fixed top-0 left-0 w-full ">
      <button
        className="px-2 py-1 rounded-md text-xs"
        onClick={handleBill}
      >
        Bill Section
      </button>
      <button
        className="px-2 py-1 rounded-md text-xs"
        onClick={handleReport}
      >
        Daily Report
      </button>
      <button
        className="px-2 py-1 rounded-md text-xs"
        onClick={handleCachier}
      >
        Cashier
      </button>
      
    </div>
  );
}

export default Menubar; // Corrected the component name

