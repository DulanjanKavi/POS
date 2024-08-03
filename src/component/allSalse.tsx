// AllSalse.tsx
import { useState, useEffect } from 'react';


interface SaleDetails {
  biiNumber: string;
  total: number;
  pMethod: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    REPORT_API: any; // Adjust the type as needed
  }
}

function AllSalse() {
  const [Details, setDetails] = useState<SaleDetails[]>([]);

  const getAllDetails = async () => {
    try {
      const result = await window.REPORT_API.getAllSalseDetails();
      if (result != null) {
        setDetails(result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllDetails();
  }, []);

  return (
    <div className="h-screen m-1">
      <div className="bg-white p-1">
        <div className="flex justify-center items-center text-center p-1 mb-2 border-b-2 border-slate-400 text-2xl font-bold">
          Total Sales
        </div>
        <div>
          <table className="table-auto w-full font-semibold">
            <tbody>
              <tr className="justify-between border-b-2 border-slate-400 text-xl p-2">
                <td className="w-1/3">Bill no.</td>
                <td className="w-1/3 text-right">Amount</td>
                <td className="w-1/3 text-right">P. method</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="max-h-[calc(100vh-50px)] text-lg overflow-y-auto">
        <div className="w-full text-sm">
          {Details.map((item, index) => (
            <div key={index} className="flex justify-between border-b-2">
              <div className="w-1/3 mx-2">{item.biiNumber}</div>
              <div className="w-1/3 text-right pr-3">
                {(Details[index].total).toFixed(2)}
              </div>
              <div className="w-1/3 text-right pr-3">
                {Details[index].pMethod}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AllSalse;
