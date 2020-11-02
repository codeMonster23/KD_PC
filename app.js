const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieConfig = require('./config/cookie.config');


// var routes = require('./routes/outputRouter');
const routerConfig = require('./config/router.config');

const ejsFunctions = require('./utility/ejsFunctions');

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 上线模式
// app.set('env', 'production');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images/common', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
//ejs工具类
app.locals.ejsFunctions = ejsFunctions;

app.use(session({
    secret: cookieConfig.secret.sessionSecret,
    resave: false,
    saveUninitialized: false,
    // name: 'kd.connect.sid',
    cookie: {
        maxAge: cookieConfig.kdSidMaxAge,
        // signed: true,
        // secure: false,
        secure: false,
        httpOnly: false,
        sameSite: false
    },
    rolling: false
}));

app.all('*', function(req, res, next) {
    /**解决Missing "Content-Security-Policy" header
     * Missing "X-Content-Type-Options" header
     * Missing "X-XSS-Protection" header导致Web 应用程序编程或配置不安全
     * **/
    // res.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
    res.setHeader("Access-Control-Allow-Methods", "POST, GET");//允许跨域的请求方式
    res.setHeader("Access-Control-Max-Age", "3600");//预检请求的间隔时间
    res.setHeader("Access-Control-Allow-Headers", "Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With,userId,token,Access-Control-Allow-Headers");//允许跨域请求携带的请求头
    res.setHeader("Access-Control-Allow-Credentials","true");//若要返回cookie、携带seesion等信息则将此项设置我true
    res.setHeader("strict-transport-security","max-age=16070400; includeSubDomains");//简称为HSTS。它允许一个HTTPS网站，要求浏览器总是通过HTTPS来访问它
    // res.setHeader("Content-Security-Policy","default-src 'self'");//这个响应头主要是用来定义页面可以加载哪些资源，减少XSS的发生
    res.setHeader("X-Content-Type-Options","nosniff");//互联网上的资源有各种类型，通常浏览器会根据响应头的Content-Type字段来分辨它们的类型。通过这个响应头可以禁用浏览器的类型猜测行为
    res.setHeader("X-XSS-Protection","1; mode=block");//1; mode=block：启用XSS保护，并在检查到XSS攻击时，停止渲染页面
    res.setHeader("X-Frame-Options","SAMEORIGIN");//SAMEORIGIN：不允许被本域以外的页面嵌入；
    next();
});

// 路由配置已分离到config/router.config.js
routerConfig(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('errorView', {
            title: '知网文化',
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('errorView', {
        title: '知网文化',
        message: err.message,
        error: {}
    });
});


module.exports = app;