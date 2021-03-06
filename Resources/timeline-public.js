function getTimelinePublic() {
	
	// Check for internet
	if (Titanium.Network.online == false) {
		Titanium.UI.currentWindow.showView(Titanium.UI.currentWindow.getViewByName('nointernet'));
	}
	
	Titanium.UI.currentWindow.setTitle("Public Timeline");
	if ($("#tcontainer").html = '') {
		var ind = Titanium.UI.createActivityIndicator({
			id:'indicator',
			style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
			color:'#fff'
		});
		ind.setMessage('Loading...');
		ind.show();
	}
	var request = "http://twitter.com/statuses/public_timeline.json";
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function() {
		var data = JSON.parse(this.responseText);
		var text = '';
		var count = 0;
		var link = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)[\w\/]/gi;
		var mention = /@\w{1,15}/gi;
		$.each(data, function(i,tweet){
			text += "<div id='" +
				tweet.id +
			"' timestamp='" +
				tweet.created_at +
			"' class='status ";
				if (props.getBool('loggedIn') == true && props.getString('username') == tweet.user.screen_name) {text += "self";}
				else if (i % 2 == 0) {text += "even";}
				else if (i % 2 == 1) {text += "odd";}
			text += "'><img src='" +
				tweet.user.profile_image_url + 
			"' class='usrimg'/><div class='usrname'>" +
				tweet.user.screen_name + 
			"</div><div class='usrtime'>" +
				humane_date(tweet.created_at) +
			"</div><div class='usrmsg'>" +
				tweet.text.replace(link, function(exp) {
					return ("<lnk>"+exp+"</lnk>");
				}).replace(mention, function(exp) {
					return ("<usr>"+exp+"</usr>");
				}) +
			"</div></div>";
			count++;
		});
		if ($("#tcontainer").html == '') {
			ind.hide();
		}
		text += $("#tcontainer").html();
		$("#tcontainer").empty();
		$("#tcontainer").html(text);
		badge += count;
		tabs[0].setBadge(badge);
		//User detail
		$(".usrimg").bind('click',function(e){
			//Set user ID global
			props.setString('screenname',$(this).siblings(".usrname").html());
			//User detail view
			Titanium.UI.createWindow({
				url:'user.html',
				barColor:'#423721',
			}).open();
		});
		//Message detail
		$(".usrmsg").bind('click',function(e){
			//Set message ID global
			props.setString('msgID',$(this).parent(".status").attr("id"));
			//Message detail view
			Titanium.UI.createWindow({
				url:'message.html',
				barColor:'#423721',
			}).open();
		});
		//Links
		$("lnk").bind('click',function(e){
			Titanium.Platform.openURL($(this).text());
			e.stopPropagation();
			return false;
		});
		//Mentions
		$("usr").bind('click',function(e){
			e.stopPropagation();
			//Set user ID global
			props.setString('screenname',$(this).text().substring(1));
			//User detail view
			Titanium.UI.createWindow({
				url:'user.html',
				barColor:'#423721',
			}).open();
			return false;
		});
	};
	xhr.open("GET",request);
	xhr.send();
};

window.onload = function() {
	
	// Initialize
	props = Titanium.App.Properties;
	tabs = Titanium.UI.getTabs();
	badge = 0;
	var noInternet = Titanium.UI.createWebView({url:'nointernet.html', name:'nointernet'});
	Titanium.UI.currentWindow.addView(noInternet);
	
	// Refresh button
	var refreshbutton = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.REFRESH
	});
	refreshbutton.addEventListener('click',function(){
		getTimelinePublic();
	});
	Titanium.UI.currentWindow.setRightNavButton(refreshbutton);
	
	//Shake refresh event
	Titanium.Gesture.addEventListener('shake',function(){
		getTimelinePublic();
	});
	
	getTimelinePublic();
	
	Titanium.UI.currentWindow.addEventListener('unfocused',function(){
		tabs[0].setBadge(null);
		badge = 0;
	});
	
};