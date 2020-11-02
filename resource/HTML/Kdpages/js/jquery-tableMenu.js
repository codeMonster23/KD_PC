// JavaScript Document
/* 实现页面的点击或鼠标移动的切换
 * controlNodes为用户点击的节点
 * displayNodes为用户点击后切换的部分的节点
 * mode可选择click或者mouseover两种模式
 * afterClass为用户点击表头样式
 * beforeClass为表头未点击样式
*/
function TableTransition(controlNodes,displayNodes,mode,afterClass,beforeClass)
{
	if(mode)
	{
		if(mode=="click")
		{
		   controlNodes.click(function()
		   {
			  var index=controlNodes.index(this);
			  controlNodes.removeClass(afterClass).addClass(beforeClass);
			  $(this).removeClass(beforeClass).addClass(afterClass);
			  if(displayNodes)
			  {
				  displayNodes.css("display","none");
				  displayNodes.eq(index).css("display","block");
			  }
		   }) 
		}
		else if(mode=="mouseover")      
		{
		   controlNodes.mouseover(function()
		   {
			  var index=controlNodes.index(this);
			  controlNodes.removeClass(afterClass).addClass(beforeClass);
			  $(this).removeClass(beforeClass).addClass(afterClass);
			  displayNodes.css("display","none"); 
			  displayNodes.eq(index).css("display","block");
		   })
		}
		else{}		
	}
}
