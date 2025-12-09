CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications ("userId", "createdAt" DESC) WHERE "readAt" IS NULL;
