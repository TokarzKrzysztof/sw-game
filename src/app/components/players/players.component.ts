import { Component, input } from '@angular/core';
import { Players } from '../../models/players';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent {
  players = input.required<Players>()
}
