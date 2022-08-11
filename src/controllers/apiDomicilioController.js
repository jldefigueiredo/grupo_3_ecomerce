const path = require("path");
const actions = require("../data/actions");
const session = require("express-session");
const db = require("../data/models");


let apiDomicilioController = {


getdomicilio: async (req, res) => {
    // let respuesta={mensaje:"ok"}
    // return res.send(respuesta);
    console.log("Funcionaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    let sesion = req.session;
    if (!isNaN(parseInt(req.params.id))) {
      let domicilio = await db.Domicilios.findOne({
        where: {
          idusuario: sesion.idusuario,
          iddomicilios: req.params.id,
        },
        include: [
          {
            association: "pais",
            attributes: ["PaisNombre"],
          },
          {
            association: "provincia",
            attributes: ["Provincia"],
          },
        ],
      });
      return res.send(domicilio);
    }
  },
 
  setdomicilio: async (req, res) => {
    const db = require("../data/models/");
    let sesion = req.session;

    const domicilio = await db.Domicilios.findOne({
      where: { idusuario: req.session.idusuario }
    })    
      
    if(req.body.setDefault === on) {

    }
    
      db.Domicilios.update({
        idpais: req.body.direccionPais ,
        idprovincia: req.body.direccionProvincia ,
        calle: req.body.direccionCalle ,
        altura: req.body.direccionAltura ,
        piso: req.body.direccionPiso ,
        depto: req.body.direccionDepto ,
        cp: req.body.direccionCp
      }, {where: { iddomicilio: req.body.codigoDomicilio, idusuario: req.session.idusuario }})
    

    return res.status(200).send("Ok")

  },

  setdefault: async (req, res) => {
    let sesion = req.session;

    const domicilio = await db.Domicilios.update({
      entregadefault: 0
    }, {
      where: { idusuario: sesion.idusuario }
    });

    const domiciliodefault = await db.Domicilios.update({
      entregadefault: 1
    }, {
      where: { idusuario: sesion.idusuario, iddomicilios: req.body.iddomicilio }
    });
    
    res.status(200).send("Ok");

  },
  createdomicilio: (req, res) => {
    return null
  }
  
}

module.exports = apiDomicilioController