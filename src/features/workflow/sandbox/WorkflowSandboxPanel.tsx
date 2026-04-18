import { useMemo, useState } from 'react'
import { serializeWorkflowGraph } from '../api/serializers'
import { useWorkflowStore } from '../store/workflowStore'
import type { SimulationResponse } from '../types/workflow'
import { validateWorkflowGraph } from './graphValidation'

export function WorkflowSandboxPanel() {
  const { nodes, edges, simulateWorkflow } = useWorkflowStore()
  const [result, setResult] = useState<SimulationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  const validation = useMemo(
    () => validateWorkflowGraph(nodes, edges),
    [nodes, edges]
  )

  const workflowJson = useMemo(
    () => serializeWorkflowGraph(nodes, edges),
    [nodes, edges]
  )

  const runSimulation = async () => {
    setError(null)
    setIsRunning(true)
    try {
      const response = await simulateWorkflow()
      setResult(response)
    } catch (simulationError) {
      setError('Failed to run simulation. Please try again.')
      console.error(simulationError)
    } finally {
      setIsRunning(false)
    }
  }

  const exportWorkflowJson = () => {
    const jsonBlob = new Blob([JSON.stringify(workflowJson, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(jsonBlob)
    const anchor = document.createElement('a')
    const timestamp = new Date().toISOString().replaceAll(':', '-')

    anchor.href = url
    anchor.download = `workflow-export-${timestamp}.json`
    anchor.click()
    URL.revokeObjectURL(url)

    setExportNotice('Exported successfully')
    window.setTimeout(() => {
      setExportNotice(null)
    }, 1800)
  }

  return (
    <section className="sandbox-shell" aria-label="Workflow test sandbox">
      <div className="panel-title">Workflow Test Sandbox</div>
      <div className="sandbox-actions">
        <button
          type="button"
          className="sandbox-run-button"
          disabled={isRunning || validation.errors.length > 0}
          onClick={runSimulation}
        >
          {isRunning ? 'Running...' : 'Run Simulation'}
        </button>
        <button
          type="button"
          className="sandbox-export-button"
          onClick={exportWorkflowJson}
        >
          Export JSON
        </button>
      </div>
      {exportNotice && <p className="sandbox-toast">{exportNotice}</p>}

      <div className="sandbox-block">
        <p className="panel-text">Validation</p>
        {validation.errors.length === 0 && validation.warnings.length === 0 && (
          <p className="sandbox-ok">No validation issues found.</p>
        )}
        {validation.errors.map((message) => (
          <p key={`error-${message}`} className="sandbox-error">
            {message}
          </p>
        ))}
        {validation.warnings.map((message) => (
          <p key={`warning-${message}`} className="sandbox-warning">
            {message}
          </p>
        ))}
      </div>

      <details className="sandbox-block">
        <summary>Serialized Workflow JSON</summary>
        <pre>{JSON.stringify(workflowJson, null, 2)}</pre>
      </details>

      <div className="sandbox-block">
        <p className="panel-text">Execution Log</p>
        {error && <p className="sandbox-error">{error}</p>}
        {!error && !result && <p className="panel-text">Run simulation to view logs.</p>}
        {!error &&
          result?.steps.map((step) => (
            <p key={`${step.step}-${step.nodeId}`} className="sandbox-log-line">
              Step {step.step}: {step.nodeId} - {step.status} - {step.message}
            </p>
          ))}
        {result && result.issues.length > 0 && (
          <div>
            <p className="panel-text">API Reported Issues</p>
            {result.issues.map((issue) => (
              <p key={issue} className="sandbox-warning">
                {issue}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
