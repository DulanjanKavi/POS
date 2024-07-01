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
        <div className='border-l-2 border-black h-screen m-1'>
          <div className="bg-white p-1 rounded-lg">
          <div className='flex justify-center items-center text-center p-1 mb-2  border-b-2 text-2xl'>
        Check Payment
    </div>
    
        <div className=''>
        <table className="table-auto w-full">
                        <tbody>
                            <tr className="flex  justify-between border-b-2 text-xl p-2 ">
                                <td className='w-1/3   '>Bill no.</td>
                                <td className='w-1/3  text-left'>Check no.</td>
                                <td className='w-1/3  text-right '>Amount</td>
                            
                                
                                
                                
                            </tr>
                        </tbody>
                    </table>
        </div>
        </div>
        <div className='max-h-[70vh] text-lg p-2 m-2  overflow-y-auto '>
        <div className="w-full">
  {checkDetails.map((item, index) => (
    <div key={index} className="flex justify-between   border-b-2">
      <div className='w-1/3 mx-2'>{checkDetails[index].biiNumber}</div>
      <div className='w-1/3 text-left overflow-hidden ' title={checkDetails[index].aditionalDetails}>
  {checkDetails[index].aditionalDetails}
</div>

      <div className='w-1/3 text-right'>{(checkDetails[index].total).toFixed(2)}</div>
    </div>
  ))}
</div>

    </div>
    
    
    
    
        </div>
    
        
      )
}

export default checkDetailComponenet
