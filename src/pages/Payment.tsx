import { useEffect, useState } from "react";
import { useOrders } from "@/contexts/OrderContext";
import { PaymentScreen } from "@/components/cashier/PaymentScreen";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Payment() {
  const { orders, completePayment, refreshOrders } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // ===============================================
  // 1. AUTO REFRESH KHI MỞ TRANG PAYMENT
  // ===============================================
  useEffect(() => {
    refreshOrders();
  }, []);

  // ===============================================
  // 2. LỌC ĐƠN HOÀN THÀNH TỪ BARISTA -> STATUS = "done"
  // ===============================================
  const pendingPaymentOrders = orders.filter(
    (order) => order.status?.toLowerCase() === "done"
  );

  // ===============================================
  // 3. LẤY ĐƠN ĐANG CHỌN
  // ===============================================
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // ===============================================
  // 4. HANDLE THANH TOÁN
  // ===============================================
  const handleCompletePayment = async (paymentMethod: any, customerPaid: number) => {
    if (selectedOrderId) {
      await completePayment(selectedOrderId, paymentMethod, customerPaid);
      toast.success("Thanh toán thành công!");
      setSelectedOrderId(null);
    }
  };

  // ===============================================
  // 5. NẾU ĐANG Ở MÀN PAYMENTS
  // ===============================================
  if (selectedOrder) {
    return (
      <div className="p-6">
        <PaymentScreen
          order={selectedOrder}
          onComplete={handleCompletePayment}
          onCancel={() => setSelectedOrderId(null)}
        />
      </div>
    );
  }

  // ===============================================
  // 6. TRANG CHỜ THANH TOÁN
  // ===============================================
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Chờ thanh toán</h1>
        <p className="text-sm text-muted-foreground">Chọn đơn hàng để thanh toán</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingPaymentOrders.map((order) => (
          <button
            key={order.id}
            onClick={() => setSelectedOrderId(order.id)}
            className="text-left p-5 bg-card border border-border rounded-xl hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-warning text-white">Chờ thanh toán</Badge>
              <span className="text-accent font-semibold">
                #{order.orderNumber || order.id}
              </span>
            </div>

            {/* ITEMS */}
            <div className="space-y-1 mb-3">
              {(order.Items || order.items || []).map((item: any, idx: number) => (
                <p key={idx} className="text-sm">
                  {item.ProductName || item.name}{" "}
                  {item.Size || item.size ? `(${item.Size || item.size})` : ""}
                </p>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-muted-foreground text-sm">Tổng:</span>
              <span className="text-accent text-lg font-bold">
                {order.total?.toLocaleString("vi-VN") || 
                 order.Total?.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </button>
        ))}
      </div>

      {pendingPaymentOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có đơn hàng chờ thanh toán</p>
        </div>
      )}
    </div>
  );
}
