const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  //console.log("entro qui");
  try {
    //console.log("verificação autentication:"+ req.headers.authorization.split(" ")[1]);
    const token = req.headers.authorization.split(" ")[1];
    //console.log(token); 
    const decoded = jwt.verify(token, "GSJsqetMU6nw3");
    req.userData = decoded;
    //console.log(decoded);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Autenticação inválida"
    });
  }
  
};
