import React, { useState,useEffect } from 'react'





function checkDetailComponenet() {
    const [checkDetails,setCheckDetails]=useState([])

    const getCheckDetails=async()=>{
        try{
            const result=await window.REPORT_API.getCheckDetails();
            if(result!=null)
              {
                setCheckDetails(result)
              } 
        }catch(error){
            console.error()
        }
      }  
      useEffect(() => {
        getCheckDetails();
      }, []);



    return (
        <div className=' h-screen m-1'>
          <div className="bg-white p-1">
          <div className='flex justify-center items-center text-center p-1 m-1 border-slate-400 font-bold border-b-2 text-2xl'>
        Cheque Payment
    </div>
    
        <div className=''>
        <table className="table-auto w-full font-semibold">
                        <tbody>
                            <tr className="justify-between border-b-2 border-slate-400 text-xl p-2 font-semibold">
                                <td className='w-3/12   '>Bill no.</td>
                                <td className='w-6/12  text-left'>Cheque no.</td>
                                <td className='w-3/12  text-right '>Amount</td>
                            
                                
                                
                                
                            </tr>
                        </tbody>
                    </table>
        </div>
        </div>
        <div className='max-h-[calc(100vh-50px)] text-lg   overflow-y-auto '>
        <div className="w-full text-sm">
  {checkDetails.map((item, index) => (
    <div key={index} className="flex justify-between   border-b-2">
      <div className='w-3/12 mx-2 text-left'>{checkDetails[index].biiNumber}</div>
      <div className='w-6/12 text-left overflow-hidden ' title={checkDetails[index].aditionalDetails}>
  {checkDetails[index].aditionalDetails}
</div>

      <div className='w-3/12 text-right mx-3'>{(checkDetails[index].total).toFixed(2)}</div>
    </div>
  ))}
</div>

    </div>
    
    
    
    
        </div>
    
        
      )
}

export default checkDetailComponenet
