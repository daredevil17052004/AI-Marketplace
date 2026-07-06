// MIDDLEWARE PRIMER:
// Middleware is a function that runs BETWEEN receiving a request and
// sending a response. It has access to req, res, and next().
// Calling next() passes control to the next middleware or route handler.
// Calling next(err) jumps to the error handler.
// Not calling next() at all means the request hangs forever - a common bug.

import { Request, Response, NextFunction } from "express";
import { AccessTokenPayload, verifyAccessToken } from "../lib/tokens.js";
import { UnauthorizedError } from "../lib/errors.js";


declare global{
    namespace Express{
        interface Request{
            user?: AccessTokenPayload;
        }
    }
}

export function requireAuth(
    req: Request,
    _res: Response,
    next: NextFunction
): void{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        next(new UnauthorizedError("No token provided"));
        return;
    }

    const token = authHeader.slice(7); // remove bearer prefix

    try{
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    }catch(err){
        next(err);
    }
}


export function requireAdmin(
    req: Request,
    _res: Response,
    next: NextFunction
): void{
    requireAuth(req, _res, (err) =>{
        if(err) return next(err);

        if(req.user?.role !== "admin"){
            return next(new UnauthorizedError("Admin access required"));
        }

        next();
    })
}

