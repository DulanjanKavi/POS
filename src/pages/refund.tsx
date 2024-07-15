
import React, { useState, useEffect } from 'react';
import Menubar from '../component/menubar'
import deleteIcon from '../assets/icons/delete.png'
import ferifyIcon from '../assets/icons/veryfyIcon.png'
import addIcon from '../assets/icons/addIcon.png'
import payIcon from '../assets/icons/payIcon.png'



function refund() {


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
    const [refundcart,setRefundCard]=useState([])
    const [itemName,setItemName]=useState('')
    const [total,setTotal]=useState(0)
    const [errorInPay,setErrorInPay]=useState('')

    useEffect(() => {
      if (refundcart!=[])
      {
        const totalAmount = refundcart.map(item => item.amount*item.quantity).reduce((acc, amount) => acc + amount, 0);
        console.log(totalAmount); 
        setTotal(totalAmount)
      }
  }, [refundcart]);


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
        //update database
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
          const newItem = {
              snumber: barcode,
              name: itemName,
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
      if (!Number.isInteger(quantityOfItem) || quantityOfItem<=0) {
          setErrorInWrongQuntity("Quantity value is wrong. Enter a positive integer value.");
          console.log("error verify quantity");
          return false;
          
      }
      setErrorInWrongQuntity("")
      return true;

  };
  
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
              setErrorInWrongBarCode("")
              return true
          }
      } catch (error) {
          console.error(error);
          

          setErrorInWrongBarCode("Error occurred in barcode verification process.");
          return false;
      }
  };
  
  const verifyAmoun = async () => {
      if (amount <= 0) {
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
                  setQuantityOfItem(parseFloat(e.target.value))
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
                  setAmmount(parseFloat(e.target.value))
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
                Total: {(total).toFixed(2)}
            </div>
          
        </div>

        </div>
        <div className='col-span-1  h-screen w-full'>
        </div>
        
      </div>
    </div>
  )
}

export default refund
