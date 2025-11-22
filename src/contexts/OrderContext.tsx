import { createContext, useContext, useState } from "react";
import { payOrder, fetchCashierOrders } from "@/services/orderWorkflow";

// ============================================
// 1. OrderContext TYPE DEFINITION
// ============================================
interface OrderContextType {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  refreshOrders: () => Promise<void>;
  completePayment: (
    orderId: number,
    paymentMethod: string,
    customerPaid: number
  ) => Promise<void>;
}

// ============================================
// 2. CREATE CONTEXT (DEFAULT)
// ============================================
const OrderContext = createContext<OrderContextType>({
  orders: [],
  setOrders: () => {},
  refreshOrders: async () => {},
  completePayment: async () => {},
});

export const useOrders = () => useContext(OrderContext);

// ============================================
// 3. PROVIDER
// ============================================
export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<any[]>([]);

  // ================================  
  // REFRESH ORDERS
  // ================================
  const refreshOrders = async () => {
    try {
      const data = await fetchCashierOrders(); // GET /api/pos/orders
      setOrders(data || []);
    } catch (error) {
      console.error("Lỗi load orders:", error);
    }
  };

  // ================================
  // COMPLETE PAYMENT
  // ================================
  const completePayment = async (
    orderId: number,
    paymentMethod: string,
    customerPaid: number
  ) => {
    try {
      await payOrder(orderId, paymentMethod, customerPaid); 
      await refreshOrders();
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        setOrders,
        refreshOrders,
        completePayment,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
