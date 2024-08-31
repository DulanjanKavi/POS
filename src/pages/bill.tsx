import  { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import editIcon from '../image/Edit.png'
import starIcon from'../image/star.png'
import addIcon from '../assets/icons/addIcon.png'
import deleteIcon from '../assets/icons/delete.png'
import holdIcon from '../assets/icons/holdIcon.png'
import payIcon from '../assets/icons/payIcon.png'
import { BarcodeScannerProvider } from "../component/barcodeScanner";
import StatusBar from '../component/statusbar';
import searchIcon from '../assets/icons/searchIcon.png';
import maximiseIcon from '../assets/icons/maximise.png'
import minimizeIcon from '../assets/icons/minimise.png'
import restoreIcon from '../assets/icons/restore.png'
import logOutIcon1 from '../assets/icons/logOut.png'

import plant2 from '../assets/products/2.png'
import sellIcon from '../assets/icons/sell.png'
import returnIcon from '../assets/icons/delivery-status.png' 
import reportIcon from '../assets/icons/report.png'
import userIcon from '../assets/icons/user.png'
import coutinueIcon from '../assets/icons/continue.png'
let paymentMethod: any[]=[]

declare global {
  interface Window {
    WINDOW_API: any; // Adjust the type as needed
    Loyal_API:any;
    BILL_API:any;
    Item_API:any;
  }
}





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
  const [cardArray, setCardArray] = useState<any>([]);
  const [searchItems,setSearchItems]=useState<any>([])
  const [searchItem,setSearchItem]=useState<any>('')
  const [editItem,setEditItem]=useState<any>('')
  const [noOfitem,setNoOfitem]=useState<number>(0);
  const [itemInndex,setItemIndex]=useState(-1);
  const [isVisiblePayMethod,setIsVisiblePayMethod]=useState(false)
  const [isConfermLoyalNumber,setIsConfermLoyalNumber]=useState(false)
  const [customerTP, setCustomerTP] = useState(0);
  const [loyalCustomerDetails,setLoyalCustomerDetails]=useState<any>('')
  const [isCollectOrWithdraw,setIsCollectOrWithdraw]=useState(false)
  const [maxWithdrawPoint,setMaxWithdrawPoint]=useState(0)
  const [collectPoint,setCollectPoint]=useState(0)
  const [isWithdrawPoint,setIsWithdrawPoint]=useState(false)
  const [isCollectPoint,setIsCollectPoint]=useState(false)
  const [payStep,setPayStep]=useState('quickPay')
  const [dateState, setDateState] = useState(new Date());
  const navigate = useNavigate(); 
  const [holdArray,setHoldArray]=useState<any>([])
  const [isVisibleHoldArray,setIsVisibleHoldArray]=useState(false)
  const [isVisibleLogOut,setIsVisibleLogOut]=useState(false)

  const handleLogOut=()=>{
    setIsVisibleLogOut(true)
  }



  const handleConfirmLogOut=()=>{
    updateHoldArrayInMain([])
    navigate('/')
  }

  const handleReturn=()=>{
    navigate('/refund')
  }

  const handleCancelLogOut=()=>{
    setIsVisibleLogOut(false)
  }

  const handleOnClickCoutinue=()=>{
    setIsVisibleHoldArray(true)
  }

  const closeHoldCustomer=()=>{
    setIsVisibleHoldArray(false)
  }

    useEffect(() => {
      const timer = setInterval(() => {
        // Update the date state every minute
        setDateState(new Date());
      }, 60 * 1000);
  
      // Clear the interval when the component unmounts
      return () => clearInterval(timer);
    }, []);
  
    const formattedDate = dateState.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  
    const formattedTime = dateState.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const [cashierID, setCashierID] = useState('');

  async function getCashierID() {
    try {
      console.log('Getting cashier name...');
      const ID = await window.WINDOW_API.getCashierID();
      setCashierID(ID);
    } catch (error) {
      console.error('Error fetching cashier name:', error);
    }
  }


  async function getHoldArray() {
    try {
      console.log('get hold array from main frist time loding page')

      const result = await window.WINDOW_API.getHoldArray();
      console.log(result)
      console.log('**********************')
      setHoldArray(result)
    } catch (error) {
      console.error('Error fetching cashier name:', error);
    }
  }

  const updateHoldArrayInMain=(array:any)=>{
    window.WINDOW_API.setHoldArray(array);
    
  
  }

  useEffect(() => {
    getCashierID();
    getHoldArray();
  }, []);

  const setSearchItemArray=async()=>{
    try {
      // eslint-disable-next-line prefer-const
      let result:any = await window.Item_API.searchItem(searchItem);
      setSearchItems(result)
    
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(()=>{
    setSearchItemArray()
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[searchItem])

 


  

  
  const handleReports=()=>{
    navigate('/report')
  }

  const handleCashier=()=>{
    navigate('/cashier'); 
  }

  

  const handleConfirmOnConfirmTheLoyalNumber=async()=>{
    setMaxWithdrawPoint( calMaxWithdrawPoint)
    setCollectPoint(calCollectPoint)

    setIsConfermLoyalNumber(false)
    setIsCollectOrWithdraw(true)
    
  }

  const getCustomerDetails = async (event:any,tp:any) => {
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

  const updateUserPoint=(tp:any,points:any)=>{
    try {
       window.Loyal_API.updateLoyalPoints(tp,points);
       console.log("call update function on bill")
       
    } catch (error) {
      console.error(error);
    }
  }



  const billProcess=async (total:any,pMethod:any,customerID:any,discount:any,withdrowPoints:any,additionalDetails:any)=>{
    try{
      await window.BILL_API.processBill(total,pMethod,customerID,discount,withdrowPoints,additionalDetails);
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
  

  const handleCollectPoint=(type:any)=>{
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

  const handlePayout=()=>{
    setPayStep('quickPay')
    setIsVisiblePayMethod(true)
  }

  const handleCloseOnAddLoyalCustomer=()=>{
    SetIsVisibleLoyalCustomer(false)
    setError("")
  }

  const addNewLoyalCustomerToDatabase=(tp:any, name:any, points:any)=>{
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

  


  const handleInputChange = (e:any) => {
    setInputText(e.target.value);
  };


  const handleRemoveBill=()=>{
    setInputText('');
    setError('');
    setTotal(0);
    setCardArray([])
  }
  
  const handleEnter = async (inputText:any) => {
    const matchingData = await window.Item_API.getItem(inputText);
    setError("")
  
    if (matchingData) {
      const existingItem = cardArray.find((item:any) => item.snumber === inputText);
      const priceArray = matchingData.price.split(',').map(Number);
      const discountArray = matchingData.discount.split(',').map(Number);
      const itemsnumber=matchingData.snumber;
      const itemname=matchingData.name;
    


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
        setCardArray(cardArray.map((item:any) => (item.snumber === inputText ? updatedData : item)));
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


  const handleEditItem=(index:any)=>{
      setIsVisibleEditItem(!isVisibleEditItem)
      setItemIndex(index)
    }
    

  
  
  const successPopupEditItem= () => {
    const lastQut=cardArray[itemInndex].Amount

    cardArray[itemInndex].NoOfItems=noOfitem
    cardArray[itemInndex].discount=cardArray[itemInndex].selectedValue*cardArray[itemInndex].selectedDiscount*noOfitem/100
    cardArray[itemInndex].Amount=cardArray[itemInndex].selectedValue*noOfitem-(cardArray[itemInndex].selectedValue*cardArray[itemInndex].selectedDiscount*noOfitem/100)
    
  
    setTotal(total + cardArray[itemInndex].Amount-lastQut)
    setError('');
    setInputText('')

    setIsVisibleEditItem(false);
  };

  const cancelPopupEditItem=()=>{
    setIsVisibleEditItem(false);
    setError('')
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

  const handlAddItemOrUpdateToCardWithMultiValue=(index:any)=>{
    setIsVisibleMultiValueAddItem(false)
    const matchingData = cardArray.find((item:any) => item.snumber === editItem.snumber && item.selectedValue === editItem.Values[index]);
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
        setCardArray(cardArray.map((item:any) => (item.snumber === inputText && item.selectedValue === editItem.Values[index] ? updatedData : item)));
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
  
 


  const handleAddItemToCardWithMultiValue=(index:any)=>{
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
  

  const handleDeleteItem=(index:any)=>{
      setIsVisibleDeleteItem(true)
      setDdeleteItemSnumber(index)
  }

  const handleCloseDeleteWindow=()=>{
    setIsVisibleDeleteItem(false) 
  }

  const deleteItem=()=>{
    setIsVisibleDeleteItem(false)
    setTotal(total -cardArray[deleteItemSnumber].Amount);

    
    
    const updatedCardArray = cardArray.filter((_item:any,index:any)=>index!==deleteItemSnumber);
    console.log("deleteitem")
    setCardArray(updatedCardArray);
    console.log(cardArray)

  }

  const closePayMethod=()=>{
    setIsVisiblePayMethod(false)
    setIsWithdrawPoint(false)
  }

  const [isVisiblePayMethodcash,setIsVisiblePayMethodCash]=useState(false)
  const [isPayMethodCash,setIsPayMethodCash]=useState(false)
  const [isVisiblePayMethodCard,setIsVisiblePayMethodCard]=useState(false)
  const [,setIsPayMethodCard]=useState(false)
  const [errorOnPayCard,setErrorOnPayCard]=useState('')
  const [isVisiblePayMethodBank,setIsVisiblePayMethodBank]=useState(false)
  const [,setIsPayMethodBank]=useState(false)
  const [transferID,setTransferID]=useState(0)
  const [errorOnPayBank,setErrorOnPayBank]=useState('')
  const [isVisiblePayMethodCheque,setIsVisiblePayMethodCheque]=useState(false)
  const [,setIsPayMethodCheque]=useState(false)
  const [chequeNumber,setChequeNumber]=useState(0)
  const [errorOnPayCheque,setErrorOnPayCheque]=useState('')
  

  const navigateToPatMethod = (method:string) => {
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
  
  const [payAmount,setPayAmount]=useState<number>(0.00)
  

  const [isVisibleLoyalCustomer,SetIsVisibleLoyalCustomer]=useState(false)
  
  const handleAddLoyalCustomer=()=>{
      SetIsVisibleLoyalCustomer(true)
    }

  

  
  const [isVisibleProcessBill,setIsVisibleProcessBill]=useState(false)
  const payBillSuccess=()=>{
    setIsVisibleProcessBill(true)
    setIsVisiblePayMethodCash(false)
  }

  const handleHold= ()=>{
    const newHoldCustomer={
      holdTotal:total,
      holdCard:cardArray
    }
    
    setHoldArray([...holdArray,newHoldCustomer]);
    updateHoldArrayInMain([...holdArray,newHoldCustomer]);
    handleRemoveBill();
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
    if (String(cardNumber).length!==4) {
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
    if (String(transferID).length!==10) {
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
    if (String(transferID).length<=10) {
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



  const handleMinimize=()=>{
    window.WINDOW_API.minimize();
  }

  const handleRestore=()=>{
    window.WINDOW_API.restore();
  }

  const handleMaximize=()=>{
    window.WINDOW_API.maximize();
  }



  const handleIsVisibleConfermLoyalNumber=()=>{
    SetIsVisibleLoyalCustomer(false)
    setIsConfermLoyalNumber(true)
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
    setEditItem('')
    setError('')
    setErrorOnPayCash('')
    setInputText('')
    setItemIndex(-1)
    setNoOfitem(0)
    setPayAmount(0.00)
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



  const processHoldcrat=(holdTotal:any,holdCard:any,i:any)=>{
    setTotal(holdTotal)
    setCardArray(holdCard)
    setIsVisibleHoldArray(false)
    updateHoldArrayInMain(holdArray.filter((_item:any,index:any)=>index!==i))
    const updatedHoldArray = holdArray.filter((_item:any,index:any)=>index!==i);
    setHoldArray(updatedHoldArray)
    console.log(updatedHoldArray)
  }
  



  return (

<BarcodeScannerProvider>
    <div >
    {/*} <div >
      <Menubar/>
      </div>*/}
      
      




























       {/*
      <div className="fixed top-2 left-0 right-0   z-10">
        
      
      {/*
        <div className="border-b-4  m-1 p-1  flex justify-between items-center">
    <p className="text-lg text-center text-white">Quick access bar</p>
    <div className="flex justify-end space-x-1">
        <button onClick={handleRemove} className="bg-red-500 rounded px-10 py-1 m-1">Remove Bill</button>
        <button onClick={handlePayButton} className="bg-green-500 rounded px-10 py-1 m-1">Pay</button>
    </div>
</div>


      </div>SS
      */}

      
      {isVisibleAddItem && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-slate-100 bg-opacity-90 z-50">
                        <div className="bg-slate-200 py-5 px-10 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                        <div className='text-2xl text-center text-black font-bold pb-3 mb-3 border-b-2 border-slate-400'>
                              Select The Price
                            </div>
                          <div className='flex items-center justify-center font-semibold'>
                          {editItem.Values.map((value:any, index:any) => (
                                <div key={index}>
                                    <button onClick={() => handleAddItemToCardWithMultiValue(index)} className="bg-slate-400  text-black hover:bg-slate-600 hover:text-slate-100 p-2 rounded m-2">
                                    {value.toFixed(2)}
                                    </button>
                                </div>
                                ))}


                          </div>
                          <div className='flex items-center justify-center border-t-2 border-slate-400 mt-5'>
                          <button onClick={closePopupAddItem} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Close
                          </button>

                          </div>
                          
                          
                        </div>
                      </dialog>
)}  

{isVisibleProcessBill && (
                      
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                          <div className='flex items-center justify-center border-b-2 border-slate-400 pb-5'>
                          <p className="text-2xl text-black font-bold ">PROSESS BILL</p>
                          </div>
                          <div className='items-center justify-center flex'>
                          <div className='w-72 p-4 flex flex-col items-start justify-between'>
    <div className='w-full flex justify-between font-semibold '>
        <p className=' '>Total:</p>
        <p>{total.toFixed(2)}</p>
    </div>
    {isPayMethodCash && (
        <div className='w-full  flex flex-col items-start z-50 font-semibold text-black'>
            <div className='w-full flex justify-between'>
                <p className=''>Cash :</p>
                <p>{(payAmount)}</p>
            </div>
            <div className='w-full flex justify-between'>
                <p className=''>Balance :</p>
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
              <p className=''>Withdraw point :</p>
              <p>{(maxWithdrawPoint).toFixed(2)}</p>
          </div>
            )}
            {isCollectPoint && (
              <div className='w-full flex justify-between'>
              <p className=''>Collect point :</p>
              <p>{(collectPoint).toFixed(2)}</p>
          </div>
            )}
        </div>
    )}
    {!isPayMethodCash && (
        <div className='w-full  flex flex-col items-start z-50 text-black font-semibold'>
            {isWithdrawPoint && (
              <div className='w-full flex justify-between'>
              <p className=''>Withdraw point :</p>
              <p>{(maxWithdrawPoint).toFixed(2)}</p>
          </div>
            )}
            {isCollectPoint && (
              <div className='w-full flex justify-between'>
              <p className=''>Collect point :</p>
              <p>{(collectPoint).toFixed(2)}</p>
          </div>
            )}
        </div>
    )}
</div>


                          </div>

                          <div className=" p-1  border-y-2 border-slate-400">
    <table className="table-auto w-full">
                    <tbody>
                        <tr className="flex w-full justify-between ">
                            
                            <td className='w-5/10 px-2 '>snumber</td>
                            <td className='w-1/10 px-2 '>price</td>
                            <td className='w-1/10 px-2 '>Qut.</td>
                            <td className='w-1/10 px-2 '>Amount</td>
                           
                            
                        </tr>
                    </tbody>
                </table>
    </div>
    <div className=' max-h-[calc(100vh-400px)] overflow-auto  p-2 w-full'>
    {cardArray.map((item:any, index:any) => {
        // Generate a unique key for each item
        const uniqueKey = `${item.snumber}-${index}`;


        return (
            <div key={uniqueKey} className="  rounded-lg overflow-auto">
                <table className="table-auto w-full">
                    <tbody>
                        <tr className="flex w-full justify-between border-b-2 border-slate-300  text-sm">
                            
                            <td className='w-5/10 px-2 '>{item.snumber}</td>
                            <td className='w-1/10 px-2 '>{(item.selectedValue).toFixed(2)}</td>
                            <td className='w-1/10 px-2 '>{item.NoOfItems}</td>
                            <td className='w-1/10 px-2 '>{(item.Amount).toFixed(2)}</td>
                            
                        </tr>
                    </tbody>
                </table>
                
            </div>
        );
    })}
    </div>

                          

                          <div className='flex items-center justify-center border-t-2 border-slate-400 mt-5'>
                          
                          <button onClick={closeProcessBill}   className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Close
                          </button>
                          </div>
                          
                          
                        </div>
                      </dialog>
)}

{isVisibleHoldArray && (
                      
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                          <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Hold Customers</p>
                          </div>
                          
                          <div className="max-h-[calc(100vh-50px)] overflow-auto w-full">
    {holdArray.map((item:any, index:any) => {
        const holdCardTitle = item.holdCard.map((cardItem:any) => cardItem.iname).join(', ');
        return (
            <div key={index} className="m-1 rounded-lg overflow-auto">
                <table className="table-auto w-full">
                    <tbody className="border-2 bg-slate-100 border-slate-200 hover:bg-slate-300">
                      <button onClick={()=>processHoldcrat(item.holdTotal,item.holdCard,index)} className=' w-full'>
                      <tr className="flex w-full justify-between px-2 text-sm">
                            <td>{index + 1}</td>
                            <td>{item.holdTotal.toFixed(2)}</td>
                        </tr>
                        <tr className="flex w-full justify-between px-2 text-sm">
                            <td className="w-full overflow-auto text-left">{holdCardTitle}</td>
                        </tr>

                      </button>
                        
                    </tbody>
                </table>
            </div>
        );
    })}
</div>


                          

                          <div className='flex items-center justify-center pt-3 mt-2 border-slate-400 border-t-2'>
                          <button onClick={closeHoldCustomer}   className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Close
                          </button>
                          </div>
                          
                          
                        </div>
                      </dialog>
)}



{isVisibleDeleteItem && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                        <div className='flex flex-col items-center justify-center'>
                                    <div className='text-2xl text-black font-bold mb-5 pb-5 border-b-2 border-slate-400 w-full text-center'>Delete item</div>
                                    <div className='flex justify-between w-full mb-2 font-semibold'>
                                        <span>Item Snumber:</span>
                                        <span>{cardArray[deleteItemSnumber].snumber}</span>
                                    </div>
                                    <div className='flex justify-between w-full mb-2 font-semibold'>
                                        <span>Item name:</span>
                                        <span>{cardArray[deleteItemSnumber].iname}</span>
                                    </div>
                                    <div className='flex justify-between w-full mb-2 font-semibold'>
                                        <span>No of items:</span>
                                        <span>{cardArray[deleteItemSnumber].NoOfItems}</span>
                                    </div>
                                    <div className='flex justify-between w-full font-semibold'>
                                        <span>Amount:</span>
                                        <span>{cardArray[deleteItemSnumber].Amount.toFixed(2)}</span>
                                    </div>
                                    </div>

                          <div className='flex items-center justify-center mt-5 pt-5 border-t-2 border-slate-400'>
                          <button  onClick={handleCloseDeleteWindow} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            close
                          </button>
                          <button  onClick={deleteItem} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Delete
                          </button>

                          </div>
                          
                          
                        </div>
                      </dialog>
)}

{isVisibleMultiValueAddItem && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-slate-200 py-5 px-10 rounded-lg shadow-md  border-2 border-slate-400 min-w-96 ">
                        <div className='text-2xl text-center text-black font-bold pb-3 mb-3 border-b-2 border-slate-400'>
                              Select The Price
                            </div>
                          <div className='flex items-center justify-center  font-semibold'>
                          {editItem.Values.map((value:any, index:any) => (
                              <div key={index}>
                                <button onClick={()=>handlAddItemOrUpdateToCardWithMultiValue(index)} className="bg-slate-400  text-black hover:bg-slate-600 hover:text-slate-100 p-2 rounded m-2 ">
                                {value.toFixed(2)}
                                </button>
                                </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-center border-t-2 border-slate-400 mt-5">
                          <button onClick={handelCloseUpdateItemMultipleValue} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Close
                          </button>
                          </div>
                          
                          
                        </div>
                      </dialog>
)}

{isVisiblePayMethod && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                          <div className='text-2xl text-black font-bold text-center mb-5 pb-5 border-b-2 border-slate-400'>
                          Select The Payment Method
                          </div>
                          <div className="font-semibold text-center  m-1 p-1 pb-4 mb-4 flex justify-between border-b-2 border-slate-300">
                              Total
                              {!isWithdrawPoint && (<h1>{total.toFixed(2)}</h1>)}
                              {isWithdrawPoint && (<h1>{(total-maxWithdrawPoint).toFixed(2)}</h1>)}
                              
                            </div>
                          <div className='flex items-center justify-center'>
                            {paymentMethod.map((method) => (
                              <div key={method}>
                                <button  onClick={()=>navigateToPatMethod(method)}className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">{method}</button>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-center mt-5 pt-5 border-t-2 border-slate-400">
                          <button onClick={closePayMethod} className=" bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                          
                            Close
                          </button>
                          </div>
                          
                          
                        </div>
                      </dialog>
)}

{isVisiblePayMethodcash && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                      <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                      <button  onClick={backToPayMethodInCash} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                        Back
                       </button>
                       <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Pay Cash</p>
                          </div>
                        
                        <div className='flex justify-between items-center font-semibold'>
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
                        <div className='flex justify-between items-center font-semibold'>
                          <p>Cash :</p>
                        <input className='m-1  rounded border-2 border-slate-400 text-right focus:outline-none'
                          type="number"
                          min={0.00}
                          onChange={(e) => {
                            setPayAmount(Number(e.target.value));
                            setError('');
                          }}
                        />
                        </div>
                        <div className='w-full text-sm text-center h-5'>
                        {errorOnPayCash && <p className="text-red-500">{errorOnPayCash}</p>}
                        </div>
                        <div className='flex justify-center items-center mt-2 pt-5 border-t-2 border-slate-400'>
                        <button onClick={handlePayCash} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                          Pay
                        </button>
                        <button  onClick={payCashClose} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                          Close
                        </button>
                        </div>
                      </div>
                    </dialog>
)}

{isVisiblePayMethodCard && (
                    <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                      <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                      <button  onClick={backToPayMethodInCard} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                        Back
                       </button>
                       <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Pay Card</p>
                          </div>
                        <div className='flex justify-between items-center font-semibold'>
                          <p>Total :</p>
                          {isWithdrawPoint && (
                            <p className='px-4'>{(total-maxWithdrawPoint).toFixed(2)}</p>
                          )}
                          {!isWithdrawPoint && (
                            <p className='px-4'>{total.toFixed(2)}</p>
                          )}
                          
                        </div>
                        <div className='flex justify-between items-center font-semibold'>
                          <p>card last 4 digit :</p>
                        <input className='m-1  rounded border-2 border-slate-400 text-right focus:outline-none'
                          type="number"
                          min={0}
                          onChange={(e) => {
                            SetCardNumber(Number(e.target.value));
                            setError('');
                          }}
                        />
                        </div>
                        <div className='w-full text-sm text-center h-5'>
                        {errorOnPayCard && <p className="text-red-500">{errorOnPayCard}</p>}
                        </div>
                        <div className='flex justify-center items-center mt-2 pt-5 border-t-2 border-slate-400'>
                        <button onClick={handlePayCard} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                          Pay
                        </button>
                        <button  onClick={payCardhClose} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                          Close
                        </button>
                        </div>
                      </div>
                    </dialog>
)}

{isVisiblePayMethodBank && (
                    <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                      <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                      <button  onClick={backToPayMethodInBank} className=" bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                        Back
                       </button>
                       <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Online Bank Transfer</p>
                          </div>
                        
                        <div className='flex justify-between items-center font-semibold'>
                          <p>Total :</p>
                          {isWithdrawPoint && (
                            <p className='px-4'>{(total-maxWithdrawPoint).toFixed(2)}</p>
                          )}
                          {!isWithdrawPoint && (
                            <p className='px-4'>{total.toFixed(2)}</p>
                          )}
                          
                        </div>
                        <div className='flex justify-between items-center font-semibold'>
                          <p>Transfer number :</p>
                        <input className='m-1  rounded border-2 border-slate-400 text-right focus:outline-none'
                          type="number"
                          min={0}
                          onChange={(e) => {
                            setTransferID(Number(e.target.value));
                            setError('');
                          }}
                        />
                        </div>
                        <div className='w-full text-sm text-center h-5'>
                        {errorOnPayBank && <p className="text-red-500">{errorOnPayBank}</p>}
                        </div>
                        <div className='flex justify-center items-center mt-2 pt-5 border-t-2 border-slate-400'>
                        <button onClick={handlePayBank} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                          Pay
                        </button>
                        <button  onClick={payBankClose} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                          Close
                        </button>
                        </div>
                      </div>
                    </dialog>
)}

{isVisiblePayMethodCheque && (
                    <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                      <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                      <button  onClick={backToPayMethodInCheque} className=" bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                        Back
                       </button>
                       <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Cheque Payment</p>
                          </div>
                      
                        <div className='flex justify-between items-center font-semibold'>
                          <p>Total :</p>
                          {isWithdrawPoint && (
                            <p className='px-4'>{(total-maxWithdrawPoint).toFixed(2)}</p>
                          )}
                          {!isWithdrawPoint && (
                            <p className='px-4'>{total.toFixed(2)}</p>
                          )}
                          
                        </div>
                        <div className='flex justify-between items-center font-semibold'>
                          <p>Transfer number :</p>
                        <input className='m-1  rounded border-2 border-slate-400 text-right focus:outline-none'
                          type="number"
                          min={0}
                          onChange={(e) => {
                            setChequeNumber(Number(e.target.value));
                            setError('');
                          }}
                        />
                        </div>
                        <div className='w-full text-sm text-center h-5'>
                        {errorOnPayCheque && <p className="text-red-500">{errorOnPayCheque}</p>}
                        </div>
                        <div className='flex justify-center items-center mt-2 pt-5 border-t-2 border-slate-400'>
                        <button onClick={handlePayCheque} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                          Pay
                        </button>
                        <button  onClick={payChequeClose} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                          Close
                        </button>
                        </div>
                      </div>
                    </dialog>
)}

{isVisibleLoyalCustomer && (
  <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
    <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
      <p className="text-2xl text-black font-bold mb-5 pb-5 border-b-2 border-slate-400 w-full text-center">Add Loyal Customer</p>

      <div className="flex justify-between items-center font-semibold">
        <p>TP:</p>
        <input
          className="m-1  rounded border-2 border-slate-400 text-right focus:outline-none"
          type="number"
          onChange={(e) => {
            setCustomerTP(Number(e.target.value));
            setError(''); 
          }}
        />
      </div>
          <div className='w-full text-sm text-center h-5'>
          {error && <p className="text-red-500 text-center">{error}</p>}
          </div>
      

      <div className="flex justify-center items-center mt-2 pt-5 border-t-2 border-slate-400">
      <button onClick={habdleQuickPayOnAddLoyalCustomer} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
          Quick Pay
        </button>
        <button
          onClick={() => {
            if (String(customerTP).length !== 10) {
              setError('Please enter a 10-digit TP number.');
            } else {
              setError(''); // Clear any previous error
              getCustomerDetails(null,customerTP ); // Call the next function
            }
          }}
          className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4"
        >
          Next
        </button>
        <button onClick={handleCloseOnAddLoyalCustomer} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
          close
        </button>
      </div>
    </div>
  </dialog>
)}



{isVisibleaddNewLoyalCustomer && (
  <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
    <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
      <button onClick={handleBackOnAddNewLoyalCustomer} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
        Back
      </button>
      <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Add New Loyal Customer</p>
                          </div>
      

      <div className="flex justify-between items-center font-semibold">
        <p>Name:</p>
        <input
          className="m-1  rounded border-2 border-slate-400 text-right focus:outline-none"
          type="text" 
          onChange={(e) => {
            setNewCustomerName(e.target.value);
            setError(''); 
          }}
        />
      </div>
      <div className='w-full text-sm text-center h-5'>
      {error && <p className="text-red-500 text-center">{error}</p>}
                        </div>

      

      <div className="flex justify-center items-center mt-2 pt-5 border-t-2 border-slate-400">
      <button  onClick={handleQuickPayOnAddNewLoyalCustomer} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4"
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
          className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4"
        >
          Next
        </button>
        
      </div>
      
    </div>
  </dialog>
)}

{isVisibleLogOut && (
        <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 mt-6 z-50">
        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
      
          
          <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Confirm The Log Out</p>
                          </div>
          
          <div className="flex items-center justify-center">
          <button onClick={handleCancelLogOut} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
            Cancel
          </button>
          <button onClick={handleConfirmLogOut} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
            Log Out
          </button>
          </div>
          
        </div>
      </dialog>
      )}

{isVisibleConfirmAddNewCustomerDetails && (
  <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
    <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
    <div className='text-2xl text-black font-bold mb-5 pb-5 border-b-2 border-slate-400 w-full text-center'>
      Confirm New Loyal Customer</div>

      <div className='flex justify-between w-full mb-2 font-semibold'>
                                        <span>Phone number:</span>
                                        <span>{customerTP}</span>
                                    </div>

                                    <div className='flex justify-between w-full mb-2 font-semibold'>
                                        <span>Customer name:</span>
                                        <span>{newCustomerName}</span>
                                    </div>
      
      

      

      

      <div className="flex items-center justify-center mt-5 pt-5 border-t-2 border-slate-400">
        <button onClick={handleNextOnConfirmNewLoyalCustomer} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
          Next
        </button>
        <button onClick={handleEditOnConfirmNewLoyalCustomer}  className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2"
        >
          Edit
        </button>
      </div>
      
    </div>
  </dialog>
)}





{isVisible && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                        <div className='text-2xl text-black font-bold mb-5 pb-5 border-b-2 border-slate-400 w-full text-center'>
                        Conferm The Remove Bill</div>
                          
                          <div className="flex items-center justify-center">
                          <button onClick={cancelPopup} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Close
                          </button>
                          <button onClick={closePopup} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Remove Bill
                          </button>
                          </div>
                          
                        </div>
                      </dialog>
)}

{isConfermLoyalNumber && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                        <div className='text-2xl text-black font-bold mb-5 pb-5 border-b-2 border-slate-400 w-full text-center'>
                        Confirm Loyal Customer Details</div>

                        <div className='flex justify-between w-full mb-2 font-semibold'>
                                        <span>Phone number:</span>
                                        <span>{customerTP}</span>
                                    </div>

                                    <div className='flex justify-between w-full mb-2 font-semibold'>
                                        <span>Customer name:</span>
                                        <span>{loyalCustomerDetails.name}</span>
                                    </div>
                          
                          
                          
                          <div className="flex items-center justify-center mt-5 pt-5 border-t-2 border-slate-400">
                          <button onClick={handleConfirmOnConfirmTheLoyalNumber} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Confirm
                          </button>
                          <button onClick={handleEditInConfermLoyalNumber} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            Change Customer
                          </button>
                          </div>
                          
                        </div>
                      </dialog>
)}

{isCollectOrWithdraw && (
                      <dialog open className=" h-full w-full popup-content fixed inset-0 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-80 z-50">
                        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                        <div className='text-2xl text-black font-bold mb-5 pb-5 border-b-2 border-slate-400 w-full text-center'>
                        Loyalty Point Panel</div>
                      
                          
                          <div className="flex items-center justify-center">
                          <button onClick={()=>handleCollectPoint("c")} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
                            <div className='items-center'><img className="h-8 w-8 mx-8 my-1 " src={starIcon} alt="points" /></div>
                            <p>{collectPoint.toFixed(2)}</p>
                            <p>Collect</p>
                            <p>Points</p>

                          </button>
                          <button onClick={()=>handleCollectPoint("w")} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded m-2">
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
                        <div className="bg-slate-200 p-4 rounded-lg shadow-md  border-2 border-slate-400 min-w-96">
                        <div className='flex items-center justify-center mb-5 pb-5 border-b-2 border-slate-400'>
                          <p className="text-2xl text-black font-bold">Edit Item</p>
                          </div>
                          
                          <div className='flex justify-between items-center font-semibold'>
                            <span>sNumber :</span>
                            <span>{cardArray[itemInndex].snumber}</span>
                          </div>
                          <div className='flex justify-between items-center font-semibold'>
                            <span>Item :</span>
                            <span>{cardArray[itemInndex].iname}</span>
                          </div>
                          <div className='flex justify-between items-center font-semibold'>
                            <span>Amount :</span>
                            <span>{cardArray[itemInndex].Amount.toFixed(2)}</span>
                          </div>
                          <div className='flex justify-between items-center font-semibold'>
                          <p>Items quntity :</p>
                          <input className='m-1  rounded border-2 border-slate-400 text-right focus:outline-none'
                            type="number"  
                            defaultValue={cardArray[itemInndex].NoOfItems}
                            
                            onChange={(e)=>{
                              setNoOfitem(Number(e.target.value));
                              setError('');
                            }}
                            min={1}
                          />
                        
                        </div>
                        <div className='w-full text-sm text-center h-5'>
          {error && <p className="text-red-500 text-center">{error}</p>}
          </div>
                        

                        <div className='flex justify-center items-center mt-2 pt-5 border-t-2 border-slate-400'>
                          <button onClick={()=>{
                            if(noOfitem<1){
                              setError('Minimum item quntity is 1');
                            }else{
                              setError('')
                              setNoOfitem(cardArray[itemInndex].NoOfItems)
                              successPopupEditItem();

                            }
                          }
                            
                            
                        } className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                            Edit item
                          </button>
                          <button onClick={cancelPopupEditItem} className="bg-slate-400 hover:bg-slate-600 text-black hover:text-slate-100 font-semibold p-2  rounded mx-4">
                            Close
                          </button>
                          </div>
                        </div>
                      </dialog>
)}

      <div className="fixed top-0 left-0 right-0    grid grid-cols-1 md:grid-cols-12     h-full ">
        <div className="max-h-[40vh]  md:max-h-[90vh] col-span-12  sm:col-span-7  ">
        <div className="h-7 bg-slate-800 flex items-center ">
                    <StatusBar />
                </div>

          <div className='h-20 w-full mr-4 flex pr-2 overflow-x-auto '>
          <button onClick={handleRemoveBill}>
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
              <div>
                  <img src={sellIcon} className="w-10 h-8 object-contain" alt="New bill" />
              </div>
              <div className="text-center">
                  New Bill
              </div>
          </div>
          </button>
          <button onClick={handleReturn}>
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={returnIcon} className="w-10 h-8 object-contain" alt="Return Icon" />
    </div>
    <div className="text-center">
        Return
    </div>
</div>
          </button>
          <button onClick={handlePayout}>
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={payIcon} className="w-10 h-8 object-contain" alt="Pay Icon" />
    </div>
    <div className="text-center">
        Payout
    </div>
</div>
          </button>
          <button onClick={handleOnClickCoutinue} >
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={coutinueIcon} className="w-10 h-8 object-contain" alt="Coutinue Icon" />
    </div>
    <div className="text-center">
        Coutinue
    </div>
</div>
          </button>

          <button onClick={handleReports} >
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={reportIcon} className="w-10 h-8 object-contain" alt="Report Icon" />
    </div>
    <div className="text-center">
        Reports
    </div>
</div>
          </button>

          <button onClick={handleCashier}>
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={userIcon} className="w-10 h-8 object-contain" alt="Cashier Icon" />
    </div>
    <div className="text-center">
        Cashier
    </div>
</div>
          </button>
          <button onClick={handleMaximize} >
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={maximiseIcon} className="w-10 h-8 object-contain" alt="Maximise Icon" />
    </div>
    <div className="text-center">
        Maximize
    </div>
</div>
          </button>

          <button onClick={handleRestore} >
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={restoreIcon} className="w-10 h-8 object-contain" alt="Restore Icon" />
    </div>
    <div className="text-center">
        Restore
    </div>
</div>
          </button>
          <button onClick={handleMinimize} >
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={minimizeIcon} className="w-10 h-8 object-contain" alt="Maximise Icon" />
    </div>
    <div className="text-center">
        Minimize
    </div>
</div>
          </button>

          <button onClick={handleLogOut} >
          <div className="w-20 h-16 border-r-2 border-slate-200 flex flex-col items-center justify-center p-2">
    <div>
    <img src={logOutIcon1} className="w-10 h-8 object-contain" alt="Maximise Icon" />
    </div>
    <div className="text-center">
        Log out
    </div>
</div>
          </button>




          

          
          

          

          
          
          

            
            

          </div>

          <div className="flex w-full items-stretch border-2 border-r-0 border-slate-400  ">
                <input type="text"
                        className="w-full  h-10 px-3 bg-gray-100  focus:outline-none focus:border-none"
                        placeholder="Search for products (Name, SKU or Barcode)"
                        onChange={(e)=>{
                          setSearchItem(e.target.value)
                        }}
                />
                <button type="button" className="w-20 h-10 border-r-2 border-slate-400 bg-slate-200 flex items-center justify-center hover:bg-slate-400 transition duration-150"><img src={searchIcon} className="w-6" alt="Search" /></button>
            </div>




          
          
          <div className=' max-h-[calc(100vh-180px)]  overflow-auto   '>
          
          
          
          <div className="grid grid-cols-12  gap-8 p-6">
          
          {searchItems.map((item:any)=>(
            <div className='col-span-4 lg:col-span-3 xl:col-span-3 flex items-center justify-center'>
              <button onClick={()=>handleEnter(item.snumber)} className="hover:bg-slate-200 transition duration-150">
                  <div className="mb-2">
                      <img src={
                        (item.thumbnail)? `https://pos-server.namisweb.lk/api/v1/product-manager/products/get-thumbnail?image_file=${item.thumbnail}` : plant2
                      } alt={plant2} className="w-full aspect-square object-contain" />
                  </div>
                  <div className="text-center line-clamp-2 overflow-hidden">
                      {item.name}
                  </div>
              </button>
          </div>
            ))

          }

      </div>
          </div>
          

          
        </div>


        <div className=" h-full col-span-12 md:col-span-5    bg-slate-200 ">
        <div className=" text-center font-bold   flex item-center justify-center h-7 bg-gray-800">
        
    </div>


        <div className=" text-center font-bold m-1 p-1  flex item-center justify-center">
        <div>Bill Area</div>
    </div>
    
    {/*<div className=" text-center mx-4 p-1  flex justify-between  ">
        <h3 className='font-bold'>Total</h3>
        <h1>{total.toFixed(2)}</h1>
    </div>*/}

    <div className='border-b-2 border-slate-400 '>
                  <table className="w-full mx-4 h-20 pb-1">
                    <tr>
                        <td className="py-1"><strong>Date:</strong> {formattedDate}</td>
                        <td className="py-1"><strong>Cashier ID:</strong> {cashierID}</td>
                    </tr>
                    <tr>
                        <td className="py-1"><strong>Time:</strong> {formattedTime}</td>
                        <td className="py-1"><strong>Bill No:</strong> 123234</td>
                    </tr>
                    
                </table>
    </div>

    






    <div>
      
    </div>
    <div className=' overflow-auto max-h-[calc(100vh-370px)] ml-4'>

      {/* Display cardArray */}
    
    {cardArray.map((item:any, index:any) => {
        // Generate a unique key for each item
        


        return (
            <div key={index} >
                <table className="table-auto w-full ">
                    <tbody className=' border-b-2 text-sm  border-slate-400'>
                        <tr className="flex w-full justify-between">
                            <td className='w-4/10  '>{index+1}. {item.iname}</td>
                            <td className='w-3/10 mr-4 '>{item.snumber}</td>
                            
                            
                             <td className='w-4/10 '>
                            
                           <button  onClick={() => handleEditItem(index)} className="    p-1  border-2 border-slate-400 mx-1 hover:bg-slate-400 transition duration-150"><img className="h-4 w-4  " src={editIcon} alt="Delete" /></button>
                            <button onClick={() => handleDeleteItem(index)} className=" p-1 mx-1 border-2 border-slate-400 hover:bg-slate-400 transition duration-150 "><img className="h-4 w-4 " src={deleteIcon} alt="Delete" /></button>
                            </td>
                        </tr>
                        <tr className="flex w-full justify-between ">
                            <td className='w-1/4  text-right '>{item.selectedValue.toFixed(2)}</td>
                            
                            <td className='w-1/4 text-right '>{item.NoOfItems}</td>
                            <td className='w-1/4 text-right '> {item.discount.toFixed(2)}</td>
                            <td className='w-1/4 text-right mr-4'>{item.Amount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
            </div>
        );
    })}
        
    </div>

   


    <div className='fixed bottom-0  w-5/12'>
    <div className="flex  justify-between     w-full ">
            <input className='w-full     focus:outline-none border-2 border-gray-400'
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Barcode"
            />
            {/*<button className="bg-blue-500 rounded p-2 m-1 " onClick={handleEnter}>Add Item</button>
            <button className="bg-yellow-500  rounded p-2 m-1 " onClick={handleClear}>Clear</button>*/}
            <button onClick={()=>handleEnter(inputText)} className="w-12 h-12  border-2 border-l-0 border-gray-400 bg-slate-200 flex items-center justify-center hover:bg-slate-400 transition duration-150"><img src={addIcon} className="w-6 h-6 " alt="Search" /></button>
            
            
          </div>
          <div className="flex items-center justify-center h-5">
          {error && <p className="text-red-500 text-center">{error}</p>}
          </div>


          <div className="action-buttons gap-1 grid grid-cols-2 divide-x bg-slate-100 pt-1  ">
                <button onClick={handleRemove} className="p-1  bg-slate-200  w-full hover:bg-slate-400 transition duration-150 flex items-center justify-center "><img src={deleteIcon} className="w-5 mr-2 py-2" alt="Add customer" />  Cancel</button>
                <button onClick={handleHold} className="p-1  bg-slate-200  w-full hover:bg-slate-400 transition duration-150 flex items-center justify-center "><img src={holdIcon} className="w-5 mr-2 py-2" alt="Add customer" /> Hold</button>
                <button onClick={handlePayButton} className="p-1  bg-slate-200  w-full hover:bg-slate-400 transition duration-150 flex items-center justify-center  col-span-2"><img src={payIcon} className="w-5 mr-2 py-3" alt="Add customer" />  Pay</button>
            </div>
            <div className="text-center text-xl font-bold py-2 bg-slate-800 text-white">
                Total: {(total).toFixed(2)}
            </div>
    </div>
    
<div>
  
</div>


</div>

      </div>

      

      
    </div>
    </BarcodeScannerProvider> 

);
};

export default Bill;
