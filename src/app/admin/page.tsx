export default function AdminDashboard() {
    const stats = [
        { label: "Total Users", value: "1,234", change: "+12%" },
        { label: "Active Exercises", value: "48", change: "+2" },
        { label: "Today's Attempts", value: "156", change: "+24%" },
        { label: "Premium Users", value: "89", change: "+5%" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Add New Exercise
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                        Export Usage Reports
                    </button>
                </div>
            </div>
        </div>
    );
}
