import React,{useState} from 'react'
import Menubar from '../component/menubar'
import CheckDetailComponenet from '../component/checkDetailComponenet';
import Refundcomponent from '../component/refundcomponenet';


function report() {
    const [isShowCheckDetails, setIsShowCheckDetails] = useState(true);

  const onClikeRefund = () => {
    setIsShowCheckDetails(false);
  };

  const onClickCheck = () => {
    setIsShowCheckDetails(true);
  };

    
    return (
        <div>
            <div className="fixed top-0 left-0 right-0   z-10">
            <div >
              <Menubar/>  
            </div>
          </div>
    
          <div className="my-1">
            <br></br>
          </div>
    
          <div className="text-lg fixed top-15 left-0 right-0 grid grid-cols-2  m-1 p-1 h-screen-15  ">
            <div className='col-span-1  h-screen-15 w-full'>
                
            {/*<UserComponent/>*/}
            <div className='text-lg grid grid-rows-10 m-1 p-1 h-screen '>
          <div className='row-span-1 flex justify-between px-4 py-1  border-b-2 items-center '>
          <p>Total Sales </p>
          <p>150.00</p>
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
      <div className='row-span-1 flex justify-between px-4 py-2  border-b-2 items-center'>
      <p>Cash payment </p>
          <p>150.00</p>
      </div>

      <div className='row-span-1 flex justify-between px-4 py-2 border-b-2 items-center'>
      <p>Card payment </p>
          <p>150.00</p>
      </div>

      <div className='row-span-1 flex justify-between px-4 py-2  border-b-2 items-center'>
      <p>Online payment </p>
          <p>150.00</p>
      </div>

      <div className='row-span-1 flex justify-between px-4 py-2  border-b-2 items-center'>
    <button onClick={onClickCheck} className="flex justify-between w-full">
        <div>
            <p>Cheack payment</p>
        </div>
        <div>
            <p>150.00</p>
        </div>
    </button>
</div>

      <div className='row-span-1 flex justify-between px-4 py-2 border-b-2 items-center'>
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
            <div className='col-span-1  h-screen-15 w-full'>
            {isShowCheckDetails ? <CheckDetailComponenet /> : <Refundcomponent />}
            
            </div>
    
    
          </div>
    
    
            
          
        </div>
      )
}

export default report
