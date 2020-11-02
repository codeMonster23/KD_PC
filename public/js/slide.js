function slide(id,width,interval,speed){
	var $carousel = $(id);
	var $imageList = $carousel.find(".imageList");
	var $imageListLis = $carousel.find(".imageList li");
	var $leftBtn = $carousel.find(".leftBtn");
	var $rightBtn = $carousel.find(".rightBtn");
	// var $circles = $carousel.find(".circleList li");
	var imageAmount = $imageListLis.length;

	var nowimg = 0		

	$imageListLis.clone().appendTo($imageList);
	
	$rightBtn.click(function(){
		if(!$imageList.is(":animated")){
			nowimg ++;
			if(nowimg > imageAmount){
				nowimg = 1;
				$imageList.css("left",0);
			}
			changePictureAndChangeCircles();
		}
	})
	$leftBtn.click(function(){
		if(!$imageList.is(":animated")){
			nowimg --;
			if(nowimg < 0){
				nowimg = imageAmount - 1;
				$imageList.css("left",-width* imageAmount);
			}
			changePictureAndChangeCircles();
		}
	});

	function changePictureAndChangeCircles(){		
		$imageList.stop(true).animate({"left":-width * nowimg},speed);
		// if(nowimg == imageAmount){
		// 	$circles.eq(0).addClass("cur").siblings().removeClass("cur");
		// }else{
		// 	$circles.eq(nowimg).addClass("cur").siblings().removeClass("cur");
		// }
	}
	// var timer = setInterval(rightBtnFunc,interval);
	// $carousel.mouseenter(function(){clearInterval(timer);});
	// $carousel.mouseleave(function(){clearInterval(timer);timer = setInterval(rightBtnFunc,interval);});
 }