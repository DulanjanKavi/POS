import React, { useState,useEffect } from 'react'

const onlinePayment = () => {
    const [Details,setDetails]=useState([])

    const getAllDetails=async()=>{
        try{
            const result=await window.REPORT_API.getAllBankPayment();
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
        <div className='border-l-2 border-black h-screen m-1'>
          <div className="bg-white p-1 rounded-lg">
          <div className='flex justify-center items-center text-center p-1 mb-2  border-b-2 text-2xl'>
        Online Payment
    </div>
    
        <div className=''>
        <table className="table-auto w-full">
                        <tbody>
                            <tr className="  justify-between border-b-2 text-xl p-2 ">
                                
                                <td className='w-1/3   '>Bill no.</td>
                                <td className='w-1/3  text-left'>Transection no.</td>
                                <td className='w-1/3  text-right'>Amount</td>
                            </tr>
                        </tbody>
                    </table>
        </div>
        </div>
        <div className='max-h-[70vh] text-lg   overflow-y-auto '>
        <div className="w-full">
  {Details.map((item, index) => (
    <div key={index} className="flex justify-between border-b-2">
      <div className='w-1/3 mx-2'>{Details[index].biiNumber}</div>
      <div className='w-1/3 text-left'>{(Details[index].aditionalDetails)}</div>
      <div className='w-1/3 text-right'>{(Details[index].total).toFixed(2)}</div>
    </div>
  ))}
</div>


    </div>
    
    
    
    
        </div>
    
        
      )
}

export default onlinePayment
