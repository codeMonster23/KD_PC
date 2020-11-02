var express = require('express');
var router = express.Router();
var pcController = require('../controllers/pcController');

// 我的已购
router.get('/purchased', pcController.purchased);
// 我的收藏
router.get('/collected', pcController.collected);
// 单个类别收藏
router.get('/singleCollected', pcController.singleCollected);

router.get('/collectedDetail', pcController.collectedDetail);

// 我的关注
router.get('/followed', pcController.followed);

// 获取收藏的作品、微刊、文献等的数量
router.get('/collectedCounts', pcController.collectedCounts);

// 修改收藏夹名称
router.get('/modifyFolderName', pcController.modifyFolderName);

// 删除收藏夹
router.get('/deleteFolder', pcController.deleteFolder);

// 删除收藏夹
router.get('/deleteDoc', pcController.deleteDoc);

// 新建收藏夹
router.get('/createFolder', pcController.createFolder);

// 直接添加至收藏夹
router.get('/addToFolder', pcController.addToFolder);

// 转移至收藏夹
router.get('/moveToFolder', pcController.moveToFolder);

// 转移至收藏夹
router.get('/getCollectedFolders', pcController.getCollectedFolders);

// 转移至收藏夹
router.get('/transfer', pcController.transfer);

// 收藏夹详情页
router.get('/folderDetail', pcController.folderDetail);

// 我的收藏夹详情分类数据
router.get('/folderCollected', pcController.folderCollected);

// 获取已购的作品、微刊、文献等的数量
router.get('/purchasedCounts', pcController.purchasedCounts);

// 获取允许授权电脑数量
router.get('/getUserSysInfoCount', pcController.getUserSysInfoCount);

// 浏览历史
router.get('/history', pcController.showHistory);

// 获取我的足迹数据
router.get('/getHistory', pcController.getHistory);

// 获取我的足迹数据
router.get('/delHistory', pcController.delHistory);
module.exports = router;