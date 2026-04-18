import type {
  AutomationAction,
  SimulationRequest,
  SimulationResponse,
  WorkflowGraphPayload,
} from '../types/workflow'
import { mockServer, WORKFLOW_API_ENDPOINTS } from './mockServer'

export const workflowApi = {
  async getAutomations(): Promise<AutomationAction[]> {
    const response = await mockServer.get(WORKFLOW_API_ENDPOINTS.automations)
    return response as AutomationAction[]
  },

  async simulate(payload: WorkflowGraphPayload): Promise<SimulationResponse> {
    const request: SimulationRequest = { workflow: payload }
    const response = await mockServer.post(WORKFLOW_API_ENDPOINTS.simulate, request)
    return response as SimulationResponse
  },
}
