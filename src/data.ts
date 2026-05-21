import { Product, Category, Review, Order } from "./types";

export const CATEGORIES: { id: Category; labelEn: string; labelSw: string; icon: string; color: string }[] = [
  { id: "grains", labelEn: "Grains", labelSw: "Nafaka", icon: "Milestone", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "vegetables", labelEn: "Vegetables", labelSw: "Mboga", icon: "Leaf", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "fruits", labelEn: "Fruits", labelSw: "Matunda", icon: "Apple", color: "bg-red-100 text-red-800 border-red-200" },
  { id: "tubers", labelEn: "Tubers", labelSw: "Mizizi", icon: "Sprout", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "cash-crops", labelEn: "Cash Crops", labelSw: "Mazao ya Biashara", icon: "DollarSign", color: "bg-blue-100 text-blue-800 border-blue-200" }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Premium Maize (Mahindi Safi)",
    category: "grains",
    quantity: 1200,
    unit: "bags",
    price: 65000, // per bag (approx. 90kg bag typical in East Africa)
    harvestDate: "2026-05-15",
    deliveryOptions: "both",
    stockStatus: "in-stock",
    image: "/assets/images/premium_maize_cobs_1779359037477.png",
    farmerId: "f1",
    farmerName: "Bahati Mwangi",
    farmerPhone: "+255 712 345 678",
    farmerRating: 4.8,
    description: "High-quality, dry shell white maize suitable for flour milling. Harvested under strict sanitation controls, moisture content measured at optimal 13%."
  },
  {
    id: "p2",
    name: "Plum Tomatoes (Nyanya Tamu)",
    category: "vegetables",
    quantity: 45,
    unit: "crates",
    price: 35000, // per crate
    harvestDate: "2026-05-19",
    deliveryOptions: "delivery",
    stockStatus: "in-stock",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
    farmerId: "f2",
    farmerName: "Amina Juma",
    farmerPhone: "+255 655 890 123",
    farmerRating: 4.6,
    description: "Deep red ripened Roma tomatoes. Ideal for restaurants, hotels, and raw household consumption. Sturdy shipping crates to prevent bruising."
  },
  {
    id: "p3",
    name: "Arabica Coffee Beans (Kahawa Safi)",
    category: "cash-crops",
    quantity: 80,
    unit: "bags",
    price: 180000, // premium grade per bag
    harvestDate: "2026-04-20",
    deliveryOptions: "both",
    stockStatus: "in-stock",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600",
    farmerId: "f1",
    farmerName: "Bahati Mwangi",
    farmerPhone: "+255 712 345 678",
    farmerRating: 4.8,
    description: "Washed Arabica beans sourced from volcanic clay rich soil. Expertly hand-picked, sun-dried on raised African beds. Cup profile features moderate acidity with floral hints."
  },
  {
    id: "p4",
    name: "Organic Basmati Rice (Mchele wa Kyela)",
    category: "grains",
    quantity: 350,
    unit: "bags",
    price: 48000, // per 25kg bag
    harvestDate: "2026-05-10",
    deliveryOptions: "pickup",
    stockStatus: "in-stock",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
    farmerId: "f3",
    farmerName: "Emmanuel Mboya",
    farmerPhone: "+255 784 567 890",
    farmerRating: 4.9,
    description: "Aromatic premium Kyela long-grain white rice. Milled to perfection with highly polished texture. Completely stones and husks-free guaranteed."
  },
  {
    id: "p5",
    name: "Sweet Potatoes (Viazi Tamu vya Dhahabu)",
    category: "tubers",
    quantity: 15,
    unit: "crates",
    price: 30000,
    harvestDate: "2026-05-18",
    deliveryOptions: "both",
    stockStatus: "low-stock",
    image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600",
    farmerId: "f2",
    farmerName: "Amina Juma",
    farmerPhone: "+255 655 890 123",
    farmerRating: 4.6,
    description: "Highly nutritious orange-fleshed sweet potatoes loaded with Vitamin A. Sweet, creamy-textured, fresh and ready to cook or bake."
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "p1",
    productName: "Premium Maize",
    buyerName: "Sarah Mkami",
    rating: 5,
    comment: "Excellent high-density moisture content grain! Flour milling was beautiful.",
    date: "2026-05-18"
  },
  {
    id: "r2",
    productId: "p2",
    productName: "Plum Tomatoes",
    buyerName: "Michael Owino",
    rating: 4,
    comment: "Very fresh and red. However, a couple of tomatoes in the bottom crate were bruised.",
    date: "2026-05-20"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-9821",
    productId: "p1",
    productName: "Premium Maize (Mahindi Safi)",
    productImage: "/assets/images/premium_maize_cobs_1779359037477.png",
    quantity: 10,
    totalAmount: 650000,
    deliveryFee: 15000,
    paymentMethod: "m-pesa",
    phoneNumber: "+255711223344",
    buyerId: "u_buyer",
    buyerName: "Sarah Mkami (Chakula Millers)",
    buyerPhone: "+255 711 223 344",
    farmerId: "f1",
    farmerName: "Bahati Mwangi",
    status: "processing",
    date: "2026-05-20",
    qrCodeValue: "VERIFY-ord-9821-Ky8wA"
  },
  {
    id: "ord-1122",
    productId: "p2",
    productName: "Plum Tomatoes (Nyanya Tamu)",
    productImage: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
    quantity: 2,
    totalAmount: 70000,
    deliveryFee: 10000,
    paymentMethod: "tigo-pesa",
    phoneNumber: "+255766123456",
    buyerId: "u_buyer",
    buyerName: "Sarah Mkami (Chakula Millers)",
    buyerPhone: "+255 711 223 344",
    farmerId: "f2",
    farmerName: "Amina Juma",
    status: "completed",
    date: "2026-05-18",
    qrCodeValue: "VERIFY-ord-1122-Po9qW"
  }
];

