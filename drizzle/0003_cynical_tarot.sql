CREATE TABLE "PasskeyCredential" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"credentialId" text NOT NULL,
	"publicKey" json NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"transports" json,
	"deviceType" text,
	"backedUp" boolean DEFAULT false NOT NULL,
	"nickname" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	CONSTRAINT "PasskeyCredential_credentialId_unique" UNIQUE("credentialId")
);
