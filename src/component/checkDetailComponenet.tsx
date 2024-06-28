import React from 'react'

function checkDetailComponenet() {
    return (
        <div className='border-l-2 border-black h-screen m-1'>
          <div className="bg-white p-1 rounded-lg">
          <div className='flex justify-center items-center text-center p-1 mb-2  border-b-2 text-2xl'>
        Collected Check Details
    </div>
    
        <div className='mx-8'>
        <table className="table-auto w-full">
                        <tbody>
                            <tr className="flex  justify-between border-b-2 text-xl  ">
                                
                                <td className='w-w/3   '>Check no.</td>
                                <td className='w-w/3  pr- '>Amount</td>
                                <td className='w-w/3 hidden md:block '>Date</td>
                                
                                
                                
                            </tr>
                        </tbody>
                    </table>
        </div>
        </div>
        <div className='max-h-[70vh] text-lg p-2 m-2  overflow-y-auto '>
        <div className="w-ful">
        {/*{checkDetails.map((item, index) => (
            <div key={index} className="flex justify-between  p-2 m-1 mx-4 border rounded-lg hover:bg-gray-200 relative group">
                <div className='w-w/3 pl-4'>{item.checkNumber}</div>
                <div className='w-w/3'>{item.amount}</div>
                <div className='w-w/3 hidden md:block'>{item.date}</div>
            </div>
        ))}*/}
        </div>
    </div>
    
    
    
    
        </div>
    
        
      )
}

export default checkDetailComponenet
