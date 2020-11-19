const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { validate } = require('../db');

const Inscripciones = sequelize.define('inscripciones',
{
    idMateria:
    {   
        type: DataTypes.INTEGER,
    },
    idAlumno:{
        type: DataTypes.STRING,
    },
},
{
});

Inscripciones.sync({force: false});//Si esta en true te sobreescribe la tabla

module.exports = Inscripciones;