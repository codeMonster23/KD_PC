// JavaScript Document
//多行文本框输入限制字数
function wordLimit(selector,counts){
	selector.keyup(function(){
  							 var len = $(this).val().length;
  							 if(len >counts){
    					    //$(this).val($.trim($(this).val()).substring(0,counts));
							$(this).val($(this).val().substring(0,counts));
}})}