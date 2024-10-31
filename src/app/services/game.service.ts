import { inject, Injectable } from '@angular/core';
import { StateService } from '../core/state.service';
import { GameResult } from '../models/game-result';
import { Person } from '../models/person';
import { FileUtils } from '../utils/file-utils';
import { LocalStorage } from '../utils/local-storage';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private state = inject(StateService);
  
  private getScore(player: Person) {
    return player.mass * player.height + player.starship!.crew;
  }

  playAgain() {
    this.state.isFinished.set(false);
    this.state.players.set(null);
  }
  
  getWinner() {
    const players = this.state.players()!;
    const [score1, score2] = [
      this.getScore(players.one),
      this.getScore(players.two),
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

    this.state.isFinished.set(true)
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
}
