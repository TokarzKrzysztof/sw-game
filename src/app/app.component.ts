import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, finalize, forkJoin, Observable } from 'rxjs';
import { Person } from './models/person';
import { StarWarsService } from './services/star-wars.service';
import { FileUtils } from './utils/file-utils';
import { LocalStorage, Score } from './utils/local-storage';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private starWarsService = inject(StarWarsService);

  inProgress = false;
  isFinished = false;
  error: string | null = null;
  players: { one: Person; two: Person } | null = null;

  playAgain() {
    this.isFinished = false;
    this.players = null;
  }

  clearScores() {
    LocalStorage.clearValue('game-history');
    window.alert('Pomyślnie wyczyściłeś wyniki');
  }

  downloadScores() {
    const history = LocalStorage.getObjectValue('game-history');
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
        throw new Error(err.message);
      })
    );
  }

  getRandomPlayers() {
    this.makeMergedRequest({
      one: this.starWarsService.getPerson(Math.floor(Math.random() * 82)),
      two: this.starWarsService.getPerson(Math.floor(Math.random() * 82)),
    }).subscribe((obj) => {
      this.players = obj;
    });
  }

  getRandomStarships() {
    this.makeMergedRequest({
      one: this.starWarsService.getStarship(Math.floor(Math.random() * 36)),
      two: this.starWarsService.getStarship(Math.floor(Math.random() * 36)),
    }).subscribe((obj) => {
      this.players!.one.starship = obj.one;
      this.players!.two.starship = obj.two;
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

    let winner: Score['winner'];
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

    LocalStorage.setObjectValue('game-history', [
      ...(LocalStorage.getObjectValue('game-history') ?? []),
      { winner, scores: [score1, score2] },
    ]);

    this.isFinished = true;
  }
}
