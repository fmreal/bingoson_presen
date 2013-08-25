var Common = function( SMM_ID, question_id, consumer_id , enabled) {
	this.SMM_ID                = SMM_ID;
	this.question_id           = question_id;
	this.consumer_id           = consumer_id;
	this.enabled               = enabled;

	this.default_input_message = "";
	this.maxlength             = 0;
	this.photo_rd_url          = "";
	this.photo_url             = "";
	this.finish_url            = "";
	this.list_url              = "";

};

Common.prototype.setMessageConfig = function( default_input_message, maxlength ) {
	this.default_input_message = default_input_message;
	this.maxlength             = maxlength;
};

Common.prototype.setURLConfig = function( url ) {
	this.url = url;
};

Common.prototype.vote = function(id) {
	$.getJSON("https://tweet.agilemedia.jp/api/vote/updates/"+this.SMM_ID+".json?callback=?", {reply_id:id}, function(json) {
		if ( json.error ) {
			if ( json.error == "IP_DUPLICATE_ERROR" ) {
				alert("投票はお一人様一回までとなります。");
			} else if ( json.error == "NO_REFERER_ERROR" ) {
				alert("投票はブラウザから行ってください。");
			} else {
				alert("既に投票されています。");
			}
		} else {
			$("#vote_" + id).text(json.statuses.status.votes);
		}
	});
};

Common.prototype.showFinish = function() {
	$("#finish").fadeIn(2000, function() {});
};

Common.prototype.createResult = function() {
	var title = $('#title').val()==null ? "" : $('#title').val();
	var comment = $('#description').val()==null ? "" : $('#description').val();

	// 入力禁止語句
	title = title.replace(/{title}/g,"").replace(/{comment}/g,"");
	comment = comment.replace(/{title}/g,"").replace(/{comment}/g,"");

	var text = this.default_input_message.replace(/{title}/g, title).replace(/{comment}/g, comment);

	var remainNumber = $('#remainNumber');
	remainNumber.text(this.maxlength - text.length);

	$('#result').val(text);

	// this.maxlength 文字を超えたら文字色を変える
	if(text.length <= this.maxlength) {
		remainNumber.css("color", "#0099CC");
	}
	else {
		remainNumber.css("color", "#ff0000");
	}
};

