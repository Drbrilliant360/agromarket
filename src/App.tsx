import { useState, useEffect } from "react";
import { 
  Role, Product, Order, Review, Complaint, FarmerEarnings, User 
} from "./types";
import { 
  INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS 
} from "./data";
import SplashScreen from "./components/SplashScreen";
import FarmerDashboard from "./components/FarmerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { Globe, GitMerge, RefreshCw, Layers, ShieldCheck } from "lucide-react";

export default function App() {
  // 1. Core Platform Roles and Contexts
  const [activeRole, setActiveRole] = useState<Role>(() => {
    const saved = localStorage.getItem("agro_role");
    return (saved as Role) || "splash";
  });

  const [language, setLanguage] = useState<"en" | "sw">(() => {
    const saved = localStorage.getItem("agro_lang");
    return (saved as "en" | "sw") || "en";
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("agro_user");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Shared State Arrays
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("agro_products");
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map(p => {
          if (p.id === "p1" && (!p.image || p.image.includes("unsplash.com") || p.image === "")) {
            return { ...p, image: "/assets/images/premium_maize_cobs_1779359037477.png" };
          }
          return p;
        });
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("agro_orders");
    if (saved) {
      try {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.map(o => {
          if (o.productId === "p1" && (!o.productImage || o.productImage.includes("unsplash.com") || o.productImage === "")) {
            return { ...o, productImage: "/assets/images/premium_maize_cobs_1779359037477.png" };
          }
          return o;
        });
      } catch (e) {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("agro_reviews");
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [farmerEarnings, setFarmerEarnings] = useState<FarmerEarnings>(() => {
    const saved = localStorage.getItem("agro_earnings");
    if (saved) return JSON.parse(saved);
    return {
      wallet: 1220000, // starting realistic funds (Tanzanian Shillings)
      earningsHistory: [
        { id: "h1", amount: 650000, type: "sale", date: "2026-05-18", detail: "Seed batch order Premium Maize (10 bags)" },
        { id: "h2", amount: 150000, type: "withdrawal", date: "2026-05-15", detail: "Withdraw via M-Pesa to +255 712 345 678" }
      ]
    };
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem("agro_complaints");
    if (saved) return JSON.parse(saved);
    return [
      { id: "cmp_421", orderId: "ord-1122", reporterName: "Michael Owino", reporterRole: "buyer", issue: "Fruit crates were slightly compressed during road transportation", status: "resolved", date: "2026-05-18" }
    ];
  });

  // 3. Write-Through LocalStorage Synchronization
  useEffect(() => {
    localStorage.setItem("agro_role", activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem("agro_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("agro_user", currentUser ? JSON.stringify(currentUser) : "");
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("agro_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("agro_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("agro_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("agro_earnings", JSON.stringify(farmerEarnings));
  }, [farmerEarnings]);

  useEffect(() => {
    localStorage.setItem("agro_complaints", JSON.stringify(complaints));
  }, [complaints]);

  // Handle entry registration via Splash screen
  const handleUserEntry = (electedRole: Role, name: string, phone: string) => {
    const usr: User = {
      id: electedRole === "farmer" ? "f1" : "u_buyer",
      name,
      phone,
      role: electedRole,
      avatar: electedRole === "farmer" ? "🌾" : "🛒",
      region: "Morogoro Region, Tanzania",
      walletBalance: electedRole === "farmer" ? 1220000 : 0
    };
    setCurrentUser(usr);
    setActiveRole(electedRole);
  };

  // Reset function to default mock database
  const resetDemoEnvironment = () => {
    if (window.confirm("Restore factory database defaults? All active sales and orders will be refreshed.")) {
      localStorage.clear();
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setReviews(INITIAL_REVIEWS);
      setFarmerEarnings({
        wallet: 1220000,
        earningsHistory: [
          { id: "h1", amount: 650000, type: "sale", date: "2026-05-18", detail: "Seed batch order Premium Maize (10 bags)" },
          { id: "h2", amount: 150000, type: "withdrawal", date: "2026-05-15", detail: "Withdraw via M-Pesa to +255 712 345 678" }
        ]
      });
      setComplaints([
        { id: "cmp_421", orderId: "ord-1122", reporterName: "Michael Owino", reporterRole: "buyer", issue: "Fruit crates were slightly compressed during road transportation", status: "resolved", date: "2026-05-18" }
      ]);
      setActiveRole("splash");
      setCurrentUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start relative select-none antialiased font-sans">
      
      {/* 🛠️ Floating Admin/Reviewer Multi-Role Dev-Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-zinc-300 py-2 px-3 flex flex-wrap gap-2 items-center justify-between z-50 text-[11px] font-sans antialiased sticky top-0" id="dev-bar-floating shadow">
        <div className="flex items-center gap-1.5 shrink-0">
          <GitMerge className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span className="font-bold text-slate-200">AgroMarket Simulator:</span>
        </div>

        {/* Custom triggers letting the reviewer switch portals in 1-click */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setActiveRole("splash")}
            className={`py-1 px-2.2 rounded-md font-medium select-none transition-all ${
              activeRole === "splash" ? "bg-emerald-600 text-white font-extrabold shadow-xs" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Splash Card
          </button>
          <button
            onClick={() => setActiveRole("farmer")}
            className={`py-1 px-2.2 rounded-md font-medium select-none transition-all ${
              activeRole === "farmer" ? "bg-emerald-600 text-white font-extrabold shadow-xs" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Farmer side
          </button>
          <button
            onClick={() => setActiveRole("buyer")}
            className={`py-1 px-2.2 rounded-md font-medium select-none transition-all ${
              activeRole === "buyer" ? "bg-emerald-600 text-white font-extrabold shadow-xs" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Buyer side
          </button>
          <button
            onClick={() => setActiveRole("admin")}
            className={`py-1 px-2.2 rounded-md font-medium select-none transition-all ${
              activeRole === "admin" ? "bg-amber-500 text-zinc-950 font-extrabold shadow-xs" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Admin side
          </button>
        </div>

        <button
          onClick={resetDemoEnvironment}
          className="flex items-center gap-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/40 rounded-md py-0.5 px-2 font-mono"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Demo
        </button>
      </div>

      {/* Main viewport frame mimicking a premium centered mobile viewport canvas inside large desktops */}
      <div className="flex-1 w-full max-w-lg mx-auto bg-white shadow-2xl relative flex flex-col justify-between min-h-screen">
        
        {activeRole === "splash" && (
          <SplashScreen
            language={language}
            setLanguage={setLanguage}
            onSelectRole={handleUserEntry}
          />
        )}

        {activeRole === "farmer" && (
          <FarmerDashboard
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            earnings={farmerEarnings}
            setEarnings={setFarmerEarnings}
            language={language}
            farmerId={currentUser?.id || "f1"}
            farmerName={currentUser?.name || "Bahati Mwangi"}
          />
        )}

        {activeRole === "buyer" && (
          <BuyerDashboard
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            reviews={reviews}
            setReviews={setReviews}
            complaints={complaints}
            setComplaints={setComplaints}
            language={language}
            buyerId={currentUser?.id || "u_buyer"}
            buyerName={currentUser?.name || "Sarah Mkami"}
            buyerPhone={currentUser?.phone || "+255 711 223 344"}
          />
        )}

        {activeRole === "admin" && (
          <AdminDashboard
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            complaints={complaints}
            setComplaints={setComplaints}
            language={language}
          />
        )}
      </div>
    </div>
  );
}
