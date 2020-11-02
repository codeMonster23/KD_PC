const indexRouter = require('./indexRouter');
const detailRouter = require('./detailRouter');
const literatureRouter = require('./literatureRouter');
const institutionRouter = require('./institutionRouter');
const kdhRouter = require('./kdhRouter');
const paymentRouter = require('./paymentRouter');
const userCenterRouter = require('./userCenterRouter');
const rechargeRouter = require('./rechargeRouter');
const personalCenterRouter = require('./personalCenterRouter');
const pcRouter = require('./pcRouter');
const searchRouter = require('./searchRouter');
const mallRouter = require('./mallRouter');
const commonRouter = require('./commonRouter');
module.exports = {
    indexRouter: indexRouter,
    detailRouter: detailRouter,
    literatureRouter: literatureRouter,
    kdhRouter: kdhRouter,
    institutionRouter: institutionRouter,
    mallRouter: mallRouter,
    paymentRouter: paymentRouter,
    userCenterRouter: userCenterRouter,
    rechargeRouter: rechargeRouter,
    personalCenterRouter: personalCenterRouter,
    pcRouter: pcRouter,
    searchRouter: searchRouter,
    commonRouter: commonRouter
};