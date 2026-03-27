export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleId: string;
  companyId: string;
}

export interface CreateDriverRequest {
  name: string;
  phone: string;
  email: string;
  vehicleId: string;
  companyId: string;
}

export interface UpdateDriverRequest {
  name: string;
  phone: string;
  email: string;
  vehicleId: string;
  companyId: string;
}