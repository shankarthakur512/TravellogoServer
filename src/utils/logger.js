const LOG_WEIGHTS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const activeLevel = (process.env.LOG_LEVEL || "debug").toLowerCase();

const shouldLog = (level) =>
  (LOG_WEIGHTS[level] || LOG_WEIGHTS.info) >= (LOG_WEIGHTS[activeLevel] || LOG_WEIGHTS.info);

const safeSerialize = (value) => {
  if (value === undefined) {
    return "";
  }

  try {
    return ` ${JSON.stringify(value)}`;
  } catch (error) {
    return ` ${String(value)}`;
  }
};

const writeLog = (level, scope, message, meta) => {
  if (!shouldLog(level)) {
    return;
  }

  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${scope}] ${message}${safeSerialize(meta)}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const createLogger = (scope = "server") => ({
  debug: (message, meta) => writeLog("debug", scope, message, meta),
  info: (message, meta) => writeLog("info", scope, message, meta),
  warn: (message, meta) => writeLog("warn", scope, message, meta),
  error: (message, meta) => writeLog("error", scope, message, meta),
});
