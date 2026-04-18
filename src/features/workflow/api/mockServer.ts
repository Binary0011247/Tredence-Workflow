import type {
  AutomationAction,
  SimulationRequest,
  SimulationResponse,
  WorkflowNodeType,
} from '../types/workflow'

export const WORKFLOW_API_ENDPOINTS = {
  automations: '/automations',
  simulate: '/simulate',
} as const

const AUTOMATION_ACTIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient'],
  },
]

const MESSAGE_BY_TYPE: Record<WorkflowNodeType, string> = {
  start: 'Workflow started',
  task: 'Task assigned and queued',
  approval: 'Approval decision captured',
  automated: 'Automated action executed',
  end: 'Workflow completed',
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const collectIssues = (request: SimulationRequest): string[] => {
  const { nodes, edges } = request.workflow
  const nodeIds = new Set(nodes.map((node) => node.id))
  const issues: string[] = []

  if (nodes.length === 0) {
    issues.push('Workflow has no nodes.')
  }

  const startNodes = nodes.filter((node) => node.type === 'start')
  if (startNodes.length !== 1) {
    issues.push('Workflow must contain exactly one Start node.')
  }

  const hasDanglingEdge = edges.some(
    (edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target)
  )
  if (hasDanglingEdge) {
    issues.push('Workflow has edges with missing nodes.')
  }

  return issues
}

export const mockServer = {
  async get(path: string): Promise<unknown> {
    await delay(250)

    if (path === WORKFLOW_API_ENDPOINTS.automations) {
      return AUTOMATION_ACTIONS
    }

    throw new Error(`Unknown GET endpoint: ${path}`)
  },

  async post(path: string, body: unknown): Promise<unknown> {
    await delay(350)

    if (path !== WORKFLOW_API_ENDPOINTS.simulate) {
      throw new Error(`Unknown POST endpoint: ${path}`)
    }

    const request = body as SimulationRequest
    const issues = collectIssues(request)
    const response: SimulationResponse = {
      workflowId: `mock-${Date.now()}`,
      steps: request.workflow.nodes.map((node, index) => ({
        step: index + 1,
        nodeId: node.id,
        status: issues.length > 0 ? 'skipped' : 'success',
        message: MESSAGE_BY_TYPE[node.type],
      })),
      issues,
    }

    return response
  },
}
