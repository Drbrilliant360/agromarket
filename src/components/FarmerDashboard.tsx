import React, { useState } from "react";
import { 
  Package, Plus, TrendingUp, Wallet, MessageSquare, Sprout, AlertCircle, 
  CheckCircle, Clock, Trash2, Globe, Heart, Check, X, ShieldAlert, Bug, HelpCircle, ArrowRight, Navigation,
  Edit3
} from "lucide-react";
import { Product, Order, Category, FarmerEarnings } from "../types";
import { CATEGORIES, LANG_DICT } from "../data";
import DynamicMap from "./DynamicMap";
import SafeImage from "./SafeImage";

interface FarmerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  earnings: FarmerEarnings;
  setEarnings: React.Dispatch<React.SetStateAction<FarmerEarnings>>;
  language: "en" | "sw";
  farmerId: string;
  farmerName: string;
}

export default function FarmerDashboard({
  products,
  setProducts,
  orders,
  setOrders,
  earnings,
  setEarnings,
  language,
  farmerId,
  farmerName
}: FarmerProps) {
  const isSw = language === "sw";
  const t = (key: string) => LANG_DICT[key]?.[language] || key;

  // Tabs navigation
  const [activeTab, setActiveTab] = useState<"inventory" | "add-product" | "orders" | "earnings" | "insights" | "chats">("inventory");

  // Local Chat state
  const [chats, setChats] = useState([
    { id: "c1", buyerName: "Sarah Mkami (Chakula Millers)", messages: [
      { sender: "buyer", text: "Hello Bahati, I want to purchase 100 bags of maize. Can we negotiate to 60,000 TZS per bag?", time: "09:30 AM" },
      { sender: "farmer", text: "Habari Sarah! I can offer 62,000 TZS per bag if you handle the collection directly at my Morogoro farm.", time: "09:42 AM" }
    ]},
    { id: "c2", buyerName: "Michael Juma (Hotel Caterers)", messages: [
      { sender: "buyer", text: "Are the tomatoes strictly organic? I require certificate proof.", time: "Yesterday" }
    ]}
  ]);
  const [activeChatId, setActiveChatId] = useState("c1");
  const [chatInput, setChatInput] = useState("");

  // AI Insights State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [pestInput, setPestInput] = useState("");
  const [cropForPest, setCropForPest] = useState("Maize");
  const [forecastCrop, setForecastCrop] = useState("Premium Maize (Mahindi Safi)");

  // Form states for adding product
  const [newProdName, setNewProdName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("grains");
  const [newQty, setNewQty] = useState<number>(100);
  const [newUnit, setNewUnit] = useState("bags");
  const [newPrice, setNewPrice] = useState<number>(45000);
  const [newHarvestDate, setNewHarvestDate] = useState("2026-05-21");
  const [newDelivery, setNewDelivery] = useState<"pickup" | "delivery" | "both">("both");
  const [newDesc, setNewDesc] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Form state for withdrawals
  const [withdrawAmount, setWithdrawAmount] = useState<number>(20000);
  const [withdrawMethod, setWithdrawMethod] = useState("M-Pesa");
  const [withdrawPhone, setWithdrawPhone] = useState("+255 712 345 678");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  // Crop list detailed editing CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("grains");
  const [editQty, setEditQty] = useState<number>(100);
  const [editUnit, setEditUnit] = useState("bags");
  const [editPrice, setEditPrice] = useState<number>(45000);
  const [editHarvestDate, setEditHarvestDate] = useState("2026-05-21");
  const [editDelivery, setEditDelivery] = useState<"pickup" | "delivery" | "both">("both");
  const [editDesc, setEditDesc] = useState("");

  const startEditing = (p: Product) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditCategory(p.category);
    setEditQty(p.quantity);
    setEditUnit(p.unit);
    setEditPrice(p.price);
    setEditHarvestDate(p.harvestDate);
    setEditDelivery(p.deliveryOptions || "both");
    setEditDesc(p.description || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(prev => prev.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: editProdName,
          category: editCategory,
          quantity: Number(editQty),
          unit: editUnit,
          price: Number(editPrice),
          harvestDate: editHarvestDate,
          deliveryOptions: editDelivery,
          description: editDesc,
          stockStatus: Number(editQty) <= 0 ? "out-of-stock" : Number(editQty) < 20 ? "low-stock" : "in-stock" as any
        };
      }
      return p;
    }));
    setEditingProduct(null);
  };

  // Filter products for this farmer
  const farmerProducts = products.filter(p => p.farmerId === farmerId);
  const farmerOrders = orders.filter(o => o.farmerId === farmerId);

  // Quick statistics
  const totalStockCount = farmerProducts.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockCrops = farmerProducts.filter(p => p.quantity < 20);
  const totalReceivedSales = farmerOrders.filter(o => o.status === "completed").reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingOrders = farmerOrders.filter(o => o.status === "pending" || o.status === "processing");

  // Handler for adding new product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newPrice) return;

    // Default crop illustrations based on category
    const cropImages: Record<Category, string> = {
      grains: "https://images.unsplash.com/photo-1551754655-cd27e38d20f6?auto=format&fit=crop&q=80&w=600",
      vegetables: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
      fruits: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
      tubers: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600",
      "cash-crops": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600"
    };

    const newPr: Product = {
      id: "p_" + Date.now(),
      name: newProdName,
      category: newCategory,
      quantity: Number(newQty),
      unit: newUnit,
      price: Number(newPrice),
      harvestDate: newHarvestDate,
      deliveryOptions: newDelivery,
      stockStatus: Number(newQty) <= 0 ? "out-of-stock" : Number(newQty) < 20 ? "low-stock" : "in-stock",
      image: cropImages[newCategory] || cropImages.grains,
      farmerId,
      farmerName,
      farmerPhone: "+255 712 345 678",
      farmerRating: 4.8,
      description: newDesc || "Fresh homegrown organic produce, cultivated with optimal farming practices."
    };

    setProducts(prev => [newPr, ...prev]);
    setFormSuccess(true);
    setNewProdName("");
    setNewDesc("");
    setTimeout(() => setFormSuccess(false), 3000);
  };

  // Handler for direct inventory quantity edit
  const updateStockQty = (productId: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextQty = Math.max(0, p.quantity + delta);
        return {
          ...p,
          quantity: nextQty,
          stockStatus: nextQty <= 0 ? "out-of-stock" : nextQty < 20 ? "low-stock" : "in-stock" as any
        };
      }
      return p;
    }));
  };

  // Remove a product
  const deleteProduct = (id: string) => {
    if (window.confirm(isSw ? "Je, uko tayari kufuta bidhaa hii kwenye orodha?" : "Are you sure you want to delete this listing?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Handler for updating Order Statuses
  const setOrderStatus = (orderId: string, nextStatus: any) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: nextStatus };
      }
      return ord;
    }));

    // If a Farmer marks order as "completed" or "accepted", but wait,
    // "buyer receives goods" releases payment. However, if completed, lets credit the farmer wallet too (simulating successful cycle)!
    if (nextStatus === "completed") {
      const orderMatch = orders.find(o => o.id === orderId);
      if (orderMatch) {
        setEarnings(prev => ({
          wallet: prev.wallet + orderMatch.totalAmount,
          earningsHistory: [
            {
              id: "earn_" + Date.now(),
              amount: orderMatch.totalAmount,
              type: "sale",
              date: new Date().toISOString().split("T")[0],
              detail: `${isSw ? "Fauda ya Zao:" : "Produce Sale:"} ${orderMatch.productName} (x${orderMatch.quantity})`
            },
            ...prev.earningsHistory
          ]
        }));
      }
    }
  };

  // Chat message send utility
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            { sender: "farmer", text: chatInput, time: "Just Now" }
          ]
        };
      }
      return c;
    }));
    setChatInput("");
  };

  // Call Express API backends for AI crop predictions
  const getApiUrl = (endpoint: string) => {
    const isMobileApp = 
      typeof window !== "undefined" && 
      (window.location.protocol === "file:" || 
       window.location.protocol.startsWith("capacitor") || 
       window.location.hostname === "localhost" && !window.location.port);
    
    if (isMobileApp) {
      return `https://ais-pre-lmna3sj3pudbyfqjoltu3m-870026227889.europe-west2.run.app${endpoint}`;
    }
    return endpoint;
  };

  const fetchCropForecast = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(getApiUrl("/api/ai/predict-price"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropName: forecastCrop, region: "Kilimanjaro, Tanzania", language }),
      });
      const data = await res.json();
      setAiResult({ type: "forecast", data });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchPestDiagnosis = async () => {
    if (!pestInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(getApiUrl("/api/ai/pest-diagnose"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropName: cropForPest, symptoms: pestInput, language }),
      });
      const data = await res.json();
      setAiResult({ type: "pest", data });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > earnings.wallet) {
      alert(isSw ? "Huna salio la kutosha kutoa kiasi hicho!" : "Insufficient wallet balance!");
      return;
    }

    setEarnings(prev => ({
      wallet: prev.wallet - withdrawAmount,
      earningsHistory: [
        {
          id: "with_" + Date.now(),
          amount: withdrawAmount,
          type: "withdrawal",
          date: new Date().toISOString().split("T")[0],
          detail: `${isSw ? "Utoaji Pesa wa" : "Withdrawal via"} ${withdrawMethod} to ${withdrawPhone}`
        },
        ...prev.earningsHistory
      ]
    }));
    setWithdrawalSuccess(true);
    setWithdrawAmount(0);
    setTimeout(() => setWithdrawalSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 antialiased" id="div-farmer-panel">
      {/* Mobile Top Header Banner */}
      <div className="bg-emerald-900 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <span className="text-xs text-emerald-300 font-bold uppercase tracking-widest block">
              {isSw ? "MSAIDIZI WA SOKO" : "SELLER MOBILE HARVEST"}
            </span>
            <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-1.5">
              <Sprout className="w-5 h-5 text-emerald-400" />
              AgroMarket Seller
            </h1>
          </div>
          <div className="bg-emerald-800 text-emerald-100 py-1.5 px-3 rounded-lg text-xs font-mono font-medium">
            {farmerName}
          </div>
        </div>
      </div>

      {/* Quick Dashboard Action Cards */}
      <div className="max-w-lg mx-auto w-full px-4 pt-4 flex-1 pb-24">
        {/* Dynamic Farmer Profile Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center gap-4 mb-4">
          <div className="relative">
            <SafeImage
              src="/assets/images/african_farmer_avatar_1779357840679.png"
              alt={farmerName}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
              ✓
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider block font-mono">
              {isSw ? "Mkulima Aliyethibitishwa" : "Verified Agri-Merchant"}
            </span>
            <h2 className="text-base font-black text-slate-800 leading-tight">
              {farmerName}
            </h2>
            <p className="text-[10px] text-slate-500">
              {isSw ? "Standard Premium Quality Grower • Morogoro, Tanzania" : "Standard Premium Quality Grower • Morogoro, Tanzania"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            onClick={() => setActiveTab("inventory")}
            className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
              activeTab === "inventory" ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20" : "bg-white border-slate-100 shadow-xs"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Package className="w-4 h-4" />
              </span>
              {lowStockCrops.length > 0 && (
                <span className="animate-pulse bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {lowStockCrops.length} Alert
                </span>
              )}
            </div>
            <div className="mt-3">
              <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block">
                {isSw ? "Mitungi / Mazao" : "Total Crop Stocks"}
              </span>
              <span className="text-xl font-bold text-slate-800">
                {totalStockCount} <span className="text-xs text-slate-500 font-normal">units</span>
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab("earnings")}
            className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
              activeTab === "earnings" ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20" : "bg-white border-slate-100 shadow-xs"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Wallet className="w-4 h-4" />
              </span>
              {earnings.wallet > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="mt-3">
              <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block">
                {isSw ? "Salio Shambani" : "Escrow Wallet"}
              </span>
              <span className="text-lg font-bold text-slate-800">
                {earnings.wallet.toLocaleString()} TZS
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Section Contents based on active tab */}
        {activeTab === "inventory" && (
          <div className="space-y-4" id="div-tab-inventory">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {isSw ? "Hazina ya Mazao yako" : "Your Active Inventory"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isSw ? "Ongeza au rekebisha viwango vya mazao yako sokoni." : "Modify crop listings, toggle stock thresholds."}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("add-product")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-2 font-medium flex items-center gap-1 text-xs shadow-xs transition-colors"
                id="btn-add-harvest"
              >
                <Plus className="w-3.5 h-3.5" />
                {isSw ? "Kuvuna Vipya" : "New Harvest"}
              </button>
            </div>

            {/* Out of stock alert banner if any */}
            {lowStockCrops.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex gap-2.5 text-xs items-start animate-fade-in" id="div-low-stock-box">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{isSw ? "Arifa ya Hazina Imepungua!" : "Action Required: Low Stock Items!"}</span>
                  <p className="text-[11px] opacity-90">
                    {isSw ? "Baadhi ya bidhaa zinaanza kuisha hivi karibuni. Ongeza uzalishaji kuepusha upotevu wa soko." : "Certain produce lines are falling near depleted states. Buyers cannot purchase if depleted."}
                  </p>
                </div>
              </div>
            )}

            {editingProduct ? (
              <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    {isSw ? "Hariri Maelezo ya Zao" : "Edit Crop Details"}
                  </h3>
                  <button 
                    onClick={() => setEditingProduct(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded-md"
                  >
                    {isSw ? "Ghairi" : "Cancel"}
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1 font-mono">{t("prodName")} *</label>
                    <input
                      type="text"
                      required
                      value={editProdName}
                      onChange={(e) => setEditProdName(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1 font-mono">{t("category")}</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-hidden"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>
                            {isSw ? c.labelSw : c.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1 font-mono">{t("harvestDate")}</label>
                      <input
                        type="date"
                        required
                        value={editHarvestDate}
                        onChange={(e) => setEditHarvestDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1 font-mono">{t("quantity")}</label>
                      <input
                        type="number"
                        required
                        value={editQty}
                        onChange={(e) => setEditQty(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1 font-mono">{t("unit")}</label>
                      <input
                        type="text"
                        required
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 font-mono">{t("pricePerUnit")}</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-16 pr-3 py-2.5 text-sm font-semibold font-mono text-emerald-955"
                      />
                      <div className="absolute inset-y-0 left-0 bg-slate-100 border-r border-slate-200 font-bold px-3 flex items-center rounded-l-xl text-[10px] text-slate-500">
                        TZS / unit
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 font-mono">{t("deliveryOption")}</label>
                    <select
                      value={editDelivery}
                      onChange={(e) => setEditDelivery(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-hidden"
                    >
                      <option value="both">{t("bothPickupDelivery")}</option>
                      <option value="delivery">{t("deliveryOnly")}</option>
                      <option value="pickup">{t("pickupOnly")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 font-mono">{t("description")}</label>
                    <textarea
                      rows={3}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      {isSw ? "Ghairi" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      {isSw ? "Hifadhi" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {farmerProducts.length === 0 ? (
              <div className="bg-white border rounded-2xl py-12 px-4 text-center border-dashed border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">{isSw ? "Bado haujaweka mazao sokoni" : "No crops in your list yet"}</p>
                <p className="text-xs text-slate-400 mt-1">{isSw ? "Mazao yako yatatangazwa kwa mamia ya wanunuzi pindi utakapoongeza." : "Publish some produce and buyers in Tanzania will find you instantly!"}</p>
                <button
                  onClick={() => setActiveTab("add-product")}
                  className="mt-4 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> {isSw ? "Weka Zao la Kwanza" : "Add Your First Crop"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {farmerProducts.map((p) => {
                  const matchingCategory = CATEGORIES.find(c => c.id === p.category);
                  return (
                    <div key={p.id} className="bg-white border text-slate-800 border-slate-100 rounded-2xl p-4 flex gap-3 shadow-xs relative" id={`prod-card-${p.id}`}>
                      <SafeImage src={p.image} className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0" alt={p.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">{p.name}</h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => startEditing(p)}
                              className="text-slate-400 hover:text-emerald-600 p-0.5 transition-colors"
                              title={isSw ? "Hariri" : "Edit"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(p.id)}
                              className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full inline-block bg-slate-100 text-slate-600 mt-1">
                          {isSw ? matchingCategory?.labelSw : matchingCategory?.labelEn}
                        </span>

                        <div className="flex items-center justify-between mt-3 bg-slate-50/50 rounded-lg p-1.5 border border-slate-100/50">
                          <div>
                            <span className="text-[10px] text-slate-400 block tracking-tight">
                              {isSw ? "Hazina iliyopo" : "In Stock"}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-800">
                              {p.quantity} {p.unit}
                            </span>
                          </div>
                          
                          {/* Stock Quick adjusters */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button 
                              onClick={() => updateStockQty(p.id, -5)}
                              className="w-6 h-6 rounded-md border text-slate-500 bg-white shadow-xs hover:bg-slate-100 font-bold text-xs"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => updateStockQty(p.id, 5)}
                              className="w-6 h-6 rounded-md border text-slate-500 bg-white shadow-xs hover:bg-slate-100 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                          <span className="text-xs text-emerald-800 font-bold">
                            {p.price.toLocaleString()} TZS / {p.unit}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono uppercase ${
                            p.stockStatus === "in-stock" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            p.stockStatus === "low-stock" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-red-50 text-red-700 border border-red-100"
                          }`}>
                            {p.stockStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}
          </div>
        )}

        {activeTab === "add-product" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm" id="div-tab-add-product">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-emerald-600" />
              {isSw ? "Weka Mazao Sokoni" : "Publish New Produce"}
            </h2>
            <p className="text-xs text-slate-500 mb-4 pb-2 border-b border-slate-100">
              {isSw ? "Weka taarifa kamili za mazao uliyovuna ili wanunuzi waagize." : "Ensure descriptions capture optimal quality and cultivation parameters to trust-seal buyers."}
            </p>

            {formSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex gap-2 text-xs items-center animate-bounce">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{isSw ? "Mazao yamechapishwa kwa ufanisi!" : "Excellent! Crop listing launched successfully to B2C market."}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1 font-mono">{t("prodName")} *</label>
                <input
                  type="text"
                  required
                  placeholder={isSw ? "Mfano. Nyanya Safi Morogoro" : "e.g., Premium Yellow Dry Maize"}
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1 font-mono">{t("category")}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-hidden"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {isSw ? c.labelSw : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1 font-mono">{t("harvestDate")}</label>
                  <input
                    type="date"
                    required
                    value={newHarvestDate}
                    onChange={(e) => setNewHarvestDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1 font-mono">{t("quantity")}</label>
                  <input
                    type="number"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1 font-mono">{t("unit")}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., bags, crates, kg"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 font-mono">{t("pricePerUnit")}</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-16 pr-3 py-2.5 text-sm font-semibold font-mono text-emerald-900"
                  />
                  <div className="absolute inset-y-0 left-0 bg-slate-100 border-r border-slate-200 font-bold px-3 flex items-center rounded-l-xl text-[10px] text-slate-500">
                    TZS / unit
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 font-mono">{t("deliveryOption")}</label>
                <select
                  value={newDelivery}
                  onChange={(e) => setNewDelivery(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-hidden"
                >
                  <option value="both">{t("bothPickupDelivery")}</option>
                  <option value="delivery">{t("deliveryOnly")}</option>
                  <option value="pickup">{t("pickupOnly")}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 font-mono">{t("description")}</label>
                <textarea
                  rows={3}
                  placeholder={isSw ? "Sifa za mazao, jinsi yalivyopandwa, upatikanaji..." : "Moisture percentages, soil status, packaging details..."}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm mt-3"
              >
                <Sprout className="w-4 h-4" />
                {t("publishProduct")}
              </button>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4" id="div-tab-orders">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isSw ? "Maagizo Kwenye Shamba" : "Manage Incoming Orders"}
              </h2>
              <p className="text-xs text-slate-500">
                {isSw ? "Dhibiti hatua za ufungashaji, usafirishaji na malipo." : "Confirm buyer deposits, dispatch to courier, complete cycles."}
              </p>
            </div>

            {pendingOrders.length > 0 && (
              <div className="bg-sky-50 border border-sky-200 text-sky-950 rounded-xl p-3 flex gap-2.5 text-xs items-start">
                <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <span className="font-bold">{isSw ? "Mwonekano Kamili wa Mizigo" : "Active Packaging Cycles"}</span>
                  <p className="opacity-90 text-[11px]">
                    {isSw ? "Una maagizo yanayosubiri hatua yako. Fanya haraka kukidhi tamaa ya mlaji." : "Once package is ready, click Dispatch. When buyer scans the verification QR code, payment will unlock."}
                  </p>
                </div>
              </div>
            )}

            {farmerOrders.length === 0 ? (
              <div className="bg-white border rounded-2xl py-12 px-4 text-center border-slate-100">
                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">{isSw ? "Huna bado maagizo kutoka kwa wanunuzi" : "No orders received yet"}</p>
                <p className="text-xs text-slate-400 mt-1">{isSw ? "Hakikisha unatangaza bei nzuri kuvutia wateja." : "Wait for client pushes, check M-Pesa status regularly."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {farmerOrders.map((o) => (
                  <div key={o.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col gap-3 text-xs" id={`order-card-${o.id}`}>
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 block tracking-tight">
                          ORDER #{o.id}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          {o.date}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                        o.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        o.status === "rejected" ? "bg-red-50 text-red-600" :
                        "bg-sky-50 text-sky-700 border border-sky-100"
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <SafeImage src={o.productImage} className="w-12 h-12 rounded-lg object-cover shrink-0" alt={o.productName} />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-slate-800 text-sm block truncate">{o.productName}</span>
                        <div className="flex justify-between mt-1 text-slate-500 text-[11px]">
                          <span>Quantity ordered: <span className="text-slate-700 font-bold">{o.quantity} units</span></span>
                          <span className="font-semibold text-slate-700">Total: {o.totalAmount.toLocaleString()} TZS</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl text-[11px]">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Buyer Name:</span>
                        <span className="font-semibold text-slate-700">{o.buyerName}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Contact:</span>
                        <span className="font-mono text-slate-700">{o.buyerPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payment:</span>
                        <span className="uppercase text-emerald-800 font-bold">{o.paymentMethod} Payment</span>
                      </div>
                    </div>

                    {/* Stage transition controls for farmers */}
                    {o.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOrderStatus(o.id, "processing")}
                          className="flex-1 bg-emerald-600 text-white rounded-lg py-2 font-semibold text-[11px] flex justify-center items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> {isSw ? "Kubali & Safisha" : "Accept & Package"}
                        </button>
                        <button
                          onClick={() => setOrderStatus(o.id, "rejected")}
                          className="px-3 border text-slate-400 hover:text-red-500 rounded-lg py-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {o.status === "processing" && (
                      <button
                        onClick={() => setOrderStatus(o.id, "shipping")}
                        className="w-full bg-sky-600 text-white rounded-lg py-2 font-semibold text-[11px] flex justify-center items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" /> {isSw ? "Kusafirisha Sasa" : "Courier Dispatched"}
                      </button>
                    )}

                    {o.status === "shipping" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center text-amber-800 text-[10px] leading-relaxed">
                        ⚠️ {isSw ? "Tunaelekea kupokelewa. Mnunuzi ana nambari ya uthibitishaji iliyo na QR msalabani." : "Waiting for buyer to scan physical QR code or approve delivery status locally."}
                        <button
                          onClick={() => setOrderStatus(o.id, "completed")}
                          className="mt-2 w-full bg-emerald-700 text-white py-1 rounded font-bold"
                        >
                          {isSw ? "Kulazimisha Kupokewa" : "Force Delivered (Simulated Delivery)"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "earnings" && (
          <div className="space-y-4" id="div-tab-earnings">
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-md">
              <span className="text-[10px] uppercase text-emerald-300 font-bold tracking-wider block">
                {isSw ? "Pesa Inayolipika Leo" : "Total Soluble Earnings (Escrow Released)"}
              </span>
              <span className="text-3xl font-extrabold block mt-1">
                {earnings.wallet.toLocaleString()} TZS
              </span>
              <p className="text-[10px] text-emerald-200 mt-2">
                {isSw ? "Ununuzi kutoka kwa mabadilishano yote ya soko huwekwa hapa pindi mlaji anapothibitisha bidhaa." : "Funds clear to wallet directly after physical escrow release token triggers."}
              </p>
            </div>

            {/* Custom Interactive SVG Sales Chart */}
            <div className="bg-white border text-slate-900 border-slate-100 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                {isSw ? "Ripoti ya Mauzo (Masaa ya Hivi Karibuni)" : "Weekly Revenue Velocity Reporting"}
              </span>
              <div className="h-28 relative flex items-end w-full border-b border-l border-slate-100 pb-2 pt-4">
                {/* SVG curve or bars */}
                <svg className="absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 320 80">
                  <path
                    d="M 10 75 Q 60 40 120 60 T 240 20 T 310 30"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Scatter circle markers */}
                  <circle cx="10" cy="75" r="4" fill="#047857" stroke="#ffffff" />
                  <circle cx="60" cy="40" r="4" fill="#047857" stroke="#ffffff" />
                  <circle cx="120" cy="60" r="4" fill="#047857" stroke="#ffffff" />
                  <circle cx="240" cy="20" r="4" fill="#047857" stroke="#ffffff" />
                  <circle cx="310" cy="30" r="4" fill="#047857" stroke="#ffffff" />
                </svg>

                {/* X labels */}
                <div className="absolute inset-x-0 bottom-0 flex justify-between px-3 text-[8px] text-slate-400 font-mono translate-y-4">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-5 pt-1 border-t border-slate-50">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 bg-emerald-500 rounded-sm" />
                  {isSw ? "Kasi ya Mauzo halisi" : "Actual Sales Revenue"}
                </span>
                <span className="text-emerald-700 font-semibold font-mono">
                  +38% {isSw ? "mwezi huu" : "this period"}
                </span>
              </div>
            </div>

            {/* Simulated Withdraw Form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs text-xs">
              <span className="font-bold text-slate-800 block mb-1">
                {isSw ? "Kutoa Fedha papo hapo" : "Withdraw Funds Immediately"}
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                {isSw ? "Toa pesa kutoka kwenye mkoba wako kwenda simu yako ya mkononi." : "Directly cash out via M-Pesa channels, standard service charges apply."}
              </p>

              {withdrawalSuccess && (
                <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex gap-2 items-center">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{isSw ? "Uhamisho wa salio umekamilika kikamilifu!" : "Payout complete! Funds sent to your mobile wallet."}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawal} className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-mono mb-0.5">Mobile Payee Provider</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="M-Pesa">Vodacom M-Pesa</option>
                    <option value="Tigo Pesa">Tigo Pesa</option>
                    <option value="Airtel Money">Airtel Money</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-mono mb-0.5">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={withdrawPhone}
                      onChange={(e) => setWithdrawPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-mono mb-0.5">Amount (TZS)</label>
                    <input
                      type="number"
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={earnings.wallet <= 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold shadow-xs transition-opacity"
                >
                  {isSw ? "Toa Pesa Sasa" : "Initialize Instant Withdrawal"}
                </button>
              </form>
            </div>

            {/* Earnings logs */}
            <div>
              <span className="font-bold text-slate-800 block mb-2">{isSw ? "Taarifa ya Mikamila" : "Recent Account Ledger Logs"}</span>
              <div className="space-y-2">
                {earnings.earningsHistory.map((h) => (
                  <div key={h.id} className="bg-white border border-slate-100 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-medium text-slate-800 block">{h.detail}</span>
                      <span className="text-[10px] text-slate-400">{h.date}</span>
                    </div>
                    <span className={`font-mono font-bold ${h.type === "sale" ? "text-emerald-600" : "text-amber-600"}`}>
                      {h.type === "sale" ? "+" : "-"}{h.amount.toLocaleString()} TZS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-4" id="div-tab-insights">
            {/* African Context AI Agronomy Banner */}
            <div className="relative overflow-hidden rounded-2xl h-44 shadow-xs bg-emerald-950 flex flex-col justify-end p-5">
              <SafeImage
                src="/assets/images/agronomy_assistant_1779357884464.png"
                alt="AI Agronomy Concept"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="bg-emerald-600/90 text-white font-mono text-[9px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider inline-block">
                  Gemini Smart Agronomist
                </span>
                <h3 className="text-base font-black text-white leading-tight">
                  {isSw ? "Ushauri wa Shamba wa AI" : "Generative AI Real-Time Agri Engine"}
                </h3>
                <p className="text-[11px] text-emerald-100/90 leading-relaxed font-medium">
                  {isSw ? "Tathmini bei za sasa, dharura za wadudu, na rasilimali ukitumia nguvu ya Gemini." : "Get targeted AI crop pricing forecasts, leaf disease diagnostics, and real-time yield advisories."}
                </p>
              </div>
            </div>

            {/* Quick interactive modules */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
              <span className="font-bold text-slate-800 text-xs block mb-1">
                {isSw ? "1. Utabiri wa Bei na Muhula wa Soko" : "Module 1: AI Future Price Oracle"}
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                {isSw ? "Kadiria bei ya mazao mkoani kwako kwa miezi 6 ijayo upate ushauri." : "Obtain a 6-month forecasted price graph and advisory warnings generated via active AI analysis."}
              </p>

              <div className="flex gap-2">
                <select
                  value={forecastCrop}
                  onChange={(e) => setForecastCrop(e.target.value)}
                  className="flex-1 bg-slate-50 text-xs border border-slate-200 rounded-lg p-2 text-slate-700 font-medium"
                >
                  <option value="Premium Maize (Mahindi)">Premium Maize</option>
                  <option value="Aromatic Rice (Mchele)">Aromatic Rice</option>
                  <option value="Roma Tomatoes (Nyanya)">Plum Tomatoes</option>
                  <option value="Arabica Coffee (Kahawa)">Arabica Coffee</option>
                </select>
                <button
                  onClick={fetchCropForecast}
                  disabled={aiLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg"
                >
                  {aiLoading ? "..." : (isSw ? "Utabiri wa AI" : "Predict Prices")}
                </button>
              </div>
            </div>

            {/* Plant Pathologist Selector */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs text-xs">
              <span className="font-bold text-slate-800 block mb-1">
                {isSw ? "2. Msaidizi wa Afya ya Mimea (Pest & Disease AI)" : "Module 2: AI Plant Pathology Clinic"}
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                {isSw ? "Eleza ugonjwa wa majani au wadudu uwaonee tiba ya haraka." : "Describe leaf decay, yellowing spots, or worm traces to prescribe organic/chemical treatments instantly."}
              </p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="text-slate-500 font-mono py-1">Affected Crop:</span>
                  <select
                    value={cropForPest}
                    onChange={(e) => setCropForPest(e.target.value)}
                    className="flex-1 bg-slate-100 border-none rounded p-1 text-slate-700"
                  >
                    <option value="Maize">Maize (Mahindi)</option>
                    <option value="Coffee">Coffee (Kahawa)</option>
                    <option value="Tomato">Tomato (Nyanya)</option>
                    <option value="Rice">Rice (Mchele)</option>
                  </select>
                </div>
                
                <textarea
                  rows={2}
                  value={pestInput}
                  onChange={(e) => setPestInput(e.target.value)}
                  placeholder={isSw ? "Mfano. Majani yana vijidudu vya kijani na mashimo karibu na whorl..." : "e.g., leaves have yellow halos and white crumbly patches underneath..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />

                <button
                  onClick={fetchPestDiagnosis}
                  disabled={aiLoading || !pestInput.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg py-2 font-bold flex items-center justify-center gap-1.5"
                >
                  <Bug className="w-4 h-4" />
                  {isSw ? "Gundua na Tibu AI" : "Diagnose Crop Issue Now"}
                </button>
              </div>
            </div>

            {/* Regional Demand Plot */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs text-xs">
              <span className="font-bold text-slate-800 block mb-1.5">
                {isSw ? "3. Ramani ya Ushauri wa Mazao na Hali ya Hewa" : "Module 3: Regional Planting Advisories"}
              </span>
              <DynamicMap mode="demand-heatmap" language={language} />
            </div>

            {/* AI Results Output Drawer / Viewer */}
            {aiLoading && (
              <div className="bg-white border rounded-2xl p-6 text-center animate-pulse">
                <Sprout className="w-8 h-8 text-emerald-600 mx-auto animate-spin mb-2" />
                <span className="font-semibold text-slate-700 block">{isSw ? "Msaidizi wa Gemini anajibu..." : "Gemini AI structuring crop model..."}</span>
                <p className="text-xs text-slate-400 mt-1">{isSw ? "Inapitia mifumo ya kihistoria na soko la kanda." : "Performing deep agronomy calculations on historical databases."}</p>
              </div>
            )}

            {aiResult && aiResult.type === "forecast" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm animate-fade-in text-xs text-slate-700" id="ai-forecast-result">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {isSw ? "Matokeo ya Utabiri wa AI" : "GenAI Price Forecast Output"}
                  </span>
                  <button onClick={() => setAiResult(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">ESTIMATED CURRENT RATE</span>
                    <span className="text-sm font-black text-emerald-800">{aiResult.data.currentPrice?.toLocaleString()} {aiResult.data.currency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">TREND DIRECTION</span>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 rounded">{aiResult.data.priceTrend}</span>
                  </div>
                </div>

                <p className="bg-emerald-50 text-[11px] p-2.5 rounded-xl text-emerald-950 italic border border-emerald-100 mb-3 font-medium leading-relaxed">
                  {aiResult.data.analysis}
                </p>

                {/* Drawn SVG predicted graph */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-2">6 Months Forecast Matrix</span>
                  <div className="h-28 border-b border-l border-slate-100 relative flex items-end pt-5">
                    <div className="flex justify-around w-full items-end h-full px-2">
                      {aiResult.data.forecast?.map((f: any, i: number) => (
                        <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono text-emerald-700 font-bold">{f.price?.toLocaleString()}</span>
                          <div 
                            className="bg-emerald-500 rounded-t-xs hover:bg-emerald-600 transition-all cursor-pointer" 
                            style={{ width: "22px", height: `${Math.min(65, (f.price / aiResult.data.currentPrice) * 35)}px` }} 
                          />
                          <span className="text-[8px] text-slate-400 font-sans">{f.month?.substring(0,3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">⚠️ Seasonal Warnings & Risks</span>
                  {aiResult.data.risks?.map((r: string, idx: number) => (
                    <p key={idx} className="text-[11px] text-slate-600 pl-2.5 border-l-2 border-amber-500 leading-snug">
                      {r}
                    </p>
                  ))}

                  <span className="font-bold text-slate-800 block text-xs mt-3">💡 Farmers Strategy Board</span>
                  {aiResult.data.recommendation?.map((rec: string, idx: number) => (
                    <p key={idx} className="text-[11px] text-slate-600 pl-2.5 border-l-2 border-emerald-500 leading-snug">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {aiResult && aiResult.type === "pest" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm animate-fade-in text-xs text-slate-700" id="ai-pest-result">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    {isSw ? "Matokeo ya Uchunguzi AI" : "AI Pathologist Diagnosis Report"}
                  </span>
                  <button onClick={() => setAiResult(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-lg">×</button>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-amber-50/50 rounded-xl mb-3 border border-amber-100">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-mono">SUSPECTED AGRO ISSUE</span>
                    <span className="text-sm font-black text-slate-800">{aiResult.data.diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-mono">SEVERITY</span>
                    <span className="text-xs font-bold font-mono text-red-700">Level {aiResult.data.severity} / 10</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-emerald-800 block mb-1">🌿 Organic & Biological Remediation</span>
                    <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                      {aiResult.data.organicControl?.map((item: string, idx: number) => (
                        <li key={idx} className="leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-amber-800 block mb-1">🧴 Safe Chemical Options (If organic fails)</span>
                    <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                      {aiResult.data.chemicalControl?.map((item: string, idx: number) => (
                        <li key={idx} className="leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block mb-1">🛡️ Preventive Steps for Future Seasons</span>
                    <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {aiResult.data.prevention?.map((item: string, idx: number) => (
                        <li key={idx} className="leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "chats" && (
          <div className="bg-white border border-slate-100 rounded-2xl flex flex-col h-[400px] overflow-hidden shadow-xs" id="div-tab-chats">
            <div className="grid grid-cols-3 h-full">
              {/* Left Contacts columns */}
              <div className="border-r border-slate-100 h-full flex flex-col pt-2 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 uppercase font-mono px-3 block mb-2">{isSw ? "Mazungumzo" : "Buyers list"}</span>
                {chats.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveChatId(c.id)}
                    className={`py-3 px-3 cursor-pointer text-[11px] border-b border-slate-100 transition-colors ${
                      c.id === activeChatId ? "bg-white font-bold border-l-4 border-l-emerald-600 text-emerald-950" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block truncate">{c.buyerName.split(" ")[0]}</span>
                    <span className="text-[9px] text-slate-400 font-normal block truncate">
                      {c.messages[c.messages.length - 1]?.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right messages panel */}
              <div className="col-span-2 flex flex-col h-full bg-white">
                {/* Chat header */}
                <div className="p-3 border-b border-slate-100 font-bold text-slate-800 text-xs truncate bg-slate-50/30">
                  {chats.find(c => c.id === activeChatId)?.buyerName}
                </div>

                {/* Messages scroller */}
                <div className="flex-grow p-3 overflow-y-auto space-y-2 flex flex-col">
                  {chats.find(c => c.id === activeChatId)?.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[85%] rounded-2xl p-2.5 text-[11px] leading-relaxed relative ${
                        m.sender === "farmer"
                          ? "bg-emerald-600 text-white self-end rounded-tr-none"
                          : "bg-slate-100 text-slate-800 self-start rounded-tl-none"
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className="text-[8px] opacity-70 block text-right mt-1 font-mono">
                        {m.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Send input */}
                <div className="p-2 border-t border-slate-100 flex gap-1.5 bg-slate-50/50">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isSw ? "Andika ujumbe hapa..." : "Type reply..."}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-grow text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-hidden"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-emerald-600 text-white rounded-xl px-3 py-1.5 text-xs font-bold"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Floating Pill Footer Nav */}
      <div className="fixed bottom-3 inset-x-3 bg-white/95 backdrop-blur-md border border-slate-150 rounded-2xl py-2 px-2.5 flex justify-around items-center z-45 max-w-sm mx-auto shadow-lg ring-1 ring-black/5 animate-fade-in">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 duration-100 flex-1 ${
            activeTab === "inventory" ? "text-emerald-800 font-extrabold" : "text-slate-450 hover:text-slate-750"
          }`}
          style={{ minHeight: "44px" }}
        >
          <Package className={`w-[18px] h-[18px] transition-transform duration-200 ${activeTab === "inventory" ? "scale-110 text-emerald-800" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{isSw ? "Hazina" : "Inventory"}</span>
          {activeTab === "inventory" && (
            <div className="w-1 h-1 bg-emerald-850 rounded-full mt-0.5 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("add-product")}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 duration-100 flex-1 ${
            activeTab === "add-product" ? "text-emerald-800 font-extrabold" : "text-slate-450 hover:text-slate-750"
          }`}
          style={{ minHeight: "44px" }}
        >
          <Plus className={`w-[18px] h-[18px] transition-transform duration-200 ${activeTab === "add-product" ? "scale-110 text-emerald-800" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{isSw ? "Panga" : "Publish"}</span>
          {activeTab === "add-product" && (
            <div className="w-1 h-1 bg-emerald-850 rounded-full mt-0.5 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 duration-100 flex-1 relative ${
            activeTab === "orders" ? "text-emerald-800 font-extrabold" : "text-slate-450 hover:text-slate-750"
          }`}
          style={{ minHeight: "44px" }}
        >
          <div className="relative">
            <Clock className={`w-[18px] h-[18px] transition-transform duration-200 ${activeTab === "orders" ? "scale-110 text-emerald-800" : ""}`} />
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-400 text-white rounded-full text-[7.5px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                {pendingOrders.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{isSw ? "Maagizo" : "Orders"}</span>
          {activeTab === "orders" && (
            <div className="w-1 h-1 bg-emerald-850 rounded-full mt-0.5 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 duration-100 flex-1 ${
            activeTab === "insights" ? "text-emerald-800 font-extrabold" : "text-slate-450 hover:text-slate-750"
          }`}
          style={{ minHeight: "44px" }}
        >
          <Sprout className={`w-[18px] h-[18px] transition-transform duration-200 ${activeTab === "insights" ? "scale-110 text-emerald-800" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{isSw ? "AI Ushauri" : "Agri AI"}</span>
          {activeTab === "insights" && (
            <div className="w-1 h-1 bg-emerald-850 rounded-full mt-0.5 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("chats")}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 duration-100 flex-1 ${
            activeTab === "chats" ? "text-emerald-800 font-extrabold" : "text-slate-450 hover:text-slate-750"
          }`}
          style={{ minHeight: "44px" }}
        >
          <MessageSquare className={`w-[18px] h-[18px] transition-transform duration-200 ${activeTab === "chats" ? "scale-110 text-emerald-800" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{isSw ? "Chats" : "Soga"}</span>
          {activeTab === "chats" && (
            <div className="w-1 h-1 bg-emerald-850 rounded-full mt-0.5 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
