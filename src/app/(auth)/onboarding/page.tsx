"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type Step =
    | "welcome"
    | "referral"
    | "location"
    | "purpose"
    | "testType"
    | "history"
    | "targetScore"
    | "examDate"
    | "upsell"

const STEPS: Step[] = [
    "welcome",
    "referral",
    "location",
    "purpose",
    "testType",
    "history",
    "targetScore",
    "examDate",
    "upsell"
]

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = React.useState<Step>("welcome")
    const [formData, setFormData] = React.useState({
        referral: "",
        location: "",
        purpose: "",
        testType: "",
        history: "",
        targetScore: "",
        examDate: undefined as Date | undefined,
        plan: ""
    })

    const stepIndex = STEPS.indexOf(currentStep)
    const progress = ((stepIndex) / (STEPS.length - 1)) * 100

    const nextStep = () => {
        const currentIndex = STEPS.indexOf(currentStep)
        if (currentIndex < STEPS.length - 1) {
            setCurrentStep(STEPS[currentIndex + 1])
        } else {
            router.push("/dashboard")
        }
    }

    const prevStep = () => {
        const currentIndex = STEPS.indexOf(currentStep)
        if (currentIndex > 0) {
            setCurrentStep(STEPS[currentIndex - 1])
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case "welcome":
                return (
                    <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl text-primary">👋</span>
                            </div>
                            <h1 className="text-4xl font-bold font-outfit text-[#1F2937]">Welcome to IELTS Lover!</h1>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                We&apos;re excited to help you achieve your target score. Let&apos;s personalize your experience.
                            </p>
                        </div>
                        <Button onClick={nextStep} size="lg" className="h-12 px-8 rounded-full font-semibold">
                            Get Started <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )

            case "referral":
                return (
                    <SurveyStep
                        title="How did you hear about us?"
                        options={["Social Media", "Friend/Family", "Search Engine", "Online Ad", "Other"]}
                        value={formData.referral}
                        onChange={(v) => setFormData({ ...formData, referral: v })}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                )

            case "location":
                return (
                    <SurveyStep
                        title="Where are you based?"
                        options={["Vietnam", "India", "China", "United Kingdom", "United States", "Other"]}
                        value={formData.location}
                        onChange={(v) => setFormData({ ...formData, location: v })}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                )

            case "purpose":
                return (
                    <SurveyStep
                        title="What is your main purpose for taking IELTS?"
                        options={["Study Abroad", "Immigration", "Work", "Personal Interest", "Other"]}
                        value={formData.purpose}
                        onChange={(v) => setFormData({ ...formData, purpose: v })}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                )

            case "testType":
                return (
                    <SurveyStep
                        title="Which test are you planning to take?"
                        options={["IELTS Academic", "IELTS General Training"]}
                        value={formData.testType}
                        onChange={(v) => setFormData({ ...formData, testType: v })}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                )

            case "history":
                return (
                    <SurveyStep
                        title="Have you taken the IELTS before?"
                        options={["No, this is my first time", "Yes, once", "Yes, multiple times"]}
                        value={formData.history}
                        onChange={(v) => setFormData({ ...formData, history: v })}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                )

            case "targetScore":
                return (
                    <SurveyStep
                        title="What's your target overall band score?"
                        options={["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0+"]}
                        value={formData.targetScore}
                        onChange={(v) => setFormData({ ...formData, targetScore: v })}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                )

            case "examDate":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-2xl font-bold font-outfit text-center">When is your exam date?</h2>
                        <div className="flex justify-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-[280px] h-14 justify-start text-left font-normal rounded-xl border-dashed hover:border-primary transition-colors",
                                            !formData.examDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.examDate ? format(formData.examDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-2xl" align="center">
                                    <Calendar
                                        mode="single"
                                        selected={formData.examDate}
                                        onSelect={(d) => setFormData({ ...formData, examDate: d })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex justify-between items-center max-w-[280px] mx-auto pt-4">
                            <Button onClick={prevStep} variant="ghost" className="text-muted-foreground">
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={nextStep} disabled={!formData.examDate} className="rounded-full px-8">
                                Continue
                            </Button>
                        </div>
                    </div>
                )

            case "upsell":
                return (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold font-outfit">Choose Your Path to Success</h2>
                            <p className="text-muted-foreground">Unlock personalized feedback and full reports with Premium.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PlanCard
                                title="Free"
                                price="$0"
                                features={["5 Daily practice reports", "AI scoring", "Community access"]}
                                selected={formData.plan === "free"}
                                onClick={() => setFormData({ ...formData, plan: "free" })}
                            />
                            <PlanCard
                                title="Premium"
                                price="$19.99/mo"
                                features={["Unlimited reports", "Deep feedback analysis", "Personalized study plan", "Priority support"]}
                                highlight
                                selected={formData.plan === "premium"}
                                onClick={() => setFormData({ ...formData, plan: "premium" })}
                            />
                        </div>

                        <div className="flex flex-col gap-3 max-w-[320px] mx-auto mt-8">
                            <Button
                                onClick={nextStep}
                                disabled={!formData.plan}
                                className={cn("h-12 rounded-full font-bold", formData.plan === "premium" && "bg-primary shadow-xl shadow-primary/20")}
                            >
                                {formData.plan === "premium" ? "Start Premium Trial" : "Continue with Free"}
                            </Button>
                            <Button onClick={prevStep} variant="ghost" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
                                Back
                            </Button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="w-full">
            {currentStep !== "welcome" && currentStep !== "upsell" && (
                <div className="mb-12 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span>Step {stepIndex} of {STEPS.length - 2}</span>
                        <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-muted rounded-full overflow-hidden" />
                </div>
            )}
            <div className="min-h-[400px] flex flex-col justify-center">
                {renderStep()}
            </div>
        </div>
    )
}

function SurveyStep({
    title,
    options,
    value,
    onChange,
    onNext,
    onPrev
}: {
    title: string,
    options: string[],
    value: string,
    onChange: (v: string) => void,
    onNext: () => void,
    onPrev: () => void
}) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold font-outfit text-center leading-tight">{title}</h2>
            <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 gap-3 max-w-[320px] mx-auto">
                {options.map((opt) => (
                    <Label
                        key={opt}
                        className={cn(
                            "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-muted/50",
                            value === opt ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted"
                        )}
                    >
                        <RadioGroupItem value={opt} className="hidden" />
                        <span className={cn("flex-1 text-sm font-medium", value === opt ? "text-primary" : "text-foreground")}>
                            {opt}
                        </span>
                        {value === opt && <Check className="h-4 w-4 text-primary" />}
                    </Label>
                ))}
            </RadioGroup>
            <div className="flex justify-between items-center max-w-[320px] mx-auto pt-4">
                <Button onClick={onPrev} variant="ghost" className="text-muted-foreground">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={onNext} disabled={!value} className="rounded-full px-8">
                    Continue
                </Button>
            </div>
        </div>
    )
}

function PlanCard({
    title,
    price,
    features,
    highlight,
    selected,
    onClick
}: {
    title: string,
    price: string,
    features: string[],
    highlight?: boolean,
    selected: boolean,
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden h-full",
                selected ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : "border-muted hover:border-muted-foreground/30",
                highlight && "bg-gradient-to-br from-primary/[0.02] to-primary/[0.08]"
            )}
        >
            {highlight && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Best Value
                </div>
            )}
            <div className="mb-4">
                <h3 className="text-lg font-bold font-outfit">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{price}</span>
                    {price !== "$0" && <span className="text-xs text-muted-foreground">/ month</span>}
                </div>
            </div>
            <div className="space-y-3 flex-1">
                {features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-primary mt-0.5" />
                        <span className="text-muted-foreground leading-tight">{f}</span>
                    </div>
                ))}
            </div>
        </button>
    )
}
