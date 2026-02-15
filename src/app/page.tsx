"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Mic2,
  Wand2,
  Star,
  ChevronRight,
  Play,
  ShieldCheck,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="h-24 border-b flex items-center justify-between px-10 sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white text-xl font-black">L</span>
          </div>
          <span className="text-xl font-black font-outfit tracking-tight">IELTS Lover</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <Link href="/dashboard/writing" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Writing</Link>
          <Link href="/dashboard/speaking" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Speaking</Link>
          <Link href="/dashboard/samples" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Sample Hub</Link>
          <Link href="/dashboard/pricing" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-bold px-6 h-12 rounded-xl">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white h-12 px-8 rounded-xl font-black text-sm shadow-xl shadow-primary/20">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-10 text-center space-y-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="h-3 w-3 fill-current" />
              AI-Powered IELTS Excellence
            </div>

            <h1 className="text-6xl md:text-8xl font-black font-outfit tracking-tight max-w-5xl mx-auto leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              The smartest way to <span className="text-primary italic">Band 8.0+</span>
            </h1>

            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Get instant, examiner-grade feedback on your Writing and Speaking tasks. Personalized AI coaching that identifies your weaknesses in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link href="/signup">
                <Button size="lg" className="h-20 px-12 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                  Start Practice Now
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/dashboard/samples">
                <Button variant="outline" className="h-16 px-10 rounded-[28px] border-slate-200 text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  View Sample Reports
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-[#F9FAFB] py-32 border-y border-slate-100/50">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: FileText,
                  title: "Writing Mastery",
                  desc: "Academic and General Task 1 & 2. Get CEFR-coded feedback on every sentence.",
                  color: "bg-purple-50 text-purple-600"
                },
                {
                  icon: Mic2,
                  title: "Speaking Coach",
                  desc: "Interactive Part 1-3 practice with Catbot. Real-time pronunciation & fluency analysis.",
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  icon: Wand2,
                  title: "AI Rewriter",
                  desc: "Instantly transform your rough drafts into Band 9.0 academic masterpieces.",
                  color: "bg-emerald-50 text-emerald-600"
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white rounded-[40px] p-10 border transition-all hover:shadow-2xl hover:shadow-primary/5 group">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110", feature.color)}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black font-outfit mb-4">{feature.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8">{feature.desc}</p>
                  <Link href="/signup" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-primary hover:gap-2 transition-all">
                    Explored Mode <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Report Showcase (Preview) */}
        <section className="py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">
                <Cpu className="h-3 w-3" />
                Intelligent Analysis
              </div>
              <h2 className="text-5xl font-black font-outfit tracking-tight leading-[1.1]">
                Feedback as detailed as a <span className="text-primary italic">Real Examiner</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Our AI models are trained on thousands of band 8.0-9.0 examples. We don't just score; we explain exactly why you got that score and how to improve.
              </p>

              <div className="space-y-4 pt-4">
                {[
                  "CEFR-coded vocabulary analysis",
                  "Sentence-by-sentence grammar correction",
                  "Fluency and pronunciation heatmaps",
                  "Coherence and cohesion structural advice"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Preview Card Mockup */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/10 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="bg-white rounded-[48px] border-8 border-white shadow-2xl overflow-hidden relative">
                <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Star className="h-6 w-6 text-white fill-white" />
                      </div>
                      <div>
                        <h4 className="font-black font-outfit">Band 8.5</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Overall Score</p>
                      </div>
                    </div>
                    <div className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                      Expert Reviewed
                    </div>
                  </div>

                  <div className="space-y-4 p-8 bg-[#F9FAFB] rounded-[32px] border">
                    <p className="text-lg leading-relaxed font-outfit">
                      The <span className="text-primary border-b-4 border-primary/20">illustrative chart</span> clearly
                      <span className="text-emerald-500 mx-1">depicts</span> the patterns of...
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest">C1 Lexical</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Natural Path</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-[28px] border text-center">
                      <div className="text-2xl font-black font-outfit">9.0</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Vocabulary</div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[28px] border text-center">
                      <div className="text-2xl font-black font-outfit">8.0</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Grammar</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-32 px-10">
          <div className="max-w-7xl mx-auto h-[600px] bg-slate-900 rounded-[64px] relative overflow-hidden flex flex-col items-center justify-center text-center p-10 group">
            <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <Sparkles className="h-64 w-64 text-primary" />
            </div>
            <div className="absolute bottom-0 left-0 p-20 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-180">
              <Sparkles className="h-64 w-64 text-primary" />
            </div>

            <div className="relative z-10 space-y-10 max-w-3xl">
              <h2 className="text-5xl md:text-7xl font-black font-outfit text-white tracking-tight leading-none">
                Ready to stop guessing and <span className="text-primary">start growing?</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium">
                Join 10,000+ students who improved their IELTS scores by an average of 1.5 bands using our AI platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                <Link href="/signup">
                  <Button size="lg" className="h-20 px-12 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-2xl shadow-primary/30">
                    Create Free Account
                  </Button>
                </Link>
                <span className="text-slate-500 font-bold text-sm">No credit card required.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-20 bg-white">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white text-base font-black">L</span>
              </div>
              <span className="text-lg font-black font-outfit tracking-tight">IELTS Lover</span>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-sm leading-relaxed">
              Empowering students worldwide with AI-driven testing and personalized educational paths for IELTS success.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 leading-none mb-2">Platform</h4>
            <ul className="space-y-4">
              {["Writing Guide", "Speaking Coach", "Score Calculator", "IELTS Samples"].map(link => (
                <li key={link}>
                  <Link href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 leading-none mb-2">Company</h4>
            <ul className="space-y-4">
              {["About Us", "Contact Support", "Privacy Policy", "Terms of Use"].map(link => (
                <li key={link}>
                  <Link href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-10 pt-20 mt-20 border-t flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            &copy; 2026 IELTS Lover. Built with ❤️ for students.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Platform</span>
            </div>
            <div className="text-muted-foreground/40 hover:text-primary transition-colors">
              <Play className="h-4 w-4 fill-current" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
