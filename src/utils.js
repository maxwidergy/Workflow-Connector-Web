// Helper function to track node connections
const trackConnections = (connections, id, direction) => {
    if (!connections[id]) {
      connections[id] = { in: 0, out: 0 };
    }
    connections[id][direction]++;
};

const objectToArray = (obj) => {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
};

export const createReactFlowData = (activities) => {
    let calcMaxNodeId = 0;
    const nodes = [];
    const edges = [];
    const connections = {};

    activities.forEach((activity) => {
        const nodeId = parseInt(activity.id, 10);
        if (nodeId > calcMaxNodeId) {
            calcMaxNodeId = nodeId;
        }

        let data = {
            id: activity.id.toString(),
            label: activity.activityType.split(/(?=[A-Z])/).join(" "),
        };

        // switch (activity.activityType) {
        //     case "HttpRequest":
        //         data = {
        //             ...data,
        //             body: activity.body,
        //             path: activity.path,
        //             method: activity.method,
        //             headers: activity.headers
        //                 ? Object.entries(activity.headers).map(([key, value]) => ({ key, value }))
        //                 : null,
        //             contentType: activity.contentType,
        //             parserType: activity.parserType,
        //             cached: activity.cached,
        //         };
        //         break;
        //     case "HttpRequest2":
        //         data = dataFromActivity(activity);
        //         break;
        //     case "PostIt":
        //         data = {
        //             ...data,
        //             text: activity.text,
        //         };
        //         break;
        // }

        // Iterate through the keys in the activity object and add them to the data object.
        // Filter out the properties that are common for all nodes and dont need to be in data object.
        Object.keys(activity).filter((key) => 
            key !== 'targets' &&
            key !== 'id' &&
            key !== "activityType" &&
            key !== "xPosition" &&
            key !== "yPosition")
        .forEach((key) => {
            if (typeof activity[key] === 'object' && !Array.isArray(activity[key])) {
                data[key] = objectToArray(activity[key]);
            } else {
                data[key] = activity[key];
            }
        });

        nodes.push({
            id: activity.id.toString(),
            type: activity.activityType,
            position: { x: activity.xPosition, y: activity.yPosition },
            deletable: activity.activityType !== "InputNode",
            data,
        });

        if (activity.targets && activity.targets.length) {
            activity.targets.forEach((target) => {
                // Track connections for each node
                trackConnections(connections, activity.id, "out");
                trackConnections(connections, target.id, "in");
                
                edges.push({
                    id: `edge-${activity.id}-${target.sourceHandleId}-${target.id}-${target.targetHandleId}`,
                    source: activity.id.toString(),
                    sourceHandle: target.sourceHandleId,
                    target: target.id.toString(),
                    targetHandle: target.targetHandleId,
                    type: "CustomEdge",
                });
            });
        }
    });

    // Set connectable prop based on node connections
    // nodes.forEach((node) => {
    //     node.connectable = !(connections[node.id]?.in > 0 && connections[node.id]?.out > 0);
    // });

    return { nodes, edges, maxNodeId: calcMaxNodeId };
};

const processArrayProperty = (array) => {
    const result = {};
    array.forEach((item) => {
        if (item.key && item.value) {
            result[item.key] = item.value;
        }
    });
    return result;
};

export const createWorkflow = (workflowId, nodes, edges) => {
    let workflow = {
        id: workflowId,
        activities: []
    }

    // nodes.forEach((node) => {
    //     let activity = {
    //         id: node.id,
    //         xPosition: node.position.x,
    //         yPosition: node.position.y,
    //         activityType: node.type,
    //         targets: edges
    //             .filter((edge) => edge.source === node.id)
    //             .map((edge) => ({
    //                 id: edge.target,
    //                 sourceHandleId: edge.sourceHandle,
    //                 targetHandleId: edge.targetHandle,
    //             })),
    //     };

    //     switch (node.type) {
    //         case 'HttpRequest':
    //             activity = {
    //                 ...activity,
    //                 body: node.data.body,
    //                 method: node.data.method,
    //                 path: node.data.path,
    //                 contentType: node.data.contentType,
    //                 parseResponse: node.data.parseResponse,
    //                 cached: node.data.cached,
    //                 headers: {},
    //                 parserType: node.data.parseResponse,
    //             };

    //             for (let i = 0; i < node.data.headers?.length; i++){
    //                 let header = node.data.headers[i];
    //                 activity.headers[header.key] = header.value;
    //             };

    //             break;

    //         case 'PostIt':
    //             activity = {
    //                 ...activity,
    //                 text: node.data.text,
    //             };

    //             break;

    //     };

    //     workflow.activities.push(activity);
    // });

    nodes.forEach((node) => {
        let activity = {
            id: node.id,
            xPosition: node.position.x,
            yPosition: node.position.y,
            activityType: node.type,
            targets: edges
                .filter((edge) => edge.source === node.id)
                .map((edge) => ({
                    id: edge.target,
                    sourceHandleId: edge.sourceHandle,
                    targetHandleId: edge.targetHandle,
                })),
        };
    
        // Iterate through the keys in the node.data object and add them to the activity object
        Object.keys(node.data).forEach((key) => {
            if (Array.isArray(node.data[key]) && key !== 'targets') {
                activity[key] = processArrayProperty(node.data[key]);
            } else {
                activity[key] = node.data[key];
            }
        });
    
        workflow.activities.push(activity);
    });
    
    return workflow;
};
