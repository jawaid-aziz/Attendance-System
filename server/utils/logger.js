const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const LEVEL = LEVELS[process.env.LOG_LEVEL] || LEVELS.info;

const ts = () => new Date().toISOString();

const format = (level, args) => {
  const parts = args.map((a) => {
    if (a instanceof Error) return a.stack || a.message;
    if (typeof a === "string") return a;
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  });
  return `[${ts()}] ${level.toUpperCase()}: ${parts.join(" ")}`;
};

const log = (level, sink) => (...args) => {
  if (LEVELS[level] < LEVEL) return;
  sink(format(level, args));
};

module.exports = {
  debug: log("debug", console.log),
  info: log("info", console.log),
  warn: log("warn", console.warn),
  error: log("error", console.error),
};
