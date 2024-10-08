import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphComponent } from './graph.component';
import { NZ_ICONS, NzIconService } from 'ng-zorro-antd/icon';

import {
  ProjectOutline,
  NodeIndexOutline,
  PlusOutline,
  ImportOutline,
  RadarChartOutline,
  SyncOutline,
  UserOutline,
  FullscreenOutline,
  BarChartOutline,
  FilterOutline,
  SettingOutline,
  GithubOutline,
  CloudDownloadOutline,
  MenuOutline,
} from '@ant-design/icons-angular/icons';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;

  const mockActivatedRoute = {
    params: of({ id: 1 }),
    snapshot: { params: { id: 1 } },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphComponent],
      providers: [
        NzIconService,
        {
          provide: NZ_ICONS,
          useValue: [
            NodeIndexOutline,
            ProjectOutline,
            PlusOutline,
            ImportOutline,
            RadarChartOutline,
            SyncOutline,
            UserOutline,
            FullscreenOutline,
            BarChartOutline,
            FilterOutline,
            SettingOutline,
            GithubOutline,
            CloudDownloadOutline,
            MenuOutline
          ],
        },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('SHOULD be created WHEN ever', () => {
    expect(component).toBeTruthy();
  });
});
