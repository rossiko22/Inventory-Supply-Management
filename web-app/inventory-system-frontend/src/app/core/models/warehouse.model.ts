export type Country = "MACEDONIA" | "SLOVENIA";
export type City = "MARIBOR" | "LJUBLJANA" | "SKOPJE" | "KUMANOVO";

export interface Warehouse {
    id: string;
    name: string;
    country: Country;
    city: City;
    totalCapacity: number;
    usedCapacity: number;
}

export interface CreateWarehouseRequest {
    name: string;
    country: Country;
    city: City;
    totalCapacity: number;
}

export interface UpdateWarehouseRequest {
    name: string;
    country: Country;
    city: City;
    totalCapacity: number;
}

export const COUNTRY_OPTIONS: { label: string; value: Country }[] = [
  { label: 'Macedonia', value: 'MACEDONIA' },
  { label: 'Slovenia',  value: 'SLOVENIA'  },
];

export const CITY_OPTIONS: { label: string; value: City }[] = [
  { label: 'Skopje',    value: 'SKOPJE'    },
  { label: 'Kumanovo',  value: 'KUMANOVO'  },
  { label: 'Ljubljana', value: 'LJUBLJANA' },
  { label: 'Maribor',   value: 'MARIBOR'   },
];