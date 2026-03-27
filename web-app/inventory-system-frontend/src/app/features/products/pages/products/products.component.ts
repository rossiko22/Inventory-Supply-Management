import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductService } from '../../services/product.service';
import { Category, Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-products',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly confirmService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly fb             = inject(FormBuilder);

  readonly products      = signal<Product[]>([]);
  readonly categories    = signal<Category[]>([]);
  readonly dialogVisible = signal(false);
  readonly isEditing     = signal(false);
  readonly isLoading     = signal(false);
  readonly isSaving      = signal(false);

  private readonly editingId = signal<string | null>(null);

  readonly dialogTitle      = computed(() => this.isEditing() ? 'Edit Product' : 'Add Product');
  readonly categoryOptions  = computed(() =>
    this.categories().map(c => ({ label: c.name, value: c.id }))
  );

  readonly form = this.fb.group({
    name:        ['', Validators.required],
    sku:         ['', Validators.required],
    description: ['', Validators.required],
    weight:      [0, [Validators.required, Validators.min(0.01)]],
    categoryId:  [null as string | null, Validators.required],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.productService.getAllCategories().subscribe({
      next: (data) => this.categories.set(data),
    });
    this.productService.getAllProducts().subscribe({
      next:  (data) => { this.products.set(data); this.isLoading.set(false); },
      error: ()     => { this.isLoading.set(false); this.showError('Failed to load products.'); },
    });
  }

  openNew(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ name: '', sku: '', description: '', weight: 0, categoryId: null });
    this.dialogVisible.set(true);
  }

  openEdit(product: Product): void {
    this.isEditing.set(true);
    this.editingId.set(product.id);
    this.form.setValue({
      name:        product.name,
      sku:         product.sku,
      description: product.description,
      weight:      product.weight,
      categoryId:  product.categoryId,
    });
    this.dialogVisible.set(true);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, sku, description, weight, categoryId } = this.form.getRawValue();
    this.isSaving.set(true);

    if (this.isEditing() && this.editingId()) {
      this.productService
        .updateProduct(this.editingId()!, { name: name!, sku: sku!, description: description!, weight: weight!, categoryId: categoryId! })
        .subscribe({
          next: () => { this.loadAll(); this.dialogVisible.set(false); this.isSaving.set(false); this.showSuccess('Product updated.'); },
          error: () => { this.isSaving.set(false); this.showError('Failed to update product.'); },
        });
    } else {
      this.productService
        .createProduct({ name: name!, sku: sku!, description: description!, weight: weight!, categoryId: categoryId! })
        .subscribe({
          next: () => { this.loadAll(); this.dialogVisible.set(false); this.isSaving.set(false); this.showSuccess('Product created.'); },
          error: () => { this.isSaving.set(false); this.showError('Failed to create product.'); },
        });
    }
  }

  confirmDelete(product: Product): void {
    this.confirmService.confirm({
      message: `Delete "${product.name}"? This cannot be undone.`,
      header:  'Delete Product',
      icon:    'pi pi-exclamation-triangle',
      accept:  () => {
        this.productService.deleteProduct(product.id).subscribe({
          next:  () => { this.products.update(list => list.filter(p => p.id !== product.id)); this.showSuccess('Product deleted.'); },
          error: () => this.showError('Failed to delete product.'),
        });
      },
    });
  }

  categoryName(categoryId: string): string {
    return this.categories().find(c => c.id === categoryId)?.name ?? '—';
  }

  private showSuccess(msg: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 });
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
  }
}
