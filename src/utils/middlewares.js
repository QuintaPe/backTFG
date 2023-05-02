const jwt = require("jsonwebtoken");
const { transformQuery } = require("./functions");
const jwtSecret = process.env.JWT_SECRET || "PalabraSecreta";

const authMiddleware = (req, res, next) => {
    const auth = req.headers['authorization']
    const token = auth && auth.split(' ')[1];
    if (!token) {
        res.status(401).send('Unauthorized');
    }
    const decode = jwt.verify(token, jwtSecret);
    req.user = decode.user;
    
    if (req.method === 'GET') {
        req.body = transformQuery(req.query);
    }
    next();
}

const errorsMiddleware = (err, req, res, next) => {
    if (err?.code == 11000) {
        return res.status(500).json({err});
    }
    if (err?.name == 'ValidationError') {
        return res.status(500).json(err);
    }
    if (err.name == 'Unauthorized') {
        return res.status(401).json({err});
    }
    return res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = {
    authMiddleware,
    errorsMiddleware,
}