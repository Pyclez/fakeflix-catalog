import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Genre, Movie, MovieDetails } from '../models/movie.model';

interface TmdbListResponse<T> {
  results: T[];
}

interface TmdbGenreResponse {
  genres: Genre[];
}

export type PosterSize = 'w200' | 'w342' | 'w500' | 'original';
export type BackdropSize = 'w780' | 'w1280' | 'original';

@Injectable({
  providedIn: 'root',
})
export class Tmdb {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.tmdbBaseUrl;

  /** Lista de gêneros de filmes (Ação, Comédia, Drama...). */
  getGenres(): Observable<Genre[]> {
    return this.http
      .get<TmdbGenreResponse>(`${this.baseUrl}/genre/movie/list`, {
        headers: this.buildHeaders(),
        params: this.buildParams(),
      })
      .pipe(map((res) => res.genres));
  }

  /** Filmes em alta na semana — usado no banner de destaque. */
  getTrending(): Observable<Movie[]> {
    return this.http
      .get<TmdbListResponse<Movie>>(`${this.baseUrl}/trending/movie/week`, {
        headers: this.buildHeaders(),
        params: this.buildParams(),
      })
      .pipe(map((res) => res.results));
  }

  /** Filmes populares (usado como uma das fileiras do catálogo). */
  getPopular(): Observable<Movie[]> {
    return this.http
      .get<TmdbListResponse<Movie>>(`${this.baseUrl}/movie/popular`, {
        headers: this.buildHeaders(),
        params: this.buildParams(),
      })
      .pipe(map((res) => res.results));
  }

  /** Filmes mais bem avaliados. */
  getTopRated(): Observable<Movie[]> {
    return this.http
      .get<TmdbListResponse<Movie>>(`${this.baseUrl}/movie/top_rated`, {
        headers: this.buildHeaders(),
        params: this.buildParams(),
      })
      .pipe(map((res) => res.results));
  }

  /** Filmes de um gênero específico, ordenados por popularidade. */
  getMoviesByGenre(genreId: number): Observable<Movie[]> {
    return this.http
      .get<TmdbListResponse<Movie>>(`${this.baseUrl}/discover/movie`, {
        headers: this.buildHeaders(),
        params: this.buildParams({
          with_genres: String(genreId),
          sort_by: 'popularity.desc',
        }),
      })
      .pipe(map((res) => res.results));
  }

  /** Detalhes completos de um título, incluindo elenco (credits). */
  getMovieDetails(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(`${this.baseUrl}/movie/${id}`, {
      headers: this.buildHeaders(),
      params: this.buildParams({ append_to_response: 'credits' }),
    });
  }

  /** Monta a URL completa de uma imagem (pôster ou backdrop) do TMDB. */
  getImageUrl(path: string | null, size: PosterSize | BackdropSize = 'w500'): string {
    if (!path) {
      return 'https://placehold.co/500x750/141414/e5e5e5?text=Sem+imagem';
    }
    return `${environment.tmdbImageBaseUrl}/${size}${path}`;
  }

  /** Autenticação via Read Access Token (v4 auth), enviado como Bearer token. */
  private buildHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${environment.tmdbAccessToken}`);
  }

  private buildParams(extra: Record<string, string> = {}): HttpParams {
    let params = new HttpParams().set('language', 'pt-BR');

    for (const [key, value] of Object.entries(extra)) {
      params = params.set(key, value);
    }

    return params;
  }
}
