import { Server, Socket } from "socket.io";
import { USERS } from "../state/UserState";
import { createBoard } from "../utils/CreateBoard";
import { BOARDS, Player } from "../state/BoardState";
import { isGameFinish } from "../utils/CheckWinner";

export const socketController = (socket: Socket , io:Server) => { 

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

    socket.on("cancelFindMatch", () => {
        USERS.get(socket.id)!.findMatch = false;
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
        console.log("Board is "+ board.board)

        socket.emit("moveMade", { row: data.row, col: data.col, symbol: board.symbols[socket.id] });
        
        const opponentId = board.turn === Player.user1 ? board.user2 : board.user1;
        socket.broadcast.to(opponentId).emit("moveMade", { row: data.row, col: data.col, symbol: board.symbols[socket.id] });
        
        if (!isGameFinish(socket, io, board)) {
            socket.emit("yourTurn", false);
            socket.broadcast.to(opponentId).emit("yourTurn", true);
            
            board.turn = board.turn === Player.user1 ? Player.user2 : Player.user1;
        }
    });

    socket.on("StartGame", (boardId: string) => {
        const board = BOARDS.get(boardId);
        if (!board) return;

        io.to(board.user1).emit("symbol", board.symbols[board.user1]);
        io.to(board.user2).emit("symbol", board.symbols[board.user2]);
        console.log(board.symbols[board.user1])
        console.log(board.symbols[board.user2])
        
        if (board.turn === Player.user1 && socket.id === board.user1) {
            socket.emit("yourTurn", true);
            socket.to(board.user2).emit("yourTurn", false);
        }
        else if (board.turn === Player.user2 && socket.id === board.user2) {
            socket.emit("yourTurn", true);
            socket.to(board.user1).emit("yourTurn", false);
        }
    })

    socket.on("askPlayAgain", (boardId:string) => {
        const board = BOARDS.get(boardId);
        if (!board) return;
        const opponentId = board.user1 === socket.id ? board.user2 : board.user1;

        io.to(opponentId).emit("wantToPlayAgain");
    })

    socket.on("yesPlayAgain", (boardId: string) => {
        const board = BOARDS.get(boardId);
        if (!board) return;
        
        board.symbols[board.user1] = board.symbols[board.user1] === "X" ? "O" : "X";
        board.symbols[board.user2] = board.symbols[board.user2] === "X" ? "O" : "X";
        board.board = Array(3).fill(null).map(() => Array(3).fill(null));
        board.turn = board.symbols[board.user1] === "X" ? Player.user1 : Player.user2;

        io.to(board.user1).emit("symbol", board.symbols[board.user1]);
        io.to(board.user2).emit("symbol", board.symbols[board.user2]);

        io.to(board.user1).emit("playAgain");
        io.to(board.user2).emit("playAgain");

        if(board.turn === Player.user1) {
            io.to(board.user1).emit("yourTurn", true);
            io.to(board.user2).emit("yourTurn", false);
        }
        else {
            io.to(board.user1).emit("yourTurn", false);
            io.to(board.user2).emit("yourTurn", true);
        }
    });

    socket.on("noPlayAgain", (boardId: string) => { 
        const board = BOARDS.get(boardId);
        if (!board) return;

        USERS.get(board.user1)!.boardId = null;
        USERS.get(board.user1)!.findMatch = false;
        USERS.get(board.user2)!.boardId = null;
        USERS.get(board.user2)!.findMatch = false;

        BOARDS.delete(boardId);

        io.to(board.user1).emit("noPlayAgain");
        io.to(board.user2).emit("noPlayAgain");
    })

    socket.on('disconnect', () => {
        console.log("User disconnected", socket.id)
        USERS.delete(socket.id)
    })
}