import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { Movie } from '../../../core/models/movie.model';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-row',
  imports: [MovieCard],
  templateUrl: './movie-row.html',
  styleUrl: './movie-row.scss',
})
export class MovieRow implements AfterViewInit, OnDestroy {
  title = input.required<string>();
  movies = input.required<Movie[]>();
  movieSelected = output<Movie>();

  private readonly viewportEl = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly trackEl = viewChild.required<ElementRef<HTMLElement>>('track');
  private resizeObserver?: ResizeObserver;

  /** Página atual (janela de cards visível). Índice 0-based. */
  readonly page = signal(0);
  /** Quantas "páginas" de cards cabem no total, dado o tamanho atual do viewport. */
  readonly totalPages = signal(1);
  /** Largura do viewport em px — cada clique nas setas avança/volta exatamente esse valor. */
  readonly viewportWidth = signal(0);
  /** Controla se o deslizamento tem transição suave (desligada só durante o "salto" circular). */
  readonly animated = signal(true);

  readonly showArrows = computed(() => this.totalPages() > 1);

  ngAfterViewInit(): void {
    this.measure();

    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.viewportEl().nativeElement);
    this.resizeObserver.observe(this.trackEl().nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  next(): void {
    this.goTo(this.page() + 1);
  }

  prev(): void {
    this.goTo(this.page() - 1);
  }

  /**
   * Navega para a página `target`. Quando `target` sai do intervalo [0, totalPages-1]
   * (ou seja, passou da última ou voltou antes da primeira), a lista é circular:
   * volta pro começo (ou pro fim), sem deixar o usuário "preso" numa ponta.
   */
  private goTo(target: number): void {
    const total = this.totalPages();
    const isWrapJump = target < 0 || target >= total;
    const wrapped = ((target % total) + total) % total;

    if (!isWrapJump) {
      this.animated.set(true);
      this.page.set(wrapped);
      return;
    }

    // Desliga a transição, espera o navegador aplicar isso, só então "teleporta"
    // pra outra ponta — sem isso, o navegador anima o salto por cima de todos os cards.
    this.animated.set(false);
    requestAnimationFrame(() => {
      this.page.set(wrapped);
      requestAnimationFrame(() => this.animated.set(true));
    });
  }

  private measure(): void {
    const viewportWidth = this.viewportEl().nativeElement.clientWidth;
    const trackWidth = this.trackEl().nativeElement.scrollWidth;

    this.viewportWidth.set(viewportWidth);

    if (viewportWidth === 0) {
      return;
    }

    const pages = Math.max(1, Math.ceil(trackWidth / viewportWidth));
    this.totalPages.set(pages);

    if (this.page() > pages - 1) {
      this.page.set(pages - 1);
    }
  }
}
