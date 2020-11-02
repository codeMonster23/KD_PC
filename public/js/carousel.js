$(function(){
    var $imagesLis = $(".carousel .images li");
    var $circlesLis = $(".circles li");
    var $descItem = $(".carousel .desc .item");
    var $pn = $(".c-direction");

    $(".no2 .mask").hide();

    var idx = 2;

    var JSONARR = (function(){
        var temp = [];
        $imagesLis.each(function(){
            temp.push({
                "left" : $(this).css("left"),
                "top" : $(this).css("top"),
                "width" : $(this).css("width"),
                "height" : $(this).css("height"),
                // "opacity" : $(this).css("opacity")
                "diplay" : $(this).css("display")
            });
        });
        return temp;
    })();

    //得到类名数组
    var classnameArr = (function(){
        var temp = [];
        $imagesLis.each(function(){
            temp.push($(this).attr("class"));
        });
        return temp;
    })();


    //定时器
    var timer = setInterval(rightBtnHandler,2000);
    $(".carousel").mouseenter(function(){clearInterval(timer);});
    $(".carousel").mouseleave(function(){clearInterval(timer);timer = setInterval(rightBtnHandler,2000);});

    function rightBtnHandler(){
        if($imagesLis.is(":animated")){
            return;
        }
        //左移动
        for(var i = 1 ; i < $imagesLis.length ; i++){
            $(".images li.no" + i).animate(JSONARR[i - 1] , 600);
        }
        $(".images li.no0").css(JSONARR[4]);

        //mask
        $(".images li.no3 .mask").fadeOut();
        $(".images li.no2 .mask").fadeIn();

        //类名数组的改变
        classnameArr.unshift(classnameArr.pop());
        $imagesLis.each(function(i) {
            $(this).attr("class",classnameArr[i]);
        });
        $(".images li.no4").css(JSONARR[4]);

        idx++;
        if(idx > $imagesLis.length - 1){
            idx = 0;
        }
        $circlesLis.eq(idx).addClass("cur").siblings().removeClass("cur");
        $descItem.eq(idx).addClass("cur").siblings().removeClass("cur");
    }

    //上一张 下一张点击事件

    $pn.click(function(){
        // 获取当前显示的图片索引
        var currentDis = $(".carousel .desc .cur");
        var curIndex = $(".carousel .desc .item").index(currentDis);

        if ($(this)[0].className === 'c-next c-direction') {
            classnameArr.unshift(classnameArr.pop());
            curIndex = (curIndex + 1)% $imagesLis.length;
        }
        if($(this)[0].className === 'c-prev c-direction'){
            classnameArr.push(classnameArr.shift());
            curIndex = (curIndex - 1)% $imagesLis.length;
        }

        // $imagesLis.animate({"width":100,"height":60,"left":200,"top":100,"opacity":0},400);

        setTimeout(function(){
            $imagesLis.each(function(i) {
                $(this).attr("class",classnameArr[i]);
            });

            for(var i = 0 ; i <= 4; i++){
                $(".no" + i).stop(true).animate(JSONARR[i],300);
            }

            $(".mask").show();
            $(".no2 .mask").hide();
        },40);

        $descItem.eq(curIndex).addClass("cur").siblings().removeClass("cur");
        idx = curIndex;
        // setInterval(rightBtnHandler,2000)
    })

});