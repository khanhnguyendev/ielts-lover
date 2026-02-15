export function Header() {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
            <h1 className="text-xl font-semibold text-gray-800">Admin Console</h1>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Administrator</span>
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    A
                </div>
            </div>
        </header>
    );
}
