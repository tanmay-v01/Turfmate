const db = require('../db');
const crypto = require('crypto');

function mapTournamentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    sport: row.sport,
    icon: row.icon,
    date: row.date,
    location: row.location,
    entryFee: row.entry_fee,
    prizePool: row.prize_pool,
    maxTeams: row.max_teams,
    registeredTeams: row.registered_teams,
    status: row.status,
    banner: row.banner,
    organizer: row.organizer,
    description: row.description,
    brackets: row.brackets ? JSON.parse(row.brackets) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function listTournaments() {
  const sql = `SELECT * FROM tournaments ORDER BY created_at DESC`;
  const rows = await db.allAsync(sql, []);
  return rows.map(mapTournamentRow);
}

async function getTournament(id) {
  const sql = `SELECT * FROM tournaments WHERE id = ?`;
  const row = await db.getAsync(sql, [id]);
  return mapTournamentRow(row);
}

async function createTournament(data) {
  const id = `t-${crypto.randomBytes(4).toString('hex')}`;
  const now = Date.now();
  const sql = `
    INSERT INTO tournaments (
      id, name, sport, icon, date, location, entry_fee, prize_pool, max_teams,
      registered_teams, status, banner, organizer, description, brackets,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    id,
    data.name,
    data.sport || 'football',
    data.icon || '🏆',
    data.date,
    data.location,
    data.entryFee || 0,
    data.prizePool || 0,
    data.maxTeams || 16,
    data.registeredTeams || 0,
    data.status || 'open',
    data.banner || '',
    data.organizer || '',
    data.description || '',
    data.brackets ? JSON.stringify(data.brackets) : null,
    now,
    now
  ];
  await db.runAsync(sql, params);
  return getTournament(id);
}

async function registerTeam(tournamentId) {
  const sql = `
    UPDATE tournaments 
    SET registered_teams = registered_teams + 1 
    WHERE id = ? AND registered_teams < max_teams
  `;
  const result = await db.runAsync(sql, [tournamentId]);
  if (result.changes === 0) {
    throw new Error('Tournament is full or not found');
  }
  return getTournament(tournamentId);
}

module.exports = {
  listTournaments,
  getTournament,
  createTournament,
  registerTeam
};
