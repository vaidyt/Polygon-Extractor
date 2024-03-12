import Polygon from './Polygon.mjs';
import PolygonManager from './PolygonManager.mjs';

let currentHighlightedPolygon = null; // Track the currently highlighted polygon
let internalFaces = []; // Store internal faces globally
let graphDataGlobal; // Globally store the graph data
let scaleGlobal, translateXGlobal, translateYGlobal; // Store transformation parameters globally
let currentSketch = null;

// Override console.log
(function () {
    var oldLog = console.log;
    console.log = function (message) {
        oldLog.apply(console, arguments); // Keep default behaviour
        var customConsole = document.getElementById('customConsole');
        if (customConsole) {
            customConsole.innerHTML += message + '<br>';
            customConsole.scrollTop = customConsole.scrollHeight; // Auto-scroll to the bottom
        }
    };
})();

window.clearCustomConsole = function clearCustomConsole() {
    var customConsole = document.getElementById('customConsole');
    customConsole.innerHTML = ''; // Clear the console
    customConsole.scrollTop = 0; // Scroll back to the top
}


document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
            document.getElementById('customFileUpload').addEventListener('click', function() {
                fileInput.click(); // Trigger the hidden file input click event
            });

    document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
});


function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log("No file selected");
        return;
    }

    // Now, update the filePathDisplay based on the selected file
    const filePathDisplay = document.getElementById('filePathDisplay');
    if (event.target.files.length > 0) {
        // Display the name of the first selected file
        filePathDisplay.value = event.target.files[0].name;
    } else {
        // No file selected, display "NONE"
        filePathDisplay.value = "NONE";
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            graphDataGlobal = JSON.parse(e.target.result);
            Polygon.idCounter = 0;

            // Remove the existing sketch canvas if it exists
            if (currentSketch) {
                currentSketch.remove();
            }

            // Initialize a new p5 sketch and assign it to the global variable
            currentSketch = new p5((p) => {
                setupSketch(p, graphDataGlobal);
                // Additional setup or operations on 'p'
            });

            let gp = new PolygonManager(graphDataGlobal.vertices, graphDataGlobal.edges);
            gp.printAdjacencyMatrix();
            internalFaces = gp.extractFaces();

            // Reset the ids to make it continuous
            internalFaces.forEach((polygon, index) => {
                polygon.polygonId = index; // Reset the id to the index in the filtered array
            });

            // Assuming 'polygons' is the array of Polygon objects representing internal faces
            internalFaces.forEach((polygon, index) => {
                console.log('Polygon #' + polygon.id);
                console.log(polygon.getIndices());
            });
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    };

    reader.readAsText(file);
}

function calculateScaleAndTranslation(p, graph) {
    let minX = Math.min(...graph.vertices.map(v => v[0])),
        maxX = Math.max(...graph.vertices.map(v => v[0])),
        minY = Math.min(...graph.vertices.map(v => v[1])),
        maxY = Math.max(...graph.vertices.map(v => v[1]));

    const padding = 20;
    // console.log("contents of p object = " + p.width + " " + p.width);
    let scale = Math.min(
        (p.width - padding * 2) / (maxX - minX),
        (p.height - padding * 2) / (maxY - minY)
    );

    let translateX = (p.width - (maxX - minX) * scale) / 2 - minX * scale;
    let translateY = (p.height - (maxY - minY) * scale) / 2 - minY * scale;

    return { scale, translateX, translateY };
}

