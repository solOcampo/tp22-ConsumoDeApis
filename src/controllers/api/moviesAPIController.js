const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');

const axios = require('axios')


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesAPIController = {
    create: (req, res) => {
        Movies.create(
            {
                title: req.body.title,
                rating: +req.body.rating,
                awards: +req.body.awards,
                release_date: req.body.release_date,
                length: +req.body.length,
                genre_id: +req.body.genre_id
            }
        )
            .then(confirm => {

                let respuesta;
                if (confirm) {
                    respuesta = {
                        meta: {
                            status: 200,
                            message: 'Película creada con éxito',
                            url: 'api/movies/create'
                        },
                        data: confirm
                    }
                res.status(200).json(respuesta);
                } else {
                    respuesta = {
                        meta: {
                            status: 500,
                            message: 'No se logró crear la película',
                            url: 'api/movies/create'
                        },
                        data: confirm
                    }
                    res.status(500).json(respuesta);
                }
            })
            .catch(error => res.status(500).json('No se logró crear la película'))
    },
    update: (req, res) => {
        let movieId = +req.params.id;
        Movies.update(
            {
                title: req.body.title,
                rating: +req.body.rating,
                awards: +req.body.awards,
                release_date: req.body.release_date,
                length: +req.body.length,
                genre_id: +req.body.genre_id
            },
            {
                where: { id: movieId }
            })
            .then(confirm => {
                let respuesta;
                if (confirm) {
                    respuesta = {
                        meta: {
                            status: 200,
                            total: confirm.length,
                            message: 'La película se actualizó con éxito',
                            url: 'api/movies/update/:id'
                        },
                        data: confirm
                    }
                    res.status(200).json(respuesta);
                } else {
                    respuesta = {
                        meta: {
                            status: 500,
                            total: confirm.length,
                            message: 'No se logró actualizar la película',
                            url: 'api/movies/update/:id'
                        },
                        data: confirm
                    }
                    res.status(500).json(respuesta);
                }
            })
            .catch(error => res.status(500).json('No se logró actualizar la película'))
    },
    destroy: (req, res) => {
        let movieId = +req.params.id;
        Movies.destroy({ where: { id: movieId }}) // force: true es para asegurar que se ejecute la acción
            .then(confirm => {
                let respuesta;
                if (confirm) {
                    console.log('entro al IF');
                    respuesta = {
                        meta: {
                            status: 200,
                            //total: confirm.length,
                            message: 'La película se eliminó con éxito',
                            url: 'api/movies/destroy/:id'
                        },
                        data: confirm
                    }
                    console.log('RESPUESTA 200');
                    res.status(200).json(respuesta);
                } else {
                    console.log('entro al segundo if');
                    respuesta = {
                        meta: {
                            status: 500,
                            total: confirm.length,
                            message: 'No se logró eliminar la película',
                            url: 'api/movies/destroy/:id'
                        },
                        data: confirm
                    }
                    res.status(500).json(respuesta);
                }
            })
            .catch(error => res.status(500).json('No se logró eliminar la película'))

    },

    buscar: (req, res) => {
        let busqueda = req.body.titulo.split(' ').join('+')
        let response
        db.Movie.findOne({
            where: { title: req.body.titulo }
        })
            .then(resultado => {
                if (resultado!=null) {
                    response = {
                        meta: {
                            status: 200,
                            message: 'La película se halló en la base de datos de moviesDb'
                        },
                        data: resultado
                    }
                    res.status(200).json(response)
                } else {
                    axios.get('https://www.omdbapi.com/?apikey=79835df3&t=' + busqueda)
                        .then(apiMovie => {
                            if (apiMovie.data.Response === 'True') {
                                let movie = {
                                    title: apiMovie.data.Title,
                                    rating: apiMovie.data.imdbRating,
                                    awards: apiMovie.data.Awards,
                                    length: apiMovie.data.Runtime,
                                    release_date: apiMovie.data.Released
                                }
                                response = {
                                    meta: {
                                        status: 200,
                                        message: 'La película se halló en la base de datos de imdb'
                                    },
                                    data: movie
                                }
                                res.status(200).json(response)
                            } else {
                                response = {
                                    meta: {
                                        status: 500,
                                        message: `No se logró hallar la película ${req.body.titulo} en ninguna base de datos`
                                    }
                                }
                                res.status(500).json(response)
                            }
                        })
                }
            })
            .catch(errors => res.status(500).json(`No se pudo acceder a la informacion de la película ${req.body.titulo}`))
    }
}

module.exports = moviesAPIController;