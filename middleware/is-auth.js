const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    // Extract the token from an incoming request 
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'verySecretStringThatShouldBeLong');
    } catch(err) {  // Incase of technical fail 
        err.statusCode = 500; 
        throw err; 
    }
    // Decoding worked - but check if undefined: i.e. it wasn't able to verify the token
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    } 
    // Token is valid in this case:
    req.userId = decodedToken.userId    // so that we can access the user.id elsewhere
    
    console.log(req.userId);
    next();
};