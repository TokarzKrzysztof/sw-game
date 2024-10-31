import { Injectable, signal } from '@angular/core';
import { Players } from '../models/players';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  inProgress = signal(false);
  isFinished = signal(false);
  errors = signal<string[]>([]);
  players = signal<Players | null>(null);
}
