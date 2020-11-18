var express = require('express');
const { token } = require('morgan');
var router = express.Router();
const {Users} = require('../modules/orm');
const {logsUsers} = require('../modules/orm');
const {egUsers} = require('../modules/orm');
const {DatosConexion} = require('../modules/orm');
const {generarToken} = require('../modules/orm/models/jwt');
const {validarToken} = require('../modules/orm/models/jwt');
const { networkInterfaces } = require('os');


const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                        results[name] = [];
            }

            results[name].push(net.address);
        }
    }
}



router.post("/users/:legajo/:clave/:tipo", async (req, res)=>
{
    const user = Users.build(
        {
            legajo: req.params.legajo,
            clave: req.params.clave,
            tipo: req.params.tipo
        })

    const data = DatosConexion.build(
        {
            ip: results.Ethernet[0],
            ruta: req.path,
            metodo: req.method,
            usuario: req.params.legajo
        });
        
        await data.save();

    try
    {
        const respuesta = await user.save();
        res.json({code: res.statusCode, data:respuesta});
    }
    catch(e)
    {
        res.json({code: res.statusCode, data: e})
    }

});

router.post("/login/:legajo/:clave", async (req, res, next)=>
{
    try
    {
        const user =await Users.findAll(
            {
                where:
                {
                    legajo: req.params.legajo,
                    clave: req.params.clave
                }
            })

        const data = DatosConexion.build(
            {
                ip: results.Ethernet[0],
                ruta: req.path,
                metodo: req.method,
                usuario: req.params.legajo
            });
        
            await data.save();

        let jwt = generarToken(JSON.stringify(user));

        res.json({code: res.statusCode, data: jwt});
    }
    catch(e)
    {
        res.json({code: res.statusCode, data: e})
    }

});

router.put("/ingreso/:jwt", async (req, res)=>
{
    try
    {
        let tokenValido = validarToken(req.params.jwt);
        if(tokenValido)
        {
            let legajo = tokenValido.data[0].legajo;

            const ingreso =await logsUsers.findOne(
                {
                    where:
                    {
                        legajo: legajo
                    }
                });

            let respuesta = "Ya habias ingresado, bienvenido nuevamente!!";  

            if(ingreso == null)
            {
                respuesta = "Ingresas por primera vez, Bienvenido!";
            }

            const user = logsUsers.build(
                {
                    legajo: legajo,
                });

            await user.save();

            const data = DatosConexion.build(
                {
                    ip: results.Ethernet[0],
                    ruta: req.path,
                    metodo: req.method,
                    usuario: req.params.legajo
                });
                
                await data.save();

            res.json({code: res.statusCode, data: respuesta});
        }
    }
    catch(e)
    {
        res.json({code: res.statusCode, data: e})
    }

});

router.put("/egreso/:jwt", async (req, res)=>
{
    try
    {
        let tokenValido = validarToken(req.params.jwt);
        if(tokenValido)
        {
            let legajo = tokenValido.data[0].legajo;

            const ingreso =await logsUsers.findOne(
                {
                    where:
                    {
                        legajo: legajo
                    }
                });

            let respuesta = "Hasta la proxima!!";  

            if(ingreso == null)
            {
                respuesta = "No habias ingresado!";
            }

            const data = DatosConexion.build(
                {
                    ip: results.Ethernet[0],
                    ruta: req.path,
                    metodo: req.method,
                    usuario: legajo
                });

            const user = egUsers.build(
                {
                    legajo: legajo,
                });

            await data.save();
            await user.save();

            res.json({code: res.statusCode, data: respuesta});
        }
    }
    catch(e)
    {
        res.json({code: res.statusCode, data: e})
    }

});

router.get("/ingreso/:jwt", async (req,res)=>
{
    try
    {
        let tokenValido = validarToken(req.params.jwt);
        if(tokenValido)
        {
            let legajo = tokenValido.data[0].legajo;
            const logs = await logsUsers.findAll(
                {
                    where:
                    {
                        legajo: legajo
                    }
                })

            const data = DatosConexion.build(
                {
                    ip: results.Ethernet[0],
                    ruta: req.path,
                    metodo: req.method,
                    usuario: legajo
                });

            await data.save();

            res.json({code: res.statusCode, data: logs})
        }
    }
    catch(e)
    {
        res.json({e})
    }
})

router.get("/ingresoAdmin/:jwt", async (req,res)=>
{
    try
    {
        let tokenValido = validarToken(req.params.jwt);
        if(tokenValido)
        {
            let legajo = tokenValido.data[0].legajo;
            let logs = [];
            let users = "";
            let log = "";
            
            if(tokenValido.data[0].tipo == "admin")
            {
                users = await Users.findAll({});
                
                for(const usuario of users)
                {
                    log = await logsUsers.findOne(
                        {
                            limit: 1,
                            where: 
                            {
                               legajo: usuario.legajo
                            },
                            order: [ [ 'createdAt', 'DESC' ]]
                        });
                    logs.push(log);
                }

                const data = DatosConexion.build(
                    {
                        ip: results.Ethernet[0],
                        ruta: req.path,
                        metodo: req.method,
                        usuario: legajo
                    });
                        
                await data.save();
            }

            res.json({code: res.statusCode, data: logs});
        }
    }
    catch(e)
    {
        res.json({e});
    }
})

//https://medium.com/devc-kano/basics-of-authentication-using-passport-and-jwt-with-sequelize-and-mysql-database-748e09d01bab
//https://gist.github.com/alexanmtz/e2e8bb14120f67f47995b9bcbcf26efa

/*router.put("/ingreso/:id", async (req,res)=>
{
    try
    {
    const respuesta = await algo.update(
        {

        },
        {
            where:
            {
                id: req.params.id
            }
        })
        res.json({respuesta})
    }
    catch(e)
    {
        res.json({e})
    }
})*/


/*router.delete("/:id", async (req,res)=>
{
    try
    {
    const respuesta = await algo.destroy(
        {
            where:
            {
                id: req.params.id
            }
        })
        res.json({respuesta})
    }
    catch(e)
    {
        res.json({e})
    }
})*/


module.exports = router;

