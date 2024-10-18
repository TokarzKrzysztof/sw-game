import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { Person } from '../models/person';
import { Starship } from '../models/starship';

export type SwResponse<T extends Record<string, unknown>> = {
  result: {
    properties: Record<keyof T, string>;
  };
};


@Injectable({
  providedIn: 'root',
})
export class StarWarsService {
  private httpClient = inject(HttpClient);

  getPerson(id: number) {
    return this.httpClient
      .get<SwResponse<Person>>(`https://www.swapi.tech/api/people/${id}`)
      .pipe(
        catchError(() => {
          throw new Error('Coś poszło nie tak, spróbuj wylosować ponownie');
        }),
        map((x) => {
          const item = x.result.properties;

          if (isNaN(+item.height)) {
            throw new Error(
              'Wysokość jest niepoprawna, spróbuj wylosować ponownie'
            );
          }
          if (isNaN(+item.mass)) {
            throw new Error(
              'Masa jest niepoprawna, spróbuj wylosować ponownie'
            );
          }
          return {
            height: +item.height,
            mass: +item.mass,
          };
        })
      );
  }

  getStarship(id: number) {
    return this.httpClient
      .get<SwResponse<Starship>>(`https://www.swapi.tech/api/starships/${id}`)
      .pipe(
        catchError(() => {
          throw new Error('Coś poszło nie tak, spróbuj wylosować ponownie');
        }),
        map((x) => {
          const item = x.result.properties;
          const crewData = +item.crew.replace(',', '');

          if (isNaN(crewData)) {
            throw new Error(
              'Dane dotyczące załogi są niepoprawne, spróbuj wylosować ponownie'
            );
          }
          return {
            crew: crewData,
          };
        })
      );
  }
}
