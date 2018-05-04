import { Pipe, PipeTransform } from '@angular/core';

const radixes = [
    { name: 'hex', value: 16 },
    { name: 'decimal', value: 10 },
    { name: 'octal', value: 8 },
    { name: 'binary', value: 2 }
  ];

function getPrefix(radix:number) {
  switch(radix) {
    case 2:
      return '0b'
    case 8:
      return '0';
    case 16:
      return '0x';
    default:
      return '';
  }
}

function changeRadix(value:number, radix:number) {
  return getPrefix(radix) + (value).toString(radix).toUpperCase()
}

@Pipe({
  name: 'radix'
})
export class RadixPipe implements PipeTransform {

  transform(value: number, args?: number): any {
    let radix = args[0] || 16;
    return changeRadix(value, radix);
  }

}


@Pipe({
  name: 'allRadix'
})
export class AllRadixPipe implements PipeTransform {

  transform(value: number, args?: number): any {
    let allRadix = radixes.map(r => r.name + ": " + changeRadix(value, r.value)).join('\n');
    return allRadix;
  }

}