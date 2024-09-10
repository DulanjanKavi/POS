/* eslint-disable @typescript-eslint/no-explicit-any */

import  { useState, useEffect } from 'react';
import Menubar from '../component/menubar'
import deleteIcon from '../assets/icons/delete.png'
import ferifyIcon from '../assets/icons/veryfyIcon.png'
import addIcon from '../assets/icons/addIcon.png'
import payIcon from '../assets/icons/payIcon.png'




function Refund() {


    const [billNumber,setBillNumber]=useState("");
    const [messageOnBillverify,setmessageOnBillVerify]=useState("")
    const [maxtotal,setMaxTotal]=useState(0)
    const [barcode,setbarcode]=useState("")
    const [errorInWrongbarcode,setErrorInWrongBarCode]=useState("")
    const [quantityOfItem,setQuantityOfItem]=useState("")
    const [errorInWrongQuantity,setErrorInWrongQuntity]=useState("")
    const [amount,setAmmount]=useState("")
    const [errorInWrongAmount,setErrorInWrongAmount]=useState("")
    const [reason,setReason]=useState("")
    const [refundcart,setRefundCard]=useState<any>([])
    const [itemName,setItemName]=useState('')
    const [total,setTotal]=useState(0)
    const [errorInPay,setErrorInPay]=useState('')
    const [dateState, setDateState] = useState(new Date());
    

    useEffect(() => {
      
        const totalAmount = refundcart.map((item: { amount: any; }) => item.amount).reduce((acc:any, amount:any) => acc + amount, 0);
        console.log(totalAmount); 
        setTotal(totalAmount)
      
  }, [refundcart]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Update the date state every minute
      setDateState(new Date());
    }, 60 * 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, []);

  const formattedDate = dateState.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = dateState.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const [cashierID, setCashierID] = useState('');

async function getCashierID() {
  try {
    console.log('Getting cashier name...');
    const ID = await window.WINDOW_API.getCashierID();
    setCashierID(ID);
  } catch (error) {
    console.error('Error fetching cashier name:', error);
  }
}

useEffect(() => {
  getCashierID();
}, []);

