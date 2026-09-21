import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';

import { Movie } from '../../../core/models/movie.model';
import { Tmdb } from '../../../core/services/tmdb';

@Component({
  selector: 'app-movie-card',
  imports: [DecimalPipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
})
export class MovieCard {
  private readonly tmdb = inject(Tmdb);

  movie = input.required<Movie>();
  select = output<Movie>();

  readonly posterUrl = computed(() => this.tmdb.getImageUrl(this.movie().poster_path, 'w342'));

  onSelect(): void {
    this.select.emit(this.movie());
  }
}
