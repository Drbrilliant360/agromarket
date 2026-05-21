import React, { useState } from "react";
import { 
  Search, ShoppingBasket, MapPin, Star, Minus, Plus, ChevronRight, X, 
  Wallet, Shield, MessageSquare, FileText, Award, CheckCircle, Smartphone, AlertTriangle
} from "lucide-react";
import { Product, Order, Category, Review, OrderStatus, Complaint } from "../types";
import { CATEGORIES, LANG_DICT } from "../data";
import DynamicMap from "./DynamicMap";

interface BuyerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  language: "en" | "sw";
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
}

interface CartItem {
  product: Product;
  quantitySelected: number;
}

export default function BuyerDashboard({
  products,
  setProducts,
  orders,
  setOrders,
  reviews,
  setReviews,
  complaints,
  setComplaints,
  language,
  buyerId,
  buyerName,
  buyerPhone
}: BuyerProps) {
  const isSw = language === "sw";
  const t = (key: string) => LANG_DICT[key]?.[language] || key;

  // Tabs layout
  const [activeTab, setActiveTab] = useState<"marketplace" | "basket" | "orders" | "complaints">("marketplace");

  // Selection filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");

  // Detail Drawer States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qtySelector, setQtySelector] = useState(1);
  const [reviewRatingInput, setReviewRatingInput] = useState(5);
  const [reviewCommentInput, setReviewCommentInput] = useState("");

  // Cart Local State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // decimal e.g. 0.1 for 10%
  const [couponFeedback, setCouponFeedback] = useState("");

  // Simulated Mobile Money PIN Overlay States
  const [paymentProvider, setPaymentProvider] = useState<"m-pesa" | "tigo-pesa" | "airtel-money">("m-pesa");
  const [checkoutPhone, setCheckoutPhone] = useState(buyerPhone);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Complaint log states
  const [complaintText, setComplaintText] = useState("");
  const [complaintOrderSelect, setComplaintOrderSelect] = useState("");
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Cart Metrics
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantitySelected), 0);
  const deliveryDistanceFee = cart.length > 0 ? 8000 : 0; // Flat-rate delivery simulation
  const discountedSubtotal = cartSubtotal * (1 - appliedDiscount);
  const cartTotal = discountedSubtotal + deliveryDistanceFee;

  // Add Item to cart
  const handleAddToCart = (prod: Product, q: number) => {
    if (prod.quantity < q) {
      alert(isSw ? "Pole, mkulima hana kiasi hicho kwa sasa!" : "Sorry, the farmer has insufficient stock items!");
      return;
    }

    setCart(prev => {
      const matchIndex = prev.findIndex(item => item.product.id === prod.id);
      if (matchIndex > -1) {
        const updated = [...prev];
        const nextQty = updated[matchIndex].quantitySelected + q;
        if (nextQty > prod.quantity) {
          alert(isSw ? "Umezidi kiasi kilichopo safarini!" : "Exceeds remaining farmer stock!");
          return prev;
        }
        updated[matchIndex].quantitySelected = nextQty;
        return updated;
      }
      return [...prev, { product: prod, quantitySelected: q }];
    });

    setSelectedProduct(null);
    setQtySelector(1);
    setActiveTab("basket");
  };

  const updateCartQty = (prodId: string, q: number) => {
    const targetProduct = products.find(p => p.id === prodId);
    if (!targetProduct) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === prodId) {
          const nextQty = Math.max(1, item.quantitySelected + q);
          if (nextQty > targetProduct.quantity) {
            alert(isSw ? "Umezidi kiasi kilichopo shambani!" : "Cannot exceed existing stock!");
            return item;
          }
          return { ...item, quantitySelected: nextQty };
        }
        return item;
      }).filter(item => item.quantitySelected > 0);
    });
  };

  const removeCartItem = (prodId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== prodId));
  };

  // Coupon Checker
  const checkCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "AGROGOLD" || code === "KILIMANJARO") {
      setAppliedDiscount(0.15); // 15% VIP discount
      setCouponFeedback(isSw ? "Kuponi imekubaliwa! Punguza 15% ya gharama" : "Coupon applied successfully! 15% discount on produce");
    } else {
      setAppliedDiscount(0);
      setCouponFeedback(isSw ? "Kuponi si sahihi." : "Invalid promo coupon code.");
    }
  };

  // Payment triggers Pin input dialogue sheet
  const handleStartCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setShowPinPrompt(true);
  };

  // Submit payment code
  const submitPaymentPin = () => {
    if (enteredPin.length < 4) {
      alert(isSw ? "Ingiza nambari zote 4 za siri za M-Pesa!" : "Please enter your full 4-digit security PIN!");
      return;
    }

    setCheckoutProcessing(true);
    setShowPinPrompt(false);

    setTimeout(() => {
      // Create Order items for *each* product checked out
      const createdOrders: Order[] = cart.map(item => {
        const orderId = "ord-" + Math.floor(1000 + Math.random() * 9000);
        return {
          id: orderId,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          quantity: item.quantitySelected,
          totalAmount: item.product.price * item.quantitySelected * (1 - appliedDiscount),
          deliveryFee: deliveryDistanceFee / cart.length,
          paymentMethod: paymentProvider,
          phoneNumber: checkoutPhone,
          buyerId,
          buyerName,
          buyerPhone,
          farmerId: item.product.farmerId,
          farmerName: item.product.farmerName,
          status: "pending",
          date: new Date().toISOString().split("T")[0],
          qrCodeValue: `VERIFY-${orderId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        };
      });

      // Deduct stock levels from shared products list
      setProducts(prev => prev.map(p => {
        const itemOrdered = cart.find(item => item.product.id === p.id);
        if (itemOrdered) {
          const nextQ = Math.max(0, p.quantity - itemOrdered.quantitySelected);
          return {
            ...p,
            quantity: nextQ,
            stockStatus: nextQ <= 0 ? "out-of-stock" : nextQ < 20 ? "low-stock" : "in-stock" as any
          };
        }
        return p;
      }));

      setOrders(prev => [...createdOrders, ...prev]);
      setLastCompletedOrder(createdOrders[0]);
      setCart([]);
      setEnteredPin("");
      setCheckoutProcessing(false);
      setActiveTab("orders");
    }, 2500); // realistic payment latency simulation
  };

  // Buyer releases money
  const handleConfirmReceived = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: "completed" as OrderStatus };
      }
      return o;
    }));
  };

  // Buyer submits review
  const handleAddReview = (prod: Product) => {
    if (!reviewCommentInput.trim()) return;

    const newRev: Review = {
      id: "rev_" + Date.now(),
      productId: prod.id,
      productName: prod.name,
      buyerName,
      rating: reviewRatingInput,
      comment: reviewCommentInput,
      date: new Date().toISOString().split("T")[0]
    };

    setReviews(prev => [newRev, ...prev]);
    setReviewCommentInput("");
    alert(isSw ? "Asante kwa kutoa maoni yako sahihi ya kiwango!" : "Review submitted successfully! Thank you for establishing trust.");
  };

  // Buyer files a complaint
  const handleFileComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || !complaintOrderSelect) return;

    const newComp: Complaint = {
      id: "cmp_" + Math.floor(100 + Math.random() * 900),
      orderId: complaintOrderSelect,
      reporterName: buyerName,
      reporterRole: "buyer",
      issue: complaintText,
      status: "open",
      date: new Date().toISOString().split("T")[0]
    };

    setComplaints(prev => [newComp, ...prev]);
    setComplaintText("");
    setComplaintSuccess(true);
    setTimeout(() => setComplaintSuccess(false), 3000);
  };

  const buyerOrders = orders.filter(o => o.buyerId === buyerId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative antialiased" id="div-buyer-panel">
      {/* Mobile Top Header */}
      <div className="bg-emerald-700 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <span className="text-xs text-emerald-200 font-bold uppercase tracking-widest block">
              {isSw ? "SOKO KIGANJANI" : "AGRO B2C MARKETPLACE"}
            </span>
            <span className="text-lg font-extrabold tracking-tight flex items-center gap-1.5 font-sans">
              <ShoppingBasket className="w-5 h-5 text-emerald-300" />
              AgroMarket
            </span>
          </div>
          <div className="bg-emerald-800 text-emerald-100 py-1 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            M-Pesa Connected
          </div>
        </div>
      </div>

      {checkoutProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-center items-center z-[100] p-4 text-center">
          <div className="bg-white p-6 rounded-2xl max-w-xs shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mb-4" />
            <span className="text-sm font-bold text-slate-800">{isSw ? "Inasubiri uthibitisho M-Pesa..." : "Awaiting M-Pesa PIN trigger..."}</span>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {isSw ? "Tafadhali kagua simu yako na uweke namba ya siri salama ili kukamilisha ununuzi mkuu." : "Simulating financial handshake with Vodacom GSM gateway... Do not close window."}
            </p>
          </div>
        </div>
      )}

      {/* Simulated Mobile Prompt PIN popup UI */}
      {showPinPrompt && (
        <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-xs z-[100] flex justify-end flex-col" id="div-mobilemoney-prompt">
          <div className="bg-zinc-800 text-white rounded-t-3xl max-w-lg mx-auto w-full p-5 space-y-4 shadow-2xl font-sans" id="inner-pesa-keypad">
            <div className="flex justify-between items-center border-b border-zinc-700 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-extrabold uppercase tracking-wide text-emerald-400 font-mono">
                  {paymentProvider} Prompt PIN
                </span>
              </div>
              <button onClick={() => { setShowPinPrompt(false); setEnteredPin(""); }} className="text-zinc-400 hover:text-white font-bold text-lg">
                ×
              </button>
            </div>

            <div className="p-4 bg-zinc-900 rounded-2xl text-center border border-zinc-700">
              <span className="text-zinc-400 text-[10px] block uppercase font-mono tracking-wider">Merchant: AgroMarket B2C Marketplace</span>
              <span className="text-lg font-black block text-emerald-400 mt-1">{cartTotal.toLocaleString()} TZS</span>
              
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border-2 border-emerald-400 ${
                      enteredPin.length > i ? "bg-emerald-400" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Custom Interactive On-Screen Phone Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto text-center" id="mobile-keypad-panel">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => enteredPin.length < 4 && setEnteredPin(prev => prev + val)}
                  className="bg-zinc-700 text-white py-3 rounded-lg font-bold text-base hover:bg-zinc-600 active:bg-zinc-500 font-mono"
                >
                  {val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEnteredPin("")}
                className="bg-zinc-700 text-zinc-300 py-3 rounded-lg text-xs hover:bg-zinc-600 font-mono"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => enteredPin.length < 4 && setEnteredPin(prev => prev + "0")}
                className="bg-zinc-700 text-white py-3 rounded-lg font-bold text-base hover:bg-zinc-600 font-mono"
              >
                0
              </button>
              <button
                type="button"
                onClick={submitPaymentPin}
                className="bg-emerald-600 text-white py-3 rounded-lg text-xs font-bold hover:bg-emerald-500 font-sans"
              >
                OK
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 text-center leading-normal">
              SECURE INTEGRATION VERIFIED BY BANK ESCROW NETWORKS
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-lg mx-auto w-full px-4 pt-4 flex-1 pb-20">
        
        {activeTab === "marketplace" && (
          <div className="space-y-4" id="div-tab-marketplace">
            {/* African Context Marketplace Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-xs h-36 bg-slate-200">
              <img
                src="/assets/images/marketplace_banner_1779357863132.png"
                alt="Vibrant African Open-Air Produce Stall"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
                <div>
                  <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest block font-mono">
                    {isSw ? "Soko Leo" : "Fresh Daily Market"}
                  </span>
                  <h3 className="text-sm font-black text-white leading-tight">
                    {isSw ? "Mazao Bora Kutoka Shambani" : "Premium Direct Farm Produce"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Search and location */}
            <div className="flex gap-2 bg-white border border-slate-100 p-2.5 rounded-2xl shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-50 outline-hidden pl-9 pr-3 py-2 text-slate-800 rounded-xl"
                />
              </div>
            </div>

            {/* Categories scroll area */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="category-badge-scroller">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`py-1.5 px-3 rounded-full text-xs font-medium border shrink-0 transition-all ${
                  selectedCategory === "all" ? "bg-emerald-700 border-emerald-700 text-white" : "bg-white text-slate-600 border-slate-100"
                }`}
              >
                {isSw ? "Yote" : "All Produce"}
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium border shrink-0 transition-all ${
                    selectedCategory === cat.id ? "bg-emerald-700 border-emerald-700 text-white" : "bg-white text-slate-600 border-slate-100"
                  }`}
                >
                  {isSw ? cat.labelSw : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Simulated Live Map of Farmers */}
            <DynamicMap mode="nearby-farms" language={language} onSelectPin={(pt) => {
              // On coordinate PIN click, auto-filter the marketplace by farmer's name to explore their crops
              setSearchQuery(pt.name.split(" ")[0]);
            }} />

            {/* Crop Listing results */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-slate-800 block uppercase tracking-wider">
                {searchQuery || selectedCategory !== "all" ? (isSw ? "Matokeo Yaliyopatikana" : "Filter Search Results") : t("featuredProducts")}
              </span>

              {filteredProducts.length === 0 ? (
                <div className="bg-white border rounded-2xl py-12 text-center border-dashed">
                  <span className="text-slate-300 text-base font-bold block">No crops found</span>
                  <p className="text-xs text-slate-400 mt-1">Try searching another category or dry shell staples.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3" id="marketplace-grid flex">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedProduct(p); setQtySelector(1); }}
                      className="bg-white border text-slate-900 border-slate-100 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all"
                      id={`prod-${p.id}`}
                    >
                      <div className="relative">
                        <img src={p.image} className="w-full h-24 object-cover rounded-xl" alt={p.name} />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/65 backdrop-blur-xs text-white text-[9px] font-mono py-0.5 px-1.5 rounded-md font-bold">
                          {p.quantity} {p.unit}
                        </span>
                      </div>

                      <div className="mt-2 text-xs">
                        <h4 className="font-bold text-slate-900 truncate">{p.name}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Mkoa: Morogoro</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-1 border-t border-slate-50 pt-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] text-slate-600 font-bold">{p.farmerRating}</span>
                          <span className="text-[9px] text-slate-400">({p.farmerName.split(" ")[0]})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-xs">
                        <span className="font-bold text-emerald-800">
                          {p.price.toLocaleString()} TZS <span className="font-normal text-[9px] text-slate-400">/{p.unit}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Details overlay sheet */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-xs z-50 flex justify-end flex-col" id="div-prod-detail-overlay">
            <div className="bg-white rounded-t-3xl max-w-lg mx-auto w-full max-h-[90%] overflow-y-auto p-5 text-slate-800 space-y-4 shadow-2xl animate-slide-up">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-700">Crop Details Profile</span>
                  <h2 className="text-lg font-black text-slate-900 leading-snug">{selectedProduct.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500"
                >
                  ×
                </button>
              </div>

              <img src={selectedProduct.image} className="w-full h-44 object-cover rounded-2xl" alt={selectedProduct.name} />

              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-800 block mb-1">Description</span>
                {selectedProduct.description}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[9px]">Farmer Name</span>
                  <span className="font-bold text-slate-800 block">{selectedProduct.farmerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[9px]">Contact No.</span>
                  <span className="font-mono text-slate-800 block">{selectedProduct.farmerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[9px]">Price Rate</span>
                  <span className="font-bold text-emerald-800 block">{selectedProduct.price.toLocaleString()} TZS / {selectedProduct.unit}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[9px]">Harvest Date</span>
                  <span className="font-semibold text-slate-700 block">{selectedProduct.harvestDate}</span>
                </div>
              </div>

              {/* Cart insertion details */}
              <div className="p-3 border rounded-2xl flex items-center justify-between text-xs border-slate-100 shadow-xs">
                <div>
                  <span className="text-slate-400 font-mono">Buy quantity</span>
                  <div className="flex items-center gap-3 mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setQtySelector(prev => Math.max(1, prev - 1))}
                      className="w-6 h-6 rounded bg-white text-slate-700 font-bold border"
                    >
                      -
                    </button>
                    <span className="font-mono font-extrabold text-sm text-slate-800">{qtySelector}</span>
                    <button
                      onClick={() => setQtySelector(prev => Math.min(selectedProduct.quantity, prev + 1))}
                      className="w-6 h-6 rounded bg-white text-slate-700 font-bold border"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 font-mono">Subtotal Cost</span>
                  <span className="text-base font-extrabold text-slate-800 block mt-1">
                    {(selectedProduct.price * qtySelector).toLocaleString()} TZS
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(selectedProduct, qtySelector)}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                id="btn-basket-commit"
              >
                <ShoppingBasket className="w-4 h-4" />
                {t("addToBasket")}
              </button>

              {/* Product and seller review sub-panel */}
              <div className="pt-3 border-t border-slate-100">
                <span className="font-extrabold text-slate-900 block mb-2 text-xs">Customer Reviews & Complaints</span>
                
                <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
                  {reviews.filter(rev => rev.productId === selectedProduct.id).map((r) => (
                    <div key={r.id} className="bg-slate-50 p-2.5 rounded-xl text-[10px] leading-relaxed">
                      <div className="flex justify-between font-bold text-slate-700 mb-0.5">
                        <span>{r.buyerName}</span>
                        <div className="flex items-center text-amber-500 gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-500" />
                          <span>{r.rating}</span>
                        </div>
                      </div>
                      <p className="italic text-slate-600">{r.comment}</p>
                    </div>
                  ))}
                  {reviews.filter(rev => rev.productId === selectedProduct.id).length === 0 && (
                    <span className="text-[10px] text-slate-400 italic block">No reviews yet for this listing. Be the first to verify.</span>
                  )}
                </div>

                {/* Submit quick review */}
                <div className="bg-slate-100/50 p-3 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex gap-2 items-center">
                    <span className="text-[11px] font-bold text-slate-700">Leave Rating:</span>
                    <select
                      value={reviewRatingInput}
                      onChange={(e) => setReviewRatingInput(Number(e.target.value))}
                      className="bg-white border text-slate-700 rounded px-1.5 py-0.5"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                      <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                      <option value="3">⭐⭐⭐ 3 Stars</option>
                      <option value="2">⭐⭐ 2 Stars</option>
                      <option value="1">⭐ 1 Star</option>
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder={isSw ? "Andika maoni yako hapa..." : "Type product/quality feedback..."}
                      value={reviewCommentInput}
                      onChange={(e) => setReviewCommentInput(e.target.value)}
                      className="flex-grow bg-white border border-slate-200 rounded px-2 py-1 text-[11px]"
                    />
                    <button
                      onClick={() => handleAddReview(selectedProduct)}
                      disabled={!reviewCommentInput.trim()}
                      className="bg-emerald-600 text-white rounded px-3 text-[11px] font-bold"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "basket" && (
          <div className="space-y-4" id="div-tab-basket">
            <h2 className="text-lg font-bold text-slate-900">{isSw ? "Kikapu Chako cha Mazao" : "Your Fresh Farm Basket"}</h2>

            {cart.length === 0 ? (
              <div className="bg-white border rounded-3xl py-12 px-4 text-center border-dashed">
                <ShoppingBasket className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-700 font-semibold text-sm">{t("cartEmpty")}</p>
                <button
                  onClick={() => setActiveTab("marketplace")}
                  className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  {t("backToMarketplace")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="bg-white border text-slate-950 border-slate-100 rounded-2xl p-3 flex gap-3 shadow-xs items-center">
                      <img src={item.product.image} className="w-14 h-14 object-cover rounded-xl" alt={item.product.name} />
                      <div className="flex-grow min-w-0">
                        <span className="font-bold text-slate-900 block truncate text-xs">{item.product.name}</span>
                        <span className="text-[10px] text-slate-400 block mb-1">Farmer: {item.product.farmerName}</span>
                        <span className="text-xs font-bold text-emerald-800">
                          {item.product.price.toLocaleString()} TZS <span className="font-normal text-[10px] text-slate-400">/unit</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 border border-slate-100 bg-slate-50 p-1.5 rounded-lg">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="w-5 h-5 bg-white rounded border flex items-center justify-center font-black text-xs text-slate-600"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-800">{item.quantitySelected}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="w-5 h-5 bg-white rounded border flex items-center justify-center font-black text-xs text-slate-600"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeCartItem(item.product.id)}
                        className="text-slate-300 hover:text-red-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coupons / Code */}
                <div className="bg-white p-3 rounded-2xl border border-slate-100 flex gap-2">
                  <input
                    type="text"
                    placeholder={isSw ? "Siri ya Kuponi (Mfano. AGROGOLD)" : "Promo Coupon (e.g., AGROGOLD)"}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow text-xs bg-slate-50 rounded-xl px-3 outline-hidden border border-slate-200"
                  />
                  <button
                    onClick={checkCoupon}
                    className="bg-emerald-700 text-white rounded-xl px-4 py-1.5 text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback && (
                  <p className="text-[10px] text-emerald-800 font-mono font-medium px-2">{couponFeedback}</p>
                )}

                {/* Subtotals Panel */}
                <div className="bg-white border border-slate-100 p-4 rounded-3xl space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Produce subtotal:</span>
                    <span className="font-semibold text-slate-800">{cartSubtotal.toLocaleString()} TZS</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Promo discount (-15%):</span>
                      <span>-{(cartSubtotal * appliedDiscount).toLocaleString()} TZS</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Simulated Shipping flat-fee:</span>
                    <span className="font-semibold text-slate-800">{deliveryDistanceFee.toLocaleString()} TZS</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm text-slate-800">
                    <span>{t("totalPriceCap")}:</span>
                    <span className="text-emerald-800 font-black">{cartTotal.toLocaleString()} TZS</span>
                  </div>
                </div>

                {/* Checkout selection and Trigger */}
                <form onSubmit={handleStartCheckout} className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-800 block mb-1">Select Gateway Provider</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        onClick={() => setPaymentProvider("m-pesa")}
                        className={`border rounded-xl p-2.5 text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                          paymentProvider === "m-pesa" ? "border-red-500 bg-red-50 text-red-900" : "border-slate-100 text-slate-500"
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-red-600" />
                        <span className="text-[9px] font-bold">M-Pesa</span>
                      </div>

                      <div
                        onClick={() => setPaymentProvider("tigo-pesa")}
                        className={`border rounded-xl p-2.5 text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                          paymentProvider === "tigo-pesa" ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-100 text-slate-500"
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span className="text-[9px] font-bold">Tigo Pesa</span>
                      </div>

                      <div
                        onClick={() => setPaymentProvider("airtel-money")}
                        className={`border rounded-xl p-2.5 text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                          paymentProvider === "airtel-money" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-100 text-slate-500"
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-amber-600" />
                        <span className="text-[9px] font-bold">Airtel Money</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 font-mono">Sim Phone Number for PIN Prompt Push</label>
                    <input
                      type="text"
                      required
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex justify-center items-center gap-1 shadow-sm"
                  >
                    <Shield className="w-4 h-4" />
                    {isSw ? "Lipia kwa Simu Sasa" : "Initialize Secure Payment Gateway"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4" id="div-tab-orders">
            <h2 className="text-lg font-bold text-slate-900">{isSw ? "Maagizo Yako ya Manunuzi" : "Track Your Orders"}</h2>

            {buyerOrders.length === 0 ? (
              <div className="bg-white border rounded-3xl py-12 px-4 text-center border-slate-100">
                <p className="text-sm font-semibold text-slate-700">No active purchases logged yet</p>
                <p className="text-xs text-slate-400 mt-1">Place maize or tomato orders on the marketplace tab.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {buyerOrders.map((o) => (
                  <div key={o.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col gap-3 text-xs" id={`buyer-ord-${o.id}`}>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div>
                        <span className="font-mono text-[9px] text-slate-400 block tracking-tight">ID: {o.id}</span>
                        <span className="text-slate-500 text-[10px]">{o.date}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase ${
                        o.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <img src={o.productImage} className="w-12 h-12 rounded-lg object-cover shrink-0" alt={o.productName} />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800 truncate block text-sm">{o.productName}</span>
                        <span className="text-slate-500 block text-[11px] mt-0.5">Seller Name: {o.farmerName}</span>
                        <div className="flex justify-between items-center mt-2 font-mono">
                          <span className="text-slate-400">Qty: {o.quantity} units</span>
                          <span className="font-extrabold text-slate-800">Total: {o.totalAmount.toLocaleString()} TZS</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Validation Mock Container */}
                    <div className="bg-slate-50 p-2.5 rounded-2xl text-center space-y-2 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono block">SECURE QR PASS FOR DELIVERY POINT</span>
                      <div className="flex justify-center py-2 bg-white rounded-lg max-w-[120px] mx-auto border border-neutral-100">
                        {/* Drawn Vector QR Block */}
                        <svg className="w-16 h-16" viewBox="0 0 40 40">
                          <rect width="40" height="40" fill="#ffffff" />
                          <rect x="2" y="2" width="10" height="10" fill="#334155" />
                          <rect x="4" y="4" width="6" height="6" fill="#ffffff" />
                          <rect x="5" y="5" width="4" height="4" fill="#334155" />

                          <rect x="28" y="2" width="10" height="10" fill="#334155" />
                          <rect x="30" y="4" width="6" height="6" fill="#ffffff" />
                          <rect x="31" y="5" width="4" height="4" fill="#334155" />

                          <rect x="2" y="28" width="10" height="10" fill="#334155" />
                          <rect x="4" y="30" width="6" height="6" fill="#ffffff" />
                          <rect x="5" y="31" width="4" height="4" fill="#334155" />

                          <rect x="15" y="15" width="6" height="6" fill="#334155" />
                          {/* Dotted noise */}
                          <rect x="24" y="24" width="4" height="4" fill="#334155" />
                          <rect x="24" y="31" width="3" height="3" fill="#334155" />
                          <rect x="31" y="24" width="4" height="2" fill="#334155" />
                        </svg>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono tracking-widest">{o.qrCodeValue}</span>
                    </div>

                    {/* Interactive state actions */}
                    {o.status === "shipping" && (
                      <button
                        onClick={() => handleConfirmReceived(o.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isSw ? "Nimepokea Bidhaa Vizuri (Safi)" : "Confirm Goods Received Safely"}
                      </button>
                    )}

                    {o.status === "completed" && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-[11px] leading-relaxed">
                        🎉 {isSw ? "Mzunguko umekamilika. Mkulima amelipwa kutoka Escrow." : "Produce received correctly! Funds released securely to standard farmer wallet and commission compiled."}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "complaints" && (
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4" id="div-tab-complaints">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Complaints Board</h2>
              <p className="text-xs text-slate-500">File a ticket regarding damaged, bruised produces, or late shipping delays.</p>
            </div>

            {complaintSuccess && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex gap-2 items-center">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Ticket registered! Admin arbiters will inspect logistics tracking logs immediately.</span>
              </div>
            )}

            <form onSubmit={handleFileComplaint} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-mono mb-1">Select Disputed Order ID</label>
                <select
                  value={complaintOrderSelect}
                  onChange={(e) => setComplaintOrderSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-hidden"
                  required
                >
                  <option value="">-- Choose Order --</option>
                  {buyerOrders.map(o => (
                    <option key={o.id} value={o.id}>
                      #{o.id} - {o.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-mono mb-1">State Issue & Incongruency</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain if cargo was bruised, quantities were incorrect, or delivery took too long..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-hidden outline-offset-0 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                File Dispute & Halt Funds Release
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Sticky Footer Nav */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-2 flex justify-around items-center z-40 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`flex flex-col items-center p-1 cursor-pointer ${activeTab === "marketplace" ? "text-emerald-700" : "text-slate-400"}`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">{isSw ? "Soko" : "Market"}</span>
        </button>

        <button
          onClick={() => setActiveTab("basket")}
          className={`flex flex-col items-center p-1 cursor-pointer relative ${activeTab === "basket" ? "text-emerald-700" : "text-slate-400"}`}
        >
          <div className="relative">
            <ShoppingBasket className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[7px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[9px] mt-0.5">{isSw ? "Sufuria" : "Basket"}</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center p-1 cursor-pointer ${activeTab === "orders" ? "text-emerald-700" : "text-slate-400"}`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">{isSw ? "Maagizo" : "Orders"}</span>
        </button>

        <button
          onClick={() => setActiveTab("complaints")}
          className={`flex flex-col items-center p-1 cursor-pointer ${activeTab === "complaints" ? "text-emerald-700" : "text-slate-400"}`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">{isSw ? "Mzozo" : "Dispute"}</span>
        </button>
      </div>
    </div>
  );
}
export interface FileTextProps extends React.SVGProps<SVGSVGElement> {}
