import { Socket } from "socket.io";
import { USERS } from "../state/UserState";
import { createBoard } from "../utils/CreateBoard";
import { BOARDS, Player } from "../state/BoardState";
import { CheckWinner } from "../utils/CheckWinner";

export const socketController = (socket: Socket) => { 

    console.log("User connected", socket.id)
    USERS.set(socket.id ,{ boardId: null, findMatch: false });
    
    socket.on("findMatch", () => {
        
        USERS.get(socket.id)!.findMatch = true;

        USERS.forEach((user , socketId) => {
            if (USERS.get(socketId)!.findMatch && socketId !== socket.id  && user.boardId === null) {
                const boardId = createBoard(socket.id, socketId)
                socket.emit("matchFound", boardId)
                socket.to(socketId).emit("matchFound", boardId)
            }
        })
    })

    socket.on("makeMove", (data: { boardId: string, row: number, col: number }) => {
        const board = BOARDS.get(data.boardId);

        if (!board) return; 
        if (board.board[data.row][data.col] !== null) return; 

        if ((board.turn === Player.user1 && socket.id !== board.user1) || 
            (board.turn === Player.user2 && socket.id !== board.user2)) {
            return;
        }

        board.board[data.row][data.col] = board.symbols[socket.id];

        socket.emit("moveMade", { row: data.row, col: data.col, symbol: board.symbols[socket.id] });
        
        const opponentId = board.turn === Player.user1 ? board.user2 : board.user1;
        socket.broadcast.to(opponentId).emit("moveMade", { row: data.row, col: data.col, symbol: board.symbols[socket.id] });
        
        // CheckWinner();

        socket.emit("yourTurn", false);
        socket.broadcast.to(opponentId).emit("yourTurn", true);

        board.turn = board.turn === Player.user1 ? Player.user2 : Player.user1;
    });

    socket.on("StartGame", (boardId: string) => {
        console.log("StartGame", boardId)
        const board = BOARDS.get(boardId);
        console.log(board)
        if (!board) return;
        
        if (board.turn === Player.user1 && socket.id === board.user1) {
            socket.emit("yourTurn", true);
            socket.to(board.user2).emit("yourTurn", false);
        }
        else if (board.turn === Player.user2 && socket.id === board.user2) { 
            socket.emit("yourTurn", true);
            socket.to(board.user1).emit("yourTurn", false);
        }
    })

    socket.on('disconnect', () => {
        console.log("User disconnected", socket.id)
        USERS.delete(socket.id)
    })
}