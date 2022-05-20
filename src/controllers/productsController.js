const path = require("path");
const fs = require("fs");
const actions = require("../data/actions");
const { parse } = require("path");
const { Console } = require("console");
const session = require("express-session");

let productos = JSON.parse(fs.readFileSync("./src/data/productos.json"));

let productsController = {
  product: (req, res) => {
    let sesion=session;
    let productoSeleccionado;
    for (let i = 0; i < productos.length; i++) {
      for (let j = 0; j < productos[i].length; j++) {
        if (productos[i][j].id == parseInt(req.params.id)) {
          productoSeleccionado = productos[i][j];
        }
      }
    }

    res.render(path.resolve(__dirname, "../views/product.ejs"), {
      productos: productoSeleccionado,session: sesion
    });
  },

  create: (req, res) => {
    let sesion=session;
    res.render(path.resolve(__dirname, "../views/productCreate.ejs"),{session: sesion});
  },

  save: (req, res,next) => {
    let sesion=session;
    let nombreimagenOrig;
    let imagenesAdicionales = [];
    if (req.files.length>0) {
      req.files.forEach((element) => {
        if (element.fieldname === "imagenPrincipal") {
          nombreimagenOrig = "/img/" + element.filename;
        } else {
          imagenesAdicionales.push("/img/" + element.filename);
        }
      });
    }else{
      const error=new Error("Debe agregar al menos la imagen principal");
      error.HttpStatusCode=400;
      console.log("Debe agregar al menos la imagen principal");
      let mensaje={
        codigo:400,
        descripcion:'Debe ingresar una imagen principal',
      }
      res.status(400).render(path.resolve(__dirname, "../views/productCreate.ejs"),{mensaje:mensaje,session:sesion});
      return next(error);
     
    }
    let idMasAlto = 0;
    for (let i = 0; i < productos.length; i++) {
      for (let j = 0; j < productos[i].length; j++) {
        if (productos[i][j].id > idMasAlto) {
          idMasAlto = productos[i][j].id;
        }
      }
    }
    let productoNuevo = {
      id: idMasAlto + 1,
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      categoria: req.body.categoria,
      precio: req.body.precio,
      imagen: nombreimagenOrig,
      masImagenes: imagenesAdicionales,
      marca: "",
      comentarios: [],
      calificaciones: [],
    };
    switch (req.body.categoria) {
      case "tecnologia":
        productos[0].push(productoNuevo);
        break;
      case "moda":
        productos[1].push(productoNuevo);
        break;
      case "hogar":
        productos[2].push(productoNuevo);
        break;
      case "deportes":
        productos[3].push(productoNuevo);
        break;
      case "movilidad":
        productos[4].push(productoNuevo);
        break;
      case "ninios":
        productos[5].push(productoNuevo);
        break;
      default:
        break;
    }

    actions.addProduct(productos);
    
    res.status(200).redirect("/product/" + productoNuevo.id);
  },

  comentarios: (req, res) => {
    let comentarioNuevo = req.body.comentario;
    let calificacionNueva = req.body.calificacion;
    for (let i = 0; i < productos.length; i++) {
      for (let j = 0; j < productos[i].length; j++) {
        if (productos[i][j].id == parseInt(req.params.id)) {
          productos[i][j].comentarios.push(comentarioNuevo);
          productos[i][j].calificaciones.push(calificacionNueva);
        }
      }
    }
    actions.updateProduct(productos);

    res.redirect("/product/" + req.params.id);
  },

  pregunta: (req, res) => {
    let preguntaNueva = {
      usuario: "Cosme Fulanito",
      pregunta: req.body.pregunta,
    };

    console.log(preguntaNueva);

    for (let i = 0; i < productos.length; i++) {
      for (let j = 0; j < productos[i].length; j++) {
        if (productos[i][j].id == parseInt(req.params.id)) {
          if (productos[i][j].preguntas === undefined) {
            productos[i][j].preguntas = [];
          }
          productos[i][j].preguntas.push(preguntaNueva);
        }
      }
    }
    actions.updateProduct(productos);

    res.redirect("/product/" + req.params.id);
  },
  edit: (req, res) => {
    let productoSeleccionado;
    for (let i = 0; i < productos.length; i++) {
      for (let j = 0; j < productos[i].length; j++) {
        if (productos[i][j].id == parseInt(req.params.id)) {
          productoSeleccionado = productos[i][j];
        }
      }
    }
    res.render(path.resolve(__dirname, "../views/productEdit.ejs"), { producto: productoSeleccionado })
  }

};

module.exports = productsController;
