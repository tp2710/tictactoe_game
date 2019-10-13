//Define the order in which to examine/expand possible moves
//(This affects alpha-beta pruning performance)
let move_expand_order=[0,1,2,3,4,5,6,7,8]; //Naive (linear) ordering
let board = null;
let HUMAN = 1;
let COMP = -1;
let helper_eval_state_count = 0;
let rowHorizontal = -1;
let rowVertical = -1;
//let move_expand_order=[4,0,1,2,3,5,6,7,8]; //Better ordering?

/////////////////////////////////////////////////////////////////////////////
/* Function to heuristic evaluation of state. */
function evalute(state) {
	var score = 0;

	if (gameOver(state, COMP)) {
		score = +1;
	}
	else if (gameOver(state, HUMAN)) {
		score = -1;
	} else {
		score = 0;
	}

	return score;
}
/* This function tests if a specific player wins */
function gameOver(state, player) {
	var numberOfNodes = document.getElementById("select-number-board").value;
	var filled = 0;
	for (var i = 0; i < numberOfNodes; i++) {
	    filled = 0;
		for (var j = 0; j < numberOfNodes; j++) {
			if (state[i][j] == player)
				filled++;
		}
		if (filled == numberOfNodes){
		    return true;
		}
	}

	for (var i = 0; i < numberOfNodes; i++) {
	    filled = 0;
		for (var j = 0; j < numberOfNodes; j++) {
			if (state[j][i] == player)
				filled++;
		}
		if (filled == numberOfNodes){
		    return true;
		}
	}

    filled = 0;
    for (var i = 0; i < numberOfNodes; i++) {
        if (state[i][i] == player) {
            filled++;
        }
    }
    if (filled == numberOfNodes)
			return true;
    filled = 0;
    for (var i = 0; i < numberOfNodes; i++) {
        for (var j = 0; j < numberOfNodes; j++) {
            if  (i+j == numberOfNodes - 1) {
                if (state[i][j] == player) {
                    filled++;
                }
            }
        }
	}
	if (filled == numberOfNodes)
		return true;

	return false;
}

function is_terminal(board) {
  ++helper_eval_state_count; //DO NOT REMOVE
  return gameOver(board, HUMAN) || gameOver(board, COMP);
}

function utility(board) {
     var msg;
     msg = document.getElementById("message");
	 if (gameOver(board, COMP)) {
		msg.innerHTML = "You lose!";
        msg.style.color = "red";
	} else if (gameOver(board, HUMAN)) {
		msg.innerHTML = "You win!";
		msg.style.color = "red";
	} else  if (emptyCells(board).length == 0 && !is_terminal(board)) {
		msg.innerHTML = "Draw!";
	}
	msg.style.fontSize = "xx-large";
}

function createTable() {
  var numberOfNodes = document.getElementById("select-number-board").value;
  var theTable = document.getElementById("myDivTable");
  var createdTable = document.createElement("table");
  createdTable.setAttribute("style", "border-collapse: collapse");
  var tabBody = document.createElement("tbody");
  createdTable.appendChild(tabBody);
  for (var i = 0; i < numberOfNodes; i++) {
   var myRow = document.createElement("tr");
   tabBody.appendChild(myRow);
   for (var j = 0; j < numberOfNodes; j++) {
    var myCol = document.createElement("td");	
	if (j == 0){
		myCol.setAttribute("style","border-bottom:2px solid");
	} else {
		myCol.setAttribute("style","border-left:2px solid;border-bottom:2px solid");
    }
    var myButton = document.createElement("button");
    myButton.setAttribute("id",i+''+j);
	myButton.setAttribute("style","width:40px;height:20px");
	myButton.setAttribute("onclick","clickedCell(this)");
	myButton.disabled = true;
    myCol.appendChild(myButton);
    myRow.appendChild(myCol);
   }
  }
  theTable.appendChild(createdTable);
}
 
function load_page(){
	createTable();
}


function setStateForControl(state){
	let selectNumberBoard=document.getElementById("select-number-board");
	let inputOrderX=document.getElementById("input_order_X");
	let inputOrderO=document.getElementById("input_order_O");
	let inputCPUModeMM=document.getElementById("input_cpumode_mm");
	let inputCPUModeMMAB=document.getElementById("input_cpumode_mmab");
	selectNumberBoard.disabled = state;
	inputOrderX.disabled = state;
	inputOrderO.disabled = state;
	inputCPUModeMM.disabled = state;
	inputCPUModeMMAB.disabled = state;
}

function clearBoard(state) {
    var msg = document.getElementById("message");
    msg.innerHTML = "";
	var numberOfNodes = document.getElementById("select-number-board").value;
    board = new Array(numberOfNodes);
	for (var i = 0; i < numberOfNodes; i++) {
	    board[i]=new Array(numberOfNodes)
		for (var j = 0; j < numberOfNodes; j++) {
		    board[i][j] = 0;
			let input=document.getElementById(i+''+j);
			input.innerHTML = "";
			input.disabled = state;
		}
	}
}

