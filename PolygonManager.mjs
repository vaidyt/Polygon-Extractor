// Import the Polygon class for creating polygon objects.
import Polygon from './Polygon.mjs';

// PolygonManager class manages a collection of polygons, including their vertices, edges, and relationships.
// E - Denotes the number of edges in the original graph.
// V - Denotes the number of vertices in the original graph.
// We use the Euler's formula for planar graph V - E + F = 2 to determine complexity.
// By "Complexity" we mean the "Worst Case Complexity" in the comments below.
export default class PolygonManager {
    // Constructor initializes the PolygonManager with a list of vertices and edges.
    // Complexity: O(E) for creating the adjacency matrix, where E is the number of edges.
    constructor(vertices, edges) {
        this._vertices = vertices; // [{x, y}, ...] - Array of vertices with x, y coordinates.
        this._edges = edges; // [[from, to], ...] - Array of edges represented by vertex indices.
        this._adjacencyMatrix = this.createAdjacencyMatrix(); // Create the adjacency matrix based on vertices and edges.
    }

    // Getter for vertices.
    // Complexity: O(1).
    get vertices() {
        return this._vertices;
    }

    // Getter for edges.
    // Complexity: O(1).
    get edges() {
        return this._edges;
    }

    // Getter for the adjacency matrix.
    // Complexity: O(1).
    get adjacencyMatrix() {
        return this._adjacencyMatrix;
    }

    // Creates an adjacency matrix from the vertices and edges.
    // Complexity: O(E), iterating through each edge to fill the matrix.
    createAdjacencyMatrix() {
        let n = this._vertices.length;
        let adjacencyMatrix = Array.from({ length: n }, () => Array(n).fill(0));
        for (let e of this._edges) {
            let from = e[0];
            let to = e[1];
            adjacencyMatrix[from][to] = 1;
            adjacencyMatrix[to][from] = 1; // Ensures the graph is undirected.
        }
        return adjacencyMatrix;
    }

    // Prints the adjacency matrix to the console for debugging purposes.
    // Complexity: O(V^2), as it iterates over the entire matrix.
    printAdjacencyMatrix() {
        console.log('Adjacency Matrix:');
        for (let row of this._adjacencyMatrix) {
            console.log(row.join(' '));
        }
    }

    // Finds a vertex with at least one edge. Useful for starting graph traversal.
    // Complexity: O(V^2) in the worst case, iterating over the whole matrix.
    findVertexWithEdge() {
        for (let i = 0; i < this._adjacencyMatrix.length; ++i) {
            for (let j = 0; j < this._adjacencyMatrix[i].length; ++j) {
                if (this._adjacencyMatrix[i][j] === 1) {
                    return { startVertex: i, midVertex: j };
                }
            }
        }
        return null;
    }

    // Given a vertex, finds other vertices that could potentially form an edge, excluding the parent vertex.
    // Complexity: O(V), iterating through a single row of the adjacency matrix.
    getPotentialEdgeVertices(v2, parentVertex) {
        let potentialEdgeVertices = [];
        if (v2 < 0) {
            return potentialEdgeVertices;
        }
        for (let i = 0; i < this._adjacencyMatrix[v2].length; i++) {
            if (this._adjacencyMatrix[v2][i] === 1 && i !== parentVertex) {
                potentialEdgeVertices.push(i);
            }
        }
        return potentialEdgeVertices;
    }

    // Calculates the clockwise angle between two edges that share a vertex.
    // Complexity: O(1), performing a fixed number of arithmetic operations.
    angleBetweenEdgesClockwise(v1, v2, v3) {
        let v2v1_x = v1[0] - v2[0];
        let v2v1_y = v1[1] - v2[1];
        let v2v3_x = v3[0] - v2[0];
        let v2v3_y = v3[1] - v2[1];
        let dot_product = v2v1_x * v2v3_x + v2v1_y * v2v3_y;
        let magnitude_v1v2 = Math.sqrt(v2v1_x * v2v1_x + v2v1_y * v2v1_y);
        let magnitude_v2v3 = Math.sqrt(v2v3_x * v2v3_x + v2v3_y * v2v3_y);
        let cosine = dot_product / (magnitude_v1v2 * magnitude_v2v3);
        let cross_product = v2v1_x * v2v3_y - v2v1_y * v2v3_x;
        let direction = (cross_product > 0) ? 1 : -1;
        let angle_radians = Math.acos(cosine);
        if (direction === 1) {
            angle_radians = 2 * Math.PI - angle_radians;
        }
        return angle_radians;
    }

