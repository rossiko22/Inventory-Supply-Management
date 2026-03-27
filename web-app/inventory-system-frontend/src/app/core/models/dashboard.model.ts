export type OrderStatus = "Requested" | "Approved" | "Delivered" | "Closed" | "Cancelled"

export interface Order {
    id: string;
    deliveryDate: string;
    warehouseId: string;
    status: OrderStatus;
}

export interface Warehouse{
    id: string;
    name: string;
}

export interface Company {
    id:string;
    name: string;
}

export interface Product {
    id: string;
    warehouseId: string;
    quantity: number;
}

export interface WeekDay {
    day: string;
    deliveries: number;
}

export interface StockByWarehouse {
    name: string;
    value: number;
}