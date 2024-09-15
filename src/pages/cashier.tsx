import {useEffect,useState} from 'react'
import Menubar from '../component/menubar'
import cashierIcon from '../assets/icons/user.png'
import logOutIcon1 from '../assets/icons/logOut.png'
import { useNavigate } from 'react-router-dom';

function Cashier() {
  const [cashierID, setCashierID] = useState('');
  const [isVisibleLogOut,setIsVisibleLogOut]=useState(false)

  async function getCashierID() {
    try {
      console.log('Getting cashier name...');
      const ID = await window.WINDOW_API.getCashierID();
      setCashierID(ID);
    } catch (error) {
      console.error('Error fetching cashier name:', error);
    }
  }

  const [cashierName, setCashierName] = useState('');

  async function fetchCashierName() {
    try {
      console.log("get cashier name")
      const name = await window.WINDOW_API.getCashierName();
      setCashierName(name)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getCashierID();
    fetchCashierName();
  }, []);

  const handleLogOut=()=>{
    setIsVisibleLogOut(true)
  }

  const navigate=useNavigate();

  const handleConfirm=()=>{
    navigate('/')
  }

  const handleCancel=()=>{
    setIsVisibleLogOut(false)
  }

  



  return (
    <div>
      {isVisibleLogOut && (
        <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 mt-6 z-50">
        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
      
          
          <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Confirm The Log Out</p>
                          </div>
          
          <div className="flex items-center justify-center">
          <button onClick={handleCancel} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
            Cancel
          </button>
          <button onClick={handleConfirm} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
            Log Out
          </button>
          </div>
          
        </div>
      </dialog>
      )}




        <div className="fixed top-0 left-0 right-0   z-10 font-semibold">
            <div >
              <Menubar/>  
            </div>
          </div>
          <div className="text-lg fixed top-15 left-0 right-0 grid grid-cols-2  mt-5 p-1 h-screen-15 bg-slate-200 ">
          <div className='col-span-1  h-screen w-full border-r-2 border-slate-800 overflow-auto'>
            <div className='grid grid-rows-2 h-screen'>
              <div className='row-span-1 border-b-2  h-full w-full items-center justify-center flex border-slate-400'>
                  
                    <div className='items-center p-5 border-2 border-slate-300 rounded-md'>
                    <img src={cashierIcon} className="w-32 h-32 " alt="Cashier icon" />
                    </div>
              </div>
              <div className='row-span-1 border-2 h-full w-full overflow-auto '>
              <div className=' p-4 border-b-2  items-center text-xl font-bold'>
          <p>Cashier Name:</p>
          <p className='font-semibold'>{cashierName}</p>
      </div>

      <div className=' p-4 border-b-2  items-center text-xl font-bold'>
          <p>Cashier ID:</p>
          <p className='font-semibold'>{cashierID}</p>
      </div>
              </div>

            </div>






          </div>






          <div className='col-span-1  h-screen   border-r-2'>

            <div className='fixed bottom-0 w-1/2 text-white bg-slate-800 flex  justify-center '>
              <button onClick={handleLogOut}className=' m-2  border-2 border-white rounded p-1 hover:text-black hover:bg-white'>
                  <div className='flex items-center justify-center mx-1 px-2'>
                  <div className='mr-3'>
                  <img src={logOutIcon1} className="w-6 h-6 bg-white p-1  rounded" alt="LogOut icon" />
                  </div>
                    <div className='text-lg font-bold '>Log Out</div>
                    
                  </div>
              </button>
            </div>
          </div>
            
    
    
          </div>
    </div>
  )
}

export default Cashier
