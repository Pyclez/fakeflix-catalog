import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Genre, Movie, MovieRow as MovieRowModel } from '../../core/models/movie.model';
import { Tmdb } from '../../core/services/tmdb';
import { MovieDetail } from '../movie-detail/movie-detail';
import { MovieRow } from './movie-row/movie-row';

/** Gêneros usados para montar fileiras extras no catálogo, além de populares/mais bem avaliados. */
const FEATURED_GENRE_NAMES = ['Ação', 'Comédia', 'Terror', 'Romance', 'Animação', 'Ficção científica'];

@Component({
  selector: 'app-catalog',
  imports: [MovieRow, MovieDetail],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog implements OnInit {
  private readonly tmdb = inject(Tmdb);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly featured = signal<Movie | null>(null);
  readonly rows = signal<MovieRowModel[]>([]);
  readonly selectedMovieId = signal<number | null>(null);

  readonly featuredBackdropUrl = computed(() => {
    const movie = this.featured();
    return movie ? this.tmdb.getImageUrl(movie.backdrop_path, 'original') : '';
  });

  ngOnInit(): void {
    this.loadCatalog();
  }

  onMovieSelected(movie: Movie): void {
    this.selectedMovieId.set(movie.id);
  }

  closeDetail(): void {
    this.selectedMovieId.set(null);
  }

  private loadCatalog(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      trending: this.tmdb.getTrending(),
      popular: this.tmdb.getPopular(),
      topRated: this.tmdb.getTopRated(),
      genres: this.tmdb.getGenres(),
    }).subscribe({
      next: ({ trending, popular, topRated, genres }) => {
        this.featured.set(trending[0] ?? null);

        this.rows.set([
          { title: 'Em alta', genreId: 0, movies: trending },
          { title: 'Populares', genreId: 0, movies: popular },
          { title: 'Mais bem avaliados', genreId: 0, movies: topRated },
        ]);

        this.loading.set(false);
        this.loadGenreRows(genres);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(
          'Não foi possível carregar o catálogo. Confira se a API key do TMDB foi configurada em src/environments/environment.ts.',
        );
      },
    });
  }

  private loadGenreRows(genres: Genre[]): void {
    const featuredGenres = genres.filter((genre) => FEATURED_GENRE_NAMES.includes(genre.name));

    featuredGenres.forEach((genre) => {
      this.tmdb.getMoviesByGenre(genre.id).subscribe((movies) => {
        this.rows.update((current) => [...current, { title: genre.name, genreId: genre.id, movies }]);
      });
    });
  }
}
