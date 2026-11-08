import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  BookOpenText,
  BotMessageSquare,
  Compass,
  CheckCircle2,
  Server,
  Zap,
  Star,
  Activity,
  Layers,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";
import { useBackendConfig } from "../context/BackendConfigContext.tsx";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { onboardingCompleted } = useSession();
  const { status, openModal } = useBackendConfig();

  const handleGetStarted = () => {
    if (onboardingCompleted) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <div className="space-y-10 sm:space-y-16 md:space-y-20 py-4 sm:py-6 md:py-12 px-3.5 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Backend Connection Strip */}
      <div className="rounded-2xl border border-[#E2E7E2] bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {status === "connected" ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            )}
          </span>
          <div className="text-xs min-w-0">
            <span className="font-bold text-[#131B17] block sm:inline">
              {status === "connected"
                ? "FastAPI Gateway Active & Connected"
                : "FastAPI Gateway in Standalone Demo Mode"}
            </span>
            <span className="text-[#6C7A72] sm:ml-2 hidden sm:inline">
              {status === "connected"
                ? "Direct REST communication with Python backend enabled."
                : "Using high-fidelity offline engine with verified Man Matters catalogue."}
            </span>
          </div>
        </div>

        <button
          onClick={openModal}
          type="button"
          className="text-xs font-semibold text-[#0F2E24] hover:text-[#0a2119] bg-[#E7F1EB] px-3 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer border border-[#D2E3D8] self-end sm:self-auto"
        >
          <Server className="w-3.5 h-3.5" />
          <span>Gateway Settings</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Unboxed Kicker */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-[#0F2E24]">
            <Sparkles className="w-3.5 h-3.5 text-[#0F2E24] shrink-0" />
            <span className="truncate">Clinical Formulations · Doctor Backed · Personal Care</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#131B17] tracking-tight leading-[1.15]">
            Precision care for men,{" "}
            <span className="font-editorial italic font-normal text-[#0F2E24]">
              engineered for tangible results.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#6C7A72] max-w-xl leading-relaxed">
            Consolidate your entire wellness regimen in one seamless companion. Formulated with dermatologist-grade actives across Hair Retention, Beard Growth, Clarifying Skin, and Core Vitality.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
            <button
              onClick={handleGetStarted}
              type="button"
              className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#0F2E24] text-white text-xs font-bold hover:bg-[#0a2119] transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{onboardingCompleted ? "Go to Dashboard" : "Start Assessment"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/discover"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white border border-[#E2E7E2] text-[#131B17] text-xs font-bold hover:bg-gray-50 transition-colors shadow-2xs flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#6C7A72]" />
              <span>Explore Formulations</span>
            </Link>
          </div>

          {/* Clinical Trust Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-[#EEF2EE] text-xs text-[#6C7A72]">
            <div>
              <div className="text-base sm:text-lg font-bold text-[#131B17] tabular-nums">93%</div>
              <p className="text-[10px] sm:text-[11px] text-[#6C7A72]">Retention success</p>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-[#131B17] tabular-nums">120k+</div>
              <p className="text-[10px] sm:text-[11px] text-[#6C7A72]">Active routines</p>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-[#131B17] tabular-nums">4.8 / 5.0</div>
              <p className="text-[10px] sm:text-[11px] text-[#6C7A72]">Verified rating</p>
            </div>
          </div>
        </div>

        {/* Right Product Spotlight Frame */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E2E7E2] aspect-4/5 bg-gradient-to-b from-[#F2F5F2] via-[#F8F9F6] to-white p-6 flex items-center justify-center">
            <img
              src="https://i.mscwlns.co/media/misc/pdp_rcl/2025137/Combo-Kit_umbirx.png?tr=w-800"
              alt="Man Matters Stage 1 Anti-Hairfall Kit"
              className="max-h-full max-w-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Architectural Overlays */}
            <div className="absolute top-6 left-6 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E2E7E2] shadow-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E7F1EB] text-[#0F2E24] flex items-center justify-center font-bold">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#131B17]">Morning Protocol</p>
                <p className="text-[10px] text-[#6C7A72]">Redensyl + Biotin Gummy</p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 p-3.5 rounded-2xl bg-[#0F2E24] text-white shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                <BotMessageSquare className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-xs">
                <p className="font-bold">CareGuide AI</p>
                <p className="text-[10px] text-emerald-200">Clinical Formulation Guidance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Discover Your Care Verticals */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2E24] block mb-1">
              Holistic Care Portfolio
            </span>
            <h2 className="text-2xl font-extrabold text-[#131B17] tracking-tight">
              Dermatologist & Trichologist Formulated
            </h2>
          </div>
          <Link
            to="/discover"
            className="text-xs font-semibold text-[#0F2E24] hover:underline flex items-center gap-1"
          >
            <span>View all 10 formulations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "Hair Care",
              kicker: "CLINICAL REGROWTH",
              desc: "3% Redensyl serum, 1% Ketoconazole anti-dandruff shampoo, and high-potency Biotin gummies.",
              actives: "Redensyl · Anagain · Biotin",
              count: "5 Formulations",
              link: "/discover?category=Hair",
              image: "https://i.mscwlns.co/media/misc/pdp_rcl/2025137/Combo-Kit_umbirx.png?tr=w-600",
            },
            {
              title: "Beard Growth",
              kicker: "FOLLICLE DENSITY",
              desc: "Beardmax 5% Minoxidil activator solution and 0.5mm micro-needle titanium derma roller.",
              actives: "Minoxidil · 0.5mm Titanium",
              count: "2 Formulations",
              link: "/discover?category=Beard",
              image: "https://i.mscwlns.co/media/misc/pdp_rcl/2024374/BGK_kpcriu.jpg?tr=w-600",
            },
            {
              title: "Skin Clarity",
              kicker: "BARRIER DEFENSE",
              desc: "10% Niacinamide clarifying serum for sebum regulation, dark spot reduction, and smooth skin texture.",
              actives: "10% Niacinamide · Zinc PCA",
              count: "1 Formulation",
              link: "/discover?category=Skin",
              image: "https://i.mscwlns.co/mosaic-wellness/image/upload/v1604745972/Man%20Matters/Card%20image%20change/Skin/Face%20serum/Anti_Acne_Face_Wash_1600X1200_2.jpg?tr=w-600",
            },
            {
              title: "General Wellness",
              kicker: "ADAPTOGENIC VITALITY",
              desc: "Pure Himalayan Ashwagandha (KSM-66) for cortisol regulation, physical endurance, and deep sleep cycles.",
              actives: "KSM-66 Ashwagandha",
              count: "1 Formulation",
              link: "/discover?category=Wellness",
              image: "https://i.mscwlns.co/media/misc/pdp_rcl/2025025/125_b8btap.jpg?tr=w-600",
            },
          ].map((cat) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="group p-5 rounded-2xl bg-white border border-[#E2E7E2] hover:border-[#0F2E24]/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-36 rounded-xl overflow-hidden mb-4 bg-[#F6F7F4] p-3 flex items-center justify-center border border-[#EEF2EE]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="text-[10px] font-bold text-[#0F2E24] uppercase tracking-wider mb-1">
                  {cat.kicker}
                </div>
                <h3 className="font-bold text-base text-[#131B17] mb-1.5 group-hover:text-[#0F2E24]">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#6C7A72] leading-relaxed mb-3">
                  {cat.desc}
                </p>
                <div className="text-[11px] text-[#131B17] font-semibold border-t border-[#EEF2EE] pt-2 mb-3">
                  <span className="text-[#6C7A72]">Actives:</span> {cat.actives}
                </div>
              </div>
              <span className="text-xs font-semibold text-[#0F2E24] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore {cat.count} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: Care Ecosystem Pillars */}
      <section className="bg-white rounded-3xl border border-[#E2E7E2] p-8 md:p-12 space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#0F2E24] uppercase tracking-wider block mb-1">
            Integrated Platform
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#131B17] tracking-tight">
            Everything your personal care requires, unified.
          </h2>
          <p className="text-xs md:text-sm text-[#6C7A72] mt-1.5 leading-relaxed">
            Eliminate guesswork with clinical documentation, consistent habit formation, and observable tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#F7F8F5] border border-[#E2E7E2] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F1EB] text-[#0F2E24] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#131B17]">Active Product Cabinet</h3>
            <p className="text-xs text-[#6C7A72] leading-relaxed">
              Curate your active regimen with start dates, verified application schedules, and refill reminders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F7F8F5] border border-[#E2E7E2] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F1EB] text-[#0F2E24] flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#131B17]">Habit Protocol Engine</h3>
            <p className="text-xs text-[#6C7A72] leading-relaxed">
              Maintain morning and night adherence. Track 14-day consistency streaks and routine completion metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F7F8F5] border border-[#E2E7E2] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F1EB] text-[#0F2E24] flex items-center justify-center font-bold">
              <BookOpenText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#131B17]">Observation Journal</h3>
            <p className="text-xs text-[#6C7A72] leading-relaxed">
              Log objective changes with milestone photos, scalp/skin condition tags, and subjective feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F7F8F5] border border-[#E2E7E2] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F1EB] text-[#0F2E24] flex items-center justify-center font-bold">
              <BotMessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#131B17]">CareGuide AI Assistant</h3>
            <p className="text-xs text-[#6C7A72] leading-relaxed">
              Query interactions between Minoxidil and hair oil, verify wash cadences, or compare formula strengths.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Meet CareGuide AI Banner */}
      <section className="bg-gradient-to-br from-[#0F2E24] via-[#153C30] to-[#0A221A] text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>AI CLINICAL COMPANION</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Clear, grounded answers for every wellness concern.
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Wondering if 3% Redensyl serum can be paired with scalp massage? Need clarity on derma roller sanitization protocols? CareGuide AI utilizes verified formulation documentation to guide your daily decisions.
          </p>

          <div className="pt-2">
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0F2E24] text-xs font-bold hover:bg-gray-100 transition-colors shadow-md cursor-pointer"
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>Consult CareGuide AI</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: How the Protocol Works */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2E24]">
            Methodology
          </span>
          <h2 className="text-2xl font-bold text-[#131B17]">The Care Protocol</h2>
          <p className="text-xs text-[#6C7A72]">
            A structured pathway designed to maximize clinical adherence and visible hair/skin density.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Discover Actives",
              desc: "Identify certified solutions targeting your specific concern stage (DHT blocking, follicular activation, barrier renewal).",
            },
            {
              step: "02",
              title: "Anchor Routine",
              desc: "Schedule morning and evening application slots with micro-checklists and dosage clarity.",
            },
            {
              step: "03",
              title: "Log Observations",
              desc: "Track weekly progress photos and scalp/skin density milestones in your encrypted private journal.",
            },
            {
              step: "04",
              title: "Refine & Consult",
              desc: "Consult CareGuide AI on active ingredients, dosage timing, and routine adjustments over time.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-white border border-[#E2E7E2] relative"
            >
              <span className="text-2xl font-black text-[#0F2E24]/20 block mb-2 font-mono">
                {item.step}
              </span>
              <h3 className="font-bold text-sm text-[#131B17] mb-1.5">{item.title}</h3>
              <p className="text-xs text-[#6C7A72] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
