# HR Workflow Designer - Case Study Submission

This repository contains a working prototype of an **HR Workflow Designer** built for the Tredence Full Stack Engineering Intern case study.

The module enables an HR admin to visually design internal workflows (onboarding, approvals, automated steps), configure node-level behavior, validate graph structure, and run a simulation in a sandbox.

### ➡️ **Live Interactive Demo**-> https://tredence-workflow.vercel.app/




https://github.com/user-attachments/assets/f758c433-11c6-4228-bb74-5ff296a8253c



---

## 1) Problem Statement

Build a mini workflow designer using React + React Flow with:

- drag-and-drop canvas
- multiple custom node types
- per-node configuration forms
- mock API integration
- simulation sandbox
- clean architecture and extensible abstractions

This implementation prioritizes **working functionality + architectural clarity** within a time-boxed delivery.

---

## 2) Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Workflow Canvas:** React Flow
- **State Management:** Zustand
- **Mock API Layer:** In-repo mock server abstraction
- **Styling:** CSS
- **Containerization:** Docker (dev + prod), Nginx (prod serving)

---

## 3) Features Implemented

### Core Requirements

1. **Workflow Canvas (React Flow)**
   - Drag node types from sidebar and drop on canvas
   - Reposition nodes
   - Connect nodes using visible source/target handles
   - Delete selected node and connected edges
   - Mini-map and zoom controls

2. **Supported Node Types**
   - Start
   - Task
   - Approval
   - Automated Step
   - End

3. **Node Configuration Panel**
   - Dynamic form based on selected node type
   - Controlled updates to node `data`
   - Key-value editors for metadata/custom fields
   - Automated node action params generated dynamically from selected automation action

4. **Mock API Layer**
   - `GET /automations` -> automation actions with param definitions
   - `POST /simulate` -> simulated workflow execution response
   - Typed request/response contracts

5. **Workflow Test Sandbox**
   - Serializes graph to workflow JSON
   - Validates workflow graph
   - Runs simulation against mock API
   - Displays step-by-step execution log
   - Displays API-side issues

6. **Export Workflow JSON (Bonus)**
   - Export current workflow to a downloadable `.json` file
   - Inline success feedback after export

---

## 4) Optional Items Status

- Export/Import workflow as JSON -> **Export implemented**, Import not implemented
- Node templates -> **Basic templates implemented** (sidebar node templates)
- Undo/Redo -> Not implemented
- Mini-map or zoom controls -> **Implemented**
- Workflow validation errors visually shown on nodes -> Not implemented (shown in sandbox panel)
- Auto-layout -> Not implemented
- Node version history -> Not implemented

---

## 5) Architecture Overview and Design Decisions

The codebase is organized by feature responsibilities to maximize clarity and extensibility.

```text
src/features/workflow/
  api/
    mockServer.ts        # mock endpoint handlers
    serializers.ts       # graph -> API payload mapping
    workflowApi.ts       # client abstraction for API calls
  canvas/
    WorkflowCanvas.tsx   # React Flow orchestration + DnD + edge actions
  forms/
    NodeConfigPanel.tsx  # node editing forms by node type
  nodes/
    WorkflowNodeCard.tsx # custom node UI + handles
    index.ts             # node labels + node type registry
  sandbox/
    graphValidation.ts   # graph validation rules
    WorkflowSandboxPanel.tsx # simulation + logs + export
  store/
    workflowStore.ts     # global workflow state/actions (Zustand)
  types/
    workflow.ts          # domain types and API contracts
```
Every technical choice was made deliberately to balance scalability, maintainability, and rapid development.


**1. State Management: Zustand over Redux or Context**

-> Unlike React Context, which can trigger re-renders of all consumers on any state change, Zustand allows for selector-based subscriptions. Components only re-render when the specific slice of state they care about changes, which is crucial for a smooth UI in a drag-and-drop interface.

**2. API Layer: An Abstracted Module (workflowApi.ts)**

-> This decouples the UI components from the data-fetching logic. Components don't know or care how the data is fetched; they just call a function.
-> Future-Proofing: If the real backend uses GraphQL, gRPC, or has different endpoint URLs, the only file that needs to be changed is workflowApi.ts. No UI components would need to be refactored, making the application highly maintainable.

