import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  Clock,
  Shield,
  ShieldCheck,
  CalendarDays,
  Users,
  Settings,
  Check,
  Menu,
  ArrowRight,
  Building2,
  Coins,
  User,
  LayoutDashboard,
} from "lucide-react";
import { isTokenValid } from "@/lib/isTokenValid";
import { getHomePath } from "@/lib/getHomePath";
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/Components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/Components/ui/sheet";
import { Separator } from "@/Components/ui/separator";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";

const NAV_LINKS = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Roles", href: "#roles" },
  { name: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    icon: <Building2 className="h-6 w-6 text-cornflower-blue-600" />,
    title: "Isolated Workspaces",
    description:
      "Every company gets its own workspace with a dedicated link, its own employees, schedule and rules. Data is strictly scoped and isolated per company.",
  },
  {
    icon: <Clock className="h-6 w-6 text-cornflower-blue-600" />,
    title: "Smart Check-in / Check-out",
    description:
      "Employees clock in and out against your office hours. Late arrivals, early exits and missing check-outs are flagged automatically.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-cornflower-blue-600" />,
    title: "Network-Locked Check-in",
    description:
      "Register your office router IPs. When enforcement is on, check-in only succeeds from approved networks — no remote spoofing or buddy punching.",
  },
  {
    icon: <CalendarDays className="h-6 w-6 text-cornflower-blue-600" />,
    title: "Office Timings",
    description:
      "Configure a weekly schedule — open and close times for each day — and it is enforced automatically in the company's own timezone.",
  },
  {
    icon: <Coins className="h-6 w-6 text-cornflower-blue-600" />,
    title: "Salary Deductions",
    description:
      "Optional deduction rules for late arrivals, missing check-outs and absences, with a clean monthly net-salary report for every employee.",
  },
  {
    icon: <Settings className="h-6 w-6 text-cornflower-blue-600" />,
    title: "Deep Configuration",
    description:
      "Timezone, office hours, allowed router IPs and deduction rules — everything you need sits in one admin settings panel.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create your workspace",
    description:
      "Register your company in under a minute. We provision an isolated workspace with its own dedicated link.",
  },
  {
    num: "02",
    title: "Set up your admin securely",
    description:
      "Your admin receives a one-time emailed setup link. No passwords in email — ever.",
  },
  {
    num: "03",
    title: "Configure & invite your team",
    description:
      "Set your timezone, office hours, router IPs and deduction rules, then invite employees with secure setup links.",
  },
  {
    num: "04",
    title: "Track from day one",
    description:
      "Check-in/out enforcement, automatic absence marking and monthly salary reports run from the very first day.",
  },
];

const ROLES = [
  {
    icon: <User className="h-6 w-6 text-cornflower-blue-600" />,
    title: "Employee",
    tagline: "A clear view of your own time.",
    points: [
      "Check in / out from the office network",
      "See your daily records and monthly summary",
      "Understand deductions and net salary",
    ],
  },
  {
    icon: <Settings className="h-6 w-6 text-white" />,
    title: "Admin",
    tagline: "Full control of your workspace.",
    points: [
      "Add, edit and remove employees",
      "Configure timezone, office timings, IPs and deductions",
      "Monitor your team's attendance at a glance",
    ],
    highlight: true,
  },
  {
    icon: <LayoutDashboard className="h-6 w-6 text-cornflower-blue-600" />,
    title: "Superadmin",
    tagline: "Manage every company in one place.",
    points: [
      "Create, suspend and delete workspaces",
      "View companies and their teams",
      "Invite additional superadmins",
    ],
  },
];

