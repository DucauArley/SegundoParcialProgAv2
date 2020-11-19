var express = require('express');
const { token } = require('morgan');
var router = express.Router();
const {Users} = require('../modules/orm');
const {Materias} = require('../modules/orm');
const {Notas} = require('../modules/orm');
const {Inscripciones} = require('../modules/orm');
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



router.post("/users", async (req, res)=>
{
    let email = req.body.email;
    let nombre = req.body.nombre;
    let clave = req.body.clave;
    let tipo = req.body.tipo;

    if(email != undefined && nombre != undefined && clave != undefined && tipo != undefined)
    {
        email = email.toLowerCase();
        nombre = nombre.toLowerCase();
        tipo = tipo.toLowerCase();


        if(email != "" && !/\s/.test(nombre) && clave.length >= 4 && (tipo == "admin" || tipo == "alumno" || tipo == "profesor"))
        {
            console.log(email);
            const user = Users.build(
            {
                email: email,
                nombre: nombre,
                clave: clave,
                tipo: tipo
            })

            const data = DatosConexion.build(
                {
                    ip: results.Ethernet[0],
                    ruta: req.path,
                    metodo: req.method
                });
                
            try
            {
                await data.save();
                const respuesta = await user.save();
                res.json({code: res.statusCode, data:respuesta});
            }
            catch(e)
            {
                res.json({code: res.statusCode, data: e})
            }
        }
        else
        {
            res.json({code:res.statusCode, data: "Uno de los atributos esta mal"});
        }
    }
    else
    {
        res.json({code:res.statusCode, data: "Falto uno o mas atributos"});
    }

});

router.post("/login", async (req, res)=>
{
    let email = req.body.email;
    let nombre = req.body.nombre;
    let clave = req.body.clave;

    if((email != undefined || nombre != undefined) && clave != undefined)
    {
        try
        {
            let idUsuario = ""
            let user = "";
            if(email != undefined)
            {
                email = email.toLowerCase();
                user =await Users.findAll(
                {
                    where:
                    {
                        email: email,
                        clave: clave
                    }
                })
                idUsuario = email;
            }
            else
            {
                nombre = nombre.toLowerCase();
                user =await Users.findAll(
                {
                    where:
                    {
                        nombre: nombre,
                        clave: clave
                    }
                })
                idUsuario = nombre;
            }

            const data = DatosConexion.build(
                {
                    ip: results.Ethernet[0],
                    ruta: req.path,
                    metodo: req.method,
                    usuario: idUsuario
                });
            
            await data.save();
            let jwt = "No se encontro el usuario"

            if(user != "")
            {
                jwt = generarToken(JSON.stringify(user));
            }
            

            res.json({code: res.statusCode, data: jwt});
        }
        catch(e)
        {
            res.json({code: res.statusCode, data: e})
        }
    }
    else
    {
        res.json({code: res.statusCode, data: "Falto uno o mas atributos"})
    }

});

router.post("/materia", async (req, res)=>
{
    let materia = req.body.materia;
    let cuatrimestre = req.body.cuatrimestre;
    let cupos = req.body.cupos;
    let tokenValido = validarToken(req.headers.token);

    console.log(materia);
    console.log(cuatrimestre);
    console.log(cupos);

    if(tokenValido)
    {
        let tipoUser = tokenValido.data[0].tipo;
        if(tipoUser == "admin")
        {
            if(materia != undefined && cuatrimestre != undefined && cupos != undefined)
            {
                if(materia != "" && (cuatrimestre == "1" || cuatrimestre == "2"  || cuatrimestre == "3" || cuatrimestre == "4"  ))
                {
                    const mat = Materias.build(
                    {
                        nombre: materia,
                        cuatrimestre: cuatrimestre,
                        cupos: cupos
                    })

                    const data = DatosConexion.build(
                        {
                            ip: results.Ethernet[0],
                            ruta: req.path,
                            metodo: req.method,
                            usuario: tokenValido.data[0].nombre
                        });
                        
                    try
                    {
                        await data.save();
                        const respuesta = await mat.save();
                        res.json({code: res.statusCode, data:respuesta});
                    }
                    catch(e)
                    {
                        res.json({code: res.statusCode, data: e})
                    }
                }
                else
                {
                    res.json({code:res.statusCode, data: "Uno de los atributos esta mal"});
                }
            }
            else
            {
                res.json({code:res.statusCode, data: "Falto uno o mas atributos"});
            }
        }
        else
        {
            res.json({code: res.statusCode, data: "Solo el admin puede realizar esta funcion"});
        }
    }
    else
    {
        res.json({code: res.statusCode, data: "El token no es valido"});
    }

});


