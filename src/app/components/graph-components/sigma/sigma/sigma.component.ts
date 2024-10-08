import { AfterViewInit, Component } from '@angular/core';
import { MultiGraph } from 'graphology';
import Sigma from 'sigma';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SigmaService } from '../../../../services/sigma/sigma.service';
import { GraphData } from '../../../../models/graph-data';
import { circular } from 'graphology-layout';
import { animateNodes } from 'sigma/utils';
import { Coordinates, EdgeDisplayData, NodeDisplayData, PlainObject } from 'sigma/types';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { EdgeArrowProgram } from 'sigma/rendering';
import { EdgeCurvedArrowProgram } from '@sigma/edge-curve';
import { State } from '../../../../models/graph-state';
import { GraphNode } from '../../../../models/graph-Nodes';
import { GraphToolBarComponent } from '../../toolbarl/graph-tool-bar/graph-tool-bar.component';
import { DataOverviewDrawerComponent } from "../../data-overview-drawer/data-overview-drawer.component";
import { graphCategory } from '../../../../models/graph-category';
import { graphRecords } from '../../../../models/graph-records';
import { CommonModule, NgFor } from '@angular/common';
import { nodeData } from '../../../../models/node-data';
import { edgeData } from '../../../../models/edge-data';
import { GraphService } from '../../../../services/graph/graph.service';
import { MockBackService } from '../../../../services/mock-back/mock-back.service';

@Component({
  selector: 'app-sigma',
  standalone: true,
  imports: [
    NzIconModule,
    NzToolTipModule,
    GraphToolBarComponent,
    NgFor,
    CommonModule,
    DataOverviewDrawerComponent
],
  templateUrl: './sigma.component.html',
  styleUrl: './sigma.component.scss',
})
export class SigmaComponent implements AfterViewInit {
  private initialCameraState: { x: number; y: number; ratio: number } | null = null;
  private sigmaInstance!: Sigma;
  private draggedNode: string | null = null;
  private isDragging = false;
  private graph!: MultiGraph;
  private state: State = { searchQuery: '' };
  private cancelCurrentAnimation: (() => void) | null = null;
  private nodesList: GraphNode[] = [];
  private renderEdgeLabel = true;
  private toggleHover = false;
  protected drawerVisible = false;
  protected selectedNode: nodeData | null = null;
  protected selectedEdge: edgeData | null = null;
  protected selectedNodeId!: string;
  protected selectedEdgeId!: string;
  protected selectedCategories!: graphCategory;
  

  constructor(
    private sigmaService: SigmaService,
    private uploadService: GraphService,
    private mockBack : MockBackService
  ) {}

  ngAfterViewInit() {
    this.graph = new MultiGraph();

    document.getElementById('sigma-container')?.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.initializeGraph();

    this.subscribeToServices();

    this.updateNodesList(
      this.graph.nodes().map((node) => ({
        id: node,
        label: this.graph.getNodeAttribute(node, 'label'),
      }))
    );

    this.nodeClickHandler();

    this.edgeClickHandler();

    this.doubleClickHandler();

    this.sendGraphData();

    this.initializeCameraState();

    this.addDragNodeFuntionality();

   

    this.sigmaInstance.getMouseCaptor().on('mousedown', () => {
      if (!this.sigmaInstance.getCustomBBox()) this.sigmaInstance.setCustomBBox(this.sigmaInstance.getBBox());
    });

    this.handleLeaveNode();

   
  }

  protected resetCamera() {
    if (this.initialCameraState) {
      const camera = this.sigmaInstance.getCamera();
      camera.setState({
        x: this.initialCameraState.x,
        y: this.initialCameraState.y,
        ratio: this.initialCameraState.ratio,
      });
    }
  }

  protected zoomIn() {
    const camera = this.sigmaInstance.getCamera();
    camera.ratio = camera.ratio * 0.9;
    this.sigmaInstance.refresh();
  }

  protected zoomOut() {
    const camera = this.sigmaInstance.getCamera();
    camera.ratio = camera.ratio * 1.1;
    this.sigmaInstance.refresh();
  }

