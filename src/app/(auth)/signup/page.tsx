"use client"

import Link from "next/link"
import { Eye, EyeOff, Check, AlertCircle, MailCheck } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { signInWithGoogle, signUpWithEmail } from "@/app/actions"
import { PulseLoader } from "@/components/global/pulse-loader"

export default function SignupPage() {
    const searchParams = useSearchParams()
    const returnTo = searchParams.get("from") || undefined

    const [showPassword, setShowPassword] = useState(false)
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [isEmailLoading, setIsEmailLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

    const passwordValidation = {
        length: password.length >= 8,
        letter: /[a-zA-Z]/.test(password),
        number: /[0-9]/.test(password),
    }

    const isPasswordValid = Object.values(passwordValidation).every(Boolean)

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        try {
            await signInWithGoogle(returnTo)
        } catch {
            setIsGoogleLoading(false)
        }
    }

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !isPasswordValid) return
        setError(null)
        setIsEmailLoading(true)
        try {
            const result = await signUpWithEmail(email, password, returnTo)
            if (result?.error) {
                setError(result.error)
            } else if (!result) {
                // redirect() was called — component unmounts, nothing to do
            } else {
                // No session yet — email confirmation required
                setAwaitingConfirmation(true)
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsEmailLoading(false)
        }
    }

    if (awaitingConfirmation) {
        return (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-center justify-center mx-auto">
                    <MailCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black font-outfit text-slate-900">Check your email</h1>
                    <p className="text-sm font-medium text-slate-500">
                        We sent a confirmation link to <span className="font-bold text-slate-800">{email}</span>.
                    </p>
                    <p className="text-sm text-slate-400">Click the link to activate your account.</p>
                </div>
                <p className="text-xs text-slate-400">
                    Didn&apos;t receive it?{" "}
                    <button onClick={() => setAwaitingConfirmation(false)} className="text-primary font-semibold hover:underline">
                        Try again
                    </button>
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold font-outfit text-[#1F2937]">Sign Up</h1>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-[#4B5563]">No credit card nor upfront payment required!</p>
                    <p className="text-sm text-muted-foreground">
                        Already a member?{" "}
                        <Link href={returnTo ? `/login?from=${encodeURIComponent(returnTo)}` : "/login"} className="text-primary font-medium hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <Button
                    variant="outline"
                    className="w-full h-12 rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 transition-all font-bold text-slate-800 shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isEmailLoading}
                >
                    {isGoogleLoading ? (
                        <PulseLoader size="sm" color="primary" className="flex-row gap-2" />
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Or sign up with email</span>
                    </div>
                </div>

                <form className="space-y-5" onSubmit={handleEmailSignUp}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">E-mail</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 bg-muted/30 border-muted focus:bg-white transition-all rounded-lg"
                            disabled={isEmailLoading}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-muted/30 border-muted focus:bg-white transition-all pr-12 rounded-lg"
                                disabled={isEmailLoading}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="flex gap-4 mt-2">
                            {[
                                { key: "length", label: "8 characters min." },
                                { key: "letter", label: "1 letter" },
                                { key: "number", label: "1 number" },
                            ].map(({ key, label }) => (
                                <div key={key} className={cn("flex items-center gap-1.5 transition-opacity", passwordValidation[key as keyof typeof passwordValidation] ? "opacity-100" : "opacity-50")}>
                                    <div className={cn("w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all", passwordValidation[key as keyof typeof passwordValidation] ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground")}>
                                        {passwordValidation[key as keyof typeof passwordValidation] && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className="text-[10px] whitespace-nowrap">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 pt-1">
                        <Checkbox id="marketing" className="mt-1 border-muted-foreground/30 data-[state=checked]:bg-primary" />
                        <Label htmlFor="marketing" className="text-xs font-medium leading-relaxed text-muted-foreground select-none">
                            Yes, I want to receive marketing communication from IELTS Lover
                        </Label>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p className="text-xs font-medium">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isEmailLoading || !email || !isPasswordValid}
                        className="w-full h-12 text-base font-semibold rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    >
                        {isEmailLoading ? <PulseLoader size="sm" color="white" /> : "Sign up for free"}
                    </Button>
                </form>
            </div>

            <p className="text-center text-[10px] text-muted-foreground leading-relaxed px-4">
                By signing up, I agree to IELTS Lover&apos;s{" "}
                <Link href="/privacy" className="font-semibold underline underline-offset-2">Privacy Policy</Link> and{" "}
                <Link href="/terms" className="font-semibold underline underline-offset-2">Terms of Service</Link>
            </p>
        </div>
    )
}