**3. Component Architecture: A Single, Dynamic NodeConfigPanel**

-> This approach is far more scalable than creating a separate panel component for each node type (e.g., TaskNodePanel.tsx, ApprovalNodePanel.tsx). Adding a new node type in the future only requires adding a new case to the switch, not creating an entirely new file and duplicating logic.
-> All form-related logic is located in one place, making it easier to manage and reason about.

**4. Validation Logic: Pre-Simulation in the Sandbox Panel**

-> This approach provides the user with all necessary feedback at the most critical moment—right before they attempt to run the simulation. It prevents invalid data from ever being sent to the "backend" and was the most effective use of development time for a prototype.

### Design Principles Applied

- Separation of concerns (canvas vs forms vs API vs validation)
- Type-driven domain modeling
- Reusable state/actions via store
- Extensible node architecture for adding new node types
- Simple abstractions suitable for fast iteration in early product phase

---

## 6) Type Model and Extensibility

`workflow.ts` is the domain source of truth:

- `WorkflowNodeType`
- per-node data interfaces (`StartNodeData`, `TaskNodeData`, etc.)
- `WorkflowNodeDataMap`
- `NODE_DEFAULT_DATA`
- API contracts (`WorkflowGraphPayload`, `SimulationRequest`, `SimulationResponse`)

### Adding a New Node Type

1. Add new type to `WorkflowNodeType`
2. Define interface in `WorkflowNodeDataMap`
3. Add default values in `NODE_DEFAULT_DATA`
4. Register label and node renderer in `nodes/index.ts`
5. Add form section in `NodeConfigPanel.tsx`
6. Add validation rules if required in `graphValidation.ts`

---

## 7) Validation Rules Implemented

Current graph validation checks:

- workflow contains at least one node
- exactly one Start node
- at least one End node
- edge endpoints refer to existing nodes
- Start node has no incoming edges
- disconnected/missing incoming/outgoing warnings
- unreachable node warnings
- cycle detection

Validation is shown in sandbox before simulation execution.

---

## 8) Tradeoffs and Assumptions

### Assumptions

- Single-user local prototype
- No backend persistence/auth required
- Mock API behavior is deterministic and local

### Tradeoffs (Time-boxed Delivery)

- prioritized robust core behaviors over advanced extras (undo/redo, auto-layout, import)
- form validation is practical but not schema-library based
- validation is shown in sandbox panel rather than inline node badges

---

## 9) How to Run

### Local Development

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

### Local Production Build

```bash
npm run build
npm run preview
```

---

## 10) Docker

### Production Image (Nginx)

```bash
docker build -t tredence-workflow .
docker run --rm -p 8080:80 tredence-workflow
```

Open: `http://localhost:8080`

### Development Image (Vite Hot Reload)

```bash
docker build -f Dockerfile.dev -t tredence-workflow-dev .
docker run --rm -p 5173:5173 -v "$(pwd):/app" -v /app/node_modules tredence-workflow-dev
```

Open: `http://localhost:5173`

### Docker Compose

```bash
# Development
docker compose up app-dev --build

# Production
docker compose up app-prod --build
```

---

## 11) Quick Test Plan

1. Drag all node types onto canvas
2. Connect nodes via handles (right -> left)
3. Edit each node form and confirm data persistence
4. Validate error/warning behavior in sandbox
5. Run simulation and verify execution log
6. Export workflow JSON and verify file download

---

## 12) Mapping to Assessment Criteria

- **React Flow proficiency:** custom nodes, DnD positioning, connection/edge management, controls/minimap
- **React architecture:** modular feature folders, separated logic layers, centralized store actions
- **Complex form handling:** dynamic node forms + key-value editors + dynamic automation params
- **Mock API interaction:** typed API contracts + endpoint abstraction + async simulation
- **Scalability:** extensible node type model and isolated validation/serialization layers
- **Communication:** this README documents architecture, assumptions, tradeoffs, and runbook
- **Delivery speed:** production-ready prototype shipped with core requirements + bonus export + Docker support

---

## 13) If More Time Were Available

- Import JSON
- Undo/Redo stack
- Visual node-level validation badges
- Auto-layout (e.g., dagre/elk)
- Node templates library and version history
- Stronger form schemas and richer inline field validation
