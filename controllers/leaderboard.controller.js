// Define your leaderboard controller methods here

export const getLeaderboard = (req, res) => {
  res.status(200).send(`Get Leaderboard for category ${req.params.category} and time period ${req.params.timePeriod}`);
};