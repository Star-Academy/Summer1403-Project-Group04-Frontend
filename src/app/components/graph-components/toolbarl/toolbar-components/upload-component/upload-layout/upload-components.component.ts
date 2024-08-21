import { Component } from '@angular/core';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { UploadNodeComponent } from "../upload-node/upload-node.component";
import { UploadEdgeComponent } from "../upload-edge/upload-edge.component";

@Component({
  selector: 'app-upload-components',
  standalone: true,
  imports: [NzStepsModule, NzDividerModule, NzInputModule, NzButtonModule, NzSelectModule, NzUploadModule, NzIconModule, NzTabsModule, UploadNodeComponent, UploadEdgeComponent],
  templateUrl: './upload-components.component.html',
  styleUrl: './upload-components.component.scss',
})
export class UploadComponentsComponent {
  current = 0;

  next(){
    this.current ++
  }

  back(){
    this.current --
  }
}
