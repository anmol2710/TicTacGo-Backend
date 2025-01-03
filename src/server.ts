import express from "express"
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { socketController } from "./SocketController/socketController";

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get("/", (req:Request, res:any) => {
    return res.json({ message: "Hello World" })
})

io.on("connection", (socket) => {
    socketController(socket);
})

server.listen(3000, () => {
    console.log("Server is running on port 3000")
})