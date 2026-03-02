import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Shield, CalendarDays, Users, ClipboardList, Settings, Check, Menu, ArrowRight } from "lucide-react";

export default function OnTimeLanding() {
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
const handleScroll = () => {
setIsScrolled(window.scrollY > 20);
};
window.addEventListener("scroll", handleScroll);
return () => window.removeEventListener("scroll", handleScroll);
}, []);

const navLinks = [
{ name: "Features", href: "#features" },
{ name: "How It Works", href: "#how-it-works" },
{ name: "Pricing", href: "#pricing" },
{ name: "FAQ", href: "#faq" },
];

const features = [
{
icon: <Shield className="h-6 w-6 text-blue-600" />,
title: "Network-Locked Check-In",
description: "Employees can only mark attendance through registered office routers. We validate the IP on every request, so remote spoofing is impossible."
},
{
icon: <CalendarDays className="h-6 w-6 text-blue-600" />,
title: "Attendance Logs",
description: "Every employee gets a clear view of their daily check-in/out times, monthly summaries, and attendance percentage."
},
{
icon: <Users className="h-6 w-6 text-blue-600" />,
title: "Admin Control Center",
description: "Add employees, assign admin roles, and monitor your entire team's real-time activity from a single dashboard."
},
{
icon: <ClipboardList className="h-6 w-6 text-blue-600" />,
title: "Projects & Task Assignment",
description: "Create projects, break them into tasks, and assign them to the right people. Keep work organized and accountable."
},
{
icon: <Settings className="h-6 w-6 text-blue-600" />,
title: "Deep Configuration",
description: "Set your timezone, office hours, working days, register router IPs, and enable salary deduction rules for late arrivals — all from one settings panel."
}
];

const steps = [
{
num: "01",
title: "Purchase onTime",
description: "You select a plan and complete checkout securely."
},
{
num: "02",
title: "Receive Credentials",
description: "We provision your admin account and send login details instantly."
},
{
num: "03",
title: "Configure Workspace",
description: "Set your timezone, office hours, and register your office router IPs."
},
{
num: "04",
title: "Add Team & Go Live",
description: "Add employees, assign roles, and attendance tracking starts immediately."
}
];

const faqs = [
{
question: "How does the network-locked check-in work?",
answer: "When setting up your workspace, admins register the public IP addresses of the office routers. When an employee attempts to check in via the web app, the system checks their current IP. If it matches a registered router, the check-in is successful. If not, it's rejected."
},
{
question: "What happens if an employee tries to check in from home?",
answer: "The system will instantly reject the request because their home network's IP address will not match the authorized IP addresses configured in your admin settings. Buddy punching and remote spoofing are entirely eliminated."
},
{
question: "Can I register multiple office locations?",
answer: "Yes. Depending on your pricing plan, you can register multiple router IPs. This is perfect for companies with multiple branches or separate departmental buildings."
},
{
question: "How are late-coming deductions calculated?",
answer: "Admins can define specific rules in the configuration panel, setting a threshold of grace minutes (e.g., 15 minutes after official start time). The system auto-flags arrivals beyond this threshold and calculates deductions based on the customized formulas you set."
},
{
question: "What timezone support do you offer?",
answer: "onTime features full global timezone support. During onboarding, you simply select your primary operating timezone. All system timestamps, check-ins, and daily reset cycles automatically adjust to your configured timezone."
},
{
question: "How do I get started after purchasing?",
answer: "Once checkout is complete, we instantly provision your secure admin credentials. You simply log in, navigate to Settings to input your router IPs and office hours, and start inviting your team via email. You can be fully operational in under 5 minutes."
}
];

