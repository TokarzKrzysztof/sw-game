import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, forkJoin, Observable, Subject, takeUntil } from 'rxjs';
import { PlayersComponent } from './components/players/players.component';
import { GameResult } from './models/game-result';
import { Person } from './models/person';
import { Players } from './models/players';
import { StarWarsService } from './services/star-wars.service';
import { FileUtils } from './utils/file-utils';
import { LocalStorage } from './utils/local-storage';
import { NumberUtils } from './utils/number-utils';
import { Starship } from './models/starship';

const minPersonId = 1;
const maxPersonId = 83;
const minStarshipId = 2;
const maxStarshipId = 75;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PlayersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private starWarsService = inject(StarWarsService);

  isLoadingCanceled$ = new Subject<void>();
  inProgress = false;
  isFinished = false;
  errors: string[] = [];
  players: Players | null = null;

  cancelLoading() {
    this.isLoadingCanceled$.next();
    this.inProgress = false
  }

  playAgain() {
    this.isFinished = false;
    this.players = null;
  }

  clearScores() {
    LocalStorage.clearValue('game-history');
    window.alert('Pomyślnie wyczyściłeś wyniki');
  }

  downloadScores() {
    const history = LocalStorage.getValue('game-history');
    if (!history?.length) {
      window.alert('Brak historii gier do pobrania');
      return;
    }

    const contents = history!
      .map((x, i) => {
        let text = `Gra numer ${i + 1}`;
        text += '\n';
        text += `Wyniki: ${x.scores[0]}, ${x.scores[1]}`;
        text += '\n';
        text += `---${
          x.winner === 'draw'
            ? 'Remis'
            : x.winner === 'one'
            ? 'Wygrał gracz 1'
            : 'Wygrał gracz 2'
        }---`;
        return text;
      })
      .join('\n\n');

    FileUtils.downloadTxtFile(contents, 'wyniki.txt');
  }

  private getPlayerRecursive(): Observable<Person> {
    return this.starWarsService
      .getPerson(NumberUtils.getRandomInteger(minPersonId, maxPersonId))
      .pipe(
        takeUntil(this.isLoadingCanceled$),
        catchError((err) => {
          this.errors.push(err.message);
          return this.getPlayerRecursive();
        })
      );
  }
  private getStarshipRecursive(): Observable<Starship> {
    return this.starWarsService
      .getStarship(NumberUtils.getRandomInteger(minStarshipId, maxStarshipId))
      .pipe(
        takeUntil(this.isLoadingCanceled$),
        catchError((err) => {
          this.errors.push(err.message);
          return this.getStarshipRecursive();
        })
      );
  }

  getRandomPlayers() {
    this.errors = [];
    this.inProgress = true;

    forkJoin({
      one: this.getPlayerRecursive(),
      two: this.getPlayerRecursive(),
    }).subscribe((obj) => {
      this.players = obj;
      this.inProgress = false;
    });
  }

  getRandomStarships() {
    this.errors = [];
    this.inProgress = true;

    forkJoin({
      one: this.getStarshipRecursive(),
      two: this.getStarshipRecursive(),
    }).subscribe((obj) => {
      this.players!.one.starship = obj.one;
      this.players!.two.starship = obj.two;
      this.inProgress = false;
    });
  }

  private getScore(player: Person) {
    return player.mass * player.height + player.starship!.crew;
  }

  getWinner() {
    const [score1, score2] = [
      this.getScore(this.players!.one),
      this.getScore(this.players!.two),
    ];

    let winner: GameResult['winner'];
    if (score1 > score2) {
      window.alert('Gracz 1 wygrywa!');
      winner = 'one';
    } else if (score1 === score2) {
      window.alert('Remis!');
      winner = 'draw';
    } else {
      window.alert('Gracz 2 wygrywa!');
      winner = 'two';
    }

    LocalStorage.setValue('game-history', [
      ...(LocalStorage.getValue('game-history') ?? []),
      { winner, scores: [score1, score2] },
    ]);

    this.isFinished = true;
  }
}
