import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");
    try {
        if(authHeader) {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            req.user =  decoded;
            next();
        } else {
            res.status(401).json({ error: "Unauthorized" });
        }
    }catch(err){
        res.status(401).json({ error: "Unauthorized" });
    }
}