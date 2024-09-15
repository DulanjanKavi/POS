

export default function UpdatesTab({userData}:{userData:any}){
    return (
        <div className="w-full h-screen flex flex-col items-center p-4 overflow-y-auto overflow-x-clip">
            
            <div className="mb-4 py-4 font-bold text-lg">
                Updates
            </div>
            <div className="mb-4 py-4 font-bold text-4xl">
                Cloud POS Desktop
            </div>
            <div className="mb-4 py-4">
                <p>Version: 1.0.0</p>
                <p>Author: <a href="#" className="text-blue-500 hover:underline">Author</a></p>
            </div>

            <div className="w-full mt-auto text-sm">
                <a href="#" className="text-blue-500 hover:underline">User Manual</a> <br />
                <a href="#" className="text-blue-500 hover:underline">Online Help</a>
            </div>
        </div>
    )
}