import { blue, green, yellow, red, magenta, cyan, white, gray, cyanBright, blueBright, greenBright, magentaBright, yellowBright } from 'colorette';
import {Request, Response, NextFunction} from 'express';

const logger = (req: Request, res: Response, next: NextFunction) => {
    const methodColors: { [key: string]: any } = {
        'GET': cyan,
        'POST': yellowBright,
        'PUT': blueBright,
        'DELETE': red,
        'PATCH': magentaBright,
        'HEAD': greenBright
    };

    const methodColor = methodColors[req.method] || ((text: string) => text);
    const method = methodColor(req.method);
    const url = methodColor(req.url);
    const timestamp = magenta(new Date().toISOString());

    console.log(`[${timestamp}] ${method} ${url}`);

    if (Object.keys(req.query).length > 0) {
        console.log(yellow(`Query Params: ${JSON.stringify(req.query)}`));
    }

    const originalSend = res.send;
    res.send = (body: any) => {
        const statusCode = green(res.statusCode);
        const responseBody = gray(JSON.stringify(body));
        console.log(`[${timestamp}] ${statusCode} Response: ${responseBody}`);
        return originalSend.call(res, body);
    };

    next();
};

export default logger;
