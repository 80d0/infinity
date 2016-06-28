/*
* youtube
* https://github.com/savetheinternet/Tinyboard/blob/master/js/youtube.js
*
* Don't load the YouTube player unless the video image is clicked.
* This increases performance issues when many videos are embedded on the same page.
* Currently only compatiable with YouTube.
*
* Proof of concept.
*
* Released under the MIT license
* Copyright (c) 2013 Michael Save <savetheinternet@tinyboard.org>
* Copyright (c) 2013-2014 Marcin Łabanowski <marcin@6irc.net> 
*
* Usage:
*	$config['embedding'] = array();
*	$config['embedding'][0] = array(
*		'/^https?:\/\/(\w+\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9\-_]{10,11})(&.+)?$/i',
*		$config['youtube_js_html']);
*   $config['additional_javascript'][] = 'js/jquery.min.js';
*   $config['additional_javascript'][] = 'js/youtube.js';
*
*/

//YT auto play
$(document).ready(function(){
	if (window.Options && Options.get_tab('general')) {
		Options.extend_tab("general", "<span id='youtube-size'>" + _('YouTube size') + ": <input type='number' id='youtube-width' value='360'>x<input type='number' id='youtube-height' value='270'>");

		if (typeof localStorage.youtube_size === 'undefined') {
			localStorage.youtube_size = '{"width":360,"height":270}';
			var our_yt = JSON.parse(localStorage.youtube_size);
		} else {
			var our_yt = JSON.parse(localStorage.youtube_size);
			$('#youtube-height').val(our_yt.height);
			$('#youtube-width').val(our_yt.width);
		}


		$('#youtube-width, #youtube-height').on('change', function() {
			if ($(this).attr('id') === 'youtube-height') {
				our_yt.height = $(this).val();
			} else {	
				our_yt.width = $(this).val();
			}

			localStorage.youtube_size = JSON.stringify(our_yt);
		});
	}

	var do_embed_yt = function(tag) {
		if (typeof our_yt === "undefined") {
			our_yt = {"width":360,"height":270};
		}
		
		$('div.video-container a', tag).click(function() {
			$(this.parentNode).append('<iframe style="float:left;margin: 10px 20px" type="text/html" '+
				'width="'+our_yt.width+'" height="'+our_yt.height+'" src="//www.youtube.com/embed/' + $(this.parentNode).data('video') +
				'?autoplay=1&html5=1'+ $(this.parentNode).data('params') +'" allowfullscreen frameborder="0"/>');
			$(this).remove();
			return false;
		});
		//Twitch YT size
		$('div.video-container.twitch').find('object').each(function(i,v) {
			$(v).attr('width', our_yt.width).attr('height', our_yt.height);
		});
	};
	do_embed_yt(document);

        // allow to work with auto-reload.js, etc.
        $(document).on('new_post', function(e, post) {
                do_embed_yt(post);
        });
});

//YT draggable
$(document).on('ready', function() {
	//Options for jQuery-UI draggable
	var ui_draggable_opts = {handle: ".video-handle", containment: 'window', scroll: false, distance: 10, stop: function(){$(this).css('position','fixed');}}
	//Get a suitable background color, based on the current CSS
	var dummy_reply = $('<div class="post reply"></div>').appendTo($('body'));
	var reply_background = dummy_reply.css('backgroundColor');
	dummy_reply.remove();

	//Add pop buttons
	$('.video-container').prepend($('<a href="#" class="video-pop" style="font-weight:bold;float:right">[pop]</a>'))
	$('.video-container').css({display:'inline-block',float:'left'});
	$('.thread>.video-container>a>img').css('margin-bottom',0)

	$('.video-pop').on('click', function(e) {
	    e.preventDefault();
	    var vc = $(this).parents('.video-container');

	    if (vc.hasClass('popped')) {
		//vc.remove();
			vc.removeClass('popped');
			vc.draggable('destroy');
			vc.removeClass('ui-draggable');
			vc.css('position','static');
			vc.find('.video-handle').remove();
			$(this).text('[pop]');
		return;
	    } else {
			$(this).text('[return]');
			vc.prepend($('<i class="fa fa-arrows video-handle" style="border:1px solid black;padding:2px;cursor:move">'));
			vc.addClass('ui-draggable');
			vc.addClass('popped');
			vc.css('background-color', reply_background);
			//No hiding under the nav
			vc.css('z-index', 31);
			//Correct displacement that would occur when the height of the page changes when a video is first dragged; ui draggable is meant to be used for pos:relative not pos:fixed
			vc.css('top', vc.offset().top - $(window).scrollTop());
			vc.css('left', vc.offset().left - $(window).scrollLeft());
			vc.css('position','fixed');
			vc.draggable(ui_draggable_opts);    
		}
	});
});
