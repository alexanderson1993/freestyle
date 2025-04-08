create table "freestyle_user" ("id" text not null primary key, "name" text, "email" text not null unique, "emailVerified" integer not null, "image" text, "createdAt" date not null, "updatedAt" date not null);

create table "freestyle_session" ("id" text not null primary key, "expiresAt" date not null, "token" text not null unique, "createdAt" date not null, "updatedAt" date not null, "ipAddress" text, "userAgent" text, "userId" text not null references "freestyle_user" ("id"));

create table "freestyle_account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "freestyle_user" ("id"), "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" date, "refreshTokenExpiresAt" date, "scope" text, "password" text, "createdAt" date not null, "updatedAt" date not null);

create table "freestyle_verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" date not null, "createdAt" date, "updatedAt" date);

create table "freestyle_passkey" ("id" text not null primary key, "name" text, "publicKey" text not null, "userId" text not null references "freestyle_user" ("id"), "credentialID" text not null, "counter" integer not null, "deviceType" text not null, "backedUp" integer not null, "transports" text, "aaguid" text, "createdAt" date);