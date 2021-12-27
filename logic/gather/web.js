module.exports = (app, auth) => {
    app.get(`/gather/avatar`, (req, res) => {
        res.render("gather/avatar", { title: 'Avatar Viewer'});
    });
}
