var results_mouse_click_for_enter_press = function(e){
	var node_name = e.target.nodeName;
	if ((node_name != 'A') && (node_name != 'BUTTON')){return false;}
	var active_node = seesu.ui.search_form.data('node_for_enter_press');
	if (active_node) {active_node.removeClass('active');}
	
	set_node_for_enter_press($(e.target));
}
$(function(){
	seesu.ui.scrolling_viewport = $('#screens');
})
var set_node_for_enter_press = function(node, scroll_to_node, not_by_user){
	if (!node){return false}
	
	if (not_by_user){
		seesu.ui.search_form.data('current_node_index', false);
	} else{
		seesu.ui.search_form.data('current_node_index', node.data('search_element_index'));
	}
	seesu.ui.search_form.data('node_for_enter_press', node.addClass('active'));
	
	
	if (scroll_to_node){
		var scroll_up = seesu.ui.scrolling_viewport.scrollTop();
		var scrolling_viewport_height = seesu.ui.scrolling_viewport.height()
		
		var container_postion = scroll_up + searchres.position().top;
		
		var node_position = node.parent().position().top + container_postion;
		
		
		var view_pos_down = node.parent().height() + node_position;
		var view_pos_up = node_position;

		var scroll_down = scroll_up + scrolling_viewport_height;

		if ( view_pos_down > scroll_down){
			
			var new_position =  view_pos_down - scrolling_viewport_height/2;
			seesu.ui.scrolling_viewport.scrollTop(new_position);
		} else if (view_pos_down < scroll_up){
			var new_position =  view_pos_down - scrolling_viewport_height/2;
			seesu.ui.scrolling_viewport.scrollTop(new_position);
		}
		
	}
}
seesu.ui.make_search_elements_index = function(remark_enter_press, after_user){
	seesu.ui.search_elements = searchres.find('a:not(.nothing-found), button');
	for (var i=0 , l = seesu.ui.search_elements.length; i < l; i++) {
		$(seesu.ui.search_elements[i]).data('search_element_index', i).data('search_elements_length', l)
	};
	
	
	if (remark_enter_press) {
		var active_index = seesu.ui.search_form.data('current_node_index') || 0;
		log("active_index: " + active_index)
		var new_active_node = seesu.ui.search_elements[active_index];
		log('new_active_node: ' + new_active_node.nodeName)
		if (new_active_node) {
			
				var active_node = seesu.ui.search_form.data('node_for_enter_press');
				if (active_node) {
					log('old node: ' + (active_node[0] && active_node[0].nodeName))
					active_node.removeClass('active');
				}
				
				set_node_for_enter_press($(new_active_node), false, after_user);
				
				
			
			
		}
	
			
			
		
	}
	
	
}
var create_artist_suggest_item = function(artist, image){
	var a = $("<a></a>")
		.data('artist', artist)
		.click(function(e){
			var artist = $(this).data('artist');
			set_artist_page(artist,true);
		})
		.click(results_mouse_click_for_enter_press);
	
	$("<img/>").attr({ src: (image || 'http://cdn.last.fm/flatness/catalogue/noimage/2/default_artist_medium.png'), alt: artist }).appendTo(a);
	$("<span></span>").text(artist).appendTo(a);
	return a
}
var create_track_suggest_item = function(artist, track, image, duration){
	var a = $("<a></a>")
		.data('track_title',track)
		.data('artist',artist)
		.click(function(e){
			var query = $(this).data('artist') + ' - ' + $(this).data('track_title');
			vk_track_search(query)
		})
		.click(results_mouse_click_for_enter_press);
	
	$("<img/>").attr({ src: (image || 'http://cdn.last.fm/flatness/catalogue/noimage/2/default_artist_medium.png') , alt: artist }).appendTo(a);
	if (duration){
		var track_dur = parseInt(duration);
		var digits = track_dur % 60
		track_dur = (Math.round(track_dur/60)) + ':' + (digits < 10 ? '0'+digits : digits )
		a.append('<span class="sugg-track-dur">' + track_dur + '</span>');
	}
	$("<span></span>").text(artist + ' - ' + track).appendTo(a);
	return a
}
var create_tag_suggest_item = function(tag){
	return $("<a></a>")
		.data('tag',tag)
		.click(function(e){
			var tag = $(this).data('tag');
			render_tracks_by_artists_of_tag(tag)
		})
		.click(results_mouse_click_for_enter_press)
		.append("<span>" + tag + "</span>");
}
var show_artists_results = function(r, start, end){
	if (!r) {return}
	
	var ul = seesu.ui.arts_results_ul;
	
	var source_query = r.results['@attr']['for'];
	if (search_input.val() != source_query ){
		return
	}
	
	var artists = r.results.artistmatches.artist || false; 
	if (artists && (start ? (artists.length && (artists.length > start)) : true)){
		search_nav.text('Suggestions & search');
		
		
		
	
		if (artists.length){
			
			for (var i = start || 0, l = (end ? ((artists.length < end) ? artists.length : end) : artists.length); i < l; i++) {
				
				var li = $("<li></li>");
				
				var artist = artists[i].name,
					image = artists[i].image && artists[i].image[1]['#text'].replace('/serve/64/','/serve/64s/');
				
				
				if( i == (start ? start : 0) && !end){
					li.addClass('searched-bordered');
				}
				
				li.append(create_artist_suggest_item(artist, image));
				if (end && seesu.ui.buttons_li.inject_before_buttons){
					seesu.ui.buttons_li.search_artists.before(li);
				} else{
					li.appendTo(ul);
				}
			} 
		} else if (artists.name) {
			var li = $("<li></li>");
			
			var artist = artists.name,
				image = artists.image && artists.image[1]['#text'].replace('/serve/64/','/serve/64s/');
			li.append(create_artist_suggest_item(artist, image))
			if(!end){
				li.addClass('searched-bordered');
			}
			if (end && seesu.ui.buttons_li.inject_before_buttons){
				seesu.ui.buttons_li.search_artists.before(li);
			} else{
				li.appendTo(ul);
			}
			
		}
		
		
		seesu.ui.make_search_elements_index(true, start && true);
	} else {
		if (seesu.ui.buttons_li.inject_before_buttons){
			seesu.ui.buttons_li.search_artists.remove();
		}
		$("<li><a class='nothing-found'>Nothing found</a></li>").appendTo(ul);

	}
}
var artist_search = function(artist_query, start) {
	lfm('artist.search',{artist: artist_query, limit: 15 },function(r){
		show_artists_results(r, start)
	})
	
};
var tag_search = function(tag_query, start){
	lfm('tag.search',{tag: tag_query, limit: 15 },function(r){
		show_tags_results(r, start)
	})
}
var track_search = function(track_query, start){
	lfm('track.search',{track: track_query, limit: 15 },function(r){
		show_tracks_results(r, start)
	})
}
var show_tags_results = function(r, start, end){
	
	if (!r) {return}
	
	var source_query = r.results['@attr']['for'];
	if (search_input.val() != source_query ){
		return
	}
	
	
	var tags = r.results.tagmatches.tag || false; 
	if (tags  && (start ? (tags.length && (tags.length > start)) : true)){

		search_nav.text('Suggestions & search')
		var ul = seesu.ui.tags_results_ul;

		if (tags.length){
			
			for (var i = start || 0, l = (end ? ((tags.length < end) ? tags.length : end) : tags.length) ; i < l; i++) {
				var li = $("<li></li>");
				
				var tag = tags[i].name;
				if( i == (start ? start : 0) && !end){
					li.addClass('searched-bordered');
				}
				li.append(create_tag_suggest_item(tag));
				
				if (end && seesu.ui.buttons_li.inject_before_buttons){
					seesu.ui.buttons_li.search_tags.before(li);
				} else{
					li.appendTo(ul);
				}
			} 
		} else if (tags.name) {
			var li = $("<li></li>");
			
			var tag = tags.name
			if (!end){
				li.addClass('searched-bordered');
			}
			
			li.append(create_tag_suggest_item(tag));
			
			if (end && seesu.ui.buttons_li.inject_before_buttons){
				seesu.ui.buttons_li.search_tags.before(li);
			} else{
				li.appendTo(ul);
			}
		}
		

		seesu.ui.make_search_elements_index(true, start && true);
		
	} else {
		if(seesu.ui.buttons_li.inject_before_buttons){
			seesu.ui.buttons_li.search_tags.remove();
		}
		$("<li><a class='nothing-found'>Nothing found</a></li>").appendTo(seesu.ui.tags_results_ul);

	}
}
var show_tracks_results = function(r, start, end){
	if (!r) {return}
	
	
	var source_query = r.results['@attr']['for'];
	if (search_input.val() != source_query ){
		return
	}
	
	
	var tracks = r.results.trackmatches.track || false; 
	if (tracks && (start ? (tracks.length && (tracks.length > start)) : true)){

		search_nav.text('Suggestions & search')
		var ul = seesu.ui.tracks_results_ul;
		
		if (tracks.length){
			
			for (var i = start || 0, l = (end ? ((tracks.length < end) ? tracks.length : end) : tracks.length); i < l; i++) {
				var li = $("<li></li>")
				
				var track = tracks[i].name,
					image = tracks[i].image && tracks[i].image[1]['#text'].replace('/serve/64/','/serve/64s/') ,
					artist = tracks[i].artist;
	
				li.append(create_track_suggest_item(artist, track, image));
				
				if( i == (start ? start : 0) && !end){
					li.addClass('searched-bordered')
				}
				
				if (end && seesu.ui.buttons_li.inject_before_buttons){
					seesu.ui.buttons_li.search_tracks.before(li);
				} else{
					li.appendTo(ul);
				}
			} 
		} else if (tracks.name) {
			var li = $("<li></li>")
			
			var track = tracks.name,
				image = tracks.image && tracks.image[1]['#text'].replace('/serve/64/','/serve/64s/'),
				artist = tracks.artist;
				
				li.append(create_track_suggest_item(artist, track, image));
				if (!end){
					li.addClass('searched-bordered')
				}
				
			if (end && seesu.ui.buttons_li.inject_before_buttons){
				seesu.ui.buttons_li.search_tracks.before(li);
			} else{
				li.appendTo(ul);
			}
					
		}
		
	
		
		
		seesu.ui.make_search_elements_index(true, start && true)
	} else{
		if (seesu.ui.buttons_li.inject_before_buttons){
			seesu.ui.buttons_li.search_tracks.remove()
		}
		
		$("<li><a class='nothing-found'>Nothing found</a></li>").appendTo(seesu.ui.tracks_results_ul);
	}
}

