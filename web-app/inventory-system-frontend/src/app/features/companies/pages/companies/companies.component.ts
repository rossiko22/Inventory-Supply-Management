import { Component, computed, inject, signal } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Company } from '../../../../core/models/company.model';
import { ConfirmDialog, ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { PageHeaderComponent } from "../../../../shared/components/page-header/page-header.component";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-companies',
  imports: [ConfirmDialog, ToastModule, PageHeaderComponent, DialogModule, ReactiveFormsModule, ButtonModule, InputTextModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css',
})
export class CompaniesComponent {
  private readonly companyService  = inject(CompanyService);
  private readonly confirmService  = inject(ConfirmationService);
  private readonly messageService  = inject(MessageService);
  private readonly fb              = inject(FormBuilder);

  readonly companies     = signal<Company[]>([]);
  readonly dialogVisible = signal(false);
  readonly isEditing     = signal(false);
  readonly isLoading     = signal(false);
  readonly isSaving      = signal(false);

  private readonly editingId = signal<string | null>(null);

  readonly dialogTitle = computed(() => this.isEditing() ? 'Edit Company' : 'Add Company');

  readonly form = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    phone:   ['', Validators.required],
    contact: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.isLoading.set(true);
    this.companyService.getAll().subscribe({
      next:  (data) => { this.companies.set(data); this.isLoading.set(false); },
      error: ()     => { this.isLoading.set(false); this.showError('Failed to load companies.'); },
    });
  }

  openNew(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ name: '', email: '', phone: '', contact: '' });
    this.dialogVisible.set(true);
  }

  openEdit(company: Company): void {
    this.isEditing.set(true);
    this.editingId.set(company.id);
    this.form.setValue({
      name:    company.name,
      email:   company.email,
      phone:   company.phone,
      contact: company.contact,
    });
    this.dialogVisible.set(true);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, phone, contact } = this.form.getRawValue();
    this.isSaving.set(true);

    if (this.isEditing() && this.editingId()) {
      this.companyService
        .update(this.editingId()!, { name: name!, email: email!, phone: phone!, contact: contact! })
        .subscribe({
          next: (updated) => {
            this.companies.update(list => list.map(c => c.id === updated.id ? updated : c));
            this.dialogVisible.set(false);
            this.isSaving.set(false);
            this.showSuccess('Company updated.');
          },
          error: () => { this.isSaving.set(false); this.showError('Failed to update company.'); },
        });
    } else {
      this.companyService
        .create({ name: name!, email: email!, phone: phone!, contact: contact! })
        .subscribe({
          next: (created) => {
            this.companies.update(list => [...list, created]);
            this.dialogVisible.set(false);
            this.isSaving.set(false);
            this.showSuccess('Company created.');
          },
          error: () => { this.isSaving.set(false); this.showError('Failed to create company.'); },
        });
    }
  }

  confirmDelete(company: Company): void {
    this.confirmService.confirm({
      message: `Delete "${company.name}"? This cannot be undone.`,
      header:  'Delete Company',
      icon:    'pi pi-exclamation-triangle',
      accept:  () => this.delete(company.id),
    });
  }

  private delete(id: string): void {
    this.companyService.delete(id).subscribe({
      next:  () => {
        this.companies.update(list => list.filter(c => c.id !== id));
        this.showSuccess('Company deleted.');
      },
      error: () => this.showError('Failed to delete company.'),
    });
  }

  private showSuccess(msg: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 });
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
  }
}
