import { PQueue } from "./utils/PriorityQueue.js";
import { manhattan, euclidean } from "./utils/Distance.js";

// Value references
// 0: 'white', empty
// 1: 'black', wall
// 2: 'cyan', start
// 3: 'red', end
// 4: 'blue', border
// 5: 'gray', visited
// 6: 'yellow', path

// Maze class
export class Maze {
    constructor(width, height, blockSize) {
        this.width = width;
        this.height = height;
        this.blockSize = blockSize;
        this.grid = undefined;
        this.initGrid();
        this.startPlaced = false;
        this.endPlaced = false;
    }

    // Initialize maze
    initGrid() {
        this.grid = [];
        for (let i = 0; i < this.width; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.height; j++) {
                this.grid[i].push(0);
            }
        }
    }

    // Clears everything but walls and start and end
    clearPath() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (![1, 2, 3, 10].includes(this.grid[i][j])) {
                    this.grid[i][j] = 0;
                }
            }
        }
    }

    // Clears walls
    clearWalls() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (![2, 3].includes(this.grid[i][j])) {
                    this.grid[i][j] = 0;
                }
            }
        }
    }

    // Handle cell changes
    set(x, y, z) {
        // Start is being placed, if start has been placed, change its location else create a new start
        if (z === 2) {
            if (this.grid[x][y] !== 0 && this.grid[x][y] !== 4 && this.grid[x][y] !== 5) return;
            if (this.startPlaced) {
                this.grid[this.startPlaced[0]][this.startPlaced[1]] = 0;
                this.grid[x][y] = z;
                this.startPlaced = [x, y];
            } else {
                this.grid[x][y] = z;
                this.startPlaced = [x, y];
            }
        }
        // End is being placed, if end hsa been placed, change its locatio else create a new end
        if (z === 3) {
            if (this.grid[x][y] !== 0 && this.grid[x][y] !== 4 && this.grid[x][y] !== 5) return;
            if (this.endPlaced) {
                this.grid[this.endPlaced[0]][this.endPlaced[1]] = 0;
                this.grid[x][y] = z;
                this.endPlaced = [x, y];
            } else {
                this.grid[x][y] = z;
                this.endPlaced = [x, y];
            }
        }
        // Wall or empty or weight is being placed, check if the grid is already a start or end
        if (this.grid[x][y] !== 2 && this.grid[x][y] !== 3) this.grid[x][y] = z;
        
    }
}

// Solver class
export class Solver {
    constructor(maze, stepsPerSecond) {
        this.maze = maze;
        this.timePerStep = (1 / stepsPerSecond) * 1000;
        this.timers = new Array();  // Store all active timers, remove when necessary
        this.shortestPath = Infinity;
        this.nodesSearched = 1;
        this.timeElapsed = 0;
        this.previousMaze = undefined;
        this.complete = false;
        this.running = false;
    }

    copyMaze(original, copy) {
        for (let i = 0; i < this.maze.width; i++) {
            copy.push([]);
            for (let j = 0; j < this.maze.height; j++) {
                copy[i].push(original[i][j]);
            }
        }
        return copy;
    }

    updateGrid() {
        if (this.complete) {
            this.complete = false;
            this.maze.grid = this.copyMaze(this.previousMaze, []);
            this.previousMaze = undefined;
        }
    }

    // Get neighbors of grid[x][y] in all 4 directions
    getNeighbors(x, y) {
        const DIRECTIONS = [0, 1, 0, -1, 0];
        const neighbors = [];
        for (let i = 0; i < 4; i++){
            const xPos = x + DIRECTIONS[i];
            const yPos = y + DIRECTIONS[i + 1];
            if (xPos < 0 || xPos > this.maze.width - 1 || yPos < 0 || yPos > this.maze.height - 1) {
                continue;
            };
            if (this.maze.grid[xPos][yPos] !== 1) neighbors.push([xPos, yPos]);
        }
        return neighbors;
    }

    // Remove timers 
    stop() {
        for (let t of this.timers) {
            clearInterval(t);
        }
        this.running = false;
    }

