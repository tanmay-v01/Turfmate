/** Structured JSON logs for Railway / log aggregators (no extra deps). */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function shouldLog(level) {
  const min = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  return LEVELS[level] >= (LEVELS[min] || LEVELS.info);
}

function write(level, msg, fields = {}) {
  if (!shouldLog(level)) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = {
  debug: (msg, fields) => write('debug', msg, fields),
  info: (msg, fields) => write('info', msg, fields),
  warn: (msg, fields) => write('warn', msg, fields),
  error: (msg, fields) => write('error', msg, fields),
};
