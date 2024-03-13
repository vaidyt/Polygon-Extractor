export default class Polygon {
    static idCounter = 0;

    constructor(vertices, indices = []) {
        this.vertices = vertices;
        this.indices = indices; // Store the provided indices
        this._neighbors = new Set();
        this.id = Polygon.idCounter++;
        this.color = this.generateColorById(this.id);
    }

    get neighbors() {
        return Array.from(this._neighbors);
    }

    addNeighbor(neighborId) {
        this._neighbors.add(neighborId);
    }

    get Color() {
        return this.color;
    }

    set Color(value) {
        this.color = value;
    }

    generateColorById(id) {
        // Generate RGB components
        let r = (id * 113) % 255; // Prime number for seed variation
        let g = (id * 157) % 255; // Different prime number for seed variation
        let b = (id * 193) % 255; // Yet another prime number for seed variation

        return `rgb(${r}, ${g}, ${b})`;
    }

    get polygonId() {
        return this.id;
    }

    set polygonId(value) {
        this.id = value;
    }

    getIndices() {
        return this.indices; // Getter for the indices
    }

    printNeighborIds() {
        console.log(`Neighbors of Polygon ${this.id}: ${this._neighbors.map(polygon => polygon.polygonId).join(', ')}`);
    }

    isExternal() {
        let sum = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            let curr = this.vertices[i];
            let next = this.vertices[(i + 1) % this.vertices.length];
            sum += (next[0] - curr[0]) * (next[1] + curr[1]);
        }
        return sum > 0;
    }

    // 3. **Algorithm 3:** Given a point and the output of Algorithm 1, find the face the point is contained within. Naturally, the
    //    point may not be inside of a face. Include tests (with text descriptions of the input data) demonstrating that it works.
    //    Comment your code with specifics about the computational complexity of your implementation.
    //    Worst case complexity - Linear in number of edges (or vertices) of the polygon
    //    When we have n-polygons then it would be O(V) (as we need to traverse every vertex of the graph)
    
    // Ray casting algorithm
    isPointInside(point) {
        let intersectCount = 0;
        const verticesCount = this.vertices.length;
    
        for (let i = 0; i < verticesCount; i++) {
            const vertex1 = this.vertices[i];
            const vertex2 = this.vertices[(i + 1) % verticesCount];
    
            // Check if the point is on the same horizontal line as the current edge
            if ((vertex1[1] <= point[1] && vertex2[1] > point[1]) || (vertex1[1] > point[1] && vertex2[1] <= point[1])) {
                // Calculate the x-coordinate of the intersection point of the ray with the edge
                const intersectX = (point[1] - vertex1[1]) / (vertex2[1] - vertex1[1]) * (vertex2[0] - vertex1[0]) + vertex1[0];
                
                // Check if the intersection point coincides with the test point
                
                if (point[0] === intersectX) {
                    return true; // Point lies on the edge, consider it inside
                }
    
                // If the intersection point lies to the right of the test point, increment intersectCount
                if (point[0] < intersectX) {
                    intersectCount++;
                }
            }
        }
    
        // If the number of intersections is odd, the point is inside the polygon
        return intersectCount % 2 === 1;
    }
    

     // O(1)
    isLeft(point, vertex1, vertex2) {
        return ((vertex2[0] - vertex1[0]) * (point[1] - vertex1[1]) - (point[0] - vertex1[0]) * (vertex2[1] - vertex1[1])) > 0;
    }
    
    isPointInside_2(point) {
        let inside = false;
    
        for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
            if (this.isLeft(point, this.vertices[j], this.vertices[i])) {
                inside = !inside;
            }
        }
    
        return inside;
    }
   
}