    // Breadth First Search algorithm
    bfs() {
        console.log('Running solver with BFS approach', this.timePerStep);
        if (!this.maze.startPlaced || !this.maze.endPlaced) {
            alert('Place a start and end');
            return;
        }
        this.complete = false;
        this.running = true;

        // Getting previous maze to run
        if (this.previousMaze) {
            this.maze.grid = this.copyMaze(this.previousMaze, []);
        };

        const timeold = new Date();

        // Initialize states
        const queue = [this.maze.startPlaced];
        const visited = new Array();
        const foundedBy = {};
        let found = false;

        // Initialize boolean matrix to false
        for (let i = 0; i < this.maze.width; i++) {
            visited.push(Array(this.maze.height).fill(false));
        }

        // Update starting point as visited
        visited[this.maze.startPlaced[0]][this.maze.startPlaced[1]] = true;

        this.nodesSearched = 1;

        // Step algorithm to run each step at this.timePerStep, used for visualizing how the algorithm searches
        const search = setInterval(() => {
            if (queue.length > 0 && !found) {
                const curr = queue.shift();
    
                const neighbors = this.getNeighbors(curr[0], curr[1]);
                if (![2,3,10].includes(this.maze.grid[curr[0]][curr[1]])) this.maze.grid[curr[0]][curr[1]] = 5;
    
                // For each unvisited neighbor, add to queue and update foundedBy
                // If neighbor is goal state, then stop algorithm after iteration
                for (let neighbor of neighbors) {
                    if (visited[neighbor[0]][neighbor[1]] === false) {
                        this.nodesSearched += 1;
                        visited[neighbor[0]][neighbor[1]] = true

                        // Check that the neighbor isn't an invalid neighbor (wall, )
                        if (![1,2,3,10].includes(this.maze.grid[neighbor[0]][neighbor[1]])) {
                            this.maze.grid[neighbor[0]][neighbor[1]] = 4;
                            queue.push(neighbor);
                        }
                        if (this.maze.grid[neighbor[0]][neighbor[1]] === 3) found = true;
    
                        foundedBy[neighbor.join(',')] = curr.join(',');
                    };
                }
                $('#nodessearched').html(this.nodesSearched);
            // No path from start to end
            }
            if (queue.length == 0 && !found) {
                this.complete = true;
                this.running = false;
                alert('No path found');
                clearInterval(search);
                return;
            }
            if (found) {
                clearInterval(search);
                // Backtrack from end to start
                let current = this.maze.endPlaced.join(',');
                const start = this.maze.startPlaced.join(',');
                this.shortestPath = 0;
                const backtrack = setInterval(() => {
                    if (current != start) {
                        try {
                            const [x, y] = current.split(',');
                            if (this.maze.grid[x][y] !== 2 && this.maze.grid[x][y] !== 3) this.maze.grid[x][y] = 6;
                            current = foundedBy[current];
                            this.shortestPath += 1;
                            if (!current) alert('No path found');
                        } catch {
                            
                        }
                    } else {
                        // stop timer
                        this.complete = true;
                        this.running = false;
                        this.timeElapsed = (new Date() - timeold) / 1000;
                        $('#timeelapsed').html(this.timeElapsed);
                        clearInterval(search);
                        clearInterval(backtrack);
                    }
                    $('#shortestpath').html(this.shortestPath);
                }, this.timePerStep * 2);
                this.timers.push(backtrack);
            }
        }, this.timePerStep);
        this.timers.push(search);
    }



