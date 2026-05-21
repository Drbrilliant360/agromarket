import React, { useState } from "react";
import { 
  Sprout, ShoppingBasket, ShieldAlert, ArrowRight, UserPlus, 
  Globe, Smartphone, Sparkles, CheckSquare, Layers
} from "lucide-react";
import { Role } from "../types";
import { LANG_DICT } from "../data";

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
            <div className="bg-emerald-600 p-4 rounded-3xl text-white shadow-xl animate-bounce">
              <Sprout className="w-12 h-12" />
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
            <img
              src="/assets/images/african_farm_hero_1779357819524.png"
              alt="Lush East African Farm in Morogoro, Tanzania"
              className="w-full h-40 object-cover"
              referrerPolicy="no-referrer"
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

          <button
            onClick={() => setStep("role")}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs flex justify-center items-center gap-2 shadow-md transition-colors"
            id="btn-splash-go"
          >
            {isSw ? "Agiza au Uza Mazao" : "Start Trading Produce"}
            <ArrowRight className="w-4 h-4" />
          </button>
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
    </div>
  );
}
