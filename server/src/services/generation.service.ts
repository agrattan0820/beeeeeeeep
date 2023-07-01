import { and, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { NewGeneration, generations, questions } from "../../db/schema";

export async function getGameRoundGenerations({
  gameId,
  round,
}: {
  gameId: number;
  round: number;
}) {
  const gameRoundGenerations = await db
    .select()
    .from(generations)
    .leftJoin(questions, eq(questions.id, generations.questionId))
    .where(and(eq(questions.gameId, gameId), eq(questions.round, round)));

  return gameRoundGenerations;
}

export const createGeneration = async (data: NewGeneration) => {
  const newGeneration = await db
    .insert(generations)
    .values({
      imageUrl: data.imageUrl,
      questionId: data.questionId,
      text: data.text,
      userId: data.userId,
    })
    .returning();

  return newGeneration[0];
};
