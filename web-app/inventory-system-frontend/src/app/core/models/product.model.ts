export interface Product {
  id:          string;
  name:        string;
  sku:         string;
  description: string;
  weight:      number;
  categoryId:  string;
}

export interface Category {
  id:          string;
  name:        string;
  description: string | null;
}

export interface CreateProductRequest {
  name:        string;
  sku:         string;
  description: string;
  weight:      number;
  categoryId:  string;
}

export interface UpdateProductRequest {
  name:        string;
  sku:         string;
  description: string;
  weight:      number;
  categoryId:  string;
}

export interface CreateCategoryRequest {
  name:        string;
  description: string | null;
}