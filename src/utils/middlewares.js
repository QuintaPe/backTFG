const jwt = require("jsonwebtoken");
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
        req.query = Object.fromEntries(
            Object.entries(req.query).map(([key, val]) => {
                try {
                    return [key, JSON.parse(val)]
                } catch {
                    return [key, val]
                }
            })
        );
    }
    next();
}

const errorsMiddleware = (err, req, res, next) => {
    if (err?.name == 'ValidationError') {
        const errors = Object.values(err.errors).map(val => ({ path: val.path, message: val.message }));
        return res.status(422).json(errors);
    }
    if (err.statusCode && err.statusCode < 600) {
        return res.status(err.statusCode).json({err});
    }
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error', err });
}

module.exports = {
    authMiddleware,
    errorsMiddleware,
}