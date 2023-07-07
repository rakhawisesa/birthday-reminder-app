module.exports = app => {
    const users = require("../controllers/index.controllers");
    const router = require("express").Router();

    router.get("/", users.index);

    router.post("/user", users.create);

    router.delete('/user/:id', users.delete);

    router.put('/user/:id', users.update);

    app.use('/', router);
}