import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db/db";
import {
  NewQuestion,
  User,
  generations,
  questions,
  votes,
} from "../../db/schema";
import { openai } from "../openai";

export const getQuestionById = async ({ id }: { id: number }) => {
  const question = await db
    .select()
    .from(questions)
    .where(eq(questions.id, id));

  return question[0];
};

export const generateAIQuestions = async ({
  playerCount,
}: {
  playerCount: number;
}) => {
  const originalPrompt = `Generate a list of ${playerCount} funny prompts for a game that's all one string with each prompt separated by a comma. For the game, players will respond to the prompt with AI generated images. Two players will respond to the prompt while the rest of the players vote on their favorite response/image. The targeted audience is between 15 and 30. The prompts should relate to pop culture, historical events, celebrities, brands, and dark humor. The players already know the rules, so do not specify that they have to generate an image. Some example prompts include: The uninvited wedding guest, The new challenger in Super Smash Bros, The newly discovered animal in Australia, The new British Museum exhibit,The creature hidden in IKEA, A unique vacation spot, A cancelled children's toy, The new Olympic sport`;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: originalPrompt }],
    });
    return response.data.choices[0].message?.content?.split(", ") ?? [];
  } catch (error) {
    if (error instanceof Error)
      console.error("Error trying to generate questions", error.message);
  }

  return [];
};

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export const shuffleArray = <T>(arr: T[]) => {
  for (let i = 0; i < arr.length - 2; i++) {
    const randNum = getRandomInt(i, arr.length);
    const temp = arr[i];
    arr[i] = arr[randNum];
    arr[randNum] = temp;
  }

  return arr;
};

export const assignQuestionsToPlayers = async ({
  gameId,
  round,
  players,
}: {
  gameId: number;
  round: number;
  players: User[];
}) => {
  const shuffledArray: User[] = shuffleArray([...players]);

  const generatedQuestions = await generateAIQuestions({
    playerCount: players.length,
  });

  if (shuffledArray.length !== generatedQuestions.length) {
    throw new Error(
      "The amount of shuffled users does not match the amount of generated questions"
    );
  }

  const normalizeQuestionText = (question: string) => {
    return question.trim().endsWith(".")
      ? question.trim().slice(0, question.length - 1)
      : question.trim();
  };

  const questionData: NewQuestion[] = generatedQuestions.map((question, i) => {
    return {
      text: normalizeQuestionText(question),
      gameId,
      round,
      player1: shuffledArray[i].id,
      player2:
        i === players.length - 1
          ? shuffledArray[0].id
          : shuffledArray[i + 1].id,
    };
  });

  const createdQuestions = await createQuestions(questionData);

  return createdQuestions;
};

export const createQuestions = async (data: NewQuestion[]) => {
  const newQuestions = await db.insert(questions).values(data).returning();

  return newQuestions;
};

export const createQuestion = async ({
  text,
  gameId,
  round,
  player1,
  player2,
}: NewQuestion) => {
  const newQuestion = await db
    .insert(questions)
    .values({
      text,
      gameId,
      round,
      player1,
      player2,
    })
    .returning();

  return newQuestion[0];
};

export const getQuestionVotes = async ({
  questionId,
}: {
  questionId: number;
}) => {
  const getAssociatedGenerations = await db
    .select()
    .from(generations)
    .where(and(eq(generations.questionId, questionId)));

  const questionVotes = await db
    .select()
    .from(votes)
    .where(
      inArray(
        votes.generationId,
        getAssociatedGenerations.map((generation) => generation.id)
      )
    );

  return questionVotes;
};
