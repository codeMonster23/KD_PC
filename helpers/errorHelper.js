module.exports = {
    error404: function (req, res) {
        res.status(404);
        res.render('errorView', {
            title: '知网文化'
        });
    },
    error400: function (req, res, errorMessage = '参数错误') {
        // bad request
        // res.status(400);
        // res.json(errorMessage);
        res.send(errorMessage);
    },
    error500: function (req, res, errorMessage = '服务器网络不够稳定，请刷新重试或联系管理员') {
        // Internal Server Error
        // res.status(500);
        // res.json(errorMessage);
        res.send(errorMessage);
    },
    // 异步请求处理
    async: {
        success: function (res, data, errorCode = 0, errorMessage = '成功') {
            res.json({
                errorCode,
                errorMessage,
                data
            });
        },
        resFailed: function (res, errorMessage = '返回失败', data = {}, errorCode = -1) {
            res.json({
                errorCode,
                errorMessage,
                data
            });
        },
        reqFailed: function (res, errorMessage = '请求失败', data = {}, errorCode = -2) {
            res.json({
                errorCode,
                errorMessage,
                data
            });
        }
    }
};