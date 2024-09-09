const jwt = require('jsonwebtoken')

module.exports=function authMiddleware (req,res,next){
    try {
        if(!req.headers.authorization){
            return res.status(401).send({
                success:false,
                message:"Authorization Header Missing!!"
            })
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded= jwt.verify(token,process.env.JWT_SECRET);

        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).send({
            success: false,
            message: "Invalid Token"
    })
}
}