return (
<div className="scroll-smooth min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

  {/* NAVBAR */}
  <header
    className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-50" : "bg-white"
    }`}
  >
    <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl">
      <a href="#" className="flex items-center gap-2 text-blue-600 transition-opacity hover:opacity-80">
        <Clock className="h-6 w-6 stroke-[2.5]" />
        <span className="text-xl font-bold tracking-tight">onTime</span>
      </a>

      <nav className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
          <a href="#demo">Request Demo</a>
        </Button>
      </nav>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white border-l-blue-100 flex flex-col pt-12">
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-slate-800 hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Separator className="bg-blue-50 my-2" />
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-full">
                <a href="#demo">Request Demo</a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
  
  <main>
    {/* HERO SECTION */}
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-70"></div>
      <div className="absolute top-20 right-0 -z-10 w-[800px] h-[800px] rounded-full bg-blue-50/50 blur-3xl translate-x-1/3"></div>

      <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <div className="max-w-2xl">
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-100 mb-6 px-3 py-1 text-sm font-medium">
              Next-Gen Attendance System
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
              Attendance that works on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">your terms.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              onTime ensures your team checks in only from the office — at the right time, from the right network. No buddy punching. No guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-full text-base">
                <a href="#pricing">Get Started</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-blue-200 text-blue-700 hover:bg-blue-50 h-12 px-8 rounded-full text-base bg-white">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                <Avatar className="w-8 h-8 border-2 border-white"><AvatarFallback className="bg-blue-100 text-blue-700 text-xs">AM</AvatarFallback></Avatar>
                <Avatar className="w-8 h-8 border-2 border-white"><AvatarFallback className="bg-blue-200 text-blue-800 text-xs">JD</AvatarFallback></Avatar>
                <Avatar className="w-8 h-8 border-2 border-white"><AvatarFallback className="bg-blue-600 text-white text-xs">FZ</AvatarFallback></Avatar>
              </div>
              <p>Trusted by 50+ modern teams</p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-blue-100 to-white blur-lg opacity-80"></div>
            
            <div className="relative rounded-3xl border border-blue-100 bg-white/80 backdrop-blur-xl p-6 shadow-2xl shadow-blue-900/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-blue-100 shadow-sm">
                    <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-lg">SA</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900 leading-tight">Sarah Ahmed</h3>
                    <p className="text-sm text-slate-500">Product Designer</p>
                  </div>
                </div>
                <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 flex items-center gap-1">
                  On Time <Check className="h-3 w-3" />
                </Badge>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-6 flex justify-between items-center shadow-inner">
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Checked In</p>
                  <p className="font-mono text-xl font-bold text-blue-600">09:02 AM</p>
                </div>
                <div className="h-10 w-[1px] bg-slate-200"></div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Network</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-blue-500"/> Office-Main
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Attendance</p>
                <div className="flex items-end gap-3 h-24">
                  <div className="w-1/5 bg-blue-100 rounded-t-md h-[80%] hover:bg-blue-200 transition-colors relative group">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">8.5h</div>
                  </div>
                  <div className="w-1/5 bg-blue-600 rounded-t-md h-[95%] shadow-[0_0_15px_rgba(37,99,235,0.4)] relative">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] py-1 px-2 rounded font-medium">9.2h</div>
                  </div>
                  <div className="w-1/5 bg-blue-100 rounded-t-md h-[85%] hover:bg-blue-200 transition-colors relative group">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">8.8h</div>
                  </div>
                  <div className="w-1/5 bg-blue-100 rounded-t-md h-[90%] hover:bg-blue-200 transition-colors relative group">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">9.0h</div>
                  </div>
                  <div className="w-1/5 bg-slate-100 rounded-t-md h-[20%] relative group">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">2.0h</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-400 px-1 pt-1">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* FEATURES SECTION */}
    <section id="features" className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything your team needs to stay on track</h2>
          <p className="text-lg text-slate-600">
            A comprehensive suite of tools designed to ensure accountability, streamline management, and keep operations running smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className={`border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-white ${index === 4 ? 'lg:col-span-2' : ''}`}>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* HOW IT WORKS SECTION */}
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Up and running in minutes</h2>
          <p className="text-lg text-slate-600">
            No complicated installations. No lengthy onboarding. Just pure efficiency from day one.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-0 w-full h-[2px] bg-blue-50"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 ring-4 ring-white">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-[250px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* PRICING SECTION */}
    <section id="pricing" className="py-24 bg-blue-50/50">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-lg text-slate-600">
            Pay only for what you need. Scale effortlessly as your team grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          <Card className="border-blue-100 shadow-sm bg-white">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold text-slate-900">Starter</CardTitle>
              <CardDescription className="text-slate-500 mt-2">Perfect for small teams starting out.</CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-slate-900">$29</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600 flex-shrink-0" /> Up to 20 employees</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600 flex-shrink-0" /> Attendance tracking</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600 flex-shrink-0" /> Admin dashboard</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600 flex-shrink-0" /> 1 office router limit</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold h-11 rounded-full">
                Get Starter
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-blue-600 shadow-xl shadow-blue-900/10 bg-blue-600 text-white relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-3 py-1 uppercase tracking-wider text-xs font-bold border border-blue-200">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold text-white">Growth</CardTitle>
              <CardDescription className="text-blue-100 mt-2">Everything you need to scale operations.</CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-white">$79</span>
                <span className="text-blue-200 font-medium">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm text-blue-50">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-white flex-shrink-0" /> Up to 100 employees</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-white flex-shrink-0" /> All Starter features</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-white flex-shrink-0" /> Project & task management</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-white flex-shrink-0" /> Up to 5 office routers</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-white flex-shrink-0" /> Salary deduction rules</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold h-11 rounded-full">
                Get Growth
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-blue-100 shadow-sm bg-white">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold text-slate-900">Enterprise</CardTitle>
              <CardDescription className="text-slate-500 mt-2">Custom built for large organizations.</CardDescription>
              <div className="mt-6 flex items-center h-12">
                <span className="text-3xl font-bold text-slate-900">Custom Pricing</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600 flex-shrink-0" /> Unlimited employees</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600 flex-shrink-0" /> Unlimited office routers</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600 flex-shrink-0" /> Dedicated support team</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600 flex-shrink-0" /> Custom integrations</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold h-11 rounded-full">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>

    {/* FAQ SECTION */}
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Frequently asked questions</h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about implementing onTime for your business.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-slate-200 rounded-xl px-6 bg-slate-50/50">
              <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-blue-600 hover:no-underline py-5 text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-5 text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    {/* CONTACT / DEMO SECTION */}
    <section id="demo" className="py-24 bg-blue-600">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to bring order to your attendance?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-md leading-relaxed">
              Book a free demo and see onTime in action. We'll walk you through the admin dashboard and show you how network-locked check-ins work.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Secure & Private</h4>
                  <p className="text-blue-200 text-sm">Enterprise-grade infrastructure.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Expert Onboarding</h4>
                  <p className="text-blue-200 text-sm">Dedicated support to get you live.</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-2xl shadow-slate-900/20 bg-white p-2">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">Request a Demo / Package</CardTitle>
              <CardDescription className="text-slate-500">Fill out the form below and we'll be in touch shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                  <Input id="name" placeholder="Tom Harris" className="h-11 border-slate-200 focus-visible:ring-blue-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-700 font-medium">Company Name</Label>
                    <Input id="company" placeholder="Acme Corp" className="h-11 border-slate-200 focus-visible:ring-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Work Email</Label>
                    <Input id="email" type="email" placeholder="tom@acmecorp.com" className="h-11 border-slate-200 focus-visible:ring-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-700 font-medium">Message (Optional)</Label>
                  <Textarea id="message" placeholder="Tell us about your team size and requirements..." className="min-h-[100px] border-slate-200 focus-visible:ring-blue-600 resize-y" />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold rounded-lg mt-2">
                  Submit Request <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </main>

  {/* FOOTER */}
  <footer className="bg-[#1e3a5f] text-slate-300 py-16">
    <div className="container mx-auto px-4 md:px-8 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-12">
        
        <div className="col-span-1 md:col-span-2">
          <a href="#" className="flex items-center gap-2 text-white mb-6">
            <Clock className="h-7 w-7 stroke-[2.5] text-blue-400" />
            <span className="text-2xl font-bold tracking-tight">onTime</span>
          </a>
          <p className="text-slate-400 max-w-sm leading-relaxed mb-6">
            Attendance that works on your terms. Ensure accountability, eliminate buddy punching, and streamline your workforce management effortlessly.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Product</h4>
          <ul className="space-y-4">
            <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
            <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
            <li><a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Company</h4>
          <ul className="space-y-4">
            <li><a href="#demo" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
            <li><a href="#demo" className="hover:text-blue-400 transition-colors">Request Demo</a></li>
          </ul>
        </div>

      </div>

      <Separator className="bg-slate-700/50 mb-8" />
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© 2026 onTime. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>
);
}