    // Determines the next vertex to visit when constructing a face from edges.
    // Complexity: O(V), as it may iterate through all potential edge vertices.
    getNextFaceVertex(v1, v2, potentialEdgeIndices) {
        let v3 = -1;
        let angle = Number.MAX_VALUE;
        for (let i = 0; i < potentialEdgeIndices.length; i++) {
            let v3_i = potentialEdgeIndices[i];
            let thisWedgeAngle = this.angleBetweenEdgesClockwise(this._vertices[v1], this._vertices[v2], this._vertices[v3_i]);
            if (thisWedgeAngle < angle) {
                angle = thisWedgeAngle;
                v3 = v3_i;
            }
        }
        return v3;
    }

    // Extracts the vertices forming a face starting from an edge defined by two vertices.
    // Complexity:  O(V*E), to traverse all vertices and edges to extract all faces (or regions) in the graph.
    // Note: Extracting a single face is not O(V*E) and is a lot faster.
    getFace(v1, v2) {
        let faceIndices = [v1, v2];
        this._adjacencyMatrix[v1][v2] = 0; // Mark as traversed.
        let parentIndex = v1;
        while (v2 !== v1) {
            let potentialEdgeIndices = this.getPotentialEdgeVertices(v2, v1); // O(V)
            if (potentialEdgeIndices.includes(parentIndex)) {
                this._adjacencyMatrix[v2][parentIndex] = 0; // Close the loop.
                break;
            }
            let v3 = this.getNextFaceVertex(v1, v2, potentialEdgeIndices); // O(V)
            if (v3 === v1 || v3 === -1) {
                if(v3 !== -1 ) {
                    this._adjacencyMatrix[v2][v3] = 0;
                }
                break;
            }
            faceIndices.push(v3);
            this._adjacencyMatrix[v2][v3] = 0; // Mark next edge as traversed.
            v1 = v2;
            v2 = v3;
        }
        return faceIndices;
    }

    // Finds an edge in a new face for further exploration.
    // Complexity: O(V), as it might iterate through all vertices of the new face.
    findV1V2(newFace) {
        for (let i = 0; i < newFace.length; i++) {
            let j = (i === 0) ? newFace.length - 1 : i - 1;
            let v_i = newFace[i];
            let v_j = newFace[j];
            if (this._adjacencyMatrix[v_i][v_j] === 1) {
                return { startVertex: v_i, midVertex: v_j };
            }
        }
        return null;
    }

   
    // 1. **Algorithm 1:** Write an algorithm that finds all of the interior faces (polygons) of such a data structure. The
    //    output of the algorithm is up to you. Include tests (with text descriptions of the input data) demonstrating that it
    //    works. Comment your code with specifics about the computational complexity of your implementation.
    // Extracts all faces within the polygons managed by this PolygonManager.
    // This method implements the algorithm given by:
    // Z-C Shih in "A systolic algorithm for extracting planar regions from a planar graph",
    // Computer Vision Graphics and Image Processing (1989).
    // Complexity: O(V^2 + V*E) = O((F+V+E)*V)  // Also, see "An optimal algorithm for extracting planar regions of a plane graph",
    //                                            // by Jiang X H and Bunke H (1993) for a detailed analysis of the algorithm
    extractFaces() {
        let faces = [];
        let polygons = [];
        // this.printAdjacencyMatrix();
        let edge = this.findVertexWithEdge();
        while (edge) {
            let v1 = edge.startVertex, v2 = edge.midVertex;
            
            let nextFaceIndices = this.getFace(v1, v2); // O(V*E) - Note this is takes in to account the total complexity to extract all faces.
            if (nextFaceIndices && nextFaceIndices.length > 2) {
                let faceVertices = nextFaceIndices.map(index => this._vertices[index]); // O(1)
                let polygon = new Polygon(faceVertices, nextFaceIndices);
                polygons.push(polygon);
                faces.push(nextFaceIndices);
            }
            edge = this.findV1V2(nextFaceIndices) || this.findVertexWithEdge(); // O(V^2)
        }
        return polygons.filter(polygon => !polygon.isExternal());
    }

