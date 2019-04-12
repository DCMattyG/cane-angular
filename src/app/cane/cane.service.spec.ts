import { TestBed } from '@angular/core/testing';

import { CaneService } from './cane.service';

describe('CaneService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CaneService = TestBed.get(CaneService);
    expect(service).toBeTruthy();
  });
});
