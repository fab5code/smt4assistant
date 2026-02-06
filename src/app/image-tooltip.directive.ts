import {DOCUMENT} from '@angular/common';
import {Directive, ElementRef, Inject, Input, Renderer2, SimpleChanges} from '@angular/core';
import {arrow, computePosition, flip, offset, shift} from '@floating-ui/dom';
import {Demon} from './demon';

@Directive({
  selector: '[appImageTooltip]'
})
export class ImageTooltipDirective {
  private tooltipContentElement!: HTMLElement;
  private imageElement!: any;
  private arrowElement!: HTMLElement;
  private eventListeners!: Array<Function>;

  @Input() appImageTooltip!: Demon;

  constructor(@Inject(DOCUMENT) private document: Document, private element: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.tooltipContentElement = this.document.createElement('div');
    this.tooltipContentElement.classList.add('l-imageTooltip');

    this.imageElement = new Image(300, 300);;
    this.imageElement.classList.add('l-imageTooltip-image');
    this.updateImage();
    this.renderer.appendChild(this.tooltipContentElement, this.imageElement);

    this.arrowElement = this.document.createElement('div');
    this.arrowElement.classList.add('l-imageTooltip-arrow');
    this.renderer.appendChild(this.tooltipContentElement, this.arrowElement);

    this.renderer.appendChild(this.element.nativeElement, this.tooltipContentElement);

    this.eventListeners = [
      this.renderer.listen(this.element.nativeElement, "mouseenter", () => this.show()),
      this.renderer.listen(this.element.nativeElement, "mouseleave", () => this.hide()),
      this.renderer.listen(this.element.nativeElement, "focus", () => this.show()),
      this.renderer.listen(this.element.nativeElement, "blur", () => this.hide())
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appImageTooltip']) {
      this.updateImage();
    }
  }

  updateImage(): void {
    if (this.imageElement) {
      this.imageElement.src = `assets/img/demons/${this.appImageTooltip.name}.webp`;
    }
  }

  update(): void {
    computePosition(this.element.nativeElement, this.tooltipContentElement, {
      placement: 'right',
      middleware: [
        offset(12),
        flip(),
        shift({padding: 5}),
        arrow({element: this.arrowElement}),
      ],
    }).then(({x, y, placement, middlewareData}) => {
      Object.assign(this.tooltipContentElement.style, {
        left: `${x}px`,
        top: `${y}px`
      });

      const {x: arrowX, y: arrowY} = middlewareData.arrow!;
      const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right"
      }[placement.split("-")[0]]!;
      let arrowStyle: any = {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: ''
      };
      arrowStyle[staticSide] = '-8px';
      Object.assign(this.arrowElement.style, arrowStyle);
    });
  }

  ngOnDestroy() {
    this.tooltipContentElement.remove();
    if (this.eventListeners?.length) {
      this.eventListeners.forEach((removeEventListenerFn) =>
        removeEventListenerFn()
      );
    }
  }

  private show(): void {
    this.tooltipContentElement.classList.add('show');
    this.update();
  }

  private hide(): void {
    this.tooltipContentElement.classList.remove('show');
  }
}
