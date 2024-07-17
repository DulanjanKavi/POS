import React, { useState,useEffect } from 'react'

function refundcomponent() {
    const [refundPayment,setDetails]=useState([])
    const getAllDetails=async()=>{
        try{
            const result=await window.REPORT_API.getAllReturnPayment();
            if(result!=null)
              {
                setDetails(result)
              } 
        }catch(error){
            console.error()
        }
      }  
      useEffect(() => {
        getAllDetails();
      }, []);





  return (
    <div className='  h-screen m-1'>
      <div className="bg-white p-1 ">
      <div className='flex justify-center items-center text-center p-1 mb-2  border-b-2 border-slate-400 text-2xl font-bold'>
    Refund Details
</div>

    <table className="table-auto w-full font-semibold">
                    <tbody>
                        <tr className="  justify-between border-b-2 border-slate-400 text-xl p-2 ">
                            
                            <td className='w-3/1 px-2 mr-20 text-right'>Return no.</td>
                            <td className='w-1/3 px-2 mx-2 text-center'>Old Bill no.</td>
                            <td className='w-1/3 px-2 mx-10 text-right'>Amount</td>
                            
                            
                            
                        </tr>
                    </tbody>
                </table>
    </div>
    <div className='max-h-[calc(100vh-50px)] text-lg   overflow-y-auto '>
    <div className="w-full text-sm">
    {refundPayment.map((item, index) => (
        <div key={index} className="flex justify-between border-b-2">
            <div className='w-1/3 mr-20 text-right'>{item.ReturnBillNumber}</div>
            <div className='w-1/3 mx-2 text-center'>{item.OldBillNumber}</div>
            <div className='w-1/3 mx-10 text-right'>{(item.total).toFixed(2)}</div>
            
        </div>
    ))}
</div>


    </div>



    </div>

    
  )
}

export default refundcomponent

