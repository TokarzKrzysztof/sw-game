import { TestBed } from '@angular/core/testing';

import { ReadonlyStateService } from './readonly-state.service';

describe('ReadonlyStateService', () => {
  let service: ReadonlyStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadonlyStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
