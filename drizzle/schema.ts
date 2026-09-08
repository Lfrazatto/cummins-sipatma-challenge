import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const gameVisits = mysqlTable("game_visits", {
  id: int("id").autoincrement().primaryKey(),
  visitorKey: varchar("visitorKey", { length: 96 }).notNull(),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  path: varchar("path", { length: 255 }).default("/").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gameSessions = mysqlTable("game_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionKey: varchar("sessionKey", { length: 96 }).notNull().unique(),
  playerName: varchar("playerName", { length: 120 }).notNull(),
  sector: varchar("sector", { length: 80 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["Fácil", "Médio", "Difícil"]).notNull(),
  challenge: varchar("challenge", { length: 40 }).notNull(),
  status: mysqlEnum("status", ["started", "completed", "abandoned"]).default("started").notNull(),
  totalQuestions: int("totalQuestions").default(0).notNull(),
  answeredQuestions: int("answeredQuestions").default(0).notNull(),
  correctAnswers: int("correctAnswers").default(0).notNull(),
  incorrectAnswers: int("incorrectAnswers").default(0).notNull(),
  score: int("score").default(0).notNull(),
  accuracy: int("accuracy").default(0).notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gameAnswers = mysqlTable("game_answers", {
  id: int("id").autoincrement().primaryKey(),
  sessionKey: varchar("sessionKey", { length: 96 }).notNull(),
  questionId: int("questionId").notNull(),
  selectedAnswer: int("selectedAnswer").notNull(),
  correct: int("correct").default(0).notNull(),
  points: int("points").default(0).notNull(),
  challenge: varchar("challenge", { length: 40 }).notNull(),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type GameVisit = typeof gameVisits.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type GameAnswer = typeof gameAnswers.$inferSelect;
