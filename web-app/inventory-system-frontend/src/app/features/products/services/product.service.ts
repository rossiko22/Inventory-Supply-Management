import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category, CreateCategoryRequest, CreateProductRequest, Product, UpdateProductRequest } from '../../../core/models/product.model';
import { Observable } from 'rxjs';


const PRODUCT_BASE_URL = 'http://localhost:8085/products';
const CATEGORY_BASE_URL = 'http://localhost:8085/categories';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  // ── Products ──────────────────────────────────────────
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(PRODUCT_BASE_URL, { withCredentials: true });
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(PRODUCT_BASE_URL, request, { withCredentials: true });
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${PRODUCT_BASE_URL}/${id}`, request, { withCredentials: true });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${PRODUCT_BASE_URL}/${id}`, { withCredentials: true });
  }

  // ── Categories ────────────────────────────────────────
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(CATEGORY_BASE_URL, { withCredentials: true });
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(CATEGORY_BASE_URL, request, { withCredentials: true });
  }
}
