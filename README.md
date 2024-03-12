# How to git clone?
git clone -b master https://github.com/vaidyt/Polygon-Extractor.git

# Install node.js 
https://nodejs.org/

# Install Live-Server or HTTP-Server

  ```bash
   # For live-server
  npm install -g live-server

   # For http-server
   npm install -g http-server
 ```

# How to launch the Polygon-Extractor Application?

To launch the application using a live server from the command prompt, you can follow these steps:

1. Open your command prompt or terminal and cd to the cloned directory that contains index.html.

2. Once you're in the correct directory, you can start a live server using `live-server` or `http-server`. 

3. Start live-server or http-server as follows:

   ```bash
   # For live-server
   live-server

   # For http-server
   http-server
   ```

5. Once the server is running, it will provide you with a URL (usually `http://localhost:port`) where your `index.html` file is being served. Open this URL in your web browser to view index.html.

6. If you want to open the page in incognito mode, you can do so by specifying the browser executable and the incognito flag in the command. For example, to open in Chrome incognito mode:

   ```bash
   chrome --incognito http://localhost:port/index.html
   ```

   Replace `chrome` with the appropriate command for your browser if you're not using Chrome.

7. That's it! You should now be able to use the Polygon-Extractor Application.

# How to use the application?
a. Load the graph data as a json file (from the input folders found in the repo).

b. This Would automatically loads the graph, extracts and displays the polygons (in unique colors).

c. Click anywhere inside or outside the canvas to trigger other computations (like inside-outside or neighbor info computation).

d. For any given test point, the application gives the face it belongs to (if it is inside any of the internal faces) and the neighborhood (or adjacency) information.

# Website Endpoint
[https://vaidyt.github.io/Polygon-Extractor/](https://vaidyt.github.io/Polygon-Extractor/)


