import { Handle, Position, type NodeProps } from 'reactflow'
import type { WorkflowNodeType } from '../types/workflow'
import { nodeTypeLabels } from './index'

export function WorkflowNodeCard({
  id,
  type,
  selected,
}: NodeProps<Record<string, unknown>>) {
  const workflowType = (type ?? 'task') as WorkflowNodeType
  const label = nodeTypeLabels[workflowType]

  return (
    <article className={`workflow-node ${selected ? 'selected' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="workflow-node-handle workflow-node-handle-target"
      />
      <p className="workflow-node-type">{label}</p>
      <p className="workflow-node-id">{id}</p>
      <Handle
        type="source"
        position={Position.Right}
        className="workflow-node-handle workflow-node-handle-source"
      />
    </article>
  )
}