  protected circularLayout() {
    const circularPositions = circular(this.graph, { scale: 1 });

    this.cancelCurrentAnimation = animateNodes(this.graph, circularPositions, {
      duration: 2000,
      easing: 'linear',
    });
  }

  protected randomLayout() {
    if (this.cancelCurrentAnimation) this.cancelCurrentAnimation();

    const xExtents = { min: 0, max: 0 };
    const yExtents = { min: 0, max: 0 };

    this.graph.forEachNode((node, attributes) => {
      xExtents.min = Math.min(attributes['x'], xExtents.min);
      xExtents.max = Math.max(attributes['x'], xExtents.max);
      yExtents.min = Math.min(attributes['y'], yExtents.min);
      yExtents.max = Math.max(attributes['y'], yExtents.max);
    });

    const randomPositions: PlainObject<PlainObject<number>> = {};

    this.graph.forEachNode((node) => {
      randomPositions[node] = {
        x: Math.random() * (xExtents.max - xExtents.min),
        y: Math.random() * (yExtents.max - yExtents.min),
      };
    });

    this.cancelCurrentAnimation = animateNodes(this.graph, randomPositions, { duration: 2000 });
  }

  protected setHoveredNode(node?: string) {
    if (node) {
      this.state.hoveredNode = node;
      this.state.hoveredNeighbors = new Set(this.graph.neighbors(node));
    }

    // Compute the partial that we need to re-render to optimize the refresh
    const nodes = this.graph.filterNodes((n) => n !== this.state.hoveredNode && !this.state.hoveredNeighbors?.has(n));
    const nodesIndex = new Set(nodes);
    const edges = this.graph.filterEdges((e) => this.graph.extremities(e).some((n) => nodesIndex.has(n)));

    if (!node) {
      this.state.hoveredNode = undefined;
      this.state.hoveredNeighbors = undefined;
    }

    // Refresh rendering
    this.sigmaInstance.refresh({
      partialGraph: {
        nodes,
        edges,
      },
      skipIndexation: true,
    });
  }

  private addNodes(nodes: GraphNode[]) {
    nodes.forEach((node: GraphNode) => {
      this.graph.addNode(node.id, {
        label: node.label,
        x: node.x,
        y: node.y,
        color: node.color,
        size: 20,
        expanded: node.expanded,
      });
    });
  }

  private addEdges(edges: { id: string; source: string; target: string }[]) {
   
    edges.forEach((edge: { id: string; source: string; target: string }) => {
      const attr = {
        id: edge.id,
        label: 'test',
        size: 10,
      };
      this.graph.addEdge(edge.source, edge.target, attr);
    });
    
  }

  private addDragNodeFuntionality() {
    this.sigmaInstance.on('downNode', (e) => {
      this.isDragging = true;
      this.draggedNode = e.node;

      this.graph.setNodeAttribute(this.draggedNode, 'highlighted', true);
    });

    // While dragging a node, update its position based on mouse movement.
    // Also, stop Sigma from moving the camera during the drag.
    this.sigmaInstance.getMouseCaptor().on('mousemovebody', (e) => {
      if (!this.isDragging || !this.draggedNode) return;
      const pos = this.sigmaInstance.viewportToGraph(e);

      this.graph.setNodeAttribute(this.draggedNode, 'x', pos.x);
      this.graph.setNodeAttribute(this.draggedNode, 'y', pos.y);

      // Prevent sigma to move camera:
      e.preventSigmaDefault();
      e.original.preventDefault();
      e.original.stopPropagation();
    });

    // When the mouse is released, stop dragging the node.
    // Remove the highlight from the node and reset dragging state.
    this.sigmaInstance.getMouseCaptor().on('mouseup', () => {
      if (this.draggedNode) {
        this.graph.removeNodeAttribute(this.draggedNode, 'highlighted');
      }
      this.isDragging = false;
      this.draggedNode = null;
    });
  }

  private updateNodesList(nodes: { id: string; label: string }[]) {
    this.sigmaService.updateNodesList(nodes);
  }