function drawGraph(p, graph, scale, translateX, translateY) {
    // Draw edges first, so vertices appear on top
    graph.edges.forEach((edge, index) => {
        const startPoint = graph.vertices[edge[0]];
        const endPoint = graph.vertices[edge[1]];
        let scaledStartX = startPoint[0] * scale + translateX;
        let scaledStartY = startPoint[1] * scale + translateY;
        let scaledEndX = endPoint[0] * scale + translateX;
        let scaledEndY = endPoint[1] * scale + translateY;

        // Set stroke color for edges
        p.stroke(0);
        // Draw line for each edge
        p.line(scaledStartX, scaledStartY, scaledEndX, scaledEndY);

        // Calculate midpoint of the edge for text placement (optional)
        let midX = (scaledStartX + scaledEndX) / 2;
        let midY = (scaledStartY + scaledEndY) / 2;
        p.fill('green'); // Set text color for edge indices (optional)
        p.text(index, midX, midY - 10); // Draw edge index just above the edge (optional)
    });

    // Draw vertices
    graph.vertices.forEach((vertex, index) => {
        let scaledX = vertex[0] * scale + translateX;
        let scaledY = vertex[1] * scale + translateY;

        // Set fill color for vertices
        p.fill(0);
        // Draw each vertex as a circle
        p.ellipse(scaledX, scaledY, 10, 10);

        // Draw vertex index (optional)
        p.fill('blue'); // Set text color for vertex indices
        p.text(index, scaledX + 5, scaledY - 5); // Positioning text next to the vertex
    });
}


function fillPolygon(p, polygon, fillColor, scale, translateX, translateY) {
    p.fill(fillColor);
    p.beginShape();
    polygon.vertices.forEach(vertex => {
        // Apply scaling and translation to each vertex
        let scaledX = vertex[0] * scale + translateX;
        let scaledY = vertex[1] * scale + translateY;
        p.vertex(scaledX, scaledY);
    });
    p.endShape(p.CLOSE);
}

function setupSketch(p, graphData) {
    p.setup = () => {
        // Before initializing a new p5 instance or within setupSketch
        let existingCanvas = document.getElementById('myCanvas');
        if (existingCanvas) {
            existingCanvas.remove(); // Remove the existing canvas from the DOM
        }
        const canvas = p.createCanvas(400, 400);
        canvas.id('myCanvas'); // Assign an ID to the new canvas
        canvas.parent('canvasContainer');
        // let ctx = canvas.getContext('2d');
        // ctx.transform(1, 0, 0, -1, 0, 400);

        p.noLoop();

        // Clear the canvas and optionally set a background color
        p.clear();
        p.background(255); // Set to white or any other desired background color

        // Calculate scale and translation to fit the graph within the canvas
        let { scale, translateX, translateY } = calculateScaleAndTranslation(p, graphDataGlobal);
        scaleGlobal = scale;
        translateXGlobal = translateX;
        translateYGlobal = translateY;

        // Initialize GraphToPolygons and extract faces
        let gp = new PolygonManager(graphDataGlobal.vertices, graphDataGlobal.edges);
        internalFaces = gp.extractFaces().filter(polygon => !polygon.isExternal());

        // Reset the ids to make it continuous
        internalFaces.forEach((polygon, index) => {
            polygon.polygonId = index; // Reset the id to the index in the filtered array
        });


        console.log("Number of faces = " + internalFaces.length);

        // Draw initial state
        drawEverything(p); // Initial draw


        // Setup mouseClicked function to highlight polygons
        p.mouseClicked = () => {
            mouseClicked(p, internalFaces, scale, translateX, translateY);
        };


    };
}

function drawEverything(p) {
    p.clear();
    p.background(255); // Set background color

  
    internalFaces.forEach((polygon) => {
        let fillColor = polygon === currentHighlightedPolygon ? 'rgba(0, 255, 255, 1)' : polygon.color;
        fillPolygon(p, polygon, fillColor, scaleGlobal, translateXGlobal, translateYGlobal);

        // Calculate the centroid of the polygon
        let centroid = calculateCentroid(polygon.vertices, scaleGlobal, translateXGlobal, translateYGlobal);

        // Draw the polygon number at the centroid
        p.fill('red'); // Set fill color to red for the text
        p.noStroke(); // Ensure no outline/stroke is applied to the text
        p.textAlign(p.CENTER, p.CENTER); // Align text to be centered
        p.text(polygon.id, centroid.x, centroid.y); // Write the polygon number
    });

    // Draw graph with global graphData
    drawGraph(p, graphDataGlobal, scaleGlobal, translateXGlobal, translateYGlobal);

    drawAxisIndicators(p);
}

