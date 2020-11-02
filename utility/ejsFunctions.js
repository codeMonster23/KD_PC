var moment = require('moment');

module.exports = {
    // 格式化时间
    dateFormat: function (date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    },
    // 格式化时间
    dateFormatBySetting: function (date, format) {
        return moment(date).format(format);
    },
    dateFormatFromNow: function (date) {
        return moment(date).fromNow();
    },
    //时间T为分隔符
    arrayParseByT: function (str) {
        return str.split("T");
    },
    //时间字符串取时分
    sliceTime: function (str) {
        return str.slice(0, 5);
    },
    // 以空格为分隔符的字符串转化为数组
    arrayParseByBlank: function (str) {
        return str.split(" ");
    },
    // 以两个英文分号为分隔符的字符串转化为数组
    arrayParseBySemi: function (str) {
        return str.split(";");
    },
    //以井号分隔符的字符串转化为数组
    arrayParseByPound: function (str) {
        return str.split("#");
    },
    //去掉字符串中的井号
    deletePound: function (str) {
        return str.replace(/#/g, "");
    },
    //vip判断包年包月截取标题后四个字符
    judgeVip: function (str) {
        var strLength = str.length;
        return str.substring(strLength - 4, strLength);
        ;
    },
    //金额强制保留小数点后两位
    returnFloat: function (value) {
        var value = Math.round(parseFloat(value) * 100) / 100;
        var s = value.toString().split(".");
        if (s.length == 1) {
            value = value.toString() + ".00";
            return value;
        }
        if (s.length > 1) {
            if (s[1].length < 2) {
                value = value.toString() + "0";
            }
            return value;
        }
    },
    // 关键词转数组
    // 分隔符包括两个分号，一个分号，冒号，逗号，中文逗号，两个空格，一个空格
    stringToArray: function (str) {
        if (str.trim().length) {
            if (str.indexOf(';;') != -1) {
                return str.split(';;');
            } else if (str.indexOf(';') != -1) {
                return str.split(';');
            } else if (str.indexOf('  ') != -1) {
                return str.split('  ');
            } else if (str.indexOf(' ') != -1) {
                return str.split(' ');
            } else if (str.indexOf(',') != -1) {
                return str.split(',');
            } else if (str.indexOf('，') != -1) {
                return str.split('，');
            } else if (str.indexOf(':') != -1) {
                return str.split(':');
            } else if (str.indexOf('：') != -1) {
                return str.split('：');
            }
            return [str];
        } else {
            return '';
        }

    },

    // 搜索结果关键字标红 标示~#@ @#~ 转为<span class="cRed"></span> 或者
    // 直接转化关键字样式
    keywordStyleRed: function (str, prefix, postfix, keyword) {
        var prefixPosition = str.indexOf(prefix);
        var postfixPosition = str.indexOf(postfix);
        if (prefixPosition != -1 && postfixPosition) {
            var newStr = str.replace(new RegExp(prefix, 'g'), '<span class="cRed">');
            newStr = newStr.replace(new RegExp(postfix, 'g'), '</span>');
            return newStr;
        } else if (keyword) {
            var newStr = str.replace(new RegExp(keyword, 'g'), '<span class="cRed">' + keyword + '</span>');
            return newStr;
        } else {
            return str;
        }
    },

    // 替换 字符串中的标识 如~#@ @#~
    replace: function (str, mark1, mark2) {
        return str.replace(mark1, mark2);
    },

    // 替换 字符串中的标识 如~#@ @#~
    replaceByRegex: function (str) {
        return str.replace(/~#@/g, '').replace(/@#~/g, '');
    },

    ceil: function (value) {
        return Math.ceil(value);
    },
    floor: function (value) {
        return Math.floor(value);
    },
    encodeURL: function (str) {
        return encodeURI(str);
    },
    decodeURL: function (str) {
        return decodeURI(str);
    },
    substring: function (str, start, end) {
        return str.substring(start, end);
    },
    typeof: function (obj) {
        return typeof(obj);
    },
    // 将作品分类code转化为作品页面x/y/z
    workCodeParseToCoord: function (workCode) {
        var coord = {
            x: -1,
            y: -1,
            z: -1
        }
        var letterStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (workCode && workCode.length >= 1) {
            // 一级分类
            coord.x = letterStr.indexOf(workCode.substring(0, 1));
        }
        if (workCode.length >= 3) {
            // 二级分类
            coord.y = parseInt(workCode.substring(1, 3)) - 1;
        }
        if (workCode.length == 5) {
            // 三级分类
            coord.z = parseInt(workCode.substring(3)) + 1; // 下拉列表原因需要+1
        }
        return coord;
    },
    // 限制输出字数
    limitWordCount: function (str, num) {
        if (str) {
            if (num > 0) {
                return str.substring(0, num);
            } else {
                return str;
            }
        }
    },
    // 过滤关键字后的数字，如 历史名人:1234 变为 历史名人
    filterKeyword: function (keyword) {
        var index = keyword.indexOf(':');
        if (index != -1) {
            return keyword.substring(0, index);
        } else {
            return keyword;
        }
    },
    //去除前后空格
    trim: function (str) {
        return str.trim();
    },
    // 用户名为电话号码或者邮箱时候加密显示
    // 电话号码显示为：185****1234
    // 邮箱显示为：s****r@sina.com
    encryptEmailOrPhone: function (target) {
        let phonePattern = /(12\d|13\d|14\d|15\d|16\d|17\d|18\d|19\d)\d{8}/g;
        let emailPattern = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/g;
        if (phonePattern.test(target)) {
            let newTarget = '';
            for (let i = 0; i < target.length; i++) {
                if (i >= 3 && i <= 6) {
                    newTarget += '*';
                } else {
                    newTarget += target[i];
                }
            }
            target = newTarget;
        } else if (emailPattern.test(target)) {
            let newTarget = '';
            for (let i = 0; i < target.length; i++) {
                if (i >= 1 && i <= 4) {
                    newTarget += '*';
                } else {
                    newTarget += target[i];
                }
            }
            target = newTarget;
        }
        return target;
    },

    // 时间毫秒数转化为年月日，
    // time毫秒数
    // 返回值例如5年4月3天2小时1分34秒
    timeToDate: time => {
        let day = parseInt(time / 1000 / 60 / 60 / 24);
        let hour = parseInt(time / 1000 / 60 / 60 % 24);
        let minute = parseInt(time / 1000 / 60 % 60);
        let second = parseInt(time / 1000 % 60);
        // return {
        //     day,
        //     hour,
        //     minute,
        //     second
        // }
        return day + '天' + hour + '小时' + minute + '分钟' + second + '秒';
    }
}
;