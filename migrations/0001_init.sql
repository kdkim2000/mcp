-- MCP Token Tracker — initial schema for D1
CREATE TABLE IF NOT EXISTS usage_logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL,
  model         TEXT    NOT NULL,
  input_tokens  INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  recorded_at   TEXT    NOT NULL,
  note          TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT    NOT NULL,
  date            TEXT    NOT NULL,
  submitted_at    TEXT    NOT NULL,
  rows_submitted  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(email, date)
);

CREATE VIEW IF NOT EXISTS daily_stats AS
SELECT
  date(recorded_at) AS date,
  email,
  model,
  SUM(input_tokens)                 AS input_tokens,
  SUM(output_tokens)                AS output_tokens,
  SUM(input_tokens + output_tokens) AS total_tokens
FROM usage_logs
GROUP BY date(recorded_at), email, model;
