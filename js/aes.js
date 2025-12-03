









<!DOCTYPE html>
<html>
<head>
	
	
	
	
	<script type="text/javascript">
	//存在父页面，并且父页面不是当前系统（casLogoutView.jsp中如果不做判断会一直刷新）
	if(window.top!=window.self && 
			window.top.location.href.indexOf("icas.jnu.edu.cn")==-1 &&
			window.top.location.href.indexOf("/cas")==-1){
				window.top.location.reload();
	}
	var contextpath = "https://"+"icas.jnu.edu.cn"+"/cas";
	</script>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="renderer" content="webkit" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta http-equiv="X-Frame-Options" content="SAMEORIGIN" />
	<link rel="stylesheet" type="text/css" href="/cas/comm/icon/icon.css" />
    <link rel="stylesheet" type="text/css" href="/cas/comm/icon/ie7/ie7.css" />
    <link rel="stylesheet" type="text/css" href="/cas/comm/css/camera.css" />
    <link rel="stylesheet" type="text/css" href="/cas/comm/css/login2.css" />
    <link rel="stylesheet" type="text/css" href="/cas/comm/jnu/css/login.css"> 
    <link rel="stylesheet" type="text/css" href="/cas/comm/plugin/layui/lay/modules/theme/default/layui.css" /> 
	<script type="text/javascript" src="/cas/comm/icon/ie7/ie7.js"></script>
	<link href="/cas/comm/image/newicon.ico" rel="Shortcut Icon" type="image/x-icon">
	<title>统一身份认证平台</title>
	<style>
        html,body {height: 100%;margin: 0;padding: 0;}
        a {color: #09f;}
        a:hover {text-decoration: none;}
        #back_to_camera {background: rgba(255,255,255,.9);clear: both;display: block;height: 40px;line-height: 40px;padding: 20px;position: relative;z-index: 1;}
        .fluid_container {bottom: 0;height: 100%;left: 0;position: fixed;right: 0;top: 0;z-index: 0;}
        #camera_wrap_4 {height: 100%;left: 0;position: fixed;right: 0;top: 0;}
        .camera_bar {z-index: 2;}
        .camera_thumbs {margin-top: -100px;position: relative;z-index: 1;}
        .camera_thumbs_cont {border-radius: 0;-moz-border-radius: 0;-webkit-border-radius: 0;}
        .camera_overlayer {opacity: .1;}
    </style>
</head>
<body class="fluid_container" id="container_bg" style="height: 100%;">
	<form id="loginForm" action="/cas/login?service=https%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805" method="post" autocomplete="off">
		<!--背景图轮播 START-->
		<div class="camera_wrap camera_emboss pattern_1" id="camera_wrap_4">
	            
			        <div data-thumb="/cas/comm/image/login_container_bg_01.jpg" data-src="/cas/comm/image/login_container_bg_01.jpg"></div>
			        <div data-thumb="/cas/comm/image/login_container_bg_01.jpg" data-src="/cas/comm/image/login_container_bg_01.jpg"></div>
			    
				
		</div>
        <div id="swiper-pagination1" class="swiper-pagination swiper-pagination-bullets"></div>
		<!--背景图轮播 END-->
    	<div class="login_conatiner" id="login_container_box">
			<!--登录页页头 START-->
	        <div class="shadow-bar">
	            <div class="floor1">
	                <div class="logo">
	                    <a class="login_logo_bg" href="javascript:;"></a>
	                    <span class="line"></span>
						<span class="title">统一身份认证平台</span>
						<a id="change_language" value="English" class="zh-en">
		                   <span class="pic"></span>
		                   English
	                   </a>
	                </div>
	            </div>
	        </div>
			<!--登录页页头 END-->
		<!-- 登录版块 START-->
        <div class="floor2">
            <div class="content_login_box">
            	<div class="login-tab-con">	
            		<a class="tab-inside active" id="password_login">账号登录</a>
            		<a class="tab-inside" id="qrcode_login">其他登录方式</a>
            	</div>
                <div class="error" style="padding:0 10px">
                	
                	<span class="notice" style="display:none;" id="errormsg">请输入正确信息</span>
                	
                </div>
				<div class="login_box_up" id="login_content">     	
	                <input type="text" maxlength="25" class="login_box_input user-pic pic-input" id="un" placeholder="JNUID（人事编号或学号）" style="margin-top:13px"/>
	                <input type="password" class="login_box_input password-pic pic-input" id="pd" placeholder="密码"/>
					
                    
                    	<div id="captcha"></div>
  				    		
  				    
                    <div class="down_link_choice">
                        <!--<input type="checkbox" class="login_box_checkbox" id="rememberName"/>
                         <span class="login_box_checkbox_label">记住账号密码</span>  -->
                        <a href="https://netc.jnu.edu.cn/2020/1124/c10374a565499/page.htm" target="_blank" class="login_box_psd" style="float:left">登录说明</a>
                        <a href="https://mynet.jnu.edu.cn/app/forgetPassword.html" class="login_box_psd" id="pwd_url"><span style="color:red;">JNUID激活/忘记密码</span></a>
                    </div>
                    <!-- 
                    <div class="down_link_choice" >
                        <a href="https://netc.jnu.edu.cn/2020/1124/c10374a565499/page.htm" target="_blank" class="login_box_psd" style="float:left">登录说明</a>
                    </div>	 -->
                    <span class="landing_btn_bg" id="index_login_btn">
                        <input type="button" class="login_box_landing_btn">立即登录</input>
                    </span>
                    <!-- <div class="login_box_down">
						<div class="new-login-way">
							<div class="login-way-title">
								<span class="line left"></span>
								<span class="title">微信扫码安全登录</span>
								<span class="line right"></span>
							</div>
							<div class="login-way-btn">
								<a class="wechat left"  href="https://open.weixin.qq.com/connect/qrconnect?appid=wx203b59ec93dbfc9f&response_type=code&scope=snsapi_login&redirect_uri=https%3A%2F%2Ficas.jnu.edu.cn%2Fcas%2Fwx%3Fservice%3Dhttps%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805">微信登录</a>
								<a class="qq-login right" href="https://graph.qq.com/oauth2.0/authorize?client_id=101495264APP&amp;response_type=code&amp;redirect_uri=https%3A%2F%2Ficas.jnu.edu.cn%2Fcas%2Fqq%3Fservice%3Dhttps%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805%3Fclient_name%3DQQClient&amp;scope=get_user_info%2Cadd_topic%2Cadd_one_blog%2Cadd_album%2Cupload_pic%2Clist_album%2Cadd_share%2Ccheck_page_fans%2Cadd_t%2Cadd_pic_t%2Cdel_t%2Cget_repost_list%2Cget_info%2Cget_other_info%2Cget_fanslist%2Cget_idollist%2Cadd_idol%2Cdel_ido%2Cget_tenpay_addr">QQ登录</a>
							</div>
						</div>
						<p class="new_student" style="position:relative;">360浏览器请使用极速模式
							<a class="open_360" id="open_360">(如何使用?)
								<span class="b_360" id="open_360_img"><img src="comm/image/open360fast.png" width="826" height="170"></span>
							</a>
						</p>
						<p class="browser">
							<span class="left">建议浏览器：</span>
							<a style="margin-left:0;" class="ie_pic" target="_blank" href="http://windows.microsoft.com/zh-cn/internet-explorer/download-ie">IE10+</a>
							<a class="firefox_pic" target="_blank" href="http://www.firefox.com.cn/download/">火狐</a>
							<a class="google_pic" target="_blank" href="https://www.google.cn/intl/zh-CN/chrome/">谷歌</a>
						</p>
		
						
						
                    </div>-->
                    <div class="new-login-way" id="wechatLink">
							<div class="login-way-title">
								<span class="line left"></span>
								<span class="title"><img src="/cas/comm/jnu/image/wechat.png" width="21" height="18">微信扫码安全登录</span>
								<span class="line right"></span>
							</div>
							<div class="login-way-btn">
								<div class="qr-login-pic" id="login_container">
				
								</div>
							</div>
					</div>	
	            </div>
            </div>
        </div>
		<!-- 登录版块 END-->
    </div>
	<!--登录页页脚 START-->
	<footer id="footer" style="height:142px">
		<div class="login_footer" style="text-align:center">
			<span class="center">Copyright(C) 暨南大学版权所有</span><br/>
			<span class="center"> ICP备案号：粤ICP备 12087612号</span><br/>
			<div style="display:none"><span class="center">服务端IP:.12.201&nbsp;&nbsp;&nbsp;客户端IP:172.20.34.135, 125.218.215.19, 192.168.31.219</span></div>
		</div>
	</footer>
	<!--登录页页脚 END-->
     <input type="hidden" id="rsa" name="rsa"/>
     <input type="hidden" id="ul" name="ul"/>
     <input type="hidden" id="pl" name="pl"/>
     <input type="hidden" id="lt" name="lt" value="LT-24227454-BCCABZnofw4duljXFfXbob7etnFIlu-cas" />
     <input type="hidden" name="execution" value="e1s1" />
     <input type="hidden" name="_eventId" value="submit" />
     <input type="hidden" id="not_exit_number" value="" />
     <input type="hidden" id="service_id" value="" />
     <p style="display:none;">
     	
     </p>
	</form>
</body>
<script id="password_template" type="text/html">                	
	<input type="text" maxlength="25" class="login_box_input user-pic pic-input" id="un" placeholder="JNUID（人事编号或学号）" style="margin-top:13px"/>
	<input type="password" class="login_box_input password-pic pic-input" id="pd" placeholder="密码"/>
	
     
     	<div id="captcha"></div>
  		
	
	
	<div class="down_link_choice">
		<a href="https://netc.jnu.edu.cn/2020/1124/c10374a565499/page.htm" target="_blank" class="login_box_psd" style="float:left">登录说明</a>
		<!--<input type="checkbox" class="login_box_checkbox" id="rememberName" />
		<span class="login_box_checkbox_label">记住账号密码</span>-->
		<a href="https://mynet.jnu.edu.cn/app/forgetPassword.html" class="login_box_psd">JNUID激活/忘记密码</a>
	</div>
	<!--
	<div class="down_link_choice" >
        <a href="https://netc.jnu.edu.cn/2020/1124/c10374a565499/page.htm" target="_blank" class="login_box_psd" style="float:left">登录说明</a>
    </div>-->
	<span class="landing_btn_bg" id="index_login_btn">
	    <input type="button" class="login_box_landing_btn">立即登录</input>
	</span>
	<!--<div class="login_box_down">
		<div class="new-login-way">
			<div class="login-way-title">
				<span class="line left"></span>
				<span class="title">微信扫码安全登录</span>
				<span class="line right"></span>
			</div>
			<div class="login-way-btn">
				<a class="wechat left" href="https://open.weixin.qq.com/connect/qrconnect?appid=wx203b59ec93dbfc9f&response_type=code&scope=snsapi_login&redirect_uri=https%3A%2F%2Ficas.jnu.edu.cn%2Fcas%2Fwx%3Fservice%3Dhttps%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805">微信登录</a>
				<a class="qq-login right" href="https://graph.qq.com/oauth2.0/authorize?client_id=101495264APP&amp;response_type=code&amp;redirect_uri=https%3A%2F%2Ficas.jnu.edu.cn%2Fcas%2Fqq%3Fservice%3Dhttps%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805%3Fclient_name%3DQQClient&amp;scope=get_user_info%2Cadd_topic%2Cadd_one_blog%2Cadd_album%2Cupload_pic%2Clist_album%2Cadd_share%2Ccheck_page_fans%2Cadd_t%2Cadd_pic_t%2Cdel_t%2Cget_repost_list%2Cget_info%2Cget_other_info%2Cget_fanslist%2Cget_idollist%2Cadd_idol%2Cdel_ido%2Cget_tenpay_addr">QQ登录</a>
			</div>
		</div>
	    <p class="new_student">
	    	<span>温馨提示：</span>
	    	学生账号为学号，教职工账号为职工号，初始密码均为身份证号码
	    </p>
		<p class="new_student" style="position:relative;">360浏览器请使用极速模式
			<a class="open_360" id="open_360">(如何使用?)
				<span class="b_360" id="open_360_img"><img src="comm/image/open360fast.png" width="826" height="170"></span>
			</a>
		</p>
		<p class="browser">
			<span class="left">建议浏览器：</span>
			<a style="margin-left:0;" class="ie_pic" target="_blank" href="http://windows.microsoft.com/zh-cn/internet-explorer/download-ie">IE10+</a>
			<a class="firefox_pic" target="_blank" href="http://www.firefox.com.cn/download/">火狐</a>
			<a class="google_pic" target="_blank" href="https://www.google.cn/intl/zh-CN/chrome/">谷歌</a>
		</p>
	</div>-->
	<div class="new-login-way" id="wechatLink">
							<div class="login-way-title">
								<span class="line left"></span>
								<span class="title"><img src="/cas/comm/jnu/image/wechat.png" width="21" height="18"> 微信扫码安全登录</span>
								<span class="line right"></span>
							</div>
							<div class="login-way-btn">
								<div class="qr-login-pic" id="login_container">
				
								</div>
							</div>
					</div>
</script>
<script id="qrcode_template" type="text/html">
	<!--<div class="login-qr-box" style="padding-bottom:15px;">
		<div class="login-qr-title">手机扫码  安全防盗</div>
		<div class="qr-code-box" id="qrcode"></div>
		<div class="qr-code-text">扫二维码登录校园门户</div>
    </div>-->
		<a class="btn-outbox" style="word-wrap:break-word;word-break:normal;" href="https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=wx93dbc936218364e1&agentid=1000011&redirect_uri=http%3A%2F%2Ficas.jnu.edu.cn%2Fcas%2Fqy%3Fservice%3Dhttps%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805">
			<img src="/cas/comm/jnu/image/icon_wechat_1.png" width="40" height="40" >
			<span class="line-box" style="word-wrap:break-word;"></span>
			<p class="text-outside">
			<span class="text-box" style="word-wrap:break-word;">使用企业微信账号登录</span>
			</p>
		</a>
		<a class="btn-outbox" style="word-wrap:break-word;word-break:normal;" href="https://open.weixin.qq.com/connect/qrconnect?appid=wx3d42bb9509372012&response_type=code&scope=snsapi_login&redirect_uri=https%3A%2F%2Ficas.jnu.edu.cn%2Fcas%2Fwx%3Fservice%3Dhttps%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805">
			<img src="/cas/comm/jnu/image/icon_wechat_2.png" width="40" height="40" >
			<span class="line-box" style="word-wrap:break-word;"></span>
			<p class="text-outside">
			<span class="text-box" style="word-wrap:break-word;">使用微信账号登录</span>
			</p>
		</a>
		<a class="btn-outbox" href="https://graph.qq.com/oauth2.0/authorize?client_id=101495264APP&amp;response_type=code&amp;redirect_uri=https%3A%2F%2Ficas.jnu.edu.cn%2Fcas%2Fqq%3Fservice%3Dhttps%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805%3Fclient_name%3DQQClient&amp;scope=get_user_info%2Cadd_topic%2Cadd_one_blog%2Cadd_album%2Cupload_pic%2Clist_album%2Cadd_share%2Ccheck_page_fans%2Cadd_t%2Cadd_pic_t%2Cdel_t%2Cget_repost_list%2Cget_info%2Cget_other_info%2Cget_fanslist%2Cget_idollist%2Cadd_idol%2Cdel_ido%2Cget_tenpay_addr">
			<img src="/cas/comm/jnu/image/icon_qq.png" width="40" height="40" >
			<span class="line-box"></span>
			<p class="text-outside">
			<span class="text-box" style="word-wrap:break-word;">使用QQ账号登录</span>
			</p>
		</a>
	
	<!--<div class="login_box_down">
	<p class="new_student"><span>温馨提示：</span>使用手机扫描上面的二维码以登录数字校园系统</p>
	<p class="new_student" style="position:relative;">360浏览器请使用极速模式
		<a class="open_360" id="open_360">(如何使用?)
			<span class="b_360" id="open_360_img"><img src="comm/image/open360fast.png" width="826" height="170"></span>
		</a>
	</p>
	<p class="browser">
		<span class="left">建议浏览器：</span>
		<a style="margin-left:0;" class="ie_pic" target="_blank" href="http://windows.microsoft.com/zh-cn/internet-explorer/download-ie">IE10+</a>
		<a class="firefox_pic" target="_blank" href="http://www.firefox.com.cn/download/">火狐</a>
		<a class="google_pic" target="_blank" href="https://www.google.cn/intl/zh-CN/chrome/">谷歌</a>
	</p>
	</div>-->
</script>
<script>
     var service = '%3Fservice%3Dhttps%3A%2F%2Fauth4.jnu.edu.cn%2Fcas_auth%2Fpublic%2FcasLogin%3FverifyID%3Dded509bd86774c53be0708daeb172805';
</script>
<script type="text/javascript" src="/cas/comm/js/jquery.min.js"></script>
<script type="text/javascript" src="/cas/comm/js/qrcode.js"></script>
<script type="text/javascript" src="/cas/comm/js/login-qrcode.js"></script>
<script type="text/javascript" src="/cas/comm/js/jquery-camera.min.js"></script>
<script type="text/javascript" src="/cas/comm/js/camera.min.js"></script>
<script type="text/javascript" src="/cas/comm/js/des.js"></script>
<script type="text/javascript" src="/cas/comm/plugin/captcha/jquery-1.10.3-ui.min.js"></script>
<script type="text/javascript" src="/cas/comm/plugin/captcha/jquery.captcha.js"></script>
<script src="https://cstaticdun.126.net/load.min.js?t=" + getTimestamp(1 * 60 * 1000)></script>
<script type="text/javascript" src="/cas/comm/js/login10.js"></script>
<script type="text/javascript" src="/cas/comm/js/swiper.jquery.min.js"></script>
<script type="text/javascript" src="/cas/comm/plugin/layui/lay/modules/layer.js"></script>
<script type="text/javascript" src="/cas/comm/plugin/layui/layui.js"></script>
<script type="text/javascript" src="/cas/comm/js/wxLogin.js"></script>
</html>
