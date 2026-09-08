CREATE TABLE `game_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionKey` varchar(96) NOT NULL,
	`questionId` int NOT NULL,
	`selectedAnswer` int NOT NULL,
	`correct` int NOT NULL DEFAULT 0,
	`points` int NOT NULL DEFAULT 0,
	`challenge` varchar(40) NOT NULL,
	`answeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionKey` varchar(96) NOT NULL,
	`playerName` varchar(120) NOT NULL,
	`sector` varchar(80) NOT NULL,
	`difficulty` enum('Fácil','Médio','Difícil') NOT NULL,
	`challenge` varchar(40) NOT NULL,
	`status` enum('started','completed','abandoned') NOT NULL DEFAULT 'started',
	`totalQuestions` int NOT NULL DEFAULT 0,
	`answeredQuestions` int NOT NULL DEFAULT 0,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`incorrectAnswers` int NOT NULL DEFAULT 0,
	`score` int NOT NULL DEFAULT 0,
	`accuracy` int NOT NULL DEFAULT 0,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_sessions_sessionKey_unique` UNIQUE(`sessionKey`)
);
--> statement-breakpoint
CREATE TABLE `game_visits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorKey` varchar(96) NOT NULL,
	`userAgent` text,
	`referrer` text,
	`path` varchar(255) NOT NULL DEFAULT '/',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_visits_id` PRIMARY KEY(`id`)
);
