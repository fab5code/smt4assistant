import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import {Demon} from './demon';

@Directive({
  selector: '[appAlignment]'
})
export class AlignmentDirective {
  @Input() appAlignment!: Demon;

  constructor(private element: ElementRef) {
  }

  ngOnInit() {
    this.updateClass();
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes['appAlignment']) {
      this.updateClass();
    }
  }

  updateClass() {
    this.element.nativeElement.classList.remove('law');
    this.element.nativeElement.classList.remove('neutral');
    this.element.nativeElement.classList.remove('chaos');
    this.element.nativeElement.classList.remove('special');
    if (this.appAlignment.alignment === 'L') {
      this.element.nativeElement.classList.add('law');
    } else if (this.appAlignment.alignment === 'N') {
      this.element.nativeElement.classList.add('neutral');
    } else if (this.appAlignment.alignment === 'C') {
      this.element.nativeElement.classList.add('chaos');
    } else if (this.appAlignment.alignment === 'S') {
      this.element.nativeElement.classList.add('special');
    }
  }
}
