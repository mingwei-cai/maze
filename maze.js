class Point {
	x = 0;
	y = 0;
	cell = 0;
	depth = 0;
	size = 0;
	/** @type {Point} */
	wall = null;
	/** @type {(x: number, y: number)} */
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.cell = 1;
		this.depth = 0;
		this.size = 1;
		this.wall = this;
	};
	/** @type {() => Point} */
	getWall() {
		if (this.wall != this.wall.wall) {
			this.wall = this.wall.getWall();
		};
		return this.wall;
	};
	/** @type {(point: Point) => void} */
	setWall(point) {
		let wallA = this.getWall();
		let wallB = point.getWall();
		if (wallA != wallB) {
			if (wallA.size < wallB.size) {
				wallA.wall = wallB;
				wallB.size += wallA.size;
			} else {
				wallB.wall = wallA;
				wallA.size += wallB.size;
			};
		};
		return;
	};
};

class Maze {
	w = 0;
	h = 0;
	/** @type {Point[][]} */
	gridPoint = null;
	/** @type {(w: number, h: number)} */
	constructor(w, h) {
		/** @type {Point[][]} */
		let gridPoint = new Array(h + 1);
		for (let y = 0; y <= h; y += 1) {
			/** @type {Point[]} */
			let rowPoint = new Array(w + 1);
			for (let x = 0; x <= w; x += 1) {
				rowPoint[x] = new Point(x, y);
			};
			gridPoint[y] = rowPoint;
		};
		let boundary = gridPoint[0][0];
		for (let x = 1; x <= w; x += 1) {
			boundary.setWall(gridPoint[0][x]);
			boundary.setWall(gridPoint[h][x]);
		};
		for (let y = 1; y <= h; y += 1) {
			boundary.setWall(gridPoint[y][0]);
			boundary.setWall(gridPoint[y][w]);
		};
		this.w = w;
		this.h = h;
		this.gridPoint = gridPoint;
	};
};

/** @type {(maze: Maze) => Point[]} */
function getRandomPointList(maze) {
	/** @type {Point[]} */
	let listPoint = new Array(maze.w * maze.h);
	let j = 0;
	for (let y = 1; y <= maze.h; y += 1) {
		for (let x = 1; x <= maze.w; x += 1) {
			let i = Math.floor(Math.random() * (j + 1));
			listPoint[j] = listPoint[i];
			listPoint[i] = maze.gridPoint[y][x];
			j += 1;
		};
	};
	return listPoint;
};

/** @type {(maze: Maze, x: number, y: number) => boolean} */
function checkPath(maze, x, y) {
	let pathCount = 0;
	if (x != 1 && maze.gridPoint[y][x - 1].cell != 0) {
		pathCount += 1;
	};
	if (x != maze.w && maze.gridPoint[y][x + 1].cell != 0) {
		pathCount += 1;
	};
	if (y != 1 && maze.gridPoint[y - 1][x].cell != 0) {
		pathCount += 1;
	};
	if (y != maze.h && maze.gridPoint[y + 1][x].cell != 0) {
		pathCount += 1;
	};
	if (pathCount > 1) {
		return true;
	};
	maze.gridPoint[y][x].cell = 1;
	return false;
};

/** @type {(maze: Maze, x: number, y: number) => boolean} */
function checkWall(maze, x, y) {
	let listLocalPoint = [
		new Point(0, 0),
		new Point(0, 1),
		new Point(1, 0),
		new Point(1, 1),
	];
	if (x == 1 || maze.gridPoint[y][x - 1].cell == 0) {
		listLocalPoint[0].setWall(listLocalPoint[2]);
	};
	if (x == maze.w || maze.gridPoint[y][x + 1].cell == 0) {
		listLocalPoint[1].setWall(listLocalPoint[3]);
	};
	if (y == 1 || maze.gridPoint[y - 1][x].cell == 0) {
		listLocalPoint[0].setWall(listLocalPoint[1]);
	};
	if (y == maze.h || maze.gridPoint[y + 1][x].cell == 0) {
		listLocalPoint[2].setWall(listLocalPoint[3]);
	};
	let listGlobalWall = [
		maze.gridPoint[y - 1][x - 1].getWall(),
		maze.gridPoint[y - 1][x - 0].getWall(),
		maze.gridPoint[y - 0][x - 1].getWall(),
		maze.gridPoint[y - 0][x - 0].getWall(),
	];
	for (let j = 0; j < 4; j += 1) {
		let localWallB = listLocalPoint[j].getWall();
		let globalWallB = listGlobalWall[j];
		for (let i = 0; i < j; i += 1) {
			let localWallA = listLocalPoint[i].wall;
			let globalWallA = listGlobalWall[i];
			if (localWallA != localWallB && globalWallA == globalWallB) {
				return false;
			};
		};
	};
	let point = maze.gridPoint[y][x];
	point.cell = 0;
	point.setWall(listGlobalWall[0]);
	point.setWall(listGlobalWall[1]);
	point.setWall(listGlobalWall[2]);
	return true;
};

