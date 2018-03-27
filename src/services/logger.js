import { createLogger, format, transports } from "winston";

const { combine, printf, timestamp, colorize } = format;

const logger = createLogger({
  format: combine(
    colorize(),
    timestamp(),
    printf(info => `[${info.timestamp}][${info.level}] ${info.message}`)
  ),
  transports: [new transports.Console()]
});

const log = (
  level,
  msg,
  tag = null,
  tags = tag && (Array.isArray(tag) ? tag : [tag]).filter(Boolean)
) =>
  logger.log(
    level,
    `${
      tags && tags.length ? tags.reduce((str, x) => `${str}[${x}]`, ``) : ""
    } ${msg}`
  );

export const info = (msg, tag) => log("info", msg, tag);
export const warn = (msg, tag) => log("warn", msg, tag);
export const error = (msg, tag) => log("error", msg, tag);
