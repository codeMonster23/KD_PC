module.exports = function (req, res, viewModel, callback) {
    if (viewModel.user.name != null) {
        callback();
    } else {
        res.render('userCenter/loginView', {title: '登录', viewModel: viewModel});
    }
};