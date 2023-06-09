"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import RoomLink from "./room-link";
import UserCount from "@ai/components/user-count";
import { RoomInfo, User } from "@ai/app/server-actions";
import UserList from "./user-list";
import StartGame from "./start-game";
import { useStore } from "@ai/utils/store";
import { SocketContext } from "@ai/utils/socket-provider";

export default function Lobby({ roomInfo }: { roomInfo: RoomInfo }) {
  const router = useRouter();
  const { user } = useStore();
  const [players, setPlayers] = useState<User[]>(roomInfo.players);
  const [startGameLoading, setStartGameLoading] = useState(false);

  const socket = useContext(SocketContext);

  const handleRoomState = (roomInfo: RoomInfo) => {
    console.log("[ROOM INFO]", roomInfo);
    setPlayers(roomInfo.players);
  };

  const handleStartGame = useCallback(() => {
    console.log("RECEIVED START GAME");
    router.push(`/room/${roomInfo.code}/game`);
  }, [roomInfo.code, router]);

  const initiateStartGame = () => {
    setStartGameLoading(true);
    socket.emit("initiateGame", roomInfo.code);
  };

  const handleError = () => {
    setStartGameLoading(false);
  };

  useEffect(() => {
    socket.emit("connectToRoom", roomInfo.code);
    socket.on("roomState", handleRoomState);
    socket.on("startGame", handleStartGame);
    socket.on("error", handleError);

    return () => {
      socket.off("roomState", handleRoomState);
      socket.off("startGame", handleStartGame);
    };
  }, [handleStartGame, roomInfo.code, socket, user?.id]);

  return (
    <main className="flex min-h-screen flex-col justify-center">
      {/* <PlayerPresence code={room.code} /> */}
      <section className="container mx-auto px-4">
        <p className="mb-2 text-center text-xl">Your Room Link is</p>
        <RoomLink code={roomInfo.code} />
        <div className="absolute left-8 top-8">
          <UserCount count={players.length} />
        </div>
        {/* <ConnectionStatus code={params.code} /> */}
        <UserList players={players} />
        <StartGame
          players={players}
          code={roomInfo.code}
          onStartGame={initiateStartGame}
          loading={startGameLoading}
        />
      </section>
    </main>
  );
}
