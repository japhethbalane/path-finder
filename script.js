
var form = document.querySelector('#form');
form.addEventListener('submit', handleFileRead);

function handleFileRead(e) {
	e.preventDefault();
	var file = fileInput.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
		content = reader.result;
		handleContent(content);
	}
	reader.readAsText(file);
}

function handleContent(content) {
	
	var validChars = ['%', '.', 'P', ' '];
	var maze = [], start, goals = [];

	console.clear();
	console.log(content);

	var content = content.split('\n').filter(a => a != '');

	for (var i = 0; i < content.length; i++) {
		content[i] = content[i].split('');
	}

	for (var i = 0; i < content.length; i++) {
		maze.push([]);
		for (var j = 0; j < content[i].length; j++) {
			if (validChars.includes(content[i][j])) {
				var block = new Block(j, i, content[i][j]);
				maze[i].push(block);
				if (content[i][j] == 'P') {
					start = block;
				} else if (content[i][j] == '.') {
					goals.push(block);
				}
			}
		}
	}

	solve(maze, start, goals);
}

function solve(maze, start, goals) {
	clearCanvas();
	var current_goal = goals.shift();
	var current;
	var flog = true;
	// while(goals.length > 5){
	// 	goals.pop();
	// }

	var open_list = [];
	var closed_list = [start];
	var visited_list = [];
	var expanded = [];
	var solutions = [];
	var opened = [];
	var openeded = [];

	for (var i = 0; i < maze.length; i++) {
		for (var j = 0; j < maze[i].length; j++) {
			maze[i][j].H1 = getHuristics1(current_goal, maze[i][j]);
			maze[i][j].H2 = getHuristics2(1, current_goal, maze[i][j]);
		}
	}

	current = closed_list.shift();

	setInterval(function() {
		if (current != current_goal) {
			start.parent = null;
			// code code code
			visited_list.push(current);
			open_list.push(...getAvailableBorders(maze, current, visited_list));
			opened.push(...getAvailableBorders(maze, current, visited_list));
			var least = getLeastFoN(open_list);
			closed_list.push(least);
			current = closed_list.shift();
			console.log(current);

			
			// drawing stuff
			clearCanvas();
			for (var i = 0; i < maze.length; i++) {
				for (var j = 0; j < maze[i].length; j++) {
					maze[i][j].draw(current, start, current_goal, visited_list);
				}
			}

			if (current == current_goal) {
				var counter = 0;

				while (current.parent != null) {
					counter++;
					context.fillStyle = 'green';
					context.fillRect(50*current.x, 50*current.y, 50, 50);
					current = current.parent;
				}
				openeded.push(opened.length);
				console.log("Opened");
				// var o = openeded.reduce((a,b) => a+b, 0);
				console.log(openeded);
				solutions.push(counter);
				console.log("Solutions");
				// var s = solutions.reduce((a,b) => a+b, 0);
				console.log(solutions);
				counter = 0;
				expanded.push(visited_list.length+1);
				console.log("Expanded");
				// var e = expanded.reduce((a,b) => a+b, 0);
				console.log(expanded);

				current = current_goal;
			}
		} else {
			if (goals.length > 0) {
				clearCanvas();
				current_goal = goals.shift();
				open_list = [];
				start = current;
				closed_list = [start];
				visited_list = [];
				opened = []

				for (var i = 0; i < maze.length; i++) {
					for (var j = 0; j < maze[i].length; j++) {
						maze[i][j].G = 0;
						maze[i][j].parent = null;
						maze[i][j].H1 = getHuristics1(current_goal, maze[i][j]);
						maze[i][j].H2 = getHuristics2(1, current_goal, maze[i][j]);
					}
				}
				current = closed_list.shift();
			}

		}
	}, 10);
}

var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight*5;

function getLeastFoN(open_list) {
	var leastindex = 0;
	for (var i = open_list.length - 1; i > 0; i--) {
		if (open_list[leastindex].getFoN() > open_list[i].getFoN()) {
			leastindex = i;
		}
	}
	var temp = open_list.splice(leastindex, 1);
	return temp[0];
}

function clearCanvas() {
	context.fillStyle = 'white';
	context.fillRect(0,0,canvas.width,canvas.height);
}

function Block(x, y, val) {
	this.x = x;
	this.y = y;
	this.value = val;

	this.H1 = 0; // manhattan distance
	this.H2 = 0; // straight line distance
	this.G = null;
	this.parent = null;

	this.getFoN = function() {
		return this.H1 + this.G;
	}

	this.draw = function(current, start, current_goal, visited_list) {
		if (this.value == '%') {
			context.fillStyle = 'black';
			context.fillRect(50*this.x, 50*this.y, 50, 50);
		}
		if (visited_list.includes(this)) {
			context.fillStyle = 'yellow';
			context.fillRect(50*this.x, 50*this.y, 50, 50);
		}
		if (start == this) {
			context.fillStyle = 'green';
			context.fillRect(50*this.x, 50*this.y, 50, 50);
		}
		if (current_goal == this) {
			context.fillStyle = 'red';
			context.fillRect(50*this.x, 50*this.y, 50, 50);
		}
		if (current == this) {
			context.fillStyle = 'green';
			context.fillRect(50*this.x, 50*this.y, 50, 50);
		}
		context.fillStyle = 'black';
		context.strokeRect(50*this.x, 50*this.y, 50, 50);
	}
}

function getHuristics1(goal, node) {
	// returns the manhatan distance
	return Math.abs(goal.x - node.x) + Math.abs(goal.y - node.y);
}

function getHuristics2(cost, goal, node) {
	// returns line something distance
	var dx = Math.abs(goal.x - node.x);
	var dy = Math.abs(goal.y - node.y);
	return cost * (dx > dy ? dx : dy);
}

function getAvailableBorders(maze, node, closed_list) {
	// returns an array of valid "next steps" (not walls and not visited)
	var arr = [];
	var block;
	if (node.y > 0) { // check top
		block = maze[node.y - 1][node.x];
		if (block.value != '%') {
			arr.push(block);	
		}
	}
	if (node.x > 0) { // check left
		block = maze[node.y][node.x - 1];
		if (block.value != '%') {
			arr.push(block);
		}
	}
	if (node.y < maze.length - 1) { // check bottom
		block = maze[node.y + 1][node.x];
		if (block.value != '%') {
			arr.push(block);
		}
	}
	if (node.x < maze[0].length - 1) { // check right
		block = maze[node.y][node.x + 1];
		if (block.value != '%') {
			arr.push(block);
		}
	}
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].G != null) {
			if (arr[i].G < node.G + 1) {
				arr[i].G = node.G + 1;
			} else {
				arr.splice(i,1);
			}
		} else {
			arr[i].G = node.G + 1;
		}
		if (closed_list.includes(arr[i])) {
			arr.splice(i, 1);
		}
	}
	for (var i = 0; i < arr.length; i++) {
		if(arr[i].parent == null){
			arr[i].parent = node;
		}
	}
	// console.log(arr);
	return arr;
}
