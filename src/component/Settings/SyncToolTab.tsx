import { useEffect, useState } from "react";


export default function SyncToolTab(){
    const [status, setStatus] = useState('Stopped');
    const [queue, setQueue] = useState<Array<any>>([]);

    useEffect(() => {
        (window as any).SYNC_TOOL_API.getSyncToolStatus().then((status:boolean) => {
            if (status) {
                setStatus('Running');
            } else {
                setStatus('Stopped');
            }
        }).catch((error:any) => {
            console.error(error);
        });
    }, []);

    useEffect(() => {
        if (status !== "Running") return;
        const handle = () => {
            (window as any).SYNC_TOOL_API.getSyncToolQueue().then((queue:Array<any>) => {
                setQueue(queue);
                console.log(queue);
            }).catch((error:any) => {
                console.error(error);
            });
        }
        const interval = setInterval(handle, 10000);
        handle();

        return () => clearInterval(interval);

    }, [status])

    return (
        <div className="w-full h-screen flex flex-col p-4 overflow-y-auto overflow-x-clip">
            {/** Status tab */}
            <div className="mb-4 py-4 font-bold text-lg">
                Status: {(status === "Running")?<span className="text-green-500">Running</span>:<span className="text-red-500">Stopped</span>}
            </div>
            <div className="mb-4 py-4 flex gap-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => {(window as any).SYNC_TOOL_API.addSyncToolQueue(
                    'get_all_products', 
                    {
                        status: 'all'
                    }
                )} }>Sync All Products</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => {} }>Sync Bills</button>
            </div>

            {

                <table className="w-full table">
                    <thead className="border-b">
                        <tr>
                            <th>ID</th>
                            <th>Action</th>
                            <th>-</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {
                            queue.map((item:any) => (
                                <tr key={item[0]}>
                                    <td className="p-2">{item[0]}</td>
                                    <td className="p-2">{item[1]}</td>
                                    <td className="p-2">-</td>
                                    <td className="p-2">{item[3]}</td>
                                </tr>
                            ))
                        }

                        {
                            (queue.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="text-center p-2">No pending actions</td>
                                </tr>
                            )
                        }
                    </tbody>

                </table>
            }
        </div>
    )
}