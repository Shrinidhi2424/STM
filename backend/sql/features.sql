-- SQL features: views, triggers, procedures, functions, indexes

-- Audit table for PlayerStats
CREATE TABLE IF NOT EXISTS PlayerStatsAudit (
  AuditID INT AUTO_INCREMENT PRIMARY KEY,
  StatsID INT,
  PlayerID INT,
  Goals INT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: log inserts into PlayerStatsAudit
DROP TRIGGER IF EXISTS trg_stats_after_insert;
CREATE TRIGGER trg_stats_after_insert
AFTER INSERT ON PlayerStats
FOR EACH ROW
BEGIN
  INSERT INTO PlayerStatsAudit (StatsID, PlayerID, Goals) VALUES (NEW.StatsID, NEW.PlayerID, NEW.Goals);
END;

-- Views
CREATE OR REPLACE VIEW vw_player_aggregates AS
SELECT PlayerID, COUNT(*) AS Games, SUM(Goals) AS TotalGoals, AVG(Rating) AS AvgRating
FROM PlayerStats
GROUP BY PlayerID;

CREATE OR REPLACE VIEW vw_match_results AS
SELECT r.ResultID, r.MatchID, m.MatchDate, m.MatchTime, r.ScoreTeam1, r.ScoreTeam2,
       t1.TeamName AS Team1, t2.TeamName AS Team2
FROM Result r
LEFT JOIN MatchInfo m ON r.MatchID = m.MatchID
LEFT JOIN Team t1 ON m.Team1ID = t1.TeamID
LEFT JOIN Team t2 ON m.Team2ID = t2.TeamID;

CREATE OR REPLACE VIEW vw_top_scorers AS
SELECT p.PlayerID, p.PlayerName,
       IFNULL((SELECT SUM(Goals) FROM PlayerStats ps WHERE ps.PlayerID = p.PlayerID), 0) AS TotalGoals
FROM Player p;

-- Stored Procedure
DROP PROCEDURE IF EXISTS AddResult;
CREATE PROCEDURE AddResult(IN pMatchID INT, IN pScore1 INT, IN pScore2 INT, IN pWinner INT)
BEGIN
  INSERT INTO Result (MatchID, ScoreTeam1, ScoreTeam2, WinnerTeamID)
  VALUES (pMatchID, pScore1, pScore2, pWinner);
END;

-- User-defined Function
DROP FUNCTION IF EXISTS goals_per_game;
CREATE FUNCTION goals_per_game(pid INT) RETURNS DECIMAL(8,2) DETERMINISTIC
RETURN (
  SELECT IFNULL(AVG(Goals),0) FROM PlayerStats WHERE PlayerID = pid
);

-- Indexes (best-effort; errors ignored by the setup script)
CREATE INDEX idx_player_team ON Player(TeamID);
CREATE INDEX idx_stats_player ON PlayerStats(PlayerID);
