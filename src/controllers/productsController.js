const path = require("path");
const fs = require("fs");
const actions = require("../data/actions");
const { parse } = require("path");
const { Console } = require("console");
const session = require("express-session");

let productos = JSON.parse(fs.readFileSync("./src/data/productos.json"));

let productsController = {
  product: (req, res) => {
    let sesion = session;
    let db = require("../data/models/");
    const Op = require("Sequelize").Op;
    var datosPublicacion = {};
    var productoSeleccionado = parseInt(req.params.id);
    if (productoSeleccionado > 0) {
      db.Publicaciones.findOne({
        include: [
          {
            association: "usuarios",
            attributes: ["usuario"],
            required: true,
          },
        ],
        where: {
          idpublicacion: productoSeleccionado,
        },
      }).then(async (publicacion) => {
        if (publicacion) {
          datosPublicacion.publicacion = publicacion;
          const imagenes = await db.Imagenes.findAll({
            where: {
              idpublicacion: publicacion.idpublicacion,
            },
          });
          const calificacion = await db.Calificacion.findAll({
            where: {
              idpublicacion: publicacion.idpublicacion,
            },
          });
          const pregunta = await db.Pregunta.findAll({
            include: [
              {
                association: "usuarios",
                attributes: ["usuario"],
                required: true,
              },
              {
                association: "respuestas",
              },
            ],
            where: {
              idpublicacion: publicacion.idpublicacion,
            },
          });
          const categorias = await db.Categorias.findAll({
            where: {
              idcategoria: publicacion.idcategoria,
            },
          });
          const marca = await db.Marcas.findAll({
            where: { idmarca: publicacion.idmarca },
          });
          datosPublicacion.imagenes = imagenes;
          datosPublicacion.calificaciones = calificacion;
          datosPublicacion.pregunta = pregunta;
          datosPublicacion.categorias = categorias;
          datosPublicacion.marca = marca;
          console.log(datosPublicacion.marca[0].marca);
          return res.render(path.resolve(__dirname, "../views/product.ejs"), {
            datosPublicacion: datosPublicacion,
            session: req.session,
          });
        } else {
          return res.redirect("/");
        }
      });
    } else {
      return res.redirect("/");
    }
  },

  create: (req, res) => {
    res.render(path.resolve(__dirname, "../views/productCreate.ejs"), {
      session: req.session,
    });
  },

  save: (req, res, next) => {
    let sesion = session;
    let db = require("../data/models/");
    let nombreimagenOrig;
    let imagenesAdicionales = [];
    if (req.files.length > 0) {
      req.files.forEach((element) => {
        if (element.fieldname === "imagenPrincipal") {
          nombreimagenOrig = element.filename;
        } else {
          imagenesAdicionales.push(element.filename);
        }
      });
    } else {
      const error = new Error("Debe agregar al menos la imagen principal");
      error.HttpStatusCode = 400;
      console.log("Debe agregar al menos la imagen principal");
      let mensaje = {
        codigo: 400,
        descripcion: "Debe ingresar una imagen principal",
      };
      res
        .status(400)
        .render(path.resolve(__dirname, "../views/productCreate.ejs"), {
          mensaje: mensaje,
          session: req.session,
        });
      return next(error);
    }

    let productoNuevo = {
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      idcategoria: req.body.categoria,
      precio: req.body.precio,
      marca: req.body.marca,
      colores: req.body.color,
      idusuario: 1,
    };

    db.Publicaciones.create(productoNuevo);

    db.Publicaciones.findAll({
      order: [["idpublicacion", "DESC"]],
      limit: 1,
      attributes: ["idpublicacion"],
    }).then((idProductoNuevo) => {
      console.log(idProductoNuevo[0].idpublicacion);
      let imagenPrincipal = {
        imagen: nombreimagenOrig,
        imagenprincipal: 1,
        idpublicacion: idProductoNuevo[0].idpublicacion,
      };

      db.Imagenes.create(imagenPrincipal);

      for (let i = 0; i < imagenesAdicionales.length; i++) {
        let imagenesExtra = {
          imagen: imagenesAdicionales[i],
          idpublicacion: idProductoNuevo[0].idpublicacion,
        };
        db.Imagenes.create(imagenesExtra);
      }

      res.status(200).redirect("/product/" + imagenPrincipal.idpublicacion);
    });
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
    let sesion = req.session;
    let productoSeleccionado;
    for (let i = 0; i < productos.length; i++) {
      for (let j = 0; j < productos[i].length; j++) {
        if (productos[i][j].id == parseInt(req.params.id)) {
          productoSeleccionado = productos[i][j];
        }
      }
    }
    //return res.send(productoSeleccionado);
    res.render(path.resolve(__dirname, "../views/productEdit.ejs"), {
      producto: productoSeleccionado,
      session: sesion,
    });
  },
  editProduct: (req, res) => {
    // let sesion = req.session;
    if (req.files.length > 0) {
      req.files.forEach((element) => {
        if (element.fieldname === "imagenPrincipal") {
          nombreimagenOrig = "/img/" + element.filename;
        } else {
          imagenesAdicionales.push("/img/" + element.filename);
        }
      });
    } else {
      const error = new Error("Debe agregar al menos la imagen principal");
      error.HttpStatusCode = 400;
      console.log("Debe agregar al menos la imagen principal");
      let mensaje = {
        codigo: 400,
        descripcion: "Debe ingresar una imagen principal",
      };
    }
    console.log(req.files[0].filename);
    res.send(req.files[0].filename);
  },
  delete: (req, res) => {
    let sesion = req.session;
    let db = require("../data/models/");
    const Op = require("Sequelize").Op;
    
    if (req.params.id && !isNaN(req.params.id)) {
      const productoSeleccionado = parseInt(req.params.id);
      db.Publicaciones.update({visible: 0},{where: { idpublicacion: productoSeleccionado }});

      if (
        true
      ) {
        res
          .status(200)
          .send({ resultado: "ok", mensaje: "Producto eliminado" });
        return;
      } else {
        console.log(err);
        res.setatus(500).send({ resultado: "error", mensaje: err });
        return;
      }
    } else {
      res
        .status(403)
        .send({ resultado: "error", mensaje: "Producto no se pudo eliminar" });
      return;
    }
  },
};

module.exports = productsController;