const FAQS = [
  {
    question: "How does each company get its own workspace?",
    answer:
      "When you register, we create an isolated workspace with its own unique link (slug) for your company. Every company keeps its own timezone, office schedule, deduction rules, employees and data — nothing leaks between tenants.",
  },
  {
    question: "How does the secure setup link work?",
    answer:
      "Admins and employees never receive passwords in email. Instead, a one-time setup link is sent that lets them choose their own password on first login. Admins can resend invites at any time, and the link is invalid once used.",
  },
  {
    question: "How does network-locked check-in work?",
    answer:
      "Admins register the IP addresses of the office routers in the configuration panel. When IP enforcement is enabled, check-in and check-out only succeed from an approved IP — an employee trying to clock in from a home network is rejected instantly.",
  },
  {
    question: "What happens if an employee checks in from home?",
    answer:
      "If IP enforcement is enabled, the request is rejected because their home network's IP will not match the authorized router IPs configured in your workspace. Buddy punching and remote spoofing are eliminated.",
  },
  {
    question: "How are salary deductions calculated?",
    answer:
      "When deductions are enabled, a late check-in costs half a day's salary, a missing check-out costs half a day's salary, and a full absence costs a full day. Each month you get a net-salary report: net salary = monthly salary minus total deductions, never below zero.",
  },
  {
    question: "Which timezone is used for attendance?",
    answer:
      "Every company selects its own timezone during onboarding. All timestamps, office-hours enforcement, daily resets and reports automatically adjust to that timezone, so your team is always tracked against your local time.",
  },
];

