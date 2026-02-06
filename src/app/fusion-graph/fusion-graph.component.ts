import * as vis from 'vis-network';
import { Component, Inject } from '@angular/core';
import { FusionPath, FusionResult } from '../fusionSearch';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface GraphData {
  nodes: {
    id: number,
    label: string,
    font: {
      color: string
    },
    color: string
  }[],
  edges: {
    from: number,
    to: number,
    color: string,
    length: number
  }[]
}

@Component({
  selector: 'app-fusion-graph',
  templateUrl: './fusion-graph.component.html',
  styleUrls: ['./fusion-graph.component.scss']
})
export class FusionGraphComponent {
  nodeId: number = 1;
  resizeObserver!: ResizeObserver;

  constructor(public dialogRef: MatDialogRef<FusionGraphComponent>, @Inject(MAT_DIALOG_DATA) public fusionResult: FusionResult) {
  }

  ngOnInit() {
    let graphContainer = document.getElementById('js-fusionGraph')!;
    let graphData = this.generateGraphData();
    let options: any = {
      layout: {
        hierarchical: {
          direction: 'DU',
          sortMethod: 'directed',
        }
      },
      physics: {
        hierarchicalRepulsion: {
          avoidOverlap: 0.8
        }
      },
      edges: {
        arrows: {to: true},
      },
    };
    let network = new vis.Network(graphContainer, graphData, options);

    this.resizeObserver = new ResizeObserver(() => {
      network.fit();
    });
    this.resizeObserver.observe(graphContainer);
  }

  ngOnDestroy() {
    this.resizeObserver.disconnect();
  }

  generateGraphData(): GraphData {
    let graphData: GraphData = {
      nodes: [],
      edges: []
    };
    this.nodeId = 1;
    this.fillGraphData(graphData, this.fusionResult.fusionPath, null, 0);
    return graphData;
  }

  fillGraphData(graphData: GraphData, fusionPath: FusionPath, parentNodeId: number | null, level: number) {
    let nodeColor;
    if (fusionPath.demon.alignment === 'L') {
      nodeColor = '#2196F3';
    } else if (fusionPath.demon.alignment === 'N') {
      nodeColor = '#FFFFFF';
    } else if (fusionPath.demon.alignment === 'C') {
      nodeColor = '#F44336';
    } else {
      nodeColor = '#FF8F00';
    }
    let nodeText = fusionPath.demon.tribe + ' ' + fusionPath.demon.name + ' ' + fusionPath.demon.level;
    let node = {
      id: this.nodeId++,
      label: nodeText,
      font: {
        color: nodeColor
      },
      color: 'transparent'
    };
    graphData.nodes.push(node);
    if (parentNodeId) {
      let link = {
        from: node.id,
        to: parentNodeId,
        color: 'rgba(255, 255, 255, 0.3)',
        length: 1
      };
      graphData.edges.push(link);
    }
    if (fusionPath.parents) {
      for (let path of fusionPath.parents) {
        this.fillGraphData(graphData, path, node.id, level + 1);
      }
    }
  }
}
