import { InferModel } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  code: text("code").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRooms = pgTable(
  "user_rooms",
  {
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    roomCode: text("room_code")
      .references(() => rooms.code)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    cpk: primaryKey(table.userId, table.roomCode),
  })
);

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  roomCode: text("room_code")
    .references(() => rooms.code)
    .notNull(),
  state: text("state").notNull(),
  round: integer("round").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id")
    .references(() => games.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  round: integer("round").notNull(),
  text: text("text").notNull(),
  imageUrl: text("image_url").notNull(),
  votedOn: boolean("voted_on").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  generationId: integer("generation_id")
    .references(() => generations.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export type Room = InferModel<typeof rooms>;
export type NewRoom = InferModel<typeof rooms, "insert">;
export type RoomInfo = {
  code: string;
  createdAt: Date;
  players: User[];
};

export type UserRoom = InferModel<typeof userRooms>;
export type NewUserRoom = InferModel<typeof userRooms, "insert">;

export type Question = InferModel<typeof questions>;
export type NewQuestion = InferModel<typeof questions, "insert">;

export type Game = InferModel<typeof games>;
export type NewGame = InferModel<typeof games, "insert">;

export type Generation = InferModel<typeof generations>;
export type NewGeneration = InferModel<typeof generations, "insert">;

export type Vote = InferModel<typeof votes>;
export type NewVote = InferModel<typeof votes, "insert">;
