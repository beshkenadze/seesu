window.listen_vk_api_callback_window = function(e){
	if (e.origin == "http://seesu.me") {
		if (e.data.match(/^set_vk_auth\n/)){
			set_vk_auth(e.data.replace(/^set_vk_auth\n/, ''), true)
		} else if (e.data == 'vkapi_auth_callback_ready'){
			e.source.postMessage('get_vk_auth', 'http://seesu.me');
		}
	} else {
		return false;
	}
};


var vk_session_meta = document.getElementsByName('vk_session');
if (vk_session_meta && vk_session_meta.length){
	if (vk_session_meta[0] && vk_session_meta[0].content){
		set_vk_auth(a[0].content, true)
	} else{
		var vk_session_stored = w_storage('vk_session');
		if (vk_session_stored){
			set_vk_auth(vk_session_stored);
		}
	}
} else{
	var vk_session_stored = w_storage('vk_session');
	if (vk_session_stored){
		set_vk_auth(vk_session_stored);
	}
}




window.set_vk_auth = function(vk_session, save_to_store){
	var vk_s = JSON.parse(vk_session)
	seesu.vk_api = new vk_api(1915003, vk_s.secret, vk_s.sid, vk_s.mid, true)
	seesu.delayed_search.switch_to_vk_api();
	$(document.body).removeClass('vk-needs-login');
	if (save_to_store){
		w_storage('vk_session', vk_s, true);
	}
}


//var viewer_id 		= seesu.vk_id;
var vk_api = function(api_id, s, sid, viewer_id, cache){
	this.sid 	= sid;
	this.api_id 	= api_id;
	this.api_link 	= 'http://api.vk.com/api.php';
	this.v 			= '3.0';
	this.s = s;
	this.viewer_id = viewer_id;
	if (cache){
		this.use_cache = true;
	}
}

vk_api.prototype = {
	'use': function(method, params, callback, error, nocache, after_ajax, query){
	
		if (method) {
			var use_cache = (this.use_cache && !nocache);

			var _this = this;
			var pv_signature_list = [], // array of <param>+<value>
				params_full = params || {},
				apisig =  true; // yes, we need signature
			
				
				
			params_full.method 	= method;
			params_full.api_id 	= this.api_id;
			params_full.v		= this.v;
			params_full.format 	= params_full.format || 'JSON';
			params_full.sid 	= this.sid;
			params_full.callback= create_jsonp_callback(function(r){
				var r = (typeof r == 'object') ? r : JSON.parse(r);
				cache_ajax.set('vk_api', params_full.sig, r);
				if (qcheck == seesu.mp3_quene.big_quene || seesu.mp3_quene.big_quene.length == 0){
					if (callback) {callback(r);}
				}
			});
			
			if(apisig || use_cache) {
				for (var param in params_full) {
					if (param != 'sid'){
						pv_signature_list.push(param  + '=' + params_full[param]);
					}
				}
				
				pv_signature_list.sort();
				var paramsstr = '';
				for (var i=0, l = pv_signature_list.length; i < l; i++) {
					paramsstr += pv_signature_list[i];
				};
				
				params_full.sig = hex_md5(this.viewer_id + paramsstr + this.s);

			}
			
			if (use_cache){
				var cache_used = cache_ajax.get('vk_api', params_full.sig, callback)
				if (cache_used) {
					return true;
				}
			}

			if (seesu.delayed_search.waiting_for_mp3provider){
				return false;
			}
			
			
			var qcheck = seesu.mp3_quene.big_quene;
			seesu.mp3_quene.add(function(){
				$.ajax({
				  url: _this.api_link,
				  global: false,
				  type: "GET",
				  dataType: 'script',
				  data: params_full,
				  timeout: 20000,
				  jsonpCallback: params_full.callback, 
				  error: function(xhr){
					if (qcheck == seesu.mp3_quene.big_quene || seesu.mp3_quene.big_quene.length == 0){
						if (error && xhr) {error(xhr);}
					}	
				  }
				});
				if (after_ajax) {after_ajax();}
			}, false);
			
			return true;
			
		}
	},
	audio_search: function(query, callback, error, nocache, after_ajax, params){
		var params_u = params || {};
			params_u.q = query;
			params_u.count = params_u.count || 30;
		var used_successful = this.use('audio.search', params_u, 
		function(r){
			if (r.response && (r.response.length > 1 )) {
				var music_list = [];
				for (var i=1, l = r.response.length; i < l; i++) {
					var entity = {
						'artist'  	:r.response[i].artist,
						'duration'	:r.response[i].duration,
						'link'		:r.response[i].url,
						'track'		:r.response[i].title
					
					};
					if (!has_music_copy(music_list,entity)){
						music_list.push(entity)
					}
				
				
				};
				if (music_list && music_list.length){
					if (callback) {callback(music_list);}
				} else{
					if (error) {error()}
				}
			
			} else{
				if (error) {error()}
			}
		}, error, nocache, after_ajax, query);
		return used_successful;
	}
}

