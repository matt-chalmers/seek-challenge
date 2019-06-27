
import winston from 'winston';
import config from 'config';


const logger = winston.createLogger({
    level: config.logging.level,
    transports: []
});

const fileFormat = () => {
    return winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.json()
    );
};

const readableFileFormat = () => {
    return winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    );
};


if (config.logging.fileLogging) {
    // Write all logs error (and below) to `error.log`.
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            format: fileFormat(),
            level: 'error'
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/error-readable.log',
            format: readableFileFormat(),
            level: 'error'
        })
    );

    // Write to all logs with level `info` and below to `application.log`
    logger.add(
        new winston.transports.File({
            format: fileFormat(),
            filename: 'logs/application.log'
        })
    );
    logger.add(
        new winston.transports.File({
            format: readableFileFormat(),
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
