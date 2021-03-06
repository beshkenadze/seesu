get_all_tracks = function(trackname, callback, nocache, hypnotoad, only_cache){
	var allow_h = hypnotoad && seesu.delayed_search.waiting_for_mp3provider;
	if (seesu.delayed_search.use.quene) {seesu.delayed_search.use.quene.reset();}
	seesu.delayed_search.tracks_waiting_for_search = 0;
	art_tracks_w_counter.text('');
	var s = allow_h ? seesu.hypnotoad.search_soundcloud : seesu.delayed_search.use.search_tracks;
	var used_successful = s(trackname, callback, function(){callback();}, nocache, false, only_cache);
	if (typeof used_successful == 'object'){
		used_successful.pr = seesu.player.want_to_play + 1;
		used_successful.q.init();
	}
	return used_successful;
}

get_track = function(mo, nocache, hypnotoad, only_cache, get_next){
	var allow_h = hypnotoad && seesu.delayed_search.waiting_for_mp3provider;
	if(mo.ready_for_play){
		return false;
	}
	
	if (!nocache && !only_cache && !hypnotoad){
		art_tracks_w_counter.text((seesu.delayed_search.tracks_waiting_for_search += 1) || '');
	}
	var s = allow_h ? seesu.hypnotoad.search_soundcloud : seesu.delayed_search.use.search_tracks;
	var last_hypnotoad_try = false;
	var callback_success = function(music_list){
		//success
		if (mo.ready_for_play){
			return false
		}
		
		mo.node.removeClass('search-mp3');
		var best_track = get_best_track(music_list,mo.artist,mo.track);
		make_node_playable(mo, best_track);
		export_playlist.addClass('can-be-used');
		if (!nocache && !only_cache && !hypnotoad){
			art_tracks_w_counter.text((seesu.delayed_search.tracks_waiting_for_search -= 1) || '');
		}
		
	}
	
	var callback_error = function(xhr){
		//error
		if(mo.ready_for_play){
			return false;
		}
		if (!mo.not_use){

			
			if (allow_h && seesu.hypnotoad.vk_api && !last_hypnotoad_try ){
			
				last_hypnotoad_try = true;
				seesu.hypnotoad.search_tracks(
					mo.artist + ' - ' + mo.track, callback_success, callback_error, 
					nocache,
					function(){
						if(mo.ready_for_play){
							return false;
						}
						mo.node.addClass('search-mp3');
					}
				)
				
			} else{
				if (get_next){
					mo.not_use=true;
					if ((seesu.player.current_next_song && (mo == seesu.player.current_next_song)) || 
						(seesu.player.current_prev_song && (mo == seesu.player.current_prev_song))){
						seesu.player.fix_songs_ui();
					}
					if (seesu.player.current_next_song && !seesu.player.current_next_song.ready_for_play){
						get_next_track_with_priority(seesu.player.current_next_song);
					}
				}
				
			}
		} else{
			return false;
		}
		
		
		
		mo.node.removeClass('search-mp3').addClass('search-mp3-failed').removeClass('waiting-full-render');
		if (!nocache && !only_cache && !hypnotoad){
			art_tracks_w_counter.text((seesu.delayed_search.tracks_waiting_for_search -= 1) || '');
		}
		
	}
	var used_successful = s(
		mo.artist + ' - ' + mo.track, callback_success, callback_error, 
		nocache,
		function(){
			if(mo.ready_for_play){
				return false;
			}
			mo.node.addClass('search-mp3');
		},
		only_cache
	);
	if (typeof used_successful == 'object'){
		var has_pr = mo.want_to_play;
		if (has_pr) {
			used_successful.pr = has_pr;
		}
		mo.delayed_in.push(used_successful);
		used_successful.q.init();
	}
	
	return !!used_successful;
}

