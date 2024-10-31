import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayersComponent } from './components/players/players.component';
import { GameService } from './services/game.service';
import { ReadonlyStateService } from './services/readonly-state.service';
import { RecursiveLoaderService } from './services/recursive-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PlayersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected recursiveLoaderService = inject(RecursiveLoaderService);
  protected gameService = inject(GameService);
  protected state = inject(ReadonlyStateService);
}