// Helper function to calculate the centroid of a polygon
function calculateCentroid(vertices, scale, translateX, translateY) {
    let sumX = 0, sumY = 0;
    vertices.forEach(vertex => {
        let scaledX = vertex[0] * scale + translateX;
        let scaledY = vertex[1] * scale + translateY;
        sumX += scaledX;
        sumY += scaledY;
    });
    let centroid = {
        x: sumX / vertices.length,
        y: sumY / vertices.length
    };
    return centroid;
}

function drawAxisIndicators(p) {
    // Axis lines length
    const axisLength = 50;

    // Save current drawing settings
    p.push();

    // Reset transformations to draw axis indicators at original positions
    p.resetMatrix();

    // Set stroke weight and color for axis indicators
    p.strokeWeight(2);
    p.stroke(0); // Black color

    // Draw X-axis indicator
    p.line(10, 10, 10 + axisLength, 10);
    p.text('X', 10 + axisLength + 5, 15); // Label for the X-axis

    // Draw Y-axis indicator
    p.line(10, 10, 10, 10 + axisLength);
    p.text('Y', 15, 10 + axisLength + 5); // Label for the Y-axis

    // Restore previous drawing settings
    p.pop();
}



function mouseClicked(p) {

    // Transform mouse coordinates based on global scale and translation
    let mouseXTransformed = (p.mouseX - translateXGlobal) / scaleGlobal;
    let mouseYTransformed = (p.mouseY - translateYGlobal) / scaleGlobal;

    let foundPolygon = false;
    let id = -1;

    //  3. **Algorithm 3:** Given a point and the output of Algorithm 1, find the face the point is contained within. Naturally, the
    //                      point may not be inside of a face. Include tests (with text descriptions of the input data) demonstrating that it works.
    //                      Comment your code with specifics about the computational complexity of your implementation.
    //                      Worst case complexity - Linear in number of edges (or vertices) of the polygon.
    //                     When we have n-polygons then it would be O(E) (as we need to traverse every edge of the graph).
    internalFaces.forEach(polygon => {
        if (polygon.isPointInside([mouseXTransformed, mouseYTransformed])) {
            // currentHighlightedPolygon = (currentHighlightedPolygon === polygon) ? null : polygon;
            currentHighlightedPolygon = polygon;
            foundPolygon = true;
            id = polygon.id;
        }
    });

      
    // Clear Console by default
    window.clearCustomConsole();

    console.log("===========================================");
    console.log("Test Point = " + mouseXTransformed.toFixed(2) + ", " + mouseYTransformed.toFixed(2));

    if (foundPolygon) {
        drawEverything(p); // Redraw if a polygon was clicked
        let neighboringFaces = PolygonManager.findNeighboringFaces(internalFaces, id);
        console.log("Point is inside Face " + id);
        if (neighboringFaces !== undefined && neighboringFaces.length > 0)
            console.log("Neighboring faces of face " + id + " are " + neighboringFaces);
        else
            console.log("face " + id + " has no neighboring faces" + neighboringFaces);

        // Print the face neighbor map recursively

        let faceNeighborsMap = PolygonManager.buildFaceNeighborsMap(internalFaces, id);

        // Check if the map has exactly one key and the value for that key is an empty array
        if (faceNeighborsMap.size === 1 && Array.from(faceNeighborsMap.values())[0].length === 0) {
            ;
        } else {
            for (const [faceId, neighbors] of faceNeighborsMap.entries()) {
                console.log(`Face ${faceId} has neighbors: ${neighbors.join(', ')}`);
            }
        }
    }
    else {
        currentHighlightedPolygon = null;
        drawEverything(p); // Redraw if a polygon was clicked
        console.log("Point is outside");
    }
    console.log("===========================================");


}
