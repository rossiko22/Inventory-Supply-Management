export interface Company {
  id:      string;
  name:    string;
  email:   string;
  phone:   string;
  contact: string;
}

export interface CreateCompanyRequest {
  name:    string;
  email:   string;
  phone:   string;
  contact: string;
}

export interface UpdateCompanyRequest {
  name:    string;
  email:   string;
  phone:   string;
  contact: string;
}