const pass = "claveloide";
const jwt = require("jsonwebtoken");

    const generarToken  = (valor)=>{
        
        let data = JSON.parse(valor)

        return jwt.sign({data}, pass)
    }
    
    const validarToken = (token)=>{
        try 
        {
            return jwt.verify(token, pass);
        } 
        catch (e) 
        {
            return e;
        }
        
    }

 module.exports.generarToken = generarToken;
 module.exports.validarToken = validarToken;
