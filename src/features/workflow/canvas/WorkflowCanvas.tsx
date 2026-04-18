import { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlowProvider,
  type NodeMouseHandler,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { nodeTypeLabels, nodeTypes } from '../nodes'
import { useWorkflowStore } from '../store/workflowStore'
import type { WorkflowNodeType } from '../types/workflow'

const DND_NODE_MIME = 'application/reactflow-node-type'

function WorkflowCanvasInner() {
  const reactFlow = useReactFlow()
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
    deleteSelected,
  } = useWorkflowStore()

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, type: WorkflowNodeType) => {
      event.dataTransfer.setData(DND_NODE_MIME, type)
      event.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const nodeType = event.dataTransfer.getData(DND_NODE_MIME) as WorkflowNodeType
      if (!nodeType) {
        return
      }

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addNode(nodeType, position)
    },
    [addNode, reactFlow]
  )

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNodeId(node.id)
  }, [setSelectedNodeId])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  return (
    <section className="canvas-shell" aria-label="Workflow canvas">
      <div className="canvas-header">
        <div>
          <div className="panel-title">Canvas</div>
          <p className="panel-text canvas-subtitle">
            {nodes.length} nodes | {edges.length} connections
          </p>
        </div>
        <button
          className="danger-button"
          onClick={deleteSelected}
          type="button"
          title="Delete selected node and connected edges"
        >
          Delete Selected
        </button>
      </div>

      <div className="canvas-content">
        <aside className="node-sidebar">
          <p className="panel-text">Drag node types into canvas</p>
          <div className="node-buttons">
            {(Object.keys(nodeTypeLabels) as WorkflowNodeType[]).map((type) => (
              <button
                key={type}
                draggable
                onDragStart={(event) => onDragStart(event, type)}
                className="node-template-button"
                type="button"
              >
                {nodeTypeLabels[type]}
              </button>
            ))}
          </div>
        </aside>

        <div className="flow-surface" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#2563eb', strokeWidth: 2.25 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 16,
                color: '#2563eb',
              },
            }}
            connectionLineStyle={{ stroke: '#1d4ed8', strokeWidth: 2.25 }}
          >
            <Background />
            <Controls />
            <MiniMap zoomable pannable />
          </ReactFlow>
        </div>
      </div>
    </section>
  )
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  )
}
