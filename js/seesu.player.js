var INIT     = -11,
	  CREATED  = -7,
	  VOLUME   = -5,
	  STOPPED  =  1,
	  PLAYED   =  5,
	  PAUSED   =  7,
	  FINISHED =  11;



seesu.player = {
	'player_state' 		: STOPPED,
	'player_holder' 	: null,
	'current_playlist' 	: null,
	'want_to_play' 		: 0,
	'wainter_for_play' 	: null,
	'current_artist' 	: '',
	'iframe_player' 	: false,
	'iframe_doc' 		: null,
	'player_volume' 	: ( function(){
		var volume_preference = w_storage('vkplayer-volume');
		if (volume_preference && (volume_preference != 'undefined') && volume_preference != 'NaN'){
			return parseFloat(volume_preference) || 80
		} else {
			return 80
		}
	  })(),
	'events' 			: [],
	'current_song' 		: null,
	'musicbox'			: {
			play_song_by_node: function(node){
				current_song = node;
			}
		}, //music box is a link to module with playing methods, 
								//for e.g. soundmanager2 and vkontakte flash player
	'call_event'		: function	(event, data) {
	  if(this.events[event]) this.events[event](data);
	},
	get_state: function(){
		if (this.player_state == PLAYED){
			return 'playing';
		} else 
		if (this.player_state == STOPPED){
			return 'stoped';
		} else 
		if (this.player_state == PAUSED){
			return 'paused';
		} else {
			return false;
		}
	},
	'set_state'			:function (new_player_state_str) {
	  var new_player_state =
		(new_player_state_str == "play" ? PLAYED :
		  (new_player_state_str == "stop" ? STOPPED : PAUSED)
		);
	  switch(this.player_state - new_player_state) {
	  case(STOPPED - PLAYED):
		if (this.current_song) {
			this.musicbox.play_song_by_node( this.current_song );
			
		};
		break;
	  case(PAUSED - PLAYED):
		this.musicbox.play();
		break;    
	  case(PAUSED - STOPPED):
	  case(PLAYED - STOPPED):
		this.musicbox.stop();
		break;
	  case(PLAYED - PAUSED):
		this.musicbox.pause();
		break;
	  default:
		//log('Do nothing');
	  }
	},
	'switch_to' 	:function (direction) {
	  if (this.current_song) {
		var playlist 		= this.current_song.data('link_to_playlist'),
			current_number 	= this.current_song.data('number_in_playlist'),
			total			= playlist.length || 0;
		if (playlist.length > 1) {
			if (direction == 'next') {
				if (current_number == (total-1)) {
					this.set_current_song(playlist[0]);
				} else {
					this.set_current_song(playlist[current_number+1]);
				}
			} else
			if (direction == 'prev') {
				if ( current_number == 0) {
					this.set_current_song(playlist[total-1]);
				} else {
					this.set_current_song(playlist[current_number-1]);
				}
			}
		}
	  }
	},
	'set_current_song':function (node) {
	  if (this.current_song && this.current_song.length && (this.current_song[0] == node[0])) {
		return true;
		
	  } else {
		time = (new Date()).getTime();
		var artist = node.data('artist_name');
		if (artist) {update_artist_info(artist);}
		if (this.current_song) {
			//seesu.player.musicbox.stop();
			this.current_song.parent().removeClass('active-play');
		}
		node.parent().addClass('active-play');
		this.current_song = node;
		if (this.musicbox.play_song_by_node) {
		  this.musicbox.play_song_by_node(node);
		} else 
		if (this.musicbox.play_song_by_url) {
		  this.musicbox.play_song_by_url(node.data('mp3link'), node.data('duration'));
		} else 
		{return false;}

		
	  }
	}
}
seesu.player.events[PAUSED] = function(){
  seesu.player.player_state = PAUSED;
  document.body.className = document.body.className.replace(/player-[a-z]+ed/g, '');
  $(document.body).addClass('player-paused');
};
seesu.player.events[PLAYED] = function(){
	
	
  var start_time = seesu.player.current_song.data('start_time');
  if (!start_time) {
	seesu.player.current_song.data('start_time',((new Date()).getTime()/1000).toFixed(0));
  }
  if (lfm_scrobble.scrobbling) {
	lfm_scrobble.nowplay(seesu.player.current_song);
  }
  
  seesu.player.player_state = PLAYED;
  document.body.className = document.body.className.replace(/player-[a-z]+ed/g, '');
  $(document.body).addClass('player-played');
  
};
seesu.player.events[STOPPED] = function(){
  seesu.player.current_song.data('start_time',null);
  seesu.player.player_state = STOPPED;
  document.body.className = document.body.className.replace(/player-[a-z]+ed/g, '');
  $(document.body).addClass('player-stopped');
  
};
seesu.player.events[FINISHED] = function() {
  document.body.className = document.body.className.replace(/player-[a-z]+ed/g, '');
  $(document.body).addClass('player-finished');
  
  if (lfm_scrobble.scrobbling ) {
	var submit = function(node){
		setTimeout(function(){
			lfm_scrobble.submit(node);
		},300)
	};
	submit(seesu.player.current_song);
  }
  
  if (typeof(source_window) != 'undefined') {
	source_window.switch_to_next();
  } else {
	switch_to_next();
  }
};
seesu.player.events[VOLUME] = function(volume_value) {
  if (typeof(source_window) != 'undefined') {
	source_window.change_volume();
  } else { 
	change_volume(volume_value);
  }
  
};



	



