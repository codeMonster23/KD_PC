function imgSize(image,w,h){
    //判断图片大小,中心显示
       image.each(function(){
         var iwidth=$(this).width()
         var iheight=$(this).height()
         var num1=iwidth/iheight, num2=w/h
         if(num1>num2){
            $(this).height("100%")    
         }
         else{$(this).width("100%") }
       })   
}
