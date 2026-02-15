import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-[440px] z-10">
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="flex items-center gap-2 mb-2">
                        <span className="text-3xl font-bold font-outfit text-primary tracking-tight">IELTS Lover</span>
                    </Link>
                    <div className="flex items-center gap-1.5 opacity-70">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">AI Excellence</span>
                    </div>
                </div>
                {children}
            </div>

            <footer className="mt-8 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                &copy; 2026 IELTS Lover. All rights reserved.
            </footer>
        </div>
    )
}
