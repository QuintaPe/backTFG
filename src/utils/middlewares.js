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

module.exports = {
    authMiddleware,
}