export const LANG_DICT: Record<string, { en: string; sw: string }> = {
  // Splash and Roles
  appSubtitle: {
    en: "Connecting Farmers & Buyers Directly",
    sw: "Kuunganisha Wakulima na Wanunuzi Moja kwa Moja"
  },
  chooseYourRole: {
    en: "Choose Your Role to Start",
    sw: "Chagua Wajibu Wako Kuanza"
  },
  farmerRoleDesc: {
    en: "Sell crops, manage stock, fetch smart AI insights, and track earnings.",
    sw: "Uza mazao, dhibiti hazina, jipatie soko sahihi kwa msaada wa AI, na uone faida yako."
  },
  buyerRoleDesc: {
    en: "Search organic produce, inspect farmer ratings, buy via M-Pesa.",
    sw: "Tafuta mazao safi ya kienyeji, kagua ukadiriaji, nunua kwa M-Pesa."
  },
  adminRoleDesc: {
    en: "Audit users, verify farmers, view financial escrow & escrow logistics.",
    sw: "Kagua kundi la wakulima, thibitisha usajili, na dhibiti usafirishaji."
  },
  beAFarmer: {
    en: "Enter as Farmer",
    sw: "Ingia kama Mkulima"
  },
  beABuyer: {
    en: "Enter as Buyer",
    sw: "Ingia kama Mnunuzi"
  },
  beAnAdmin: {
    en: "Enter as Platform Admin",
    sw: "Ingia kama Msimamizi"
  },
  loginRegister: {
    en: "Verification Login",
    sw: "Uthibitishaji Kuingia"
  },
  fullName: {
    en: "Full Name",
    sw: "Jina Kamili"
  },
  phoneNumber: {
    en: "Mobile Phone Number",
    sw: "Namba ya Simu ya Mkono"
  },
  agreeTerms: {
    en: "I agree to fair trade market rates and delivery commitments.",
    sw: "Ninakubali bei halali za biashara na ahadi za usambazaji."
  },
  getStarted: {
    en: "Access Dashboard",
    sw: "Fungua Dashibodi"
  },
  guestMode: {
    en: "Skip and Browse as Guest",
    sw: "Ruka na Kagua kama Mgeni"
  },

  // Shared Header Buttons
  switchRole: {
    en: "Switch Role",
    sw: "Badilisha Wajibu"
  },
  language: {
    en: "Language",
    sw: "Lugha"
  },

  // Farmer Dashboard
  farmProducts: {
    en: "Farm Products",
    sw: "Mazao ya Shambani"
  },
  inventory: {
    en: "Inventory",
    sw: "Hazina ya Mazao"
  },
  orders: {
    en: "Orders Received",
    sw: "Maagizo Mapya"
  },
  earnings: {
    en: "Earnings & Wallet",
    sw: "Mapato na Mkoba"
  },
  farmInsights: {
    en: "AI Agronomy & Insights",
    sw: "Ushauri wa AI & Shamba"
  },
  messaging: {
    en: "Buyer Chats",
    sw: "Soga za Wanunuzi"
  },

  // Add Product Modules
  addNewProduce: {
    en: "Publish New Harvest",
    sw: "Weka Mavuno Mapya"
  },
  prodName: {
    en: "Product / Crop Name",
    sw: "Jina la Zao / Mazao"
  },
  category: {
    en: "Crop Category",
    sw: "Kundi la Mazao"
  },
  quantity: {
    en: "Quantity Available",
    sw: "Kiasi Kilichopo"
  },
  unit: {
    en: "Unit (e.g., bags, crates, kg)",
    sw: "Kipimo (مثال. magunia, masanduku, kilo)"
  },
  pricePerUnit: {
    en: "Price per Unit (TZS)",
    sw: "Bei kwa kila Kipimo (TZS)"
  },
  harvestDate: {
    en: "Harvest Date",
    sw: "Muda wa Kuvunwa"
  },
  deliveryOption: {
    en: "Delivery Logistics Available",
    sw: "Usafirishaji Unaopatikana"
  },
  bothPickupDelivery: {
    en: "Both Pickup and Delivery",
    sw: "Inachukuliwa Shambani au Inatumwa"
  },
  deliveryOnly: {
    en: "Delivery Only",
    sw: "Inatumwa Tu na Mkulima"
  },
  pickupOnly: {
    en: "Pickup Only",
    sw: "Inachukuliwa Shambani Tu"
  },
  description: {
    en: "Produce Quality & Cultivation Details",
    sw: "Maelezo ya Ubora & Ukulima"
  },
  publishProduct: {
    en: "Publish to Marketplace",
    sw: "Tuma Sokoni"
  },

  // Buyer Side
  searchPlaceholder: {
    en: "Search maize, kyela rice, premium tomatoes...",
    sw: "Tafuta mahindi, mchele wa kyela, nyanya, mboga..."
  },
  featuredProducts: {
    en: "Featured Farm Picks",
    sw: "Chaguo la Bidhaa Bora"
  },
  cartEmpty: {
    en: "Your farm basket is empty",
    sw: "Kikapu chako hakina mazao bado"
  },
  backToMarketplace: {
    en: "Back to Farm Marketplace",
    sw: "Rudi Sokoni"
  },
  addToBasket: {
    en: "Add to Basket",
    sw: "Weka Kikapuni"
  },
  checkingOut: {
    en: "Checkout Processing",
    sw: "Matayarisho ya Malipo"
  },
  payWithMobileMoney: {
    en: "Pay with local Mobile Money",
    sw: "Lipa kwa Huduma ya Simu"
  },
  mpesaNumber: {
    en: "Enter Mobile Money Phone No. (M-Pesa/Tigo/Airtel)",
    sw: "Ingiza Namba ya Simu ya Malipo (M-Pesa/Tigo/Airtel)"
  },
  simulatedPush: {
    en: "Simulate Merchant Payment Push",
    sw: "Anzisha Ujumbe wa Kikokotoo cha Simu"
  },
  successVerification: {
    en: "Verify Order with QR Code",
    sw: "Thibitisha Maagizo kwa QR Code"
  },

  // General labels
  walletBalance: {
    en: "Current Wallet Balance",
    sw: "Kiasi cha Mkoba wa Agro"
  },
  withdrawMoney: {
    en: "Withdraw to Mobile Money",
    sw: "Toa pesa kwenda Kwenye Simu"
  },
  totalPriceCap: {
    en: "Total Basket Amount",
    sw: "Jumla Kuu ya Kikapu"
  }
};
