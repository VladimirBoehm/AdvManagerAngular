import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  private busyRequestCount = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  busy() {
    this.busyRequestCount++;
    if (this.busyRequestCount === 1) {
      this.isLoadingSubject.next(true);
    }
  }

  idle() {
    this.busyRequestCount--;
    if (this.busyRequestCount === 0) {
      this.isLoadingSubject.next(false);
    }
    if (this.busyRequestCount < 0) {
      this.busyRequestCount = 0;
    }
  }
}
