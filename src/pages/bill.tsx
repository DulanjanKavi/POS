import React, { useState,useEffect } from 'react';
import deleteIcon from '../image/delete.png'
import editIcon from '../image/Edit.png'
import starIcon from'../image/star.png'
import { Link } from 'react-router-dom';
import Menubar from '../component/menubar';






let paymentMethod=[]

async function fetchPaymentMethod() {
  try {
    paymentMethod = await window.WINDOW_API.getPayMethodFromMain();
  } catch (error) {
    console.error(error);
  }
}


fetchPaymentMethod();





const Bill = () => {
  const [inputText, setInputText] = useState('');
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [cardArray, setCardArray] = useState([]);
  const [editItem,setEditItem]=useState('')
  const [noOfitem,setNoOfitem]=useState(0);
  const [itemInndex,setItemIndex]=useState(-1);
  const [temps,setTemps]=useState('')
  const [isVisiblePayMethod,setIsVisiblePayMethod]=useState(false)
  const [pArray, setPArray] = useState([]);
  const [priceArray,setPriceArray]=useState([])
  const [isConfermLoyalNumber,setIsConfermLoyalNumber]=useState(false)
  const [customerTP, setCustomerTP] = useState(0);
  const [loyalCustomerDetails,setLoyalCustomerDetails]=useState('')
  const [isCollectOrWithdraw,setIsCollectOrWithdraw]=useState(false)
  const [maxWithdrawPoint,setMaxWithdrawPoint]=useState(0)
  const [collectPoint,setCollectPoint]=useState(0)
  const [isWithdrawPoint,setIsWithdrawPoint]=useState(false)
  const [isCollectPoint,setIsCollectPoint]=useState(false)
  const [payStep,setPayStep]=useState('quickPay')
  

  const handleConfirmOnConfirmTheLoyalNumber=async()=>{
    setMaxWithdrawPoint( calMaxWithdrawPoint)
    setCollectPoint(calCollectPoint)

    setIsConfermLoyalNumber(false)
    setIsCollectOrWithdraw(true)
    
  }

  const getCustomerDetails = async (event,tp) => {
    if (event) {
      event.preventDefault();
    }
    try {
      const result = await window.Loyal_API.getCustemorData(tp);
      if (result === null) {
        addNewLoyalCustomer()
        console.log("customer dont have loyal customer account")
      } else {
        console.log(result);
        setLoyalCustomerDetails(result)
        handleIsVisibleConfermLoyalNumber()
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateUserPoint=(tp,points)=>{
    try {
       window.Loyal_API.updateLoyalPoints(tp,points);
       console.log("call update function on bill")
       
    } catch (error) {
      console.error(error);
    }
  }



  const billProcess=async (total,pMethod,customerID,discount,withdrowPoints,additionalDetails)=>{
    try{
      const result=await window.BILL_API.processBill(total,pMethod,customerID,discount,withdrowPoints,additionalDetails);
    }
    catch(error){
      console.error(error);
    }
  }




  const calCollectPoint=()=>{
    console.log(total)
    console.log(total/100)
    return (total/100)

  }

  const calMaxWithdrawPoint = () => {
    if (loyalCustomerDetails.points <= (total / 100)) {
      return loyalCustomerDetails.points;
    } else {
      return total / 100; // Fix this line
    }
  };
  

  const handleCollectPoint=(type)=>{
    if(type=="c")
      {
        setIsCollectPoint(true)
        console.log("collect point")
        setPayStep('collect loyal points')
      }
    else if(type=="w"){
      //console.log("withdrow point")
      //const newPoint=loyalCustomerDetails.points-maxWithdrawPoint
      //updateUserPoint(loyalCustomerDetails.TP,newPoint)
      setIsWithdrawPoint(true)
      console.log("withdrow point")
      //setTotal(total-maxWithdrawPoint)
      setPayStep('withdraw loyal points')
    }
    setIsCollectOrWithdraw(false)
    setIsVisiblePayMethod(true)
  }

  const [isVisibleaddNewLoyalCustomer,setIsVisibleaddNewLoyalCustomer]=useState(false)
  const [newCustomerName,setNewCustomerName]=useState('')

  const addNewLoyalCustomer=()=>{
    SetIsVisibleLoyalCustomer(false)
    setIsVisibleaddNewLoyalCustomer(true)

  }

  const handleBackOnAddNewLoyalCustomer=()=>{
    setCustomerTP(0)
    setIsVisibleaddNewLoyalCustomer(false)
    SetIsVisibleLoyalCustomer(true)
  }

  const handleEditOnConfirmNewLoyalCustomer=()=>{
    setNewCustomerName('')
    setIsVisibleConfirmAddNewCustomerDetails(false)
    setIsVisibleaddNewLoyalCustomer(true)
  }

  const handleNextOnConfirmNewLoyalCustomer=()=>{
    setIsVisibleConfirmAddNewCustomerDetails(false)
    setIsVisiblePayMethod(true)
    setPayStep('add new loyal customer')
    //setCollectPoint(calCollectPoint)
    //setIsCollectPoint(true)
    //console.log(collectPoint)
    //addNewLoyalCustomerToDatabase(customerTP,newCustomerName,total/100)
    //payBillSuccess()
  }

  const habdleQuickPayOnAddLoyalCustomer=()=>{
    setPayStep('quickPay')
    SetIsVisibleLoyalCustomer(false)
    setIsVisiblePayMethod(true)
  }

  const handleCloseOnAddLoyalCustomer=()=>{
    SetIsVisibleLoyalCustomer(false)
    setError("")
  }

  const addNewLoyalCustomerToDatabase=(tp, name, points)=>{
    try {
      window.Loyal_API.addLoyalCustomer(tp, name, points);
      console.log("add new loyal customer")
      
   } catch (error) {
     console.error(error);
   }
  }

  

  useEffect(() => {
    console.log(cardArray);
  }, [cardArray]);


  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setTemps(e.target.value)
  };

  const handleNoOfItem = (e) => {
    setNoOfitem(e.target.value);
  };

  const handleClear = () => {
    setInputText('');
    setError('');
  };

  const handleRemoveBill=()=>{
    setInputText('');
    setError('');
    setTotal(0);
    setCardArray([])
  }
  
  const handleEnter = async () => {
    const matchingData = await window.Item_API.getItem(inputText);
    setError("")
  
    if (matchingData) {
      const existingItem = cardArray.find((item) => item.snumber === inputText);
      const priceArray = matchingData.price.split(',').map(Number);
      const discountArray = matchingData.discount.split(',').map(Number);
      const itemsnumber=matchingData.snumber;
      const itemname=matchingData.name;
      setPriceArray(priceArray)


      if (existingItem  && priceArray.length===1) {
        // Increment NoOfItems and update Amount if item in CardArray and item only have one value
        const updatedData = {
          ...existingItem,
          NoOfItems: existingItem.NoOfItems + 1,
            discount:existingItem.selectedDiscount*existingItem.selectedValue*(existingItem.NoOfItems + 1)/100,
          Amount: existingItem.selectedValue*(existingItem.NoOfItems + 1)-(existingItem.selectedDiscount*existingItem.selectedValue*(existingItem.NoOfItems + 1)/100),
        };
        console.log("existingItem  && priceArray.length===1")
        setTotal(total +(existingItem.selectedValue)-(existingItem.selectedDiscount*existingItem.selectedValue/100) );
        setError('');
        setInputText('')
        // Replace the existing item with the updated one
        setCardArray(cardArray.map((item) => (item.snumber === inputText ? updatedData : item)));
      }
      else if(existingItem  && priceArray.length!==1)
      {
        //if multivalu item already in card array need update it adding item have same valu else add new item to card
        /*const newItem = {
          ...matchingData,

          NoOfItems: 1,
          selectedValue:existingItem.value[0],
          Amount: matchingData.value[0],
        };*/
        console.log("existingItem  && priceArray.length!==1")

        const newItem = {
          snumber: itemsnumber,
          iname: itemname,
          NoOfItems: 1,
          Values: priceArray,
          discounts: discountArray,
          
        };




        setEditItem(newItem)
        handelUpdateItemMultipleValue()

      }
      
      else if (!existingItem && priceArray.length === 1) {
        // if item not in card array and item only have one value
       // console.log('add new item with 1 value')
       // console.log(discountArray)
       console.log("!existingItem && priceArray.length === 1")
        const newItem = {
          snumber: itemsnumber,
          iname: itemname,
          NoOfItems: 1,
          selectedValue: priceArray[0], // one item price
          selectedDiscount: discountArray[0],
          discount: discountArray[0] * priceArray[0] / 100,
          Amount: (priceArray[0] - ( discountArray[0] * priceArray[0] / 100)),
        };
        //console.log(newItem);

      
        setTotal(total + newItem.Amount);
        setError('');
        setCardArray([...cardArray, newItem]);
        setInputText('');
        
      }
      else if(!existingItem  && priceArray.length!==1){
        //item not in current array and item have more value
        console.log("!existingItem  && priceArray.length!==1")
        const newItem = {
            snumber: itemsnumber,
            iname: itemname,
            NoOfItems: 1,
            Values: priceArray, // one item price
            discounts: discountArray,
            
          };
          setEditItem(newItem)
          console.log(editItem)
        
        

       handelAddItemMultipleValue()
       setInputText('')
      }
    } else {
      setError('Invalid snumber. Please try again.');
    }
  };




/*
  const handleEnter = async () => {
    const result = await window.Item_API.getItem(inputText);
    console.log(result.snumber)
    
  }*/
  

  

  //popupwindow for remove bill
  const [isVisible, setIsVisible] = useState(false);

  const closePopup = () => {
    handleRemoveBill();
    setIsVisible(false);
  };

  const cancelPopup=()=>{
    setIsVisible(false);
  };

  //popupwindow for edit item
  const [isVisibleEditItem, setIsVisibleEditItem] = useState(false);
  const [isVisibleMultiValueAddItem,setIsVisibleMultiValueAddItem]=useState(false)


  const handleEditItem=(index)=>{
      setIsVisibleEditItem(!isVisibleEditItem)
      setItemIndex(index)
    }
    

  
  
  const successPopupEditItem= () => {
    const lastQut=cardArray[itemInndex].Amount

    cardArray[itemInndex].NoOfItems=parseInt(noOfitem, 10)
    cardArray[itemInndex].discount=cardArray[itemInndex].selectedValue*cardArray[itemInndex].selectedDiscount*parseInt(noOfitem, 10)/100
    cardArray[itemInndex].Amount=cardArray[itemInndex].selectedValue*parseInt(noOfitem, 10)-(cardArray[itemInndex].selectedValue*cardArray[itemInndex].selectedDiscount*parseInt(noOfitem, 10)/100)
    
  
    setTotal(total + cardArray[itemInndex].Amount-lastQut)
    setError('');
    setInputText('')

    setIsVisibleEditItem(false);
  };

  const cancelPopupEditItem=()=>{
    setIsVisibleEditItem(false);
  };

  //popupwindow for Add item*
  const [isVisibleAddItem, setIsVisibleAddItem] = useState(false);

  const closePopupAddItem = () => {
  
    setIsVisibleAddItem(false);
    setInputText('')
  };

  

  const handelAddItemMultipleValue=()=>{
    setIsVisibleAddItem(!isVisibleAddItem)
  }

  const handelCloseUpdateItemMultipleValue=()=>{
    setIsVisibleMultiValueAddItem(false)
  }
  
  const handelUpdateItemMultipleValue=()=>{
    setIsVisibleMultiValueAddItem(true)
  }

  const handlAddItemOrUpdateToCardWithMultiValue=(index)=>{
    setIsVisibleMultiValueAddItem(false)
    const matchingData = cardArray.find((item) => item.snumber === editItem.snumber && item.selectedValue === editItem.Values[index]);
    if(matchingData){
      console.log("new item in card with selected value")
      const updatedData = {
        ...matchingData,
        NoOfItems: matchingData.NoOfItems + 1,
        discount:matchingData.discount+(matchingData.selectedValue*matchingData.selectedDiscount/100),
        Amount:  (matchingData.selectedValue-matchingData.selectedDiscount)* (matchingData.NoOfItems + 1),
      };
      setTotal(total + matchingData.selectedValue-matchingData.selectedDiscount);
        setError('');
        setCardArray(cardArray.map((item) => (item.snumber === inputText && item.selectedValue === editItem.Values[index] ? updatedData : item)));
    }
    else{
      console.log("new item in card with another value")
      const newItem = {
        snumber: editItem.snumber,
        iname: editItem.iname,
        NoOfItems: 1,
        selectedValue: editItem.Values[index],
        selectedDiscount: editItem.discounts[index],
        discount: editItem.Values[index] * editItem.discounts[index] / 100,
        Amount:editItem.Values[index]-(editItem.Values[index] * editItem.discounts[index] / 100) ,
      };

      setTotal(total + newItem.Amount);
      setError('');
      setCardArray([...cardArray, newItem]);
      setInputText('');
    }
    

  }
  
 


  const handleAddItemToCardWithMultiValue=(index)=>{
    setIsVisibleAddItem(false);
    const newItem = {
        snumber: editItem.snumber,
        iname: editItem.iname,
        NoOfItems: 1,
        selectedValue: editItem.Values[index], // one item price
        selectedDiscount: editItem.discounts[index],
        discount: editItem.Values[index] * editItem.discounts[index] / 100,
        Amount: (editItem.Values[index] - ( editItem.Values[index] * editItem.discounts[index]/ 100)),
      };
      console.log(newItem);

    
      setTotal(total + newItem.Amount);
      setError('');
      setCardArray([...cardArray, newItem]);
      setInputText('');
  }
  const[isVisibleDeleteItem,setIsVisibleDeleteItem]=useState(false)
  const[deleteItemSnumber,setDdeleteItemSnumber]=useState('')
  const[deleteItemValue,setDeleteItemValue]=useState(0)
  const[deleteItemNoOfItem,setDeleteItemNoOfItem]=useState(0)

  const handleDeleteItem=(index)=>{
      setIsVisibleDeleteItem(true)
      setDdeleteItemSnumber(index)
  }

  const handleCloseDeleteWindow=()=>{
    setIsVisibleDeleteItem(false)
    setDdeleteItemSnumber(0)
    setDeleteItemValue('')
  }

  const deleteItem=()=>{
    setIsVisibleDeleteItem(false)
    setTotal(total -cardArray[deleteItemSnumber].Amount);

    
    
    const updatedCardArray = cardArray.filter((item,index)=>index!==deleteItemSnumber);
    console.log("deleteitem")
    setCardArray(updatedCardArray);
    setDdeleteItemSnumber(0)
    setDeleteItemValue('')
    console.log(cardArray)

  }

  const closePayMethod=()=>{
    setIsVisiblePayMethod(false)
    setIsWithdrawPoint(false)
  }

  const [isVisiblePayMethodcash,setIsVisiblePayMethodCash]=useState(false)
  const [isPayMethodCash,setIsPayMethodCash]=useState(false)
  const [isVisiblePayMethodCard,setIsVisiblePayMethodCard]=useState(false)
  const [isPayMethodCard,setIsPayMethodCard]=useState(false)
  const [errorOnPayCard,setErrorOnPayCard]=useState('')
  const [isVisiblePayMethodBank,setIsVisiblePayMethodBank]=useState(false)
  const [isPayMethodBank,setIsPayMethodBank]=useState(false)
  const [transferID,setTransferID]=useState(0)
  const [errorOnPayBank,setErrorOnPayBank]=useState('')
  const [isVisiblePayMethodCheque,setIsVisiblePayMethodCheque]=useState(false)
  const [isPayMethodCheque,setIsPayMethodCheque]=useState(false)
  const [chequeNumber,setChequeNumber]=useState(0)
  const [errorOnPayCheque,setErrorOnPayCheque]=useState('')
  

  const navigateToPatMethod = (method) => {
    setIsVisiblePayMethod(false)
    if (method === 'Cash') {
      setIsPayMethodCash(true)
      setErrorOnPayCash('')
      setIsVisiblePayMethodCash(true)
    }
    else if(method==='Card'){
      setIsVisiblePayMethodCard(true)
      setIsPayMethodCard(true)
      SetCardNumber(0)
      setErrorOnPayCard('')

    }
    else if(method=='Bank Transfer'){
      console.log('bank transfer')
      setIsVisiblePayMethodBank(true)
      setIsPayMethodBank(true)
      setErrorOnPayBank('')
      setTransferID(0)
    }
    else if(method=='Check'){
      console.log('check')
      setIsVisiblePayMethodCheque(true)
      setIsPayMethodCheque(true)
      setErrorOnPayCheque('')
      setChequeNumber(0)
    }

  }

  const callDiscount=()=>{
    let totalDiscount=0;
    for(const item of cardArray){
      totalDiscount+=item.discount;
    }
    return totalDiscount
  }
  

  const backToPayMethodInCash=()=>{
    setIsVisiblePayMethodCash(false)
    setIsVisiblePayMethod(true)
  }
  const backToPayMethodInCard=()=>{
    setIsVisiblePayMethodCard(false)
    setIsVisiblePayMethod(true)
    SetCardNumber(0)
  }

  const backToPayMethodInBank=()=>{
    setIsVisiblePayMethodBank(false)
    setIsVisiblePayMethod(true)
    setTransferID(0)
  }

  const backToPayMethodInCheque=()=>{
    setIsVisiblePayMethodCheque(false)
    setIsVisiblePayMethod(true)
    setChequeNumber(0)
  }
  
  const payCashClose=()=>{
    setIsVisiblePayMethodCash(false)
  }

  const payCardhClose=()=>{
    SetCardNumber(0)
    setIsVisiblePayMethodCard(false)
  }

  const payBankClose=()=>{
    setTransferID(0)
    setIsVisiblePayMethodBank(false)
  }

  const payChequeClose=()=>{
    setChequeNumber(0)
    setIsVisiblePayMethodCheque(false)
  }

  const [errorOnPayCash,setErrorOnPayCash]=useState("")
  const zero=0
  const [payAmount,setPayAmount]=useState(zero.toFixed(2))
  

  const [isVisibleLoyalCustomer,SetIsVisibleLoyalCustomer]=useState(false)
  
  const handleAddLoyalCustomer=()=>{
      SetIsVisibleLoyalCustomer(true)
    }

  

  
  const [isVisibleProcessBill,setIsVisibleProcessBill]=useState(false)
  const payBillSuccess=()=>{
    setIsVisibleProcessBill(true)
    setIsVisiblePayMethodCash(false)
  }

  
  
  const handlePayCash = () => {
    if (payAmount< total) {
      setErrorOnPayCash('Cash amount cannot be less than gross amount');
    } else {

      payBillSuccess()
      SetIsVisibleLoyalCustomer(false)
      if(payStep=='quickPay')
        {
          console.log('Quick pay')
          billProcess (total,'Cash',0,callDiscount(),0,"Cash Given "+payAmount)
        }
      else if(payStep=='add new loyal customer')
        {
          console.log('add new loyal customer to coyal customer table & pay')
          setCollectPoint(calCollectPoint)
          setIsCollectPoint(true)
          console.log(collectPoint)
          addNewLoyalCustomerToDatabase(customerTP,newCustomerName,total/100)
          billProcess (total,'Cash',customerTP,callDiscount(),0,"Cash Given "+payAmount)
      }
      else if(payStep=='collect loyal points')
        {
          console.log('collect loyal points')
          const newPoint=loyalCustomerDetails.points+collectPoint
          updateUserPoint(loyalCustomerDetails.TP,newPoint)
          billProcess (total,'Cash',loyalCustomerDetails.TP,callDiscount(),0,"Cash Given "+payAmount)
        }

      else if(payStep=='withdraw loyal points')
        {
          console.log('withdrow points')
          const newPoint=loyalCustomerDetails.points-maxWithdrawPoint
          updateUserPoint(loyalCustomerDetails.TP,newPoint)
          billProcess (total-maxWithdrawPoint,'Cash',loyalCustomerDetails.TP,callDiscount(),maxWithdrawPoint,"Cash Given "+payAmount)
          setTotal(total-maxWithdrawPoint)
        }
        
        
    }
  };

  const[cardNumber,SetCardNumber]=useState(0)

  const handlePayCard = () => {
    setIsPayMethodCash(false)
    if (cardNumber.length!==4) {
      setErrorOnPayCard('Card number last 4 digits are wrong. ');
    } 
    else {

      payBillSuccess()
      setIsVisiblePayMethodCard(false)
      if(payStep=='quickPay')
        {
          console.log('Quick pay')
          billProcess (total,'Card',0,callDiscount(),0,"Card Number "+cardNumber)
        }
      else if(payStep=='add new loyal customer')
        {
          console.log('add new loyal customer to coyal customer table & pay')
          setCollectPoint(calCollectPoint)
          setIsCollectPoint(true)
          console.log(collectPoint)
          addNewLoyalCustomerToDatabase(customerTP,newCustomerName,total/100)
          billProcess (total,'Card',customerTP,callDiscount(),0,"Card Number "+cardNumber)
      }
      else if(payStep=='collect loyal points')
        {
          console.log('collect loyal points')
          const newPoint=loyalCustomerDetails.points+collectPoint
          updateUserPoint(loyalCustomerDetails.TP,newPoint)
          billProcess (total,'Card',loyalCustomerDetails.TP,callDiscount(),0,"Card Number "+cardNumber)
        }

      else if(payStep=='withdraw loyal points')
        {
          console.log('withdrow points')
          const newPoint=loyalCustomerDetails.points-maxWithdrawPoint
          updateUserPoint(loyalCustomerDetails.TP,newPoint)
          billProcess (total-maxWithdrawPoint,'Card',loyalCustomerDetails.TP,callDiscount(),maxWithdrawPoint,"Card Number "+cardNumber)
          setTotal(total-maxWithdrawPoint)
        }
        
        
    }
  };

  const handlePayBank = () => {
    setIsPayMethodBank(false)
    if (transferID.length!==10) {
      setErrorOnPayCard('Bank transfer number is wrong. ');
    } 
    else {

      payBillSuccess()
      setIsVisiblePayMethodBank(false)
      if(payStep=='quickPay')
        {
          console.log('Quick pay')
          billProcess (total,'Bank',0,callDiscount(),0,transferID)
        }
      else if(payStep=='add new loyal customer')
        {
          console.log('add new loyal customer to coyal customer table & pay')
          setCollectPoint(calCollectPoint)
          setIsCollectPoint(true)
          console.log(collectPoint)
          addNewLoyalCustomerToDatabase(customerTP,newCustomerName,total/100)
          billProcess (total,'Bank',customerTP,callDiscount(),0,transferID)
      }
      else if(payStep=='collect loyal points')
        {
          console.log('collect loyal points')
          const newPoint=loyalCustomerDetails.points+collectPoint
          updateUserPoint(loyalCustomerDetails.TP,newPoint)
          billProcess (total,'Bank',loyalCustomerDetails.TP,callDiscount(),0,transferID)
        }

      else if(payStep=='withdraw loyal points')
        {
          console.log('withdrow points')
          const newPoint=loyalCustomerDetails.points-maxWithdrawPoint
          updateUserPoint(loyalCustomerDetails.TP,newPoint)
          billProcess (total-maxWithdrawPoint,'Bank',loyalCustomerDetails.TP,callDiscount(),maxWithdrawPoint,transferID)
          setTotal(total-maxWithdrawPoint)
        }
        
        
    }
  };

  const handlePayCheque = () => {
    setIsPayMethodCheque(false)
    if (transferID.length<=10) {
      setErrorOnPayCard('Cheque number is wrong. ');
    } 
    else {

      payBillSuccess()
      setIsVisiblePayMethodCheque(false)
      if(payStep=='quickPay')
        {
          console.log('Quick pay')
          billProcess (total,'Check',0,callDiscount(),0,chequeNumber)
        }
      else if(payStep=='add new loyal customer')
        {
          console.log('add new loyal customer to coyal customer table & pay')
          setCollectPoint(calCollectPoint)
          setIsCollectPoint(true)
          console.log(collectPoint)
          addNewLoyalCustomerToDatabase(customerTP,newCustomerName,total/100)
          billProcess (total,'Check',customerTP,callDiscount(),0,chequeNumber)
      }
      else if(payStep=='collect loyal points')
        {
          console.log('collect loyal points')
          const newPoint=loyalCustomerDetails.points+collectPoint
          updateUserPoint(loyalCustomerDetails.TP,newPoint)
          billProcess (total,'Check',loyalCustomerDetails.TP,callDiscount(),0,chequeNumber)
        }

      else if(payStep=='withdraw loyal points')
        {
          console.log('withdrow points')
          const newPoint=loyalCustomerDetails.points-maxWithdrawPoint
          updateUserPoint(loyalCustomerDetails.TP,newPoint)
          billProcess (total-maxWithdrawPoint,'Cheque',loyalCustomerDetails.TP,callDiscount(),maxWithdrawPoint,chequeNumber)
          setTotal(total-maxWithdrawPoint)
        }
        
        
    }
  };







  const handleIsVisibleConfermLoyalNumber=()=>{
    SetIsVisibleLoyalCustomer(false)
    setIsConfermLoyalNumber(true)
  }

  const confermAndPay=()=>{
    setIsConfermLoyalNumber(false)
    payBillSuccess()
  }

  const handleEditInConfermLoyalNumber=()=>{
    SetIsVisibleLoyalCustomer(true)
    setIsConfermLoyalNumber(false)
    setCustomerTP(0)
    setLoyalCustomerDetails('')
  }

  const handlePayButton=()=>{
    if(total==0.00)
      {
        setError("Total can't be Rs 0.00")
      }
    else{
      handleAddLoyalCustomer()
     // setIsVisiblePayMethod(true)
    }
  }

  const handleRemove=()=>{
    if(cardArray.length===0)
      {
        setError("Empty cart.")
      }
    else{
      setIsVisible(!isVisible)
    }
  }

  const handleQuickPayOnAddNewLoyalCustomer=()=>{
    setIsVisibleaddNewLoyalCustomer(false)
    setIsVisiblePayMethod(true)
    setPayStep('quickPay')
  }

  const [isVisibleConfirmAddNewCustomerDetails,setIsVisibleConfirmAddNewCustomerDetails]=useState(false)

  const handleNextOnAddNewLoyalCustomer=()=>{
    setIsVisibleaddNewLoyalCustomer(false)
    setIsVisibleConfirmAddNewCustomerDetails(true)
  }

  

  const closeProcessBill = () => {
    setIsVisibleProcessBill(false);
    setCardArray([])
    setDdeleteItemSnumber('')
    setDeleteItemNoOfItem(0)
    setDeleteItemValue(0)
    setEditItem('')
    setError('')
    setErrorOnPayCash('')
    setInputText('')
    setItemIndex(-1)
    setNoOfitem(0)
    setPayAmount(0)
    setTemps('')
    setCustomerTP(0)
    setTotal(0)
    setLoyalCustomerDetails('')
    setMaxWithdrawPoint(0)
    setCollectPoint(0)
    setIsWithdrawPoint(false)
    setNewCustomerName('')
    setIsCollectPoint(false)
    SetCardNumber(0)
    setIsVisiblePayMethodCard(false)
}




  return (
    <div>
      <div>
      <Menubar/>
      </div>






























      
      <div className="fixed top-6 left-0 right-0   z-10">
        <div >
          
        </div>
      
      
        <div className="border-b-4  m-1 p-1  flex justify-between items-center">
    <p className="text-lg text-center text-white">Quick access bar</p>
    <div className="flex justify-end space-x-1">
        <button onClick={handleRemove} className="bg-red-500 rounded px-10 py-1 m-1">Remove Bill</button>
        <button onClick={handlePayButton} className="bg-green-500 rounded px-10 py-1 m-1">Pay</button>
    </div>
</div>

      </div>

      <div className="my-6">
        <br></br>
      </div>
      {isVisibleAddItem && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black">
                        <div className='text-2xl text-center'>
                              Select The Price
                            </div>
                          <div className='flex items-center justify-center'>
                          {editItem.Values.map((value, index) => (
                                <div key={index}>
                                    <button onClick={() => handleAddItemToCardWithMultiValue(index)} className="bg-blue-500 text-white p-2 rounded m-2">
                                    {value.toFixed(2)}
                                    </button>
                                </div>
                                ))}


                          </div>
                          <div className='flex items-center justify-center'>
                          <button onClick={closePopupAddItem} className="bg-red-500 text-white p-2  rounded m-2">
                            close
                          </button>

                          </div>
                          
                          
                        </div>
                      </dialog>
)}  

{isVisibleProcessBill && (
                      
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black w-96">
                          <div className='flex items-center justify-center '>
                          <p className="text-2xl">PROSESS BILL</p>
                          </div>
                          <div className='items-center justify-center flex'>
                          <div className='w-72 p-4 flex flex-col items-start justify-between'>
    <div className='w-full flex justify-between '>
        <p className='text-xl'>Total:</p>
        <p>{total.toFixed(2)}</p>
    </div>
    {isPayMethodCash && (
        <div className='w-full  flex flex-col items-start z-50'>
            <div className='w-full flex justify-between'>
                <p className='text-xl'>Cash :</p>
                <p>{(payAmount)}</p>
            </div>
            <div className='w-full flex justify-between'>
                <p className='text-xl'>Balance :</p>
                {isWithdrawPoint &&(
                  <p>{(payAmount-total).toFixed(2)}</p>
                )
                }
                {!isWithdrawPoint &&(
                  <p>{(payAmount-total).toFixed(2)}</p>
                )
                }
            </div>
            {isWithdrawPoint && (
              <div className='w-full flex justify-between'>
              <p className='text-xl'>Withdraw point :</p>
              <p>{(maxWithdrawPoint).toFixed(2)}</p>
          </div>
            )}
            {isCollectPoint && (
              <div className='w-full flex justify-between'>
              <p className='text-xl'>Collect point :</p>
              <p>{(collectPoint).toFixed(2)}</p>
          </div>
            )}
        </div>
    )}
    {!isPayMethodCash && (
        <div className='w-full  flex flex-col items-start z-50'>
            {isWithdrawPoint && (
              <div className='w-full flex justify-between'>
              <p className='text-xl'>Withdraw point :</p>
              <p>{(maxWithdrawPoint).toFixed(2)}</p>
          </div>
            )}
            {isCollectPoint && (
              <div className='w-full flex justify-between'>
              <p className='text-xl'>Collect point :</p>
              <p>{(collectPoint).toFixed(2)}</p>
          </div>
            )}
        </div>
    )}
</div>


                          </div>

                          <div className="bg-white p-1  border-t-2">
    <table className="table-auto w-full">
                    <tbody>
                        <tr className="flex w-full justify-between  border-b-2">
                            
                            <td className='w-5/10 p-2 '>snumber</td>
                            <td className='w-1/10 p-2 '>price</td>
                            <td className='w-1/10 p-2 '>Qut.</td>
                            <td className='w-1/10 p-2 '>Amount</td>
                           
                            
                        </tr>
                    </tbody>
                </table>
    </div>
    <div className=' max-h-[30vh] md:max-h-[80vh]  overflow-auto m-2 p-2 w-full'>
    {cardArray.map((item, index) => {
        // Generate a unique key for each item
        const uniqueKey = `${item.snumber}-${index}`;


        return (
            <div key={uniqueKey} className=" bg-white m-1 rounded-lg overflow-auto">
                <table className="table-auto w-full">
                    <tbody>
                        <tr className="flex w-full justify-between   text-sm">
                            
                            <td className='w-5/10 p-2 '>{item.snumber}</td>
                            <td className='w-1/10 p-2 '>{(item.selectedValue).toFixed(2)}</td>
                            <td className='w-1/10 p-2 '>{item.NoOfItems}</td>
                            <td className='w-1/10 p-2 '>{(item.Amount).toFixed(2)}</td>
                            
                        </tr>
                    </tbody>
                </table>
                
            </div>
        );
    })}
    </div>

                          

                          <div className='flex items-center justify-center'>
                          <button onClick={closeProcessBill}   className="bg-blue-500 text-white p-2  rounded m-2">
                            close
                          </button>
                          </div>
                          
                          
                        </div>
                      </dialog>
)}



{isVisibleDeleteItem && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black">
                        <div className='flex flex-col items-center justify-center'>
                                    <div className='text-lg text-center mb-4'>Delete item</div>
                                    <div className='flex justify-between w-full mb-2'>
                                        <span>Item Snumber:</span>
                                        <span>{cardArray[deleteItemSnumber].snumber}</span>
                                    </div>
                                    <div className='flex justify-between w-full mb-2'>
                                        <span>Item name:</span>
                                        <span>{cardArray[deleteItemSnumber].iname}</span>
                                    </div>
                                    <div className='flex justify-between w-full mb-2'>
                                        <span>No of items:</span>
                                        <span>{cardArray[deleteItemSnumber].NoOfItems}</span>
                                    </div>
                                    <div className='flex justify-between w-full'>
                                        <span>Amount:</span>
                                        <span>{cardArray[deleteItemSnumber].Amount.toFixed(2)}</span>
                                    </div>
                                    </div>

                          <div className='flex items-center justify-center'>
                          <button  onClick={handleCloseDeleteWindow} className="bg-blue-500 text-white p-2  rounded m-2">
                            close
                          </button>
                          <button  onClick={deleteItem} className="bg-red-500 text-white p-2  rounded m-2">
                            Delete
                          </button>

                          </div>
                          
                          
                        </div>
                      </dialog>
)}

{isVisibleMultiValueAddItem && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black items-center  justify-center ">
                          <div>
                          <p className='text-3xl text-center text-black'>Select Price</p>
                          </div>
                          <div className='flex items-center justify-center'>
                          {editItem.Values.map((value, index) => (
                              <div key={index}><button onClick={()=>handlAddItemOrUpdateToCardWithMultiValue(index)} className="bg-blue-500 text-white p-2  rounded m-2">{value.toFixed(2)}</button></div>
                            ))}
                          </div>
                          <div className="flex items-center justify-center">
                          <button onClick={handelCloseUpdateItemMultipleValue} className="bg-red-500 text-white p-2  rounded m-2  items-center justify-center ">
                            close
                          </button>
                          </div>
                          
                          
                        </div>
                      </dialog>
)}

{isVisiblePayMethod && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black items-center  justify-center ">
                          <div className='items-center  justify-center text-center text-2xl'>
                          Select The Payment Method
                          </div>
                          <div className="text-xl text-center bg-white m-1 p-1 rounded-lg flex justify-between ">
                              Total
                              {!isWithdrawPoint && (<h1>{total.toFixed(2)}</h1>)}
                              {isWithdrawPoint && (<h1>{(total-maxWithdrawPoint).toFixed(2)}</h1>)}
                              
                            </div>
                          <div className='flex items-center justify-center'>
                            {paymentMethod.map((method) => (
                              <div key={method}>
                                <button  onClick={()=>navigateToPatMethod(method)}className="bg-blue-500 text-white p-2 rounded m-2">{method}</button>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-center">
                          <button onClick={closePayMethod}className="bg-red-500 text-white p-2  rounded m-2  items-center justify-center ">
                            close
                          </button>
                          </div>
                          
                          
                        </div>
                      </dialog>
)}

{isVisiblePayMethodcash && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                      <div className="bg-white  rounded-lg shadow-md  border-2 border-black p-5 m-100">
                      <button  onClick={backToPayMethodInCash} className=" text-black   rounded border-2 border-black m-1 px-1">
                        Back
                       </button>
                        <p className='text-3xl text-center mb-5'>Pay Cash</p>
                        <div className='flex justify-between items-center text-xl'>
                          <p>Total :</p>
                          {isWithdrawPoint && (
                            <p className='px-4'>{(total-maxWithdrawPoint).toFixed(2)}</p>
                          )
                          }
                          {!isWithdrawPoint && (
                            <p className='px-4'>{total.toFixed(2)}</p>
                          )
                          }
                          
                        </div>
                        <div className='flex justify-between items-center text-xl'>
                          <p>Cash :</p>
                        <input className='m-1 p-1 rounded border-2 border-black'
                          type="number"
                          min={0.00}
                          onChange={(e) => {
                            setPayAmount(e.target.value);
                            setError('');
                          }}
                        />
                        </div>
                        <div className='w-72'>
                        {errorOnPayCash && <p className="text-red-500">{errorOnPayCash}</p>}
                        </div>
                        <div className='flex justify-center items-center text-black'>
                        <button onClick={handlePayCash} className="bg-blue-500 text-white p-4  rounded m-4">
                          Pay
                        </button>
                        <button  onClick={payCashClose} className="bg-red-500 text-white p-4  rounded m-4">
                          Close
                        </button>
                        </div>
                      </div>
                    </dialog>
)}

{isVisiblePayMethodCard && (
                    <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                      <div className="bg-white  rounded-lg shadow-md  border-2 border-black p-5 m-100">
                      <button  onClick={backToPayMethodInCard} className=" text-black   rounded border-2 border-black m-1 px-1">
                        Back
                       </button>
                        <p className='text-3xl text-center mb-5'>Pay Card</p>
                        <div className='flex justify-between items-center text-xl'>
                          <p>Total :</p>
                          {isWithdrawPoint && (
                            <p className='px-4'>{(total-maxWithdrawPoint).toFixed(2)}</p>
                          )}
                          {!isWithdrawPoint && (
                            <p className='px-4'>{total.toFixed(2)}</p>
                          )}
                          
                        </div>
                        <div className='flex justify-between items-center text-xl'>
                          <p>card last 4 digit :</p>
                        <input className='m-1 p-1 rounded border-2 border-black'
                          type="number"
                          min={0}
                          onChange={(e) => {
                            SetCardNumber(e.target.value);
                            setError('');
                          }}
                        />
                        </div>
                        <div className='w-72'>
                        {errorOnPayCard && <p className="text-red-500">{errorOnPayCard}</p>}
                        </div>
                        <div className='flex justify-center items-center text-black'>
                        <button onClick={handlePayCard} className="bg-blue-500 text-white p-4  rounded m-4">
                          Pay
                        </button>
                        <button  onClick={payCardhClose} className="bg-red-500 text-white p-4  rounded m-4">
                          Close
                        </button>
                        </div>
                      </div>
                    </dialog>
)}

{isVisiblePayMethodBank && (
                    <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                      <div className="bg-white  rounded-lg shadow-md  border-2 border-black p-5 m-100">
                      <button  onClick={backToPayMethodInBank} className=" text-black   rounded border-2 border-black m-1 px-1">
                        Back
                       </button>
                        <p className='text-3xl text-center mb-5'>Online Bank Transfer</p>
                        <div className='flex justify-between items-center text-xl'>
                          <p>Total :</p>
                          {isWithdrawPoint && (
                            <p className='px-4'>{(total-maxWithdrawPoint).toFixed(2)}</p>
                          )}
                          {!isWithdrawPoint && (
                            <p className='px-4'>{total.toFixed(2)}</p>
                          )}
                          
                        </div>
                        <div className='flex justify-between items-center text-xl'>
                          <p>Transfer number :</p>
                        <input className='m-1 p-1 rounded border-2 border-black'
                          type="number"
                          min={0}
                          onChange={(e) => {
                            setTransferID(e.target.value);
                            setError('');
                          }}
                        />
                        </div>
                        <div className='w-72'>
                        {errorOnPayBank && <p className="text-red-500">{errorOnPayBank}</p>}
                        </div>
                        <div className='flex justify-center items-center text-black'>
                        <button onClick={handlePayBank} className="bg-blue-500 text-white p-4  rounded m-4">
                          Pay
                        </button>
                        <button  onClick={payBankClose} className="bg-red-500 text-white p-4  rounded m-4">
                          Close
                        </button>
                        </div>
                      </div>
                    </dialog>
)}

{isVisiblePayMethodCheque && (
                    <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                      <div className="bg-white  rounded-lg shadow-md  border-2 border-black p-5 m-100">
                      <button  onClick={backToPayMethodInCheque} className=" text-black   rounded border-2 border-black m-1 px-1">
                        Back
                       </button>
                        <p className='text-3xl text-center mb-5'>Cheque Payment</p>
                        <div className='flex justify-between items-center text-xl'>
                          <p>Total :</p>
                          {isWithdrawPoint && (
                            <p className='px-4'>{(total-maxWithdrawPoint).toFixed(2)}</p>
                          )}
                          {!isWithdrawPoint && (
                            <p className='px-4'>{total.toFixed(2)}</p>
                          )}
                          
                        </div>
                        <div className='flex justify-between items-center text-xl'>
                          <p>Transfer number :</p>
                        <input className='m-1 p-1 rounded border-2 border-black'
                          type="number"
                          min={0}
                          onChange={(e) => {
                            setChequeNumber(e.target.value);
                            setError('');
                          }}
                        />
                        </div>
                        <div className='w-72'>
                        {errorOnPayCheque && <p className="text-red-500">{errorOnPayCheque}</p>}
                        </div>
                        <div className='flex justify-center items-center text-black'>
                        <button onClick={handlePayCheque} className="bg-blue-500 text-white p-4  rounded m-4">
                          Pay
                        </button>
                        <button  onClick={payChequeClose} className="bg-red-500 text-white p-4  rounded m-4">
                          Close
                        </button>
                        </div>
                      </div>
                    </dialog>
)}

{isVisibleLoyalCustomer && (
  <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
    <div className="bg-white rounded-lg shadow-md border-2 border-black p-5 m-100">
      <p className="text-3xl text-center m-5">Add Loyal Customer</p>

      <div className="flex justify-between items-center text-xl">
        <p>TP:</p>
        <input
          className="m-1 p-1 rounded border-2 border-black"
          type="number"
          onChange={(e) => {
            setCustomerTP(e.target.value);
            setError(''); 
          }}
        />
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="flex justify-center items-center text-black">
      <button onClick={habdleQuickPayOnAddLoyalCustomer} className="bg-blue-500 text-white py-2 px-4 rounded m-2">
          Quick Pay
        </button>
        <button
          onClick={() => {
            if (customerTP.length !== 10) {
              setError('Please enter a 10-digit TP number.');
            } else {
              setError(''); // Clear any previous error
              getCustomerDetails(null,customerTP ); // Call the next function
            }
          }}
          className="bg-blue-500 text-white py-2 px-4 rounded m-2"
        >
          Next
        </button>
        <button onClick={handleCloseOnAddLoyalCustomer} className="bg-red-500 text-white py-2 px-4 rounded m-2">
          close
        </button>
      </div>
    </div>
  </dialog>
)}



{isVisibleaddNewLoyalCustomer && (
  <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
    <div className="bg-white rounded-lg shadow-md border-2 border-black p-5 m-100">
      <button onClick={handleBackOnAddNewLoyalCustomer} className="text-black rounded border-2 border-black m-1 px-1">
        Back
      </button>
      <p className="text-3xl text-center m-5">Add New Loyal Customer</p>

      <div className="flex justify-between items-center text-xl">
        <p>Name:</p>
        <input
          className="m-1 p-1 rounded border-2 border-black"
          type="text" 
          onChange={(e) => {
            setNewCustomerName(e.target.value);
            setError(''); 
          }}
        />
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="flex justify-center items-center text-black">
      <button  onClick={handleQuickPayOnAddNewLoyalCustomer} className="bg-blue-400 text-white py-2 px-4 rounded m-2"
        >
          Quick Pay
        </button>
        <button
          onClick={() => {
            if (newCustomerName.length < 10 || newCustomerName.length > 30) {
              setError('Please enter a TP number between 10 and 30 characters.');
            } else {
              setError(''); 
              handleNextOnAddNewLoyalCustomer()
            }
          }}
          className="bg-blue-600 text-white py-2 px-4 rounded m-2"
        >
          Next
        </button>
        
      </div>
      
    </div>
  </dialog>
)}

{isVisibleConfirmAddNewCustomerDetails && (
  <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
    <div className="bg-white rounded-lg shadow-md border-2 border-black p-5 m-100">
      <p className="text-3xl text-center m-5">Confirm New Loyal Customer</p>
      <p className="text-2xl text-center m-5">{customerTP}</p>
      <p className="text-2xl text-center m-5">{newCustomerName}</p>

      

      

      <div className="flex justify-center items-center text-black">
        <button onClick={handleNextOnConfirmNewLoyalCustomer} className="bg-blue-600 text-white py-2 px-4 rounded m-2">
          Next
        </button>
        <button onClick={handleEditOnConfirmNewLoyalCustomer}  className="bg-blue-400 text-white py-2 px-4 rounded m-2"
        >
          Edit
        </button>
      </div>
      
    </div>
  </dialog>
)}





{isVisible && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black">
                
                          <p className='text-3xl'>Conferm The Remove Bill.</p>
                          <p className='text-3xl'>{}</p>
                          <div className="flex items-center justify-center">
                          <button onClick={cancelPopup} className="bg-blue-500 text-white p-2  rounded m-2">
                            Close
                          </button>
                          <button onClick={closePopup} className="bg-red-500 text-white p-2  rounded m-2">
                            Remove Bill
                          </button>
                          </div>
                          
                        </div>
                      </dialog>
)}

{isConfermLoyalNumber && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black">
                      
                          <p className='text-3xl'>Confirm The Loyal Number.</p>
                          <p className='text-2xl text-center'>{customerTP}</p>
                          <p className='text-2xl text-center'>{loyalCustomerDetails.name}</p>
                          
                          <div className="flex items-center justify-center">
                          <button onClick={handleConfirmOnConfirmTheLoyalNumber} className="bg-blue-500 text-white p-2  rounded m-2">
                            Confirm
                          </button>
                          <button onClick={handleEditInConfermLoyalNumber} className="bg-red-500 text-white p-2  rounded m-2">
                            Change Customer
                          </button>
                          </div>
                          
                        </div>
                      </dialog>
)}

