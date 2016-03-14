console.log("Window Open");
// localStorage.getItem("lastSign")
// if (new Date()<new Date()) {
// 	console.log
// }

var now=new Date();
var lastSign=localStorage.getItem("lastSign");
if (lastSign && new Date(now.getFullYear(),now.getMonth(),now.getDate())<new Date(lastSign)) {
	console.log("已经签到");
}else{
	document.write("<script src='jquery.min.js'></script>");
	// 异步方法，等待加载完成
	setTimeout(start,5000);
}

// 当新窗口创建时运行，但是第一次打开chrome时并不会有该监听事件
// 因为是先打开的窗口，再直接执行的background.js程序
// 不过以下的程序可以作为程序调试时使用的触发程序，就不用每次都关闭再打开chrome了
// chrome.windows.onCreated.addListener(function(window){
// 	console.log("Window Open");
// 	document.write("<script src='jquery.min.js'></script>");
// 	// 异步方法，等待加载完成
// 	setTimeout("Start()",5000);
// });
// --------------------
chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
		console.log("onBeforeSendHeaders----------------");
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			console.log(details.requestHeaders[i].name);
		    if (details.requestHeaders[i].name === 'Referer') {
				details.requestHeaders[i].value="http://wenku.baidu.com/task/browse/daily";
				console.log(details.requestHeaders[i].value);
				break;//停止输出
		    }
		}
		// 原来的chrome发出的请求是没有Referer这个头的，上面的代码并没有用，所以要自己加上
		var Referer={
			name:'Referer',
			value:"http://wenku.baidu.com/task/browse/daily"
		};
		details.requestHeaders.push(Referer);

		console.log(details);
		return {requestHeaders: details.requestHeaders};
	},
	// filters
    {urls: ["http://wenku.baidu.com/task/submit/signin","http://wenku.baidu.com/vcode"]},
    // extraInfoSpec
    ["blocking", "requestHeaders"]
);

function start(){
	console.log("Start");
	tieBa();
	wenKu();
}

function tieBa(){
	// $.get("http://tieba.baidu.com/",function(data){
	// 	//方法一
	// 	// $()让html即使不被赋予某个元素也能被检索
	// 	var list=$($.parseHTML(data)).find("#likeforumwraper > a");
	// 	console.log(list.length);
	// 	getList(list);
	// 	// 方法二
	// 	// document.write(data);
	// 	// 上面的方法是异步的
	// 	// setTimeout("getList()",2000);
	// });

	// 更新
	$.get("http://tieba.baidu.com/f/like/mylike",function(data){
		// console.log(data);
		var tbody=$($.parseHTML(data)).find("tbody");
		var list=tbody.children("tr");
		// console.log(list);
		for (var i = list.length - 1; i >= 1; i--) {	//第一个为表头名称
			var bar=list[i];
			var a=$(bar).find("a").first();
			var href=a.attr("href");
			var kw=a.text();
			console.log(href);
			console.log(kw);
			sign(kw,href);
		}
	});
}

function wenKu(){
	$.get("http://wenku.baidu.com/task/submit/signin",function(data){
		console.log("data.errno::"+data.errno);
		if (data.errno==1) {
			window.open("http://wenku.baidu.com/task/browse/daily");
			alert("点击签到，获取下载券^_^");
		}
		localStorage.setItem("lastSign",new Date());
	},"json");
}

// function getList(list){
// 	// 配合方法二
// 	// var list=$("#likeforumwraper > a");
// 	// console.log(list.length);

// 	list.each(function(){
// 		var href=$(this).attr("href");
// 		var kw=$(this).text();
// 		console.log(href);
// 		console.log(kw);
// 		sign(kw,href);
// 	});
// }

function sign(kw,parm){
	var url="http://tieba.baidu.com"+parm;
	$.get(url,function(data){
		//_.Module.use('puser/widget/UserVisitCard',{'uname':'王来运13','is_login':1,'tbs':'ea61654cf01eda9a1456364127'});
		// 方法一截取
		var index=data.search(/is_login':1,'tbs':'/);
		// console.log(index);
		var tbs=data.substr(index+19,26);
		console.log(tbs);
		// 方法二分割split()
		// 未实验
		// var s1=data.split("is_login':1,'tbs':'");
		// var s2=s1[1].split("'");
		// tbs=s2[0];
		post(kw,tbs);
	});
}

function post(kw,tbs){
	$.post("http://tieba.baidu.com/sign/add",{ie:"utf-8",kw:kw,tbs:tbs+""},function(data){
		var data=JSON.parse(data);
		// console.log(data.no);
		if (data.no==0) {
			console.log("Signed");
		}
	});
}