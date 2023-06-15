import { Socket, io } from "socket.io-client";

export interface ServerToClientEvents {
  hello: (str: string) => void;
  message: (str: string) => void;
  error: (str: string) => void;
}

export interface ClientToServerEvents {
  // createHost: (
  //   data: { nickname: string },
  //   callback: (response: { host: User; room: Room }) => void
  // ) => void;
  connectToRoom: (code: string) => void;
  leaveRoom: (code: string) => void;
}

export const URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:8080" // TODO: change to API_URL
    : "http://localhost:8080";

// // export const useSocketInitializer = async (socket: Socket | null) => {
// //   useEffect(() => {
// //     if (!socket) {
// //       socket = io(URL);
// //     }
// //     if (socket) {
// //       socket.on("hello", helloMessages);
// //     }

// //     return () => {
// //       if (socket) {
// //         socket.off("hello", helloMessages);
// //       }
// //     };
// //   }, []);
// // };

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(URL);
