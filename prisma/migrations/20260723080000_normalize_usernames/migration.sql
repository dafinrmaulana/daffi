UPDATE "users"
SET "username" = LOWER("username");

ALTER TABLE "users"
ADD CONSTRAINT "users_username_lowercase_check"
CHECK ("username" = LOWER("username"));