  private nodeSetting() {
    this.sigmaInstance.setSetting('nodeReducer', (node, data) => {
      const res: Partial<NodeDisplayData> = { ...data };
      if (this.state.selectedNode === node) {
        res.highlighted = true;
      }

      if (this.state.hoveredNeighbors && !this.state.hoveredNeighbors.has(node) && this.state.hoveredNode !== node) {
        res.label = '';
        res.color = '#f6f6f6';
      }

      if (this.state.selectedNode === node) {
        res.highlighted = true;
      } else if (this.state.suggestions) {
        if (this.state.suggestions.has(node)) {
          res.forceLabel = true;
        } else {
          res.label = '';
          res.color = '#f6f6f6';
        }
      }

      return res;
    });
  }

  private expandNode(id: string, neighbors: graphRecords) {
    const centerCordinate = {
      x: this.graph.getNodeAttribute(id, 'x'),
      y: this.graph.getNodeAttribute(id, 'y'),
    };
    const newPositions: PlainObject<PlainObject<number>> = {};

    neighbors.nodes.forEach((neighbour, index) => {
      if (!this.graph.hasNode(neighbour.id)) {
      this.graph.addNode(neighbour.id, {
        label: neighbour.label,
        x: centerCordinate.x,
        y: centerCordinate.y,
        size: 20,
        color: '#000',
        expanded: true,
      });

      const angle = (index * (2 * Math.PI)) / neighbors.nodes.length;
      const radius = 0.5;

      const newX = centerCordinate.x + radius * Math.cos(angle);
      const newY = centerCordinate.y + radius * Math.sin(angle);

      newPositions[neighbour.id] = {
        x: newX,
        y: newY,
      };}
    });

    this.addEdges(neighbors.edges);
    this.graph.setNodeAttribute(id, 'expanded', true);
    animateNodes(this.graph, newPositions, { duration: 300 });
  }

  private initializeGraph() {
    this.sigmaInstance = new Sigma(this.graph, document.getElementById('sigma-container') as HTMLDivElement, {
      allowInvalidContainer: true,
      enableEdgeEvents: true,
      defaultEdgeType: 'curved',
      renderEdgeLabels: this.renderEdgeLabel,
      edgeProgramClasses: {
        straight: EdgeArrowProgram,
        curved: EdgeCurvedArrowProgram,
      },
    });
    this.sigmaInstance.refresh();
  }

  private subscribeToServices() {
    this.sigmaService.circularLayoutTrigger$.subscribe(() => {
      this.circularLayout();
    });

    this.sigmaService.renderEdgeLabel$.subscribe((data)=>{
      this.renderEdgeLabel = data;
      this.sigmaInstance.setSetting('renderEdgeLabels', this.renderEdgeLabel);
      this.sigmaInstance.refresh();
    })

    this.sigmaService.toggleHover$.subscribe((data)=>{
      this.toggleHover = data
      
      if(data){
        this.handleEnterNode()
      }
    })

    this.sigmaService.randomLayoutTrigger$.subscribe(() => {
      this.randomLayout();
    });

    this.sigmaService.searchedNodeOb$.subscribe((node) => {
      this.state.selectedNode = node;
      const nodePosition = this.sigmaInstance.getNodeDisplayData(node) as Coordinates;

      this.sigmaInstance.getCamera().animate(nodePosition, { duration: 500 });
      this.nodeSetting();
    });

    this.sigmaService.getGraph$.subscribe((data) => {
      const nodes = data['nodes'];
      const edges = data['edges'];
      this.nodesList = [];
      
      nodes.forEach((element: { id: string; label: string }) => {
        this.nodesList.push({
          id: element.id,
          label: element.label,
          x: Math.random() * 2,
          y: Math.random() * 2,
          color: '#000',
          size: 10,
          expanded: true,
        });
      });
      this.graph.clear();
      this.sigmaInstance.refresh();
      this.addNodes(this.nodesList);
      this.addEdges(edges);
    });

    this.sigmaService.selectedGraphCategories$.subscribe({
      next: (data) => {
        this.selectedCategories = data;
      },
    });
  }

