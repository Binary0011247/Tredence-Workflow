import './App.css'
import { WorkflowCanvas } from './features/workflow/canvas/WorkflowCanvas'
import { NodeConfigPanel } from './features/workflow/forms/NodeConfigPanel'

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <h1>HR Workflow Designer</h1>
        <span className="badge">Prototype Setup</span>
      </header>

      <section className="workspace">
        <WorkflowCanvas />
        <NodeConfigPanel />
      </section>
    </main>
  )
}

export default App
