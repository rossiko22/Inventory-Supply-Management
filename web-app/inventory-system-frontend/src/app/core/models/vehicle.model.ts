export interface Vehicle {
  id: string;
  registrationPlate: string;
}

export interface CreateVehicleRequest {
  registrationPlate: string;
}

export interface UpdateVehicleRequest {
  registrationPlate: string;
}