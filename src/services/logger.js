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

export default logger;
