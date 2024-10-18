import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, finalize, forkJoin, Observable, of } from 'rxjs';
import { PlayersComponent } from './components/players/players.component';
import { GameResult } from './models/game-result';
import { Person } from './models/person';
import { Players } from './models/players';
import { StarWarsService } from './services/star-wars.service';
import { FileUtils } from './utils/file-utils';
import { LocalStorage } from './utils/local-storage';
import { NumberUtils } from './utils/number-utils';

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

  inProgress = false;
  isFinished = false;
  error: string | null = null;
  players: Players | null = null;

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

  private makeMergedRequest<T extends Record<string, Observable<unknown>>>(
    calls: T
  ) {
    this.error = null;
    this.inProgress = true;

    return forkJoin(calls).pipe(
      finalize(() => (this.inProgress = false)),
      catchError((err: Error) => {
        this.error = err.message;
        return of(undefined);
      })
    );
  }

  getRandomPlayers() {
    this.makeMergedRequest({
      one: this.starWarsService.getPerson(
        NumberUtils.getRandomInteger(minPersonId, maxPersonId)
      ),
      two: this.starWarsService.getPerson(
        NumberUtils.getRandomInteger(minPersonId, maxPersonId)
      ),
    }).subscribe((obj) => {
      if (obj) {
        this.players = obj;
      }
    });
  }

  getRandomStarships() {
    this.makeMergedRequest({
      one: this.starWarsService.getStarship(
        NumberUtils.getRandomInteger(minStarshipId, maxStarshipId)
      ),
      two: this.starWarsService.getStarship(
        NumberUtils.getRandomInteger(minStarshipId, maxStarshipId)
      ),
    }).subscribe((obj) => {
      if (obj) {
        this.players!.one.starship = obj.one;
        this.players!.two.starship = obj.two;
      }
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
