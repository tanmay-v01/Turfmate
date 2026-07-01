const db = require('../db/index');
const config = require('../lib/config');

// Reliability Engine runs periodically to assess player behavior and adjust trust scores
// It looks for completed bookings, no-shows, or user reports.

async function runReliabilityCheck() {
  console.log('🛡️ [ReliabilityEngine] Running scheduled trust score analysis...');
  try {
    const isPg = db.driver === 'postgres';
    // Find all player profiles
    const profiles = await db.getAll(`SELECT user_id, reliability_score FROM player_profiles`);
    
    for (const profile of profiles) {
      const userId = profile.user_id;
      let score = Number(profile.reliability_score) || 5.0;
      let originalScore = score;
      
      // Calculate adjustments (Mock logic: In a real scenario, this would query a "reports" or "no_show" table)
      // We will slowly regress scores back towards 5.0 if they are below, rewarding good behavior over time.
      if (score < 5.0) {
        score = Math.min(5.0, score + 0.1);
      }
      
      // We can also query completed bookings to give small boosts
      const recentBookings = await db.getAll(
        isPg 
          ? `SELECT count(*) as count FROM booking_roster WHERE user_id = $1 AND joined_at > $2` 
          : `SELECT count(*) as count FROM booking_roster WHERE user_id = ? AND joined_at > ?`,
        [userId, Date.now() - (7 * 24 * 60 * 60 * 1000)]
      );
      
      const count = recentBookings[0]?.count || 0;
      if (count > 0 && score >= 5.0) {
        // Small boost for active players, capped at 5.0 in the UI but could go slightly higher internally
        score = Math.min(5.5, score + (count * 0.05));
      }

      // If the score changed significantly, update it
      if (Math.abs(score - originalScore) >= 0.1) {
        await db.run(
          isPg 
            ? `UPDATE player_profiles SET reliability_score = $1, updated_at = $2 WHERE user_id = $3` 
            : `UPDATE player_profiles SET reliability_score = ?, updated_at = ? WHERE user_id = ?`,
          [score, Date.now(), userId]
        );
      }
    }
    
    console.log('🛡️ [ReliabilityEngine] Analysis complete.');
  } catch (err) {
    console.error('🛡️ [ReliabilityEngine] Error during analysis:', err.message);
  }
}

function start() {
  // Run once on startup, then every hour (in a real app, maybe daily at midnight)
  setTimeout(runReliabilityCheck, 5000); // delay startup check slightly
  setInterval(runReliabilityCheck, 60 * 60 * 1000); 
}

module.exports = { start, runReliabilityCheck };
