const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers['authorization']
        if (!token) return res.status(401).json({ message: "Access denied" })
        else {
            const user = jwt.verify(token, process.env.JWT_SECRET_KEY)
            if (user) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "Invalid Token" })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error')
    }
}

module.exports = authenticateToken