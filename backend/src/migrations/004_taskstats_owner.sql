DROP TABLE IF EXISTS TaskStats;

CREATE TABLE IF NOT EXISTS TaskStats (
  id TEXT PRIMARY KEY,
  ownerUserId TEXT NOT NULL DEFAULT 'all',
  longestTitle TEXT NOT NULL,
  longestTitleLength INTEGER NOT NULL,
  biggestCapacity INTEGER NOT NULL,
  biggestCapacityTitle TEXT NOT NULL,
  upcomingEvents INTEGER NOT NULL,
  pastEvents INTEGER NOT NULL,
  byMonth TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
