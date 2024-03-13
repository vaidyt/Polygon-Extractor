// PolygonManager.test.js
import PolygonManager from '../PolygonManager.mjs';

describe('PolygonManager', () => {
  test('correctly extracts interior faces from a simple graph', () => {
    const vertices = [
      [0, 0], // Vertex 0
      [2, 0], // Vertex 1
      [2, 2], // Vertex 2
      [0, 2]  // Vertex 3
    ];

    const edges = [
      [0, 1], // Edge from Vertex 0 to Vertex 1
      [1, 2], // Edge from Vertex 1 to Vertex 2
      [2, 3], // Edge from Vertex 2 to Vertex 3
      [3, 0]  // Edge from Vertex 3 back to Vertex 0 to close the square
      // Removed [0, 2] from the original example as it's not needed to form a square
    ];

    const polygonManager = new PolygonManager(vertices, edges);
    const polygons = polygonManager.extractFaces();

    // Assuming each polygon is expected to have vertices in counter-clockwise order starting from the bottom-left vertex
    expect(polygons.length).toBe(1); // Should find one interior face
    expect(polygons[0].vertices).toEqual(expect.arrayContaining([vertices[0], vertices[1], vertices[2], vertices[3]])); // Check if the face includes all vertices

    // Check point inside, on and outside polygons
    expect(polygons[0].isPointInside([1, 1])).toEqual(true); // Check if the centroid is inside
    expect(polygons[0].isPointInside([0, 0])).toEqual(true); // Check if boundary point is inside
    expect(polygons[0].isPointInside([-0.01, 0])).toEqual(false); // Check if this point is outside

    // Test buildFaceNeighborsMap(polygons, startFaceId)
    const neighborMap = PolygonManager.buildFaceNeighborsMap(polygons, 0);
    expect(neighborMap.size).toEqual(1); // This should be 1
    const neighborFace0 = neighborMap.get(0);
    expect(neighborFace0.length).toBe(0); // No neighbors as we only have one face
  });

  test('correctly extracts interior faces from a triangle graph', () => {
    const vertices = [
      [0, 0], // Vertex 0
      [2, 0], // Vertex 1
      [1, 2]  // Vertex 2
    ];

    const edges = [
      [0, 1], // Edge from Vertex 0 to Vertex 1
      [1, 2], // Edge from Vertex 1 to Vertex 2
      [2, 0]  // Edge from Vertex 2 back to Vertex 0 to close the triangle
    ];

    const polygonManager = new PolygonManager(vertices, edges);
    const polygons = polygonManager.extractFaces();

    expect(polygons.length).toBe(1); // Should find one interior  face
    expect(polygons[0].vertices).toEqual(expect.arrayContaining(vertices)); // Check if the face includes all vertices

    // Find neighbor info 
    const neighboringFaces = PolygonManager.findNeighboringFaces(polygons, 0);
    expect(neighboringFaces.length).toBe(0); // Should be 0 as there are no neighboring faces

    /// Check point inside, on and outside polygons
    expect(polygons[0].isPointInside([1, 2 / 3])).toEqual(true); // Check if the centroid is inside
    expect(polygons[0].isPointInside([0, 0])).toEqual(true); // Check if boundary point is inside
    expect(polygons[0].isPointInside([2.01, 0])).toEqual(false); // Check if this point is outside

    // Test buildFaceNeighborsMap(polygons, startFaceId)
    const neighborMap = PolygonManager.buildFaceNeighborsMap(polygons, 0);
    expect(neighborMap.size).toEqual(1); // This should return one entries in the map
    const neighborsForFace0 = neighborMap.get(0);
    expect(neighborsForFace0).toEqual([]); // No neighbors to any of the faces
  });

  test('correctly extracts interior faces from a graph with two disconnected triangles', () => {
    const vertices = [
      [0, 0], [2, 0], [1, 2], // Triangle 1 vertices
      [3, 0], [5, 0], [4, 2]  // Triangle 2 vertices
    ];

    const edges = [
      [0, 1], [1, 2], [2, 0], // Triangle 1 edges
      [3, 4], [4, 5], [5, 3]  // Triangle 2 edges
    ];

    const polygonManager = new PolygonManager(vertices, edges);
    const polygons = polygonManager.extractFaces();

    expect(polygons.length).toBe(2); // Should find two interior faces

    // Find neighbor info 
    let neighboringFaces = PolygonManager.findNeighboringFaces(polygons, 0);
    expect(neighboringFaces.length).toBe(0); // As they are disconnected

    neighboringFaces = PolygonManager.findNeighboringFaces(polygons, 1);
    expect(neighboringFaces.length).toBe(0); // As they are disconnected

    // Check point inside, on and outside polygons
    expect(polygons[0].isPointInside([1, 2 / 3])).toEqual(true); // Check if the centroid is inside
    expect(polygons[0].isPointInside([2, 0])).toEqual(true); // Check if boundary point is inside
    expect(polygons[0].isPointInside([2.01, 0])).toEqual(false); // Check if this point is outside

    expect(polygons[1].isPointInside([4, 2 / 3])).toEqual(true); // Check if the centroid is inside
    expect(polygons[1].isPointInside([3, 0])).toEqual(true); // Check if boundary point is inside
    expect(polygons[1].isPointInside([5.01, 0])).toEqual(false); // Check if this point is outside

    // Test buildFaceNeighborsMap(polygons, startFaceId)
    const neighborMap = PolygonManager.buildFaceNeighborsMap(polygons, 0);
    expect(neighborMap.size).toEqual(1); // This should return one entries in the map as this is disjoint geometry
    const neighborsForFace0 = neighborMap.get(0);
    expect(neighborsForFace0.length).toEqual(0); // No neigbhors as these are disconnected

  });

  describe('PolygonManager', () => {
    test('correctly extracts faces from a meshed hexagon graph', () => {
      const vertices = [
        [1, 0], [2, Math.sqrt(3)], [1, 2 * Math.sqrt(3)], [-1, 2 * Math.sqrt(3)], [-2, Math.sqrt(3)], [-1, 0], // Outer hexagon vertices
        [0, Math.sqrt(3)], // Center vertex for internal connections
      ];

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], // Outer hexagon edges
        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], // Internal edges connecting center to vertices
      ];

      const polygonManager = new PolygonManager(vertices, edges);
      const polygons = polygonManager.extractFaces();

      expect(polygons.length).toBe(6); // 6 triangles formed with the center vertex
      // Find neighbor info 
      // Generate a random face id between 0 and 5 (inclusive)
      const randomFaceId = Math.floor(Math.random() * 6);

      let neighboringFaces = PolygonManager.findNeighboringFaces(polygons, randomFaceId);
      expect(neighboringFaces.length).toBe(2); // Should be always 2 as this is a hexagon symmetrically split by 6 triangles

      // Check if points are inside or outside the polygons
      expect(polygons[1].isPointInside([0, 0.577])).toEqual(true); // Check if center point is inside
      expect(polygons[1].isPointInside([-1, 0])).toEqual(true); // Check if the boundary is inside
      expect(polygons[1].isPointInside([1, -0.1])).toEqual(false); // Check if this point is outside

      // Test buildFaceNeighborsMap(polygons, startFaceId)
      const neighborMap = PolygonManager.buildFaceNeighborsMap(polygons, 0);
      expect(neighborMap.size).toEqual(6); // There are 6 faces in all

      // Get the array corresponding to face id (key) i and check its length

      // Loop through ids from 0 to 5 and the number of neighbors should always be 2
      for (let id = 0; id < 6; id++) {
        // Get the array corresponding to the current id and check its length
        const neighborsForCurrentFace = neighborMap.get(id);
        expect(neighborsForCurrentFace.length).toEqual(2); // This should be always 2
      }
    });

  });

  describe('PolygonManager', () => {
    test('Added as part of bug fix for inside or outside of non-convex polygons', () => {
      const geometry = {
        "vertices": [
          [1, 1], [4, 1], [6, 2], [6, 4], [4, 5], [1, 5], [0, 4], [0, 2],
          [2, 2], [3, 2], [3, 4], [2, 4]
        ],
        "edges": [
          [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
          [7, 8], [8, 9], [9, 1], [2, 10], [10, 11], [11, 3], [8, 11], [9, 10]
        ]
      };
  
      const polygonManager = new PolygonManager(geometry.vertices, geometry.edges);
      const polygons = polygonManager.extractFaces();

      // Test points inside the polygons
      expect(polygons[0].isPointInside([1, 1.99])).toEqual(true); // Point inside the first polygon
      expect(polygons[0].isPointInside([1, 1])).toEqual(true); // Point on the boundary of the first polygon 
      expect(polygons[0].isPointInside([0, 0])).toEqual(false); // Point outside the first polygon

      expect(polygons[1].isPointInside([5, 5])).toEqual(false); // Point outside 
      expect(polygons[1].isPointInside([3, 2])).toEqual(false); // Point outside
      expect(polygons[1].isPointInside([6, 2])).toEqual(false); // Point outside
      expect(polygons[1].isPointInside([1, 3])).toEqual(true); // Point on the boundary of the second polygon

  
      
      
      
    });
  });
  

});
