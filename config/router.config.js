var routes = require('../routes/outputRouter');

module.exports = function(app) {
    // 首页导航系列
    app.use('/', routes.indexRouter);
    // 详情页 图文、音视频、图集、微刊
    app.use('/detail', routes.detailRouter);
    // 文献库
    app.use('/literature', routes.literatureRouter);
    // 机构看典
    app.use('/institution', routes.institutionRouter);
    // 支付
    app.use('/payment', routes.paymentRouter);
    // 看典号
    app.use('/kdh', routes.kdhRouter);
    // 书刊商城
    app.use('/mall', routes.mallRouter);
    // 用户中心 登录、注册、个人中心
    app.use('/temp/userCenter', routes.userCenterRouter);
    // 支付
    app.use('/temp/recharge', routes.rechargeRouter);
    //个人中心
    app.use('/personalCenter', routes.personalCenterRouter);
    app.use('/pc', routes.pcRouter);
    // 综合搜索
    app.use('/search', routes.searchRouter);
    // 公共
    app.use('/common', routes.commonRouter);
};