var de_html_entity = document.createElement('div');
var de_html = function(html_text){
	de_html_entity.innerHTML = html_text;
	return de_html_entity.textContent;
}
get_best_track = function(array,artist,track){
	var best = array[0],
	worst_pr = -7; //six steps search
	
	for (var i=0,l=array.length; i < l; i++) {
		var _ar = de_html(array[i].artist),
			_tr = de_html(array[i].track);
		artist = de_html(artist)
		track = de_html(track)
		var epic_fail;
		
		var for_first_test = artist + ' ' + track;
		epic_fail = !for_first_test.match(new RegExp(artist, 'ig')) && !for_first_test.match(new RegExp(track, 'ig'));
		
		if (!epic_fail){
			if ((_ar == artist) && (_tr == track)){
				return array[i];
			} else
			if ((_ar.toLowerCase() == artist.toLowerCase()) && (_tr.toLowerCase() == track.toLowerCase())){
				best = array[i];
				worst_pr = -1;
			} else
			if ( (worst_pr < -2) && (_ar.replace(/The /g, '') == artist.replace(/The /g, '')) && (_tr == track)){
				best = array[i];
				worst_pr = -2;
			} else
			if ( (worst_pr < -3) && (_ar.replace(/The /g, '') == artist.replace(/The /g, '')) && (_tr.replace(/.mp3/g, '') == track)){
				best = array[i];
				worst_pr = -3;
			} else
			if ( (worst_pr < -4) && (_ar.toLowerCase() == artist.replace("The ").toLowerCase()) && (_tr.toLowerCase() == track.toLowerCase())){
				best = array[i];
				worst_pr = -4;
			} else 
			if ( (worst_pr < -5) && _ar.match(artist) && _tr.match(track)) {
				best = array[i];
				worst_pr = -5;
			} else
			if ( (worst_pr < -6) && _ar.toLowerCase().match(artist.toLowerCase()) && _tr.toLowerCase().match(track.toLowerCase())) {
				best = array[i];
				worst_pr = -6;
			} else {
				best = array[i];
				worst_pr = -7;
			}
		}
		
		
	};
	return best;
}
kill_music_dubs = function(array) {
	var cleared_array = [];
	for (var i=0; i < array.length; i++) {
		if (!has_music_copy(array, array[i], i+1)){
			cleared_array.push(array[i]);
		}
	}
	return cleared_array
}
has_music_copy = function(array, entity, from_position){
	if (!array.length) {return false}
	
	for (var i = from_position || 0, l = array.length; i < l; i++) {
		if ((array[i].artist == entity.artist) && (array[i].track == entity.track) && (array[i].duration == entity.duration)) {
			return true;
		}
	};
}

var mp3_prov_selected = w_storage('mp3-search-way');
var have_mp3_provider;
window.prov_count_down = 1;
var provider_selected;

window.swith_to_provider = function(try_selected){
	if (provider_selected) {return false}
	if (mp3_prov_selected && seesu.delayed_search.available && seesu.delayed_search.available.length){
	
		
		for (var i=0; i < seesu.delayed_search.available.length; i++) {
			var current_prov = seesu.delayed_search.available[i];
			if (current_prov == mp3_prov_selected){
				seesu.delayed_search['switch_to_' + current_prov]();
				provider_selected = true;
				console.log('selected prov ' + current_prov);
			}
		};
		if (!provider_selected && !try_selected){
			var current_prov = seesu.delayed_search.available[0];
			if (current_prov){
				seesu.delayed_search['switch_to_' + current_prov]();
				provider_selected = true;
				console.log('not selected prov ' + current_prov);
			} else{
				console.log('must use vkontakte');
			}
		}
		
	} else if (!try_selected){
		var someone_available = seesu.delayed_search.available[0];
		if (someone_available){
			seesu.delayed_search['switch_to_' + someone_available]();
			console.log('some avai prov ' + someone_available)
		} else{
			console.log('must use vkontakte');
		}
	}
}
window.swith_to_provider_finish = function(){
	prov_count_down--;
	if (prov_count_down == 0){
		swith_to_provider();
	}
}

window.try_hard_vk_working = function(callback){
	$.ajax({
	  url: "http://vkontakte.ru/feed2.php",
	  global: false,
	  type: "GET",
	  dataType: "text",
	  timeout: 7000,
	  beforeSend: seesu.vk.set_xhr_headers,
	  success: function(text){
		if (text.match(/^\{/) && text.match(/\}$/)){
			try {
				var r = $.parseJSON(text);
				if (r.user && r.user.id) {
					if (callback){
						callback(r);
					} else{
						seesu.delayed_search.available.push('vk');
						seesu.vk_logged_in = true;
						console.log('vk mp3 prov ok')
						swith_to_provider(true)
					}
				} else{
					vk_logged_out();
					console.log('vk mp3 prov faild');
					
				
					var login = w_storage( 'vk_auth_login');
					var pass = w_storage( 'vk_auth_pass');
					if (login && pass){
						console.log('we have pass in storage')
						vk_send_captcha('', login, pass)
					}
					
				}
			} catch(e) {
				console.log(e)
			}
		} else{
			vk_logged_out();
			console.log('vk mp3 prov faild (can not parse)');
			
			var login = w_storage( 'vk_auth_login');
			var pass = w_storage( 'vk_auth_pass');
			if (login && pass){
				console.log('we have pass in storage')
				vk_send_captcha('', login, pass)
			}
			
		}
	  },
	  error: function(xhr){
		console.log('vk mp3 prov faild with jq error')
		vk_logged_out();
	  },
	  complete: function(xhr){
		swith_to_provider_finish();
	  }

	});
}

try_mp3_providers = function(){
	if (seesu.cross_domain_allowed){
		if (seesu.vk.id || seesu.env.chrome_extension || seesu.env.firefox_widget ) {
			try_hard_vk_working();
		} else{
			console.log('vk mp3 prov faild cos not auth')
			vk_logged_out();
			swith_to_provider_finish();
		}
	}
  	
	
}	