export const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isTokenValid()) {
    return <Navigate to={getHomePath()} replace />;
  }

  return (
    <div className="min-h-screen scroll-smooth bg-white font-sans text-slate-900 selection:bg-cornflower-blue-100 selection:text-cornflower-blue-900">
      {/* NAVBAR */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-cornflower-blue-50 bg-white/90 shadow-sm backdrop-blur-md"
            : "bg-white"
        }`}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-cornflower-blue-600 transition-opacity hover:opacity-80"
          >
            <img
              src="/ontime.svg"
              alt="onTime logo"
              className="h-6 w-6"
              width={24}
              height={24}
            />
            <span className="text-xl font-bold tracking-tight">onTime</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-cornflower-blue-600"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="rounded-full border-cornflower-blue-200 text-cornflower-blue-700 hover:bg-cornflower-blue-50"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/start")}
                className="rounded-full bg-cornflower-blue-600 px-6 text-white hover:bg-cornflower-blue-700"
              >
                Get Started
              </Button>
            </div>
          </nav>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-600 hover:bg-cornflower-blue-50 hover:text-cornflower-blue-600"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex flex-col border-l-cornflower-blue-100 bg-white pt-12"
              >
                <nav className="flex flex-col gap-6">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.name}>
                      <a
                        href={link.href}
                        className="text-lg font-medium text-slate-800 transition-colors hover:text-cornflower-blue-600"
                      >
                        {link.name}
                      </a>
                    </SheetClose>
                  ))}
                  <Separator className="my-2 bg-cornflower-blue-50" />
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-cornflower-blue-200 text-cornflower-blue-700 hover:bg-cornflower-blue-50"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="w-full rounded-full bg-cornflower-blue-600 text-white hover:bg-cornflower-blue-700"
                      onClick={() => navigate("/start")}
                    >
                      Get Started
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-cornflower-blue-50 via-white to-white opacity-70"></div>
          <div className="absolute top-20 right-0 -z-10 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-cornflower-blue-50/60 blur-3xl"></div>

          <div className="relative z-10 container mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
              <div className="max-w-2xl">
                <Badge className="mb-6 border border-cornflower-blue-100 bg-cornflower-blue-50 px-3 py-1 text-sm font-medium text-cornflower-blue-700 hover:bg-cornflower-blue-50">
                  Attendance for every company
                </Badge>
                <h1 className="mb-6 text-4xl leading-[1.15] font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                  Attendance that works on{" "}
                  <span className="bg-gradient-to-r from-cornflower-blue-600 to-cornflower-blue-400 bg-clip-text text-transparent">
                    your terms.
                  </span>
                </h1>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl">
                  onTime gives every organization its own isolated workspace —
                  check-in/out that respects office hours and your network,
                  automatic absence tracking and salary deductions. No buddy
                  punching. No guesswork.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-cornflower-blue-600 px-8 text-base text-white hover:bg-cornflower-blue-700"
                    onClick={() => navigate("/start")}
                  >
                    Get Started
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-full border-cornflower-blue-200 bg-white px-8 text-base text-cornflower-blue-700 hover:bg-cornflower-blue-50"
                  >
                    <a href="#how-it-works">See How It Works</a>
                  </Button>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cornflower-blue-500" />
                    Per-company workspaces
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cornflower-blue-500" />
                    Network-locked check-in
                  </span>
                  <span className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-cornflower-blue-500" />
                    Auto deductions
                  </span>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:ml-auto">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-cornflower-blue-100 to-white opacity-80 blur-lg"></div>

                <div className="relative rounded-3xl border border-cornflower-blue-100 bg-white/80 p-6 shadow-2xl shadow-cornflower-blue-900/5 backdrop-blur-xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-cornflower-blue-100 shadow-sm">
                        <AvatarFallback className="bg-cornflower-blue-50 text-lg font-bold text-cornflower-blue-700">
                          SA
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="leading-tight font-semibold text-slate-900">
                          Sarah Ahmed
                        </h3>
                        <p className="text-sm text-slate-500">
                          Product Designer
                        </p>
                      </div>
                    </div>
                    <Badge className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                      On Time <Check className="h-3 w-3" />
                    </Badge>
                  </div>

                  <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
                    <div>
                      <p className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
                        Checked In
                      </p>
                      <p className="font-mono text-xl font-bold text-cornflower-blue-600">
                        09:02 AM
                      </p>
                    </div>
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div>
                      <p className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
                        Network
                      </p>
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <Shield className="h-4 w-4 text-cornflower-blue-500" />{" "}
                        Office-Main
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-5">
                    <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Weekly Attendance
                    </p>
                    <div className="flex h-24 items-end gap-3">
                      <div className="group relative h-[80%] w-1/5 rounded-t-md bg-cornflower-blue-100 transition-colors hover:bg-cornflower-blue-200">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          8.5h
                        </div>
                      </div>
                      <div className="relative h-[95%] w-1/5 rounded-t-md bg-cornflower-blue-600 shadow-[0_0_15px_rgba(37,126,235,0.4)]">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-cornflower-blue-600 px-2 py-1 text-[10px] font-medium text-white">
                          9.2h
                        </div>
                      </div>
                      <div className="group relative h-[85%] w-1/5 rounded-t-md bg-cornflower-blue-100 transition-colors hover:bg-cornflower-blue-200">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          8.8h
                        </div>
                      </div>
                      <div className="group relative h-[90%] w-1/5 rounded-t-md bg-cornflower-blue-100 transition-colors hover:bg-cornflower-blue-200">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          9.0h
                        </div>
                      </div>
                      <div className="group relative h-[20%] w-1/5 rounded-t-md bg-slate-100">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          2.0h
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between px-1 pt-1 text-xs font-medium text-slate-400">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="scroll-mt-20 bg-slate-50/50 py-24">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Everything your team needs to stay on track
              </h2>
              <p className="text-lg text-slate-600">
                A complete suite of tools to keep attendance honest, automate
                the busywork, and run your workforce on one platform.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <Card
                  key={index}
                  className="border-cornflower-blue-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cornflower-blue-50">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-slate-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="scroll-mt-20 bg-white py-24">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Up and running in minutes
              </h2>
              <p className="text-lg text-slate-600">
                No complicated installations. No lengthy onboarding. Just pure
                efficiency from day one.
              </p>
            </div>

            <div className="relative">
              <div className="absolute top-8 left-0 hidden h-0.5 w-full bg-cornflower-blue-50 lg:block"></div>

              <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
                {STEPS.map((step, index) => (
                  <div
                    key={index}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cornflower-blue-600 text-xl font-bold text-white shadow-lg ring-4 shadow-cornflower-blue-600/20 ring-white">
                      {step.num}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="max-w-[250px] text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ROLES SECTION */}
        <section id="roles" className="scroll-mt-20 bg-cornflower-blue-50/50 py-24">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Built for every role
              </h2>
              <p className="text-lg text-slate-600">
                Role-based access keeps the right tools in the right hands —
                from a single employee to a platform managing many companies.
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-3">
              {ROLES.map((role, index) => (
                <Card
                  key={index}
                  className={
                    role.highlight
                      ? "relative transform border-cornflower-blue-600 bg-cornflower-blue-600 text-white shadow-xl shadow-cornflower-blue-900/10 md:-translate-y-4"
                      : "border-cornflower-blue-100 bg-white shadow-sm"
                  }
                >
                  <CardHeader className="pb-6">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                        role.highlight
                          ? "bg-white/15"
                          : "bg-cornflower-blue-50"
                      }`}
                    >
                      {role.icon}
                    </div>
                    <CardTitle
                      className={`text-2xl font-bold ${
                        role.highlight ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {role.title}
                    </CardTitle>
                    <CardDescription
                      className={`mt-2 ${
                        role.highlight ? "text-cornflower-blue-100" : "text-slate-500"
                      }`}
                    >
                      {role.tagline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul
                      className={`space-y-4 text-sm ${
                        role.highlight ? "text-cornflower-blue-50" : "text-slate-600"
                      }`}
                    >
                      {role.points.map((point, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <Check
                            className={`h-5 w-5 shrink-0 ${
                              role.highlight ? "text-white" : "text-cornflower-blue-600"
                            }`}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="scroll-mt-20 bg-white py-24">
          <div className="container mx-auto max-w-3xl px-4 md:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Frequently asked questions
              </h2>
              <p className="text-lg text-slate-600">
                Everything you need to know about implementing onTime for your
                business.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQS.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 px-6"
                >
                  <AccordionTrigger className="py-5 text-left text-base font-semibold text-slate-900 hover:text-cornflower-blue-600 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-base leading-relaxed text-slate-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* GET STARTED SECTION */}
        <section id="start" className="scroll-mt-20 bg-cornflower-blue-600 py-24">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="text-white">
                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">
                  Ready to bring order to your attendance?
                </h2>
                <p className="mb-8 max-w-md text-lg leading-relaxed text-cornflower-blue-100 md:text-xl">
                  Create your company&apos;s workspace for free and see onTime
                  in action. You can be tracking attendance within minutes.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cornflower-blue-500/50">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">Secure & Private</h4>
                      <p className="text-sm text-cornflower-blue-200">
                        Isolated workspaces and one-time setup links.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cornflower-blue-500/50">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">
                        Expert Onboarding
                      </h4>
                      <p className="text-sm text-cornflower-blue-200">
                        Simple guided setup to get you live fast.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border-0 bg-white p-2 shadow-2xl shadow-cornflower-blue-950/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">
                    Create your workspace
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Register your company and invite your team — no credit card
                    required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-8 space-y-4 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-cornflower-blue-600" />
                      Free setup in under a minute
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-cornflower-blue-600" />
                      Secure one-time setup links — no passwords in email
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-cornflower-blue-600" />
                      Per-company workspace with its own dedicated link
                    </li>
                  </ul>
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full bg-cornflower-blue-600 text-base font-semibold text-white hover:bg-cornflower-blue-700"
                    onClick={() => navigate("/start")}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="mt-4 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="font-semibold text-cornflower-blue-700 underline underline-offset-4 hover:text-cornflower-blue-800"
                    >
                      Log in
                    </button>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-cornflower-blue-950 py-16 text-slate-300">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="mb-6 flex items-center gap-2 text-white">
                <img
                  src="/ontime.svg"
                  alt="onTime logo"
                  className="h-7 w-7"
                  width={28}
                  height={28}
                />
                <span className="text-2xl font-bold tracking-tight">
                  onTime
                </span>
              </Link>
              <p className="mb-6 max-w-sm leading-relaxed text-slate-400">
                Attendance that works on your terms. Ensure accountability,
                eliminate buddy punching, and streamline your workforce
                management effortlessly.
              </p>
            </div>

            <div>
              <h4 className="mb-6 font-semibold text-white">Product</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#features"
                    className="transition-colors hover:text-cornflower-blue-400"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="transition-colors hover:text-cornflower-blue-400"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#roles"
                    className="transition-colors hover:text-cornflower-blue-400"
                  >
                    Roles
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="transition-colors hover:text-cornflower-blue-400"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-semibold text-white">Company</h4>
              <ul className="space-y-4">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/start")}
                    className="transition-colors hover:text-cornflower-blue-400"
                  >
                    Get Started
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="transition-colors hover:text-cornflower-blue-400"
                  >
                    Login
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="mb-8 bg-slate-700/50" />

          <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
            <p>© 2026 onTime. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
