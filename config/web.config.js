module.exports = {

    // 测试地址可用账户：liudong，密码：123456
    // 线上地址可用账户：biankeliudong,密码：123456
    /***********************************************数据服务器地址************************************************/
    // serverAddr: "http://192.168.107.112:8098/resource/api/command", // 本地地址
    // serverAddr: "http://192.168.51.97:8098/resource/api/command", // 本地地址
    serverAddr: "https://kdjk.cnki.net/resource/api/command", // 线上地址
    // serverAddr: "https://kdjk.cnki.net/resourcetest/api/command", // 线上测试地址地址

    /***********************************************账号服务器地址************************************************/

    // accountAddr: 'http://192.168.107.112:9987/resource/api/account',                          // 本地地址
    accountAddr: 'https://kdjk.cnki.net/passport/resource/api/account', // 线上地址

    /***********************************************支付服务器地址************************************************/

    paymentAddr: 'https://kdjk.cnki.net/pay/cnki/pay', // 线上地址
    paymentAddr1: 'https://kdjk.cnki.net/pay/cnki', // 线上地址
    // paymentAddr: 'http://192.168.51.95:10123/cnki/pay',                        // 刘东本地调试地址

    /***********************************************充值服务器地址************************************************/

    rechargeAddr: 'https://kdjk.cnki.net/recharge/general/recharge', // 线上地址

    /***********************************************电商订单状态查询地址************************************************/
    orderCheckAddr: 'https://kdjk.cnki.net/recharge/online/recharge/verify.action', // 线上地址
    // orderCheckAddr: 'http://192.168.107.112:10125/online/recharge/verify.action',                       // 本地地址

    /***********************************************会员地址************************************************/
    vipAddr: "https://kdjk.cnki.net/pay/cnki/vip", // 线上地址

    /***********************************************会员地址************************************************/
    fileAddr: "https://kdjk.cnki.net/resource/file", // 线上地址


    /***********************************************域名************************************************/
    domainName: 'http://192.168.51.83:8090',
    // domainName: 'https://zwwh.cnki.net',

    /***********************************************已购授权************************************************/
    drmWebService:'http://malldrm.cnki.net/drmmngr_mall/Service/DRMSvc.asmx?wsdl',
    drmRegMachineSvrIP:'malldrm.cnki.net'
};