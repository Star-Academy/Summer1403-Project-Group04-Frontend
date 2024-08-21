import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NZ_ICONS, NzIconService } from 'ng-zorro-antd/icon';
import { DotChartOutline } from '@ant-design/icons-angular/icons';
import { EditRoleComponent } from './edit-role.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

describe('EditRoleComponent', () => {
  let component: EditRoleComponent;
  let fixture: ComponentFixture<EditRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRoleComponent],
      providers: [
        provideAnimationsAsync(),
        provideHttpClient(),
        NzIconService,
        {
          provide: NZ_ICONS,
          useValue: [DotChartOutline],
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
