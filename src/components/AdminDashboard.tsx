import React, { useState } from "react";
import { 
  Users, ShoppingBag, ShieldAlert, BadgeCent, Map, BarChart4, 
  Trash2, Check, X, ShieldCheck, Flag, Truck, RefreshCw, Layers, Plus, Edit3
} from "lucide-react";
import { Product, Order, Complaint } from "../types";
import DynamicMap from "./DynamicMap";
import SafeImage from "./SafeImage";

interface AdminProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  language: "en" | "sw";
}

interface CourierDriver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: "idle" | "on-delivery" | "offline";
  currentRoute: string;
}

export default function AdminDashboard({
  products,
  setProducts,
  orders,
  setOrders,
  complaints,
  setComplaints,
  language
}: AdminProps) {
  const isSw = language === "sw";

  // Navigation tab
  const [activeTab, setActiveTab ] = useState<"users" | "products" | "payments" | "logistics" | "disputes">("payments");

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editProdName, setEditProdName] = useState("");
  const [editCategory, setEditCategory] = useState<any>("grains");
  const [editQty, setEditQty] = useState<number>(100);
  const [editUnit, setEditUnit] = useState("bags");
  const [editPrice, setEditPrice] = useState<number>(45000);
  const [editHarvestDate, setEditHarvestDate] = useState("2026-05-21");
  const [editFarmerId, setEditFarmerId] = useState("f1");
  const [editFarmerName, setEditFarmerName] = useState("Bahati Mwangi");
  const [editDesc, setEditDesc] = useState("");

  // Farmer / Seller CRUD states
  const [editingFarmer, setEditingFarmer] = useState<any | null>(null);
  const [addingFarmer, setAddingFarmer] = useState(false);
  const [farmerFormName, setFarmerFormName] = useState("");
  const [farmerFormPhone, setFarmerFormPhone] = useState("");
  const [farmerFormRegion, setFarmerFormRegion] = useState("");
  const [farmerFormVerified, setFarmerFormVerified] = useState(false);

  // Logistic / Carrier CRUD states
  const [editingCourier, setEditingCourier] = useState<CourierDriver | null>(null);
  const [addingCourier, setAddingCourier] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [courierPhone, setCourierPhone] = useState("");
  const [courierVehicle, setCourierVehicle] = useState("");
  const [courierStatus, setCourierStatus] = useState<"idle" | "on-delivery" | "offline">("idle");
  const [courierRoute, setCourierRoute] = useState("None");

  // Simulated Farmers registered on database
  const [farmers, setFarmers] = useState([
    { id: "f1", name: "Bahati Mwangi", phone: "+255 712 345 678", region: "Morogoro", verified: true, joinDate: "2025-10-12" },
    { id: "f2", name: "Amina Juma", phone: "+255 655 890 123", region: "Arusha", verified: true, joinDate: "2025-11-20" },
    { id: "f3", name: "Emmanuel Mboya", phone: "+255 784 567 890", region: "Mbeya", verified: false, joinDate: "2026-03-01" },
    { id: "f4", name: "Charles Temu", phone: "+255 690 112 233", region: "Dodoma", verified: false, joinDate: "2026-05-19" }
  ]);

  // Simulated courier drivers list
  const [couriers, setCouriers] = useState<CourierDriver[]>([
    { id: "dr-1", name: "Kassim Majaliwa", phone: "+255 715 000 111", vehicle: "Fuso Truck (T 554 AJM)", status: "on-delivery", currentRoute: "Morogoro -> Dar es Salaam" },
    { id: "dr-2", name: "John Mugisha", phone: "+255 652 999 888", vehicle: "Suzuki Carry Pick-Up", status: "idle", currentRoute: "None" },
    { id: "dr-3", name: "Sudi Salim", phone: "+255 765 444 333", vehicle: "Bajaj Cargo Trike", status: "on-delivery", currentRoute: "Arusha Regional Hub" }
  ]);

  // Platform calculations based on live orders
  const commissionPercentage = 0.05; // Platform pockets 5%
  const completedOrders = orders.filter(o => o.status === "completed");
  const escrowOrders = orders.filter(o => o.status === "pending" || o.status === "processing" || o.status === "shipping");

  const platformCommissionsEarned = completedOrders.reduce((acc, o) => acc + (o.totalAmount * commissionPercentage), 0);
  const platformEscrowHeld = escrowOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalFinancialFlow = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Verification toggles
  const toggleFarmerVerification = (id: string) => {
    setFarmers(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, verified: !f.verified };
      }
      return f;
    }));
  };

  // Decline/Delete farmers
  const removeFarmer = (id: string) => {
    if (window.confirm("Remove this agricultural account from platform?")) {
      setFarmers(prev => prev.filter(f => f.id !== id));
    }
  };

  // Manage disputes status
  const resolveComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: "resolved" as const };
      }
      return c;
    }));
  };

  // Products Admin Action Handlers
  const startEditingProduct = (p: Product) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditCategory(p.category);
    setEditQty(p.quantity);
    setEditUnit(p.unit);
    setEditPrice(p.price);
    setEditHarvestDate(p.harvestDate);
    setEditFarmerId(p.farmerId);
    setEditFarmerName(p.farmerName);
    setEditDesc(p.description || "");
    setAddingProduct(false);
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(prev => prev.map(p => {
      if (p.id === editingProduct.id) {
        const targetFarmer = farmers.find(f => f.id === editFarmerId);
        return {
          ...p,
          name: editProdName,
          category: editCategory,
          quantity: Number(editQty),
          unit: editUnit,
          price: Number(editPrice),
          harvestDate: editHarvestDate,
          farmerId: editFarmerId,
          farmerName: targetFarmer ? targetFarmer.name : editFarmerName,
          description: editDesc,
          stockStatus: Number(editQty) <= 0 ? "out-of-stock" : Number(editQty) < 20 ? "low-stock" : "in-stock" as any
        };
      }
      return p;
    }));
    setEditingProduct(null);
  };

  const handleAddProductAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFarmer = farmers.find(f => f.id === editFarmerId) || farmers[0];
    const newPr: Product = {
      id: "p_" + Date.now(),
      name: editProdName,
      category: editCategory,
      quantity: Number(editQty),
      unit: editUnit,
      price: Number(editPrice),
      harvestDate: editHarvestDate || "2026-05-21",
      deliveryOptions: "both",
      stockStatus: Number(editQty) <= 0 ? "out-of-stock" : Number(editQty) < 20 ? "low-stock" : "in-stock" as any,
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d20f6?auto=format&fit=crop&q=80&w=600",
      farmerId: targetFarmer?.id || "f1",
      farmerName: targetFarmer?.name || "Bahati Mwangi",
      farmerPhone: targetFarmer?.phone || "+255 712 345 678",
      farmerRating: 4.8,
      description: editDesc || "Certified crop listed via administration console."
    };
    setProducts(prev => [newPr, ...prev]);
    setAddingProduct(false);
    // reset form fields
    setEditProdName("");
    setEditDesc("");
  };

  const deleteProductAdmin = (id: string) => {
    if (window.confirm("Delete this listing from live market?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Farmer / Seller Admin Action Handlers
  const startEditingFarmer = (f: any) => {
    setEditingFarmer(f);
    setFarmerFormName(f.name);
    setFarmerFormPhone(f.phone);
    setFarmerFormRegion(f.region);
    setFarmerFormVerified(f.verified);
    setAddingFarmer(false);
  };

  const handleSaveFarmerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer) return;
    setFarmers(prev => prev.map(f => {
      if (f.id === editingFarmer.id) {
        return {
          ...f,
          name: farmerFormName,
          phone: farmerFormPhone,
          region: farmerFormRegion,
          verified: farmerFormVerified
        };
      }
      return f;
    }));
    setEditingFarmer(null);
  };

  const handleAddFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    const newFam = {
      id: "f_" + Date.now(),
      name: farmerFormName,
      phone: farmerFormPhone,
      region: farmerFormRegion,
      verified: farmerFormVerified,
      joinDate: new Date().toISOString().split("T")[0]
    };
    setFarmers(prev => [newFam, ...prev]);
    setAddingFarmer(false);
    // reset
    setFarmerFormName("");
    setFarmerFormPhone("");
    setFarmerFormRegion("");
    setFarmerFormVerified(false);
  };

  // Courier Admin Action Handlers
  const startEditingCourier = (dr: CourierDriver) => {
    setEditingCourier(dr);
    setCourierName(dr.name);
    setCourierPhone(dr.phone);
    setCourierVehicle(dr.vehicle);
    setCourierStatus(dr.status);
    setCourierRoute(dr.currentRoute);
    setAddingCourier(false);
  };

  const handleSaveCourierEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourier) return;
    setCouriers(prev => prev.map(dr => {
      if (dr.id === editingCourier.id) {
        return {
          ...dr,
          name: courierName,
          phone: courierPhone,
          vehicle: courierVehicle,
          status: courierStatus,
          currentRoute: courierRoute
        };
      }
      return dr;
    }));
    setEditingCourier(null);
  };

  const handleAddCourier = (e: React.FormEvent) => {
    e.preventDefault();
    const newDr: CourierDriver = {
      id: "dr_" + Date.now(),
      name: courierName,
      phone: courierPhone,
      vehicle: courierVehicle,
      status: courierStatus,
      currentRoute: courierRoute || "None"
    };
    setCouriers(prev => [...prev, newDr]);
    setAddingCourier(false);
    // reset
    setCourierName("");
    setCourierPhone("");
    setCourierVehicle("");
    setCourierStatus("idle");
    setCourierRoute("None");
  };

  const removeCourier = (id: string) => {
    if (window.confirm("Remove courier driver from the roster?")) {
      setCouriers(prev => prev.filter(dr => dr.id !== id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white antialiased font-sans" id="div-admin-panel">
      {/* Top Admin banner */}
      <div className="bg-zinc-950 p-4 border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block animate-pulse">
              PLATFORM CONSOLE ACTIVE
            </span>
            <h1 className="text-base font-black flex items-center gap-1.5 text-zinc-100">
              <Layers className="w-5 h-5 text-amber-500" />
              AgroMarket Administrative
            </h1>
          </div>
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono py-1 px-2 rounded-md text-[10px] font-bold">
            Root Admin
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full px-4 pt-4 flex-1 pb-20">
        {/* Quick overall counters */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-center">
            <span className="text-[9px] text-zinc-400 uppercase tracking-tight block">Escrow Buffer</span>
            <span className="text-sm font-black text-amber-400 font-mono block mt-1">
              {platformEscrowHeld.toLocaleString()} TZS
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-center">
            <span className="text-[9px] text-zinc-400 uppercase tracking-tight block">Commission</span>
            <span className="text-sm font-black text-emerald-400 font-mono block mt-1">
              {platformCommissionsEarned.toLocaleString()} TZS
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-center">
            <span className="text-[9px] text-zinc-400 uppercase tracking-tight block">Total Volume</span>
            <span className="text-sm font-black text-zinc-100 font-mono block mt-1">
              {totalFinancialFlow.toLocaleString()} TZS
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-3 border-b border-zinc-800 scrollbar-none">
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === "payments" ? "bg-amber-500 text-zinc-950 font-extrabold shadow-sm" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Ledger & Escrow
          </button>
          
          <button
            onClick={() => setActiveTab("users")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === "users" ? "bg-amber-500 text-zinc-950 font-extrabold shadow-sm" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Farms Verification
          </button>

          <button
            onClick={() => setActiveTab("logistics")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === "logistics" ? "bg-amber-500 text-zinc-950 font-extrabold shadow-sm" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Shipping Route
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all relative ${
              activeTab === "disputes" ? "bg-amber-500 text-zinc-950 font-extrabold shadow-sm" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Disputes Board
            {complaints.filter(c => c.status === "open").length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 w-3.5 h-3.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                {complaints.filter(c => c.status === "open").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === "products" ? "bg-amber-500 text-zinc-950 font-extrabold shadow-sm" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Crops Ledger
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === "payments" && (
          <div className="space-y-4" id="div-admin-tab-payments">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
              <span className="text-xs font-bold text-zinc-300 block mb-2">Escrow and Financial Stream Analysis</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                AgroMarket implements safe multi-signature escrow holding. Funds remain locked in platform ledger securely during packaging and courier transport. Funds release instantly to farmers once buyers verify delivery via security token scans.
              </p>
            </div>

            {/* Platform Transactions Ledger table */}
            <div>
              <span className="font-bold text-xs text-zinc-300 block mb-2">Live B2C Transaction Register</span>
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-zinc-500">ID: #{o.id} - {o.date}</span>
                      <span className={`uppercase font-bold ${o.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-zinc-300">
                      <span>{o.productName} <span className="text-[10px] text-zinc-500">x{o.quantity}</span></span>
                      <span className="font-bold font-mono">{o.totalAmount.toLocaleString()} TZS</span>
                    </div>

                    <div className="flex justify-between text-[10px] text-zinc-500 border-t border-zinc-850 pt-1.5 mt-1">
                      <span>Farmer: {o.farmerName}</span>
                      <span>Platform cut (5%): <span className="text-emerald-500 font-bold font-mono">{(o.totalAmount * 0.05).toLocaleString()} TZS</span></span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <span className="text-xs text-zinc-500 italic text-center block pt-4">No marketplace bookings completed yet.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4" id="div-admin-tab-users">
            <div className="flex justify-between items-center gap-2">
              <div>
                <h2 className="text-sm font-black text-zinc-100 uppercase tracking-wider block">Farmer Registry & Quality Audit</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">Full B2C seller directory and auditing desk.</p>
              </div>
              <button
                onClick={() => {
                  setAddingFarmer(!addingFarmer);
                  setEditingFarmer(null);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-1 rounded-md font-extrabold text-[10px] flex items-center gap-1 shrink-0 transition-colors"
              >
                <Plus className="w-3 h-3" />
                {addingFarmer ? "Close" : "Register Farmer"}
              </button>
            </div>

            {/* Seller/Farmer creation/editing form */}
            {(addingFarmer || editingFarmer) && (
              <form 
                onSubmit={editingFarmer ? handleSaveFarmerEdit : handleAddFarmer} 
                className="bg-zinc-950 border border-amber-500/20 p-4 rounded-xl text-xs space-y-3 animate-fade-in"
              >
                <h3 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                  {editingFarmer ? "Edit Farmer Account" : "Register New Verified Farmer"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono">Farmer Name</label>
                    <input
                      type="text"
                      required
                      value={farmerFormName}
                      onChange={(e) => setFarmerFormName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                      placeholder="Bahati Mwangi"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={farmerFormPhone}
                      onChange={(e) => setFarmerFormPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                      placeholder="+255 712 345 678"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono">Region</label>
                    <input
                      type="text"
                      required
                      value={farmerFormRegion}
                      onChange={(e) => setFarmerFormRegion(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                      placeholder="Morogoro / Arusha"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono">Verification Status</label>
                    <select
                      value={farmerFormVerified ? "true" : "false"}
                      onChange={(e) => setFarmerFormVerified(e.target.value === "true")}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                    >
                      <option value="false">Pending Verification</option>
                      <option value="true">Verified/Trusted</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setAddingFarmer(false); setEditingFarmer(null); }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-1.5 rounded font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-1.5 rounded font-bold transition-all"
                  >
                    {editingFarmer ? "Save Profile" : "Add to Registry"}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {farmers.map((f) => (
                <div key={f.id} className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-100 text-sm">{f.name}</h4>
                      <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-tight block mt-0.5">
                        Region: <span className="text-zinc-300">{f.region}</span> | Joined: {f.joinDate}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full flex items-center gap-1 ${
                      f.verified ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {f.verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {f.verified ? "Vetted / Trusted" : "Pending Vetting"}
                    </span>
                  </div>

                  <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400">Database Access: ACTIVE</span>
                    <span className="font-mono text-zinc-400">{f.phone}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFarmerVerification(f.id)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors ${
                        f.verified ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                      }`}
                    >
                      {f.verified ? "Revoke trusted seal" : "Certify Fair Trade Seal"}
                    </button>
                    <button
                      onClick={() => startEditingFarmer(f)}
                      className="px-3 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFarmer(f.id)}
                      className="px-3 border border-zinc-800 text-zinc-500 hover:text-red-500 rounded-lg hover:border-red-500 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "logistics" && (
          <div className="space-y-4" id="div-admin-tab-logistics">
            <div className="flex justify-between items-center gap-2">
              <div>
                <h2 className="text-sm font-black text-zinc-100 uppercase tracking-wider block">Live Fleet Logistics GPS Tracker</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">Real-time transit fleet and carrier roster.</p>
              </div>
              <button
                onClick={() => {
                  setAddingCourier(!addingCourier);
                  setEditingCourier(null);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-1 rounded-md font-extrabold text-[10px] flex items-center gap-1 shrink-0 transition-colors"
              >
                <Plus className="w-3 h-3" />
                {addingCourier ? "Close" : "Add Courier"}
              </button>
            </div>

            {/* Courier driver creation/editing form */}
            {(addingCourier || editingCourier) && (
              <form 
                onSubmit={editingCourier ? handleSaveCourierEdit : handleAddCourier} 
                className="bg-zinc-950 border border-amber-500/20 p-4 rounded-xl text-xs space-y-3 animate-fade-in"
              >
                <h3 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                  {editingCourier ? "Edit Courier Driver profile" : "Register Fleet Courier"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono">Driver Name</label>
                    <input
                      type="text"
                      required
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                      placeholder="Kassim Majaliwa"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono">Phone</label>
                    <input
                      type="text"
                      required
                      value={courierPhone}
                      onChange={(e) => setCourierPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                      placeholder="+255 715 000 111"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono">Vehicle Description</label>
                    <input
                      type="text"
                      required
                      value={courierVehicle}
                      onChange={(e) => setCourierVehicle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                      placeholder="Fuso Truck / Pick-Up"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono">GPS Status</label>
                    <select
                      value={courierStatus}
                      onChange={(e) => setCourierStatus(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 outline-none"
                    >
                      <option value="idle">idle (waiting)</option>
                      <option value="on-delivery">on-delivery</option>
                      <option value="offline">offline</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1 font-mono">Roster Route</label>
                  <input
                    type="text"
                    required
                    value={courierRoute}
                    onChange={(e) => setCourierRoute(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                    placeholder="Morogoro -> Dar es Salaam"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setAddingCourier(false); setEditingCourier(null); }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-1.5 rounded font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-1.5 rounded font-bold transition-all"
                  >
                    {editingCourier ? "Save Fleet Info" : "Register Courier"}
                  </button>
                </div>
              </form>
            )}

            <DynamicMap mode="logistics-delivery" language={language} />

            <div className="space-y-2">
              <span className="font-bold text-xs text-zinc-300 block mb-2 font-mono">Registered Shipping Carriers:</span>
              {couriers.map((dr) => (
                <div key={dr.id} className="bg-zinc-950 border border-zinc-850 p-3 rounded-xl flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-zinc-200 block">{dr.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{dr.vehicle}</span>
                    </div>
                    <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                      dr.status === "on-delivery" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : 
                      dr.status === "idle" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}>
                      {dr.status}
                    </span>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-850/50 p-2 rounded-lg text-[11px] flex justify-between">
                    <span className="text-zinc-500">Route: <span className="text-zinc-200 font-bold">{dr.currentRoute}</span></span>
                    <span className="font-mono text-zinc-400">{dr.phone}</span>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => startEditingCourier(dr)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => removeCourier(dr.id)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-4" id="div-admin-tab-products">
            <div className="flex justify-between items-center gap-2">
              <div>
                <h2 className="text-sm font-black text-zinc-100 uppercase tracking-wider block">Global Crops Ledger & Catalog</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">Platform-wide yield auditing and pricing controls.</p>
              </div>
              <button
                onClick={() => {
                  setAddingProduct(!addingProduct);
                  setEditingProduct(null);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-1 rounded-md font-extrabold text-[10px] flex items-center gap-1 shrink-0 transition-colors"
              >
                <Plus className="w-3 h-3" />
                {addingProduct ? "Close Form" : "List New Crop"}
              </button>
            </div>

            {/* Product Creation and Editing Form */}
            {(addingProduct || editingProduct) && (
              <form 
                onSubmit={editingProduct ? handleSaveProductEdit : handleAddProductAdmin} 
                className="bg-zinc-950 border border-amber-500/20 p-4 rounded-xl text-xs space-y-3 animate-fade-in"
              >
                <h3 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                  {editingProduct ? `Edit Crop: ${editingProduct.name}` : "Publish Seed / Harvest Entry"}
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono font-bold">Crop Name *</label>
                    <input
                      type="text"
                      required
                      value={editProdName}
                      onChange={(e) => setEditProdName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                      placeholder="Dry Maize Bags"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono font-bold">Cultivator (Farmer) *</label>
                    <select
                      value={editFarmerId}
                      onChange={(e) => {
                        const fid = e.target.value;
                        setEditFarmerId(fid);
                        const fam = farmers.find(f => f.id === fid);
                        if (fam) setEditFarmerName(fam.name);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                    >
                      {farmers.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.region})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono font-bold">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                    >
                      <option value="grains">Grains & Cereals</option>
                      <option value="vegetables">Fresh Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="tubers">Roots & Tubers</option>
                      <option value="pulses">Pulses & Beans</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono font-bold">Harvest Date</label>
                    <input
                      type="date"
                      value={editHarvestDate}
                      onChange={(e) => setEditHarvestDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none animate-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono font-bold">Roster Price (TZS)</label>
                    <input
                      type="number"
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none font-bold text-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono font-bold">Unit (e.g. bags)</label>
                    <input
                      type="text"
                      required
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                      placeholder="bags"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[10px] mb-1 font-mono font-bold">Quantity in Stock</label>
                    <input
                      type="number"
                      required
                      value={editQty}
                      onChange={(e) => setEditQty(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1 font-mono font-bold">Agronomic Crop description</label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded p-1.5 text-xs focus:border-amber-500 outline-none"
                    placeholder="E.g., Grade-A dry white maize with pristine moisture metrics."
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setAddingProduct(false); setEditingProduct(null); }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-1.5 rounded font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-1.5 rounded font-bold transition-all"
                  >
                    {editingProduct ? "Save Listing" : "Publish Crop"}
                  </button>
                </div>
              </form>
            )}

            {/* List of Products */}
            <div className="space-y-2">
              <span className="font-bold text-xs text-zinc-300 block mb-2 font-mono">Active Platform Catalog Listings:</span>
              {products.map((p) => (
                <div key={p.id} className="bg-zinc-950 border border-zinc-850 p-3 rounded-xl flex gap-3 text-xs animate-fade-in" id={`p-admin-card-${p.id}`}>
                  <SafeImage src={p.image} className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0" alt="" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-zinc-200 truncate">{p.name}</h4>
                        <span className="text-[9px] uppercase font-mono bg-zinc-855 px-1.5 py-0.5 rounded text-zinc-400 shrink-0 select-none">
                          {p.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        Farmer: <span className="text-zinc-300 font-bold">{p.farmerName}</span>
                      </span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-mono text-emerald-400 font-bold">{p.price.toLocaleString()} TZS / {p.unit}</span>
                        <span className="font-mono text-zinc-400">Qty: {p.quantity} {p.unit}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-zinc-900 mt-2 pt-2">
                      <button
                        onClick={() => startEditingProduct(p)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-amber-500" /> Edit
                      </button>
                      <button
                        onClick={() => deleteProductAdmin(p.id)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="space-y-4" id="div-admin-tab-disputes">
            <div>
              <h2 className="text-sm font-black text-zinc-100 uppercase tracking-wider block">Escrow Arbitration Disputes Board</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Review complaints filed, investigate courier route timeline logs, and decide whether to release or refund payment.</p>
            </div>

            <div className="space-y-2">
              {complaints.map((c) => (
                <div key={c.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs space-y-3" id={`comp-log-${c.id}`}>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                    <div>
                      <span className="font-bold text-red-400 block">TICKET #{c.id}</span>
                      <span className="text-[10px] text-zinc-500">Order disputed: #{c.orderId}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                      c.status === "resolved" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400 animate-pulse"
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-850/60 leading-relaxed text-zinc-300 text-[11px]">
                    <span className="text-zinc-500 text-[9px] block uppercase font-mono">Dispute reported by {c.reporterName}</span>
                    <p className="mt-1">"{c.issue}"</p>
                  </div>

                  {c.status === "open" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => resolveComplaint(c.id)}
                        className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 font-bold text-[11px] flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Resolve Complaint (Release Money)
                      </button>
                    </div>
                  )}

                  {c.status === "resolved" && (
                    <div className="text-emerald-400 bg-emerald-500/5 p-2 rounded-lg text-center font-bold text-[10px]">
                      ✓ Dispute settled. Refund adjusted and platform escrow updated.
                    </div>
                  )}
                </div>
              ))}
              {complaints.length === 0 && (
                <span className="text-xs text-zinc-500 italic text-center block pt-4">Excellent! Zero active customer disputes recorded.</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin bottom nav */}
      <div className="fixed bottom-0 inset-x-0 bg-zinc-950 border-t border-zinc-800 p-2 flex justify-around items-center z-40 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab("payments")}
          className={`flex flex-col items-center p-1 cursor-pointer ${activeTab === "payments" ? "text-amber-500 font-bold" : "text-zinc-500"}`}
        >
          <BadgeCent className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Finance</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex flex-col items-center p-1 cursor-pointer ${activeTab === "users" ? "text-amber-500 font-bold" : "text-zinc-500"}`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Sellers</span>
        </button>

        <button
          onClick={() => setActiveTab("logistics")}
          className={`flex flex-col items-center p-1 cursor-pointer ${activeTab === "logistics" ? "text-amber-500 font-bold" : "text-zinc-500"}`}
        >
          <Truck className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Fleet</span>
        </button>

        <button
          onClick={() => setActiveTab("disputes")}
          className={`flex flex-col items-center p-1 cursor-pointer relative ${activeTab === "disputes" ? "text-amber-500 font-bold" : "text-zinc-500"}`}
        >
          <Flag className="w-4 h-4" />
          {complaints.filter(c => c.status === "open").length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 w-3 h-3 rounded-full text-white text-[7px] flex items-center justify-center font-bold font-mono">
              {complaints.filter(c => c.status === "open").length}
            </span>
          )}
          <span className="text-[9px] mt-0.5">Disputes</span>
        </button>
      </div>
    </div>
  );
}
export interface BadgeCentProps extends React.SVGProps<SVGSVGElement> {}
