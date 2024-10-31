import { TestBed } from '@angular/core/testing';

import { RecursiveLoaderService } from './recursive-loader.service';

describe('RecursiveLoaderService', () => {
  let service: RecursiveLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecursiveLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
