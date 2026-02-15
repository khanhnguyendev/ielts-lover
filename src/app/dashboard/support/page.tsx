"use client"

import * as React from "react"
import {
    Mail,
    MessageSquare,
    Send,
    HelpCircle,
    FileQuestion,
    LifeBuoy,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function SupportPage() {
    const [submitted, setSubmitted] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
    }

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-outfit">Support & Help</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[40px] border p-10 space-y-8 shadow-sm">
                        <h3 className="text-xl font-black font-outfit">Need help?</h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                            Our team is here to help you with any questions or technical issues you might have.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Email Us</p>
                                    <p className="text-sm font-bold">support@ielts-lover.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 transition-transform group-hover:scale-110">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Live Chat</p>
                                    <p className="text-sm font-bold">Available 24/7 for Premium</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-[32px] border border-primary/10 p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                            <HelpCircle className="h-16 w-16 text-primary" />
                        </div>
                        <h4 className="text-sm font-black font-outfit">Knowledge Base</h4>
                        <p className="text-xs text-muted-foreground font-medium">Browse our detailed guides and FAQs to find quick answers.</p>
                        <Button variant="outline" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">
                            Browse FAQ
                        </Button>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm flex flex-col h-full min-h-[600px]">
                        {submitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20">
                                    <Send className="h-10 w-10 text-white translate-x-1" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black font-outfit">Message Sent!</h3>
                                    <p className="text-muted-foreground font-medium">We've received your inquiry and will get back to you within 24 hours.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSubmitted(false)}
                                    className="h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest"
                                >
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black font-outfit">Send us a message</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Complete the form below and we'll reply as soon as possible.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">Full Name</label>
                                            <Input
                                                required
                                                placeholder="e.g. John Doe"
                                                className="h-14 bg-[#F9FAFB] border-muted-foreground/20 rounded-2xl px-6 font-medium focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">Email Address</label>
                                            <Input
                                                required
                                                type="email"
                                                placeholder="e.g. john@example.com"
                                                className="h-14 bg-[#F9FAFB] border-muted-foreground/20 rounded-2xl px-6 font-medium focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">Subject</label>
                                        <Input
                                            required
                                            placeholder="What can we help you with?"
                                            className="h-14 bg-[#F9FAFB] border-muted-foreground/20 rounded-2xl px-6 font-medium focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">How can we help?</label>
                                        <Textarea
                                            required
                                            placeholder="Please describe your issue or question in detail..."
                                            className="min-h-[200px] bg-[#F9FAFB] border-muted-foreground/20 rounded-[24px] p-6 font-medium focus:ring-primary/20 resize-none scrollbar-hide"
                                        />
                                    </div>

                                    <Button className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                                        Submit Inquiry
                                        <Send className="ml-2 h-5 w-5 fill-white" />
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm mt-10">
                <h3 className="text-2xl font-black font-outfit text-center">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { q: "How does the AI scoring work?", a: "Our AI uses the official IELTS assessment criteria including Lexical Resource and Grammatical Range." },
                        { q: "Can I cancel my subscription?", a: "Yes, you can cancel any time. Since you pay per day, there are no long-term contracts." },
                        { q: "Is the feedback accurate?", a: "Our models are calibrated against thousands of examiner-marked papers to ensure high accuracy." },
                        { q: "Do you offer tutor support?", a: "Premium users get access to the AI Chatbot tutor for 24/7 help." }
                    ].map((faq, i) => (
                        <div key={i} className="space-y-2">
                            <h4 className="text-sm font-black font-outfit text-primary">{faq.q}</h4>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
