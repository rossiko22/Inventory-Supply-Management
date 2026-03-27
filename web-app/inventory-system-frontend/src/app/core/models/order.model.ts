export type OrderStatus = 'Requested' | 'Approved' | 'Delivered' | 'Closed';

export const ORDER_STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  Requested: 'Approved',
  Approved:  'Delivered',
  Delivered: 'Closed',
};

export interface Order {
  id:          string;
  productId:   string;
  companyId:   string;
  warehouseId: string;
  driverId:    string;
  quantity:    number;
  status:      OrderStatus;
  deliveryDate?: string;
  createdAt?: string;
  lastModified?: string;
}

export interface OrderApiResponse {
  id:           string;
  productId:    string;
  companyId:    string;
  warehouseId:  string;
  driverId:     string;
  quantity:     number;
  status:       number;
  deliveryDate?: string;
  createdAt?:   string;
  lastModified?: string;
}

export function mapOrder(raw: OrderApiResponse): Order {
  return {
    ...raw,
    status: INT_TO_STATUS[raw.status],
  };
}



export interface CreateOrderRequest {
  productId:   string;
  companyId:   string;
  warehouseId: string;
  driverId:    string;
  quantity:    number;
  deliveryDate?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status:  number; // backend uses enum int: 0=Requested,1=Approved,2=Delivered,3=Closed
}

export const STATUS_TO_INT: Record<OrderStatus, number> = {
  Requested: 0,
  Approved:  1,
  Delivered: 2,
  Closed:    3,
};

export const INT_TO_STATUS: Record<number, OrderStatus> = {
  0: 'Requested',
  1: 'Approved',
  2: 'Delivered',
  3: 'Closed',
};