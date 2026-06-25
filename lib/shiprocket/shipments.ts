import { shiprocketFetch } from "./client";

export interface CreateShipmentParams {
  resellerId: string;
  orderId: string;
  orderNumber: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerPincode: string;
  weight: number; // in kg
  length: number; // in cm
  breadth: number;
  height: number;
  declaredValue: number;
  pickupLocation: string;
}

export async function createShipment(params: CreateShipmentParams) {
  const payload = {
    order_id: params.orderNumber,
    order_date: new Date().toISOString().split("T")[0],
    pickup_location: params.pickupLocation,
    billing_customer_name: params.customerName,
    billing_phone: params.customerPhone,
    billing_address: params.customerAddress,
    billing_city: params.customerCity,
    billing_state: params.customerState,
    billing_country: "India",
    billing_pincode: params.customerPincode,
    shipping_is_billing: true,
    order_items: [
      {
        name: params.productName,
        sku: params.orderId,
        units: 1,
        selling_price: params.declaredValue,
      },
    ],
    payment_method: "Prepaid",
    sub_total: params.declaredValue,
    length: params.length,
    breadth: params.breadth,
    height: params.height,
    weight: params.weight,
  };

  const result = await shiprocketFetch(
    "/orders/create/adhoc",
    params.resellerId,
    { method: "POST", body: JSON.stringify(payload) },
  ) as { shipment_id: number; order_id: number; awb_code?: string; label_url?: string };

  return result;
}
