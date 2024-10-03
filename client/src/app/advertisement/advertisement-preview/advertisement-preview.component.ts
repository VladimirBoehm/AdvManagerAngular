import { NgIf } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-advertisement-preview',
  standalone: true,
  imports: [MatCardModule, NgIf],
  templateUrl: './advertisement-preview.component.html',
  styleUrl: './advertisement-preview.component.scss',
})
export class AdvertisementPreviewComponent {
  title = input.required<string | undefined>();
  message = input.required<string | undefined>();
  url = input.required<string | undefined>();
  linkName = input.required<string | undefined>();
  linkValue = input.required<string | undefined>();
}
