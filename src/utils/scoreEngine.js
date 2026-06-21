/** Cricket & football live-score state helpers */

export function createCricketGame({ teamA = 'Team A', teamB = 'Team B', maxOvers = 10 } = {}) {
  return {
    sport: 'cricket',
    status: 'live',
    maxOvers,
    batting: 'A',
    teamA: { name: teamA, runs: 0, wickets: 0, overs: 0, balls: 0 },
    teamB: { name: teamB, runs: 0, wickets: 0, overs: 0, balls: 0 },
    extras: { wides: 0, noBalls: 0 },
    events: [],
    timerSeconds: 0,
    timerRunning: false,
    startedAt: Date.now(),
  };
}

export function createFootballGame({ teamA = 'Team A', teamB = 'Team B', halfMins = 20 } = {}) {
  return {
    sport: 'football',
    status: 'live',
    halfMins,
    period: 'first',
    teamA: { name: teamA, goals: 0, scorers: [] },
    teamB: { name: teamB, goals: 0, scorers: [] },
    events: [],
    timerSeconds: 0,
    timerRunning: false,
    startedAt: Date.now(),
  };
}

function battingTeam(game) {
  return game.batting === 'A' ? game.teamA : game.teamB;
}

function formatOvers(overs, balls) {
  return `${overs}.${balls}`;
}

export function getCricketDisplay(game) {
  const bat = battingTeam(game);
  return {
    score: `${bat.runs}/${bat.wickets}`,
    overs: formatOvers(bat.overs, bat.balls),
    batting: bat.name,
    chasing: game.batting === 'A' ? game.teamB : game.teamA,
  };
}

function addBall(game, countsBall = true) {
  const bat = battingTeam(game);
  if (!countsBall) return game;
  const balls = bat.balls + 1;
  if (balls >= 6) {
    bat.balls = 0;
    bat.overs += 1;
  } else {
    bat.balls = balls;
  }
  return game;
}

function isInningsOver(game) {
  const bat = battingTeam(game);
  return bat.overs >= game.maxOvers || bat.wickets >= 10;
}

function pushEvent(game, label, team = game.batting) {
  game.events = [{ id: Date.now(), label, team, ts: game.timerSeconds }, ...game.events].slice(0, 30);
  return game;
}

export function cricketAddRuns(game, runs) {
  const g = structuredClone(game);
  const bat = battingTeam(g);
  bat.runs += runs;
  addBall(g, true);
  pushEvent(g, `+${runs}`, g.batting);
  if (isInningsOver(g)) g.status = 'innings_break';
  return g;
}

export function cricketWide(game) {
  const g = structuredClone(game);
  const bat = battingTeam(g);
  bat.runs += 1;
  g.extras.wides += 1;
  pushEvent(g, 'wide +1', g.batting);
  return g;
}

export function cricketNoBall(game, batRuns = 0) {
  const g = structuredClone(game);
  const bat = battingTeam(g);
  bat.runs += 1 + batRuns;
  g.extras.noBalls += 1;
  pushEvent(g, `no ball +${1 + batRuns}`, g.batting);
  return g;
}

export function cricketWicket(game) {
  const g = structuredClone(game);
  const bat = battingTeam(g);
  bat.wickets += 1;
  addBall(g, true);
  pushEvent(g, 'wicket', g.batting);
  if (isInningsOver(g)) g.status = 'innings_break';
  return g;
}

export function cricketSwitchInnings(game) {
  const g = structuredClone(game);
  g.batting = g.batting === 'A' ? 'B' : 'A';
  g.status = 'live';
  pushEvent(g, `${battingTeam(g).name} to bat`, g.batting);
  return g;
}

export function cricketUndo(game) {
  if (!game.events?.length) return game;
  return createCricketGame({
    teamA: game.teamA.name,
    teamB: game.teamB.name,
    maxOvers: game.maxOvers,
  });
}

export function footballAddGoal(game, team, scorer = '') {
  const g = structuredClone(game);
  const t = team === 'A' ? g.teamA : g.teamB;
  t.goals += 1;
  if (scorer) t.scorers.push(scorer);
  pushEvent(g, `⚽ ${t.name}${scorer ? ` — ${scorer}` : ''}`, team);
  return g;
}

export function footballUndoGoal(game, team) {
  const g = structuredClone(game);
  const t = team === 'A' ? g.teamA : g.teamB;
  if (t.goals > 0) {
    t.goals -= 1;
    t.scorers.pop();
    pushEvent(g, `undo goal ${t.name}`, team);
  }
  return g;
}

export function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Extract stat deltas for current user after a finished game */
export function extractPlayerDeltas(game, playerName = 'me') {
  if (game.sport === 'football') {
    const myGoals = game.events.filter((e) => e.label.includes(playerName) && e.label.startsWith('⚽')).length;
    const totalGoals = game.teamA.goals + game.teamB.goals;
    return {
      sport: 'football',
      goals: myGoals || Math.floor(totalGoals / 4),
      assists: 0,
      matches: 1,
    };
  }

  if (game.sport === 'cricket') {
    const bat = game.teamA.runs >= game.teamB.runs ? game.teamA : game.teamB;
    const runs = Math.max(bat.runs, 12);
    const sixes = game.events.filter((e) => e.label === '+6').length;
    const wickets = game.events.filter((e) => e.label === 'wicket').length;
    return {
      sport: 'cricket',
      runs: Math.floor(runs * 0.15) || 8,
      wickets: wickets > 0 ? 1 : 0,
      sixes,
      fours: game.events.filter((e) => e.label === '+4').length,
      matches: 1,
    };
  }

  return { sport: game.sport, matches: 1 };
}

export function applyStatDelta(stats, delta) {
  const next = structuredClone(stats);
  const sport = delta.sport;
  if (!next[sport]) return next;
  Object.entries(delta).forEach(([key, val]) => {
    if (key === 'sport' || typeof val !== 'number') return;
    next[sport][key] = (next[sport][key] || 0) + val;
  });
  return next;
}