const addReturnBillDataisToDatabase=(OldBillNumber: string,total: number,cart: never[])=>{
  try {
    console.log(cart)
    window.BILL_API.returnBill(OldBillNumber,total,cart);
  
    
 } catch (error) {
   console.error(error);
 }
}

  
  

    const handlePay=()=>{
      if(maxtotal==0){
        setErrorInPay("Verify bill number")
      }
      else if(maxtotal<total){
        setErrorInPay("Refund amount can not be more than bill amount.")
      }
      else if(total==0){
        setErrorInPay("Refund cart is empty.")
      }
      else{
        console.log("refund sucsess")
        //OldBillNumber,total,cashierID,cart
        addReturnBillDataisToDatabase(billNumber,total,refundcart)
        cancelPay()
      }
    }

    const cancelPay=()=>{
      handleCancelBillNumber()
      handleCancelItem()
      setErrorInPay('')
      setRefundCard([])
      setTotal(0.00)
    }
    
    
    const handleCancelBillNumber=()=>{
      setBillNumber('')
      setmessageOnBillVerify('')
      setMaxTotal(0)
    }

    const handleCancelItem=()=>{
      setErrorInWrongBarCode('')
      setErrorInWrongQuntity('')
      setErrorInWrongAmount('')
      setErrorInWrongAmount('')
      setbarcode("")
      setQuantityOfItem("");
      setAmmount("")
      setReason('')
      
    }



    const verifyBillNumber=async()=>{
      try{
        const result=await window.BILL_API.verifyBillNumber(billNumber);
        console.log(result)
        if(result===null){
          setmessageOnBillVerify("Bill number is wrong.")
        }
        else{
          setmessageOnBillVerify("verified bill number.")
          setMaxTotal(result.total)
          setErrorInPay("")
        }
      }catch (error){
        console.error(error)
        setmessageOnBillVerify("error happen in bill number verification process.")
      }
    } 



    const handleAddBillDetails = async () => {
      const c1=await verifyBarcode();
      const c2=await verifyQuantity();
      const c3=await verifyAmoun();

      
      console.log("ok");
  
      if (c1 && c2 && c3) {
        console.log(c1)
          const newItem = {
              snumber: barcode,
              name: c1,
              quantity: quantityOfItem,
              amount: amount,
              reason: reason,
          };
  
          
          setRefundCard([...refundcart, newItem]);
          setbarcode("");
          setQuantityOfItem("");
          setAmmount("");
          setReason('');
          handleCancelItem();
          console.log("add item");
          setErrorInPay("")
          
      }
  };
  
  const verifyQuantity = async () => {
    const quantity = parseInt(quantityOfItem, 10);
    
      if ((!Number.isInteger(quantity)) || Number(quantity)<=0) {
          setErrorInWrongQuntity("Quantity value is wrong. Enter a positive integer value.");
          console.log("error verify quantity");
          return false;
          
      }
      setErrorInWrongQuntity("")
      return true;

  };

  const deletItem=(deleteIndex: any)=>{
    const updateCart=refundcart.filter((_item: any,index: any)=>index !==deleteIndex);
    setRefundCard(updateCart)
  }
  
  const verifyBarcode = async () => {
      try {
          const result = await window.Item_API.verifyItem(barcode);
          console.log(result);
          if (result === null) {
              setErrorInWrongBarCode("Barcode is wrong.");
        
              console.log("error bar code");
              return false;

          } else {
              console.log(result.name);
              setItemName(result.name);
              console.log(itemName)
              setErrorInWrongBarCode("")
              return result.name
          }
      } catch (error) {
          console.error(error);
          

          setErrorInWrongBarCode("Error occurred in barcode verification process.");
          return false;
      }
  };
  
  const verifyAmoun = async () => {
      if (Number(amount) <= 0) {
          setErrorInWrongAmount('Amount cannot be less than or equal to 0.00');
          console.log("Error on set amount");
          return false;
      }
      setErrorInWrongAmount("")
      return true;
  };
  

    

  return (
    <div>
      
      <div >
      <Menubar/>
      </div>
      <div className="text-lg fixed top-15 left-0 right-0 grid grid-cols-2  mt-5  h-screen-15 bg-slate-200 ">
      <div className='col-span-1  h-screen w-full border-r-2 border-slate-800'>
        <div className=' border-black border-2 m-1 '>
            <div className='text-base font-semibold flex'>
                <div className='m-1'> Bill number :</div>
                <input className='m-1 ml-14 rounded border-2 border-slate-400  focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                type="number"
                min={0}
                value={billNumber}
                onChange={(e)=>{
                  setBillNumber(e.target.value)
                }}>
                </input>
            </div>
            <div className='flex'>
            <div className='w-1/2 text-center flex'>
              <button onClick={verifyBillNumber} className="w-full bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-1 text-base rounded  px-2 m-1 flex items-center justify-center group">
                <img src={ferifyIcon} className="w-6 h-6 mr-2 p-1 group-hover:bg-slate-100 rounded" alt="Search" />
                  Verify bill number
              </button>
            </div>

            <div className='w-1/2 text-center flex justify-center'>
              <button onClick={handleCancelBillNumber} className="w-full bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-1 text-base rounded m-1 px-2 flex items-center justify-center group">
                <img src={deleteIcon} className="w-6 h-6 mr-2 p-1 group-hover:bg-slate-100 rounded" alt="Search" />
                  Cancel
              </button>
            </div>

            </div>

            <div className='h-5 text-center text-sm'> 
              {messageOnBillverify}
            </div>
            
            

        </div>

        <div className=' border-black border-2 m-1 '>
        <div className='text-base font-semibold flex'>
                <div className='m-1'> Barcode :</div>
                <input className='m-1 ml-20 rounded border-2 border-slate-400  focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                type="text"
                value={barcode}
                onChange={(e)=>{
                  setbarcode(e.target.value)
                }}>
                </input>
            </div>
            <div className='text-center text-red-600 text-sm'>
            {errorInWrongbarcode}
            </div>
            <div className='text-base font-semibold flex'>
                <div className='m-1 mr-10'> Quantity :</div>
                <input className='m-1 ml-10 rounded border-2 border-slate-400  focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                type="number"
                min={1}
                value={quantityOfItem}
                onChange={(e)=>{
                  setQuantityOfItem(e.target.value)
                }}>
                </input>
            </div>
            <div className='text-center text-red-600 text-sm'>
            {errorInWrongQuantity}
            </div>
            <div className='text-base font-semibold flex '>
                <div className='m-1'> Amount :</div>
                <input className='m-1 ml-20  rounded border-2 border-slate-400  focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                type="number"
                step="0.01"
                min={0}
                value={amount}
                onChange={(e)=>{
                  setAmmount(e.target.value)
                }}>
                </input>
            </div>
            <div className='text-center text-red-600 text-sm'>
            {errorInWrongAmount}
            </div>
            <div className='text-base font-semibold flex'>
                <div className='m-1'> Reson to refund :</div>
                <input className='m-1 ml-6 rounded border-2 border-slate-400  focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                type="text"
                
                value={reason}
                onChange={(e)=>{
                  setReason(e.target.value)
                }}>
                </input>
            </div>
            

            <div className='flex'>
            <div className='w-1/2 text-center flex justify-center'>
              <button onClick={handleAddBillDetails} className="w-full bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-1 text-base rounded m-1 px-2 flex items-center justify-center group">
                <img src={addIcon} className="w-6 h-6 mr-2 p-1 group-hover:bg-slate-100 rounded" alt="Search" />
                  Add
              </button>
            </div>

            <div className='w-1/2 text-center flex justify-center'>
              <button onClick={handleCancelItem} className="w-full bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-1 text-base rounded m-1 px-2 flex items-center justify-center group">
                <img src={deleteIcon} className="w-6 h-6 mr-2 p-1 group-hover:bg-slate-100 rounded" alt="Search" />
                  Cancel
              </button>
            </div>
            </div>


        </div>

        <div className='fixed bottom-0  w-1/2'>
        <div className='text-center text-red-600 text-sm'>
            {errorInPay}
            </div>

        <div className='flex'>
            <div className='w-1/2 text-center flex justify-center'>
              <button onClick={handlePay} className="w-full bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-1 text-base rounded m-1 px-2 flex items-center justify-center group">
                <img src={payIcon} className="w-6 h-6 mr-2 p-1 group-hover:bg-slate-100 rounded" alt="Search" />
                  Pay
              </button>
            </div>

            <div className='w-1/2 text-center flex justify-center'>
              <button onClick={cancelPay} className="w-full bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-1 text-base rounded m-1 px-2 flex items-center justify-center group">
                <img src={deleteIcon} className="w-6 h-6 mr-2 p-1 group-hover:bg-slate-100 rounded" alt="Search" />
                  Cancel
              </button>
            </div>
            </div>
        <div className="text-center text-xl font-bold py-2 bg-slate-800 text-white">
                Total: {Number(total).toFixed(2)}
            </div>
          
        </div>

        </div>
        <div className='col-span-1  h-screen w-full'>
        <div className=" text-center font-bold m-1 p-1  flex item-center justify-center">
        <div>Return Bill Area</div>
    </div>
        <div className='border-b-2 border-slate-400 '>
          <table className="w-full mx-4 h-20 pb-1">
                    <tr>
                        <td className="py-1"><strong>Date:</strong> {formattedDate}</td>
                        <td className="py-1"><strong>Cashier ID:</strong> {cashierID}</td>
                    </tr>
                    <tr>
                        <td className="py-1"><strong>Time:</strong> {formattedTime}</td>
                        <td className="py-1"><strong>Return No:</strong> 123234</td>
                    </tr>
                    
                </table>
      </div>
        <div className=' max-h-[calc(100vh-150px)] overflow-auto  p-2 w-full'>
            {refundcart.map((item:any, index:any) => {
        


              return (
                <div key={index} >
                <table className="table-auto w-full ">
                    <tbody className=' border-b-2 text-sm  border-slate-400'>
                        <tr className="flex w-full justify-between">
                            <td className='w-4/10  '>{index+1}. {item.name}</td>
                            <td className='w-3/10 mr-4 '>{item.snumber}</td>
                            
                            
                             <td className='w-4/10 '>
                            
                           
                            <button onClick={()=>deletItem(index)} className=" p-1 mx-1 border-2 border-slate-400 hover:bg-slate-400 transition duration-150 "><img className="h-4 w-4 " src={deleteIcon} alt="Delete" /></button>
                            </td>
                        </tr>
                        <tr className="flex w-full justify-between ">
                            <td className='w-1/4  text-right '>{Number(item.amount).toFixed(2)}</td>
                            
                            <td className='w-1/4 text-right '>{item.quantity}</td>
                            <td className='w-2/4 text-right '> </td>
                            
                        </tr>
                    </tbody>
                </table>
                
            </div>
                
              );
             })}
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default Refund