    astar(heuristic, weightVal, randomweights) {
        // Use f(n) = g(n) + h(n) to calculate priority of element
        // First, initialize all f(n) and g(n) for each element to infinity
        // Second, set starting g(n) to 0 and f(n) = 0 + distance to end
        // At each iteration, get the first element in priority queue and get all its neighbors
        // For each neighbor, compute its heuristic using a distance formula from itself to goal state
        // Compare would be g(n) to neighbor's g(n) and only update if g(n) could be made smaller
        // Compute each neighbor's f(n) and enqueue them based on f(n) score (lower f(n) score means lower computed distance to goal state)
        console.log('Running solver with A* Search approach');
        if (!this.maze.startPlaced || !this.maze.endPlaced) {
            alert('Place a start and end');
            return;
        }
        this.complete = false;
        this.running = true;

        // Getting previous maze to run
        if (this.previousMaze) {
            this.maze.grid = this.copyMaze(this.previousMaze, []);
        };

        const timeold = new Date();

        // Initialize states
        const pqueue = new PQueue();
        const foundedBy = {};
        const visited = new Array();
        const gValues = new Array();
        const weights = new Array();

        let found = false;

        // Initialize boolean matrix to false
        // Initialize gValues to infinity
        for (let i = 0; i < this.maze.width; i++) {
            visited.push(Array(this.maze.height).fill(false));
            gValues.push(Array(this.maze.height).fill(Infinity));
            weights.push(Array(this.maze.height).fill(1));
        }

        if (randomweights) {
            // Generate random weights
            const numberOfWeights = Math.floor(this.maze.width * this.maze.height / 2);
            for (let i = 0; i < numberOfWeights; i++) {
                const randX = Math.floor(Math.random() * this.maze.width);
                const randY = Math.floor(Math.random() * this.maze.height);

                if (![2,3].includes(this.maze.grid[randX][randY])) {
                    this.maze.grid[randX][randY] = 10;
                    weights[randX][randY] = parseInt(weightVal);
                }
            }
        } else {
            // Set weights for each node that is weighted
            for (let i = 0; i < this.maze.width; i++) {
                for (let j = 0; j < this.maze.height; j++) {
                    if (this.maze.grid[i][j] === 10) {
                        weights[i][j] = parseInt(weightVal);
                    }
                }
            }
        }

        

        // Set boolean and gValues for starting point
        visited[this.maze.startPlaced[0]][this.maze.startPlaced[1]] = true;
        gValues[this.maze.startPlaced[0]][this.maze.startPlaced[1]] = 0;
        weights[this.maze.startPlaced[0]][this.maze.startPlaced[1]] = 0;

        // f(n) of start placed is just the manhattan/euclidean distance from start to end since g(n) is 0
        pqueue.enqueue(this.maze.startPlaced, euclidean(this.maze.startPlaced[0], this.maze.endPlaced[0], this.maze.startPlaced[1], this.maze.endPlaced[1]));
        this.nodesSearched = 1;

        const search = setInterval(() => {
            if (!pqueue.isEmpty() && !found) {
                const pop = pqueue.dequeue();
                const curr = pop.element;
                const neighbors = this.getNeighbors(curr[0], curr[1]);
                if (![1,2,3].includes(this.maze.grid[curr[0]][curr[1]])) this.maze.grid[curr[0]][curr[1]] = 5;
    
                visited[curr[0]][curr[1]] = true;

                // For each neighbor we compute g(n) and update when necessary and compute f(n) to add to queue only if not visited
                // Update founder if g(n) > tempG(n) because that would mean that the founder has a shorter path from start to current neighbor
                for (let neighbor of neighbors) {
                    let tempG = gValues[curr[0]][curr[1]] + weights[neighbor[0]][neighbor[1]];
                    // Replace founder if new G value is less than neighbor G value and update G value to new G value
                    if (tempG < gValues[neighbor[0]][neighbor[1]] && !visited[neighbor[0]][neighbor[1]]) {
                        // Set neighbor to visited
                        this.nodesSearched += 1;
                        if (this.maze.grid[neighbor[0]][neighbor[1]] === 3) found = true;
                        if (![1,2,3].includes(this.maze.grid[neighbor[0]][neighbor[1]])) {
                            // Update gValue
                            gValues[neighbor[0]][neighbor[1]] = tempG;
        
                            // Get heuristic and calculate f(n) and add to priority queue
                            // Different methods of heuristics (can add more), each heuristic can affect the order of how cells are searched (see visualization)
                            let h;
                            if (heuristic === 'euclidean') h = euclidean(neighbor[0], neighbor[1], this.maze.endPlaced[0], this.maze.endPlaced[1]);
                            if (heuristic === 'manhattan') h = manhattan(neighbor[0], neighbor[1], this.maze.endPlaced[0], this.maze.endPlaced[1]);

                            this.maze.grid[neighbor[0]][neighbor[1]] = 4;

                            const f = gValues[neighbor[0]][neighbor[1]] + h;
                            
                            pqueue.enqueue(neighbor, f); // Neighbor queued based on priority (f(n) score = g(n) + h(n))
                        }
    
                        foundedBy[neighbor.join(',')] = curr.join(',');
                    }
                }
                $('#nodessearched').html(this.nodesSearched);
            }
            if (pqueue.isEmpty() && !found) {
                this.complete = true;
                this.running = false;
                alert('No path found');
                clearInterval(search);
                return;
            }
            if (found) {
                clearInterval(search);
                // Backtrack from end to start
                let current = this.maze.endPlaced.join(',');
                const start = this.maze.startPlaced.join(',');
                this.shortestPath = 0;
                const backtrack = setInterval(() => {
                    if (current != start) {
                        try {
                            const [x, y] = current.split(',');
                            if (this.maze.grid[x][y] !== 2 && this.maze.grid[x][y] !== 3) this.maze.grid[x][y] = 6;
                            current = foundedBy[current];
                            this.shortestPath += 1;
                            if (!current) alert('No path found');
                        } catch {
                            
                        }
                    } else {
                        // stop timer
                        this.complete = true;
                        this.running = false;
                        this.timeElapsed = (new Date() - timeold) / 1000;
                        $('#timeelapsed').html(this.timeElapsed);
                        clearInterval(search);
                        clearInterval(backtrack);
                    }
                    $('#shortestpath').html(this.shortestPath);
                }, this.timePerStep * 2);
                this.timers.push(backtrack);
            }
        }, this.timePerStep);
        this.timers.push(search);    
    }

