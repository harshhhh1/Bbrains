-- Update leaderboard_view to include collegeId and partition ranks by college
DROP VIEW IF EXISTS "leaderboard_view";

CREATE VIEW "leaderboard_view" AS
SELECT
  u."user_id" AS "userId",
  u."username",
  ud."first_name" AS "firstName",
  ud."last_name" AS "lastName",
  ud."avatar",
  u."college_id" AS "collegeId",
  COALESCE(x."xp", 0) AS "totalXp",
  COALESCE(w."balance", 0) AS "totalPoints",
  RANK() OVER (PARTITION BY u."college_id" ORDER BY COALESCE(x."xp", 0) DESC) AS "xpRank",
  RANK() OVER (PARTITION BY u."college_id" ORDER BY COALESCE(w."balance", 0) DESC) AS "pointsRank"
FROM "user" u
LEFT JOIN "xp" x ON x."user_id" = u."user_id"
LEFT JOIN "wallet" w ON w."user_id" = u."user_id"
LEFT JOIN "user_details" ud ON ud."user_id" = u."user_id"
WHERE u."type" = 'student';
