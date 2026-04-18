import type { WorkflowNodeType } from '../types/workflow'
import type { NodeTypes } from 'reactflow'
import { WorkflowNodeCard } from './WorkflowNodeCard'

export const nodeTypeLabels: Record<WorkflowNodeType, string> = {
  start: 'Start Node',
  task: 'Task Node',
  approval: 'Approval Node',
  automated: 'Automated Step Node',
  end: 'End Node',
}

export const nodeTypes: NodeTypes = {
  start: WorkflowNodeCard,
  task: WorkflowNodeCard,
  approval: WorkflowNodeCard,
  automated: WorkflowNodeCard,
  end: WorkflowNodeCard,
}
