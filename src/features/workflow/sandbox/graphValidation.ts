import type { Edge } from 'reactflow'
import type { WorkflowNode } from '../store/workflowStore'

export interface GraphValidationResult {
  errors: string[]
  warnings: string[]
}

export function validateWorkflowGraph(
  nodes: WorkflowNode[],
  edges: Edge[]
): GraphValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (nodes.length === 0) {
    errors.push('Add at least one node to the workflow.')
    return { errors, warnings }
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const outgoing = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()

  for (const node of nodes) {
    outgoing.set(node.id, [])
    incoming.set(node.id, [])
  }

  for (const edge of edges) {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) {
      errors.push(`Edge ${edge.id} points to a missing node.`)
      continue
    }
    outgoing.get(edge.source)!.push(edge.target)
    incoming.get(edge.target)!.push(edge.source)
  }

  const startNodes = nodes.filter((node) => node.type === 'start')
  const endNodes = nodes.filter((node) => node.type === 'end')

  if (startNodes.length !== 1) {
    errors.push('Workflow must contain exactly one Start node.')
  }
  if (endNodes.length === 0) {
    errors.push('Workflow should contain at least one End node.')
  }

  for (const node of nodes) {
    const outCount = outgoing.get(node.id)?.length ?? 0
    const inCount = incoming.get(node.id)?.length ?? 0

    if (node.type === 'start' && inCount > 0) {
      errors.push('Start node cannot have incoming connections.')
    }
    if (node.type !== 'end' && outCount === 0) {
      warnings.push(`${node.id} has no outgoing connection.`)
    }
    if (node.type !== 'start' && inCount === 0) {
      warnings.push(`${node.id} has no incoming connection.`)
    }
  }

  const startNode = startNodes[0]
  if (startNode) {
    const reachable = new Set<string>()
    const stack = [startNode.id]
    while (stack.length > 0) {
      const current = stack.pop()!
      if (reachable.has(current)) {
        continue
      }
      reachable.add(current)
      for (const next of outgoing.get(current) ?? []) {
        stack.push(next)
      }
    }

    for (const node of nodes) {
      if (!reachable.has(node.id)) {
        warnings.push(`${node.id} is unreachable from Start.`)
      }
    }
  }

  const visited = new Set<string>()
  const inPath = new Set<string>()
  let hasCycle = false

  const dfs = (nodeId: string) => {
    if (inPath.has(nodeId)) {
      hasCycle = true
      return
    }
    if (visited.has(nodeId) || hasCycle) {
      return
    }

    visited.add(nodeId)
    inPath.add(nodeId)
    for (const next of outgoing.get(nodeId) ?? []) {
      dfs(next)
    }
    inPath.delete(nodeId)
  }

  for (const node of nodes) {
    dfs(node.id)
    if (hasCycle) {
      break
    }
  }

  if (hasCycle) {
    errors.push('Workflow contains a cycle. Remove circular connections.')
  }

  return { errors, warnings }
}
