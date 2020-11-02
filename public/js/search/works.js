/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/search/works.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/search/works.js":
/*!***********************************!*\
  !*** ./assets/js/search/works.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n$(function () {\n    var url = decodeURI(location.href);\n    var kd = url.substr(url.lastIndexOf('=') + 1);\n    var worksWrap = $('.worksWrap');\n    var worksList = worksWrap.find('.listWrap .list');\n    var num = worksWrap.find('.num strong');\n    var filter = $('.search-main .handle .filter');\n    var page = $('#sp-page');\n    var asideKdh = $('.search-main .aside .kdh');\n    var asidePeriod = $('.search-main .aside .period');\n    var asideBook = $('.search-main .aside .book');\n    var asideMicrobook = $('.search-main .aside .wk');\n    var worksType = $('#worksType');\n    var worksTypeToggle = $('#worksType').find('p');\n    var newOrHot = $('#newOrHot');\n    var worksCategory = $('#worksCategory');\n    var mediatype = parseInt($('#mediatype').val());\n\n    switch (mediatype) {\n        case 9:\n            worksTypeToggle.html('类型').attr('data-type', 9);\n            break;\n        case 2:\n            worksTypeToggle.html('图文').attr('data-type', 2);\n            break;\n        case 3:\n            worksTypeToggle.html('音频').attr('data-type', 3);\n            break;\n        case 4:\n            worksTypeToggle.html('视频').attr('data-type', 4);\n            break;\n        case 5:\n            worksTypeToggle.html('图集').attr('data-type', 5);\n            break;\n    }\n\n    getCollection();\n    createWorksDom('', '', '', mediatype);\n\n    function getCollection() {\n        var url = encodeURI('/search/getSearchResult?kd=' + kd);\n        $.ajax({\n            type: \"GET\",\n            url: url,\n            dataType: \"json\",\n            success: function success(response) {\n                if (response.code == 0) {\n                    var _response$data = response.data,\n                        mircbooklist = _response$data.mircbooklist,\n                        journallist = _response$data.journallist,\n                        bookllist = _response$data.bookllist,\n                        orglist = _response$data.orglist;\n\n                    createMicrobookDom(mircbooklist);\n                    createPeriodDom(journallist);\n                    createBookDom(bookllist);\n                    createKdhDom(orglist);\n                }\n            }\n        });\n    }\n    // 作品\n    function createWorksDom(pageNum, sort, categorycode, type) {\n        var pageNum = pageNum || 1;\n        var sort = sort || 'id'; //id最新,viewcount 热门\n        var type = type || 9;\n        var categorycode = categorycode || '';\n        var limit = 8;\n        var url = '/search/getSearchResult';\n        $.ajax({\n            type: \"GET\",\n            url: url,\n            data: {\n                kd: kd,\n                pageNum: pageNum,\n                limit: limit,\n                sort: sort,\n                type: type,\n                categorycode: categorycode\n            },\n            dataType: \"json\",\n            success: function success(response) {\n                if (response.code == 0) {\n                    switch (type) {\n                        case 9:\n                            var datalist = response.data.collectionlist;\n\n                            break;\n                        case 2:\n                            var datalist = response.data.goodessaylist;\n\n                            break;\n                        case 3:\n                            var datalist = response.data.audiolist;\n\n                            break;\n                        case 4:\n                            var datalist = response.data.videolist;\n\n                            break;\n                        case 5:\n                            var datalist = response.data.picslist;\n\n                            break;\n                    }\n                    var total = datalist.total,\n                        rows = datalist.rows;\n\n                    var str = '';\n                    if (rows && rows.length == 0) {\n                        num.html(0);\n                        worksList.html('<div class=\"blank\"></div>');\n                        page.html('');\n                        return;\n                    }\n                    num.html(total);\n                    for (var i = 0; i < rows.length; i++) {\n                        var intromemo = rows[i].intromemo.substr(0, 75);\n                        str += '<div class=\"item clearfix\">\\n                                    <a href=\"/detail/workDetail/' + rows[i].id + rows[i].mediatype + '\" target=\"_blank\" class=\"img left\"><img src=\"' + rows[i].coverpic + '\" width=\"250\" height=\"141\"><span class=\"i' + rows[i].mediatype + '\"></span></a>\\n                                    <div class=\"info left\">\\n                                        <h1><a href=\"/detail/workDetail/' + rows[i].id + rows[i].mediatype + '\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kd) + '</a></h1>\\n                                        <p>' + $.kd.keywordStyleRed(intromemo, '~#@', '@#~', kd) + '<a class=\"readMore\" target=\"_blank\" href=\"/detail/workDetail/' + rows[i].id + rows[i].mediatype + '\">...[\\u9605\\u8BFB\\u5168\\u6587]</a></p>\\n                                        <div class=\"bottom clearfix\">\\n                                            <a href=\"/kdh/home?orgid=' + rows[i].orgid + '\" target=\"_blank\" class=\"jg left\"><img src=\"' + rows[i].logopic + '\" width=\"22\" height=\"22\" align=\"top\">' + rows[i].orgname + '</a>\\n                                            <div class=\"right subinfo\">\\n                                                <a href=\"javascript:;\" class=\"view\">' + rows[i].viewcount + '</a>\\n                                            </div>\\n                                        </div>\\n                                    </div>\\n                                </div>';\n                    }\n                    worksList.html(str);\n                    var pageStr = $.kd.outputPager(total, limit, 5, pageNum);\n                    page.html(pageStr);\n                }\n            }\n        });\n    }\n    // 相关微刊\n    function createMicrobookDom(mircbooklist) {\n        var total = mircbooklist.total,\n            rows = mircbooklist.rows;\n\n        var str = '';\n        if (rows && rows.length == 0) {\n            asideMicrobook.hide();\n            return;\n        }\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 3) {\n                str += '<li>\\n                            <a href=\"/detail/microBookDetail?id=' + rows[i].id + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\" width=\"230\" height=\"102\"></a>\\n                            <p><a href=\"/detail/microBookDetail?id=' + rows[i].id + '\" target=\"_blank\">' + rows[i].title + '</a></p>\\n                        </li>';\n            }\n        }\n        asideMicrobook.find('.list').html(str);\n    }\n    // 相关期刊\n    function createPeriodDom(journallist) {\n        var total = journallist.total,\n            rows = journallist.rows;\n\n        var str = '';\n        if (rows && rows.length == 0) {\n            asidePeriod.hide();\n            return;\n        }\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 4) {\n                str += '<li>\\n                            <a href=\"/detail/periodDetail/' + rows[i].code + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\" width=\"90\" height=\"128\"></a>\\n                            <p class=\"p1\"><a href=\"/detail/periodDetail/' + rows[i].code + '\" target=\"_blank\">' + rows[i].name + '</a></p>\\n                            <p class=\"p2\">' + rows[i].lastestyear + '\\u5E74' + rows[i].lastestperiod + '\\u671F</p>\\n                        </li>';\n            }\n        }\n        asidePeriod.find('.list').html(str);\n    }\n    // 相关图书\n    function createBookDom(bookllist) {\n        var total = bookllist.total,\n            rows = bookllist.rows;\n\n        var str = '';\n        if (rows && rows.length == 0) {\n            asideBook.hide();\n            return;\n        }\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 4) {\n                str += '<li>\\n                        <a href=\"/detail/bookDetail/' + rows[i].sku + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\" width=\"90\" height=\"128\"></a>\\n                        <p class=\"p1\"><a href=\"/detail/bookDetail/' + rows[i].sku + '\" target=\"_blank\">' + rows[i].title + '</a></p>\\n                        <p class=\"p2\"><span>' + rows[i].bookauthor + '</p>\\n                    </li>';\n            }\n        }\n        asideBook.find('.list').html(str);\n    }\n    // 相关看典号\n    function createKdhDom(orglist) {\n        var total = orglist.total,\n            rows = orglist.rows;\n\n        var str = '';\n        if (rows && rows.length == 0) {\n            asideKdh.hide();\n            return;\n        }\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 3) {\n                str += '<li>\\n                            <a href=\"/kdh/home?orgid=' + rows[i].orgid + '\" target=\"_blank\" class=\"img left\"><img src=\"' + rows[i].logopic + '\"></a>\\n                            <div class=\"info left\">\\n                                <p class=\"p1\"><a href=\"/kdh/home/' + rows[i].orgid + '\" target=\"_blank\">' + rows[i].orgname + '</a></p>\\t\\n                                <p class=\"p2\">' + rows[i].memo + '</p>\\n                            </div>\\n                        </li>';\n            }\n        }\n        asideKdh.find('.list').html(str);\n    }\n    // 作品类型\n    worksCategory.find('li').on('click', function () {\n        var categorycode = $(this).attr('data-id');\n        $(this).parent().siblings('p').attr('data-id', categorycode);\n        createWorksDom('', '', categorycode, '');\n    });\n    // 作品类型\n    worksType.find('li').on('click', function () {\n        var categorycode = worksCategory.find('p').attr('data-id');\n        var type = parseInt($(this).attr('data-type'));\n        $(this).parent().siblings('p').attr('data-type', type);\n        console.log(type);\n        newOrHot.find('p').html('最新').attr('data-sort', 'id');\n        createWorksDom('', '', categorycode, type);\n    });\n    // 最新最热\n    newOrHot.find('li').on('click', function () {\n        var sort = $(this).attr('data-sort');\n        $(this).parent().siblings('p').attr('data-sort', sort);\n        var categorycode = worksCategory.find('p').attr('data-id');\n        var type = parseInt(worksType.find('p').attr('data-type'));\n        createWorksDom('', sort, categorycode, type);\n    });\n    // 页码\n    page.on('click', 'a', function () {\n        $('body,html').animate({ scrollTop: 0 }, 200);\n        var pageNum = $(this).attr('data-page');\n        var sort = newOrHot.find('p').attr('data-sort');\n        var categorycode = worksCategory.find('p').attr('data-id');\n        var type = parseInt(worksType.find('p').attr('data-type'));\n        createWorksDom(pageNum, sort, categorycode, type);\n    });\n});\n\n//# sourceURL=webpack:///./assets/js/search/works.js?");

/***/ })

/******/ });