import { useEffect, useState } from "react";
import SyncToolTab from "../component/Settings/SyncToolTab";
import AboutTab from "../component/Settings/AboutTab";
import UpdatesTab from "../component/Settings/UpdatesTab";


export default function SettingsPage(){
    const avaliableTabs = ['Company', 'Sync Tool', 'Updates', 'About'];
    const [selectedTab, setSelectedTab] = useState('Company');
    const [userData, setUserData] = useState<any>(null);
    
    useEffect(()=>{
        (window as any).SYNC_TOOL_API.settingsGetUserData().then((data:any) => setUserData(data));
    }, []);

    let tabContent = null;
    if (selectedTab === 'Company') {
        tabContent = (
            <div>
                <h1>Company</h1>
                <p>Company page content</p>
            </div>
        )
    } else if (selectedTab === 'Sync Tool') {
        tabContent = <SyncToolTab />
    } else if (selectedTab === 'Updates') {
        tabContent = <UpdatesTab userData={userData} />
    } else if (selectedTab === 'About') {
        tabContent = <AboutTab />
    }

    return (
        <div className="w-full h-screen flex">
            <div className="min-w-48 bg-blue-800 text-white">
                <ul className="divide-y divide-blue-700">
                    {
                        avaliableTabs.map((tab) => (
                            <li key={tab} onClick={() => setSelectedTab(tab)} className={`px-4 py-2 cursor-pointer hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-700 hover:shadow-inner hover:shadow-blue-700 ${selectedTab === tab ? 'bg-gradient-to-r from-blue-800 to-blue-700 shadow-inner shadow-blue-700' : ''}`}>{tab}</li>
                        ))
                    }
                </ul>
            </div>
            <div className="w-full flex flex-col">
                { tabContent }
            </div>
        </div>
    )
}