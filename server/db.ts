import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, gameAnswers, gameSessions, gameVisits, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function recordGameVisit(input: { visitorKey: string; userAgent?: string; referrer?: string; path?: string }) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(gameVisits).values({
    visitorKey: input.visitorKey,
    userAgent: input.userAgent ?? null,
    referrer: input.referrer ?? null,
    path: input.path ?? "/",
  });
  return result;
}

export async function createGameSession(input: {
  sessionKey: string;
  playerName: string;
  sector: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
  challenge: string;
  totalQuestions: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(gameSessions).values({
    sessionKey: input.sessionKey,
    playerName: input.playerName,
    sector: input.sector,
    difficulty: input.difficulty,
    challenge: input.challenge,
    totalQuestions: input.totalQuestions,
    status: "started",
  });
  return input.sessionKey;
}

export async function recordGameAnswer(input: {
  sessionKey: string;
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
  points: number;
  challenge: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(gameAnswers).values({
    sessionKey: input.sessionKey,
    questionId: input.questionId,
    selectedAnswer: input.selectedAnswer,
    correct: input.correct ? 1 : 0,
    points: input.points,
    challenge: input.challenge,
  });
  await db.update(gameSessions).set({
    answeredQuestions: sql`${gameSessions.answeredQuestions} + 1`,
    correctAnswers: sql`${gameSessions.correctAnswers} + ${input.correct ? 1 : 0}`,
    incorrectAnswers: sql`${gameSessions.incorrectAnswers} + ${input.correct ? 0 : 1}`,
    score: sql`${gameSessions.score} + ${input.points}`,
  }).where(eq(gameSessions.sessionKey, input.sessionKey));
  return true;
}

export async function completeGameSession(input: {
  sessionKey: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const accuracy = input.totalQuestions > 0 ? Math.round((input.correctAnswers / input.totalQuestions) * 100) : 0;
  await db.update(gameSessions).set({
    status: "completed",
    score: input.score,
    correctAnswers: input.correctAnswers,
    incorrectAnswers: input.incorrectAnswers,
    answeredQuestions: input.correctAnswers + input.incorrectAnswers,
    totalQuestions: input.totalQuestions,
    accuracy,
    completedAt: new Date(),
  }).where(eq(gameSessions.sessionKey, input.sessionKey));
  return { accuracy };
}

export async function getAnalyticsDashboard() {
  const db = await getDb();
  if (!db) return { totals: { visits: 0, uniqueVisitors: 0, sessions: 0, completedSessions: 0, answers: 0, correctAnswers: 0, averageAccuracy: 0, totalPoints: 0 }, recentSessions: [], recentVisits: [], sectors: [] };
  const [visitTotals, sessionTotals, answerTotals, recentSessions, recentVisits, sectors] = await Promise.all([
    db.select({ visits: sql<number>`count(*)`, uniqueVisitors: sql<number>`count(distinct ${gameVisits.visitorKey})` }).from(gameVisits),
    db.select({ sessions: sql<number>`count(*)`, completedSessions: sql<number>`sum(case when ${gameSessions.status} = 'completed' then 1 else 0 end)`, averageAccuracy: sql<number>`coalesce(avg(case when ${gameSessions.status} = 'completed' then ${gameSessions.accuracy} end), 0)`, totalPoints: sql<number>`coalesce(sum(${gameSessions.score}), 0)` }).from(gameSessions),
    db.select({ answers: sql<number>`count(*)`, correctAnswers: sql<number>`sum(${gameAnswers.correct})` }).from(gameAnswers),
    db.select().from(gameSessions).orderBy(desc(gameSessions.createdAt)).limit(30),
    db.select().from(gameVisits).orderBy(desc(gameVisits.createdAt)).limit(20),
    db.select({ sector: gameSessions.sector, players: sql<number>`count(distinct ${gameSessions.playerName})`, sessions: sql<number>`count(*)`, points: sql<number>`coalesce(sum(${gameSessions.score}), 0)`, accuracy: sql<number>`coalesce(avg(${gameSessions.accuracy}), 0)` }).from(gameSessions).groupBy(gameSessions.sector).orderBy(desc(sql`points`)),
  ]);
  return {
    totals: { ...visitTotals[0], ...sessionTotals[0], ...answerTotals[0] },
    recentSessions,
    recentVisits,
    sectors,
  };
}

export async function getPublicAnalyticsStats() {
  const db = await getDb();
  if (!db) return { uniqueVisitors: 0, completedSessions: 0, averageAccuracy: 0 };
  const [result] = await db.select({
    uniqueVisitors: sql<number>`count(distinct ${gameVisits.visitorKey})`,
  }).from(gameVisits);
  const [sessions] = await db.select({
    completedSessions: sql<number>`sum(case when ${gameSessions.status} = 'completed' then 1 else 0 end)`,
    averageAccuracy: sql<number>`coalesce(avg(case when ${gameSessions.status} = 'completed' then ${gameSessions.accuracy} end), 0)`,
  }).from(gameSessions);
  return { uniqueVisitors: result?.uniqueVisitors ?? 0, completedSessions: sessions?.completedSessions ?? 0, averageAccuracy: sessions?.averageAccuracy ?? 0 };
}

export async function getPublicLeaderboard() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    name: gameSessions.playerName,
    sector: gameSessions.sector,
    score: sql<number>`coalesce(sum(${gameSessions.score}), 0)`,
    level: sql<string>`max(${gameSessions.difficulty})`,
  }).from(gameSessions).where(eq(gameSessions.status, "completed")).groupBy(gameSessions.playerName, gameSessions.sector).orderBy(desc(sql<number>`coalesce(sum(${gameSessions.score}), 0)`)).limit(50);
}