/** @type {(maze: Maze, x: number, y: number, fillCell: number) => Point} */
function findEndPoint(maze, x, y, fillCell) {
	let point = maze.gridPoint[y][x];
	let cell = point.cell;
	point.cell = fillCell;
	/** @type {Point[]} */
	let listPoint = null;
	let listNewPoint = [point];
	let depth = 0;
	while (listNewPoint.length != 0) {
		listPoint = listNewPoint;
		listNewPoint = [];
		for (point of listPoint) {
			x = point.x;
			y = point.y;
			point.depth = depth;
			if (x != 1) {
				let newPoint = maze.gridPoint[y][x - 1];
				if (newPoint.cell == cell) {
					newPoint.cell = fillCell;
					listNewPoint.push(newPoint);
				};
			};
			if (x != maze.w) {
				let newPoint = maze.gridPoint[y][x + 1];
				if (newPoint.cell == cell) {
					newPoint.cell = fillCell;
					listNewPoint.push(newPoint);
				};
			};
			if (y != 1) {
				let newPoint = maze.gridPoint[y - 1][x];
				if (newPoint.cell == cell) {
					newPoint.cell = fillCell;
					listNewPoint.push(newPoint);
				};
			};
			if (y != maze.h) {
				let newPoint = maze.gridPoint[y + 1][x];
				if (newPoint.cell == cell) {
					newPoint.cell = fillCell;
					listNewPoint.push(newPoint);
				};
			};
		};
		depth += 1;
	};
	return listPoint[Math.floor(Math.random() * listPoint.length)];
};

/** @type {(maze: Maze, x: number, y: number, fillCell: number) => void} */
function setDepth(maze, x, y, fillCell) {
	let point = maze.gridPoint[y][x];
	let cell = point.cell;
	point.cell = fillCell;
	/** @type {Point[]} */
	let listPoint = null;
	let listNewPoint = [point];
	let depth = 0;
	let pathLength = point.depth;
	while (listNewPoint.length != 0) {
		listPoint = listNewPoint;
		listNewPoint = [];
		for (point of listPoint) {
			x = point.x;
			y = point.y;
			point.depth = (point.depth + depth - pathLength) / pathLength;
			if (x != 1) {
				let newPoint = maze.gridPoint[y][x - 1];
				if (newPoint.cell == cell) {
					newPoint.cell = fillCell;
					listNewPoint.push(newPoint);
				};
			};
			if (x != maze.w) {
				let newPoint = maze.gridPoint[y][x + 1];
				if (newPoint.cell == cell) {
					newPoint.cell = fillCell;
					listNewPoint.push(newPoint);
				};
			};
			if (y != 1) {
				let newPoint = maze.gridPoint[y - 1][x];
				if (newPoint.cell == cell) {
					newPoint.cell = fillCell;
					listNewPoint.push(newPoint);
				};
			};
			if (y != maze.h) {
				let newPoint = maze.gridPoint[y + 1][x];
				if (newPoint.cell == cell) {
					newPoint.cell = fillCell;
					listNewPoint.push(newPoint);
				};
			};
		};
		depth += 1;
	};
	return;
};