  private nodeClickHandler() {
    this.sigmaInstance.on('clickNode', async (event) => {
      this.selectedNodeId = event.node;

      this.uploadService.getNodeById(event.node).subscribe({
        next: (data) => {
          this.selectedNode = data;
        },
      });
      this.selectedEdge = null;
      this.open();
    });
  }

  private edgeClickHandler() {
    this.sigmaInstance.on('clickEdge', (event) => {
      this.selectedEdgeId = (parseInt(event.edge.charAt(event.edge.length - 1)) + 1).toString();
      
      this.uploadService.getEdgeById(this.graph.getEdgeAttributes(event.edge)['id']).subscribe({
        next: (data) => {
          this.selectedEdge = data;
        },
      });
      this.selectedNode = null;
      this.open();
    });
  }

  private doubleClickHandler() {
    this.sigmaInstance.on('doubleClickNode', (event) => {
      let neighborData : graphRecords = {nodes: [] , edges:[]}
      event.preventSigmaDefault();
      if (this.graph.getNodeAttribute(event.node, 'expanded')) {
        this.collapseNode(event.node);
      } else {
        this.mockBack.getNeighbourById(event.node).subscribe((data) => {
          neighborData = data
         
        });
        this.expandNode(event.node, neighborData);
      }
      
    });
    this.sigmaInstance.on('doubleClickStage', (e) => {
      e.preventSigmaDefault();
    });
  }

  private sendGraphData() {
    const data: GraphData = {
      numberOfNodes: this.graph.order,
      numberOfEdges: this.graph.size,
    };
    this.sigmaService.changeData(data);
  }

  private initializeCameraState() {
    const camera = this.sigmaInstance.getCamera();
    this.initialCameraState = {
      x: camera.x,
      y: camera.y,
      ratio: camera.ratio,
    };
  }

  private handleEnterNode() {
    this.sigmaInstance.on('enterNode', ({ node }) => {
      if (this.toggleHover) {
        this.setHoveredNode(node);
      }
    });

    this.nodeSetting();

    this.setReducerSetting();
  }

  private handleLeaveNode() {
    this.sigmaInstance.on('leaveNode', () => {
      this.setHoveredNode(undefined);
    });
  }

  private setReducerSetting() {
    this.sigmaInstance.setSetting('edgeReducer', (edge, data) => {
      const res: Partial<EdgeDisplayData> = { ...data };

      if (this.state.hoveredNode && !this.graph.hasExtremity(edge, this.state.hoveredNode)) {
        res.hidden = true;
      }

      if (
        this.state.suggestions &&
        (!this.state.suggestions.has(this.graph.source(edge)) || !this.state.suggestions.has(this.graph.target(edge)))
      ) {
        res.hidden = true;
      }

      return res;
    });
  }

  protected open(): void {
    this.drawerVisible = true;
  }

  protected close(): void {
    this.drawerVisible = false;
    this.selectedEdge = null;
    this.selectedNode = null;
  }

  collapseNode(id: string) {
    const centerCordinate = {
      x: this.graph.getNodeAttribute(id, 'x'),
      y: this.graph.getNodeAttribute(id, 'y'),
    };
    const newPositions: PlainObject<PlainObject<number>> = {};
    const neighbours = this.graph.neighbors(id);
    

    neighbours.forEach((neighbour) => {
      const neighborNeighbors = this.graph.neighbors(neighbour);
      const hasOnlyClickedNodeAsNeighbor = neighborNeighbors.length === 1 && neighborNeighbors[0] === id;
      if (hasOnlyClickedNodeAsNeighbor) {
        newPositions[neighbour] = {
          x: centerCordinate.x,
          y: centerCordinate.y,
        };
  
        setTimeout(() => {
          this.graph.dropNode(neighbour);
        }, 550);
      }
      
    });

    this.graph.setNodeAttribute(id, 'expanded', false);
    animateNodes(this.graph, newPositions, { duration: 500 });
  }
}
