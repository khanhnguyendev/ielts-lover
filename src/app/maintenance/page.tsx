import { Construction } from "lucide-react"

export default function MaintenancePage() {
    return (
        <div className="flex flex-col min-h-screen bg-white items-center justify-center px-6">
            <div className="max-w-md text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <Construction className="w-8 h-8 text-amber-600" strokeWidth={2.5} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black font-outfit tracking-tight text-slate-900">
                        Under Maintenance
                    </h1>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        We&apos;re performing scheduled maintenance to improve your experience.
                        Please check back shortly.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white text-lg font-black">L</span>
                    </div>
                    <span className="text-lg font-black font-outfit tracking-tight text-slate-900">IELTS Lover</span>
                </div>

                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    We&apos;ll be back soon
                </p>
            </div>
        </div>
    )
}
