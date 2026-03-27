import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell/notification-bell.component';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, SidebarComponent, NotificationBellComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css',
})
export class AppLayoutComponent {

}
