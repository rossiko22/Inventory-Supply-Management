export interface OrderCreatedPayload {
  orderId:     string;
  companyId:   string;
  companyName: string;
  warehouseId: string;
  status:      string;
  createdAt:   string;
}

export interface OrderStatusChangedPayload {
  orderId:   string;
  oldStatus: string;
  newStatus: string;
  changedAt: string;
}

export interface InventoryLowPayload {
  productId:    string;
  productName:  string;
  currentStock: number;
  minThreshold: number;
  warehouseId:  string;
}

export interface InventoryOutPayload {
  productId:   string;
  productName: string;
  warehouseId: string;
}

export interface WarehouseCapacityPayload {
  warehouseId:   string;
  warehouseName: string;
  usedCapacity:  number;
  totalCapacity: number;
  percentage:    number;
}

export type KafkaTopic =
  | 'order.created'
  | 'order.status.changed'
  | 'inventory.low'
  | 'inventory.out'
  | 'warehouse.capacity';

export type KafkaEvent =
  | { topic: 'order.created';        payload: OrderCreatedPayload }
  | { topic: 'order.status.changed'; payload: OrderStatusChangedPayload }
  | { topic: 'inventory.low';        payload: InventoryLowPayload }
  | { topic: 'inventory.out';        payload: InventoryOutPayload }
  | { topic: 'warehouse.capacity';   payload: WarehouseCapacityPayload };