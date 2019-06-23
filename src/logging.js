
import winston from 'winston';
import config from 'config';


const logger = winston.createLogger({
    level: config.logging.level,
    transports: []
});

if (config.logging.fileLogging) {
    // Write all logs error (and below) to `error.log`.
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp(),
                winston.format.json()
            ),
            level: 'error'
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/error-readable.log',
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            ),
            level: 'error'
        })
    );

    // Write to all logs with level `info` and below to `application.log`
    logger.add(
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp(),
                winston.format.json()
            ),
            filename: 'logs/application.log'
        })
    );
    logger.add(
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            ),
            filename: 'logs/application-readable.log'
        })
    );
}

if (config.logging.consoleLogging) {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.simple()
            )
        })
    );
}

export {logger as default};