    djikstra(weightVal, randomweights) {
        console.log('Running solver with Djikstra\'s approach');
        if (!this.maze.startPlaced || !this.maze.endPlaced) {
            alert('Place a start and end');
            return;
        }
        this.complete = false;
        this.running = true;


        // Getting previous maze to run
        if (this.previousMaze) {
            this.maze.grid = this.copyMaze(this.previousMaze, []);
        };

        const timeold = new Date();

        this.grid = this.previousGrid;

        // Initialize states
        const pqueue = new PQueue();
        const foundedBy = {};
        const visited = new Array();
        const weights = new Array();
        let found = false;

        // Initialize boolean matrix to false
        // Initialize gValues to infinity
        for (let i = 0; i < this.maze.width; i++) {
            visited.push(Array(this.maze.height).fill(false));
            weights.push(Array(this.maze.height).fill(1));
        }

        if (randomweights) {
            // Generate random weights
            const numberOfWeights = Math.floor(this.maze.width * this.maze.height / 2);
            for (let i = 0; i < numberOfWeights; i++) {
                const randX = Math.floor(Math.random() * this.maze.width);
                const randY = Math.floor(Math.random() * this.maze.height);

                if (![2,3].includes(this.maze.grid[randX][randY])) {
                    this.maze.grid[randX][randY] = 10;
                    weights[randX][randY] = parseInt(weightVal);
                }
            }
        } else {
            // Set weights for each node that is weighted
            for (let i = 0; i < this.maze.width; i++) {
                for (let j = 0; j < this.maze.height; j++) {
                    if (this.maze.grid[i][j] === 10) {
                        weights[i][j] = parseInt(weightVal);
                    }
                }
            }
        }

        // Set boolean and gValues for starting point
        visited[this.maze.startPlaced[0]][this.maze.startPlaced[1]] = true;
        weights[this.maze.startPlaced[0]][this.maze.startPlaced[1]] = 0;

        // f(n) of start placed is just the manhattan/euclidean distance from start to end since g(n) is 0
        pqueue.enqueue(this.maze.startPlaced, euclidean(this.maze.startPlaced[0], this.maze.endPlaced[0], this.maze.startPlaced[1], this.maze.endPlaced[1]));
        this.nodesSearched = 1;

        const search = setInterval(() => {
            if (!pqueue.isEmpty() && !found) {
                const pop = pqueue.dequeue();
                const curr = pop.element;
                const neighbors = this.getNeighbors(curr[0], curr[1]);
                if (this.maze.grid[curr[0]][curr[1]] !== 2 && this.maze.grid[curr[0]][curr[1]] != 3) this.maze.grid[curr[0]][curr[1]] = 5;
    
                const tempW = weights[curr[0]][curr[1]];

                // For each neighbor we compute g(n) and update when necessary and compute f(n) to add to queue only if not visited
                // Update founder if g(n) > tempG(n) because that would mean that the founder has a shorter path from start to current neighbor
                for (let neighbor of neighbors) {
                    if (visited[neighbor[0]][neighbor[1]] !== true) {
                         // Set neighbor to visited
                         visited[neighbor[0]][neighbor[1]] = true;

                        this.nodesSearched += 1;
                        if (this.maze.grid[neighbor[0]][neighbor[1]] === 3) found = true;
                        if (![1,2,3].includes(this.maze.grid[neighbor[0]][neighbor[1]])) this.maze.grid[neighbor[0]][neighbor[1]] = 4;

                       
                        // Update weights
                        weights[neighbor[0]][neighbor[1]] += tempW;
                        // Set foundBy
                        foundedBy[neighbor.join(',')] = curr.join(',');
                        // Add to pqueue
                        pqueue.enqueue(neighbor, weights[neighbor[0]][neighbor[1]]);
                    }
                }
                $('#nodessearched').html(this.nodesSearched);
            }
            if (pqueue.isEmpty() && !found) {
                this.complete = true;
                this.running = false;
                alert('No path found');
                clearInterval(search);
                return;
            }
            if (found) {
                clearInterval(search);
                // Backtrack from end to start
                let current = this.maze.endPlaced.join(',');
                console.log(weights[this.maze.endPlaced[0]][this.maze.endPlaced[1]]);
                const start = this.maze.startPlaced.join(',');
                this.shortestPath = 0;
                const backtrack = setInterval(() => {
                    if (current != start) {
                        try {
                            const [x, y] = current.split(',');
                            if (this.maze.grid[x][y] !== 2 && this.maze.grid[x][y] !== 3) this.maze.grid[x][y] = 6;
                            current = foundedBy[current];
                            this.shortestPath += 1;
                            if (!current) alert('No path found');
                        } catch {
                            
                        }
                    } else {
                        // stop timer
                        this.complete = true;
                        this.running = false;
                        this.timeElapsed = (new Date() - timeold) / 1000;
                        $('#timeelapsed').html(this.timeElapsed);
                        clearInterval(search);
                        clearInterval(backtrack);
                    }
                    $('#shortestpath').html(this.shortestPath);
                }, this.timePerStep * 2);
                this.timers.push(backtrack);
            }
        }, this.timePerStep);
        this.timers.push(search);   
    }

}