/* JavaScript Document
 * 显隐文本框内的提示内容,同时更换默认文字显示和用户输入文字显示效果样式
 * 以jquery框架为基础
 * 请采用并列样式书写方式，如操作前input的class="inputFrame beforeClass",
   用户点击后样式为class="inputFrame afterClass"
 * 2014.7.28
 */
 
 /* inputHandler为需要操作的input文本框，jquery节点
  * promptString为文本框内需要显示的文字内容，
  * beforeClass为默认文本框内文字样式，可选
  * afterClass为用户点击输入后，文字样式,可选
  */
function PromptToggle(inputHandler,promptString,beforeClass,afterClass)
{
		inputHandler.focus(function()
		{
			if($(this).val()==promptString)
			{
				$(this).val("");
				$(this).removeClass(beforeClass).addClass(afterClass);
			}
		})
		
		inputHandler.blur(function()
		{
			if($(this).val()=="")
			{
				$(this).val(promptString);
				$(this).removeClass(afterClass).addClass(beforeClass);
			}
		})
}