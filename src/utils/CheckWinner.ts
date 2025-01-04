import { Server, Socket } from "socket.io";
import { Board } from "../state/BoardState";

enum result{
    winner = "winner",
    looser = "looser",
    draw = "draw"
}

export function isGameFinish(socket: Socket, io:Server,board: Board) {
    console.log(board.board);
    for (let i = 0; i < board.board.length; i++) {
        if (board.board[i][0] === null || board.board[i][1] === null || board.board[i][2] === null) continue;
        else {
            if (board.board[i][0] === board.board[i][1] && board.board[i][1] === board.board[i][2]) {
                console.log("Winner is" + board.board[i][0]);
                sendWinner(socket,io, board, board.board[i][0]);
                return true;
            }
        }
    }

    for (let i = 0; i < board.board.length; i++) {
        if (board.board[0][i] === null || board.board[1][i] === null || board.board[2][i] === null) continue;
        else {
            if (board.board[0][i] === board.board[1][i] && board.board[1][i] === board.board[2][i]) {
                console.log("Winner is" + board.board[0][i]);
                sendWinner(socket, io, board, board.board[0][i]);
                return true;
            }
        }
    }

    if (board.board[0][0] !== null || board.board[1][1] !== null || board.board[2][2] !== null) {
        
        if (board.board[0][0] === board.board[1][1] && board.board[1][1] === board.board[2][2]) {
            console.log("Winner is" + board.board[1][1]);
            sendWinner(socket, io, board, board.board[1][1]);
            return true;
        }
                
    }

    if (board.board[0][2] !== null || board.board[1][1] !== null || board.board[2][0] !== null) {
        
        if (board.board[0][2] === board.board[1][1] && board.board[1][1] === board.board[2][0]) {
            console.log("Winner is" + board.board[1][1]);
            sendWinner(socket, io, board, board.board[1][1]);
            return true;
        }
    }
    
    const isDraw = checkDraw(board);

    if (isDraw) {
        io.to(board.user1).emit("gameFinish", { result: result.draw });
        io.to(board.user2).emit("gameFinish", { result: result.draw });
        return true;
    }
    return false;
}

function sendWinner(socket: Socket, io:Server, board: Board, winner: string) {
    const winnerId = board.symbols[socket.id] === winner ? socket.id : board.user1 === socket.id ? board.user2 : board.user1;
    const looserId = winnerId === board.user1 ? board.user2 : board.user1;

    console.log(winnerId)
    console.log(looserId)
    io.to(winnerId).emit("gameFinish", { result: result.winner });
    io.to(looserId).emit("gameFinish", { result: result.looser });
}

function checkDraw(board:Board) {
    for (let i = 0; i < board.board.length; i++) {
        for (let j = 0; j < board.board[i].length; j++) {
            if (board.board[i][j] === null) {
                return false;
            }
        }
    }
    return true;
}