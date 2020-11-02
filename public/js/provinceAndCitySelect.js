$(function(){
   //一进入页面立马渲染城市和地区
            var city_str = '';
            for(var i = 0; i < provinceArr.length; i++) {
                city_str += '<li class="index_mask_li" selectedIndex=' + i + '>' + provinceArr[i] + '</li>';
        
            }
            //放到相应的位置
            $(".index_mask_list_city").html(city_str);
        
            //省
            $("#index_mask_select_city").on("click", function(e) {
                $(".index_mask_list_city").css({ "display": "block" });
                //阻止默认事件
                stopPropagation(e);
            });
            //市
            $("#index_mask_select_area").on("click", function(e) {
                $(".index_mask_list_area").css({ "display": "block" });
                stopPropagation(e);
            });
            
            //省份点击select时进行选择(同时进行模拟,select的onchange事件)
            $(".index_mask_list_city li").on("click", function() {      
                $("#index_mask_select_area").html("市或区");
                var key_value = $(this).attr("selectedindex");
                $("#index_mask_select_city").html($(this).html());
                $(".index_mask_list_city").css({ "display": "none" });
                var html = '';
                $.each(cityArr[key_value], function(i, n) {
                    html += '<li class="index_mask_li" selectedIndex=' + i + '>' + n + '</li>';
        
                })
                $(".index_mask_list_area").html(html);
        
            });
            //市点击，赋值到相应位置，同时进行显示隐藏操作（li是新生成元素，需要使用事件委托进行书写）
            $(".index_mask_list_area").on("click", "li", function() {
                $("#index_mask_select_area").html($(this).html());
                //console.log($(this).html())
                $(".index_mask_list_area").css({ "display": "none" });
        
            });
            
            //点击空白处，下拉框收起
            $(document).bind("click", function() {
                $(".index_mask_list").css({ "display": "none" });
            });
            
            //阻止默认事件
            function stopPropagation(e) {
                if(e.stopPropagation) {
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true;
                }
            }    
})
