document.body.onload=a; 

function a(){
	if(window.localStorage){
		//重新登录的时候清除掉localStorage
		window.localStorage.clear();
	}
	if(window.sessionStorage){
		//重新登录的时候清除掉sessionStorage
		window.sessionStorage.clear();
	}
	jQuery('#camera_wrap_4').camera({
		height: 'auto',//高度
		hover: false,//鼠标经过幻灯片时暂停(true, false)
		//imagePath: 图片的目录
		loader: 'none',//加载图标(pie, bar, none)
		//loaderColor: 加载图标颜色( '颜色值,例如:#eee' )
		//loaderBgColor: 加载图标背景颜色
		loaderOpacity: '8',//加载图标的透明度( '.8'默认值, 其他的可以写 0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1 )
		loaderPadding: '2',//加载图标的大小( 填数字,默认为2 )
		navigation: false,//左右箭头显示/隐藏(true, false)
		navigationHover: false,//鼠标经过时左右箭头显示/隐藏(true, false)
		pagination: false,//是否显示分页(true, false)
		playPause: false,//暂停按钮显示/隐藏(true, false)
		pauseOnClick: false,//鼠标点击后是否暂停(true, false)
		portrait: false,//显示幻灯片里所有图片的实际大小(true, false)
		thumbnails: false,//是否显示缩略图(true, false)
		time: 60000000,// 幻灯片播放时间( 填数字 )
		//transPeriod: 4000,//动画速度( 填数字 )
		imagePath: '../images/',
		thumbnails:false
	});
	var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        slidesPerView: 1,
        paginationClickable: false,
        spaceBetween: 0,
        pagination : '#swiper-pagination1',
        paginationType: 'bullets',
        autoplay : 5500,
        loop : true
    });

	var setting = {
		imageWidth : 1680,
		imageHeight : 1050
		
	};
	var windowHeight = $(window).height();
	var windowWidth = $(window).width();

	var init = function(){
		$(".login_conatiner").height(windowHeight).width(windowWidth);
		$("#container_bg").height(windowHeight).width(windowWidth);
		$("#login_right_box").height(windowHeight);
		var imgW = setting.imageWidth;
		var imgH = setting.imageHeight;
		var ratio = imgH / imgW; //图片的高宽比
	
		imgW = windowWidth; //图片的宽度等于窗口宽度
		imgH = Math.round(windowWidth * ratio); //图片高度等于图片宽度 乘以 高宽比
	
		if(imgH < windowHeight){ //但如果图片高度小于窗口高度的话
			imgH = windowHeight; //让图片高度等于窗口高度
			imgW = Math.round(imgH / ratio); //图片宽度等于图片高度 除以 高宽比
		}
		$(".login_img_01").width(imgW).height(imgH);  //设置图片高度和宽度
		
		
	};
	init();
	$(window).resize(function(){
		init();
	});
	
	//密码找回的中英文切换
	if($("#change_language").attr("value") == "中文"){
		$("#pwd_url").attr("href",$("#pwd_url").attr("href")+"?locale=en");
	}else{
		$("#pwd_url").attr("href",$("#pwd_url").attr("href")+"?locale=zh_CN");
	}
	$("#change_language").unbind("click").click(function(){
		var re=eval('/(locale=)([^&]*)/gi');  
	    var url = window.location.href;
	    if($("#change_language").attr("value") != "English"){
			if(url.indexOf("locale") >= 0 ) { 
				url=url.replace(re,'locale=zh_CN');
				location.href=url;
			}else{
				if(url.indexOf("?") >= 0){
					location.href=url+"&locale=zh_CN";					
				}else{
					location.href=url+"?locale=zh_CN";
				}
			}
		}else if($("#change_language").attr("value") == "English") {
			if(url.indexOf("locale") >= 0 ) { 
				url=url.replace(re,'locale=en');
				location.href=url;
			}else{
				if(url.indexOf("?") >= 0){
					location.href=url+"&locale=en";					
				}else{
					location.href=url+"?locale=en";
				}
			}
		}
	});
	//初始化点击事件
	initPassWordEvent();
	
	
} 

