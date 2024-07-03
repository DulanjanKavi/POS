import React,{useState} from 'react'
import Menubar from '../component/menubar'
import CheckDetailComponenet from '../component/checkDetailComponenet';
import Refundcomponent from '../component/refundcomponenet';
import AllSalse from '../component/allSalse';
import CashPayment from '../component/cashPayment';
import CardPayment from '../component/cardPayment';  
import OnlinePayment from '../component/onlinePayment';

function report() {
  const zero=0
  const [cashPayment,setCashPayment]=useState(zero.toFixed(2))
  const [cardPayment,setCardPayment]=useState(zero.toFixed(2))
  const [bankPayment,setBankPayment]=useState(zero.toFixed(2))
  const [checkPayment,setCheckPayment]=useState(zero.toFixed(2))
  const [total,setTotal]=useState(zero.toFixed(2))
  const [cashierName,setCashierName]=useState('')
  const date = new Date();


  const getCashierName=async()=>{
    try{
      const result=await window.WINDOW_API.getCashierName();
      setCashierName(result)
    }catch (error){
      console.error(error)
    }
  }
  getCashierName()



  const getCashPayment=async()=>{
    try{
        const result=await window.REPORT_API.getTotalCashPayment();
        if(result!=null)
          {
            const sumValue = result['SUM(total)'];
            setCashPayment(sumValue.toFixed(2)) 
          } 
    }catch(error){
        console.error()
    }
  }  
  getCashPayment();

  const getTotal=async()=>{
    try{
        const result=await window.REPORT_API.getTotal();
        if(result!=null)
          {
            const sumValue = result['SUM(total)'];
            setTotal(sumValue.toFixed(2)) 
          } 
    }catch(error){
        console.error()
    }
  }  
  getTotal();

  const getTotalCheckPayment=async()=>{
    try{
        const result=await window.REPORT_API.getTotalCheckPayment();
        if(result!=null)
          {
            const sumValue = result['SUM(total)'];
            setCheckPayment(sumValue.toFixed(2)) 
          } 
    }catch(error){
        console.error()
    }
  }  
  getTotalCheckPayment();

  const getCardPayment=async()=>{
    try{
        const result=await window.REPORT_API.getTotalCardPayment();
        if(result!=null){
          const sumValue = result['SUM(total)'];
        setCardPayment(sumValue.toFixed(2)) 
        }
        
    }catch(error){
        console.error()
    }
  }  
  getCardPayment();

  const getBankPayment=async()=>{
    try{
        const result=await window.REPORT_API.getTotalBankPayment();
        if(result!=null)
          {
            const sumValue = result['SUM(total)'];
        setBankPayment(sumValue.toFixed(2)) 
          }
        
    }catch(error){
        console.error()
    }
  }  
  getBankPayment();




  const [showDetails, setShowDetails] = useState('all');

  const onClikeRefund = () => {
    setShowDetails('refund');
  };

  const onClickCheck = () => {
    setShowDetails('check');
  };

  const onClickTotal = () => {
    setShowDetails('all');
  };

  const onClickCash = () => {
    setShowDetails('cash');
  };

  const onClickCard = () => {
    setShowDetails('card');
  };

  const onClickOnline = () => {
    setShowDetails('online');
  };

    
    return (
        <div className='font-semibold'>
            <div className="fixed top-0 left-0 right-0   z-10">
            <div >
              <Menubar/>  
            </div>
          </div>
    
          
    
          <div className="text-lg fixed top-15 left-0 right-0 grid grid-cols-2  mt-5 p-1 h-screen-15 bg-slate-200 ">
            <div className='col-span-1  h-screen-15 w-full border-r-2 border-slate-800'>
                
            {/*<UserComponent/>*/}
            <div className='text-lg grid grid-rows-10  h-screen '>
            <div className='row-span-1 flex justify-between px-4 border-b-2 border-slate-400 items-center text-xl'>
          <p>Cashier Name:</p>
          <p>{cashierName}</p>
      </div>
      <div className=' flex justify-between px-4 py-1  border-b-2 border-slate-800 items-center text-xl'>
          <p>Salse Summary on:</p>
          <p>{date.toLocaleDateString()}</p>
      </div>




          

      <div className='row-span-1 flex justify-between px-4 py-2  border-b-2 border-slate-400 items-center'>
    <button onClick={onClickTotal} className="flex justify-between w-full">
        <div>
            <p>Total Salse</p>
        </div>
        <div>
            <p>{total}</p>
        </div>
    </button>
</div>






      {/*<div className='row-span-1 flex justify-between px-4 py-2 rounded-lg border-2 items-center'>
      <p>Opening cash balance </p>
          <p>150.00</p>
      </div>
      <div className='row-span-1 flex justify-between px-4 py-2 rounded-lg border-2 items-center'>
            <p>closing cash balance</p>
          <p>150.00</p>
      </div>
      <div className='row-span-1 flex justify-between px-4 py-2 rounded-lg border-2 items-center'>
      <p>Cash on hand</p>
    
          <p>150.00</p>
      </div>*/}
      

      <div className='row-span-1 flex justify-between px-4 py-2  border-b-2 border-slate-400 items-center'>
    <button onClick={onClickCash} className="flex justify-between w-full">
        <div>
            <p>Cash payment </p>
        </div>
        <div>
            <p>{cashPayment}</p>
        </div>
    </button>
</div>

<div className='row-span-1 flex justify-between px-4 py-2  border-b-2 border-slate-400 items-center'>
    <button onClick={onClickCard} className="flex justify-between w-full">
        <div>
            <p>Card payment </p>
        </div>
        <div>
            <p>{cardPayment}</p>
        </div>
    </button>
</div>

<div className='row-span-1 flex justify-between px-4 py-2  border-b-2 border-slate-400 items-center'>
    <button onClick={onClickOnline} className="flex justify-between w-full">
        <div>
            <p>Online payment </p>
        </div>
        <div>
            <p>{bankPayment}</p>
        </div>
    </button>
</div>



      

      <div className='row-span-1 flex justify-between px-4 py-2  border-b-2 items-center'>
    <button onClick={onClickCheck} className="flex justify-between w-full">
        <div>
            <p>Check payment</p>
        </div>
        <div>
            <p>{checkPayment}</p>
        </div>
    </button>
</div>

      <div className='row-span-1 flex justify-between px-4 py-2 border-t-2 border-slate-800 items-center'>
    <button onClick={onClikeRefund} className="flex justify-between w-full">
        <div>
            <p>Refund payment</p>
        </div>
        <div>
            <p>150.00</p>
        </div>
    </button>
</div>
 
      </div>












            </div>
            <div className='col-span-1  h-screen-15 w-full bg-white'>
           
            {showDetails=='refund' && (
              <Refundcomponent />
            )  
            }
            {showDetails=='check' && (
              <CheckDetailComponenet />
            )  
            }
            {showDetails=='all' && (
              <AllSalse />
            )  
            }
            {showDetails=='cash' && (
              <CashPayment />
            )  
            }
            {showDetails=='card' && (
              <CardPayment />
            )  
            }
            {showDetails=='online' && (
              <OnlinePayment />
            )  
            }
            
            </div>
    
    
          </div>
    
    
            
          
        </div>
      )
}

export default report
