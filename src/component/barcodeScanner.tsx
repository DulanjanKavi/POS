/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * This will check for rapid key presses and will trigger barcode scanning
 * hosts evnt "barcode_scanned" with the barcode as the argument
 */
const BarcodeScannerContext = createContext({
    barcode: "",
    isScanning: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggle_scanning: (_scan:boolean)=>{},
});

export class BarcodeScannerEvent extends Event {
    barcode:string = "";

    constructor(barcode:string){
        super("barcode_scanned");
        this.barcode = barcode;
    }
}


export function BarcodeScannerProvider({children, default_scanner_on}:{children: React.ReactNode, default_scanner_on?:boolean}){
    const [barcode, setBarcode] = useState<string>("");
    const [isScanning, setIsScanning] = useState<boolean>(((default_scanner_on === undefined)?true:default_scanner_on));
    const last_scan_time = useRef<number>(0);
    const current_text = useRef<string>("");

    const toggle_scanning = (scan:boolean) => {
        setIsScanning(scan);
    }

    const timeout_current_text = () => {
        if (Date.now() - last_scan_time.current > 300){
            current_text.current = "";
        }
    }

    const ListenToKeys = useCallback((e:KeyboardEvent)=>{
        if (e.key == "Enter"){
            if (current_text.current && current_text.current.length > 0){
                console.log("Barcode scanned: ", current_text.current);
                document.dispatchEvent(new BarcodeScannerEvent(current_text.current));
                current_text.current = "";
                setBarcode(current_text.current);
            }
        } 
        // check if the key is a letter or number or any other allowed character
        if (e.key && String(e.key).length == 1){
            if (current_text.current && current_text.current.length == 0){
                last_scan_time.current = Date.now();
            }
            current_text.current += e.key;
        }

    }, [current_text]);

    useEffect(() => {
        let interval: NodeJS.Timer | null = null; 
      
        if (isScanning) {
          document.addEventListener("keydown", ListenToKeys);
          interval = setInterval(timeout_current_text, 150);
        }
      
        return () => {
          document.removeEventListener("keydown", ListenToKeys);
          if (interval !== null) {
            clearInterval(Number(interval));
          }
        };
      }, [ListenToKeys, isScanning]);
      

    return (
        <BarcodeScannerContext.Provider value={{
            barcode,
            isScanning,
            toggle_scanning
        }}>
            {children}
        </BarcodeScannerContext.Provider>
    )
}

export function BarcodeScannerButton() {
    const {isScanning, toggle_scanning} = useContext(BarcodeScannerContext);
    // eslint-disable-next-line prefer-const
    let title = (isScanning)?"Barcode Scanner is ON":"Barcode Scanner is OFF";
    const icon_ref = useRef<SVGSVGElement>(null);

    useEffect(()=>{
        if (isScanning){
            const interval = setInterval(()=>{
                icon_ref.current?.classList.add("opacity-20");
                setTimeout(()=>{
                    icon_ref.current?.classList.remove("opacity-20");
                }, 1000);
            }, 2000);
            return ()=>clearInterval(interval);
        }else {
            icon_ref.current?.classList.add("opacity-50");
            return ()=>icon_ref.current?.classList.remove("opacity-50");
        }
    }, [isScanning])
    return (
        <button onClick={()=>{toggle_scanning(!isScanning); console.log(isScanning)}} className=" hover:text-slate-300 rounded relative" title={title}>
            Barcode Scanner {(isScanning) ? "ON" : "OFF"}
        </button>
    )
} 