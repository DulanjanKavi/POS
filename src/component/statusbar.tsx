import { BarcodeScannerButton } from "./barcodeScanner";
import React, { useState, useEffect } from 'react';



export default function StatusBar(){

  const [cashierName, setCashierName] = useState('');

  async function fetchPaymentMethod() {
    try {
      console.log("get cashier name")
      const name = await window.WINDOW_API.getCashierName();
      setCashierName(name)
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchPaymentMethod();
  }, []); 



    return (
        <div className="w-full flex items-center justify-around text-white bg-gray-800">
            <div>Cashier: {cashierName}</div>
            <BarcodeScannerButton />
        </div>
    )
}