function game_start(){
	let button=document.getElementById("btnStart");
	
	if(button.innerText === "Start Game") {
		var theTable = document.getElementById("myDivTable");
		theTable.innerHTML = "";
		createTable();
		setStateForControl(true);
		clearBoard(false);
		button.innerText = "Restart Game";

		var inputOrderX = document.getElementById("input_order_X").checked;
		if (inputOrderX === false) {
		    aiTurn();
		}
	} else {
		setStateForControl(false);
		clearBoard(true);
		button.innerText = "Start Game";
	}
}
function emptyCells(state) {
	var cells = [];
	var numberOfNodes = document.getElementById("select-number-board").value;
	for (var x = 0; x < numberOfNodes; x++) {
		for (var y = 0; y < numberOfNodes; y++) {
			if (state[x][y] == 0)
				cells.push([x, y]);
		}
	}

	return cells;
}

/* A move is valid if the chosen cell is empty */
function validMove(x, y) {
	var empties = emptyCells(board);
	try {
		if (board[x][y] == 0) {
			return true;
		}
		else {
			return false;
		}
	} catch (e) {
		return false;
	}
}

/* Set the move on board, if the coordinates are valid */
function setMove(x, y, player) {
	if (validMove(x, y)) {
		board[x][y] = player;
		return true;
	}
	else {
		return false;
	}
}

/* *** AI function that choice the best move *** */
function tictactoe_minimax(state, depth, player) {
	var best;

	if (player == COMP) {
		best = [-1, -1, -1000];
	}
	else {
		best = [-1, -1, +1000];
	}

	if (depth == 0 || is_terminal(state)) {
		var score = evalute(state);
		return [-1, -1, score];
	}

	emptyCells(state).forEach(function (cell) {
		var x = cell[0];
		var y = cell[1];
		state[x][y] = player;
		var score = tictactoe_minimax(state, depth - 1, -player);
		state[x][y] = 0;
		score[0] = x;
		score[1] = y;

		if (player == COMP) {
			if (score[2] > best[2])
				best = score;
		}
		else {
			if (score[2] < best[2])
				best = score;
		}
	});

	return best;
}

function tictactoe_minimax_alphabeta(board,cpu_player,cur_player,alpha,beta) {
  /***********************
  * TASK: Implement Alpha-Beta Pruning
  *
  * Once you are confident in your minimax implementation, copy it here
  * and add alpha-beta pruning. (What do you do with the new alpha and beta parameters/variables?)
  *
  * Hint: Make sure you update the recursive function call to call this function!
  ***********************/
}

/* It calls the minimax function */
function aiTurn() {
	var x, y;
	var move;
	var cell;
	var numberOfNodes = document.getElementById("select-number-board").value;

	if (emptyCells(board).length == numberOfNodes * numberOfNodes) {
		x = parseInt(Math.random() * numberOfNodes);
		y = parseInt(Math.random() * numberOfNodes);
	}
	else {
		move = tictactoe_minimax(board, emptyCells(board).length, COMP);
		x = move[0];
		y = move[1];
	}

	if (setMove(x, y, COMP)) {
		cell = document.getElementById(String(x) + String(y));
		var inputOrderX = document.getElementById("input_order_X").checked;
		if (inputOrderX === true) {
		        cell.innerHTML = "O";
		    } else {
                cell.innerHTML = "X";
		    }
	}
}

function clickedCell(cell) {
    var conditionToContinue = is_terminal(board) == false && emptyCells(board).length > 0;
	if (conditionToContinue == true) {
        var inputOrderX = document.getElementById("input_order_X").checked;
        var x = cell.id.split("")[0];
		var y = cell.id.split("")[1];
		var move = setMove(x, y, HUMAN);
		var isHumanWin = gameOver(board, HUMAN);
		if (move == true && !isHumanWin) {
		    if (inputOrderX === true) {
		        cell.innerHTML = "X";
		    } else {
                cell.innerHTML = "O";
		    }
			if (conditionToContinue)
				aiTurn();
		}
	}
	utility(board);
}

function debug(board,human_player) {
  /***********************
  * This function is run whenever you click the "Run debug function" button.
  *
  * You may use this function to run any code you need for debugging.
  * The current "initial board" and "human player" settings are passed as arguments.
  *
  * (For the purposes of grading, this function will be ignored.)
  ***********************/
  helper_log_write("Testing board:");
  helper_log_board(board);
  
  let tm=is_terminal(board);
  helper_log_write("is_terminal() returns "+(tm?"true":"false"));

  let u=utility(board,human_player);
  helper_log_write("utility() returns "+u+" (w.r.t. human player selection)");
}
