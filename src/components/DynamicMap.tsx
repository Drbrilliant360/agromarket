import { useState, useEffect } from "react";
import { Pin, Navigation, TrendingUp, HelpCircle, MapPin } from "lucide-react";

interface MapPinPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "farm" | "buyer" | "hub" | "hotspot";
  details: string;
  crop?: string;
}

interface DynamicMapProps {
  mode: "nearby-farms" | "logistics-delivery" | "demand-heatmap";
  onSelectPin?: (pin: MapPinPoint) => void;
  language?: "en" | "sw";
}

const REGIONAL_PINS: MapPinPoint[] = [
  { id: "p-dar", name: "Dar Es Salaam Market Hub", lat: 310, lng: 180, type: "hub", details: "Main distribution depot and wholesale terminal", crop: "Multi-Produce" },
  { id: "p-moro", name: "Morogoro Green Acres", lat: 260, lng: 140, type: "farm", details: "Bahati Mwangi's farm (Maize & Coffee)", crop: "Premium Maize, Arabica Coffee" },
  { id: "p-arusha", name: "Arusha Highland Orchards", lat: 120, lng: 120, type: "farm", details: "Amina Juma's farm (Tomatoes & Potatoes)", crop: "Roma Tomatoes, Sweet Potatoes" },
  { id: "p-dodoma", name: "Dodoma Dry Grains hub", lat: 210, lng: 90, type: "hotspot", details: "High demand area for animal feed maize", crop: "Sorghum & Maize" },
  { id: "p-mbeya", name: "Mbeya Rich Ridge", lat: 330, lng: 60, type: "farm", details: "Emmanuel Mboya's organic grains field", crop: "Organic Basmati Rice" }
];

