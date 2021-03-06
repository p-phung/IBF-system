import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockScenarioService } from './mock-scenario.service';

describe('MockScenarioService', () => {
  let service: MockScenarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(MockScenarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