{isCollectOrWithdraw && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black">
                      
                          <p className='text-3xl text-center mb-5'>Loyalty Point Panel</p> 
                          <div className="flex items-center justify-center">
                          <button onClick={()=>handleCollectPoint("c")} className="bg-blue-500 text-black p-2  rounded m-2">
                            <div className='items-center'><img className="h-8 w-8 mx-8 my-1 " src={starIcon} alt="points" /></div>
                            <p>{collectPoint.toFixed(2)}</p>
                            <p>Collect</p>
                            <p>Points</p>

                          </button>
                          <button onClick={()=>handleCollectPoint("w")} className="bg-red-500 text-black p-2  rounded m-2">
                          <div className='items-center'><img className="h-8 w-8 mx-8 my-1 " src={starIcon} alt="points" /></div>
                            <p>{maxWithdrawPoint.toFixed(2)}</p>
                            <p>Withdraw</p>
                            <p>Points</p>
                          </button>
                          </div>
                          
                        </div>
                      </dialog>
)}

{isVisibleEditItem && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-white p-4 rounded-lg shadow-md  border-2 border-black z-50">
                        <div className='text-center mx-3'>
                          <p className='text-3xl'>Edit Item</p>
                          <div className='flex justify-between text-xl'>
                            <span>sNumber :</span>
                            <span>{cardArray[itemInndex].snumber}</span>
                          </div>
                          <div className='flex justify-between text-xl'>
                            <span>Item :</span>
                            <span>{cardArray[itemInndex].iname}</span>
                          </div>
                          <div className='flex justify-between text-xl'>
                            <span>Amount :</span>
                            <span>{cardArray[itemInndex].Amount.toFixed(2)}</span>
                          </div>
                        </div>

                          <input className='m-1 p-1 rounded border-2 border-black'
                            type="number"
                            
                            defaultValue={cardArray[itemInndex].NoOfItems}
                            onChange={handleNoOfItem}
                            min={1}
                          />
                          <button onClick={successPopupEditItem} className="bg-blue-500 text-white p-2  rounded m-2">
                            Edit item
                          </button>
                          <button onClick={cancelPopupEditItem} className="bg-red-500 text-white p-2  rounded m-2">
                            Close
                          </button>
                        </div>
                      </dialog>
)}

      <div className="fixed top-15 left-0 right-0    grid grid-cols-1 md:grid-cols-12  m-1 p-1  h-auto">
        <div className="max-h-[40vh] md:border-r-2 md:border-b-white border-b-2 md:max-h-[90vh] col-span-12  sm:col-span-7 m-1 p-1 border-black ">
          <div className="flex items-center justify-center p-1 m-1  ">
            <input className='m-1 p-1 rounded border-2 border-black focus:outline-none focus:border-black'
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Enter snumber"
            />
            <button className="bg-blue-500 rounded p-2 m-1 " onClick={handleEnter}>Add Item</button>
            <button className="bg-yellow-500  rounded p-2 m-1 " onClick={handleClear}>Clear</button>
           
            
            
          </div>
          <div className="flex items-center justify-center p-1 m-1  ">
          {error && <p className="text-red-500 text-center">{error}</p>}
          </div>
          

          
          
          <div className=' max-h-[25vh] md:max-h-[70vh] overflow-auto m-2 p-2 rounded border-2 '>
          <div className="grid grid-cols-12 ">
          
          <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white h-auto border-2  m-1 p-1 rounded">
              <div className="  border-2 border-white m-1 p-1 rounded-lg text-center">
                <button >
                  <div className="  border-2  m-1 p-1 rounded-lg text-center h-20">
                    <h1>Item Image</h1>
                  </div>
                  <div className="  border-2  m-1 p-1 rounded-lg text-center">
                    Item Name
                  </div>
                </button>
               
              </div>  
          </div>

          <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white h-auto border-2  m-1 p-1 rounded">
              <div className="  border-2 border-white m-1 p-1 rounded-lg text-center">
                <button >
                  <div className="  border-2  m-1 p-1 rounded-lg text-center h-20">
                    <h1>Item Image</h1>
                  </div>
                  <div className="  border-2  m-1 p-1 rounded-lg text-center">
                    Item Name
                  </div>
                </button>
               
              </div>  
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white h-auto border-2  m-1 p-1 rounded">
              <div className="  border-2 border-white m-1 p-1 rounded-lg text-center">
                <button >
                  <div className="  border-2  m-1 p-1 rounded-lg text-center h-20">
                    <h1>Item Image</h1>
                  </div>
                  <div className="  border-2  m-1 p-1 rounded-lg text-center">
                    Item Name
                  </div>
                </button>
               
              </div>  
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white h-auto border-2  m-1 p-1 rounded">
              <div className="  border-2 border-white m-1 p-1 rounded-lg text-center">
                <button >
                  <div className="  border-2  m-1 p-1 rounded-lg text-center h-20">
                    <h1>Item Image</h1>
                  </div>
                  <div className="  border-2  m-1 p-1 rounded-lg text-center">
                    Item Name
                  </div>
                </button>
               
              </div>  
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white h-auto border-2  m-1 p-1 rounded">
              <div className="  border-2 border-white m-1 p-1 rounded-lg text-center">
                <button >
                  <div className="  border-2  m-1 p-1 rounded-lg text-center h-20">
                    <h1>Item Image</h1>
                  </div>
                  <div className="  border-2  m-1 p-1 rounded-lg text-center">
                    Item Name
                  </div>
                </button>
               
              </div>  
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white h-auto border-2  m-1 p-1 rounded">
              <div className="  border-2 border-white m-1 p-1 rounded-lg text-center">
                <button >
                  <div className="  border-2  m-1 p-1 rounded-lg text-center h-20">
                    <h1>Item Image</h1>
                  </div>
                  <div className="  border-2  m-1 p-1 rounded-lg text-center">
                    Item Name
                  </div>
                </button>
               
              </div>  
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white h-auto border-2  m-1 p-1 rounded">
              <div className="  border-2 border-white m-1 p-1 rounded-lg text-center">
                <button >
                  <div className="  border-2  m-1 p-1 rounded-lg text-center h-20">
                    <h1>Item Image</h1>
                  </div>
                  <div className="  border-2  m-1 p-1 rounded-lg text-center">
                    Item Name
                  </div>
                </button>
               
              </div>  
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white h-auto border-2  m-1 p-1 rounded">
              <div className="  border-2 border-white m-1 p-1 rounded-lg text-center">
                <button >
                  <div className="  border-2  m-1 p-1 rounded-lg text-center h-20">
                    <h1>Item Image</h1>
                  </div>
                  <div className="  border-2  m-1 p-1 rounded-lg text-center">
                    Item Name
                  </div>
                </button>
               
              </div>  
          </div>
          
          
          


      </div>
          </div>
          

          
        </div>


        <div className=" max-h-[40vh] md:max-h-[90vh] col-span-12 md:col-span-5 m-1 p-1  ">
    
    <div className="text-2xl text-center bg-white m-1 p-1  flex justify-between  border-b-4 ">
        <h3>Total</h3>
        <h1>{total.toFixed(2)}</h1>
    </div>

    <div>
      
    </div>




    <div className="border-b-2  mx-1">
    <table className="table-auto w-full text-md ">
                    <tbody className=''>
                    <tr className="flex  justify-between mx-2">
                            
                    
                            <td className='w-3/10 '>S.number</td>
                            <td className='w-1/10  '>Item name</td>
                           
                            <td className='w-3/10  '>&nbsp;</td>
                            <td className='w-4/10  '>&nbsp;</td>
                            
                        </tr>
                        <tr className="flex  justify-between mx-2">
                            
                    
                            <td className='w-1/10 '>price</td>
                            <td className='w-1/10  '>Qut.</td>
                            <td className='w-1/10  '>Dis.</td>

                            <td className='w-1/10  '>Amount</td>
                            
                           
                            
                        </tr>
                    </tbody>
                </table>
    </div>

    <div className='max-h-[20vh] md:max-h-[70vh] overflow-auto  '>

      {/* Display cardArray */}
    
    {cardArray.map((item, index) => {
        // Generate a unique key for each item
        


        return (
            <div key={index} className="bg-white m-1 ">
                <table className="table-auto w-full ">
                    <tbody className=' border-b-2 text-sm'>
                        <tr className="flex w-full justify-between">
                            
                            <td className='w-3/10  '>{item.snumber}</td>
                            <td className='w-4/10  '>{item.iname}</td>
                            
                            <td>
                            
                            <button  onClick={() => handleEditItem(index)} className="w-1/10  bg-yellow-500  p-1 rounded m-1"><img className="h-4 w-4  " src={editIcon} alt="Delete" /></button>
                            <button onClick={() => handleDeleteItem(index)} className="w-1/10 bg-red-500 p-1 rounded  m-1"><img className="h-4 w-4 " src={deleteIcon} alt="Delete" /></button>
                            </td>
                        </tr>
                        <tr className="flex w-full justify-between ">
                            <td className='w-1/10  '>{item.selectedValue.toFixed(2)}</td>
                            <td className='w-1/10  '>{item.NoOfItems}</td>
                            <td className='w-1/10  '> {item.discount.toFixed(2)}</td>
                            <td className='w-1/10  '>{item.Amount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
            </div>
        );
    })}
        
    </div>

</div>

      </div>

      

      
    </div>
  );
};

export default Bill;
