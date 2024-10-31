import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { Person } from '../models/person';
import { Starship } from '../models/starship';

const catchApiError = <T>(id: number) => {
  return catchError<T, never>((error: HttpErrorResponse) => {
    if (error.status === HttpStatusCode.NotFound) {
      throw new Error(
        `Nie znaleziono elementu o identyfikatorze: ${id}, pobieram dalej...`,
      );
    } else {
      throw new Error('Coś poszło nie tak');
    }
  });
};

export type SwResponse<T extends Record<string, unknown>> = {
  result: {
    properties: Record<keyof T, string>;
  };
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private httpClient = inject(HttpClient);

  getPerson(id: number): Observable<Person> {
    return this.httpClient
      .get<SwResponse<Person>>(`https://www.swapi.tech/api/people/${id}`)
      .pipe(
        catchApiError(id),
        map((x) => {
          const item = x.result.properties;

          if (isNaN(+item.height)) {
            throw new Error('Wysokość jest niepoprawna, pobieram dalej...');
          }
          if (isNaN(+item.mass)) {
            throw new Error('Masa jest niepoprawna, pobieram dalej...');
          }
          return {
            height: +item.height,
            mass: +item.mass,
          };
        }),
      );
  }

  getStarship(id: number): Observable<Starship> {
    return this.httpClient
      .get<SwResponse<Starship>>(`https://www.swapi.tech/api/starships/${id}`)
      .pipe(
        catchApiError(id),
        map((x) => {
          const item = x.result.properties;
          const crewAmount = +item.crew.replace(',', '');

          if (isNaN(crewAmount)) {
            throw new Error(
              'Dane dotyczące załogi są niepoprawne, pobieram dalej...',
            );
          }
          return {
            crew: crewAmount,
          };
        }),
      );
  }
}
