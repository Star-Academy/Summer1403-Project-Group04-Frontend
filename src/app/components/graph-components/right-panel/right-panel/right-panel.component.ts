import { Component } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SigmaService } from '../../../../services/sigma/sigma.service';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [NzIconModule , NzToolTipModule],
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss',
})
export class RightPanelComponent {
  data: any;
  selectedNode!: string;

  constructor(private sigmaService: SigmaService) {}

  ngOnInit(): void {
    this.sigmaService.currentData.subscribe((data) => {
      this.data = data;
      console.log(data);
    });

    this.sigmaService.nodeData.subscribe((data) => {
      this.selectedNode = data;
      console.log(data);
    });
  }
}
