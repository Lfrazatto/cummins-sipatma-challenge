import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { clearGameRankings, completeGameSession, createGameSession, getAnalyticsDashboard, getPublicAnalyticsStats, getPublicLeaderboard, recordGameAnswer, recordGameVisit } from "./db";

const difficulty = z.enum(["Fácil", "Médio", "Difícil"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  analytics: router({
    recordVisit: publicProcedure.input(z.object({ visitorKey: z.string().min(8).max(96), userAgent: z.string().max(500).optional(), referrer: z.string().max(500).optional(), path: z.string().max(255).optional() })).mutation(({ input }) => recordGameVisit(input)),
    startSession: publicProcedure.input(z.object({ sessionKey: z.string().min(8).max(96), playerName: z.string().min(2).max(120), sector: z.string().min(1).max(80), difficulty, challenge: z.string().min(1).max(40), totalQuestions: z.number().int().min(0).max(100) })).mutation(({ input }) => createGameSession(input)),
    recordAnswer: publicProcedure.input(z.object({ sessionKey: z.string().min(8).max(96), questionId: z.number().int(), selectedAnswer: z.number().int().min(0).max(10), correct: z.boolean(), points: z.number().int().min(0).max(10000), challenge: z.string().min(1).max(40) })).mutation(({ input }) => recordGameAnswer(input)),
    completeSession: publicProcedure.input(z.object({ sessionKey: z.string().min(8).max(96), score: z.number().int().min(0), correctAnswers: z.number().int().min(0), incorrectAnswers: z.number().int().min(0), totalQuestions: z.number().int().min(0) })).mutation(({ input }) => completeGameSession(input)),
    publicStats: publicProcedure.query(() => getPublicAnalyticsStats()),
    publicLeaderboard: publicProcedure.query(() => getPublicLeaderboard()),
    dashboard: adminProcedure.query(() => getAnalyticsDashboard()),
    clearRankings: adminProcedure.mutation(() => clearGameRankings()),
  }),
});

export type AppRouter = typeof appRouter;
