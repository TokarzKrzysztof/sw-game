import { inject, Injectable } from '@angular/core';
import { StateService } from '../core/state.service';

@Injectable({
  providedIn: 'root'
})
export class ReadonlyStateService {
  private state = inject(StateService);

  constructor() { }

  public get inProgress() {
    return this.state.inProgress.asReadonly();
  }
  public get isFinished() {
    return this.state.isFinished.asReadonly();
  }
  public get errors() {
    return this.state.errors.asReadonly();
  }
  public get players() {
    return this.state.players.asReadonly();
  }
}
