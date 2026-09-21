import { DecimalPipe } from '@angular/common';
import { Component, HostListener, computed, effect, inject, input, output, signal } from '@angular/core';

import { MovieDetails } from '../../core/models/movie.model';
import { Tmdb } from '../../core/services/tmdb';

@Component({
  selector: 'app-movie-detail',
  imports: [DecimalPipe],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss',
})
export class MovieDetail {
  private readonly tmdb = inject(Tmdb);

  movieId = input.required<number>();
  close = output<void>();

  readonly details = signal<MovieDetails | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly backdropUrl = computed(() => {
    const movie = this.details();
    return movie ? this.tmdb.getImageUrl(movie.backdrop_path, 'w1280') : '';
  });

  readonly releaseYear = computed(() => {
    const releaseDate = this.details()?.release_date;
    return releaseDate ? releaseDate.slice(0, 4) : '';
  });

  readonly formattedRuntime = computed(() => {
    const runtime = this.details()?.runtime;
    if (!runtime) {
      return '';
    }
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  });

  readonly topCast = computed(() => this.details()?.credits?.cast.slice(0, 6) ?? []);

  constructor() {
    effect(() => {
      this.fetchDetails(this.movieId());
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private fetchDetails(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.details.set(null);

    this.tmdb.getMovieDetails(id).subscribe({
      next: (movie) => {
        this.details.set(movie);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Não foi possível carregar os detalhes deste título.');
      },
    });
  }
}
