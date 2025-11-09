import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  LibraryBig,
  Users,
  Map,
  CalendarDays,
} from "lucide-react";
import NoticesSection from "../components/NoticesSection";
import ApplyNowModal from "../components/ApplyNowModal";

function ManualFlowIllustration() {
  return (
    <svg
      viewBox="0 0 1000 420"
      className="w-full h-auto"
      role="img"
      aria-label="Manual admission flow: Library → Admissions → Bank → back to Admissions"
    >
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#E2E8F0" strokeWidth="1" />
        </pattern>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="14"
            stdDeviation="18"
            floodColor="rgba(15,23,42,0.16)"
          />
        </filter>
        <marker
          id="arrow"
          markerWidth="12"
          markerHeight="12"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path
            d="M0 0 L6 3 L0 6"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
          />
        </marker>
        <style>{`
          .flow-dash { stroke-dasharray: 8 10; animation: dash 3.5s linear infinite; }
          @keyframes dash { to { stroke-dashoffset: -260; } }
        `}</style>
      </defs>

      <rect width="1000" height="420" rx="28" fill="url(#grid)" />

      <g filter="url(#shadow)">
        <g transform="translate(110,170)">
          <rect
            x="0"
            y="0"
            width="230"
            height="170"
            rx="14"
            fill="#fff"
            stroke="#CBD5E1"
          />
          <rect x="0" y="55" width="230" height="1.5" fill="#CBD5E1" />
          <rect x="0" y="110" width="230" height="1.5" fill="#CBD5E1" />
          <g fill="#EEF2F7" stroke="#CBD5E1">
            <rect x="24" y="20" width="32" height="20" rx="4" />
            <rect x="68" y="20" width="32" height="20" rx="4" />
            <rect x="112" y="20" width="32" height="20" rx="4" />
            <rect x="156" y="20" width="32" height="20" rx="4" />
          </g>
          <text
            x="115"
            y="-12"
            textAnchor="middle"
            fontFamily="Inter, system-ui"
            fontSize="14"
            fill="#0F172A"
            fontWeight="700"
          >
            Library
          </text>
          <text
            x="115"
            y="-28"
            textAnchor="middle"
            fontFamily="Inter, system-ui"
            fontSize="12"
            fill="#475569"
          >
            Get NOC
          </text>
        </g>

        <g transform="translate(430,60)">
          <rect
            x="0"
            y="0"
            width="260"
            height="280"
            rx="14"
            fill="#fff"
            stroke="#CBD5E1"
          />
          <g fill="#F8FAFC" stroke="#CBD5E1">
            {Array.from({ length: 6 }).map((_, r) => (
              <g key={r} transform={`translate(28,${28 + r * 40})`}>
                <rect x="0" y="0" width="30" height="26" rx="4" />
                <rect x="48" y="0" width="30" height="26" rx="4" />
                <rect x="96" y="0" width="30" height="26" rx="4" />
                <rect x="144" y="0" width="30" height="26" rx="4" />
              </g>
            ))}
          </g>
          <text
            x="130"
            y="-12"
            textAnchor="middle"
            fontFamily="Inter, system-ui"
            fontSize="16"
            fill="#0F172A"
            fontWeight="800"
          >
            Admissions
          </text>
          <text
            x="130"
            y="-28"
            textAnchor="middle"
            fontFamily="Inter, system-ui"
            fontSize="12"
            fill="#475569"
          >
            Collect fee slip
          </text>
        </g>

        <g transform="translate(770,140)">
          <polygon points="0,42 220,42 110,0" fill="#BFDBFE" stroke="#60A5FA" />
          <rect
            x="10"
            y="42"
            width="200"
            height="170"
            rx="12"
            fill="#fff"
            stroke="#CBD5E1"
          />
          <rect
            x="96"
            y="112"
            width="28"
            height="28"
            rx="6"
            fill="#93C5FD"
            stroke="#60A5FA"
          />
          <text
            x="110"
            y="-12"
            textAnchor="middle"
            fontFamily="Inter, system-ui"
            fontSize="14"
            fill="#0F172A"
            fontWeight="700"
          >
            Bank
          </text>
          <text
            x="110"
            y="-28"
            textAnchor="middle"
            fontFamily="Inter, system-ui"
            fontSize="12"
            fill="#475569"
          >
            Pay fees
          </text>
        </g>
      </g>

      <g stroke="#64748B" strokeWidth="3" fill="none" markerEnd="url(#arrow)">
        <path className="flow-dash" d="M430 220 C 380 220, 340 235, 320 260" />
        <path className="flow-dash" d="M320 260 C 360 320, 410 320, 430 260" />
        <path className="flow-dash" d="M690 220 C 720 220, 750 230, 770 235" />
        <path className="flow-dash" d="M770 235 C 720 300, 700 310, 690 260" />
      </g>
    </svg>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-700 grid place-items-center mb-4 ring-1 ring-sky-200">
        <Icon size={20} />
      </div>
      <h3 className="text-slate-900 font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600 text-sm">{desc}</p>
    </div>
  );
}