/** @type {(w: number, h: number) => Maze} */
function createRandomMaze(w, h) {
	let maze = new Maze(w, h);
	let listPoint = getRandomPointList(maze);
	for (let point of listPoint) {
		let x = point.x;
		let y = point.y;
		if (checkPath(maze, x, y) && checkWall(maze, x, y)) {
			if (x != 1) {
				checkPath(maze, x - 1, y);
			};
			if (x != w) {
				checkPath(maze, x + 1, y);
			};
			if (y != 1) {
				checkPath(maze, x, y - 1);
			};
			if (y != h) {
				checkPath(maze, x, y + 1);
			};
		};
	};
	let endPoint = findEndPoint(maze, maze.gridPoint[1][1].cell != 0 ? 1 : 2, 1, 2);
	let startPoint = findEndPoint(maze, endPoint.x, endPoint.y, 3);
	setDepth(maze, startPoint.x, startPoint.y, 1);
	startPoint.cell = 2;
	endPoint.cell = 2;
	return maze;
};

class Color {
	r = 0;
	g = 0;
	b = 0;
	/** @type {(r: number, g: number, b: number)} */
	constructor(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
	};
	/** @type {(color: Color, ratio: number) => Color} */
	mix(color, ratio) {
		return new Color(
			this.r + (color.r - this.r) * ratio,
			this.g + (color.g - this.g) * ratio,
			this.b + (color.b - this.b) * ratio,
		);
	};
	toString() {
		return 'rgb(' + [
			Math.round(this.r),
			Math.round(this.g),
			Math.round(this.b),
		] + ')';
	};
};

!function () {
	/** @type {HTMLInputElement} */
	let inputW = document.getElementById('input-w');
	/** @type {HTMLInputElement} */
	let inputH = document.getElementById('input-h');
	/** @type {HTMLButtonElement} */
	let btn = document.getElementById('button-create');
	/** @type {HTMLInputElement} */
	let inputDepth = document.getElementById('input-depth');
	/** @type {HTMLCanvasElement} */
	let cvs = document.getElementById('canvas-maze');
	/** @type {Maze} */
	let maze = null;
	let border = 20;
	let listCellColor = [
		new Color(0x00, 0x00, 0x00),
		new Color(0x77, 0x66, 0x33),
		new Color(0x00, 0x99, 0xFF),
	];
	let cellWidth = 20;
	let lineColor = new Color(0xFF, 0x66, 0xFF);
	let lineWidth = 5;
	let lineX = 0;
	let lineY = 0;
	let depthStartColor = new Color(0x55, 0x44, 0x00);
	let depthEndColor = new Color(0x11, 0x99, 0x00);
	function drawMaze() {
		let w = maze.w;
		let h = maze.h;
		cvs.width = w * cellWidth + 2 * border;
		cvs.height = h * cellWidth + 2 * border;
		let ctx = cvs.getContext('2d');
		ctx.lineJoin = 'round';
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = lineColor;
		ctx.fillStyle = listCellColor[0];
		ctx.fillRect(0, 0, cvs.width, cvs.height);
		for (let y = 1; y <= h; y += 1) {
			for (let x = 1; x <= w; x += 1) {
				let point = maze.gridPoint[y][x];
				if (point.depth != 0 && inputDepth.checked) {
					ctx.fillStyle = depthStartColor.mix(depthEndColor, point.depth);
				} else {
					ctx.fillStyle = listCellColor[point.cell];
				};
				ctx.fillRect(border + (x - 1) * cellWidth, border + (y - 1) * cellWidth, cellWidth, cellWidth);
			};
		};
		return;
	};
	btn.onclick = function (ev) {
		let w = inputW.value | 0;
		let h = inputH.value | 0;
		if (w > 0 && h > 0) {
			maze = createRandomMaze(w, h);
			drawMaze();
		};
		return;
	};
	inputDepth.onchange = function (ev) {
		if (maze != null) {
			drawMaze();
		};
		return;
	};
	cvs.onmousemove = function (ev) {
		if (cvs.matches(':active')) {
			let ctx = cvs.getContext('2d');
			ctx.beginPath();
			ctx.moveTo(lineX, lineY);
			ctx.lineTo(ev.offsetX, ev.offsetY);
			ctx.closePath();
			ctx.stroke();
		};
		lineX = ev.offsetX;
		lineY = ev.offsetY;
		return;
	};
}();