Common.prototype.socialPost = function() {
	$("#socialError").fadeOut(500, function() {});
	$("#socialErrorList").empty();

	var error = false;

	// image
	if ( $("#image").val() == "" ) {
		$("#socialErrorList").append("<li>※投稿作品を添付してください。</li>");
		error = true;
	} else if ( $("#image").val().match(/jpg|jpeg/i) == null ) {
		$("#socialErrorList").append("<li>※JPG形式の写真をアップロードください。</li>");
		error = true;
	}

	// title
	if ( $("#title").val() == "" ) {
		$("#socialErrorList").append("<li>※投稿作品のタイトルを入力してください。</li>");
		error = true;
	} else if ( $("#title").val().match(/['\"\\|\$+\*={}<>~^`:;.%#@&]+/g)){
		$("#socialErrorList").append("<li>※タイトルにご入力いただいている記号は使用することができません。</li>");
		error = true;
	}

	// description
	if ( $("#description").val().match(/['\"\\|\$+\*={}<>~^`:;.%#@&]+/g)){
		$("#socialErrorList").append("<li>※コメントにご入力いただいている記号は使用することができません。</li>");
		error = true;
	}

	// result comment
	if ( $("#result").val().length > this.maxlength ) {
		$("#socialErrorList").append("<li>※STEP2の文字数をご確認ください。</li>");
		error = true;
	}

	// agree
	if ( !$("#agree").is(":checked") ) {
		$("#socialErrorList").append("<li>※投稿にはキャンペーン概要への同意が必要です。</li>");
		error = true;
	}

	// select social media
	if ( ($("#post_twitter").attr('checked') != "checked") && ($("#post_facebook").attr('checked') != "checked") && ($("#post_mixi").attr('checked') != "checked") ) {
		$("#socialErrorList").append("<li>※投稿するソーシャルメディアアカウントを選択してください。</li>");
		error = true;
	}

	// error text
	if ( error == true ) {
		$("#socialError").fadeIn(500, function() {});
		return false;
	} else {
		var href = "https://tweet.agilemedia.jp/oauth/login/"+this.SMM_ID+"?question_id="+this.question_id;
		href = href + "&consumer="+this.consumer_id;
		if ( $("#post_twitter").is(":checked") ) {
			href = href + "&post_twitter=1";
		}
		if ( $("#post_facebook").is(":checked") ) {
			href = href + "&post_facebook=1";
		}
		if ( $("#post_mixi").is(":checked") ) {
			href = href + "&post_mixi=1";
		}
		href = href + "&status=" + encodeURIComponent($("#result").val() + " " + this.url.photo_rd + "?{reply_id}");
		href = href + "&message=" + encodeURIComponent($("#description").val());
		href = href + "&follow=1";

		//メタデータ
		var meta_data = {title:$("#title").val(), description:$("#description").val()};
		href = href + "&meta_data=" + encodeURIComponent($.toJSON(meta_data));
		if ( document.location.protocol==="http:" ) {
//			href = href + "&oauth_callback=" + encodeURI( this.url.finish + "?{error}");
			href = href + "&oauth_callback=" + encodeURI( this.url.finish + "?{reply_id}");
		} else {
//			href = href + "&oauth_callback=" + encodeURI( this.url.finish.replace("http","https") + "?{error}");
			href = href + "&oauth_callback=" + encodeURI( this.url.finish.replace("http","https") + "?{reply_id}");
		}

		window.open("about:blank","confirm","width=745,height=690,menubar=no,toolbar=no,scrollbars=yes");

		$("#sendForm").attr("method",  "post");
		$("#sendForm").attr("target",  "confirm");
		$("#sendForm").attr("action",  href);
		$("#sendForm").attr("enctype", "multipart/form-data");
		$("#sendForm").submit();
	}
};

Common.prototype.webPost = function() {
	$("#webContentError").fadeOut(500, function() {});
	$("#webContentErrorList").empty();

	var error = false;

	// image
	if ( $("#image").val() == "" ) {
		$("#webContentErrorList").append("<li>※投稿作品を添付してください。</li>");
		error = true;
	} else if ( $("#image").val().match(/jpg|jpeg/i) == null ) {
		$("#webContentErrorList").append("<li>※JPG形式の写真をアップロードください。</li>");
		error = true;
	}

	// title
	if ( $("#title").val() == "" ) {
		$("#webContentErrorList").append("<li>※投稿作品のタイトルを入力してください。</li>");
		error = true;
	} else if ( $("#title").val().match(/['\"\\|\$+\*={}<>~^`:;.%#@&]+/g)){
		$("#webContentErrorList").append("<li>※タイトルにご入力いただいている記号は使用することができません。</li>");
		error = true;
	}

	// description
	if ( $("#description").val().match(/['\"\\|\$+\*={}<>~^`:;.%#@&]+/g)){
		$("#webContentErrorList").append("<li>※コメントにご入力いただいている記号は使用することができません。</li>");
		error = true;
	}

	// result comment
	if ( $("#result").val().length > this.maxlength ) {
		$("#webContentErrorList").append("<li>※STEP2の文字数をご確認ください。</li>");
		error = true;
	}

	// agree
	if ( !$("#agree").is(":checked") ) {
		$("#webContentErrorList").append("<li>※投稿にはキャンペーン概要への同意が必要です。</li>");
		error = true;
	}

	// nickname
	if ( $("#name").val() == "" ) {
		$("#webContentErrorList").append("<li>※ニックネームを入力してください。</li>");
		error = true;
	} else if ( $("#name").val().match(/['\"\\|\$+\*={}<>~^`:;.%#@&]+/g)){
		$("#webContentErrorList").append("<li>※ニックネームにご入力いただいている記号は使用することができません。</li>");
		error = true;
	} else if ( $("#name").val().match(/.*?＠.*/) ){
		$("#webContentErrorList").append("<li>※ニックネームにご入力いただいている記号は使用することができません。</li>");
		error = true;
	} else  if ( $("#name").val().length > 10 ) {
		$("#webContentErrorList").append("<li>※ニックネームは10文字以内で入力してください</li>");
		error = true;
	}

	// error text
	if ( error == true ) {
		$("#webContentError").fadeIn(500, function() {});
		return false;
	} else {
		var href = "https://tweet.agilemedia.jp/api/statuses/update/"+this.SMM_ID+".json?question_id="+this.question_id;
		href = href + "&consumer="+this.consumer_id;
		href = href + "&status=" + encodeURIComponent($("#result").val() + " "+ this.url.photo + "?{reply_id}");
		href = href + "&name=" + encodeURIComponent($("#name").val());
		href = href + "&enabled=" + this.enabled;

		href = href + "&mail=dummy@agilemedia.jp";
		//メタデータ
		var meta_data = {title:$("#title").val(), description:$("#description").val()};
		href = href + "&meta_data=" + encodeURIComponent($.toJSON(meta_data));
		if ( document.location.protocol==="http:" ) {
//			href = href + "&redirect_url=" + encodeURIComponent( this.url.list + "?finish=true&{error}");
			href = href + "&redirect_url=" + encodeURI( this.url.finish + "?{reply_id}");
		} else {
//			href = href + "&redirect_url=" + encodeURIComponent( this.url.list.replace("http","https") + "?finish=true&{error}");
			href = href + "&redirect_url=" + encodeURI( this.url.finish.replace("http","https") + "?{reply_id}");
		}

		window.open("about:blank","confirm","width=745,height=690,menubar=no,toolbar=no,scrollbars=yes");
		$("#sendForm").attr("target",  "confirm");

		$("#sendForm").attr("method",  "post");
		$("#sendForm").attr("action",  href);
		$("#sendForm").attr("enctype", "multipart/form-data");
		$("#sendForm").submit();
	}
};
