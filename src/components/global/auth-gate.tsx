"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/app/actions"
import { useState } from "react"
import { PulseLoader } from "@/components/global/pulse-loader"

interface AuthGateProps {
    title?: string
    description?: string
    /** If true, renders as a full overlay. If false, renders as an inline card. */
    overlay?: boolean
}

/**
 * AuthGate — shown to guests when they try to use a service-level feature.
 * Preserves the current URL as `from` so the user is redirected back after login.
 */
export function AuthGate({
    title = "Sign in to continue",
    description = "Create a free account to access this feature.",
    overlay = true,
}: AuthGateProps) {
    const pathname = usePathname()
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signInWithGoogle(pathname)
        } catch {
            setIsLoading(false)
        }
    }

    const content = (
        <div className="flex flex-col items-center text-center gap-6 max-w-sm w-full">
            {/* Icon */}
            <div className="relative">
                <div className="w-20 h-20 rounded-[1.75rem] bg-primary/8 border border-primary/15 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-9 h-9 text-primary" />
                </div>
                <div className="absolute -inset-1.5 rounded-[2.25rem] border border-primary/10 animate-pulse" style={{ animationDuration: "3s" }} />
            </div>

            {/* Text */}
            <div className="space-y-2">
                <h3 className="text-xl font-black font-outfit text-slate-900">{title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{description}</p>
            </div>

            {/* Actions */}
            <div className="w-full space-y-3">
                <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-sm gap-3 shadow-lg transition-all duration-300 hover:translate-y-[-1px] hover:shadow-primary/20"
                >
                    {isLoading ? (
                        <PulseLoader size="sm" color="white" />
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {isLoading ? "Redirecting..." : "Continue with Google"}
                        </>
                    )}
                </Button>

                <Link
                    href={`/login?from=${encodeURIComponent(pathname)}`}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all duration-200"
                >
                    <LogIn className="w-4 h-4" />
                    Sign in with email
                </Link>
            </div>

            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Free forever · No credit card required
            </p>
        </div>
    )

    if (!overlay) {
        return (
            <div className="flex items-center justify-center p-8 rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50/50">
                {content}
            </div>
        )
    }

    return (
        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
            {content}
        </div>
    )
}
