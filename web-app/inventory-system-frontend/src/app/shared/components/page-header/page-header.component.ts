import { NgTemplateOutlet } from '@angular/common';
import { Component, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [NgTemplateOutlet],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  title = input.required<string>();
  description = input<string>();
  actions = input<TemplateRef<void>>();
}
