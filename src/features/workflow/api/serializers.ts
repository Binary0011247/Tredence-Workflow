import type { Edge } from 'reactflow'
import type { WorkflowNode } from '../store/workflowStore'
import type { WorkflowGraphPayload } from '../types/workflow'

export function serializeWorkflowGraph(
  nodes: WorkflowNode[],
  edges: Edge[]
): WorkflowGraphPayload {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type!,
      data: node.data,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
  }
}
