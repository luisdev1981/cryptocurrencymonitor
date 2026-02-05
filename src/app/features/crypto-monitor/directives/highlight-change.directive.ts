/**
 * Highlight Change Directive
 * 
 * Directiva personalizada que aplica animaciones flash cuando el precio cambia.
 * 
 * Explicación Feynman:
 * Una directiva es como "enseñarle un nuevo truco al HTML". Esta directiva
 * observa cuando el precio cambia y aplica una animación:
 * - Verde si el precio sube (como cuando tu equipo anota)
 * - Rojo si el precio baja (como cuando el otro equipo anota)
 * 
 * Usa el ciclo de vida de Angular (ngOnChanges) para detectar cambios automáticamente.
 */

import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlightChange]',
  standalone: true
})
export class HighlightChangeDirective implements OnChanges {
  /**
   * Precio actual - cuando este cambia, la directiva reacciona
   */
  @Input() currentPrice!: number;

  /**
   * Precio anterior - para comparar y saber si subió o bajó
   */
  @Input() previousPrice!: number;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  /**
   * ngOnChanges se ejecuta automáticamente cuando los @Input cambian
   * 
   * Explicación Feynman:
   * Es como tener un "vigilante" que observa los inputs. Cada vez que
   * currentPrice cambia, este método se ejecuta automáticamente.
   * 
   * @param changes Objeto con información sobre qué cambió
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Verificar que currentPrice cambió y no es el primer cambio
    // (no queremos animar en la carga inicial)
    if (changes['currentPrice'] && !changes['currentPrice'].firstChange) {
      const current = changes['currentPrice'].currentValue;
      const previous = this.previousPrice;

      // Comparar precios y aplicar la animación correspondiente
      if (current > previous) {
        this.flashGreen(); // Precio subió 📈
      } else if (current < previous) {
        this.flashRed(); // Precio bajó 📉
      }
      // Si son iguales, no hacemos nada
    }
  }

  /**
   * Aplica animación flash verde (precio subió)
   * 
   * Explicación Feynman:
   * Agregamos una clase CSS 'flash-green' al elemento, que tiene una
   * animación definida. Después de 500ms, removemos la clase para que
   * pueda volver a animarse en el próximo cambio.
   */
  private flashGreen(): void {
    // Agregar la clase de animación
    this.renderer.addClass(this.el.nativeElement, 'flash-green');

    // Remover la clase después de 500ms (duración de la animación)
    setTimeout(() => {
      this.renderer.removeClass(this.el.nativeElement, 'flash-green');
    }, 500);
  }

  /**
   * Aplica animación flash rojo (precio bajó)
   */
  private flashRed(): void {
    this.renderer.addClass(this.el.nativeElement, 'flash-red');

    setTimeout(() => {
      this.renderer.removeClass(this.el.nativeElement, 'flash-red');
    }, 500);
  }
}
