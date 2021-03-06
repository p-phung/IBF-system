import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AreasOfFocusSummaryComponent } from './areas-of-focus-summary.component';

describe('AreasOfFocusSummaryComponent', () => {
  let component: AreasOfFocusSummaryComponent;
  let fixture: ComponentFixture<AreasOfFocusSummaryComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AreasOfFocusSummaryComponent],
        imports: [IonicModule, HttpClientTestingModule, RouterTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(AreasOfFocusSummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
