interface User {
    boardId: string | null;
    findMatch: boolean;
}

export const USERS = new Map<string, User>();