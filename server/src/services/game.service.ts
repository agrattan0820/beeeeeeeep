import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../../db/db";
import {
  NewGame,
  User,
  Vote,
  games,
  generations,
  questions,
  rooms,
  usersToGames,
  usersToRooms,
  users,
} from "../../db/schema";
import {
  getGameRoundGenerations,
  getSubmittedPlayers,
} from "./generation.service";
import { getVotesByGameRound } from "./vote.service";

export async function createGame({ code }: { code: string }) {
  const newGame: NewGame = {
    state: "START_GAME",
    roomCode: code,
    round: 1,
  };
  const createRoom = await db.insert(games).values(newGame).returning();

  return createRoom[0];
}

export async function getGameInfo({ gameId }: { gameId: number }) {
  const getGame = await db
    .select({
      game: games,
      room: rooms,
    })
    .from(games)
    .innerJoin(rooms, eq(rooms.code, games.roomCode))
    .where(eq(games.id, gameId));

  if (getGame.length === 0) {
    return null;
  }

  const players = (await db
    .select({
      id: users.id,
      nickname: users.nickname,
      createdAt: users.createdAt,
    })
    .from(usersToRooms)
    .innerJoin(users, eq(usersToRooms.userId, users.id))
    .where(eq(usersToRooms.roomCode, getGame[0].room.code))) as User[];

  return {
    game: getGame[0].game,
    room: {
      ...getGame[0].room,
      players,
    },
  };
}

export async function getLatestGameInfoByRoomCode({ code }: { code: string }) {
  const latestGames = await db
    .select({
      game: games,
      room: rooms,
    })
    .from(games)
    .innerJoin(rooms, eq(rooms.code, games.roomCode))
    .where(eq(games.roomCode, code))
    .orderBy(desc(games.createdAt));

  if (
    latestGames.length === 0 ||
    !latestGames[0].room ||
    !latestGames[0].game
  ) {
    return null;
  }

  const latestGame = latestGames[0];

  const players = (await db
    .select({
      id: users.id,
      nickname: users.nickname,
      createdAt: users.createdAt,
    })
    .from(usersToRooms)
    .innerJoin(users, eq(usersToRooms.userId, users.id))
    .where(eq(usersToRooms.roomCode, latestGame.room.code))) as User[];

  const gameQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.gameId, latestGame.game.id))
    .orderBy(asc(questions.round), asc(questions.id));

  const gameRoundGenerations = await getGameRoundGenerations({
    gameId: latestGame.game.id,
    round: latestGame.game.round,
  });

  let submittedPlayers: number[] = [];
  let votedPlayers: { user: User; vote: Vote }[] = [];

  if (gameRoundGenerations.length > 0) {
    submittedPlayers = getSubmittedPlayers({ gameRoundGenerations });
    votedPlayers = await getVotesByGameRound({
      gameId: latestGame.game.id,
      round: latestGame.game.round,
    });
  }

  return {
    game: latestGame.game,
    room: {
      ...latestGame.room,
      players,
    },
    questions: gameQuestions,
    submittedPlayers,
    votedPlayers,
  };
}

export async function updateGame({
  state,
  gameId,
  round,
}: {
  state: string;
  gameId: number;
  round: number;
}) {
  const updatedGame = await db
    .update(games)
    .set({ state, round })
    .where(eq(games.id, gameId))
    .returning();

  return updatedGame[0];
}

export async function getLeaderboardById({ gameId }: { gameId: number }) {
  const userListOrderedByPoints = await db
    .select({
      user: users,
      points: usersToGames.points,
    })
    .from(users)
    .innerJoin(usersToGames, eq(users.id, usersToGames.userId))
    .where(eq(usersToGames.gameId, gameId))
    .orderBy(desc(usersToGames.points));

  const winningUser = userListOrderedByPoints[0];

  const winningUserGenerations = await db
    .select({
      question: questions,
      generation: generations,
    })
    .from(generations)
    .innerJoin(questions, eq(generations.questionId, questions.id))
    .where(
      and(
        eq(generations.userId, winningUser.user.id),
        eq(questions.gameId, gameId)
      )
    );

  return {
    leaderboard: userListOrderedByPoints,
    winningGenerations: winningUserGenerations,
  };
}

export async function addUsersToGame({
  players,
  gameId,
}: {
  players: User[];
  gameId: number;
}) {
  const usersToGame = await db
    .insert(usersToGames)
    .values(
      players.map((player) => {
        return { userId: player.id, gameId };
      })
    )
    .returning();

  return usersToGame;
}
