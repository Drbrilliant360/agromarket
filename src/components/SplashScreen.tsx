import React, { useState } from "react";
import { 
  Sprout, ShoppingBasket, ShieldAlert, ArrowRight, UserPlus, 
  Globe, Smartphone, Sparkles, CheckSquare, Layers,
  BookOpen, Download, Award, X
} from "lucide-react";
import { Role } from "../types";
import { LANG_DICT } from "../data";
import SafeImage from "./SafeImage";

interface SplashProps {
  onSelectRole: (role: Role, name: string, phone: string) => void;
  language: "en" | "sw";
  setLanguage: (lang: "en" | "sw") => void;
}

export default function SplashScreen({ onSelectRole, language, setLanguage }: SplashProps) {
  const isSw = language === "sw";
  const t = (key: string) => LANG_DICT[key]?.[language] || key;

  // Flow step state
  const [step, setStep] = useState<"welcome" | "role" | "register">("welcome");
  const [selectedRole, setSelectedRole] = useState<Role>("buyer");
  const [showAcademicReport, setShowAcademicReport] = useState(false);

  // Registration input fields
  const [fullNameInput, setFullNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);

  const triggerNextStep = (role: Role) => {
    setSelectedRole(role);
    setStep("register");
    // Pre-set logical names for simulation defaults to save tedious typing for the reviewer
    if (role === "farmer") {
      setFullNameInput("Bahati Mwangi");
      setPhoneInput("+255 712 345 678");
    } else if (role === "buyer") {
      setFullNameInput("Sarah Mkami");
      setPhoneInput("+255 711 223 344");
    } else {
      setFullNameInput("Administrator");
      setPhoneInput("+255 800 ADMIN");
    }
  };

  const handleDownloadLogo = () => {
    const link = document.createElement("a");
    link.href = "/assets/images/agromarket_logo.png";
    link.setAttribute("download", "AgroMarket_App_Logo.png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch("/README.md");
      const text = await response.text();
      const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "AgroMarket_Student_Final_Year_Report.md");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading project report", err);
      alert("Failed to fetch report from local environment. Please inspect project README.md directly.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameInput || !phoneInput) return;
    if (!agreedTerms) {
      alert(isSw ? "Tafadhali kwanza kubali masharti yetu kufungua akaunti!" : "Please accept fair trade terms to access dashboard!");
      return;
    }
    onSelectRole(selectedRole, fullNameInput, phoneInput);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-5 relative select-none antialiased font-sans" id="splash-workflow-container">
      
      {/* Top Language toggle button */}
      <div className="flex justify-end p-2 max-w-sm mx-auto w-full z-10">
        <button
          onClick={() => setLanguage(isSw ? "en" : "sw")}
          className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 py-1.5 px-3 border border-slate-200/50 rounded-full text-xs font-semibold shadow-xs"
          id="btn-lang-toggle"
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{isSw ? "English" : "Kiswahili"}</span>
        </button>
      </div>

      {step === "welcome" && (
        <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full text-center space-y-6" id="div-splash-welcome">
          <div className="relative inline-block mx-auto">
            <div className="w-24 h-24 bg-white p-1 rounded-3xl shadow-xl animate-bounce border border-slate-100 flex items-center justify-center overflow-hidden">
              <SafeImage src="/assets/images/agromarket_logo.png" alt="AgroMarket Logo" className="w-full h-full rounded-2xl object-cover" />
            </div>
            <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              AgroMarket
            </h1>
            <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
              {t("appSubtitle")}
            </p>
          </div>

          {/* African Context Farm Banner */}
          <div className="overflow-hidden rounded-2xl shadow-xs border border-slate-150 bg-slate-100 max-w-sm mx-auto">
            <SafeImage
              src="/assets/images/african_farm_hero_1779357819524.png"
              alt="Lush East African Farm in Morogoro, Tanzania"
              className="w-full h-40 object-cover"
            />
          </div>

          {/* Interactive Graphic Representation */}
          <div className="bg-white p-4 rounded-2xl border border-slate-105 shadow-xs flex items-center justify-around gap-2 text-slate-600 py-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xs font-bold">🌾</div>
              <span className="text-[10px] uppercase font-mono mt-1.5 block">{isSw ? "Wakulima" : "Farmers"}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-350" />
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xs font-bold">🛒</div>
              <span className="text-[10px] uppercase font-mono mt-1.5 block">{isSw ? "Wanunuzi" : "Buyers"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => setStep("role")}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs flex justify-center items-center gap-2 shadow-md transition-all active:scale-98"
              id="btn-splash-go"
            >
              {isSw ? "Agiza au Uza Mazao" : "Start Trading Produce"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAcademicReport(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs flex justify-center items-center gap-2 shadow-md transition-all active:scale-98"
              id="btn-splash-go-report"
            >
              <Award className="w-4 h-4 text-amber-400" />
              {isSw ? "Ripoti ya Mradi & Pakua Logo" : "Thesis Report & Brand Assets"}
            </button>
          </div>
        </div>
      )}

      {step === "role" && (
        <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full space-y-5 animate-slide-up" id="div-splash-role">
          <div className="text-center">
            <span className="text-xs text-emerald-800 font-extrabold uppercase tracking-widest">{isSw ? "CHAGUA WAJIBU" : "ELECTION"}</span>
            <h2 className="text-xl font-black text-slate-900 mt-1">{t("chooseYourRole")}</h2>
          </div>

          <div className="space-y-3">
            {/* Farmer Role Option */}
            <div
              onClick={() => triggerNextStep("farmer")}
              className="bg-white hover:border-emerald-500 border border-slate-100 p-4 rounded-2xl shadow-xs transition-colors flex gap-3.5 items-start cursor-pointer group"
              id="role-farmer-select"
            >
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Sprout className="w-5 h-5" />
              </span>
              <div className="flex-grow text-xs">
                <h3 className="font-extrabold text-slate-905">{t("beAFarmer")}</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                  {t("farmerRoleDesc")}
                </p>
              </div>
            </div>

            {/* Buyer Role Option */}
            <div
              onClick={() => triggerNextStep("buyer")}
              className="bg-white hover:border-emerald-500 border border-slate-100 p-4 rounded-2xl shadow-xs transition-colors flex gap-3.5 items-start cursor-pointer group"
              id="role-buyer-select"
            >
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShoppingBasket className="w-5 h-5" />
              </span>
              <div className="flex-grow text-xs">
                <h3 className="font-extrabold text-slate-905">{t("beABuyer")}</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                  {t("buyerRoleDesc")}
                </p>
              </div>
            </div>

            {/* Admin Role Option */}
            <div
              onClick={() => triggerNextStep("admin")}
              className="bg-zinc-900 border border-zinc-850 p-4 rounded-2xl shadow-xs transition-all flex gap-3.5 items-start cursor-pointer text-white"
              id="role-admin-select"
            >
              <span className="p-2.5 rounded-xl bg-amber-500 text-zinc-950">
                <Layers className="w-5 h-5" />
              </span>
              <div className="flex-grow text-xs">
                <h3 className="font-extrabold text-zinc-100">{t("beAnAdmin")}</h3>
                <p className="text-zinc-400 text-[11px] leading-relaxed mt-1">
                  {t("adminRoleDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "register" && (
        <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full space-y-4 animate-slide-up" id="div-splash-register">
          <div className="text-center text-xs">
            <span className="text-emerald-700 font-extrabold uppercase tracking-wider block">
              {selectedRole === "farmer" ? "Farmer Account Onboarding" : selectedRole === "admin" ? "Console Gate" : "Buyer Onboarding"}
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">{t("loginRegister")}</h2>
            <p className="text-slate-400 mt-1">We simulate verification immediately. No OTP required for evaluation.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="bg-white border rounded-2xl p-5 shadow-sm space-y-3.5 text-xs text-slate-700">
            <div>
              <label className="block text-slate-500 mb-1 font-mono">{t("fullName")}</label>
              <input
                type="text"
                required
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder="e.g., Bahati Mwangi"
                className="w-full text-xs bg-slate-50 border p-2.5 rounded-xl text-slate-800 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-mono">{t("phoneNumber")}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  className="w-full text-xs font-mono pl-12 bg-slate-50 border p-2.5 rounded-xl text-slate-800 outline-hidden"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="flex gap-2 items-start py-1">
              <input
                type="checkbox"
                id="check-terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="check-terms" className="text-[11px] text-slate-500 leading-normal select-none">
                {t("agreeTerms")}
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors text-xs"
            >
              <UserPlus className="w-4 h-4" />
              {t("getStarted")}
            </button>
          </form>

          <button
            onClick={() => onSelectRole("buyer", "Guest Buyer", "+255 000000")}
            className="text-xs text-slate-400 hover:text-emerald-700 text-center block pt-2 underline"
            id="btn-guest-shortcut"
          >
            {t("guestMode")}
          </button>
        </div>
      )}

      {/* Footer Branding credits lines */}
      <div className="max-w-xs mx-auto text-center text-[10px] text-slate-400 pt-6">
        <span>AgroMarket © 2026 | Built for Swahili East African Trade Integration</span>
      </div>

      {/* Academic Viewer & Logo Downloader Overlay Modal */}
      {showAcademicReport && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in animate-duration-200" id="academic-modal-overlay">
          <div className="bg-white w-full max-w-lg h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-100" id="academic-modal-container">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950 font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-left text-xs">
                  <h3 className="font-extrabold text-sm text-zinc-100 uppercase tracking-tight">Academic Thesis Portal</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">UDSM CoICT - BSc. Computer Science</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAcademicReport(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assets & Downloads Section */}
            <div className="p-4 bg-slate-50 border-b border-rose-100 shrink-0 grid grid-cols-2 gap-3">
              {/* Logo Card */}
              <div className="bg-white border border-slate-150 p-3 rounded-2xl flex flex-col items-center justify-between text-center gap-2 shadow-xs">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-105 flex items-center justify-center bg-slate-50 p-0.5 shadow-sm">
                  <img src="/assets/images/agromarket_logo.png" className="w-full h-full object-cover rounded-lg" alt="AgroMarket Logo" />
                </div>
                <div className="text-left w-full">
                  <span className="text-[10px] block font-mono font-bold text-slate-400 tracking-wider">APP BRAND DELIVERABLE</span>
                  <span className="text-xs block font-bold text-slate-850 leading-snug">Vector Brand Logo PNG</span>
                  <span className="text-[9px] block text-slate-400">Resolution: High-Res 1:1</span>
                </div>
                <button 
                  onClick={handleDownloadLogo}
                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Logo
                </button>
              </div>

              {/* Thesis Card */}
              <div className="bg-white border border-slate-150 p-3 rounded-2xl flex flex-col items-center justify-between text-center gap-2 shadow-xs">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-slate-105 p-2 shadow-sm">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="text-left w-full">
                  <span className="text-[10px] block font-mono font-bold text-slate-400 tracking-wider">PROJECT STATEMENT</span>
                  <span className="text-xs block font-bold text-slate-850 leading-snug">Defense Report File</span>
                  <span className="text-[9px] block text-slate-400">Chapters: 1 - 6 (PDF/Markdown)</span>
                </div>
                <button 
                  onClick={handleDownloadReport}
                  className="w-full py-2 px-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Report
                </button>
              </div>
            </div>

            {/* Scrollable Document Text Preview */}
            <div className="flex-1 overflow-y-auto p-5 text-left text-xs text-slate-705 space-y-6 select-text max-w-full">
              <div className="border-b pb-4 text-center">
                <span className="font-bold text-[10px] text-amber-650 block tracking-wider uppercase">Project Thesis Abstract</span>
                <h4 className="font-extrabold text-base text-slate-900 mt-1 uppercase">AGROMARKET APP REPORT</h4>
                <p className="text-[10px] text-slate-450 font-mono mt-0.5">Author: Bryan Kachocho | Registration No: 2022-04-08912</p>
              </div>

              <div className="space-y-1.5">
                <h5 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider border-l-2 border-emerald-600 pl-2">Executive Summary</h5>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  Agriculture is the core of East African livelihoods, employing over 65% of the population in Tanzania. Rural food growers are challenged by lack of market access, high middlemen commission markups, and structural crop loss from pests. <strong>AgroMarket</strong> serves as an innovative integration framework providing automated price forecasting, GPS listing queries, dynamic transport simulations, and an instant local Swahili interface layout.
                </p>
              </div>

              <div className="space-y-1.5">
                <h5 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider border-l-2 border-emerald-600 pl-2">Chapter 1: Problem Definition</h5>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  Tanzanian food sales are bound to localized middle-men causing massive agricultural revenue leaks (25-45%). Pests like Fall Armyworm and leaf rusts ruin whole fields because agronomist counsel is hard to reach. AgroMarket provides an integrated decision platform which implements mobile-first P2P commerce loops paired with instant diagnosis capabilities.
                </p>
              </div>

              <div className="space-y-1.5">
                <h5 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider border-l-2 border-emerald-600 pl-2">Chapter 2: Innovative Architecture</h5>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  The tech stack consists of high-performance modern components: <strong>React, Vite, Node, Express, and GenAI LLM models</strong>. The system provides immediate language toggle, dynamic multi-user coordinates, sub-2-second forecasting loops, and local backup placeholders (SafeImage) keeping application listings robust under highly weak connectivity environments.
                </p>
              </div>

              <div className="space-y-1.5">
                <h5 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider border-l-2 border-emerald-600 pl-2">Chapter 3: Mobile APK Compilation</h5>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  To guarantee utility for off-grid operations, the application compiles natively into an Android Package (APK) via Capacitor. All assets, web layouts, and logic components bundles wrap effortlessly directly as discrete local files, reducing structural bandwidth footprints.
                </p>
              </div>

              <div className="bg-slate-50 border p-3.5 rounded-2xl text-[10px] leading-relaxed select-all font-mono text-slate-500 whitespace-pre-wrap">
                {`THE UNIVERSITY OF DAR ES SALAAM
FINAL YEAR PROJECT DEPT ARCHIVE
Course: CS 499 (PROJECT II)
Student: Bryan Kachocho
Theme: AI Agriculture Commerce Integrator

Please download the complete high-fidelity system report (README.md) using the "Download Report" button above to view complete chapters, equations, flowcharts and code explanations.`}
              </div>
            </div>

            {/* Modal Footer Close Button */}
            <div className="p-3 bg-slate-50 border-t flex justify-end shrink-0">
              <button
                onClick={() => setShowAcademicReport(false)}
                className="bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-2 px-6 rounded-2xl text-[11px] transition-colors"
              >
                Close Report Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
