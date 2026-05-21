export type Role = "guest" | "farmer" | "buyer" | "admin" | "splash";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  avatar: string;
  region: string;
  walletBalance: number;
}

export type Category = "grains" | "vegetables" | "fruits" | "cash-crops" | "tubers";

export interface Product {
  id: string;
  name: string;
  category: Category;
  quantity: number; // e.g. 500
  unit: string; // e.g. "kg", "bags", "crates"
  price: number; // price per unit (TZS/KES)
  harvestDate: string; // YYYY-MM-DD
  deliveryOptions: "pickup" | "delivery" | "both";
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  image: string; // placeholder/data uri
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerRating: number;
  description: string;
}

export type OrderStatus = "pending" | "processing" | "shipping" | "completed" | "rejected";

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: "m-pesa" | "tigo-pesa" | "airtel-money" | "card" | "wallet";
  phoneNumber?: string; // for mobile money push simulation
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  farmerId: string;
  farmerName: string;
  status: OrderStatus;
  date: string;
  qrCodeValue: string; // verification token
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  buyerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface FarmerEarnings {
  wallet: number;
  earningsHistory: {
    id: string;
    amount: number;
    type: "sale" | "withdrawal";
    date: string;
    detail: string;
  }[];
}

export interface Complaint {
  id: string;
  orderId: string;
  reporterName: string;
  reporterRole: "buyer" | "farmer";
  issue: string;
  status: "open" | "resolved";
  date: string;
}
