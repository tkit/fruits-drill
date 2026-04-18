PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS drills (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drill_tags (
  drill_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (drill_id, tag_id),
  FOREIGN KEY (drill_id) REFERENCES drills(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_drills_created_at ON drills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drill_tags_drill_id ON drill_tags(drill_id);
CREATE INDEX IF NOT EXISTS idx_drill_tags_tag_id ON drill_tags(tag_id);
