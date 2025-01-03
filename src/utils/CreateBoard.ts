import { v4 as uuidv4 } from 'uuid';
import { BOARDS, Player } from '../state/BoardState';
import { USERS } from '../state/UserState';

export function createBoard(userId1: string, userId2: string) {
    const boardId = uuidv4();
    BOARDS.set((boardId), {
        user1: userId1,
        user2: userId2,
        board: Array(3).fill(null).map(() => Array(3).fill(null)), 
        turn: Player.user1,
        symbols: {
            [userId1]: 'X',
            [userId2]: 'O'
        }
    })
    USERS.get(userId1)!.boardId = boardId;
    USERS.get(userId2)!.boardId = boardId;
    return boardId;
}