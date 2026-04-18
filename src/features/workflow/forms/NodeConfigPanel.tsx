import { useEffect, useMemo, useState } from 'react'
import { workflowApi } from '../api/workflowApi'
import { WorkflowSandboxPanel } from '../sandbox/WorkflowSandboxPanel'
import { useWorkflowStore } from '../store/workflowStore'
import type {
  AutomationAction,
  KeyValuePairs,
  WorkflowNodeType,
} from '../types/workflow'

function toEntries(record: KeyValuePairs): Array<{ key: string; value: string }> {
  return Object.entries(record).map(([key, value]) => ({ key, value }))
}

function fromEntries(entries: Array<{ key: string; value: string }>): KeyValuePairs {
  const result: KeyValuePairs = {}
  for (const entry of entries) {
    const key = entry.key.trim()
    if (!key) {
      continue
    }
    result[key] = entry.value
  }
  return result
}

function KeyValueEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: KeyValuePairs
  onChange: (nextValue: KeyValuePairs) => void
}) {
  const [rows, setRows] = useState<Array<{ key: string; value: string }>>(
    toEntries(value)
  )

  useEffect(() => {
    setRows(toEntries(value))
  }, [value])

  const updateRows = (nextRows: Array<{ key: string; value: string }>) => {
    setRows(nextRows)
    onChange(fromEntries(nextRows))
  }

  const updateRow = (
    index: number,
    field: 'key' | 'value',
    fieldValue: string
  ) => {
    const nextRows = [...rows]
    nextRows[index] = { ...nextRows[index], [field]: fieldValue }
    updateRows(nextRows)
  }

  const addRow = () => updateRows([...rows, { key: '', value: '' }])

  const removeRow = (index: number) =>
    updateRows(rows.filter((_, itemIndex) => itemIndex !== index))

  return (
    <fieldset className="node-form-fieldset">
      <legend>{label}</legend>
      {rows.map((row, index) => (
        <div key={`${index}-${row.key}`} className="kv-row">
          <input
            value={row.key}
            onChange={(event) => updateRow(index, 'key', event.target.value)}
            placeholder="key"
          />
          <input
            value={row.value}
            onChange={(event) => updateRow(index, 'value', event.target.value)}
            placeholder="value"
          />
          <button type="button" onClick={() => removeRow(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addRow}>
        + Add Field
      </button>
    </fieldset>
  )
}

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateSelectedNodeData } = useWorkflowStore()
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null
  const selectedType = selectedNode?.type as WorkflowNodeType | undefined
  const [automations, setAutomations] = useState<AutomationAction[]>([])

  useEffect(() => {
    workflowApi.getAutomations().then(setAutomations)
  }, [])

  const selectedAutomation = useMemo(
    () =>
      automations.find(
        (automation) => automation.id === (selectedNode?.data?.actionId as string)
      ) ?? null,
    [automations, selectedNode?.data]
  )

  const updateField = (key: string, value: unknown) => {
    updateSelectedNodeData((currentData) => ({
      ...currentData,
      [key]: value,
    }))
  }

  return (
    <aside className="config-shell" aria-label="Node configuration panel">
      <div className="panel-title">Node Configuration</div>
      {!selectedNode ? (
        <div className="empty-state">
          <p className="panel-text">Select a node on the canvas to edit properties.</p>
          <p className="panel-hint">Tip: click any node card to open its form here.</p>
        </div>
      ) : (
        <div className="selected-node-meta node-form">
          <div className="selected-node-header">
            <p className="panel-text">Selected Node</p>
            <span className="node-type-pill">{selectedNode.type}</span>
          </div>
          <p className="panel-meta">{selectedNode.id}</p>

          {selectedType === 'start' && (
            <>
              <label>
                Start title
                <input
                  value={(selectedNode.data.title as string) ?? ''}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </label>
              <KeyValueEditor
                label="Metadata"
                value={(selectedNode.data.metadata as KeyValuePairs) ?? {}}
                onChange={(nextValue) => updateField('metadata', nextValue)}
              />
            </>
          )}

          {selectedType === 'task' && (
            <>
              <label>
                Title
                <input
                  required
                  value={(selectedNode.data.title as string) ?? ''}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </label>
              <label>
                Description
                <textarea
                  value={(selectedNode.data.description as string) ?? ''}
                  onChange={(event) => updateField('description', event.target.value)}
                />
              </label>
              <label>
                Assignee
                <input
                  value={(selectedNode.data.assignee as string) ?? ''}
                  onChange={(event) => updateField('assignee', event.target.value)}
                />
              </label>
              <label>
                Due Date
                <input
                  type="date"
                  value={(selectedNode.data.dueDate as string) ?? ''}
                  onChange={(event) => updateField('dueDate', event.target.value)}
                />
              </label>
              <KeyValueEditor
                label="Custom Fields"
                value={(selectedNode.data.customFields as KeyValuePairs) ?? {}}
                onChange={(nextValue) => updateField('customFields', nextValue)}
              />
            </>
          )}

          {selectedType === 'approval' && (
            <>
              <label>
                Title
                <input
                  value={(selectedNode.data.title as string) ?? ''}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </label>
              <label>
                Approver Role
                <select
                  value={(selectedNode.data.approverRole as string) ?? 'Manager'}
                  onChange={(event) => updateField('approverRole', event.target.value)}
                >
                  <option value="Manager">Manager</option>
                  <option value="HRBP">HRBP</option>
                  <option value="Director">Director</option>
                </select>
              </label>
              <label>
                Auto-approve threshold
                <input
                  type="number"
                  value={(selectedNode.data.autoApproveThreshold as number | null) ?? ''}
                  onChange={(event) =>
                    updateField(
                      'autoApproveThreshold',
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                />
              </label>
            </>
          )}

          {selectedType === 'automated' && (
            <>
              <label>
                Title
                <input
                  value={(selectedNode.data.title as string) ?? ''}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </label>
              <label>
                Action
                <select
                  value={(selectedNode.data.actionId as string) ?? ''}
                  onChange={(event) => {
                    const actionId = event.target.value
                    const action = automations.find((item) => item.id === actionId) ?? null
                    const nextParams = Object.fromEntries(
                      (action?.params ?? []).map((param) => [param, ''])
                    )

                    updateSelectedNodeData((currentData) => ({
                      ...currentData,
                      actionId,
                      actionParams: nextParams,
                    }))
                  }}
                >
                  <option value="">Select an action</option>
                  {automations.map((automation) => (
                    <option value={automation.id} key={automation.id}>
                      {automation.label}
                    </option>
                  ))}
                </select>
              </label>
              {(selectedAutomation?.params ?? []).map((paramKey) => (
                <label key={paramKey}>
                  {paramKey}
                  <input
                    value={
                      ((selectedNode.data.actionParams as KeyValuePairs) ?? {})[paramKey] ?? ''
                    }
                    onChange={(event) => {
                      const currentParams =
                        (selectedNode.data.actionParams as KeyValuePairs) ?? {}
                      updateField('actionParams', {
                        ...currentParams,
                        [paramKey]: event.target.value,
                      })
                    }}
                  />
                </label>
              ))}
            </>
          )}

          {selectedType === 'end' && (
            <>
              <label>
                End message
                <input
                  value={(selectedNode.data.message as string) ?? ''}
                  onChange={(event) => updateField('message', event.target.value)}
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={Boolean(selectedNode.data.includeSummary)}
                  onChange={(event) => updateField('includeSummary', event.target.checked)}
                />
                Include summary
              </label>
            </>
          )}
        </div>
      )}
      <WorkflowSandboxPanel />
    </aside>
  )
}