seesu.ui.buttons_li = {};
seesu.ui.buttons = {
	search_artists : 
		$('<button type="submit" name="type" value="artist" id="search-artist"><span>Search in artists</span></button>')
			.click(function(e){
				var finishing_results = $(this).data('finishing_results');
				$(this).parent().remove();
				
				
				

				log('finishing_results: ' + finishing_results)
				var query = searchfield.value;
				if (query) {
					artist_search(query, finishing_results);
				}
				seesu.ui.make_search_elements_index()
			}),
		
	search_tags:  
		$('<button type="submit" name="type" value="tag" id="search-tag"><span>Search in tags</span></button>')
			.click(function(e){
				var finishing_results = $(this).data('finishing_results');
				$(this).parent().remove();
				
				
				var query = searchfield.value;
				if (query) {
					tag_search(query, finishing_results)
				}
				seesu.ui.make_search_elements_index()
			}),
	search_tracks: 
		$('<button type="submit" name="type" value="track" id="search-track"><span>Search in tracks</span></button>')
			.click(function(e){
				var finishing_results = $(this).data('finishing_results');
				$(this).parent().remove();
				
				
				
				
				var query = searchfield.value;
				if (query) {
					track_search(query, finishing_results)
				}
				seesu.ui.make_search_elements_index()
			}),
	search_vkontakte: 
		$('<button type="submit" name="type" value="vk_track" id="search-vk-track" class="search-button"><span>Use dirty search</span></button>')
			.click(function(e){
				var query = searchfield.value;
				if (query) {
					vk_track_search(query)
				}
			})
	
}
var fast_suggestion_ui = function(r){
	if (!r) {return false}
	
	var source_query = r.responseHeader.params.originalq;
	
	
	var sugg_arts = [];
	var sugg_tracks = [];
	var sugg_tags = [];
	
	for (var i=0, l = r.response.docs.length; i < l ; i++) {
		var response_modul = r.response.docs[i];
		if (response_modul.restype == 6){
			sugg_arts.push(response_modul);
		} else 
		if (response_modul.restype == 9){
			sugg_tracks.push(response_modul);
		} else
		if (response_modul.restype == 32){
			sugg_tags.push(response_modul);
		}
	};
	
	searchres.empty();
	search_nav.text('Suggestions')
	
	
	var fast_enter = null;
	
	var clone = null;
	
	searchres.append('<h4>Artists</h4>');
	clone = seesu.ui.buttons.search_artists.clone(true);
	
	
	var ul_arts = seesu.ui.arts_results_ul = $("<ul id='artist-results-ul'></ul>").attr({ 'class': 'results-artists'});
	if (sugg_arts && sugg_arts.length){
		for (var i=0, l = sugg_arts.length; i < l; i++) {
			var artist = sugg_arts[i].artist;
			var image =  sugg_arts[i].image ? ('http://userserve-ak.last.fm/serve/34s/' + sugg_arts[i].image) : false;
			var li = $("<li class='suggested'></li>");
			
			var a =  create_artist_suggest_item(artist, image)
			
			if ((i == 0) && ( !fast_enter || fast_enter.is('button') )) {fast_enter = a;}
			li.append(a);
			
			ul_arts.append(li);
		};
		$('<li></li').append(clone.find('span').text('find more «' + source_query + '» artists').end()).appendTo(ul_arts);
	} else{
		$('<li></li').append(clone.find('span').text('Search «' +source_query + '» in artists').end().addClass("search-button")).appendTo(ul_arts);
	}
	if (!fast_enter) {fast_enter = clone;}
	searchres.append(ul_arts);
	
	
	
	
	searchres.append('<h4>Tracks</h4>');
	 clone = seesu.ui.buttons.search_tracks.clone(true);
	
	var ul_tracks = seesu.ui.tracks_results_ul = $("<ul></ul>").attr({ 'class': 'results-artists'});
	if (sugg_tracks && sugg_tracks.length){
		
		
		for (var i=0, l = sugg_tracks.length; i < l; i++) {
			var artist = sugg_tracks[i].artist;
			var track = sugg_tracks[i].track;
			var image =  sugg_tracks[i].image ? 'http://userserve-ak.last.fm/serve/34s/' + sugg_tracks[i].image : false;
			var duration = sugg_tracks[i].duration
			
			var li = $("<li class='suggested'></li>");
			
			var a = create_track_suggest_item(artist, track, image, duration)



			if ((i == 0) && ( !fast_enter || fast_enter.is('button') )) {fast_enter = a;}
			li.append(a);
			ul_tracks.append(li);
		};
		$('<li></li').append(clone.find('span').text('find more «' + source_query + '» tracks').end()).appendTo(ul_tracks);
	} else{
		$('<li></li').append(clone.find('span').text('Search «' +source_query + '» in tracks').end().addClass("search-button")).appendTo(ul_tracks);
	}
	if (!fast_enter) {fast_enter = clone;}
	searchres.append(ul_tracks);
	

	
	
	

	
	
	
	searchres.append('<h4>Tags</h4>');
	clone = seesu.ui.buttons.search_tags.clone(true);
	
	var ul_tags = seesu.ui.tags_results_ul = $("<ul></ul>").attr({ 'class': 'results-artists recommend-tags'});
	if (sugg_tags && sugg_tags.length){
		for (var i=0, l = sugg_tags.length; i < l; i++) {
			
			var tag = sugg_tags[i].tag
			var li = $("<li class='suggested'></li>");
			
			var a = create_tag_suggest_item(tag)
			
			if ((i == 0) && ( !fast_enter || fast_enter.is('button') )) {fast_enter = a;}
			li.append(a);
			ul_tags.append(li);
		};
		$('<li></li').append(clone.find('span').text('find more «' + source_query + '» tags').end()).appendTo(ul_tags);
	} else{
		$('<li></li').append(clone.find('span').text('Search «' +source_query + '» in tags').end().addClass("search-button")).appendTo(ul_tags);
	}
	if (!fast_enter) {fast_enter = clone;}
	searchres.append(ul_tags);
	

	
	
	$('<p></p').append(seesu.ui.buttons.search_vkontakte).appendTo(searchres);
	
	
	seesu.ui.make_search_elements_index();
	set_node_for_enter_press(fast_enter, false, true);
	
	

}
var multiply_suggestion_ui = function(input_value){
	var source_query = input_value;
	
	seesu.xhrs.multiply_suggestions = [];
	
	
	searchres.empty();
	search_nav.text('Suggestions')
	

	
	searchres.append('<h4>Artists</h4>');
	var arts_clone = seesu.ui.buttons.search_artists.clone(true).data('finishing_results', 5);
	log('finishing_results test: ' + arts_clone.data('finishing_results'))
	var ul_arts = seesu.ui.arts_results_ul = $("<ul id='artist-results-ul'></ul>").attr({ 'class': 'results-artists'});
	seesu.ui.buttons_li.search_artists = $('<li></li').append(arts_clone.find('span').text('Search «' +source_query + '» in artists').end().addClass("search-button")).appendTo(ul_arts);
	searchres.append(ul_arts);
	
	

	searchres.append('<h4>Tracks</h4>');
	var track_clone = seesu.ui.buttons.search_tracks.clone(true).data('finishing_results', 5);
	var ul_tracks = seesu.ui.tracks_results_ul = $("<ul></ul>").attr({ 'class': 'results-artists'});
	seesu.ui.buttons_li.search_tracks = $('<li></li').append(track_clone.find('span').text('Search «' +source_query + '» in tracks').end().addClass("search-button")).appendTo(ul_tracks);
	searchres.append(ul_tracks);
	


	searchres.append('<h4>Tags</h4>');
	var tags_clone = seesu.ui.buttons.search_tags.clone(true).data('finishing_results', 5);
	var ul_tags = seesu.ui.tags_results_ul = $("<ul></ul>").attr({ 'class': 'results-artists recommend-tags'});
	seesu.ui.buttons_li.search_tags = $('<li></li').append(tags_clone.find('span').text('Search «' +source_query + '» in tags').end().addClass("search-button")).appendTo(ul_tags);
	searchres.append(ul_tags);
	

	$('<p></p').append(seesu.ui.buttons.search_vkontakte).appendTo(searchres);
	
	seesu.ui.buttons_li.inject_before_buttons = true;
	seesu.ui.make_search_elements_index();
	set_node_for_enter_press(arts_clone, false, true);
	
	
	
	seesu.xhrs.multiply_suggestions.push(lfm('artist.search',{artist: input_value, limit: 15 },function(r){
		show_artists_results(r, false, 5);
		arts_clone.find('span').text('find more «' + source_query + '» artists');
	}));
	seesu.xhrs.multiply_suggestions.push(lfm('tag.search',{tag: input_value, limit: 15 },function(r){
		show_tags_results(r, false, 5);
		tags_clone.find('span').text('find more «' + source_query + '» tags');
		
	}));
	seesu.xhrs.multiply_suggestions.push(lfm('track.search',{track: input_value, limit: 15 },function(r){
		show_tracks_results(r, false, 5);
		track_clone.find('span').text('find more «' + source_query + '» tracks');
	}));
	
	
	
	
		
	
	

}
var suggest_search = seesu.cross_domain_allowed ? 
	function(input_value){
		
		var hash = hex_md5(input_value);
		var cache_used = cache_ajax.get('lfm_fs', hash, fast_suggestion_ui)
		
		if (!cache_used) {
			seesu.xhrs.fast_search_suggest = $.ajax({
			  url: 'http://www.last.fm/search/autocomplete',
			  global: false,
			  type: "GET",
			  timeout: 10000,
			  dataType: "json",
			  data: {
			  	"q": input_value,
			  	"force" : 1
			  },
			  error: function(){
			  },
			  success: function(r){
				cache_ajax.set('lfm_fs', hash, r);
				fast_suggestion_ui(r)
			  }
			});
		}
	} :
	multiply_suggestion_ui;
