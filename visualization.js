import { Maze, Solver } from './algorithm.js';

// Initialize canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = 1600;
canvas.height = 800;

// States
var mousePos = undefined;
var mouseDown = false;
var rightMouseDown = false;
var paintTool = 1; // 0=wall, 1=start, 2=end, 10=weight
let raf;
let activeSolvers = new Array();
var selected = $('#addwallbtn');

// Config
const blockSize = 20;
const gridWidth = canvas.width / blockSize;
const gridHeight =  canvas.height / blockSize
var weight = $('#weightslider').val();
let stepsPerSecond = $('#stepslider').val();

const colorMap = {
    0: 'white',
    1: '#383838',
    2: '#55cf5b',
    3: '#8c1414',
    4: '#4267B2',
    5: '#b3c6e6',
    6: '#edb334',
    10: '#681899',
};

const legendKey = ['Empty', 'Wall', 'Start', 'End', 'Queued', 'Visited', 'Shortest Path', 'Weight']

for (let i = 0; i < legendKey.length; i++) {
    const legend = document.createElement('div');
    legend.style.width = '16px';
    legend.style.height = '16px';
    legend.style.backgroundColor = colorMap[Object.keys(colorMap)[i]];
    const legendtext = document.createElement('span');
    legendtext.innerHTML = legendKey[i];
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.appendChild(legend);
    div.appendChild(legendtext);
    $('.legend').append(div);
}

$('#addwallbtn').css('background-color', colorMap[1]);
$('#addwallbtn').css('color', 'white');
$('#addweightbtn').css('background-color', colorMap[10]);
$('#addweightbtn').css('color', 'white');
$('#addstartbtn').css('background-color', colorMap[2]);
$('#addstartbtn').css('color', 'white');
$('#addendbtn').css('background-color', colorMap[3]);
$('#addendbtn').css('color', 'white');

// Assets
const weightimg = document.getElementById('weightimg');

// Event listeners for buttons
$('#clearbtn').on('click', function() {
    // while (activeSolvers.length > 0) activeSolvers.shift().stop();
    solver.previousMaze = undefined;
    solver.stop();
    maze.clearWalls();
});

$('#addwallbtn').on('click', function() {
    paintTool = 1;
    selected.removeClass('selected');
    selected = $('#addwallbtn');
    selected.addClass('selected');
});

$('#addweightbtn').on('click', function() {
    paintTool = 10;
    selected.removeClass('selected');
    selected = $('#addweightbtn');
    selected.addClass('selected');

});

$('#addstartbtn').on('click', function() {
    paintTool = 2;
    selected.removeClass('selected');
    selected = $('#addstartbtn');
    selected.addClass('selected');
});

$('#addendbtn').on('click', function() {
    paintTool = 3;
    selected.removeClass('selected');
    selected = $('#addendbtn');
    selected.addClass('selected');
});

$('#runbtn').on('click', function() {
    maze.clearPath();
    const algo = $('#selectalgo').val();
    solver.stop();
    solver.timePerStep = (1 / stepsPerSecond) * 1000;
    if (solver.previousMaze === undefined) {
        solver.previousMaze = solver.copyMaze(solver.maze.grid, []);
        console.log('saved');
    }

    const heuristic = $('#selectheuristic').val();
    const randomweights = document.getElementById('randomweights').checked;
    switch (algo) {
        case 'bfs': solver.bfs(); break;
        case 'astar': solver.astar(heuristic, weight, randomweights); break;
        case 'djikstra': solver.djikstra(weight, randomweights); break;
    }
});

const slider = $('#stepslider');
const sliderlabel = $('#stepsliderlabel');
slider.on('change', function() {
    stepsPerSecond = slider.val();
    sliderlabel.html(`Steps per second: ${slider.val()}`);
});

const weightSlider = $('#weightslider');
const weightSliderLabel = $('#weightsliderlabel');
weightSlider.on('change', function() {
    weight = weightSlider.val();
    weightSliderLabel.html(`Weight: ${weight}`);
});

// Main draw functions & maze initialization
const maze = new Maze(gridWidth, gridHeight, blockSize);
const solver = new Solver(maze, stepsPerSecond);

function draw() {
    for (let i = 0; i < maze.width; i++) {
        for (let j = 0; j < maze.height; j++) {
            ctx.fillStyle = colorMap[maze.grid[i][j]];
            ctx.fillRect(i * maze.blockSize + 1, j * maze.blockSize + 1, maze.blockSize - 1, maze.blockSize - 1);
        }
    }
    if (mouseDown) {
        const getX = Math.floor(mousePos[0] / blockSize);
        const getY = Math.floor(mousePos[1] / blockSize);
        
        try{
            if (!solver.running) {
                maze.set(getX, getY, paintTool);
            }
        } catch (ex) {
            // Out of bounds;
            console.log(ex);
        }
    }
    if (rightMouseDown) {
        const getX = Math.floor(mousePos[0] / blockSize);
        const getY = Math.floor(mousePos[1] / blockSize);

        try{
            maze.grid[getX][getY] = 0;
        } catch (ex) {
            // Out of bounds;
            console.log(ex);
        }
    }
    raf = window.requestAnimationFrame(draw);
}

$('#canvas').on('click', function(e) {
});

$('#canvas').on('mousemove', function(e) {
    if (e.offsetX <= 0) e.offsetX = 0;
    if (e.offsetX >= canvas.width) e.offsetX = canvas.width;
    if (e.offsetY <= 0) e.offsetY = 0;
    if (e.offsetY >= canvas.height) e.offsetY = canvas.height;
    mousePos = [e.offsetX, e.offsetY];
});

$('#canvas').on('mousedown', function(e) {
    if (e.button === 0) mouseDown = true;
    if (e.button === 2) rightMouseDown = true;
    solver.updateGrid();
});

// Event on right click
$('#canvas').on('contextmenu', function(e) {
    e.preventDefault();
});

$(window).on('mouseup', function(e) {
    if (e.button === 0) mouseDown = false;
    if (e.button === 2) rightMouseDown = false;
});

draw();