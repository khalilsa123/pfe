import { TestBed } from '@angular/core/testing';

import { AuthentificationnServiceService } from './authentificationn.service';
//AuthentificationnService"kent lenna"
describe('AuthentificationnService', () => {
  let service: AuthentificationnServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthentificationnServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
  