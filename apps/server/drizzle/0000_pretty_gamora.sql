-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."TradeStatus" AS ENUM('NOT_PAY', 'WAIT_BUYER_PAY', 'TRADE_CLOSED', 'TRADE_SUCCESS', 'TRADE_FINISHED');--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WordBook" (
	"id" text PRIMARY KEY NOT NULL,
	"word" text NOT NULL,
	"phonetic" text,
	"definition" text,
	"translation" text,
	"pos" text,
	"collins" text,
	"oxford" text,
	"tag" text,
	"bnc" text,
	"frq" text,
	"exchange" text,
	"gk" boolean,
	"zk" boolean,
	"gre" boolean,
	"toefl" boolean,
	"ielts" boolean,
	"cet6" boolean,
	"cet4" boolean,
	"ky" boolean,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaymentRecord" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tradeNo" text,
	"outTradeNo" text NOT NULL,
	"amount" numeric(65, 30) NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"tradeStatus" "TradeStatus" DEFAULT 'NOT_PAY' NOT NULL,
	"sendPayTime" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CourseRecord" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"courseId" text NOT NULL,
	"isPurchased" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"paymentRecordId" text
);
--> statement-breakpoint
CREATE TABLE "Course" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"teacher" text NOT NULL,
	"url" text NOT NULL,
	"price" numeric(65, 30) NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WordBookRecord" (
	"id" text PRIMARY KEY NOT NULL,
	"wordId" text NOT NULL,
	"isMaster" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"address" text,
	"password" text NOT NULL,
	"avatar" text,
	"wordNumber" integer DEFAULT 0 NOT NULL,
	"dayNumber" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"lastLoginAt" timestamp(3),
	"bio" text,
	"isTimingTask" boolean DEFAULT false NOT NULL,
	"timingTaskTime" text DEFAULT '00:00:00' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CourseRecord" ADD CONSTRAINT "CourseRecord_paymentRecordId_fkey" FOREIGN KEY ("paymentRecordId") REFERENCES "public"."PaymentRecord"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CourseRecord" ADD CONSTRAINT "CourseRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CourseRecord" ADD CONSTRAINT "CourseRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "WordBookRecord" ADD CONSTRAINT "WordBookRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "WordBookRecord" ADD CONSTRAINT "WordBookRecord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."WordBook"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "WordBook_tag_idx" ON "WordBook" USING btree ("tag" text_ops);--> statement-breakpoint
CREATE INDEX "WordBook_word_idx" ON "WordBook" USING btree ("word" text_ops);--> statement-breakpoint
CREATE INDEX "WordBook_word_tag_idx" ON "WordBook" USING btree ("word" text_ops,"tag" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "PaymentRecord_outTradeNo_key" ON "PaymentRecord" USING btree ("outTradeNo" text_ops);--> statement-breakpoint
CREATE INDEX "PaymentRecord_tradeNo_idx" ON "PaymentRecord" USING btree ("tradeNo" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "CourseRecord_userId_courseId_key" ON "CourseRecord" USING btree ("userId" text_ops,"courseId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "WordBookRecord_userId_wordId_key" ON "WordBookRecord" USING btree ("userId" text_ops,"wordId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_phone_key" ON "User" USING btree ("phone" text_ops);
*/