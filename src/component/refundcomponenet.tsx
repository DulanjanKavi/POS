

function refundcomponent() {
  return (
    <div className='border-l-2 border-black h-screen m-1'>
      <div className="bg-white p-1 rounded-lg">
      <div className='flex justify-center items-center text-center p-1 mb-2  border-b-2 text-2xl'>
    Refund Details
</div>

    <table className="table-auto w-full">
                    <tbody>
                        <tr className="flex w-full justify-between  border-b-2 text-xl ">
                            
                            <td className='w-3/10 p-2 '>Case no.</td>
                            <td className='w-3/10 p-2 '>Amount</td>
                            <td className='w-3/10 p-2 '>&nbsp;</td>
                            
                            
                            
                        </tr>
                    </tbody>
                </table>
    </div>
    <div className='max-h-[70vh] overflow-y-auto overflow-x-hidden text-lg p-2 m-2 '>
    <div className="">
    {/*{refundPayment.map((item, index) => (
        <div key={index} className="flex justify-between w-full p-2 m-1 mx-4 border rounded-lg hover:bg-gray-200 relative group">
            <div>{item.caseNumber}</div>
            <div>{item.amount}</div>
            <div className="relative cursor-pointer">
                
                <span className="absolute right-0 top-full mb-2 w-56 text-center bg-black text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out z-10">
                    {item.reason}
                </span>
            </div>
        </div>
    ))}*/}
</div>


    </div>



    </div>

    
  )
}

export default refundcomponent

