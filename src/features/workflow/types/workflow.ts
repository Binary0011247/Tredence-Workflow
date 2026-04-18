export const WORKFLOW_NODE_TYPES = [
  'start',
  'task',
  'approval',
  'automated',
  'end',
] as const

export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPES)[number]

export type KeyValuePairs = Record<string, string>

export interface StartNodeData {
  title: string
  metadata: KeyValuePairs
}

export interface TaskNodeData {
  title: string
  description: string
  assignee: string
  dueDate: string
  customFields: KeyValuePairs
}

export interface ApprovalNodeData {
  title: string
  approverRole: string
  autoApproveThreshold: number | null
}

export interface AutomatedStepNodeData {
  title: string
  actionId: string
  actionParams: KeyValuePairs
}

export interface EndNodeData {
  message: string
  includeSummary: boolean
}

export type WorkflowNodeDataMap = {
  start: StartNodeData
  task: TaskNodeData
  approval: ApprovalNodeData
  automated: AutomatedStepNodeData
  end: EndNodeData
}

export const NODE_DEFAULT_DATA: WorkflowNodeDataMap = {
  start: {
    title: 'Start',
    metadata: {},
  },
  task: {
    title: 'Task',
    description: '',
    assignee: '',
    dueDate: '',
    customFields: {},
  },
  approval: {
    title: 'Approval',
    approverRole: 'Manager',
    autoApproveThreshold: null,
  },
  automated: {
    title: 'Automated Step',
    actionId: '',
    actionParams: {},
  },
  end: {
    message: 'Workflow completed',
    includeSummary: false,
  },
}

export interface AutomationAction {
  id: string
  label: string
  params: string[]
}

export interface WorkflowGraphPayload {
  nodes: Array<{
    id: string
    type: WorkflowNodeType
    data: WorkflowNodeDataMap[WorkflowNodeType]
  }>
  edges: Array<{
    id: string
    source: string
    target: string
  }>
}

export interface SimulationRequest {
  workflow: WorkflowGraphPayload
}

export interface SimulationStep {
  step: number
  nodeId: string
  status: 'success' | 'skipped' | 'failed'
  message: string
}

export interface SimulationResponse {
  workflowId: string
  steps: SimulationStep[]
  issues: string[]
}
