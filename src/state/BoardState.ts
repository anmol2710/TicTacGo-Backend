export enum Player {
    user1 = "user1",
    user2 = "user2"
}

interface Board {
    user1: string;
    user2: string;
    board: string[][];
    turn: Player;
    symbols: {[userId:string]:string};
}

export const BOARDS = new Map<string, Board>();