function Features() {
  const items = [
    {
      icon: Bot,
      title: "AI Assistant",
      desc: "Chat to get guidance instantly.",
    },
    {
      icon: MessageSquare,
      title: "Social Hub",
      desc: "Campus feed, clubs and chats.",
    },
    {
      icon: LayoutDashboard,
      title: "Dashboards",
      desc: "Admin panels for leadership.",
    },
    {
      icon: GraduationCap,
      title: "Admissions",
      desc: "Apply online and track status.",
    },
    {
      icon: BookOpen,
      title: "Programs",
      desc: "Undergraduate and postgraduate.",
    },
    {
      icon: LibraryBig,
      title: "Library",
      desc: "Search books and e-resources.",
    },
    { icon: Users, title: "Faculty", desc: "Departments and profiles." },
    { icon: Map, title: "Campus", desc: "Map and facilities." },
    { icon: CalendarDays, title: "Notices", desc: "Deadlines and events." },
  ];
  return (
    <section className="bg-white">
      <div className="container-narrow py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <FeatureCard
              key={it.title}
              icon={it.icon}
              title={it.title}
              desc={it.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickActions({ onApplyClick }: { onApplyClick: () => void }) {
  const actions = [
    {
      label: "Apply Now",
      href: "#apply",
      variant: "primary" as const,
      isApply: true,
    },
    { label: "Ask AI", href: "#ai", variant: "ghost" as const },
    { label: "Programs", href: "#programs", variant: "ghost" as const },
    { label: "Library Search", href: "#library", variant: "ghost" as const },
    { label: "Notices", href: "#notices", variant: "ghost" as const },
    { label: "Login Portal", href: "/login", variant: "ghost" as const },
  ];
  return (
    <section className="bg-white">
      <div className="container-narrow pb-6">
        <div className="flex flex-wrap gap-3 justify-center">
          {actions.map((a) =>
            a.isApply ? (
              <button
                key={a.label}
                onClick={onApplyClick}
                className={
                  a.variant === "primary"
                    ? "rounded-full bg-sky-600 px-5 py-2.5 text-white font-semibold hover:bg-sky-500 transition"
                    : "rounded-full px-5 py-2.5 text-slate-700 font-semibold ring-1 ring-slate-200 hover:bg-slate-50 transition"
                }
              >
                {a.label}
              </button>
            ) : (
              <a
                key={a.label}
                href={a.href}
                className={
                  a.variant === "primary"
                    ? "rounded-full bg-sky-600 px-5 py-2.5 text-white font-semibold hover:bg-sky-500 transition"
                    : "rounded-full px-5 py-2.5 text-slate-700 font-semibold ring-1 ring-slate-200 hover:bg-slate-50 transition"
                }
              >
                {a.label}
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  const tiles = [
    {
      icon: Bot,
      title: "AI Assistant",
      desc: "24/7 guidance for students and parents.",
      id: "ai",
    },
    {
      icon: MessageSquare,
      title: "Social Hub",
      desc: "Clubs, events and peer discussions.",
      id: "social",
    },
    {
      icon: LayoutDashboard,
      title: "Admin Dashboards",
      desc: "KPIs for principal and departments.",
      id: "dashboards",
    },
  ];
  return (
    <section className="bg-white" id="ai">
      <div className="container-narrow pt-2 pb-14">
        <div className="grid gap-6 md:grid-cols-3">
          {tiles.map((t) => (
            <a
              key={t.title}
              href={`#${t.id}`}
              className="group block rounded-2xl glass p-6 hover:bg-white transition"
            >
              <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-700 grid place-items-center mb-4 ring-1 ring-sky-200">
                <t.icon size={20} />
              </div>
              <div className="text-slate-900 font-semibold">{t.title}</div>
              <div className="text-slate-600 text-sm mt-1">{t.desc}</div>
              <div className="mt-6 text-sky-700 text-sm group-hover:underline">
                Learn more →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { label: "Students", value: "5,000+" },
    { label: "Faculty", value: "300+" },
    { label: "Programs", value: "35+" },
    { label: "Placements", value: "92%" },
  ];
  return (
    <section className="bg-white">
      <div className="container-narrow pb-12">
        <div className="glass rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold text-slate-900">
                {s.value}
              </div>
              <div className="text-slate-600 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyNowClick = () => {
    setIsModalOpen(true);
  };

  return (
    <main>
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-white to-white min-h-screen w-full">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 right-1/2 h-80 w-[40rem] rounded-full bg-sky-200/60 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-96 w-[50rem] rounded-full bg-emerald-200/50 blur-3xl" />
        </div>
        <div className="container-narrow min-h-screen pt-24 md:pt-32 pb-12 flex items-center">
          <div className="grid md:grid-cols-2 gap-10 items-center w-full">
            <div className="mx-auto max-w-3xl text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-3 py-1 text-xs md:text-sm font-medium mb-4"
              >
                Tired of running around? Save time with Online Admissions
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900"
              >
                GCET Digital Campus
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mt-6 text-lg text-slate-600"
              >
                One unified hub for Admissions, Programs, Library, Faculty,
                Campus life, Notices — plus an AI assistant, a student Social
                hub, and admin Dashboards.
              </motion.p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="inline-flex items-center rounded-full bg-slate-50 ring-1 ring-slate-200 px-3 py-1">
                  No queues
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-50 ring-1 ring-slate-200 px-3 py-1">
                  Track status online
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-50 ring-1 ring-slate-200 px-3 py-1">
                  Pay securely
                </span>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-8 flex items-center justify-center md:justify-start gap-3"
              >
                <button
                  onClick={handleApplyNowClick}
                  className="rounded-full bg-sky-600 px-6 py-3 text-white font-semibold shadow hover:bg-sky-500 transition"
                >
                  Apply Now
                </button>
                <a
                  href="#prospectus"
                  className="rounded-full px-6 py-3 text-slate-700 font-semibold ring-1 ring-slate-200 hover:bg-slate-50 transition"
                >
                  View Prospectus
                </a>
                <a
                  href="#ai"
                  className="rounded-full px-6 py-3 text-sky-700 font-semibold ring-1 ring-sky-300 hover:bg-sky-50 transition"
                >
                  Ask AI
                </a>
              </motion.div>
            </div>
            <div className="hidden md:block">
              <ManualFlowIllustration />
            </div>
          </div>
        </div>
      </section>
      <NoticesSection />
      <Features />
      <QuickActions onApplyClick={handleApplyNowClick} />
      <Showcase />
      <Stats />
      <section className="bg-white">
        <div className="container-narrow py-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="text-sm font-semibold text-slate-900 mb-2">
                Manual
              </div>
              <ul className="space-y-2 text-slate-600 text-sm list-disc list-inside">
                <li>Visit Library for NOC</li>
                <li>Stand in queue at Admissions for fee slip</li>
                <li>Go to Bank and pay fees</li>
                <li>Return with stamped receipt</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-300 p-6 bg-emerald-50">
              <div className="text-sm font-semibold text-emerald-800 mb-2">
                Online (Recommended)
              </div>
              <ul className="space-y-2 text-emerald-900 text-sm list-disc list-inside">
                <li>Apply from anywhere in minutes</li>
                <li>Upload docs once, auto-verified</li>
                <li>Pay fees securely online</li>
                <li>Track status and get SMS/email updates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Now Modal */}
      <ApplyNowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
