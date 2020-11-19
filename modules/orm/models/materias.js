const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { validate } = require('../db');

const Materias = sequelize.define('materias',
{
    idMateria:
    {   
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type: DataTypes.STRING,
    },
    cuatrimestre:{
        type: DataTypes.INTEGER,
        validate:
        {
            min: 1,
            max: 4
        }
    },
    cupos:{
        type: DataTypes.INTEGER,
    }
},
{
});

Materias.sync({force: false});//Si esta en true te sobreescribe la tabla

module.exports = Materias;