var input_change = function(e){
	var input = (e && e.target) || e; //e can be EVENT or INPUT  
	var input_value = input.value;
	if (!input_value) {
		slider.className = "show-start";
		return;
	}
	if ($(input).data('lastvalue') == input_value){return}
	
	if (seesu.xhrs.fast_search_suggest) {seesu.xhrs.fast_search_suggest.abort()}
	if (seesu.xhrs.multiply_suggestions){
		for (var i=0; i < seesu.xhrs.multiply_suggestions.length; i++) {
			if (seesu.xhrs.multiply_suggestions[i]) {seesu.xhrs.multiply_suggestions[i].abort();}
		};
	}
	
	seesu.ui.search_form.data('current_node_index' , false);
	
	suggest_search(input_value);
	
	slider.className = 'show-search  show-search-results';
	$(e.target).data('lastvalue', input_value)
}
$(function(){
	window.searchres = $('#search_result');
	window.search_nav = $('#search-nav');
	window.search_input = $('#q')
		.keyup($.debounce(input_change, 100))
		.mousemove($.debounce(input_change, 100))
		.change($.debounce(input_change, 100));
	
	seesu.ui.search_form = $('form#search').submit(function(){return false;});
	if (seesu.ui.search_form) {
		$(document).keydown(function(e){
			if (!slider.className.match(/show-search-results/)) {return}
			if (document.activeElement.nodeName == 'BUTTON'){return}
			var _key = e.keyCode;
			if (_key == '13'){
				e.preventDefault();
				var current_node = seesu.ui.search_form.data('node_for_enter_press');
				if (current_node) {current_node.click()}
			} else 
			if((_key == '40') || (_key == '63233')){
				e.preventDefault();
				var current_node = seesu.ui.search_form.data('node_for_enter_press');
				if (current_node){
					var el_index = current_node.data('search_element_index');
					var els_length = current_node.data('search_elements_length');
					current_node.removeClass('active')
					
					if (el_index < (els_length -1)){
						var new_current = el_index+1;
						set_node_for_enter_press($(seesu.ui.search_elements[new_current]), true)
						
					} else {
						var new_current = 0;
						set_node_for_enter_press($(seesu.ui.search_elements[new_current]), true)
					}
				}
			} else 
			if((_key == '38') || (_key == '63232')){
				e.preventDefault();
				var current_node = seesu.ui.search_form.data('node_for_enter_press');
				if (current_node){
					var el_index = current_node.data('search_element_index');
					var els_length = current_node.data('search_elements_length');
					current_node.removeClass('active')
					
					if (el_index > 0){
						var new_current = el_index-1;
						set_node_for_enter_press($(seesu.ui.search_elements[new_current]), true)
						
					} else {
						var new_current = els_length-1;
						set_node_for_enter_press($(seesu.ui.search_elements[new_current]), true)
					}
				}
			}
		})
	}
	
	var ext_search_query = search_input.val();
	if (ext_search_query) {
		input_change(search_input[0])
	}
})