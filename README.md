---
title: 'Pathfinding Algorithm Visualizer'
---

Pathfinding Algorithm Visualizer
===

## Table of Contents

[TOC]


## Why?
Why did I choose these algorithms and how are they important?
>I choose these algorithms because I enjoy the nature of graphs and searching through graphs. The idea that everything is connected and there is some way from point A to point B is one way to express the power of search algorithms. I made the visualization on pathfinding because I thought that it was an interesting way to show how different algorithms search through a graph through nodes (vertices) and their neighbors (edges). In my application of pathfinding, these algorithms are used to find the shortest or most cost effective path from point A to point B. However, these algorithms are not limited to pathfinding.
Some usages of algorithms like these can traverse through large graphs efficiently and return the Minimum Spanning Tree which is a tree containing all vertices of the graph containing a subset of edges which minimizes the weight of the edges. Dijkstra's algorithm can be changed slightly to produce an MST which can be used to minimize costs of something (laying internet cable throughout a city while minimizing total cost). BFS or BFT (breadth first traversal) can be used in many applications such as searching through hundreds of directories to find a file, or more efficiently using DFS to do so for directories with deeper directories.
I've recently came across a video on SpaceX's Inter-satellite links and found it interesting. Maybe these algorithms can somehow be used to improve signal between all the nodes of satellites...
Point is, search algorithms are cool and important.

## Setup

Here's how to get the visualizer up and running:

1. Make sure all files are extracted and in the same folder directory
2. Make sure that Visual Studio Code is installed
3. Install the Live Server Extension for VS Code
4. Open the folder in VS Code
5. Select the HTML file
6. On the bottom right of VS Code, click on Go Live (if this button does not appear, make sure Live Server Extension is installed)
7. Ensure that JavaScript is enabled on your browser
8. Check that the UI is working and the grid is showing

## Usage

> The menu contains all the tools necessary to interact with the canvas
1. **Clear maze:** removes walls, weights, and algorithm visuals.
2. **Walls:** Selects the "wall" tool. Walls have a weight of *infinity*.
3. **Weight:** Selects the "weight" tool. Weight can be adjusted using the *weight scrollbar* below.
4. **Start:** Selects the "start" tool. This is where the algorithm starts its search. *There can only be one start on the grid at a time.*
5. **End:** Selects the "end" tool. When the end is found, the current algorithm terminates. *There can only be one end on the grid at a time.*
6. **Steps per second:** Scroll to choose how many iterations the algorithm executes per second. *Lower value means slower algorithm.*
7. **Choose an algorithm:** Select an algorithm to show how it runs!
8. **Choose a heuristic:** Heuristics determine how the algorithm values each node based on its distance from the end node. *This option only works for the A Search algorithm.*
9. **Randomize Weights:** Select if you want weights to randomly generate.

Implemented Algorithms
---

```gherkin=
Feature: Breadth First Search (BFS)
Greedy algorithm that searches by level until 
the end node is found or until all nodes have 
been visited. 
This algorithm is complete.
Uses a queue data structure (FIFO) to explore
nodes. 

Feature: A* Search
Greedy algorithm that uses heuristics and
weights to determine a total cost for each
node. f(n) = g(n) + h(n) where f(n) is the
total cost, g(n) is the weight from start
to the current node, and h(n) is the 
heuristic calculated using different
distance formulas. (In this case we used
manhattan and euclidean distance).
This algorithm is complete and effectively
searches using heuristics.
Uses a priority queue data structure.

Feature: Dijkstra's Shortest Path
Greedy algorithm that searches for shortest
path in an undirected/directed tree/graph
with non-negative weights. The algorithm
acts like the native BFS algorithm except
it uses a priority queue and calculates each
node's least edge weights to determine the
shortest path between the start and end nodes.
```

## Development Issues

> Issues I've encountered while making this

- This was my first time using JavaScript canvas so it definitely took some time figuring how to draw things properly on the screen. 
- I had some issue implementing the A* algorithm while using multiple values to determine the correct f(n) value to accurately enqueue each node since the f(n) value was directly used as a priority value. 
- I've had issues with calculating the weight of each node and updating them correctly. 
- Some bugs that appeared was adding strings of 1's instead of adding number of 1's which caused NaN bugs.



## FAQ

:::info
**Reach out to me if you have any questions or concerns** liujason1213@gmail.com
:::

###### tags: `Algorithm` `Documentation` `Pathfinding` `Visualization` `Visualizer`
