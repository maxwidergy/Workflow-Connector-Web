import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

const useStore = create((set, get) => ({
    nodes: [{ id: '0', type: 'InputNode', position: { x: 0, y: 0 }, data: {label: 'lala'} }],
    edges: [],
    maxNodeId: 1,
    undoStack: [],
    redoStack: [],
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    addNode: (node) =>
        set((state) => {
            const newNodes = [...state.nodes, node];
            const newState = { ...state, nodes: newNodes };
            return newState;
        }),
    addEdge(data) {
        const id = `edge-${data.source}-${data.sourceHandle}-${data.target}-${data.targetHandle}`;
        data.type = 'CustomEdge';
        //data.style = '';
        const edge = {id, ...data};

        set({ edges: [edge, ...get().edges] });
    },
    removeNode: (id) =>
        set((state) => {
            const newNodes = state.nodes.filter((node) => node.id !== id);
            const newEdges = state.edges.filter(
                (edge) => edge.source !== id && edge.target !== id
            );
            const newState = { ...state, nodes: newNodes, edges: newEdges };
            state.undoStack.push(shallow(newState));
            state.redoStack = [];
            return newState;
        }),
    updateNodeData: (id, data) => {
        set({
            nodes: get().nodes.map((node) => 
                node.id === id ? { ...node, data: data } : node
            )
        });
    },
    updateNodeSelect: (id) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === id) {
                    node.selected = true;
                    return node;
                } else {
                    node.selected = false;
                    return node;
                }
            })
        });
    },
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setMaxNodeId: (maxNodeId) => set({ maxNodeId }),
    undo: () => {
        console.log('undo');
        const newState = get().undoStack.pop();
        if (newState) {
            get().redoStack.push(shallow(get()));
            set(newState);
            set({ nodes: newState.nodes, edges: newState.edges });
        }
    },
    redo: () => {
        console.log('redo');
        const newState = get().redoStack.pop();
        if (newState) {
            get().undoStack.push(shallow(get()));
            set(newState);
            set({ nodes: newState.nodes, edges: newState.edges });
        }
    },
}));

export default useStore;
