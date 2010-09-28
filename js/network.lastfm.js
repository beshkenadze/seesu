var apikey = '2803b2bcbc53f132b4d4117ec1509d65';
var	s = '77fd498ed8592022e61863244b53077d';
var api='http://ws.audioscrobbler.com/2.0/';
var lastfm_cache_on = true;
var lfm = function(method, params, callback, nocache, type_of_xhr_is_post) {
	if (method) {
		var use_cache = (lastfm_cache_on && !type_of_xhr_is_post && !nocache)


		var pv_signature_list = [], // array of <param>+<value>
			params_full = params || {},
			apisig = ((params && (params.sk || params.token )) || (method == 'auth.getToken')) ? true : false; // yes, we need signature
		
		params_full.method = method;
		params_full.api_key = apikey;
		params_full.format = params_full.format || 'json';
		

		var paramsstr = '';
		if(apisig || use_cache) {
			for (var param in params_full) {
				if ((param != 'format') && (param != 'callback')){
					pv_signature_list.push(param + params_full[param]);
				}
			}
			pv_signature_list.sort();
			
			for (var i=0, l = pv_signature_list.length; i < l; i++) {
				paramsstr += pv_signature_list[i];
			};
			params_full.api_sig = hex_md5(paramsstr + s);
		}
		
		if (use_cache){
			var cache_used = cache_used = cache_ajax.get('lastfm', params_full.api_sig, callback)	
		}

		if (!cache_used){
			return $.ajax({
			  url: api,
			  global: false,
			  type: (type_of_xhr_is_post == true) ? "POST" : "GET",
			  dataType: "jsonp",
			  data: params_full,
			  error: function(r){
			  },
			  success: function(r){
				cache_ajax.set('lastfm', params_full.api_sig, r)
				if (callback) {callback(r);}
			  },
			  complete: function(xhr){
			  	//log(xhr.responseText)
			  }
			});
			//log(params_full)
		}

	}
};

var lfm_scrobble = {
  scrobbling:  w_storage('lfm_scrobbling_enabled') ? true : false, 
  music: (function(){
  	var lfmscm = w_storage('lfm_scrobble_music');
  	if (lfmscm) {
  		return JSON.parse(lfmscm);
  	} else {
  		return [];
  	}
  })(),
  s: w_storage('lfm_scrobble_s'),
  handshake: function(callback){
  	var _this = this;
	var timestamp = ((new Date()).getTime()/1000).toFixed(0);
	$.ajax({
		  url: 'http://post.audioscrobbler.com/',
		  global: false,
		  type: "GET",
		  dataType: "text",
		  data: {
		  	'hs': 'true',
		  	'p': '1.2.1',
		  	'c': 'see',
		  	'v': '1.0',
		  	'u': lfm_auth.user_name,
		  	't': timestamp,
		  	'a': hex_md5(s + timestamp),
		  	'api_key': apikey,
		  	'sk': lfm_auth.sk
		  },
		  error: function(r){
		  },
		  success: function(r){
			var response = r.split(/\n/);
			if (response[0] == 'OK'){
				_this.s = response[1];
				w_storage('lfm_scrobble_s', _this.s, true);
				if (callback) {callback();}
				log('handshake:' + '\n' + r)
			} else {
				log(r)
			}
			
		  }
	})	
  },
  nowplay: function(node){

	
	var artist = node.data('artist_name'),
		title = node.data('track_title');
	
	if (this.s) {
		var _this = this;
		$.ajax({
		  url: 'http://post.audioscrobbler.com:80/np_1.2',
		  global: false,
		  type: "POST",
		  dataType: "text",
		  data: {
		  	's': _this.s,
		  	'a': artist,
		  	't': title
		  },
		  error: function(r){
		  },
		  success: function(r){
			log('nowplay:' + '\n' + r);
			if (r.match('BADSESSION')){
				lfm_scrobble.s = null;
				w_storage('lfm_scrobble_s', '', true);
				
				lfm_scrobble.handshake();
			};
		  }
		})	
	} else {
		lfm_scrobble.handshake(function(){
			lfm_scrobble.nowplay(node);
		});
	} 
	
  },
  submit: function(node){
  	var _this = this;
	log('getting data for submit')
	var artist = node.data('artist_name'),
		title = node.data('track_title'),
		duration = node.data('duration'),
		starttime = node.data('start_time'),
		last_scrobble = node.data('last_scrobble'),
		timestamp = ((new Date()).getTime()/1000).toFixed(0);
	log('getting date for submit')
	if (((timestamp - starttime)/duration > 0.2) || (last_scrobble && ((timestamp - last_scrobble)/duration > 0.6)) ){
		this.music.push({
			'artist': artist, 
			'title': title,
			'duration': duration, 
			'timestamp': timestamp
		});
		node.data('start_time',null);
		node.data('last_scrobble',timestamp);
	} 

	if (lfm_auth.sk && this.s && this.music.length) {
		var _this = this;
		
		var post_m_obj = {'s':_this.s};
		for (var i=0,l=_this.music.length; i < l; i++) {
  			post_m_obj['a[' + i + ']'] = _this.music[i].artist,
		  	post_m_obj['t[' + i + ']'] = _this.music[i].title,
		  	post_m_obj['i[' + i + ']'] = _this.music[i].timestamp,
		  	post_m_obj['o[' + i + ']'] = 'P',
		  	post_m_obj['r[' + i + ']'] = ' ',
		  	post_m_obj['l[' + i + ']'] = _this.music[i].duration,
		  	post_m_obj['b[' + i + ']'] = ' ',
		  	post_m_obj['n[' + i + ']'] = ' ',
		  	post_m_obj['m[' + i + ']'] = ' '
  		};
  		log('request data generated. sending')
		log(JSON.stringify(post_m_obj));
  		$.ajax({
		  url: 'http://post2.audioscrobbler.com:80/protocol_1.2',
		  global: false,
		  type: "POST",
		  dataType: "text",
		  data: post_m_obj,
		  error: function(r){
			log('error while scrobble')
			
		  },
		  success: function(r){
			log('submit:' + '\n' + r);
			if (!r.match('OK')) {
				if (r.match('BADSESSION')){
					lfm_scrobble.s = null;
					w_storage('lfm_scrobble_s', '', true);
					
					lfm_scrobble.handshake();
				}
				w_storage('lfm_scrobble_music', _this.music);
			} else {
				_this.music = [];
				w_storage('lfm_scrobble_music', '');
			}
			
		  },
		  complete: function(xhr){
			log(xhr);
		  }
		})
			log(' data sended')
	} else {
		if (_this.music.length){
			w_storage('lfm_scrobble_music', _this.music);
		} 
		if (!this.s){
			lfm_scrobble.handshake(function(){
				lfm_scrobble.submit(node);
			});
		}
	}
  	log('submit done');
  }
};
