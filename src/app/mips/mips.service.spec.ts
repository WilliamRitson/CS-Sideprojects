/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MipsService } from './mips.service';

describe('Service: Mips', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MipsService]
    });
  });

  it('should ...', inject([MipsService], (service: MipsService) => {
    expect(service).toBeTruthy();
  }));
});
