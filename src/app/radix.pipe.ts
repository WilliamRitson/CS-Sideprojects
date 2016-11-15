import { Pipe, PipeTransform } from '@angular/core';

function getPrefix(radix:number) {
  switch(radix) {
    case 8:
      return '0';
    case 16:
      return '0x';
    default:
      return '';
  }
}

@Pipe({
  name: 'radix'
})
export class RadixPipe implements PipeTransform {

  transform(value: number, args?: number): any {
    let radix = args[0] || 16;
    return getPrefix(radix) + (value).toString(radix).toUpperCase();
  }

}
