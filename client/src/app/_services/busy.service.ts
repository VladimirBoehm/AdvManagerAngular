import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  public isLoading = signal(false);

  busy() {
    this.isLoading.set(true);
  }

  idle() {
    this.isLoading.set(false);
  }
}
