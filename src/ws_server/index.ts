import { RawData, WebSocketServer } from "ws";
import { wsService } from "../services/wsService";
import { ExtWebSocket, WsEvent } from "../types/types";

export const wss = (port: number): void => {
  const wss = new WebSocketServer({ port }, () =>
    console.log(`Start static websocket server on the ${port} port!`)
  );

  wss.on("connection", (socket: ExtWebSocket) => {
    socket.on("message", async (data: RawData) => {
      try {
        const response: WsEvent = JSON.parse(data.toString());
        console.log("response", response);
        const { type } = response;

        wsService[type]?.(response, socket);
      } catch (err) {
        console.error(err);
      }
    });
  });
};