// Click by song
seesu.player.song_click = function(node) {
  seesu.player.set_current_song(node);
  seesu.player.current_playlist = node.data('link_to_playlist');



  return false;
}

function switch_to_next(){
  seesu.player.switch_to('next');
}
function change_volume(volume_value){
  w_storage('vkplayer-volume', volume_value);
  seesu.player.player_volume = volume_value;	
}

player_holder = seesu.ui.player_holder = $('<div class="player-holder"></div>');

var try_to_use_iframe_sm2p = function(){
	i_f_sm2 = seesu.ui.iframe_sm2_player = $('<iframe id="i_f_sm2" src="http://seesu.heroku.com/i.html" ></iframe>');
	
	if (i_f_sm2) {
		
		
		init_sm2_p = function(){
			
			
			if (typeof soundManager != 'object'){
				log('no sounds');
			} else{
				sm2_p_in_iframe = new sm2_p(false, _volume, soundManager);
				sm2_p_in_iframe.player_source_window = iframe_source;
				soundManager.onready(function() {

					if (soundManager.supported()) {

						iframe_source.postMessage("sm2_inited",'*');

					} else{
						log('by some reason sm2 iframe don"t work')
					}
				})	
			}
			
			
		}
		var text_of_function = function(func){
			return func.toString().replace(/^.*\n/, "").replace(/\n.*$/, "")
		}
		var get_trt_js = function(name){
			if (!window.js_trt){return;}
			for (var i=0; i < window.js_trt.length; i++) {
				if (window.js_trt[i].name == name){
					return window.js_trt[i].fn;
				}
				
			};
		}
		var _scripts_we_need = ['soundmanager2.js', 'seesu.player.sm2.js'];
		var _scripts_we_need_data = '';
		for (var i=0; i < _scripts_we_need.length; i++) {
			_scripts_we_need_data += text_of_function(get_trt_js(_scripts_we_need[i]));
		};
		
		
		var last_iframe_func = text_of_function(init_sm2_p).replace('_volume', seesu.player.player_volume );
		
		var i_f_sm2_hide_timeout;

		var send_scripts_to_iframe = function(iframe){
			iframe.contentWindow.postMessage("append_data_as_script\n" + _scripts_we_need_data + last_iframe_func, '*');
		}


		var check_iframe = function(e){
			if (e.data.match(/iframe_loaded/)){
				clearTimeout(i_f_sm2_hide_timeout);
				
				log('got iframe loaded feedback');
				send_scripts_to_iframe(i_f_sm2[0]);
				
				
			} else if (e.data.match(/sm2_inited/)){
				log('iframe sm2 wrokss yearh!!!!')
				seesu.player.musicbox = new sm2_p(player_holder, seesu.player.player_volume, soundManager, i_f_sm2);
				i_f_sm2.addClass('sm-inited');
				$(document.body).addClass('flash-internet');
				
				removeEvent(window, "message", check_iframe);
			}
		}
		addEvent(window, "message", check_iframe);
		$('#slider-materail').append(i_f_sm2);
		
		
		i_f_sm2.bind('load',function(){
			log('source knows that iframe loaded');

			this.contentWindow.postMessage("test_iframe_loading_state", '*');
			
			i_f_sm2_hide_timeout = setTimeout(function(){
				//i_f_sm2.remove()
				removeEvent(window, "message", check_iframe, false);
			},1000);
			
			
		});
		
	}
	
}





// Ready? Steady? Go!

$(function() {
	play_controls = $('.play-controls');
	player_holder.append(play_controls)
	$('#play-list-holder').append(player_holder);
	

	soundManager.onready(function() {
	  if (soundManager.supported()) {
		log('sm2 in widget ok')
		seesu.player.musicbox = new sm2_p(player_holder, seesu.player.player_volume, soundManager);
		$(document.body).addClass('flash-internet');
	  } else {
	  	log('sm2 in widget notok')
	  		try_to_use_iframe_sm2p();

	  }
	});

	
});