function login(){
	 var nECaptchaValidate = $("input[name='NECaptchaValidate']").val();
	 if (nECaptchaValidate == "") {
		 $("#errormsg").text("\u8bf7\u5148\u5b8c\u6210\u9a8c\u8bc1\u7801\u9a8c\u8bc1").show();
	     return;
	 }
	var $u = $("#un") , $p=$("#pd");
	var u = $u.val().trim();
	u = u.replace("*", "");
	if(u==""){
		$u.focus();
		$u.parent().addClass("login_error_border");
		return ;
	}
	
	var p = $p.val().trim();
	if(p==""){
		$p.focus();
		$p.parent().addClass("login_error_border");
		return ;
	}
	
	$u.attr("disabled","disabled");
	$p.attr("disabled","disabled");
	
	//防止记录错误密码，每次要刷新记住的密码
	if($("#rememberName").is(":checked")){
		//不等于空，写cookie
		setCookie('neusoft_cas_un' , u , 7);
		setCookie('neusoft_cas_pd' , strEnc(p,'neusoft','cas','pd') , 7);
	}
	
	var lt = $("#lt").val();
	
	$("#ul").val(u.length);
	$("#pl").val(p.length);
	$("#rsa").val(strEnc(u+p+lt , '1' , '2' , '3'));
	$("#loginForm")[0].submit();
	
}
var CatapInte;
//初始化登录页事件
function initPassWordEvent(){
	var passwordhtml = document.getElementById("password_template").innerHTML;
	var qrcodehtml = document.getElementById("qrcode_template").innerHTML;
	$("#index_login_btn").click(function(){
		login();
	}); 
	//点击记住账号密码
	$("#rememberName").change(function(){
		if($(this).is(":checked")){
			var $u = $("#un").val() ;
			var $p = $("#pd").val() ;
			if($.trim($u)==''||$.trim($p)==''){
				$("#errormsg").text("账号和密码不能为空").show();
				$(this).prop("checked", false);
			}else{
				//不等于空，写cookie
				setCookie('neusoft_cas_un' , $u , 7);
				setCookie('neusoft_cas_pd' , strEnc($p,'neusoft','cas','pd') , 7);
			}
		}else{
			//反选之后清空cookie
			clearCookie('neusoft_cas_un');
			clearCookie('neusoft_cas_pd');
		}
	});
	initNECaptcha({
	      captchaId: '5a63b6131a824620af00177ddfa3d19e',
	      element: '#captcha',
		  mode: 'embed',
		  width: 'auto',
		  height: 'auto',
		  onVerify: function (err, ret) {
	            if (!err) {
	                //拖拽图片校验成功后显示先一步操作
	            	$("#errormsg").hide();
	                $("#captcha").css("display", "none");
	                //$(".hiddenHtml").removeClass("hiddenHtml");
	                // ret['validate'] //获取二次校验数据
	            }
	        }
	    }, function onload (instance) {
	    	
	      // 初始化成功后，用户输入对应用户名和密码，以及完成验证后，直接点击登录按钮即可
	    	CatapInte = instance;
	    }, function onerror (err) {
	      // 验证码初始化失败处理逻辑，例如：提示用户点击按钮重新初始化
	});
	
	//获取cookie值
	var cookie_u = getCookie('neusoft_cas_un');
	var cookie_p = getCookie('neusoft_cas_pd');
	if(cookie_u&&cookie_p){
		$("#un").val(cookie_u);
		$("#pd").val(strDec(cookie_p,'neusoft','cas','pd'));
		$("#rememberName").attr("checked","checked");
	}
	
	//用户名文本域keyup事件
	$("#un").keyup(function(e){
		if(e.which == 13) {
			
			login();
	    }
	}).keydown(function(e){
		$("#errormsg").hide();
	}).focus();
	
	//密码文本域keyup事件
	$("#pd").keyup(function(e){
		if(e.which == 13) {
			login();
	    }
	}).keydown(function(e){
		$("#errormsg").hide();
	});
	
	//如果有错误信息，则显示
	if($("#errormsghide").text()){
		$("#errormsg").text($("#errormsghide").text()).show();
		if($("#errormsghide").text()=='账号不存在'){
			$.post('getDataByMethod', {method:"getServiceInfo",service_id:$("#service_id").val(),not_exit_number:$("#not_exit_number").val()}, function(data){
				if(data.success){
					if(data.is_up_service){
						layer.open({
							title: '业务系统列表',
							type: 1,
							offset: ['100px', '50px'],
							shade:0.8,
							content: "<table id='servicesinfo' lay-filter='test'></table>", 
							success: function(layero, index){
								layui.use('table', function(){
									var table = layui.table;  
									//第一个实例
									table.render({
										elem: '#servicesinfo'
											,data: data.data 
											,height: 312
											,page: true //开启分页
											,cols: [[ //表头
									          {field: 'SERVICE_NAME', title: '系统名称',minWidth:100}
									          ,{field: 'ORIGINAL_LOGIN_URL', title: '原登录地址',minWidth:100,templet: function(d){
									        	  return '<a href="'+d.ORIGINAL_LOGIN_URL+'?account='+$("#not_exit_number").val()+'" class="layui-table-link">原登录地址</a>'
									          }}
									          ]]
									});
									
								});
							}
						});	
					}else{
						layer.confirm('当前登录账号不是统一身份账号，是否使用业务系统的登录认证？', {
							   title:"登录提示",
							   time: 0 //不自动关闭
							  ,btn: ['确认', '取消']
							  ,yes: function(index){
							    layer.close(index);
							    window.location.href = data.service_link_url+"?account="+$("#not_exit_number").val();
							  }
						});
					}
				}				
			});
		}
	}
	//重新获取验证码
	$("#codeImage").click(function(){
    	$("#codeImage").attr("src", "code?"+Math.random()) ;
    });
	//触发如何使用360极速模式图片
	$("#open_360").mouseover(function(){
		$("#open_360_img").show();
	}).mouseout(function(){
		$("#open_360_img").hide();
	});
	//点击账号登陆
	$("#password_login").click(function(){
		alert("789");
		$("#password_login").addClass("active");
		$("#qrcode_login").removeClass("active");
		$("#login_content").html(passwordhtml);
		initPassWordEvent();
	});
	//点击扫码登陆
	$("#qrcode_login").unbind().click(function(){
		$("#errormsg").hide();
		$("#password_login").removeClass("active");
		$("#qrcode_login").addClass("active");
		$("#login_content").html(qrcodehtml);
		//微信企业号扫码登录 add by TJL
//		var lqrcode = new loginQRCode("qrcode",153,153);
//		lqrcode.generateLoginQRCode(function(result){
//			window.location.href = result.redirect_url;
//		});
//		//触发如何使用360极速模式图片
//		$("#open_360").mouseover(function(){
//			$("#open_360_img").show();
//		}).mouseout(function(){
//			$("#open_360_img").hide();
//		});
//		$(this).unbind();
	});
	//点击账号登陆
	$("#password_login").unbind().click(function(){
		$("#password_login").addClass("active");
		$("#qrcode_login").removeClass("active");
		$("#login_content").html(passwordhtml);
		
		initPassWordEvent();
	});
	
	//微信开放平台扫码登录
	// 如果是微信浏览器不使用下面的方法
	var isWeixin = isWeixinBrowser();
	if (isWeixin == false) {
			var obj = new WxLogin({
			 self_redirect:false,
			 id:"login_container", 
			 appid: "wx3d42bb9509372012", 
			 scope: "snsapi_login", 
			 redirect_uri: "https%3A%2F%2Ficas.jnu.edu.cn%2Fcas%2Fwx"+service,
//			 redirect_uri: "http%3A%2F%2Flogin.jnu.edu.cn%2Fcas%2Fwx",
			 style: "white",
			 href: contextpath+"/comm/css/wxqr.css"
		});
	}else{
		document.getElementById("wechatLink").style.display="none";
	}
}

function getParameter(hash,name,nvl) {
	if(!nvl){
		nvl = "";
	}
	var svalue = hash.match(new RegExp("[\?\&]?" + name + "=([^\&\#]*)(\&?)", "i"));
	if(svalue == null){
		return nvl;
	}else{
		svalue = svalue ? svalue[1] : svalue;
		svalue = svalue.replace(/<script>/gi,"").replace(/<\/script>/gi,"").replace(/<html>/gi,"").replace(/<\/html>/gi,"").replace(/alert/gi,"").replace(/<span>/gi,"").replace(/<\/span>/gi,"").replace(/<div>/gi,"").replace(/<\/div>/gi,"");
		return svalue;
	}
}


//设置cookie
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

//获取cookie
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
  }
  return "";
}

//清除cookie  
function clearCookie(name) {  
  setCookie(name, "", -1);  
}

function isWeixinBrowser(){
	var ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
  //return /micromessenger/.test(navigator.userAgent.toLowerCase())
}