router.post("/inscripcion/:idMateria", async (req, res)=>
{
    try
    {
        let mat = req.params.idMateria
        let tokenValido = validarToken(req.headers.token);
        if(tokenValido)
        {
            let tipoUser = tokenValido.data[0].tipo;
            if(tipoUser == "alumno")
            {
                const materia = await Materias.findOne(
                    {
                        where:
                        {
                            idMateria: mat
                        }
                    });

                let respuesta = "La materia a la que queres inscribirte no existe";  

                if(materia != null)
                {
                    let cuposMat = materia.getDataValue("cupos");
                    console.log(cuposMat);
                    if(cuposMat > 0)
                    {
                        /*Materia.update(
                        {
                            cupos: cuposMat -1
                        },
                        {
                            where:
                            {
                                idMateria: materia.idMateria
                            }
                        })*/

                        const ins = Inscripciones.build(
                            {
                                idMateria: mat,
                                idAlumno: tokenValido.data[0].nombre
                            });
        
                        respuesta = "Inscripcion realizada";
                        await ins.save();
                    }
                    else
                    {
                        respuesta = "No hay mas cupos para esta materia";
                    }
                }

                const data = DatosConexion.build(
                    {
                        ip: results.Ethernet[0],
                        ruta: req.path,
                        metodo: req.method,
                        usuario: tokenValido.data[0].nombre
                    });
                    
                    await data.save();

                res.json({code: res.statusCode, data: respuesta});
            }
            else
            {
                res.json({code: res.statusCode, data: "Solamente los alumnos pueden anotarse a las materias"});
            }
        }
        else
        {
            res.json({code: res.statusCode, data: "El token no es valido"});
        }
    }
    catch(e)
    {
        res.json({code: res.statusCode, data: e})
    }

});

/*router.put("/notas/:idMateria", async (req, res)=>
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

});*/

router.get("/inscripcion/:idMateria", async (req,res)=>
{
    try
    {
        let mat = req.params.idMateria;
        let tokenValido = validarToken(req.headers.token);
        if(tokenValido)
        {
            let tipoUsuario = tokenValido.data[0].tipo;
            if(tipoUsuario == "profesor" ||tipoUsuario == "admin")
            {
                const materias = await Inscripciones.findAll(
                    {
                        where:
                        {
                            idMateria: mat
                        }
                    })

                const data = DatosConexion.build(
                    {
                        ip: results.Ethernet[0],
                        ruta: req.path,
                        metodo: req.method,
                        usuario: tokenValido.data[0].nombre
                    });

                await data.save();

                res.json({code: res.statusCode, data: materias});
            }
            else
            {
                res.json({code: res.statusCode, data: "Los alumnos no pueden acceder a esta funcion"})
            }
        }
    }
    catch(e)
    {
        res.json({code: res.statusCode, data: e})
    }
})


router.get("/materia", async (req,res)=>
{
    try
    {
        let tokenValido = validarToken(req.headers.token);
        if(tokenValido)
        {
            let tipoUsuario = tokenValido.data[0].tipo;
            if(tipoUsuario == "alumno")
            {
                const materias = await Inscripciones.findAll(
                    {
                        where:
                        {
                            idAlumno: tokenValido.data[0].nombre
                        }
                    })

                const data = DatosConexion.build(
                    {
                        ip: results.Ethernet[0],
                        ruta: req.path,
                        metodo: req.method,
                        usuario: tokenValido.data[0].nombre
                    });

                await data.save();

                res.json({code: res.statusCode, data: materias});
            }
            else
            {
                res.json({code: res.statusCode, data: "Solo los alumnos pueden acceder a esta funcion"})
            }
        }
    }
    catch(e)
    {
        res.json({code: res.statusCode, data: e})
    }
})






/*router.get("/ingresoAdmin/:jwt", async (req,res)=>
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
})*/

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