    //4. **Algorithm 4:** Implement an algorithm that, given a start face, computes the neighboring faces, and then the neighbors of
    //                 the neighbor faces and so on. The system should find “layers” of neighboring face sets. The output should be an array of
    //                 arrays of face ids until all faces have been visited. Include tests (with text descriptions of the input data)
    //                 demonstrating that it works.
    // Builds a map relating each face to its neighboring faces.
    // Complexity: O(F*(V*C + E*C)) ~= O(V*F*C + E*F*C) = O((V^2 + VE)); Here, we are using F*C = V!
    static buildFaceNeighborsMap(polygons, startFaceId) {
        const faceNeighborsMap = new Map();
        const queue = [startFaceId];
        while (queue.length > 0) { // O(F) = O(V+E)
            const currentFaceId = queue.shift(); // Here, I am assuming this is constant time but this is not as we are using arrays here!
            if (!faceNeighborsMap.has(currentFaceId)) {
                const neighbors = PolygonManager.findNeighboringFaces(polygons, currentFaceId); // O(V*C + E*C)
                faceNeighborsMap.set(currentFaceId, neighbors);
                neighbors.forEach(neighborId => {
                    if (!faceNeighborsMap.has(neighborId)) {
                        queue.push(neighborId);
                    }
                });
            }
        }
        return faceNeighborsMap;
    }

    // 2. **Algorithm 2:** Write an algorithm that processes the output of Algorithm 1 in order to find the neighboring faces
    //      of any face. That is, faces that share an edge with the query face. It should take the output of Algorithm 1 as
    //      input, unique identifier for the face and output an array of face identifiers. The face identifiers might be an
    //      integer or string. Include tests (with text descriptions of the input data) demonstrating that it works. Comment your
    //      code with specifics about the computational complexity of your implementation.
    // Identifies neighboring faces for a given face.
    // Complexity: O(F*C) = O(V*C + E*C), due to iterating through polygons and checking for shared edges; 
    //             C is the average number vertices per internal face.
    static findNeighboringFaces(polygons, queryFaceId) {
        // Retrieve the query polygon using its ID
        let query_polygon = polygons[queryFaceId];
        // getIndices returns an array of vertex indices for the query polygon
        const queryFaceVertexIndices = query_polygon.getIndices();

        // Create a map for quick lookup of vertex positions in the query polygon
        // Complexity: O(C), where C is the average number of vertices per face
        const indexLookup = new Map();
        queryFaceVertexIndices.forEach((index, position) => {
            indexLookup.set(index, position);
        });

        // Iterate over all polygons to identify neighboring faces
        // Complexity: O(F*C) for this loop, where F is the total number of faces
        polygons.forEach((polygon, i) => {
            if (i === queryFaceId) return; // Skip the query polygon itself

            const currentFaceVertexIndices = polygon.getIndices(); // Already an array

            // Iterate through each vertex of the current polygon to check for shared edges
            // Complexity: O(C), iterating through vertices of the current polygon
            for (let j = 0; j < currentFaceVertexIndices.length; j++) {
                const currentVertex = currentFaceVertexIndices[j];
                const nextVertex = currentFaceVertexIndices[(j + 1) % currentFaceVertexIndices.length];

                // Use the map for O(1) lookup to check if both the current and next vertices are in the query polygon
                if (indexLookup.has(currentVertex) && indexLookup.has(nextVertex)) {
                    // Calculate positions to ensure the vertices are consecutive in the query polygon
                    const pos1 = indexLookup.get(currentVertex);
                    const pos2 = indexLookup.get(nextVertex);

                    // Check for consecutive positions, considering wrap-around, to ensure a shared edge
                    if ((pos1 !== undefined && pos2 !== undefined) && 
                        ((pos1 + 1) % queryFaceVertexIndices.length === pos2 ||
                         (pos2 + 1) % queryFaceVertexIndices.length === pos1)) {
                        query_polygon.addNeighbor(i);
                        break; // Found a neighboring face, no need to check further
                    }
                }
            }
        });

        // Return the set of neighbors for the query polygon
        return query_polygon.neighbors;
    }
    
}