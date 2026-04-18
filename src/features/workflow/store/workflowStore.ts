import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from 'reactflow'
import { create } from 'zustand'
import {
  NODE_DEFAULT_DATA,
  type SimulationResponse,
  type WorkflowNodeType,
} from '../types/workflow'
import { serializeWorkflowGraph } from '../api/serializers'
import { workflowApi } from '../api/workflowApi'

export type WorkflowNode = Node<any, WorkflowNodeType>

interface WorkflowStoreState {
  nodes: WorkflowNode[]
  edges: Edge[]
  selectedNodeId: string | null
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void
  setSelectedNodeId: (nodeId: string | null) => void
  updateSelectedNodeData: (
    updater: (currentData: Record<string, unknown>) => Record<string, unknown>
  ) => void
  simulateWorkflow: () => Promise<SimulationResponse>
  deleteSelected: () => void
}

let nodeIdCounter = 1

const getNextNodeId = () => {
  nodeIdCounter += 1
  return `node_${nodeIdCounter}`
}

const initialNode: WorkflowNode = {
  id: 'node_1',
  type: 'start',
  position: { x: 120, y: 120 },
  data: NODE_DEFAULT_DATA.start,
}

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  nodes: [initialNode],
  edges: [],
  selectedNodeId: initialNode.id,

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as WorkflowNode[],
    })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) =>
    set((state) => ({ edges: addEdge(connection, state.edges) })),

  addNode: (type, position) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: getNextNodeId(),
          type,
          position,
          data: NODE_DEFAULT_DATA[type],
        },
      ],
    })),

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  updateSelectedNodeData: (updater) =>
    set((state) => {
      if (!state.selectedNodeId) {
        return state
      }

      return {
        nodes: state.nodes.map((node) =>
          node.id === state.selectedNodeId
            ? {
                ...node,
                data: updater(node.data ?? {}),
              }
            : node
        ),
      }
    }),

  simulateWorkflow: async () => {
    const { nodes, edges } = get()
    const payload = serializeWorkflowGraph(nodes, edges)
    return workflowApi.simulate(payload)
  },

  deleteSelected: () => {
    const selectedNodeId = get().selectedNodeId
    if (!selectedNodeId) {
      return
    }

    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== selectedNodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
      ),
      selectedNodeId: null,
    }))
  },
}))
