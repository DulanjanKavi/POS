import { useState, useEffect } from 'react';

interface CardPaymentItem {
  biiNumber: string;
  total: number;
}

function CardPayment() {
  const [details, setDetails] = useState<CardPaymentItem[]>([]);

  const getAllDetails = async () => {
    try {
      const result = await window.REPORT_API.getAllCardPayment();
      if (result != null) {
        setDetails(result);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getAllDetails();
  }, []);

  return (
    <div className='h-screen m-1'>
      <div className="bg-white p-1">
        <div className='flex justify-center items-center text-center p-1 mb-2 border-b-2 border-slate-400 font-bold text-2xl'>
          Card Payment
        </div>
        <div>
          <table className="table-auto w-full font-semibold">
            <tbody>
              <tr className="justify-between border-b-2 border-slate-400 text-xl p-2">
                <td className='w-1/3'>Bill no.</td>
                <td className='w-1/3 text-right'>Amount</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className='max-h-[calc(100vh-50px)] text-lg overflow-y-auto'>
        <div className="w-full text-sm">
          {details.map((item, index) => (
            <div key={index} className="flex justify-between border-b-2">
              <div className='w-1/3 mx-2'>{item.biiNumber}</div>
              <div className='w-1/3 text-right pr-3'>{item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CardPayment;

