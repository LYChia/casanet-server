import { Config } from './models/config';
import { logger } from './utilities/logger';

const rowHttpPort = process.env.HTTP_PORT;
const rowHttpsPort = process.env.HTTPS_PORT;
const rowUserHttps = process.env.USE_HTTPS;
const rowNodeEnv = process.env.NODE_ENV;

let dataPath: string;
if (rowNodeEnv === 'test') {
    logger.info(`Runinig in 'test' environments`);
    dataPath = 'test-data';
} else {
    logger.info(`Runinig in 'prod' environments`);
    dataPath = 'data';
}

let httpPort: number;
if (!rowHttpPort) {
    logger.warn('There is no HTTP_PORT env var, using default port 80');
    httpPort = 80;
} else {
    httpPort = parseInt(rowHttpPort, 10);
}

let httpsPort: number;
if (!rowHttpsPort) {
    logger.warn('There is no HTTP_PORTS env var, using default port 443');
    httpsPort = 443;
} else {
    httpsPort = parseInt(rowHttpsPort, 10);
}

let useHttps: boolean;
if (!rowUserHttps) {
    logger.warn('There is no USE_HTTPS env var, using default, false');
    useHttps = false;
} else {
    useHttps = rowUserHttps.toLowerCase() !== 'false';
}

/** System configuration */
export const Configuration: Config = {
    http: {
        httpPort,
        httpsPort,
        useHttps,
    },
    requestsLimit: {
        maxRequests: 500,
        windowsMs: 30 * 60 * 1000,
    },
    data: {
        dataDirectory: dataPath,
    },
};
