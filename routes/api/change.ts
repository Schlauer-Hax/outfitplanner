import { HandlerContext } from "$fresh/server.ts";

const sockets: WebSocket[] = [];
export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const { response, socket } = Deno.upgradeWebSocket(_req);
  socket.onopen = async () => {
    sockets.push(socket);
    socket.send(await Deno.readTextFile("./data.json"));
  };
  socket.onmessage = async (e) => {
    await Deno.writeTextFile("./data.json", e.data);
    sockets.filter(fsocket => fsocket !== socket).forEach((socket) => socket.send(e.data));
  };
  socket.onclose = () => {
    const index = sockets.indexOf(socket);
    if (index > -1) {
      sockets.splice(index, 1);
    }
  };
  return response;
};