export default function DynamicMap({ mode, onSelectPin, language = "en" }: DynamicMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<MapPinPoint | null>(null);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Continuous light pulse animation inside SVG
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 100);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const titleText = {
    "nearby-farms": {
      en: "Discover Nearby Registered Farms",
      sw: "Tafuta Mashamba ya Karibu na Wewe"
    },
    "logistics-delivery": {
      en: "Real-time Shipping & Courier Tracker",
      sw: "Ufuatiliaji wa Safari za Madereva wa Agro"
    },
    "demand-heatmap": {
      en: "Smart Agronomy Regional Demand Map",
      sw: "Ramani ya Uhitaji Mkuu wa Mazao Kikanda"
    }
  }[mode][language];

  // Simulated moving delivery vehicle (Arusha to Dodoma or Morogoro to Dar)
  const deliveryX = 260 + (310 - 260) * (animationStep / 100);
  const deliveryY = 140 + (180 - 140) * (animationStep / 100);

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm" id={`div-${mode}-mapper`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          {mode === "nearby-farms" && <MapPin className="w-4 h-4 text-emerald-600" id="nearby-map-icon" />}
          {mode === "logistics-delivery" && <Navigation className="w-4 h-4 text-sky-500 animate-pulse" id="logistics-map-icon" />}
          {mode === "demand-heatmap" && <TrendingUp className="w-4 h-4 text-amber-500" id="demand-map-icon" />}
          {titleText}
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full font-mono uppercase">
          {mode}
        </span>
      </div>

      <div className="relative h-64 bg-emerald-50 bg-opacity-40 rounded-lg overflow-hidden border border-emerald-100/50 flex flex-col justify-end">
        {/* SVG Topography Map representation */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 280">
          <defs>
            {/* Heatmap radial Gradients */}
            <radialGradient id="dar-heat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dodoma-heat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Simulated Tanzanian Outline representation */}
          <path
            d="M 50,40 Q 150,20 280,30 T 360,90 Q 380,180 340,240 T 260,260 Q 140,230 80,210 T 30,120 Z"
            fill="#f2fcf7"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            className="transition-colors duration-500"
          />

          {/* Regional Lakes (Lake Victoria top, Tanganyika Left, Nyasa Sw) */}
          <path d="M 60,35 Q 110,12 140,30 Z" fill="#93c5fd" opacity="0.7" />
          <path d="M 22,100 Q 14,160 38,200" fill="none" stroke="#93c5fd" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
          <path d="M 120,250 Q 160,262 170,240" fill="none" stroke="#93c5fd" strokeWidth="6" strokeLinecap="round" opacity="0.5" />

          {/* Connecting Highways (Logistics Roads) */}
          <path
            d="M 120,120 L 210,90 L 260,140 L 310,180"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d="M 330,60 L 260,140"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Mode Specific overlays */}
          {mode === "demand-heatmap" && (
            <>
              {/* Heat spots */}
              <circle cx="310" cy="180" r="50" fill="url(#dar-heat)" />
              <circle cx="210" cy="90" r="45" fill="url(#dodoma-heat)" />
              <text x="310" y="215" fill="#d97706" fontSize="8" fontWeight="bold" textAnchor="middle">
                {language === "en" ? "GRAINS SHORTAGE" : "UHABA WA NAFAKA"}
              </text>
              <text x="210" y="115" fill="#dc2626" fontSize="8" fontWeight="bold" textAnchor="middle">
                {language === "en" ? "TOMATOES OVERFLOW" : "MUNDU NYANYA NYINGI"}
              </text>
            </>
          )}

          {/* Route Truck animation */}
          {mode === "logistics-delivery" && (
            <>
              {/* Transit path glowing trace */}
              <line x1="260" y1="140" x2="310" y2="180" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              {/* Animated courier vehicle dot */}
              <g transform={`translate(${deliveryX}, ${deliveryY})`}>
                <circle r="7" fill="#0ea5e9" className="animate-ping" opacity="0.6" />
                <circle r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
              </g>
              <text x={deliveryX} y={deliveryY - 10} fill="#0369a1" fontSize="9" fontWeight="bold" textAnchor="middle" className="bg-white">
                Agro Express
              </text>
            </>
          )}

          {/* Map point marker pins */}
          {REGIONAL_PINS.filter(pt => mode !== "nearby-farms" || pt.type === "farm").map((pt) => {
            const isSelected = selectedPoint?.id === pt.id;
            const markerColor = pt.type === "farm" ? "#10b981" : pt.type === "hub" ? "#0ea5e9" : "#f59e0b";

            return (
              <g
                key={pt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPoint(pt);
                  if (onSelectPin) onSelectPin(pt);
                }}
                className="cursor-pointer group"
              >
                {/* Visual ripple pulse for selected pins */}
                {isSelected && (
                  <circle
                    cx={pt.lng}
                    cy={pt.lat}
                    r="15"
                    fill={markerColor}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}
                {/* Standard hover expansion */}
                <circle
                  cx={pt.lng}
                  cy={pt.lat}
                  r={isSelected ? "8" : "6"}
                  fill={markerColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-300 group-hover:scale-125"
                />
                <circle
                  cx={pt.lng}
                  cy={pt.lat}
                  r="2"
                  fill="#ffffff"
                />
                {/* Mini label near PINs */}
                {!isSelected && (
                  <text
                    x={pt.lng}
                    y={pt.lat - 10}
                    fill="#334155"
                    fontSize="7"
                    fontWeight="semibold"
                    textAnchor="middle"
                    className="pointer-events-none opacity-80 group-hover:opacity-100"
                  >
                    {pt.name.split(" ")[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic legends bar inside the map */}
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs py-1.5 px-3 rounded-md shadow-xs border border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              {language === "en" ? "Farms" : "Mashamba"}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-white" />
              {language === "en" ? "LogisticsHub" : "Vituo vya Mizigo"}
            </span>
            {mode === "demand-heatmap" && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                {language === "en" ? "High Demand" : "Uhitaji Mkuu"}
              </span>
            )}
          </div>
          <span className="font-mono text-[9px] text-emerald-700 animate-pulse font-bold bg-emerald-50 px-1 rounded">
            ● SIMULATED GPS LIVE
          </span>
        </div>
      </div>

      {/* Footer popover displaying details of selected pin */}
      {selectedPoint && (
        <div className="mt-3 bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5 text-xs text-slate-700 flex flex-col gap-1 transition-all duration-300 antialiased" id="div-pin-inspect">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-emerald-900 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              {selectedPoint.name}
            </span>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-[11px] text-slate-600">{selectedPoint.details}</p>
          {selectedPoint.crop && (
            <div className="text-[10px] font-mono mt-1 text-slate-500 bg-white/85 py-0.5 px-1.5 rounded-sm inline-block self-start border border-slate-100">
              {language === "en" ? "Key Produce:" : "Mazao Makuu:"} <span className="text-emerald-800 font-bold">{selectedPoint.crop}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
