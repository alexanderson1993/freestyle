-- Migration number: 0001 	 2025-03-19T19:14:20.934Z
create table "freestyle_collection"
  (
    "name" text not null primary key,
    "singleton" integer not null,
    "hidden" integer not null,
    "note" text,
    "archive_field" text references "freestyle_field" ("name"),
    "archive_value" text,
    "unarchive_value" text
  );

create table "freestyle_field"
  (
    "name" text not null primary key,
    "collection" text not null references "freestyle_collection" ("name"),
    "field" text not null,
    "special" text,
    "interface" text,
    "options" JSON,
    "note" text,
    "required" integer not null,
    "hidden" integer not null,
    "sort" integer
  );

