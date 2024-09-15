import { useNavigate } from 'react-router-dom';
import Menubar from '../component/menubar';


function Logout() {
  const navigate=useNavigate();

  const handleConfirm=()=>{
    navigate('/')
  }

  const handleCancel=()=>{
    navigate('/bill')
  }

  return (
    <div>
      <div >
      <Menubar/>
      </div>
        <div className='mt-5'>
        <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 mt-6">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black">
                      
                          <p className='text-3xl'>Confirm The Log Out.</p>
                          
                          
                          <div className="flex items-center justify-center">
                          <button onClick={handleCancel} className="bg-blue-500 text-white p-2  rounded m-2">
                            Cancel
                          </button>
                          <button onClick={handleConfirm} className="bg-red-500 text-white p-2  rounded m-2">
                            Log Out
                          </button>
                          </div>
                          
                        </div>
                      </dialog>
        </div>
      
    </div>
  )
}

export default Logout
