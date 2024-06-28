import React from 'react';
import { useNavigate } from 'react-router-dom';

function Menubar() {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    navigate('/logout'); 
  };

  return (
    <div className="bg-gray-800 text-white fixed top-0 left-0 w-full">
      <button
        className="px-2 py-1 rounded-md text-xs"
        onClick={handleLogout}
      >
        Log Out
      </button>
      
    </div>
  );
}

export default Menubar; // Corrected the component name

