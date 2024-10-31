import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../core/api.service';
import { StateService } from '../core/state.service';
import { Person } from '../models/person';
import { Starship } from '../models/starship';
import { NumberUtils } from '../utils/number-utils';

const minPersonId = 1;
const maxPersonId = 83;
const minStarshipId = 2;
const maxStarshipId = 75;

@Injectable({
  providedIn: 'root'
})
export class RecursiveLoaderService {
  private apiService = inject(ApiService);
  private state = inject(StateService);
  private isLoadingCanceled$ = new Subject<void>();

  cancelLoading() {
    this.isLoadingCanceled$.next();
    this.state.inProgress.set(false);
  }
  
  getRandomPlayers() {
    this.state.errors.set([]);
    this.state.inProgress.set(true);

    forkJoin({
      one: this.getPlayerRecursive(),
      two: this.getPlayerRecursive(),
    }).subscribe((obj) => {
      this.state.players.set(obj);
      this.state.inProgress.set(false);
    });
  }

  getRandomStarships() {
    this.state.errors.set([]);
    this.state.inProgress.set(true);

    forkJoin({
      one: this.getStarshipRecursive(),
      two: this.getStarshipRecursive(),
    }).subscribe((obj) => {
      this.state.players.update((prev) => {
        if (prev) {
          prev!.one.starship = obj.one;
          prev!.two.starship = obj.two;
          return { ...prev };
        }
        return null;
      });

      this.state.inProgress.set(false);
    });
  }

  private getPlayerRecursive(): Observable<Person> {
    return this.apiService
      .getPerson(NumberUtils.getRandomInteger(minPersonId, maxPersonId))
      .pipe(
        takeUntil(this.isLoadingCanceled$),
        catchError((err) => {
          this.state.errors.update((prev) => [...prev, err.message]);
          return this.getPlayerRecursive();
        }),
      );
  }
  private getStarshipRecursive(): Observable<Starship> {
    return this.apiService
      .getStarship(NumberUtils.getRandomInteger(minStarshipId, maxStarshipId))
      .pipe(
        takeUntil(this.isLoadingCanceled$),
        catchError((err) => {
          this.state.errors.update((prev) => [...prev, err.message]);
          return this.getStarshipRecursive();
        }),
      );
  }
}
