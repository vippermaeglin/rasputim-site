(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, script){
	var isPoorBrowser = $('html').hasClass('poor-browser');
	if(!Modernizr.cssanimations || isPoorBrowser){
		$('.scroll-in-animation').removeClass('scroll-in-animation');
		$('.scroll-animation').removeClass('scroll-animation');
		return;
	}
	$('.safari i.scroll-in-animation').removeClass('scroll-in-animation');
	$('.safari i.scroll-animation').removeClass('scroll-animation');
	$context.find('.scroll-in-animation, .scroll-animation').each(function(){
		var $this = $(this);
		var delay = $this.data('delay');
		var animation = $this.data('animation')+' animated css-animation-show';
		var pause = function(){
			if(delay){
				setTimeout(function(){$this.removeClass(animation);}, delay);
			}else{
				$this.removeClass(animation);
			}
		}
		var resume = function(){
			if(delay){
				setTimeout(function(){$this.addClass(animation);}, delay);
			}else{
				$this.addClass(animation);
			}
		}
		var start = resume;
		script.players.addPlayer($this, start, pause, resume);
	});
};
},{}],2:[function(require,module,exports){
"use strict"; var $ = jQuery;
var players=[];
players.addPlayer = function($view, startFunc, pauseFunc, resumeFunc){
	players.push(
		new (function(){
			var played = false;
			var started = false;
			this.$view = $view;
			$view.addClass('player').data('player-ind', players.length);
			this.play = function(){
				if(!played){
					played = true;
					if(!started){
						started = true;
						startFunc();
					}else{
						resumeFunc();
					}
				}
			};
			this.pause = function(){
				if(played){
					played = false;
					pauseFunc();
				}
			};
		})()
	);
};
module.exports = players;
},{}],3:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(script){
	var me = this;
	var tools = require('../tools/tools.js');
	var ScrollAnimation = require('../app/scroll-animation.js');
	var $window = $(window);
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var scrollAnimation = new ScrollAnimation(me, script);
	this.windowTopPos = undefined;
	this.windowBottomPos = undefined;
	this.windowH = undefined;
	this.scroll = function(windowTopP){
		me.windowH = $window.height();
		me.windowTopPos = windowTopP
		me.windowBottomPos = windowTopP+me.windowH;
		if(me.windowTopPos < script.topNav.state1Top()){
			script.topNav.state1();
		}else{
			script.topNav.state2();
		}
		scrollAnimation.scroll()
		for(var i=0; i<script.players.length; i++){
			var viewPos = me.calcPosition(script.players[i].$view);
			if(viewPos.visible){
				script.players[i].play();
			}else{
				script.players[i].pause();
			}
		}
	}
	this.calcPosition = function ($block){
		var blockH = $block.height();
		var blockTopPos = $block.data('position');
		var blockBottomPos = blockTopPos + blockH;
		return {
			top: blockTopPos,
			bottom: blockBottomPos,
			height: blockH,
			visible: blockTopPos<me.windowBottomPos && blockBottomPos>me.windowTopPos
		};
	}
};
},{"../app/scroll-animation.js":7,"../tools/tools.js":11}],4:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var appShare = require('../app/app-share.js');
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var fadeTime = 4000;
	var moveTime = 12000;
	var st0 = {scale: 1};
	var st1 = {scale: 1.1};
	var rules = [
		[st0, st1],
		[st1, st0]
	];
	var origins = [
		{or: 'left top', xr: 0, yr: 0},
		{or: 'left center', xr: 0, yr: 1},
		{or: 'right top', xr: 2, yr: 0},
		{or: 'right center', xr: 2, yr: 1}
	]
	var lastRule = rules.length -1;
	var lastOrigin = origins.length -1;
	var fadeEase = TWEEN.Easing.Quartic.InOut;//Power4.easeInOut;
	var moveEase = TWEEN.Easing.Linear.None;//Linear.easeNone;
	this.run = function($slides) {
		if(isPoorBrowser) return;
		var lastI = $slides.length - 1;
		show(lastI, true);
		function show(i, isFirstRun) {
			var slide = $slides.get(i);
			var $slide = $(slide);
			var cfg = $slide.data();
			var ri = Math.round(Math.random() * lastRule);
			var ori = Math.round(Math.random() * lastOrigin);
			var rule = rules[ri];
			cfg.ssScale = rule[0]['scale'];
			cfg.ssOrig = origins[ori];
			cfg.ssOpacity = (i === lastI && !isFirstRun) ? 0 : 1;
			if (i === lastI && !isFirstRun) {
				new TWEEN.Tween(cfg)
					.to({ssOpacity: 1}, fadeTime)
					.easing(fadeEase)
					.onComplete(function(){
						$slides.each(function(){
							$(this).data().ssOpacity = 1;
						});
					})
					.start();
			}
			new TWEEN.Tween(cfg)
				.to({ssScale: rule[1]['scale']}, moveTime)
				.easing(moveEase)
				.start();
			if (i > 0) {
				new TWEEN.Tween({ssOpacity: 1})
					.to({ssOpacity: 0}, fadeTime)
					.onUpdate(function(){
						cfg.ssOpacity = this.ssOpacity;
					})
					.easing(fadeEase)
					.delay(moveTime - fadeTime)
					.onStart(function(){
						show(i - 1);
					})
					.start();
			}else{
				new TWEEN.Tween(cfg)
					.to({}, 0)
					.easing(fadeEase)
					.delay(moveTime - fadeTime)
					.onStart(function(){
						show(lastI);
					})
					.start();
			}
		}
	};
};
},{"../app/app-share.js":5}],5:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var me = this;
	var isOldWin =
			(navigator.appVersion.indexOf("Windows NT 6.1")!=-1) || //Win7
			(navigator.appVersion.indexOf("Windows NT 6.0")!=-1) || //Vista
			(navigator.appVersion.indexOf("Windows NT 5.1")!=-1) || //XP
			(navigator.appVersion.indexOf("Windows NT 5.0")!=-1);   //Win2000
	var isIE9 = $('html').hasClass('ie9');
	var isIE10 = $('html').hasClass('ie10');
	var isIE11 = $('html').hasClass('ie11');
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var isMobile = $('html').hasClass('mobile');
	var factor = (function(){
		if(isIE9 || isIE10 || (isIE11 && isOldWin)){
			return 0;
		}else if(isIE11){
			return -0.15;
		}else if(isPoorBrowser){
			return 0;
		}else{
			return -0.25;
		}
	})();
	this.force3D = isMobile ? false : true;
	this.parallaxMargin = function(script, secInd, viewOffsetFromWindowTop){
		var viewOffsetFromNavPoint = (viewOffsetFromWindowTop - (secInd === 0 ? 0 : script.topNav.state2H));
		return Math.round(factor * viewOffsetFromNavPoint);
	};
})();
},{}],6:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var appShare = require('./app-share.js');
	var themes = require('./themes.js');
	var SlideShow = require('../animation/slide-show.js');
	var slideShow = new SlideShow();
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var isMobile = $('html').hasClass('mobile');
	var skewH = 60;
	var $bord = $('#top-nav, .page-border, #dot-scroll');
	var $topNav = $('#top-nav');
	var state1Colors = $topNav.data('state1-colors');
	var state2Colors = $topNav.data('state2-colors');
	var $body = $('body');
	var $views = $('.view');
	var $bacgrounds;
	this.prepare = function(callback){
		if(window.location.protocol === 'file:' && !$('body').hasClass('example-page')){
			/*$('<div class="file-protocol-alert alert colors-d background-80 heading fade in">	<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> Upload files to web server and open template from web server. If template is opened from local file system, some links, functions and examples may work incorrectly.</div>')
					.appendTo('body');*/
		}
		if(appShare.force3D === true){
			$('html').addClass('force3d');
		}
		if(isPoorBrowser){
			var $bodyBg = $('body>.bg');
			$bodyBg.each(function(i){
				if(i === ($bodyBg.length - 1)){
					$(this).css('display', 'block');
				}else{
					$(this).remove();
				}
			});
			$('.view').each(function(){
				var $viewBg = $(this).children('.bg');
				$viewBg.each(function(i){
					if(i === ($viewBg.length - 1)){
						$(this).css('display', 'block');
					}else{
						$(this).remove();
					}
				});
			});
		}
		if(isMobile){
			var $bodyImg = $('body>img.bg');
			var $defImgSet = $bodyImg.length>0 ? $bodyImg : $('.view>img.bg');
			if($defImgSet.length > 0){
				var $defImg = $($defImgSet[0]);
				$('.view').each(function(){
					var $sec = $(this);
					var $bg = $sec.children('img.bg');
					if($bg.length<1){
						$defImg.clone().prependTo($sec);
					}
				});
			}
			$('body>img.bg').remove();
		}
		$bacgrounds = $('.bg');
		callback();
	};
	this.setup = function(callback){
		var goodColor = function($el){
			var bg = $el.css('background-color');
			return (
					bg.match(/#/i) ||
					bg.match(/rgb\(/i) ||
					bg.match(/rgba.*,0\)/i)
			);
		};
		$('.view.section-header').each(function(){
			var $this = $(this);
			var $next = $this.nextAll('.view').first().children('.content');
			if($next.length>0 && goodColor($next)){
				$this.children('.content').addClass('skew-bottom-right');
			}
		});
		$('.view.section-footer').each(function(){
			var $this = $(this);
			var $prev = $this.prevAll('.view').first().children('.content');
			if($prev.length>0 && goodColor($prev)){
				$this.children('.content').addClass('skew-top-right');
			}
		});
		$views.find('.content').filter('.skew-top-right, .skew-top-left, .skew-bottom-left, .skew-bottom-right').each(function(){
			var $content = $(this);
			var $view = $content.parent();
			if($content.hasClass('skew-top-right') || $content.hasClass('skew-top-left')){
				var $prev = $view.prevAll('.view').first().children('.content');
				if($prev.length>0 && goodColor($prev)){
					var type = $content.hasClass('skew-top-right') ? 1 : 2;
					$('<div class="skew skew-top-'+(type === 1 ? 'right' : 'left')+'"></div>').appendTo($content).css({
						position: "absolute",
						top: "0px",
						width: "0px",
						height: "0px",
						"border-top-width": type === 2 ? (skewH+"px") : "0px",
						"border-right-width": "2880px",
						"border-bottom-width": type === 1 ? (skewH+"px") : "0px",
						"border-left-width": "0px",
						"border-style": "solid solid solid dashed",
						"border-bottom-color": "transparent",
						"border-left-color":  "transparent"
					}).addClass(getColorClass($prev));
				}
			}
			if($content.hasClass('skew-bottom-left') || $content.hasClass('skew-bottom-right')){
				var $next = $view.nextAll('.view').first().children('.content');
				if($next.length>0 && goodColor($next)){
					var type = $content.hasClass('skew-bottom-left') ? 1 : 2;
					$('<div class="skew skew-bottom-'+(type === 1 ? 'left' : 'right')+'"></div>').appendTo($content).css({
						position: "absolute",
						bottom: "0px",
						width: "0px",
						height: "0px",
						"border-top-width": type === 1 ? (skewH+"px") : "0px",
						"border-right-width": "0px",
						"border-bottom-width": type === 2 ? (skewH+"px") : "0px",
						"border-left-width": "2880px",
						"border-style": "solid dashed solid solid",
						"border-top-color": "transparent",
						"border-right-color": "transparent"
					}).addClass(getColorClass($next));
				}
			}
		});
		callback();
		function getColorClass($el){
			for(var i=0; i<themes.colors; i++){
				var colorClass = 'colors-'+String.fromCharCode(65+i).toLowerCase();
				if($el.hasClass(colorClass)){
					return colorClass;
				}
			}
		}
	};
	this.ungated = function(){
		$('body, .view').each(function(){
			var $bg = $(this).children('.bg');
			if($bg.length > 1) slideShow.run($bg);
		});
	}
	this.tick = function(){
		$bacgrounds.each(function(){
			var $this = $(this);
			var cfg = $this.data();
			var opa, xr, yr, or;
			if(cfg.ssOpacity !== undefined){
				opa = cfg.ssOpacity;
				xr = cfg.ssOrig.xr;
				yr = cfg.ssOrig.yr;
				or = cfg.ssOrig.or;
			}else{
				opa = 1;
				xr = 1;
				yr = 1;
				or = 'center center';
			}
			var x = cfg.normalX + (cfg.zoomXDelta * xr);
			var y = cfg.normalY + (cfg.zoomYDelta * yr) + (cfg.parallaxY !== undefined ? cfg.parallaxY : 0);
			var sc = cfg.normalScale * (cfg.ssScale !== undefined ? cfg.ssScale : 1);
			if(Modernizr.csstransforms3d && appShare.force3D){
				$this.css({transform: 'translate3d('+x+'px, '+y+'px, 0px) scale('+sc+', '+sc+')', opacity: opa, 'transform-origin': or+' 0px'});
			}else{
				$this.css({transform: 'translate('+x+'px, '+y+'px) scale('+sc+', '+sc+')', opacity: opa, 'transform-origin': or});
			}
		});
	}
	this.buildSizes = function(script){
		var $window = $(window);
		var wh = $window.height();
		var ww = $window.width();
		var $tnav = $('#top-nav:visible');
		var sh = wh - ($tnav.length > 0 ? script.topNav.state2H : 0);
		var $bbord = $('.page-border.bottom:visible');
		var borderH = $bbord.length > 0 ? $bbord.height() : 0;
		$('.full-size, .half-size, .one-third-size').each(function() {
			var $this = $(this);
			var minPaddingTop = parseInt($this.css({
				'padding-top': '',
			}).css('padding-top').replace('px', ''));
			var minPaddingBottom = parseInt($this.css({
				'padding-bottom': '',
			}).css('padding-bottom').replace('px', ''));
			var minFullH = sh - ($bbord.length > 0 ? borderH : 0);
			var minHalfH = Math.ceil(minFullH / 2);
			var min13H = Math.ceil(minFullH / 3);
			var min = $this.hasClass('full-size') ? minFullH : ($this.hasClass('half-size') ? minHalfH : min13H);
			$this.css({
				'padding-top': minPaddingTop + 'px',
				'padding-bottom': minPaddingBottom + 'px'
			});
			if($this.hasClass('stretch-height') || $this.hasClass('stretch-full-height')){
				$this.css({height: ''});
			}
			var thisH = $this.height();
			if (thisH < min) {
				var delta = min - thisH - minPaddingTop - minPaddingBottom;
				if(delta<0){
					delta=0;
				}
				var topPlus = Math.round(delta / 2);
				var bottomPlus = delta - topPlus;
				var newPaddingTop = minPaddingTop + topPlus;
				var newPaddingBottom = minPaddingBottom + bottomPlus;
				$this.css({
					'padding-top': newPaddingTop + 'px',
					'padding-bottom': newPaddingBottom + 'px'
				});
			}
		});
		$('.stretch-height').each(function(){
			var $this = $(this);
			var $par = $this.parent();
			var $strs = $par.find('.stretch-height');
			$strs.css('height', '');
			if($this.outerWidth()<$par.innerWidth()){
				$strs.css('height', $par.innerHeight()+'px');
			}
		});
		$('.stretch-full-height').each(function(){
			var $this = $(this);
			var $par = $this.parent();
			var $strs = $par.find('.stretch-full-height');
			$strs.css('height', '');
			if($this.outerWidth()<$par.innerWidth()){
				var parH = $par.innerHeight();
				var strsH = wh < parH ? parH : wh;
				$strs.css('height', strsH+'px');
			}
		});
		$views.each(function(i){
			var $view = $(this);
			var $content = $view.find('.content');
			var $skewTop = $content.find('.skew.skew-top-right, .skew.skew-top-left');
			var $skewBottom = $content.find('.skew.skew-bottom-left, .skew.skew-bottom-right');
			var contentWPx = $content.width()+"px";
			$skewBottom.css({
				"border-left-width": contentWPx
			});
			$skewTop.css({
				"border-right-width": contentWPx
			});
			var viewH = $view.height();
			var viewW = $view.width();
			var targetH = (function(){
				var viewOffset1 = -1 * viewH;
				var viewOffset2 = 0;
				var viewOffset3 = wh - viewH;
				var viewOffset4 = wh;
				var marg1 = appShare.parallaxMargin(script, i, viewOffset1);
				var marg2 = appShare.parallaxMargin(script, i, viewOffset2);
				var marg3 = appShare.parallaxMargin(script, i, viewOffset3);
				var marg4 = appShare.parallaxMargin(script, i, viewOffset4);
				var topDelta = function(viewOffset, marg){
					return marg + (viewOffset > 0 ? 0 : viewOffset);
				};
				var bottomDelta = function(viewOffset, marg){
					var bottomOffset = viewOffset + viewH;
					return -marg - (bottomOffset < wh ? 0 : bottomOffset - wh);
				};
				var delta = 0;
				var curDelta;
				curDelta = topDelta(viewOffset1, marg1); if(curDelta > delta) delta = curDelta;
				curDelta = topDelta(viewOffset2, marg2); if(curDelta > delta) delta = curDelta;
				curDelta = topDelta(viewOffset3, marg3); if(curDelta > delta) delta = curDelta;
				curDelta = topDelta(viewOffset4, marg4); if(curDelta > delta) delta = curDelta;
				curDelta = bottomDelta(viewOffset1, marg1); if(curDelta > delta) delta = curDelta;
				curDelta = bottomDelta(viewOffset2, marg2); if(curDelta > delta) delta = curDelta;
				curDelta = bottomDelta(viewOffset3, marg3); if(curDelta > delta) delta = curDelta;
				curDelta = bottomDelta(viewOffset4, marg4); if(curDelta > delta) delta = curDelta;
				return viewH + (2 * delta);
			})();
			$view.children('img.bg').each(function(){ 
				bgSize($(this), targetH, viewW, viewH);
			});
			$view.data('position', $view.offset().top);
		});
		$('section').each(function(){
			var $this = $(this);
			$this.data('position', $this.offset().top);
		});
		$('body').children('img.bg').each(function(){ 
			bgSize($(this), wh, ww, wh);
		});
		function bgSize($bg, targetH, viewW, viewH){
			var nat = natSize($bg);
			var scale = (viewW/targetH > nat.w/nat.h) ? viewW / nat.w : targetH / nat.h;
			var newW = nat.w * scale;
			var newH = nat.h * scale;
			var zoomXDelta = (newW - nat.w)/2;
			var zoomYDelta = (newH - nat.h)/2;
			var x = Math.round((viewW - newW)/2);
			var y = Math.round((viewH - newH)/2);
			var cfg = $bg.data();
			cfg.normalScale = scale;
			cfg.normalX = x;
			cfg.normalY = y;
			cfg.zoomXDelta = zoomXDelta;
			cfg.zoomYDelta = zoomYDelta;
		}
	};
	this.changeSection = function(script, sectionHash){
		var $sect = $(sectionHash);
		var cls = $sect.data('border-colors');
		if(cls){
			$bord.removeClass(themes.colorClasses);
			$bord.addClass(cls);
		}else{
			if($body.hasClass('state2') && state2Colors){
				$bord.removeClass(themes.colorClasses);
				$bord.addClass(state2Colors);
			}else if(state1Colors){
				$bord.removeClass(themes.colorClasses);
				$bord.addClass(state1Colors);
			}
		}
	};
	function natSize($bg){
		var elem = $bg.get(0);
		var natW, natH;
		if(elem.tagName.toLowerCase() === 'img'){
			natW = elem.width;
			natH = elem.height;
		}else if(elem.naturalWidth){
			natW = elem.naturalWidth;
			natH = elem.naturalHeight;
		}else{
			var orig = $bg.width();
			$bg.css({width: '', height: ''});
			natW = $bg.width();
			natH = $bg.height();
			$bg.css({width: orig});
		}
		return {w: natW, h: natH};
	}
})();
},{"../animation/slide-show.js":4,"./app-share.js":5,"./themes.js":8}],7:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(scrolling, script){
	var $views = $('.view');
	var appShare = require('./app-share.js');
	var isPoorBrowser = $('html').hasClass('poor-browser');
	this.scroll = function(){
		if(isPoorBrowser) return;
		$views.each(function(i){
			var $view = $(this);
			var viewPos = scrolling.calcPosition($view);
			if(viewPos.visible){
				var viewOffset = viewPos.top - scrolling.windowTopPos;
				$view.children('.bg:not(.static)').each(function(){
					var cfg = $(this).data();
					cfg.parallaxY = appShare.parallaxMargin(script, i, viewOffset);
				});
			}
		});
	};
};
},{"./app-share.js":5}],8:[function(require,module,exports){
"use strict";
module.exports = new (function(){
	var me = this;
	this.options = {
		'angie': {style: 'theme-angie', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'lynda': {style: 'theme-lynda', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'alice': {style: 'theme-alice', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'lucy': {style: 'theme-lucy', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'mary': {style: 'theme-alice', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'suzi': {style: 'theme-suzi', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'viki': {style: 'theme-viki', bgSync: ['**/*.txt', '**/*'], videoSync: []},
		'luiza': {style: 'theme-luiza', bgSync: ['**/*.txt', '**/*'], videoSync: []}
	};
	this.names = {
	};
	this.colors = 8;
	this.colorClasses = (function(){
		var res = '';
		for(var i=0; i<me.colors; i++){
			var sep = i === 0 ? '' : ' ';
			res += sep + 'colors-'+String.fromCharCode(65+i).toLowerCase();
		}
		return res;
	})();
})();
},{}],9:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(script){
	var themes = require('../app/themes.js');
	var tools = require('../tools/tools.js');
	var loading = require('../widgets/loading.js');
	var appShare = require('../app/app-share.js');
	var colors = themes.colors;
	var me = this;
	var cPath = '';
	var customCss;
	var $window = $(window);
	var $panel;
	var $opt;
	var $toggle;
	var optW;
	var $customCss;
	var $themesSelect;
	var $colors;
	var isInitialized = false;
	
	this.lessVars = {};
	this.isShowPanel = (function(){
		var customizeP = tools.getUrlParameter('customize');
		if(customizeP === undefined){
			customizeP = $.cookie('customize');
		}else{
			$.cookie('customize', 'yes', {path: cPath});
		}
		return (customizeP && $('#top-nav').length > 0) ? true : false;
	})();
	this.show = function(){
		setTimeout(function(){
			if(!isInitialized){
				isInitialized = true;
				createCss(true);
				initLessVars();
				var $gate = $opt.find('.options-gate');
				$gate.css({opacity: 0});
				setTimeout(function(){
					$gate.css({visibility: 'hidden'});
				}, 1000);
			}
		}, 550);
		$panel.css({left: '0px'});
		$panel.addClass('on');
	};
	this.hide = function(){
		$panel.css({left: -1*optW+'px'});
		$panel.removeClass('on');
	};
	function resize(){
		$opt.css({
			height: ($window.height() - parseInt($panel.css('top').replace('px','')) - 30) + 'px'
		});
	}
	function themeSelectToCustom(){
		if($themesSelect.val() !== 'custom'){
			$('<option value="custom">Custom</option>').appendTo($themesSelect);
			$themesSelect.val('custom');
			$.cookie.json = false;
			$.cookie('themeSelect', 'custom', {path: cPath});
			$.cookie.json = true;
		}
	}
	function initLessVars(){
		for(var i=0; i<colors; i++){
			initGroup(String.fromCharCode(65+i).toLowerCase());
		}
		initLessVar('<span><span class="primary-color"></span></span>', '.primary-color', 'color', 'input.primary-bg', 'primary-bg', toHex);
		initLessVar('<span><span class="out-primary"></span></span>', '.out-primary', 'opacity', 'input.primary-out', 'primary-out', outTranslator, outSetTranslator);
		initLessVar('<span><span class="success-color"></span></span>', '.success-color', 'color', 'input.success-bg', 'success-bg', toHex);
		initLessVar('<span><span class="out-success"></span></span>', '.out-success', 'opacity', 'input.success-out', 'success-out', outTranslator, outSetTranslator);
		initLessVar('<span><span class="info-color"></span></span>', '.info-color', 'color', 'input.info-bg', 'info-bg', toHex);
		initLessVar('<span><span class="out-info"></span></span>', '.out-info', 'opacity', 'input.info-out', 'info-out', outTranslator, outSetTranslator);
		initLessVar('<span><span class="warning-color"></span></span>', '.warning-color', 'color', 'input.warning-bg', 'warning-bg', toHex);
		initLessVar('<span><span class="out-warning"></span></span>', '.out-warning', 'opacity', 'input.warning-out', 'warning-out', outTranslator, outSetTranslator);
		initLessVar('<span><span class="danger-color"></span></span>', '.danger-color', 'color', 'input.danger-bg', 'danger-bg', toHex);
		initLessVar('<span><span class="out-danger"></span></span>', '.out-danger', 'opacity', 'input.danger-out', 'danger-out', outTranslator, outSetTranslator);
	}
	function initGroup(grp){
		initLessVar('<span class="colors-'+grp+'"><span class="bg-color"></span></span>', '.bg-color', 'color', 'input.'+grp+'-bg', grp+'-bg', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="text"></span></span>', '.text', 'color', 'input.'+grp+'-text', grp+'-text', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="highlight"></span></span>', '.highlight', 'color', 'input.'+grp+'-highlight', grp+'-highlight', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="link"></span></span>', '.link', 'color', 'input.'+grp+'-link', grp+'-link', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="heading"></span></span>', '.heading', 'color', 'input.'+grp+'-heading', grp+'-heading', toHex);
		initLessVar('<span class="colors-'+grp+'"><span class="out"></span></span>', '.out', 'opacity', 'input.'+grp+'-out', grp+'-out', outTranslator, outSetTranslator);
	}
	function outTranslator(v){return Math.round((1-v)*100);}
	function outSetTranslator(v){return Math.round(v);}
	function initLessVar(getterHtml, getterQ, cssProperty, inputQ, lessVar, translator, setTranslator){
		//var changeDelay = 300;
		var $g = $('<span class="getter"></span>').appendTo('body');
		$(getterHtml).appendTo($g);
		var getted = $g.find(getterQ).css(cssProperty);
		$g.remove();
		if(getted){
			if(translator) getted = translator(getted);
		}
		me.lessVars[lessVar] = getted;
		var $inp = $opt.find(inputQ);
		$inp.val(getted);
		if(cssProperty === 'color'){
			$inp.minicolors({
				control: $(this).attr('data-control') || 'hue',
				defaultValue: $(this).attr('data-defaultValue') || '',
				inline: $(this).attr('data-inline') === 'true',
				letterCase: $(this).attr('data-letterCase') || 'lowercase',
				opacity: false,
				position: $(this).attr('data-position') || 'top left',
				//changeDelay: changeDelay,
				change: function(hex, opacity) {
					themeSelectToCustom();
					me.lessVars[lessVar] = hex;
					createCss();
				},
				show: function(){
					var $mc = $inp.parent();
					var $mcPanel = $mc.children('.minicolors-panel');
					var mcPanelH = $mcPanel.outerHeight(true);
					var mcPanelW = $mcPanel.outerWidth(true);
					var $window = $(window);
					var wW = $window.width();
					var wH = $window.height();
					var offset = $mcPanel.offset();
					var left = offset.left - $(document).scrollLeft();
					var top = offset.top - $(document).scrollTop();
					if( (left+mcPanelW) > wW ){
						left = wW - mcPanelW - 5;
					}
					if( (top+mcPanelH) > wH ){
						top = wH - mcPanelH - 2;
					}
					if( top < 0 ){
						top = 2;
					}
					$mcPanel.css({
						position: 'fixed',
						left: left+'px',
						top: top+'px'
					});
				},
				hide: function(){
					$inp.parent().children('.minicolors-panel').css({
						position: '',
						left: '',
						top: ''
					});
				},
				theme: 'bootstrap'
			});
		}else{
			var timer;
			$inp.change(function(){
				var $el = $(this);
				var val = $el.val();
				if (timer){
					clearTimeout(timer);
				}
				//timer = setTimeout(function(){
					themeSelectToCustom();
					me.lessVars[lessVar] = val;
					createCss();
				//}, changeDelay);
			});
		}
		function colorFormat(val){
			if(!val.match(/^#[0-9a-fA-f][0-9a-fA-f][0-9a-fA-f][0-9a-fA-f][0-9a-fA-f][0-9a-fA-f]$/i)){
				if(val.match(/^#[0-9a-fA-f][0-9a-fA-f][0-9a-fA-f]$/i)){
					return "#"+val.charAt(1)+val.charAt(1)+val.charAt(2)+val.charAt(2)+val.charAt(3)+val.charAt(3);
				}else{
					return null;
				}
			}else{
				return val;
			}
		}
	}
	function buildPanel(){
		if(!me.isShowPanel){
			$panel.hide();
			return;
		}else{
			if(Object.keys(themes.names).length>0){
				for (var k in themes.names){
					$('<option value="'+k+'">'+themes.names[k]+'</option>').appendTo($themesSelect);
				}
			}else{
				$themesSelect.remove();
				$('<a class="button" href="#">Reset</a>').appendTo($opt.find('.themes')).click(function(e){
					e.preventDefault();
					$.cookie.json = false;
					$.cookie('themeSelect', "", {path: cPath});
					$.cookie.json = true;
					me.hide();
					loading.gate(function(){
						location.reload();
					});
				});
			}
			$.cookie.json = false;
			var themeSelectC = $.cookie('themeSelect');
			$.cookie.json = true;
			if(themeSelectC === 'custom'){
				themeSelectToCustom();
			}else if(themeSelectC){
				$themesSelect.val(themeSelectC);
			}else{
				var $factory = $('#factory-theme');
				if($factory.length > 0 && $factory.css('visibility') === 'hidden'){
					var ts = themes.options[$factory.html()].style;
					$themesSelect.val(ts);
					$.cookie.json = false;
					$.cookie('themeSelect', ts, {path: cPath});
					$.cookie.json = true;
				}
			}
			$themesSelect.change(function(){
				$('.options .themes select option[value=custom]').remove();
				var href = $(this).val();
				$.cookie.json = false;
				$.cookie('themeSelect', href, {path: cPath});
				$.cookie.json = true;
				me.hide();
				loading.gate(function(){
					location.reload();
				});
			});
			$panel.css({left: -1*optW+'px'});
			$toggle.click(function(e){
				e.preventDefault();
				if($panel.hasClass('on')){
					me.hide();
				}else{
					me.show();
				}
			});
			$opt.find('.save-custom-css').click(function(e){
				e.preventDefault();
				var $content = $customCss.find('.content');
				if($.cookie('saveAsLess')){
					var lessStr='@import "theme.less";\r\n\r\n';
					for(var key in me.lessVars){
						lessStr = lessStr+'@'+key+': '+me.lessVars[key]+';\r\n';
						$content.text(lessStr);
					}
				}else{
					if(!customCss) createCss();
					$content.text(
						customCss.replace(/(\r\n|\r|\n)/g,'\r\n')
					);
				}
				new TWEEN.Tween({autoAlpha: 0, x:-450})
					.to({autoAlpha: 1, x: 0}, 400)
					.onUpdate(function(){
						$customCss.css({opacity: this.autoAlpha, visibility: (this.autoAlpha > 0 ? 'visible' : 'hidden')});
						if(Modernizr.csstransforms3d && appShare.force3D){
							$customCss.css({transform: 'translate3d('+this.x+'px, 0px, 0px)'});
						}else{
							$customCss.css({transform: 'translate('+this.x+'px, 0px)'});
						}
					})
					.easing(TWEEN.Easing.Quadratic.Out)
					.start();
			});
			$customCss.find('.close-panel').click(function(e){
				e.preventDefault();
				new TWEEN.Tween({autoAlpha: 1, x: 0})
					.to({autoAlpha: 0, x: -450}, 400)
					.onUpdate(function(){
						$customCss.css({opacity: this.autoAlpha, visibility: (this.autoAlpha > 0 ? 'visible' : 'hidden')});
						if(Modernizr.csstransforms3d && appShare.force3D){
							$customCss.css({transform: 'translate3d('+this.x+'px, 0px, 0px)'});
						}else{
							$customCss.css({transform: 'translate('+this.x+'px, 0px)'});
						}
					})
					.easing(TWEEN.Easing.Linear.None)
					.start();
			});
			tools.selectTextarea($customCss.find("textarea"));
			var colorsBg = $colors.css('background-image');
			if(!colorsBg || colorsBg == 'none'){
				var $bgIm = $('img.bg');
				if($bgIm.length>0){
					$colors.css({
						'background-image': "url('"+$bgIm.get(0).src+"')",
						'background-position': 'center center',
						'background-size': 'cover'
					});
				}
			}
		}
	}
	function createCss(isInitOnly){
		var custom = atob(customLess);
		$.cookie('lessVars', me.lessVars, {path: cPath});
		doLess(custom, function(css){
			if(!isInitOnly){
				var ems = 'edit-mode-styles';
				customCss = css;
				var $cur = $('#'+ems);
				if($cur.length<1){
					$('<style type="text/css" id="'+ems+'">\n'+css+'</style>').appendTo('head');
					$('#custom-css').remove();
				}else{
					if($cur[0].innerHTML){
						$cur[0].innerHTML = customCss;
					}else{
						$cur[0].styleSheet.cssText = customCss;
					}
				}
			}
		});
	}
	function doLess(data, callback){
		less.render(
			data,
			{	currentDirectory: "styles/themes/",
				filename: "styles/themes/theme-default.less",
				entryPath: "styles/themes/",
				rootpath: "styles/themes/styles/themes/",
				rootFilename: "styles/themes/theme-default.less",
				relativeUrls: false,
				useFileCache: me.lessVars || less.globalVars,
				compress: false,
				modifyVars: me.lessVars,
				globalVars: less.globalVars
			},
			function(e, output) {
				callback(output.css);
			}
		);
	}
	function toHex(rgb){
		if(rgb.indexOf('rgb') === -1){
			return rgb;
		}else{
			var triplet = rgb.match(/[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*([0-9]*)[^0-9]*/i);
			return "#"+digitToHex(triplet[1])+digitToHex(triplet[2])+digitToHex(triplet[3]);
		}
		function digitToHex(dig){
			if(isNaN(dig)){
				return "00";
			}else{
				var hx = parseInt(dig).toString(16);
				return hx.length == 1 ? "0"+hx : hx;
			}
		}
	}
	
	if(me.isShowPanel){
		$('<div id="customize-panel"></div>').appendTo('body').load('customize/customize.html #customize-panel>*', function(xhr, statusText, request){
			if(statusText !== "success" && statusText !== "notmodified"){
				$('#customize-panel').remove();
				script.afterConfigure();
			}else{
				$.getScript( "customize/custom-less.js", function( data, lessStatusText, jqxhr ) {
					if(lessStatusText !== "success" && lessStatusText !== "notmodified"){
						$('#customize-panel').remove();
						script.afterConfigure();
					}else{
						$panel = $('#customize-panel');
						$opt = $panel.find('.options');
						$toggle = $panel.find('.toggle-button');
						optW = $opt.width();
						$customCss = $panel.find('.custom-css');
						$themesSelect = $opt.find('.themes select');
						$colors = $opt.find('.colors');
						$.cookie.json = true;
						buildPanel();
						if(tools.getUrlParameter('save-as-less')){
							$.cookie('saveAsLess', 'yes', {path: cPath});
						}
						$.cookie.json = false;
						var tsc = $.cookie('themeSelect');
						$.cookie.json = true;
						if( tsc === 'custom' ){
							isInitialized = true;
							me.lessVars = $.cookie('lessVars');
							createCss();
							initLessVars();
							$opt.find('.options-gate').css({visibility: 'hidden'});
						}
						$window.resize(resize);
						resize();
						script.afterConfigure();
					}
				});
			}
		});
	}else{
		script.afterConfigure();
	}
};
},{"../app/app-share.js":5,"../app/themes.js":8,"../tools/tools.js":11,"../widgets/loading.js":18}],10:[function(require,module,exports){
"use strict"; var $ = jQuery;
$(function() { new (function(){
	var Customize = require('./customize/customize.js');
	var TopNav = require('./widgets/top-nav.js');
	var MenuToggle = require('./widgets/menu-toggle.js');
	var Players = require('./animation/players.js');
	var Scrolling = require('./animation/scrolling.js');
	var tools = require('./tools/tools.js');
	var ShowList = require('./widgets/show-list.js');
	var Gallery = require('./widgets/gallery.js');
	var fluid = require('./widgets/fluid.js');
	var Counter = require('./widgets/counter.js');
	var ChangeColors = require('./widgets/change-colors.js');
	var Sliders = require('./widgets/sliders.js');
	var loading = require('./widgets/loading.js');
	var CssAnimation = require('./animation/css-animation.js');
	var dotScroll = require('./widgets/dot-scroll.js');
	var Map = require('./widgets/map.js');
	var Skillbar = require('./widgets/skillbar.js');
	var AjaxForm = require('./widgets/ajax-form.js');
	var YoutubeBG = require('./widgets/youtube-bg.js');
	var VimeoBG = require('./widgets/vimeo-bg.js');
	var VideoBG = require('./widgets/video-bg.js');
	var app = require('./app/app.js');
	var OverlayWindow = require('./widgets/overlay-window.js');
	var isPoorBrowser = $('html').hasClass('poor-browser');
	var isAndroid43minus = $('html').hasClass('android-browser-4_3minus');
	var $pageTransition = $('.page-transition');
	var me = this;
	var $window = $(window);
	var $sections = $('section');
	var sectionTriggers = [];
	var lastActiveSectionHash;
	var location = document.location.hash ? document.location.href.replace(new RegExp(document.location.hash+'$'),'') : document.location.href.replace('#','');
	var $navLinks = (function(){
		var $res = jQuery();
		$('#top-nav .navbar-nav a').each(function(){
			var $this = $(this);
			if(
				(!this.hash) ||
				(
					(this.href === location+this.hash) &&
					($('section'+this.hash).length > 0)
				)
			){
				$res = $res.add($this);
			}
		});
		return $res;
	})();
	var isMobile = $('html').hasClass('mobile');
	var scrolling;
	var maxScrollPosition;
	var ticker = new (function(){
		var me = this;
		window.requestAnimFrame = (function(){
			return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function(/* function */ callback, /* DOMElement */ element){
					window.setTimeout(callback, 1000 / 60);
				};
		})();
		var lastPosition = -1;
		this.pageIsReady = false;
		(function animate(time){
			if(me.pageIsReady){
				var windowTopPos = tools.windowYOffset();
				if (lastPosition !== windowTopPos) {
					scrolling.scroll(windowTopPos);
					trigNavigationLinks(windowTopPos);
				}
				lastPosition = windowTopPos;
				TWEEN.update();
				app.tick();
			}
			if(loading.queue.length > 0) {
				(loading.queue.pop())();
			}
			requestAnimFrame(animate);
		})();
	})();
	
	this.topNav = undefined;
	this.players = Players;
	this.afterConfigure = function(){
		var hash = window.location.hash;
		if (history && history.replaceState) {
			history.replaceState("", document.title, window.location.pathname + window.location.search);
		}
		new YoutubeBG();
		new VimeoBG();
		new VideoBG();
		app.prepare(function(){
			loading.load(function (){
				$navLinks = $navLinks.add(dotScroll.links()).click(function(){
					$navLinks.removeClass('target');
					$(this).addClass('target');
				});
				me.topNav = new TopNav();
				new MenuToggle();
				scrolling = new Scrolling(me);
				widgets($('body'));
				new Gallery(onBodyHeightResize, widgets, unwidgets);
				var windowW = $window.width();
				var windowH = $window.height();
				$window.resize(function(){
					var newWindowW = $window.width();
					var newWindowH = $window.height();
					if(newWindowW!==windowW || newWindowH!==windowH){ //IE 8 fix
						windowW = newWindowW;
						windowH = newWindowH;
						fluid.setup($('body'));
						onBodyHeightResize();
					}
				});
				app.setup(function(){
					var finish = function(){
						buildSizes();
						calcNavigationLinkTriggers();
						ticker.pageIsReady = true;
						$navLinks.each(function(){
							if(this.href==location){
								$(this).addClass('active');
							}
						});
						$('.bigtext').each(function(){
							$(this).bigtext();
						});
						app.ungated();
						setTimeout(function(){
							loading.ungate();
							navigate(window.location.href, hash);
						});
					};
					var test = function(){
						var $excl = $('.non-preloading, .non-preloading img');
						var $imgs = $('img').not($excl);
						for(var i=0; i<$imgs.length; i++){
							if( (!$imgs[i].width || !$imgs[i].height) && (!$imgs[i].naturalWidth || !$imgs[i].naturalHeight) ){
								setTimeout(test, 100);
								return;
							}
						}
						finish();
					}
					test();
				});
			});
		});
	}
	function onBodyHeightResize() {
		buildSizes();
		scrolling.scroll(tools.windowYOffset());
		calcNavigationLinkTriggers();
	}
	function widgets($context){
		new ShowList($context, me);
		new Sliders($context);
		if(!isMobile) $context.find('.hover-dir').each( function() { $(this).hoverdir({speed: 300}); } );
		$context.find("a").click(function(e){
			var $this = $(this);
			if($this.data('toggle')) return;
			navigate(this.href, this.hash, e, $this)
		});
		fluid.setup($context);
		new Map($context);
		new Counter($context, me);
		new ChangeColors($context);
		new Skillbar($context, me);
		$context.find("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
		new AjaxForm($context);
		new CssAnimation($context, me);
		$('.widget-tabs a').click(function (e) {
			e.preventDefault()
			$(this).tab('show')
		});
		$('.widget-tooltip').tooltip();
		$('.widget-popover').popover();
		$context.find('video').each(function(){ // IE 9 Fix
			if($(this).attr('muted')!==undefined){
				this.muted=true;
			}
		});
		$context.find('.open-overlay-window').each(function(){
			var $this = $(this);
			var $overlay = $($this.data('overlay-window'));
			var overlayWindow = new OverlayWindow($overlay);
			$this.click(function(e){
				e.preventDefault();
				overlayWindow.show();
			})
		});
		if(isPoorBrowser){
			$context.find('.tlt-loop').remove();
		}else{
			$context.find('.textillate').each(function(){
				var $tlt = $(this);
				$tlt.textillate(eval('('+$tlt.data('textillate-options')+')'));
			});
		}
	}
	function unwidgets($context){
		new Sliders($context, true);
		$context.find('.player').each(function(){
			var ind = $(this).data('player-ind');
			me.players[ind].pause();
			me.players.splice(ind, 1);
		})
	}
	function navigate(href, hash, e, $elem) {
		var hrefBH = hash ? href.replace(new RegExp(hash+'$'), '') : href;
		if(location === hrefBH && hash && hash.indexOf("!") === -1){
			var $content = $(hash);
			if (e) {
				e.preventDefault();
			}
			if($content.length > 0){
				var offset = $content.offset().top - me.topNav.state2H;
				var tn = $content.get(0).tagName.toLowerCase();
				if(tn === 'h1' || tn === 'h2' || tn === 'h3' || tn === 'h4' || tn === 'h5' || tn === 'h6'){
					offset -= 20;
				}
				if (offset < 0) offset = 0;
				tools.scrollTo(offset);
			}else{
				tools.scrollTo(0);
			}
		}else if(e && (href !== location+'#')){
			if(!$elem.attr('target')){
				var pageTransition = function(){
					e.preventDefault();
					me.topNav.state1();
					loading.gate(function(){
						window.location = href;
					});
				}
				if($elem.hasClass('page-transition')){
					pageTransition();
				}else{
					$pageTransition.each(function(){
						var container = $(this).get(0);
						if($.contains(container, $elem[0])){
							pageTransition();
						}
					});
				}
			}
		}
	}
	function calcNavigationLinkTriggers(){
		var wh = $window.height();
		var triggerDelta = wh/3;
		sectionTriggers = [];
		$sections.each(function(i){
			var $s = $(this);
			var id = $s.attr('id');
			if(id){
				sectionTriggers.push({hash: '#'+id, triggerOffset: $s.data('position')-triggerDelta});
			}
		});
		trigNavigationLinks(tools.windowYOffset());
	}
	function trigNavigationLinks(windowTopPos){
		var activeSectionHash;
		for(var i=0; i<sectionTriggers.length; i++){
			if(sectionTriggers[i].triggerOffset<windowTopPos){
				activeSectionHash = sectionTriggers[i].hash;
			}
		}
		if(activeSectionHash!=lastActiveSectionHash){
			var sectionLink = location + activeSectionHash;
			lastActiveSectionHash = activeSectionHash;
			$navLinks.each(function(){
				var $a = $(this);
				if(this.href === sectionLink){
					$a.addClass('active');
					$a.removeClass('target');
				}else{
					$a.removeClass('active');
				}
			});
			app.changeSection(me, activeSectionHash);
		}
	}
	function buildSizes(){
		app.buildSizes(me);
		maxScrollPosition = $('body').height() - $window.height();
		for(var i=0; i<me.players.length; i++){
			var $v = me.players[i].$view;
			$v.data('position', $v.offset().top);
		}
	}
	var animEnd = function(elems, end, modern, callback, time){
		var additionTime = 100;
		var defaultTime = 1000;
		return elems.each(function() {
			var elem = this;
			if (modern && !isAndroid43minus) {
				var done = false;
				$(elem).bind(end, function() {
					done = true;
					$(elem).unbind(end);
					return callback.call(elem);
				});
				if(time >= 0 || time === undefined){
					var wTime = time === undefined ? 1000 : defaultTime + additionTime;
					setTimeout(function(){
						if(!done){
							$(elem).unbind(end);
							callback.call(elem);
						}
					}, wTime)
				}
			}else{
				callback.call(elem);
			}
		});
	}
	$.fn.animationEnd = function(callback, time) {
		return animEnd(this, tools.animationEnd, Modernizr.cssanimations, callback, time);
	};
	$.fn.transitionEnd = function(callback, time) {
		return animEnd(this, tools.transitionEnd, Modernizr.csstransitions, callback, time);
	};
	$.fn.stopTransition = function(){
		return this.css({
			'-webkit-transition': 'none',
			'-moz-transition': 'none',
			'-ms-transition': 'none',
			'-o-transition': 'none',
			'transition':  'none'
		});
	}
	$.fn.cleanTransition = function(){
		return this.css({
			'-webkit-transition': '',
			'-moz-transition': '',
			'-ms-transition': '',
			'-o-transition': '',
			'transition':  ''
		});
	}
	$.fn.nonTransition =  function(css) {
		return this.stopTransition().css(css).cleanTransition();
	};
	$.fn.transform =  function(str, origin) {
		return this.css(tools.transformCss(str, origin));
	};
	$('video').each(function(){ // IE 9 Fix
		if($(this).attr('muted')!==undefined){
			this.muted=true;
		}
	});
	new Customize(me);
})();});
},{"./animation/css-animation.js":1,"./animation/players.js":2,"./animation/scrolling.js":3,"./app/app.js":6,"./customize/customize.js":9,"./tools/tools.js":11,"./widgets/ajax-form.js":12,"./widgets/change-colors.js":13,"./widgets/counter.js":14,"./widgets/dot-scroll.js":15,"./widgets/fluid.js":16,"./widgets/gallery.js":17,"./widgets/loading.js":18,"./widgets/map.js":19,"./widgets/menu-toggle.js":20,"./widgets/overlay-window.js":21,"./widgets/show-list.js":22,"./widgets/skillbar.js":23,"./widgets/sliders.js":24,"./widgets/top-nav.js":25,"./widgets/video-bg.js":26,"./widgets/vimeo-bg.js":27,"./widgets/youtube-bg.js":28}],11:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var me = this;
	var script = require('../script.js');
	var isAndroidBrowser4_3minus = $('html').hasClass('android-browser-4_3minus');
	this.animationEnd = 'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';
	this.transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend';
	this.transition = ['-webkit-transition', '-moz-transition', '-ms-transition', '-o-transition', 'transition'];
	this.transform = ["-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform", "transform"];
	this.property = function(keys, value, obj){
		var res = obj ? obj : {};
		for(var i=0; i<keys.length; i++){
			res[keys[i]]=value;
		}
		return res;
	}
	this.windowYOffset = function(){
		return window.pageYOffset != null ? window.pageYOffset : (document.compatMode === "CSS1Compat" ? document.documentElement.scrollTop : document.body.scrollTop);
	}
	this.getUrlParameter = function(sParam){
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam) {
				return decodeURI(sParameterName[1]);
			}
		}
	}
	this.selectTextarea = function($el){
		$el.focus(function() {
			var $this = $(this);
			$this.select();
			// Work around Chrome's little problem
			$this.mouseup(function() {
				// Prevent further mouseup intervention
				$this.unbind("mouseup");
				return false;
			});
		});
	}
	var timer;
	this.time = function(label){
		if(!timer){
			timer = Date.now();
			console.log('==== Timer started'+(label ? ' | '+label : ''))
		}else{
			var t = Date.now();
			console.log('==== '+(t-timer)+' ms'+(label ? ' | '+label : ''));
			timer = t;
		}
	}
	this.scrollTo = function (y, callback, time) {
		if(time === undefined) time = 1200;
		new TWEEN.Tween({y: me.windowYOffset()})
			.to({y: Math.round(y)}, time)
			.onUpdate(function(){
				//$w.scrollTop(this.y);
				window.scrollTo(0, this.y);
			})
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onComplete(function () {
				if(callback){
					callback();
				}
			})
			.start();
	}
	this.androidStylesFix = function($q){
		if(isAndroidBrowser4_3minus){
			$q.hide();
			$q.get(0).offsetHeight;
			$q.show();
		}
	}
	this.transformCss = function(str, origin){
		var res = {
			'-webkit-transform': str,
			'-moz-transform': str,
			'-ms-transform': str,
			'-o-transform': str,
			'transform':  str
		};
		if(origin){
			res['-webkit-transform-origin'] = origin;
			res['-moz-transform-origin'] = origin;
			res['-ms-transform-origin'] = origin;
			res['-o-transform-origin'] = origin;
			res['transform-origin'] = origin;
		}
		return res;
	}
})();
},{"../script.js":10}],12:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context) {
	var loading = require('./loading.js');
	var $gateLoader = $('.gate .loader');
	$context.find('.ajax-form').each(function() {
		var $frm = $(this);
		$frm.submit(function(e) {
			if($frm.find('.help-block ul').length < 1){
				$gateLoader.addClass('show');
				loading.gate(function() {
					var message = function(msg) {
						$('<div class="ajax-form-alert alert heading fade in text-center">	<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> ' + msg + '</div>')
								.addClass($frm.data('message-class')).appendTo('body');
						loading.ungate();
						$gateLoader.removeClass('show');
					};
					$.ajax({
						type: $frm.attr('method'),
						url: $frm.attr('action'),
						data: $frm.serialize(),
						success: function(data) {
							$frm[0].reset();
							message(data);
						},
						error: function(xhr, str) {
							message('Error: ' + xhr.responseCode);
						}
					});
				});
				e.preventDefault();
			}
		});
	});
};


},{"./loading.js":18}],13:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context){
	var themes = require('../app/themes.js');
	$context.find('.change-colors').each(function(){
		var $group = $(this);
		var $target = $($group.data('target'));
		var $links = $group.find('a');
		var currentColors;
		for(var i=0; i<themes.colors; i++){
			var colors = 'colors-'+String.fromCharCode(65+i).toLowerCase();
			if($target.hasClass(colors)){
				currentColors = colors;
				$links.each(function(){
					var $el = $(this);
					if($el.data('colors') === currentColors){
						$el.addClass('active');
					}
				})
			}
		}
		$links.click(function(e){
			e.preventDefault();
			var $link = $(this);
			$target.removeClass(currentColors);
			currentColors = $link.data('colors');
			$target.addClass(currentColors);
			$links.removeClass('active');
			$link.addClass('active');
		});
	});
};
},{"../app/themes.js":8}],14:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, script){
	var isPoorBrowser = $('html').hasClass('poor-browser');
	if(isPoorBrowser) return;
	$context.find('.counter .count').each(function(){
		var $this = $(this);
		var count = parseInt($this.text());
		var cnt = {n: 0}
		var tw = new TWEEN.Tween(cnt)
			.to({n: count}, 1000)
			.onUpdate(function(){
				$this.text(Math.round(this.n));
			})
			.easing(TWEEN.Easing.Quartic.InOut);
		var pause = function(){
			tw.stop();
		}
		var resume = function(){
			cnt.n = 0;
			tw.start();
		}
		var start = resume;
		script.players.addPlayer($this, start, pause, resume);
	});
};
},{}],15:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var isMobile = $('html').hasClass('mobile');
	var $sec = $('body>section[id]');
	var $lnks;
	if(!isMobile && $sec.length>1){
		var $ul = $('#dot-scroll');
		$sec.each(function(){
			$ul.append('<li><a href="#'+$(this).attr('id')+'"><span></span></a></li>');
		});
		$lnks = $ul.find('a');
	}else{
		$lnks = jQuery();
	}
	this.links = function(){
		return $lnks;
	}
})();
},{}],16:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	this.setup = function($context){
		$context.find('.fluid *').each(function() {
			var $el = $(this);
			var $wrap = $el.parent('.fluid');
			var newWidth = $wrap.width();
			var ar = $el.attr('data-aspect-ratio');
			if(!ar){
				ar = this.height / this.width;
				$el
					// jQuery .data does not work on object/embed elements
					.attr('data-aspect-ratio', ar)
					.removeAttr('height')
					.removeAttr('width');
			}
			var newHeight = Math.round(newWidth * ar);
			$el.width(Math.round(newWidth)).height(newHeight);
			$wrap.height(newHeight);
		});
	};
})();
},{}],17:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(onBodyHeightResize, widgets, unwidgets){
	var tools = require('../tools/tools.js');
	var OverlayWindow = require('./overlay-window.js');
	var $topNav = $('#top-nav');
	$('.gallery').each(function(i){
		var $gallery = $(this);
		var $overlay = $($gallery.data('overlay'));
		var overlayWindow = new OverlayWindow($overlay, widgets, unwidgets);
		var $overlayNext = $overlay.find('.next');
		var $overlayPrevios = $overlay.find('.previos');
		var $overlayClose = $overlay.find('.cross');
		var isFilter = false;
		var defaultGroup = $gallery.data('default-group') ? $gallery.data('default-group') : 'all';
		var isNonFirstLayout = false;
		if(!defaultGroup) defaultGroup = 'all';
		var $grid = $gallery.find('.grid')
			.shuffle({
				group: defaultGroup,
				speed: 500
			})
			.on('filter.shuffle', function() {
				isFilter = true;
			})
			.on('layout.shuffle', function() {
				if(isNonFirstLayout){
					onBodyHeightResize(true);
				}else{
					onBodyHeightResize();
					isNonFirstLayout = true;
				}
			})
			.on('filtered.shuffle', function() {
				if(isFilter){
					isFilter = false;
				}
			});
		var $btns = $gallery.find('.filter a');
		var $itemView = $gallery.find('.item-view');
		var $all = $gallery.find('.filter a[data-group=all]');
		var $items = $grid.find('.item');
		var currentGroup = defaultGroup;
		var $currentItem;
		$gallery.find('.filter a[data-group='+defaultGroup+']').addClass('active');
		$items.addClass('on');
		$overlayClose.click(function(e){
			$currentItem = false;
		});
		$btns.click(function(e){
			e.preventDefault();
			if(isFilter) return;
			var $this = $(this);
			var isActive = $this.hasClass( 'active' );
			var	group = isActive ? 'all' : $this.data('group');
			if(currentGroup !== group){
				currentGroup = group;
				$btns.removeClass('active');
				if(!isActive){
					$this.addClass('active');
				}else{
					$all.addClass('active');
				}
				$grid.shuffle( 'shuffle', group );
				$items.each(function(){
					var $i = $(this);
					var filter = eval($i.data('groups'));
					if( group == 'all' || $.inArray(group, filter)!=-1 ){
						$i.addClass('on');
					}else{
						$i.removeClass('on');
					}
				});
			}
		});
		$items.click(function(e){
			e.preventDefault();
			openItem($(this));
		});
		function openItem($item){
			$currentItem = $item;
			var url = $item.children('a')[0].hash.replace('#!','');
			overlayWindow.show(url +' .item-content');
		}
		$overlayNext.click(function(e){
			if(!$currentItem){
				return;
			}
			e.preventDefault();
			var $i = $currentItem.nextAll('.on').first();
			if($i.length<1){
				$i = $items.filter('.on').first();
			}
			openItem($i);
		});
		$overlayPrevios.click(function(e){
			if(!$currentItem){
				return;
			}
			e.preventDefault();
			var $i = $currentItem.prevAll('.on').first();
			if($i.length<1){
				$i = $items.filter('.on').last();
			}
			openItem($i);
		});
	});
};
},{"../tools/tools.js":11,"./overlay-window.js":21}],18:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = new (function(){
	var tools = require('../tools/tools.js');
	var $gate = $('.gate');
	var $gateBar = $gate.find('.gate-bar');
	var $gateLoader = $gate.find('.loader');
	var isAndroidBrowser4_3minus = $('html').hasClass('android-browser-4_3minus');
	var me = this;
	this.queue = [];
	this.load = function(callback){
		var urls = [];
		var $excl = $('.non-preloading, .non-preloading img');
		$('*:visible:not(script)').not($excl).each(function(){
			var $el = $(this);
			var name = $el[0].nodeName.toLowerCase();
			var bImg = $el.css("background-image");
			var src = $el.attr('src');
			var func = $el.data('loading');
			if(func){
				urls.push(func);
			}else if(name === 'img' && src && $.inArray(src, urls) === -1){
				urls.push(src);
			}else if (bImg != 'none'){
				var murl = bImg.match(/url\(['"]?([^'")]*)/i);
				if(murl && murl.length>1 && $.inArray(murl[1], urls) === -1){
					urls.push(murl[1]);
				}
			}
		});
		var loaded = 0;
		if(urls.length === 0){
			callback();
		}else{
			$gateLoader.addClass('show');
			var waterPerc = 0;
			var done = function(){
				loaded++;
				waterPerc = loaded/urls.length * 100;
				$gateBar.css({width: waterPerc+'%'});
				//$gateCount.html(Math.ceil(waterPerc));
				if(loaded === urls.length){
					if($gate.length<1){
						callback();
					}else{
						$gateLoader.transitionEnd(function(){
							$gateLoader.removeClass('hided');
							callback();
						}, 200).addClass('hided').removeClass('show');
					}
				}
			}
			for(var i=0; i<urls.length; i++){
				if(typeof(urls[i]) == 'function'){
					urls[i](done);
				}else{
					var img = new Image();
					$(img).one('load', function(){me.queue.push(done)});
					img.src = urls[i];
				}
			}
		}
	}
	this.gate = function(callback){
		//$gateCount.html('0');
		$gateBar.css({width: '0%'});
		$gate.transitionEnd(function(){
			if(callback){
				callback();
			}
		}).css({opacity: 1, visibility: 'visible'});
	}
	this.ungate = function(callback){
		$gate.transitionEnd(function(){
			if(isAndroidBrowser4_3minus){
				tools.androidStylesFix($('body'));
			}
			if(callback){
				callback();
			}
		}).css({opacity: 0, visibility: 'hidden'});
	};
})();
},{"../tools/tools.js":11}],19:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context){
	var tools = require('../tools/tools.js');
	var OverlayWindow = require('./overlay-window.js');
	if(typeof(google) == "undefined") return;
	$context.find('.map-open').each(function(){
		var $mapOpen = $(this);
		var $overlay = $($mapOpen.data('map-overlay'));
		var $mapCanvas = $overlay.find('.map-canvas');
		var mapOptions = {
			center: new google.maps.LatLng($mapCanvas.data('latitude'), $mapCanvas.data('longitude')),
			zoom: $mapCanvas.data('zoom'),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		var markers = [];
		$mapCanvas.find('.map-marker').each(function(){
			var $marker = $(this);
			markers.push({
				latitude: $marker.data('latitude'),
				longitude: $marker.data('longitude'),
				text: $marker.data('text')
			});
		});
		$mapCanvas.addClass('close-map').wrap('<div class="map-view"></div>');
		var $mapView = $mapCanvas.parent();
		var overlayWindow = new OverlayWindow($overlay, false, false, function(){
			new TWEEN.Tween({autoAlpha: 1})
					.to({autoAlpha: 0}, 500)
					.onUpdate(function(){
						$mapView.css({opacity: this.autoAlpha, visibility: (this.autoAlpha > 0 ? 'visible' : 'hidden')});
					})
					.easing(TWEEN.Easing.Linear.None)
					.start();
		});
		var isInited = false;
		$mapOpen.click(function(event) {
			event.preventDefault();
			overlayWindow.show(false, function() {
				if (!isInited) {
					isInited = true;
					var map = new google.maps.Map($mapCanvas[0], mapOptions);
					var addListener = function(marker, text) {
						var infowindow = new google.maps.InfoWindow({
							content: text
						});
						google.maps.event.addListener(marker, "click", function() {
							infowindow.open(map, marker);
						});
					}
					for (var i = 0; i < markers.length; i++) {
						var marker = new google.maps.Marker({
							map: map,
							position: new google.maps.LatLng(markers[i].latitude, markers[i].longitude)
						});
						var text = markers[i].text;
						if (text) {
							addListener(marker, text);
						}
					}
				}
				var $oc = $overlay.find('.overlay-control');
				$mapView.css({height: ($(window).height() - $oc.height()) + 'px'});
				new TWEEN.Tween({autoAlpha: 0})
					.to({autoAlpha: 1}, 500)
					.onUpdate(function(){
						$mapView.css({opacity: this.autoAlpha, visibility: (this.autoAlpha > 0 ? 'visible' : 'hidden')});
					})
					.easing(TWEEN.Easing.Linear.None)
					.start();
			});
		});
	});
}
},{"../tools/tools.js":11,"./overlay-window.js":21}],20:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var $toggle = $('.menu-toggle');
	$toggle.click(function(e){
		e.preventDefault();
		var $tg = $(this);
		if($tg.hasClass('ext-nav-toggle')){
			var targetQ = $tg.data('target');
			var $extNav = $(targetQ);
			var $clickEls = $(targetQ+',#top-nav a:not(.menu-toggle),.page-border a');
			var clickHnd = function() {
				$extNav.removeClass('show');
				$tg.removeClass('show');
				$('body').removeClass('ext-nav-show');
				$('html, body').css({overflow: '', position: ''});
				$clickEls.unbind('click', clickHnd);
			}
			if($tg.hasClass('show')){
				$extNav.removeClass('show');
				$tg.removeClass('show');
				$('body').removeClass('ext-nav-show');
				$clickEls.unbind('click', clickHnd);
			}else{
				$extNav.addClass('show');
				$tg.addClass('show');
				$('body').addClass('ext-nav-show');
				$clickEls.bind('click', clickHnd);
			}
		}else{
			if($tg.hasClass('show')){
				$tg.removeClass('show');
			}else{
				$tg.addClass('show');
			}
		}
	});
};
},{}],21:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($overlay, widgets, unwidgets, hideFunc){
	var $overlayClose = $overlay.find('.cross');
	var $overlayZoom = $($overlay.data('overlay-zoom'));
	var $overlayView = $overlay.find('.overlay-view');
	var $overlayClose = $overlay.find('.cross');
	var me = this;
	this.show = function(load, callback) {
		var open = function() {
			$overlayZoom.addClass('overlay-zoom');
			$overlay.transitionEnd(function(){
				if (load) {
					var $loader = $overlay.find('.loader');
					var $loadedContent = $('<div class="loaded-content"></div>');
					$loader.addClass('show');
					$loadedContent.addClass('content-container').appendTo($overlayView);
					$loadedContent.load(load, function(xhr, statusText, request) {
						if (statusText !== "success" && statusText !== "notmodified") {
							$loadedContent.text(statusText);
							return;
						}
						var $images = $loadedContent.find('img');
						var nimages = $images.length;
						if (nimages > 0) {
							$images.load(function() {
								nimages--;
								if (nimages === 0) {
									show();
								}
							});
						} else {
							show();
						}
						function show() {
							if(widgets){
								widgets($loadedContent);
							}
							$loadedContent.addClass('show');
							$loader.removeClass('show');
							if(callback){
								callback();
							}
						}
					});
				}else{
					if(callback){
						callback();
					}
				}
			}).addClass('show');
		};
		if ($overlay.hasClass('show')) {
			me.hide(open);
		} else {
			open();
		}
	}
	this.hide = function(callback) {
		$overlayZoom.removeClass('overlay-zoom');
		$overlay.removeClass('show');
		setTimeout(function() {
			var $loadedContent = $overlay.find('.loaded-content');
			if($loadedContent.length>0){
				if(unwidgets){
					unwidgets($loadedContent);
				}
				stopIframeBeforeRemove($loadedContent, function() {
					$loadedContent.remove();
					if(hideFunc){
						hideFunc();
					}
					if (callback) {
						callback();
					}
				});
			}else{
				if(hideFunc){
					hideFunc();
				}
				if (callback) {
					callback();
				}
			}
		}, 500);
	}
	function stopIframeBeforeRemove($context, callback) {
		var isDoStop = $('html').hasClass('ie9')
				|| $('html').hasClass('ie10');
		if (isDoStop) {
			$context.find('iframe').attr('src', '');
			setTimeout(function() {
				callback();
			}, 300);
		} else {
			callback();
		}
	}
	$overlayClose.click(function(e){
		e.preventDefault();
		me.hide();
	});
};
},{}],22:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, script){
	$context.find('.show-list').each(function(){
		$(this).wrapInner('<div class="wrapper"></div>').textillate({
			loop:true,
			in:{effect:'fadeInRight', reverse:true},
			out:{effect:'fadeOutLeft', sequence:true},
			selector:'.wrapper'
		});
	});
};
},{}],23:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, script){
	var isPoorBrowser = $('html').hasClass('poor-browser');
	$context.find('.skillbar').each(function(){
		var $this = $(this)
		var $bar = $this.find('.skillbar-bar');
		var perc =  parseInt($this.attr('data-percent').replace('%',''));
		if(isPoorBrowser){
			$bar.css({width: perc+'%'});
		}else{
			var w = {width: 0}
			var tw = new TWEEN.Tween(w)
				.to({width: perc}, 1000)
				.onUpdate(function(){
					$bar.css({width: this.width+'%'});
				})
				.easing(TWEEN.Easing.Quartic.Out);
			var pause = function(){
				tw.stop();
			};
			var resume = function(){
				w.width = 0;
				tw.start();
			};
			var start = resume;
			script.players.addPlayer($this, start, pause, resume);
		}
	});
};
},{}],24:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function($context, isRemoved){
	if(isRemoved){
		$context.find(".carousel, .slider").each(function(){
			$(this).slick('unslick');
		});
		return;
	}
	var tools = require('../tools/tools.js');
	$context.find(".slider").each(function(){
		var $this = $(this)
		$this.slick({
			autoplay: true,
			dots: true
		});
	});
	$context.find(".carousel").each(function(){
		var $this = $(this)
		$this.slick({
			autoplay: false,
			dots: true,
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 3,
			responsive: [
				{
					breakpoint: 1000,
					settings: {
						dots: true,
						slidesToShow: 2,
						slidesToScroll: 2
					}
				},
				{
					breakpoint: 480,
					settings: {
						dots: true,
						slidesToShow: 1,
						slidesToScroll: 1
					}
				}
			]
		});
	});
}
},{"../tools/tools.js":11}],25:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var tools = require('../tools/tools.js');
	var $topNav =  $('#top-nav');
	var $body = $('body');
	var isTopNav = $topNav.length > 0;
	var $topMenuNav =  $topNav.find('.navbar-collapse');
	var upperH = 20;
	var bigTopNav = isTopNav ? 89 : 0;
	var smallTopNav = isTopNav ? 49 : 0;
	var themes = require('../app/themes.js');
	var topNavState1Top = (function(){
		if(isTopNav){
			return upperH;
		}else{
			return 0;
		}
	})();
	var isTopNavState1 = false;
	var isTopNavState2 = false;
	var me = this;
	var state1Colors = $topNav.data('state1-colors');
	var state2Colors = $topNav.data('state2-colors');
	this.state1H = bigTopNav;
	this.state2H = smallTopNav;
	this.state1Top = function(){ return topNavState1Top; };
	this.state1 = function(){
		if(isTopNav && !isTopNavState1){
			$body.removeClass('state2').addClass('state1');
			isTopNavState1 = true;
			isTopNavState2 = false;
			tools.androidStylesFix($topNav);
		}
	};
	this.state2 = function(){
		if(isTopNav && !isTopNavState2){
			$body.removeClass('state1').addClass('state2');
			isTopNavState1 = false;
			isTopNavState2 = true;
			tools.androidStylesFix($topNav);
		}
	};
	this.$menu = function(){
		return $topMenuNav;
	};
	if(isTopNav){
		me.state1();
		$topMenuNav.find('a:not(.dropdown-toggle)').click(function(){
			$topNav.find('.navbar-collapse.in').collapse('hide');
			$topNav.find('.menu-toggle.navbar-toggle').removeClass('show');
		});
		$(window).resize(function(){
			$topNav.find('.navbar-collapse.in').collapse('hide');
			$topNav.find('.menu-toggle.navbar-toggle').removeClass('show');
		});
	}
};
},{"../app/themes.js":8,"../tools/tools.js":11}],26:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var $videoBgs = $(".video-bg");
	if($videoBgs.length <1){
		return;
	}
	var isPlayVideo = (function(){
		var isMobile = $('html').hasClass('mobile');
		var v=document.createElement('video');
		var canMP4 = v.canPlayType ? v.canPlayType('video/mp4') : false;
		return canMP4 && !isMobile;
	})();
	if( !isPlayVideo ){
		$videoBgs.each(function(){
			var $videoBg = $(this);
			var alt = $videoBg.data('alternative');
			if(alt){
				var $img = $('<img alt class="bg" src="'+alt+'"/>');
				$videoBg.after($img).remove();
			}
		});
		return;
	}
	$videoBgs.each(function(){
		var $divBg = $(this);
		$divBg.data('loading', function(done){
			var $videoBg = $('<video class="video-bg"></video>');
			if($divBg.data('mute')==='yes') $videoBg[0].muted = true;
			var vol = $divBg.data('volume');
			if(vol !== undefined) $videoBg[0].volume= vol/100;
			var doDone = function(){
				var vw = $videoBg.width();
				var vh = $videoBg.height();
				var vr = vw/vh;
				var $window = $(window);
				var resize = function(){
					var ww = $window.width();
					var wh = $window.height();
					var wr = ww/wh;
					var w, h;
					if(vr > wr){
						h = Math.ceil(wh);
						w = Math.ceil(h * vr);
					}else{
						w = Math.ceil(ww);
						h = Math.ceil(w / vr);
					}
					$videoBg.css({
						width:  w+'px',
						height: h+'px',
						top: Math.round((wh - h)/2)+'px',
						left: Math.round((ww - w)/2)+'px'
					});
				};
				$window.resize(resize);
				resize();
				$videoBg[0].play();
				done();
			};
			$videoBg.on('ended', function(){
				this.currentTime = 0;
				this.play();
				if(this.ended) {
					this.load();
				}
			});
			var isNotDone = true;
			$videoBg.on('canplaythrough', function(){
				if(isNotDone){
					isNotDone = false;
					doDone();
				}else{
					this.play();
				}
			});
			$videoBg[0].src = $divBg.data('video');
			$videoBg[0].preload="auto";
			$divBg.after($videoBg);
			$divBg.remove();
		});
	});
};
},{}],27:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var $vimeoBgs = $(".vimeo-bg");
	if($vimeoBgs.length <1){
		return;
	}
	if($('html').hasClass('mobile')){
		$vimeoBgs.each(function(){
			var $vimeoBg = $(this);
			var alt = $vimeoBg.data('alternative');
			if(alt){
				var $img = $('<img alt class="bg" src="'+alt+'"/>');
				$vimeoBg.after($img).remove();
			}
		});
		return;
	}
	var dones = [];
	$vimeoBgs.each(function(i){
		var $vimeoBg = $(this);
		var elId = $vimeoBg.attr('id');
		if(!elId) {
			elId = 'vimeo-bg-'+i;
			$vimeoBg.attr('id', elId);
		}
		$vimeoBg.data('loading', function(done){
			dones[elId] = done;
		});
	});
	$.getScript( "https://f.vimeocdn.com/js/froogaloop2.min.js" )
		.done(function( script, textStatus ) {
			$vimeoBgs.each(function(){
				var $vimeoBgDiv = $(this);
				var id = $vimeoBgDiv.attr('id');
				var volume = (function(){
					var r = $vimeoBgDiv.data('volume');
					return r === undefined ? 0 : r;
				})();
				var videoId = $vimeoBgDiv.data('video');
				var $vimeoBg = $('<iframe class="vimeo-bg" src="https://player.vimeo.com/video/'+videoId+'?api=1&badge=0&byline=0&portrait=0&title=0&autopause=0&player_id='+id+'&loop=1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
				$vimeoBgDiv.after($vimeoBg);
				$vimeoBgDiv.remove();
				$vimeoBg.attr('id', id);
				var player = $f($vimeoBg[0]);
				player.addEvent('ready', function() {
					var resize = function(vRatio){
						var windowW = $(window).width();
						var windowH = $(window).height();
						var iFrameW = $vimeoBg.width();
						var iFrameH = $vimeoBg.height();
						var ifRatio = iFrameW/iFrameH;
						var wRatio = windowW/windowH;
						//var vRatio = ratio === undefined ? ifRatio : eval(ratio);
						var setSize = function(vw, vh){
							var ifw, ifh;
							if(ifRatio > vRatio){
								ifh = Math.ceil(vh);
								ifw = Math.ceil(ifh * ifRatio);
							}else{
								ifw = Math.ceil(vw);
								ifh = Math.ceil(ifw / ifRatio);
							}
							$vimeoBg.css({
								width:  ifw+'px',
								height: ifh+'px',
								top: Math.round((windowH - ifh)/2)+'px',
								left: Math.round((windowW - ifw)/2)+'px',
							});
						}
						if(wRatio > vRatio){
							var vw = windowW;
							var vh = vw/vRatio;
							setSize(vw, vh);
						}else{
							var vh = windowH;
							var vw = vh * vRatio;
							setSize(vw, vh);
						}
					};
					player.addEvent('finish', function(){
						player.api('play');
					});
					var isNotDone = true;
					player.addEvent('play', function(){
						if(isNotDone){
							isNotDone = false;
							dones[id]();
						}
					});
					player.api('setVolume', volume);
					player.api('getVideoWidth', function (value, player_id) {
						var w = value
						player.api('getVideoHeight', function (value, player_id) {
							var h = value;
							var vRatio = w / h;
							$(window).resize(function(){resize(vRatio);});
							resize(vRatio);
							player.api('play');
						});
					});
				});
			});
		})
		.fail(function( jqxhr, settings, exception ) {
			console.log( 'Triggered ajaxError handler.' );
		});
};
},{}],28:[function(require,module,exports){
"use strict"; var $ = jQuery;
module.exports = function(){
	var $youtubeBgs = $(".youtube-bg");
	if($youtubeBgs.length <1){
		return;
	}
	if($('html').hasClass('mobile')){
		$youtubeBgs.each(function(){
			var $youtubeBg = $(this);
			var alt = $youtubeBg.data('alternative');
			if(alt){
				var $img = $('<img alt class="bg" src="'+alt+'"/>');
				$youtubeBg.after($img).remove();
			}
		});
		return;
	}
	var dones = [];
	$youtubeBgs.each(function(i){
		var $youtubeBg = $(this);
		var elId = $youtubeBg.attr('id');
		if(!elId) {
			elId = 'youtube-bg-'+i;
			$youtubeBg.attr('id', elId);
		}
		$youtubeBg.data('loading', function(done){
			dones[elId] = done;
		});
	});
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	window.onYouTubeIframeAPIReady = function(){
		$youtubeBgs.each(function(){
			var $youtubeBg = $(this);
			var videoId = $youtubeBg.data('video');
			var vol = $youtubeBg.data('volume');
			var mute = $youtubeBg.data('mute');
			var elId = $youtubeBg.attr('id');
			var isNotDone = true;
			var player = new YT.Player(elId, {
				videoId: videoId,
				playerVars: {html5: 1, controls: 0, 'showinfo': 0, 'modestbranding': 1, 'rel': 0, 'allowfullscreen': true, 'iv_load_policy': 3, wmode: 'transparent' },
				events: {
					onReady: function(event){
						var resize = function(){
							var $iFrame = $(event.target.getIframe());
							var windowW = $(window).width();
							var windowH = $(window).height();
							var iFrameW = $iFrame.width();
							var iFrameH = $iFrame.height();
							var ifRatio = iFrameW/iFrameH;
							var wRatio = windowW/windowH;
							var vRatio = (function(){
								var r = $youtubeBg.data('ratio');
								return r === undefined ? ifRatio : eval(r);
							})(); 
							var setSize = function(vw, vh){
								var ifw, ifh;
								if(ifRatio > vRatio){
									ifh = Math.ceil(vh);
									ifw = Math.ceil(ifh * ifRatio);
								}else{
									ifw = Math.ceil(vw);
									ifh = Math.ceil(ifw / ifRatio);
								}
								$iFrame.css({
									width:  ifw+'px',
									height: ifh+'px',
									top: Math.round((windowH - ifh)/2)+'px',
									left: Math.round((windowW - ifw)/2)+'px',
								});
							}
							if(wRatio > vRatio){
								var vw = windowW;
								var vh = vw/vRatio;
								setSize(vw, vh);
							}else{
								var vh = windowH;
								var vw = vh * vRatio;
								setSize(vw, vh);
							}
						};
						$(window).resize(resize);
						resize();
						event.target.setPlaybackQuality('highres');
						if(vol !== undefined) event.target.setVolume(vol);
						if(mute === 'yes' || mute === undefined) event.target.mute();
						event.target.playVideo();
					},
					onStateChange: function(event){
						if(isNotDone && event.data === YT.PlayerState.PLAYING){
							isNotDone = false;
							(dones[elId])();
						}else if(event.data === YT.PlayerState.ENDED){
							event.target.playVideo();
						}
					}
				}
			});
		});	
	};
};
},{}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL2FuaW1hdGlvbi9jc3MtYW5pbWF0aW9uLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL2FuaW1hdGlvbi9wbGF5ZXJzLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL2FuaW1hdGlvbi9zY3JvbGxpbmcuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvYW5pbWF0aW9uL3NsaWRlLXNob3cuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvYXBwL2FwcC1zaGFyZS5qcyIsIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9zcmMvc2NyaXB0cy9hcHAvYXBwLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL2FwcC9zY3JvbGwtYW5pbWF0aW9uLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL2FwcC90aGVtZXMuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvY3VzdG9taXplL2N1c3RvbWl6ZS5qcyIsIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9zcmMvc2NyaXB0cy9zY3JpcHQuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvdG9vbHMvdG9vbHMuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvd2lkZ2V0cy9hamF4LWZvcm0uanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvd2lkZ2V0cy9jaGFuZ2UtY29sb3JzLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL3dpZGdldHMvY291bnRlci5qcyIsIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9zcmMvc2NyaXB0cy93aWRnZXRzL2RvdC1zY3JvbGwuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvd2lkZ2V0cy9mbHVpZC5qcyIsIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9zcmMvc2NyaXB0cy93aWRnZXRzL2dhbGxlcnkuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvd2lkZ2V0cy9sb2FkaW5nLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL3dpZGdldHMvbWFwLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL3dpZGdldHMvbWVudS10b2dnbGUuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvd2lkZ2V0cy9vdmVybGF5LXdpbmRvdy5qcyIsIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9zcmMvc2NyaXB0cy93aWRnZXRzL3Nob3ctbGlzdC5qcyIsIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9zcmMvc2NyaXB0cy93aWRnZXRzL3NraWxsYmFyLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL3dpZGdldHMvc2xpZGVycy5qcyIsIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9zcmMvc2NyaXB0cy93aWRnZXRzL3RvcC1uYXYuanMiLCIvdmFyL3d3dy9za3JvbGxleC9zcmMvc3JjL3NjcmlwdHMvd2lkZ2V0cy92aWRlby1iZy5qcyIsIi92YXIvd3d3L3Nrcm9sbGV4L3NyYy9zcmMvc2NyaXB0cy93aWRnZXRzL3ZpbWVvLWJnLmpzIiwiL3Zhci93d3cvc2tyb2xsZXgvc3JjL3NyYy9zY3JpcHRzL3dpZGdldHMveW91dHViZS1iZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDellBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkY29udGV4dCwgc2NyaXB0KXtcclxuXHR2YXIgaXNQb29yQnJvd3NlciA9ICQoJ2h0bWwnKS5oYXNDbGFzcygncG9vci1icm93c2VyJyk7XHJcblx0aWYoIU1vZGVybml6ci5jc3NhbmltYXRpb25zIHx8IGlzUG9vckJyb3dzZXIpe1xyXG5cdFx0JCgnLnNjcm9sbC1pbi1hbmltYXRpb24nKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWluLWFuaW1hdGlvbicpO1xyXG5cdFx0JCgnLnNjcm9sbC1hbmltYXRpb24nKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWFuaW1hdGlvbicpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHQkKCcuc2FmYXJpIGkuc2Nyb2xsLWluLWFuaW1hdGlvbicpLnJlbW92ZUNsYXNzKCdzY3JvbGwtaW4tYW5pbWF0aW9uJyk7XHJcblx0JCgnLnNhZmFyaSBpLnNjcm9sbC1hbmltYXRpb24nKS5yZW1vdmVDbGFzcygnc2Nyb2xsLWFuaW1hdGlvbicpO1xyXG5cdCRjb250ZXh0LmZpbmQoJy5zY3JvbGwtaW4tYW5pbWF0aW9uLCAuc2Nyb2xsLWFuaW1hdGlvbicpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XHJcblx0XHR2YXIgZGVsYXkgPSAkdGhpcy5kYXRhKCdkZWxheScpO1xyXG5cdFx0dmFyIGFuaW1hdGlvbiA9ICR0aGlzLmRhdGEoJ2FuaW1hdGlvbicpKycgYW5pbWF0ZWQgY3NzLWFuaW1hdGlvbi1zaG93JztcclxuXHRcdHZhciBwYXVzZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdGlmKGRlbGF5KXtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7JHRoaXMucmVtb3ZlQ2xhc3MoYW5pbWF0aW9uKTt9LCBkZWxheSk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdCR0aGlzLnJlbW92ZUNsYXNzKGFuaW1hdGlvbik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciByZXN1bWUgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRpZihkZWxheSl7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpeyR0aGlzLmFkZENsYXNzKGFuaW1hdGlvbik7fSwgZGVsYXkpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHQkdGhpcy5hZGRDbGFzcyhhbmltYXRpb24pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgc3RhcnQgPSByZXN1bWU7XHJcblx0XHRzY3JpcHQucGxheWVycy5hZGRQbGF5ZXIoJHRoaXMsIHN0YXJ0LCBwYXVzZSwgcmVzdW1lKTtcclxuXHR9KTtcclxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbnZhciBwbGF5ZXJzPVtdO1xyXG5wbGF5ZXJzLmFkZFBsYXllciA9IGZ1bmN0aW9uKCR2aWV3LCBzdGFydEZ1bmMsIHBhdXNlRnVuYywgcmVzdW1lRnVuYyl7XHJcblx0cGxheWVycy5wdXNoKFxyXG5cdFx0bmV3IChmdW5jdGlvbigpe1xyXG5cdFx0XHR2YXIgcGxheWVkID0gZmFsc2U7XHJcblx0XHRcdHZhciBzdGFydGVkID0gZmFsc2U7XHJcblx0XHRcdHRoaXMuJHZpZXcgPSAkdmlldztcclxuXHRcdFx0JHZpZXcuYWRkQ2xhc3MoJ3BsYXllcicpLmRhdGEoJ3BsYXllci1pbmQnLCBwbGF5ZXJzLmxlbmd0aCk7XHJcblx0XHRcdHRoaXMucGxheSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0aWYoIXBsYXllZCl7XHJcblx0XHRcdFx0XHRwbGF5ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0aWYoIXN0YXJ0ZWQpe1xyXG5cdFx0XHRcdFx0XHRzdGFydGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0c3RhcnRGdW5jKCk7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0cmVzdW1lRnVuYygpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0dGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0aWYocGxheWVkKXtcclxuXHRcdFx0XHRcdHBsYXllZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0cGF1c2VGdW5jKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0fSkoKVxyXG5cdCk7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gcGxheWVyczsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNjcmlwdCl7XG5cdHZhciBtZSA9IHRoaXM7XG5cdHZhciB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzL3Rvb2xzLmpzJyk7XG5cdHZhciBTY3JvbGxBbmltYXRpb24gPSByZXF1aXJlKCcuLi9hcHAvc2Nyb2xsLWFuaW1hdGlvbi5qcycpO1xuXHR2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcblx0dmFyIGlzUG9vckJyb3dzZXIgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ3Bvb3ItYnJvd3NlcicpO1xuXHR2YXIgc2Nyb2xsQW5pbWF0aW9uID0gbmV3IFNjcm9sbEFuaW1hdGlvbihtZSwgc2NyaXB0KTtcblx0dGhpcy53aW5kb3dUb3BQb3MgPSB1bmRlZmluZWQ7XG5cdHRoaXMud2luZG93Qm90dG9tUG9zID0gdW5kZWZpbmVkO1xuXHR0aGlzLndpbmRvd0ggPSB1bmRlZmluZWQ7XG5cdHRoaXMuc2Nyb2xsID0gZnVuY3Rpb24od2luZG93VG9wUCl7XG5cdFx0bWUud2luZG93SCA9ICR3aW5kb3cuaGVpZ2h0KCk7XG5cdFx0bWUud2luZG93VG9wUG9zID0gd2luZG93VG9wUFxuXHRcdG1lLndpbmRvd0JvdHRvbVBvcyA9IHdpbmRvd1RvcFArbWUud2luZG93SDtcblx0XHRpZihtZS53aW5kb3dUb3BQb3MgPCBzY3JpcHQudG9wTmF2LnN0YXRlMVRvcCgpKXtcblx0XHRcdHNjcmlwdC50b3BOYXYuc3RhdGUxKCk7XG5cdFx0fWVsc2V7XG5cdFx0XHRzY3JpcHQudG9wTmF2LnN0YXRlMigpO1xuXHRcdH1cblx0XHRzY3JvbGxBbmltYXRpb24uc2Nyb2xsKClcblx0XHRmb3IodmFyIGk9MDsgaTxzY3JpcHQucGxheWVycy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgdmlld1BvcyA9IG1lLmNhbGNQb3NpdGlvbihzY3JpcHQucGxheWVyc1tpXS4kdmlldyk7XG5cdFx0XHRpZih2aWV3UG9zLnZpc2libGUpe1xuXHRcdFx0XHRzY3JpcHQucGxheWVyc1tpXS5wbGF5KCk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0c2NyaXB0LnBsYXllcnNbaV0ucGF1c2UoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5jYWxjUG9zaXRpb24gPSBmdW5jdGlvbiAoJGJsb2NrKXtcblx0XHR2YXIgYmxvY2tIID0gJGJsb2NrLmhlaWdodCgpO1xuXHRcdHZhciBibG9ja1RvcFBvcyA9ICRibG9jay5kYXRhKCdwb3NpdGlvbicpO1xuXHRcdHZhciBibG9ja0JvdHRvbVBvcyA9IGJsb2NrVG9wUG9zICsgYmxvY2tIO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IGJsb2NrVG9wUG9zLFxuXHRcdFx0Ym90dG9tOiBibG9ja0JvdHRvbVBvcyxcblx0XHRcdGhlaWdodDogYmxvY2tILFxuXHRcdFx0dmlzaWJsZTogYmxvY2tUb3BQb3M8bWUud2luZG93Qm90dG9tUG9zICYmIGJsb2NrQm90dG9tUG9zPm1lLndpbmRvd1RvcFBvc1xuXHRcdH07XG5cdH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGFwcFNoYXJlID0gcmVxdWlyZSgnLi4vYXBwL2FwcC1zaGFyZS5qcycpO1xyXG5cdHZhciBpc1Bvb3JCcm93c2VyID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdwb29yLWJyb3dzZXInKTtcclxuXHR2YXIgZmFkZVRpbWUgPSA0MDAwO1xyXG5cdHZhciBtb3ZlVGltZSA9IDEyMDAwO1xyXG5cdHZhciBzdDAgPSB7c2NhbGU6IDF9O1xyXG5cdHZhciBzdDEgPSB7c2NhbGU6IDEuMX07XHJcblx0dmFyIHJ1bGVzID0gW1xyXG5cdFx0W3N0MCwgc3QxXSxcclxuXHRcdFtzdDEsIHN0MF1cclxuXHRdO1xyXG5cdHZhciBvcmlnaW5zID0gW1xyXG5cdFx0e29yOiAnbGVmdCB0b3AnLCB4cjogMCwgeXI6IDB9LFxyXG5cdFx0e29yOiAnbGVmdCBjZW50ZXInLCB4cjogMCwgeXI6IDF9LFxyXG5cdFx0e29yOiAncmlnaHQgdG9wJywgeHI6IDIsIHlyOiAwfSxcclxuXHRcdHtvcjogJ3JpZ2h0IGNlbnRlcicsIHhyOiAyLCB5cjogMX1cclxuXHRdXHJcblx0dmFyIGxhc3RSdWxlID0gcnVsZXMubGVuZ3RoIC0xO1xyXG5cdHZhciBsYXN0T3JpZ2luID0gb3JpZ2lucy5sZW5ndGggLTE7XHJcblx0dmFyIGZhZGVFYXNlID0gVFdFRU4uRWFzaW5nLlF1YXJ0aWMuSW5PdXQ7Ly9Qb3dlcjQuZWFzZUluT3V0O1xyXG5cdHZhciBtb3ZlRWFzZSA9IFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZTsvL0xpbmVhci5lYXNlTm9uZTtcclxuXHR0aGlzLnJ1biA9IGZ1bmN0aW9uKCRzbGlkZXMpIHtcclxuXHRcdGlmKGlzUG9vckJyb3dzZXIpIHJldHVybjtcclxuXHRcdHZhciBsYXN0SSA9ICRzbGlkZXMubGVuZ3RoIC0gMTtcclxuXHRcdHNob3cobGFzdEksIHRydWUpO1xyXG5cdFx0ZnVuY3Rpb24gc2hvdyhpLCBpc0ZpcnN0UnVuKSB7XHJcblx0XHRcdHZhciBzbGlkZSA9ICRzbGlkZXMuZ2V0KGkpO1xyXG5cdFx0XHR2YXIgJHNsaWRlID0gJChzbGlkZSk7XHJcblx0XHRcdHZhciBjZmcgPSAkc2xpZGUuZGF0YSgpO1xyXG5cdFx0XHR2YXIgcmkgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBsYXN0UnVsZSk7XHJcblx0XHRcdHZhciBvcmkgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBsYXN0T3JpZ2luKTtcclxuXHRcdFx0dmFyIHJ1bGUgPSBydWxlc1tyaV07XHJcblx0XHRcdGNmZy5zc1NjYWxlID0gcnVsZVswXVsnc2NhbGUnXTtcclxuXHRcdFx0Y2ZnLnNzT3JpZyA9IG9yaWdpbnNbb3JpXTtcclxuXHRcdFx0Y2ZnLnNzT3BhY2l0eSA9IChpID09PSBsYXN0SSAmJiAhaXNGaXJzdFJ1bikgPyAwIDogMTtcclxuXHRcdFx0aWYgKGkgPT09IGxhc3RJICYmICFpc0ZpcnN0UnVuKSB7XHJcblx0XHRcdFx0bmV3IFRXRUVOLlR3ZWVuKGNmZylcclxuXHRcdFx0XHRcdC50byh7c3NPcGFjaXR5OiAxfSwgZmFkZVRpbWUpXHJcblx0XHRcdFx0XHQuZWFzaW5nKGZhZGVFYXNlKVxyXG5cdFx0XHRcdFx0Lm9uQ29tcGxldGUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0JHNsaWRlcy5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0JCh0aGlzKS5kYXRhKCkuc3NPcGFjaXR5ID0gMTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LnN0YXJ0KCk7XHJcblx0XHRcdH1cclxuXHRcdFx0bmV3IFRXRUVOLlR3ZWVuKGNmZylcclxuXHRcdFx0XHQudG8oe3NzU2NhbGU6IHJ1bGVbMV1bJ3NjYWxlJ119LCBtb3ZlVGltZSlcclxuXHRcdFx0XHQuZWFzaW5nKG1vdmVFYXNlKVxyXG5cdFx0XHRcdC5zdGFydCgpO1xyXG5cdFx0XHRpZiAoaSA+IDApIHtcclxuXHRcdFx0XHRuZXcgVFdFRU4uVHdlZW4oe3NzT3BhY2l0eTogMX0pXHJcblx0XHRcdFx0XHQudG8oe3NzT3BhY2l0eTogMH0sIGZhZGVUaW1lKVxyXG5cdFx0XHRcdFx0Lm9uVXBkYXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGNmZy5zc09wYWNpdHkgPSB0aGlzLnNzT3BhY2l0eTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuZWFzaW5nKGZhZGVFYXNlKVxyXG5cdFx0XHRcdFx0LmRlbGF5KG1vdmVUaW1lIC0gZmFkZVRpbWUpXHJcblx0XHRcdFx0XHQub25TdGFydChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRzaG93KGkgLSAxKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuc3RhcnQoKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0bmV3IFRXRUVOLlR3ZWVuKGNmZylcclxuXHRcdFx0XHRcdC50byh7fSwgMClcclxuXHRcdFx0XHRcdC5lYXNpbmcoZmFkZUVhc2UpXHJcblx0XHRcdFx0XHQuZGVsYXkobW92ZVRpbWUgLSBmYWRlVGltZSlcclxuXHRcdFx0XHRcdC5vblN0YXJ0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdHNob3cobGFzdEkpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5zdGFydCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XG5tb2R1bGUuZXhwb3J0cyA9IG5ldyAoZnVuY3Rpb24oKXtcblx0dmFyIG1lID0gdGhpcztcblx0dmFyIGlzT2xkV2luID1cblx0XHRcdChuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKFwiV2luZG93cyBOVCA2LjFcIikhPS0xKSB8fCAvL1dpbjdcblx0XHRcdChuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKFwiV2luZG93cyBOVCA2LjBcIikhPS0xKSB8fCAvL1Zpc3RhXG5cdFx0XHQobmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZihcIldpbmRvd3MgTlQgNS4xXCIpIT0tMSkgfHwgLy9YUFxuXHRcdFx0KG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoXCJXaW5kb3dzIE5UIDUuMFwiKSE9LTEpOyAgIC8vV2luMjAwMFxuXHR2YXIgaXNJRTkgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ2llOScpO1xuXHR2YXIgaXNJRTEwID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdpZTEwJyk7XG5cdHZhciBpc0lFMTEgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ2llMTEnKTtcblx0dmFyIGlzUG9vckJyb3dzZXIgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ3Bvb3ItYnJvd3NlcicpO1xuXHR2YXIgaXNNb2JpbGUgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpO1xuXHR2YXIgZmFjdG9yID0gKGZ1bmN0aW9uKCl7XG5cdFx0aWYoaXNJRTkgfHwgaXNJRTEwIHx8IChpc0lFMTEgJiYgaXNPbGRXaW4pKXtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1lbHNlIGlmKGlzSUUxMSl7XG5cdFx0XHRyZXR1cm4gLTAuMTU7XG5cdFx0fWVsc2UgaWYoaXNQb29yQnJvd3Nlcil7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9ZWxzZXtcblx0XHRcdHJldHVybiAtMC4yNTtcblx0XHR9XG5cdH0pKCk7XG5cdHRoaXMuZm9yY2UzRCA9IGlzTW9iaWxlID8gZmFsc2UgOiB0cnVlO1xuXHR0aGlzLnBhcmFsbGF4TWFyZ2luID0gZnVuY3Rpb24oc2NyaXB0LCBzZWNJbmQsIHZpZXdPZmZzZXRGcm9tV2luZG93VG9wKXtcblx0XHR2YXIgdmlld09mZnNldEZyb21OYXZQb2ludCA9ICh2aWV3T2Zmc2V0RnJvbVdpbmRvd1RvcCAtIChzZWNJbmQgPT09IDAgPyAwIDogc2NyaXB0LnRvcE5hdi5zdGF0ZTJIKSk7XG5cdFx0cmV0dXJuIE1hdGgucm91bmQoZmFjdG9yICogdmlld09mZnNldEZyb21OYXZQb2ludCk7XG5cdH07XG59KSgpOyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcbm1vZHVsZS5leHBvcnRzID0gbmV3IChmdW5jdGlvbigpe1xuXHR2YXIgYXBwU2hhcmUgPSByZXF1aXJlKCcuL2FwcC1zaGFyZS5qcycpO1xuXHR2YXIgdGhlbWVzID0gcmVxdWlyZSgnLi90aGVtZXMuanMnKTtcblx0dmFyIFNsaWRlU2hvdyA9IHJlcXVpcmUoJy4uL2FuaW1hdGlvbi9zbGlkZS1zaG93LmpzJyk7XG5cdHZhciBzbGlkZVNob3cgPSBuZXcgU2xpZGVTaG93KCk7XG5cdHZhciBpc1Bvb3JCcm93c2VyID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdwb29yLWJyb3dzZXInKTtcblx0dmFyIGlzTW9iaWxlID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdtb2JpbGUnKTtcblx0dmFyIHNrZXdIID0gNjA7XG5cdHZhciAkYm9yZCA9ICQoJyN0b3AtbmF2LCAucGFnZS1ib3JkZXIsICNkb3Qtc2Nyb2xsJyk7XG5cdHZhciAkdG9wTmF2ID0gJCgnI3RvcC1uYXYnKTtcblx0dmFyIHN0YXRlMUNvbG9ycyA9ICR0b3BOYXYuZGF0YSgnc3RhdGUxLWNvbG9ycycpO1xuXHR2YXIgc3RhdGUyQ29sb3JzID0gJHRvcE5hdi5kYXRhKCdzdGF0ZTItY29sb3JzJyk7XG5cdHZhciAkYm9keSA9ICQoJ2JvZHknKTtcblx0dmFyICR2aWV3cyA9ICQoJy52aWV3Jyk7XG5cdHZhciAkYmFjZ3JvdW5kcztcblx0dGhpcy5wcmVwYXJlID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXHRcdGlmKHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2ZpbGU6JyAmJiAhJCgnYm9keScpLmhhc0NsYXNzKCdleGFtcGxlLXBhZ2UnKSl7XG5cdFx0XHQkKCc8ZGl2IGNsYXNzPVwiZmlsZS1wcm90b2NvbC1hbGVydCBhbGVydCBjb2xvcnMtZCBiYWNrZ3JvdW5kLTgwIGhlYWRpbmcgZmFkZSBpblwiPlx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+w5c8L2J1dHRvbj4gVXBsb2FkIGZpbGVzIHRvIHdlYiBzZXJ2ZXIgYW5kIG9wZW4gdGVtcGxhdGUgZnJvbSB3ZWIgc2VydmVyLiBJZiB0ZW1wbGF0ZSBpcyBvcGVuZWQgZnJvbSBsb2NhbCBmaWxlIHN5c3RlbSwgc29tZSBsaW5rcywgZnVuY3Rpb25zIGFuZCBleGFtcGxlcyBtYXkgd29yayBpbmNvcnJlY3RseS48L2Rpdj4nKVxuXHRcdFx0XHRcdC5hcHBlbmRUbygnYm9keScpO1xuXHRcdH1cblx0XHRpZihhcHBTaGFyZS5mb3JjZTNEID09PSB0cnVlKXtcblx0XHRcdCQoJ2h0bWwnKS5hZGRDbGFzcygnZm9yY2UzZCcpO1xuXHRcdH1cblx0XHRpZihpc1Bvb3JCcm93c2VyKXtcblx0XHRcdHZhciAkYm9keUJnID0gJCgnYm9keT4uYmcnKTtcblx0XHRcdCRib2R5QmcuZWFjaChmdW5jdGlvbihpKXtcblx0XHRcdFx0aWYoaSA9PT0gKCRib2R5QmcubGVuZ3RoIC0gMSkpe1xuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0JCgnLnZpZXcnKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciAkdmlld0JnID0gJCh0aGlzKS5jaGlsZHJlbignLmJnJyk7XG5cdFx0XHRcdCR2aWV3QmcuZWFjaChmdW5jdGlvbihpKXtcblx0XHRcdFx0XHRpZihpID09PSAoJHZpZXdCZy5sZW5ndGggLSAxKSl7XG5cdFx0XHRcdFx0XHQkKHRoaXMpLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmKGlzTW9iaWxlKXtcblx0XHRcdHZhciAkYm9keUltZyA9ICQoJ2JvZHk+aW1nLmJnJyk7XG5cdFx0XHR2YXIgJGRlZkltZ1NldCA9ICRib2R5SW1nLmxlbmd0aD4wID8gJGJvZHlJbWcgOiAkKCcudmlldz5pbWcuYmcnKTtcblx0XHRcdGlmKCRkZWZJbWdTZXQubGVuZ3RoID4gMCl7XG5cdFx0XHRcdHZhciAkZGVmSW1nID0gJCgkZGVmSW1nU2V0WzBdKTtcblx0XHRcdFx0JCgnLnZpZXcnKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0dmFyICRzZWMgPSAkKHRoaXMpO1xuXHRcdFx0XHRcdHZhciAkYmcgPSAkc2VjLmNoaWxkcmVuKCdpbWcuYmcnKTtcblx0XHRcdFx0XHRpZigkYmcubGVuZ3RoPDEpe1xuXHRcdFx0XHRcdFx0JGRlZkltZy5jbG9uZSgpLnByZXBlbmRUbygkc2VjKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0JCgnYm9keT5pbWcuYmcnKS5yZW1vdmUoKTtcblx0XHR9XG5cdFx0JGJhY2dyb3VuZHMgPSAkKCcuYmcnKTtcblx0XHRjYWxsYmFjaygpO1xuXHR9O1xuXHR0aGlzLnNldHVwID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXHRcdHZhciBnb29kQ29sb3IgPSBmdW5jdGlvbigkZWwpe1xuXHRcdFx0dmFyIGJnID0gJGVsLmNzcygnYmFja2dyb3VuZC1jb2xvcicpO1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRiZy5tYXRjaCgvIy9pKSB8fFxuXHRcdFx0XHRcdGJnLm1hdGNoKC9yZ2JcXCgvaSkgfHxcblx0XHRcdFx0XHRiZy5tYXRjaCgvcmdiYS4qLDBcXCkvaSlcblx0XHRcdCk7XG5cdFx0fTtcblx0XHQkKCcudmlldy5zZWN0aW9uLWhlYWRlcicpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XG5cdFx0XHR2YXIgJG5leHQgPSAkdGhpcy5uZXh0QWxsKCcudmlldycpLmZpcnN0KCkuY2hpbGRyZW4oJy5jb250ZW50Jyk7XG5cdFx0XHRpZigkbmV4dC5sZW5ndGg+MCAmJiBnb29kQ29sb3IoJG5leHQpKXtcblx0XHRcdFx0JHRoaXMuY2hpbGRyZW4oJy5jb250ZW50JykuYWRkQ2xhc3MoJ3NrZXctYm90dG9tLXJpZ2h0Jyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0JCgnLnZpZXcuc2VjdGlvbi1mb290ZXInKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0dmFyICRwcmV2ID0gJHRoaXMucHJldkFsbCgnLnZpZXcnKS5maXJzdCgpLmNoaWxkcmVuKCcuY29udGVudCcpO1xuXHRcdFx0aWYoJHByZXYubGVuZ3RoPjAgJiYgZ29vZENvbG9yKCRwcmV2KSl7XG5cdFx0XHRcdCR0aGlzLmNoaWxkcmVuKCcuY29udGVudCcpLmFkZENsYXNzKCdza2V3LXRvcC1yaWdodCcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdCR2aWV3cy5maW5kKCcuY29udGVudCcpLmZpbHRlcignLnNrZXctdG9wLXJpZ2h0LCAuc2tldy10b3AtbGVmdCwgLnNrZXctYm90dG9tLWxlZnQsIC5za2V3LWJvdHRvbS1yaWdodCcpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdHZhciAkY29udGVudCA9ICQodGhpcyk7XG5cdFx0XHR2YXIgJHZpZXcgPSAkY29udGVudC5wYXJlbnQoKTtcblx0XHRcdGlmKCRjb250ZW50Lmhhc0NsYXNzKCdza2V3LXRvcC1yaWdodCcpIHx8ICRjb250ZW50Lmhhc0NsYXNzKCdza2V3LXRvcC1sZWZ0Jykpe1xuXHRcdFx0XHR2YXIgJHByZXYgPSAkdmlldy5wcmV2QWxsKCcudmlldycpLmZpcnN0KCkuY2hpbGRyZW4oJy5jb250ZW50Jyk7XG5cdFx0XHRcdGlmKCRwcmV2Lmxlbmd0aD4wICYmIGdvb2RDb2xvcigkcHJldikpe1xuXHRcdFx0XHRcdHZhciB0eXBlID0gJGNvbnRlbnQuaGFzQ2xhc3MoJ3NrZXctdG9wLXJpZ2h0JykgPyAxIDogMjtcblx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwic2tldyBza2V3LXRvcC0nKyh0eXBlID09PSAxID8gJ3JpZ2h0JyA6ICdsZWZ0JykrJ1wiPjwvZGl2PicpLmFwcGVuZFRvKCRjb250ZW50KS5jc3Moe1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFx0XHRcdHRvcDogXCIwcHhcIixcblx0XHRcdFx0XHRcdHdpZHRoOiBcIjBweFwiLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBcIjBweFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItdG9wLXdpZHRoXCI6IHR5cGUgPT09IDIgPyAoc2tld0grXCJweFwiKSA6IFwiMHB4XCIsXG5cdFx0XHRcdFx0XHRcImJvcmRlci1yaWdodC13aWR0aFwiOiBcIjI4ODBweFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItYm90dG9tLXdpZHRoXCI6IHR5cGUgPT09IDEgPyAoc2tld0grXCJweFwiKSA6IFwiMHB4XCIsXG5cdFx0XHRcdFx0XHRcImJvcmRlci1sZWZ0LXdpZHRoXCI6IFwiMHB4XCIsXG5cdFx0XHRcdFx0XHRcImJvcmRlci1zdHlsZVwiOiBcInNvbGlkIHNvbGlkIHNvbGlkIGRhc2hlZFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItYm90dG9tLWNvbG9yXCI6IFwidHJhbnNwYXJlbnRcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLWxlZnQtY29sb3JcIjogIFwidHJhbnNwYXJlbnRcIlxuXHRcdFx0XHRcdH0pLmFkZENsYXNzKGdldENvbG9yQ2xhc3MoJHByZXYpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYoJGNvbnRlbnQuaGFzQ2xhc3MoJ3NrZXctYm90dG9tLWxlZnQnKSB8fCAkY29udGVudC5oYXNDbGFzcygnc2tldy1ib3R0b20tcmlnaHQnKSl7XG5cdFx0XHRcdHZhciAkbmV4dCA9ICR2aWV3Lm5leHRBbGwoJy52aWV3JykuZmlyc3QoKS5jaGlsZHJlbignLmNvbnRlbnQnKTtcblx0XHRcdFx0aWYoJG5leHQubGVuZ3RoPjAgJiYgZ29vZENvbG9yKCRuZXh0KSl7XG5cdFx0XHRcdFx0dmFyIHR5cGUgPSAkY29udGVudC5oYXNDbGFzcygnc2tldy1ib3R0b20tbGVmdCcpID8gMSA6IDI7XG5cdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cInNrZXcgc2tldy1ib3R0b20tJysodHlwZSA9PT0gMSA/ICdsZWZ0JyA6ICdyaWdodCcpKydcIj48L2Rpdj4nKS5hcHBlbmRUbygkY29udGVudCkuY3NzKHtcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRcdFx0XHRib3R0b206IFwiMHB4XCIsXG5cdFx0XHRcdFx0XHR3aWR0aDogXCIwcHhcIixcblx0XHRcdFx0XHRcdGhlaWdodDogXCIwcHhcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLXRvcC13aWR0aFwiOiB0eXBlID09PSAxID8gKHNrZXdIK1wicHhcIikgOiBcIjBweFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItcmlnaHQtd2lkdGhcIjogXCIwcHhcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLWJvdHRvbS13aWR0aFwiOiB0eXBlID09PSAyID8gKHNrZXdIK1wicHhcIikgOiBcIjBweFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItbGVmdC13aWR0aFwiOiBcIjI4ODBweFwiLFxuXHRcdFx0XHRcdFx0XCJib3JkZXItc3R5bGVcIjogXCJzb2xpZCBkYXNoZWQgc29saWQgc29saWRcIixcblx0XHRcdFx0XHRcdFwiYm9yZGVyLXRvcC1jb2xvclwiOiBcInRyYW5zcGFyZW50XCIsXG5cdFx0XHRcdFx0XHRcImJvcmRlci1yaWdodC1jb2xvclwiOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0XHR9KS5hZGRDbGFzcyhnZXRDb2xvckNsYXNzKCRuZXh0KSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRjYWxsYmFjaygpO1xuXHRcdGZ1bmN0aW9uIGdldENvbG9yQ2xhc3MoJGVsKXtcblx0XHRcdGZvcih2YXIgaT0wOyBpPHRoZW1lcy5jb2xvcnM7IGkrKyl7XG5cdFx0XHRcdHZhciBjb2xvckNsYXNzID0gJ2NvbG9ycy0nK1N0cmluZy5mcm9tQ2hhckNvZGUoNjUraSkudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0aWYoJGVsLmhhc0NsYXNzKGNvbG9yQ2xhc3MpKXtcblx0XHRcdFx0XHRyZXR1cm4gY29sb3JDbGFzcztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0dGhpcy51bmdhdGVkID0gZnVuY3Rpb24oKXtcblx0XHQkKCdib2R5LCAudmlldycpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdHZhciAkYmcgPSAkKHRoaXMpLmNoaWxkcmVuKCcuYmcnKTtcblx0XHRcdGlmKCRiZy5sZW5ndGggPiAxKSBzbGlkZVNob3cucnVuKCRiZyk7XG5cdFx0fSk7XG5cdH1cblx0dGhpcy50aWNrID0gZnVuY3Rpb24oKXtcblx0XHQkYmFjZ3JvdW5kcy5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0dmFyIGNmZyA9ICR0aGlzLmRhdGEoKTtcblx0XHRcdHZhciBvcGEsIHhyLCB5ciwgb3I7XG5cdFx0XHRpZihjZmcuc3NPcGFjaXR5ICE9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRvcGEgPSBjZmcuc3NPcGFjaXR5O1xuXHRcdFx0XHR4ciA9IGNmZy5zc09yaWcueHI7XG5cdFx0XHRcdHlyID0gY2ZnLnNzT3JpZy55cjtcblx0XHRcdFx0b3IgPSBjZmcuc3NPcmlnLm9yO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdG9wYSA9IDE7XG5cdFx0XHRcdHhyID0gMTtcblx0XHRcdFx0eXIgPSAxO1xuXHRcdFx0XHRvciA9ICdjZW50ZXIgY2VudGVyJztcblx0XHRcdH1cblx0XHRcdHZhciB4ID0gY2ZnLm5vcm1hbFggKyAoY2ZnLnpvb21YRGVsdGEgKiB4cik7XG5cdFx0XHR2YXIgeSA9IGNmZy5ub3JtYWxZICsgKGNmZy56b29tWURlbHRhICogeXIpICsgKGNmZy5wYXJhbGxheFkgIT09IHVuZGVmaW5lZCA/IGNmZy5wYXJhbGxheFkgOiAwKTtcblx0XHRcdHZhciBzYyA9IGNmZy5ub3JtYWxTY2FsZSAqIChjZmcuc3NTY2FsZSAhPT0gdW5kZWZpbmVkID8gY2ZnLnNzU2NhbGUgOiAxKTtcblx0XHRcdGlmKE1vZGVybml6ci5jc3N0cmFuc2Zvcm1zM2QgJiYgYXBwU2hhcmUuZm9yY2UzRCl7XG5cdFx0XHRcdCR0aGlzLmNzcyh7dHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoJyt4KydweCwgJyt5KydweCwgMHB4KSBzY2FsZSgnK3NjKycsICcrc2MrJyknLCBvcGFjaXR5OiBvcGEsICd0cmFuc2Zvcm0tb3JpZ2luJzogb3IrJyAwcHgnfSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0JHRoaXMuY3NzKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyt4KydweCwgJyt5KydweCkgc2NhbGUoJytzYysnLCAnK3NjKycpJywgb3BhY2l0eTogb3BhLCAndHJhbnNmb3JtLW9yaWdpbic6IG9yfSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0dGhpcy5idWlsZFNpemVzID0gZnVuY3Rpb24oc2NyaXB0KXtcblx0XHR2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcblx0XHR2YXIgd2ggPSAkd2luZG93LmhlaWdodCgpO1xuXHRcdHZhciB3dyA9ICR3aW5kb3cud2lkdGgoKTtcblx0XHR2YXIgJHRuYXYgPSAkKCcjdG9wLW5hdjp2aXNpYmxlJyk7XG5cdFx0dmFyIHNoID0gd2ggLSAoJHRuYXYubGVuZ3RoID4gMCA/IHNjcmlwdC50b3BOYXYuc3RhdGUySCA6IDApO1xuXHRcdHZhciAkYmJvcmQgPSAkKCcucGFnZS1ib3JkZXIuYm90dG9tOnZpc2libGUnKTtcblx0XHR2YXIgYm9yZGVySCA9ICRiYm9yZC5sZW5ndGggPiAwID8gJGJib3JkLmhlaWdodCgpIDogMDtcblx0XHQkKCcuZnVsbC1zaXplLCAuaGFsZi1zaXplLCAub25lLXRoaXJkLXNpemUnKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblx0XHRcdHZhciBtaW5QYWRkaW5nVG9wID0gcGFyc2VJbnQoJHRoaXMuY3NzKHtcblx0XHRcdFx0J3BhZGRpbmctdG9wJzogJycsXG5cdFx0XHR9KS5jc3MoJ3BhZGRpbmctdG9wJykucmVwbGFjZSgncHgnLCAnJykpO1xuXHRcdFx0dmFyIG1pblBhZGRpbmdCb3R0b20gPSBwYXJzZUludCgkdGhpcy5jc3Moe1xuXHRcdFx0XHQncGFkZGluZy1ib3R0b20nOiAnJyxcblx0XHRcdH0pLmNzcygncGFkZGluZy1ib3R0b20nKS5yZXBsYWNlKCdweCcsICcnKSk7XG5cdFx0XHR2YXIgbWluRnVsbEggPSBzaCAtICgkYmJvcmQubGVuZ3RoID4gMCA/IGJvcmRlckggOiAwKTtcblx0XHRcdHZhciBtaW5IYWxmSCA9IE1hdGguY2VpbChtaW5GdWxsSCAvIDIpO1xuXHRcdFx0dmFyIG1pbjEzSCA9IE1hdGguY2VpbChtaW5GdWxsSCAvIDMpO1xuXHRcdFx0dmFyIG1pbiA9ICR0aGlzLmhhc0NsYXNzKCdmdWxsLXNpemUnKSA/IG1pbkZ1bGxIIDogKCR0aGlzLmhhc0NsYXNzKCdoYWxmLXNpemUnKSA/IG1pbkhhbGZIIDogbWluMTNIKTtcblx0XHRcdCR0aGlzLmNzcyh7XG5cdFx0XHRcdCdwYWRkaW5nLXRvcCc6IG1pblBhZGRpbmdUb3AgKyAncHgnLFxuXHRcdFx0XHQncGFkZGluZy1ib3R0b20nOiBtaW5QYWRkaW5nQm90dG9tICsgJ3B4J1xuXHRcdFx0fSk7XG5cdFx0XHRpZigkdGhpcy5oYXNDbGFzcygnc3RyZXRjaC1oZWlnaHQnKSB8fCAkdGhpcy5oYXNDbGFzcygnc3RyZXRjaC1mdWxsLWhlaWdodCcpKXtcblx0XHRcdFx0JHRoaXMuY3NzKHtoZWlnaHQ6ICcnfSk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgdGhpc0ggPSAkdGhpcy5oZWlnaHQoKTtcblx0XHRcdGlmICh0aGlzSCA8IG1pbikge1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBtaW4gLSB0aGlzSCAtIG1pblBhZGRpbmdUb3AgLSBtaW5QYWRkaW5nQm90dG9tO1xuXHRcdFx0XHRpZihkZWx0YTwwKXtcblx0XHRcdFx0XHRkZWx0YT0wO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciB0b3BQbHVzID0gTWF0aC5yb3VuZChkZWx0YSAvIDIpO1xuXHRcdFx0XHR2YXIgYm90dG9tUGx1cyA9IGRlbHRhIC0gdG9wUGx1cztcblx0XHRcdFx0dmFyIG5ld1BhZGRpbmdUb3AgPSBtaW5QYWRkaW5nVG9wICsgdG9wUGx1cztcblx0XHRcdFx0dmFyIG5ld1BhZGRpbmdCb3R0b20gPSBtaW5QYWRkaW5nQm90dG9tICsgYm90dG9tUGx1cztcblx0XHRcdFx0JHRoaXMuY3NzKHtcblx0XHRcdFx0XHQncGFkZGluZy10b3AnOiBuZXdQYWRkaW5nVG9wICsgJ3B4Jyxcblx0XHRcdFx0XHQncGFkZGluZy1ib3R0b20nOiBuZXdQYWRkaW5nQm90dG9tICsgJ3B4J1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQkKCcuc3RyZXRjaC1oZWlnaHQnKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0dmFyICRwYXIgPSAkdGhpcy5wYXJlbnQoKTtcblx0XHRcdHZhciAkc3RycyA9ICRwYXIuZmluZCgnLnN0cmV0Y2gtaGVpZ2h0Jyk7XG5cdFx0XHQkc3Rycy5jc3MoJ2hlaWdodCcsICcnKTtcblx0XHRcdGlmKCR0aGlzLm91dGVyV2lkdGgoKTwkcGFyLmlubmVyV2lkdGgoKSl7XG5cdFx0XHRcdCRzdHJzLmNzcygnaGVpZ2h0JywgJHBhci5pbm5lckhlaWdodCgpKydweCcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdCQoJy5zdHJldGNoLWZ1bGwtaGVpZ2h0JykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblx0XHRcdHZhciAkcGFyID0gJHRoaXMucGFyZW50KCk7XG5cdFx0XHR2YXIgJHN0cnMgPSAkcGFyLmZpbmQoJy5zdHJldGNoLWZ1bGwtaGVpZ2h0Jyk7XG5cdFx0XHQkc3Rycy5jc3MoJ2hlaWdodCcsICcnKTtcblx0XHRcdGlmKCR0aGlzLm91dGVyV2lkdGgoKTwkcGFyLmlubmVyV2lkdGgoKSl7XG5cdFx0XHRcdHZhciBwYXJIID0gJHBhci5pbm5lckhlaWdodCgpO1xuXHRcdFx0XHR2YXIgc3Ryc0ggPSB3aCA8IHBhckggPyBwYXJIIDogd2g7XG5cdFx0XHRcdCRzdHJzLmNzcygnaGVpZ2h0Jywgc3Ryc0grJ3B4Jyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0JHZpZXdzLmVhY2goZnVuY3Rpb24oaSl7XG5cdFx0XHR2YXIgJHZpZXcgPSAkKHRoaXMpO1xuXHRcdFx0dmFyICRjb250ZW50ID0gJHZpZXcuZmluZCgnLmNvbnRlbnQnKTtcblx0XHRcdHZhciAkc2tld1RvcCA9ICRjb250ZW50LmZpbmQoJy5za2V3LnNrZXctdG9wLXJpZ2h0LCAuc2tldy5za2V3LXRvcC1sZWZ0Jyk7XG5cdFx0XHR2YXIgJHNrZXdCb3R0b20gPSAkY29udGVudC5maW5kKCcuc2tldy5za2V3LWJvdHRvbS1sZWZ0LCAuc2tldy5za2V3LWJvdHRvbS1yaWdodCcpO1xuXHRcdFx0dmFyIGNvbnRlbnRXUHggPSAkY29udGVudC53aWR0aCgpK1wicHhcIjtcblx0XHRcdCRza2V3Qm90dG9tLmNzcyh7XG5cdFx0XHRcdFwiYm9yZGVyLWxlZnQtd2lkdGhcIjogY29udGVudFdQeFxuXHRcdFx0fSk7XG5cdFx0XHQkc2tld1RvcC5jc3Moe1xuXHRcdFx0XHRcImJvcmRlci1yaWdodC13aWR0aFwiOiBjb250ZW50V1B4XG5cdFx0XHR9KTtcblx0XHRcdHZhciB2aWV3SCA9ICR2aWV3LmhlaWdodCgpO1xuXHRcdFx0dmFyIHZpZXdXID0gJHZpZXcud2lkdGgoKTtcblx0XHRcdHZhciB0YXJnZXRIID0gKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciB2aWV3T2Zmc2V0MSA9IC0xICogdmlld0g7XG5cdFx0XHRcdHZhciB2aWV3T2Zmc2V0MiA9IDA7XG5cdFx0XHRcdHZhciB2aWV3T2Zmc2V0MyA9IHdoIC0gdmlld0g7XG5cdFx0XHRcdHZhciB2aWV3T2Zmc2V0NCA9IHdoO1xuXHRcdFx0XHR2YXIgbWFyZzEgPSBhcHBTaGFyZS5wYXJhbGxheE1hcmdpbihzY3JpcHQsIGksIHZpZXdPZmZzZXQxKTtcblx0XHRcdFx0dmFyIG1hcmcyID0gYXBwU2hhcmUucGFyYWxsYXhNYXJnaW4oc2NyaXB0LCBpLCB2aWV3T2Zmc2V0Mik7XG5cdFx0XHRcdHZhciBtYXJnMyA9IGFwcFNoYXJlLnBhcmFsbGF4TWFyZ2luKHNjcmlwdCwgaSwgdmlld09mZnNldDMpO1xuXHRcdFx0XHR2YXIgbWFyZzQgPSBhcHBTaGFyZS5wYXJhbGxheE1hcmdpbihzY3JpcHQsIGksIHZpZXdPZmZzZXQ0KTtcblx0XHRcdFx0dmFyIHRvcERlbHRhID0gZnVuY3Rpb24odmlld09mZnNldCwgbWFyZyl7XG5cdFx0XHRcdFx0cmV0dXJuIG1hcmcgKyAodmlld09mZnNldCA+IDAgPyAwIDogdmlld09mZnNldCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHZhciBib3R0b21EZWx0YSA9IGZ1bmN0aW9uKHZpZXdPZmZzZXQsIG1hcmcpe1xuXHRcdFx0XHRcdHZhciBib3R0b21PZmZzZXQgPSB2aWV3T2Zmc2V0ICsgdmlld0g7XG5cdFx0XHRcdFx0cmV0dXJuIC1tYXJnIC0gKGJvdHRvbU9mZnNldCA8IHdoID8gMCA6IGJvdHRvbU9mZnNldCAtIHdoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0dmFyIGRlbHRhID0gMDtcblx0XHRcdFx0dmFyIGN1ckRlbHRhO1xuXHRcdFx0XHRjdXJEZWx0YSA9IHRvcERlbHRhKHZpZXdPZmZzZXQxLCBtYXJnMSk7IGlmKGN1ckRlbHRhID4gZGVsdGEpIGRlbHRhID0gY3VyRGVsdGE7XG5cdFx0XHRcdGN1ckRlbHRhID0gdG9wRGVsdGEodmlld09mZnNldDIsIG1hcmcyKTsgaWYoY3VyRGVsdGEgPiBkZWx0YSkgZGVsdGEgPSBjdXJEZWx0YTtcblx0XHRcdFx0Y3VyRGVsdGEgPSB0b3BEZWx0YSh2aWV3T2Zmc2V0MywgbWFyZzMpOyBpZihjdXJEZWx0YSA+IGRlbHRhKSBkZWx0YSA9IGN1ckRlbHRhO1xuXHRcdFx0XHRjdXJEZWx0YSA9IHRvcERlbHRhKHZpZXdPZmZzZXQ0LCBtYXJnNCk7IGlmKGN1ckRlbHRhID4gZGVsdGEpIGRlbHRhID0gY3VyRGVsdGE7XG5cdFx0XHRcdGN1ckRlbHRhID0gYm90dG9tRGVsdGEodmlld09mZnNldDEsIG1hcmcxKTsgaWYoY3VyRGVsdGEgPiBkZWx0YSkgZGVsdGEgPSBjdXJEZWx0YTtcblx0XHRcdFx0Y3VyRGVsdGEgPSBib3R0b21EZWx0YSh2aWV3T2Zmc2V0MiwgbWFyZzIpOyBpZihjdXJEZWx0YSA+IGRlbHRhKSBkZWx0YSA9IGN1ckRlbHRhO1xuXHRcdFx0XHRjdXJEZWx0YSA9IGJvdHRvbURlbHRhKHZpZXdPZmZzZXQzLCBtYXJnMyk7IGlmKGN1ckRlbHRhID4gZGVsdGEpIGRlbHRhID0gY3VyRGVsdGE7XG5cdFx0XHRcdGN1ckRlbHRhID0gYm90dG9tRGVsdGEodmlld09mZnNldDQsIG1hcmc0KTsgaWYoY3VyRGVsdGEgPiBkZWx0YSkgZGVsdGEgPSBjdXJEZWx0YTtcblx0XHRcdFx0cmV0dXJuIHZpZXdIICsgKDIgKiBkZWx0YSk7XG5cdFx0XHR9KSgpO1xuXHRcdFx0JHZpZXcuY2hpbGRyZW4oJ2ltZy5iZycpLmVhY2goZnVuY3Rpb24oKXsgXG5cdFx0XHRcdGJnU2l6ZSgkKHRoaXMpLCB0YXJnZXRILCB2aWV3Vywgdmlld0gpO1xuXHRcdFx0fSk7XG5cdFx0XHQkdmlldy5kYXRhKCdwb3NpdGlvbicsICR2aWV3Lm9mZnNldCgpLnRvcCk7XG5cdFx0fSk7XG5cdFx0JCgnc2VjdGlvbicpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XG5cdFx0XHQkdGhpcy5kYXRhKCdwb3NpdGlvbicsICR0aGlzLm9mZnNldCgpLnRvcCk7XG5cdFx0fSk7XG5cdFx0JCgnYm9keScpLmNoaWxkcmVuKCdpbWcuYmcnKS5lYWNoKGZ1bmN0aW9uKCl7IFxuXHRcdFx0YmdTaXplKCQodGhpcyksIHdoLCB3dywgd2gpO1xuXHRcdH0pO1xuXHRcdGZ1bmN0aW9uIGJnU2l6ZSgkYmcsIHRhcmdldEgsIHZpZXdXLCB2aWV3SCl7XG5cdFx0XHR2YXIgbmF0ID0gbmF0U2l6ZSgkYmcpO1xuXHRcdFx0dmFyIHNjYWxlID0gKHZpZXdXL3RhcmdldEggPiBuYXQudy9uYXQuaCkgPyB2aWV3VyAvIG5hdC53IDogdGFyZ2V0SCAvIG5hdC5oO1xuXHRcdFx0dmFyIG5ld1cgPSBuYXQudyAqIHNjYWxlO1xuXHRcdFx0dmFyIG5ld0ggPSBuYXQuaCAqIHNjYWxlO1xuXHRcdFx0dmFyIHpvb21YRGVsdGEgPSAobmV3VyAtIG5hdC53KS8yO1xuXHRcdFx0dmFyIHpvb21ZRGVsdGEgPSAobmV3SCAtIG5hdC5oKS8yO1xuXHRcdFx0dmFyIHggPSBNYXRoLnJvdW5kKCh2aWV3VyAtIG5ld1cpLzIpO1xuXHRcdFx0dmFyIHkgPSBNYXRoLnJvdW5kKCh2aWV3SCAtIG5ld0gpLzIpO1xuXHRcdFx0dmFyIGNmZyA9ICRiZy5kYXRhKCk7XG5cdFx0XHRjZmcubm9ybWFsU2NhbGUgPSBzY2FsZTtcblx0XHRcdGNmZy5ub3JtYWxYID0geDtcblx0XHRcdGNmZy5ub3JtYWxZID0geTtcblx0XHRcdGNmZy56b29tWERlbHRhID0gem9vbVhEZWx0YTtcblx0XHRcdGNmZy56b29tWURlbHRhID0gem9vbVlEZWx0YTtcblx0XHR9XG5cdH07XG5cdHRoaXMuY2hhbmdlU2VjdGlvbiA9IGZ1bmN0aW9uKHNjcmlwdCwgc2VjdGlvbkhhc2gpe1xuXHRcdHZhciAkc2VjdCA9ICQoc2VjdGlvbkhhc2gpO1xuXHRcdHZhciBjbHMgPSAkc2VjdC5kYXRhKCdib3JkZXItY29sb3JzJyk7XG5cdFx0aWYoY2xzKXtcblx0XHRcdCRib3JkLnJlbW92ZUNsYXNzKHRoZW1lcy5jb2xvckNsYXNzZXMpO1xuXHRcdFx0JGJvcmQuYWRkQ2xhc3MoY2xzKTtcblx0XHR9ZWxzZXtcblx0XHRcdGlmKCRib2R5Lmhhc0NsYXNzKCdzdGF0ZTInKSAmJiBzdGF0ZTJDb2xvcnMpe1xuXHRcdFx0XHQkYm9yZC5yZW1vdmVDbGFzcyh0aGVtZXMuY29sb3JDbGFzc2VzKTtcblx0XHRcdFx0JGJvcmQuYWRkQ2xhc3Moc3RhdGUyQ29sb3JzKTtcblx0XHRcdH1lbHNlIGlmKHN0YXRlMUNvbG9ycyl7XG5cdFx0XHRcdCRib3JkLnJlbW92ZUNsYXNzKHRoZW1lcy5jb2xvckNsYXNzZXMpO1xuXHRcdFx0XHQkYm9yZC5hZGRDbGFzcyhzdGF0ZTFDb2xvcnMpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0ZnVuY3Rpb24gbmF0U2l6ZSgkYmcpe1xuXHRcdHZhciBlbGVtID0gJGJnLmdldCgwKTtcblx0XHR2YXIgbmF0VywgbmF0SDtcblx0XHRpZihlbGVtLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2ltZycpe1xuXHRcdFx0bmF0VyA9IGVsZW0ud2lkdGg7XG5cdFx0XHRuYXRIID0gZWxlbS5oZWlnaHQ7XG5cdFx0fWVsc2UgaWYoZWxlbS5uYXR1cmFsV2lkdGgpe1xuXHRcdFx0bmF0VyA9IGVsZW0ubmF0dXJhbFdpZHRoO1xuXHRcdFx0bmF0SCA9IGVsZW0ubmF0dXJhbEhlaWdodDtcblx0XHR9ZWxzZXtcblx0XHRcdHZhciBvcmlnID0gJGJnLndpZHRoKCk7XG5cdFx0XHQkYmcuY3NzKHt3aWR0aDogJycsIGhlaWdodDogJyd9KTtcblx0XHRcdG5hdFcgPSAkYmcud2lkdGgoKTtcblx0XHRcdG5hdEggPSAkYmcuaGVpZ2h0KCk7XG5cdFx0XHQkYmcuY3NzKHt3aWR0aDogb3JpZ30pO1xuXHRcdH1cblx0XHRyZXR1cm4ge3c6IG5hdFcsIGg6IG5hdEh9O1xuXHR9XG59KSgpOyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2Nyb2xsaW5nLCBzY3JpcHQpe1xuXHR2YXIgJHZpZXdzID0gJCgnLnZpZXcnKTtcblx0dmFyIGFwcFNoYXJlID0gcmVxdWlyZSgnLi9hcHAtc2hhcmUuanMnKTtcblx0dmFyIGlzUG9vckJyb3dzZXIgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ3Bvb3ItYnJvd3NlcicpO1xuXHR0aGlzLnNjcm9sbCA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYoaXNQb29yQnJvd3NlcikgcmV0dXJuO1xuXHRcdCR2aWV3cy5lYWNoKGZ1bmN0aW9uKGkpe1xuXHRcdFx0dmFyICR2aWV3ID0gJCh0aGlzKTtcblx0XHRcdHZhciB2aWV3UG9zID0gc2Nyb2xsaW5nLmNhbGNQb3NpdGlvbigkdmlldyk7XG5cdFx0XHRpZih2aWV3UG9zLnZpc2libGUpe1xuXHRcdFx0XHR2YXIgdmlld09mZnNldCA9IHZpZXdQb3MudG9wIC0gc2Nyb2xsaW5nLndpbmRvd1RvcFBvcztcblx0XHRcdFx0JHZpZXcuY2hpbGRyZW4oJy5iZzpub3QoLnN0YXRpYyknKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0dmFyIGNmZyA9ICQodGhpcykuZGF0YSgpO1xuXHRcdFx0XHRcdGNmZy5wYXJhbGxheFkgPSBhcHBTaGFyZS5wYXJhbGxheE1hcmdpbihzY3JpcHQsIGksIHZpZXdPZmZzZXQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IChmdW5jdGlvbigpe1xyXG5cdHZhciBtZSA9IHRoaXM7XHJcblx0dGhpcy5vcHRpb25zID0ge1xyXG5cdFx0J2FuZ2llJzoge3N0eWxlOiAndGhlbWUtYW5naWUnLCBiZ1N5bmM6IFsnKiovKi50eHQnLCAnKiovKiddLCB2aWRlb1N5bmM6IFtdfSxcclxuXHRcdCdseW5kYSc6IHtzdHlsZTogJ3RoZW1lLWx5bmRhJywgYmdTeW5jOiBbJyoqLyoudHh0JywgJyoqLyonXSwgdmlkZW9TeW5jOiBbXX0sXHJcblx0XHQnYWxpY2UnOiB7c3R5bGU6ICd0aGVtZS1hbGljZScsIGJnU3luYzogWycqKi8qLnR4dCcsICcqKi8qJ10sIHZpZGVvU3luYzogW119LFxyXG5cdFx0J2x1Y3knOiB7c3R5bGU6ICd0aGVtZS1sdWN5JywgYmdTeW5jOiBbJyoqLyoudHh0JywgJyoqLyonXSwgdmlkZW9TeW5jOiBbXX0sXHJcblx0XHQnbWFyeSc6IHtzdHlsZTogJ3RoZW1lLWFsaWNlJywgYmdTeW5jOiBbJyoqLyoudHh0JywgJyoqLyonXSwgdmlkZW9TeW5jOiBbXX0sXHJcblx0XHQnc3V6aSc6IHtzdHlsZTogJ3RoZW1lLXN1emknLCBiZ1N5bmM6IFsnKiovKi50eHQnLCAnKiovKiddLCB2aWRlb1N5bmM6IFtdfSxcclxuXHRcdCd2aWtpJzoge3N0eWxlOiAndGhlbWUtdmlraScsIGJnU3luYzogWycqKi8qLnR4dCcsICcqKi8qJ10sIHZpZGVvU3luYzogW119LFxyXG5cdFx0J2x1aXphJzoge3N0eWxlOiAndGhlbWUtbHVpemEnLCBiZ1N5bmM6IFsnKiovKi50eHQnLCAnKiovKiddLCB2aWRlb1N5bmM6IFtdfVxyXG5cdH07XHJcblx0dGhpcy5uYW1lcyA9IHtcclxuXHR9O1xyXG5cdHRoaXMuY29sb3JzID0gODtcclxuXHR0aGlzLmNvbG9yQ2xhc3NlcyA9IChmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHJlcyA9ICcnO1xyXG5cdFx0Zm9yKHZhciBpPTA7IGk8bWUuY29sb3JzOyBpKyspe1xyXG5cdFx0XHR2YXIgc2VwID0gaSA9PT0gMCA/ICcnIDogJyAnO1xyXG5cdFx0XHRyZXMgKz0gc2VwICsgJ2NvbG9ycy0nK1N0cmluZy5mcm9tQ2hhckNvZGUoNjUraSkudG9Mb3dlckNhc2UoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXM7XHJcblx0fSkoKTtcclxufSkoKTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2NyaXB0KXtcclxuXHR2YXIgdGhlbWVzID0gcmVxdWlyZSgnLi4vYXBwL3RoZW1lcy5qcycpO1xyXG5cdHZhciB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzL3Rvb2xzLmpzJyk7XHJcblx0dmFyIGxvYWRpbmcgPSByZXF1aXJlKCcuLi93aWRnZXRzL2xvYWRpbmcuanMnKTtcclxuXHR2YXIgYXBwU2hhcmUgPSByZXF1aXJlKCcuLi9hcHAvYXBwLXNoYXJlLmpzJyk7XHJcblx0dmFyIGNvbG9ycyA9IHRoZW1lcy5jb2xvcnM7XHJcblx0dmFyIG1lID0gdGhpcztcclxuXHR2YXIgY1BhdGggPSAnJztcclxuXHR2YXIgY3VzdG9tQ3NzO1xyXG5cdHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xyXG5cdHZhciAkcGFuZWw7XHJcblx0dmFyICRvcHQ7XHJcblx0dmFyICR0b2dnbGU7XHJcblx0dmFyIG9wdFc7XHJcblx0dmFyICRjdXN0b21Dc3M7XHJcblx0dmFyICR0aGVtZXNTZWxlY3Q7XHJcblx0dmFyICRjb2xvcnM7XHJcblx0dmFyIGlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLmxlc3NWYXJzID0ge307XHJcblx0dGhpcy5pc1Nob3dQYW5lbCA9IChmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGN1c3RvbWl6ZVAgPSB0b29scy5nZXRVcmxQYXJhbWV0ZXIoJ2N1c3RvbWl6ZScpO1xyXG5cdFx0aWYoY3VzdG9taXplUCA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0Y3VzdG9taXplUCA9ICQuY29va2llKCdjdXN0b21pemUnKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHQkLmNvb2tpZSgnY3VzdG9taXplJywgJ3llcycsIHtwYXRoOiBjUGF0aH0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIChjdXN0b21pemVQICYmICQoJyN0b3AtbmF2JykubGVuZ3RoID4gMCkgPyB0cnVlIDogZmFsc2U7XHJcblx0fSkoKTtcclxuXHR0aGlzLnNob3cgPSBmdW5jdGlvbigpe1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHRpZighaXNJbml0aWFsaXplZCl7XHJcblx0XHRcdFx0aXNJbml0aWFsaXplZCA9IHRydWU7XHJcblx0XHRcdFx0Y3JlYXRlQ3NzKHRydWUpO1xyXG5cdFx0XHRcdGluaXRMZXNzVmFycygpO1xyXG5cdFx0XHRcdHZhciAkZ2F0ZSA9ICRvcHQuZmluZCgnLm9wdGlvbnMtZ2F0ZScpO1xyXG5cdFx0XHRcdCRnYXRlLmNzcyh7b3BhY2l0eTogMH0pO1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdCRnYXRlLmNzcyh7dmlzaWJpbGl0eTogJ2hpZGRlbid9KTtcclxuXHRcdFx0XHR9LCAxMDAwKTtcclxuXHRcdFx0fVxyXG5cdFx0fSwgNTUwKTtcclxuXHRcdCRwYW5lbC5jc3Moe2xlZnQ6ICcwcHgnfSk7XHJcblx0XHQkcGFuZWwuYWRkQ2xhc3MoJ29uJyk7XHJcblx0fTtcclxuXHR0aGlzLmhpZGUgPSBmdW5jdGlvbigpe1xyXG5cdFx0JHBhbmVsLmNzcyh7bGVmdDogLTEqb3B0VysncHgnfSk7XHJcblx0XHQkcGFuZWwucmVtb3ZlQ2xhc3MoJ29uJyk7XHJcblx0fTtcclxuXHRmdW5jdGlvbiByZXNpemUoKXtcclxuXHRcdCRvcHQuY3NzKHtcclxuXHRcdFx0aGVpZ2h0OiAoJHdpbmRvdy5oZWlnaHQoKSAtIHBhcnNlSW50KCRwYW5lbC5jc3MoJ3RvcCcpLnJlcGxhY2UoJ3B4JywnJykpIC0gMzApICsgJ3B4J1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHRoZW1lU2VsZWN0VG9DdXN0b20oKXtcclxuXHRcdGlmKCR0aGVtZXNTZWxlY3QudmFsKCkgIT09ICdjdXN0b20nKXtcclxuXHRcdFx0JCgnPG9wdGlvbiB2YWx1ZT1cImN1c3RvbVwiPkN1c3RvbTwvb3B0aW9uPicpLmFwcGVuZFRvKCR0aGVtZXNTZWxlY3QpO1xyXG5cdFx0XHQkdGhlbWVzU2VsZWN0LnZhbCgnY3VzdG9tJyk7XHJcblx0XHRcdCQuY29va2llLmpzb24gPSBmYWxzZTtcclxuXHRcdFx0JC5jb29raWUoJ3RoZW1lU2VsZWN0JywgJ2N1c3RvbScsIHtwYXRoOiBjUGF0aH0pO1xyXG5cdFx0XHQkLmNvb2tpZS5qc29uID0gdHJ1ZTtcclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gaW5pdExlc3NWYXJzKCl7XHJcblx0XHRmb3IodmFyIGk9MDsgaTxjb2xvcnM7IGkrKyl7XHJcblx0XHRcdGluaXRHcm91cChTdHJpbmcuZnJvbUNoYXJDb2RlKDY1K2kpLnRvTG93ZXJDYXNlKCkpO1xyXG5cdFx0fVxyXG5cdFx0aW5pdExlc3NWYXIoJzxzcGFuPjxzcGFuIGNsYXNzPVwicHJpbWFyeS1jb2xvclwiPjwvc3Bhbj48L3NwYW4+JywgJy5wcmltYXJ5LWNvbG9yJywgJ2NvbG9yJywgJ2lucHV0LnByaW1hcnktYmcnLCAncHJpbWFyeS1iZycsIHRvSGV4KTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3Bhbj48c3BhbiBjbGFzcz1cIm91dC1wcmltYXJ5XCI+PC9zcGFuPjwvc3Bhbj4nLCAnLm91dC1wcmltYXJ5JywgJ29wYWNpdHknLCAnaW5wdXQucHJpbWFyeS1vdXQnLCAncHJpbWFyeS1vdXQnLCBvdXRUcmFuc2xhdG9yLCBvdXRTZXRUcmFuc2xhdG9yKTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3Bhbj48c3BhbiBjbGFzcz1cInN1Y2Nlc3MtY29sb3JcIj48L3NwYW4+PC9zcGFuPicsICcuc3VjY2Vzcy1jb2xvcicsICdjb2xvcicsICdpbnB1dC5zdWNjZXNzLWJnJywgJ3N1Y2Nlc3MtYmcnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4+PHNwYW4gY2xhc3M9XCJvdXQtc3VjY2Vzc1wiPjwvc3Bhbj48L3NwYW4+JywgJy5vdXQtc3VjY2VzcycsICdvcGFjaXR5JywgJ2lucHV0LnN1Y2Nlc3Mtb3V0JywgJ3N1Y2Nlc3Mtb3V0Jywgb3V0VHJhbnNsYXRvciwgb3V0U2V0VHJhbnNsYXRvcik7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4+PHNwYW4gY2xhc3M9XCJpbmZvLWNvbG9yXCI+PC9zcGFuPjwvc3Bhbj4nLCAnLmluZm8tY29sb3InLCAnY29sb3InLCAnaW5wdXQuaW5mby1iZycsICdpbmZvLWJnJywgdG9IZXgpO1xyXG5cdFx0aW5pdExlc3NWYXIoJzxzcGFuPjxzcGFuIGNsYXNzPVwib3V0LWluZm9cIj48L3NwYW4+PC9zcGFuPicsICcub3V0LWluZm8nLCAnb3BhY2l0eScsICdpbnB1dC5pbmZvLW91dCcsICdpbmZvLW91dCcsIG91dFRyYW5zbGF0b3IsIG91dFNldFRyYW5zbGF0b3IpO1xyXG5cdFx0aW5pdExlc3NWYXIoJzxzcGFuPjxzcGFuIGNsYXNzPVwid2FybmluZy1jb2xvclwiPjwvc3Bhbj48L3NwYW4+JywgJy53YXJuaW5nLWNvbG9yJywgJ2NvbG9yJywgJ2lucHV0Lndhcm5pbmctYmcnLCAnd2FybmluZy1iZycsIHRvSGV4KTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3Bhbj48c3BhbiBjbGFzcz1cIm91dC13YXJuaW5nXCI+PC9zcGFuPjwvc3Bhbj4nLCAnLm91dC13YXJuaW5nJywgJ29wYWNpdHknLCAnaW5wdXQud2FybmluZy1vdXQnLCAnd2FybmluZy1vdXQnLCBvdXRUcmFuc2xhdG9yLCBvdXRTZXRUcmFuc2xhdG9yKTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3Bhbj48c3BhbiBjbGFzcz1cImRhbmdlci1jb2xvclwiPjwvc3Bhbj48L3NwYW4+JywgJy5kYW5nZXItY29sb3InLCAnY29sb3InLCAnaW5wdXQuZGFuZ2VyLWJnJywgJ2Rhbmdlci1iZycsIHRvSGV4KTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3Bhbj48c3BhbiBjbGFzcz1cIm91dC1kYW5nZXJcIj48L3NwYW4+PC9zcGFuPicsICcub3V0LWRhbmdlcicsICdvcGFjaXR5JywgJ2lucHV0LmRhbmdlci1vdXQnLCAnZGFuZ2VyLW91dCcsIG91dFRyYW5zbGF0b3IsIG91dFNldFRyYW5zbGF0b3IpO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBpbml0R3JvdXAoZ3JwKXtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3BhbiBjbGFzcz1cImNvbG9ycy0nK2dycCsnXCI+PHNwYW4gY2xhc3M9XCJiZy1jb2xvclwiPjwvc3Bhbj48L3NwYW4+JywgJy5iZy1jb2xvcicsICdjb2xvcicsICdpbnB1dC4nK2dycCsnLWJnJywgZ3JwKyctYmcnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4gY2xhc3M9XCJjb2xvcnMtJytncnArJ1wiPjxzcGFuIGNsYXNzPVwidGV4dFwiPjwvc3Bhbj48L3NwYW4+JywgJy50ZXh0JywgJ2NvbG9yJywgJ2lucHV0LicrZ3JwKyctdGV4dCcsIGdycCsnLXRleHQnLCB0b0hleCk7XHJcblx0XHRpbml0TGVzc1ZhcignPHNwYW4gY2xhc3M9XCJjb2xvcnMtJytncnArJ1wiPjxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0XCI+PC9zcGFuPjwvc3Bhbj4nLCAnLmhpZ2hsaWdodCcsICdjb2xvcicsICdpbnB1dC4nK2dycCsnLWhpZ2hsaWdodCcsIGdycCsnLWhpZ2hsaWdodCcsIHRvSGV4KTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3BhbiBjbGFzcz1cImNvbG9ycy0nK2dycCsnXCI+PHNwYW4gY2xhc3M9XCJsaW5rXCI+PC9zcGFuPjwvc3Bhbj4nLCAnLmxpbmsnLCAnY29sb3InLCAnaW5wdXQuJytncnArJy1saW5rJywgZ3JwKyctbGluaycsIHRvSGV4KTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3BhbiBjbGFzcz1cImNvbG9ycy0nK2dycCsnXCI+PHNwYW4gY2xhc3M9XCJoZWFkaW5nXCI+PC9zcGFuPjwvc3Bhbj4nLCAnLmhlYWRpbmcnLCAnY29sb3InLCAnaW5wdXQuJytncnArJy1oZWFkaW5nJywgZ3JwKyctaGVhZGluZycsIHRvSGV4KTtcclxuXHRcdGluaXRMZXNzVmFyKCc8c3BhbiBjbGFzcz1cImNvbG9ycy0nK2dycCsnXCI+PHNwYW4gY2xhc3M9XCJvdXRcIj48L3NwYW4+PC9zcGFuPicsICcub3V0JywgJ29wYWNpdHknLCAnaW5wdXQuJytncnArJy1vdXQnLCBncnArJy1vdXQnLCBvdXRUcmFuc2xhdG9yLCBvdXRTZXRUcmFuc2xhdG9yKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gb3V0VHJhbnNsYXRvcih2KXtyZXR1cm4gTWF0aC5yb3VuZCgoMS12KSoxMDApO31cclxuXHRmdW5jdGlvbiBvdXRTZXRUcmFuc2xhdG9yKHYpe3JldHVybiBNYXRoLnJvdW5kKHYpO31cclxuXHRmdW5jdGlvbiBpbml0TGVzc1ZhcihnZXR0ZXJIdG1sLCBnZXR0ZXJRLCBjc3NQcm9wZXJ0eSwgaW5wdXRRLCBsZXNzVmFyLCB0cmFuc2xhdG9yLCBzZXRUcmFuc2xhdG9yKXtcclxuXHRcdC8vdmFyIGNoYW5nZURlbGF5ID0gMzAwO1xyXG5cdFx0dmFyICRnID0gJCgnPHNwYW4gY2xhc3M9XCJnZXR0ZXJcIj48L3NwYW4+JykuYXBwZW5kVG8oJ2JvZHknKTtcclxuXHRcdCQoZ2V0dGVySHRtbCkuYXBwZW5kVG8oJGcpO1xyXG5cdFx0dmFyIGdldHRlZCA9ICRnLmZpbmQoZ2V0dGVyUSkuY3NzKGNzc1Byb3BlcnR5KTtcclxuXHRcdCRnLnJlbW92ZSgpO1xyXG5cdFx0aWYoZ2V0dGVkKXtcclxuXHRcdFx0aWYodHJhbnNsYXRvcikgZ2V0dGVkID0gdHJhbnNsYXRvcihnZXR0ZWQpO1xyXG5cdFx0fVxyXG5cdFx0bWUubGVzc1ZhcnNbbGVzc1Zhcl0gPSBnZXR0ZWQ7XHJcblx0XHR2YXIgJGlucCA9ICRvcHQuZmluZChpbnB1dFEpO1xyXG5cdFx0JGlucC52YWwoZ2V0dGVkKTtcclxuXHRcdGlmKGNzc1Byb3BlcnR5ID09PSAnY29sb3InKXtcclxuXHRcdFx0JGlucC5taW5pY29sb3JzKHtcclxuXHRcdFx0XHRjb250cm9sOiAkKHRoaXMpLmF0dHIoJ2RhdGEtY29udHJvbCcpIHx8ICdodWUnLFxyXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogJCh0aGlzKS5hdHRyKCdkYXRhLWRlZmF1bHRWYWx1ZScpIHx8ICcnLFxyXG5cdFx0XHRcdGlubGluZTogJCh0aGlzKS5hdHRyKCdkYXRhLWlubGluZScpID09PSAndHJ1ZScsXHJcblx0XHRcdFx0bGV0dGVyQ2FzZTogJCh0aGlzKS5hdHRyKCdkYXRhLWxldHRlckNhc2UnKSB8fCAnbG93ZXJjYXNlJyxcclxuXHRcdFx0XHRvcGFjaXR5OiBmYWxzZSxcclxuXHRcdFx0XHRwb3NpdGlvbjogJCh0aGlzKS5hdHRyKCdkYXRhLXBvc2l0aW9uJykgfHwgJ3RvcCBsZWZ0JyxcclxuXHRcdFx0XHQvL2NoYW5nZURlbGF5OiBjaGFuZ2VEZWxheSxcclxuXHRcdFx0XHRjaGFuZ2U6IGZ1bmN0aW9uKGhleCwgb3BhY2l0eSkge1xyXG5cdFx0XHRcdFx0dGhlbWVTZWxlY3RUb0N1c3RvbSgpO1xyXG5cdFx0XHRcdFx0bWUubGVzc1ZhcnNbbGVzc1Zhcl0gPSBoZXg7XHJcblx0XHRcdFx0XHRjcmVhdGVDc3MoKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNob3c6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgJG1jID0gJGlucC5wYXJlbnQoKTtcclxuXHRcdFx0XHRcdHZhciAkbWNQYW5lbCA9ICRtYy5jaGlsZHJlbignLm1pbmljb2xvcnMtcGFuZWwnKTtcclxuXHRcdFx0XHRcdHZhciBtY1BhbmVsSCA9ICRtY1BhbmVsLm91dGVySGVpZ2h0KHRydWUpO1xyXG5cdFx0XHRcdFx0dmFyIG1jUGFuZWxXID0gJG1jUGFuZWwub3V0ZXJXaWR0aCh0cnVlKTtcclxuXHRcdFx0XHRcdHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xyXG5cdFx0XHRcdFx0dmFyIHdXID0gJHdpbmRvdy53aWR0aCgpO1xyXG5cdFx0XHRcdFx0dmFyIHdIID0gJHdpbmRvdy5oZWlnaHQoKTtcclxuXHRcdFx0XHRcdHZhciBvZmZzZXQgPSAkbWNQYW5lbC5vZmZzZXQoKTtcclxuXHRcdFx0XHRcdHZhciBsZWZ0ID0gb2Zmc2V0LmxlZnQgLSAkKGRvY3VtZW50KS5zY3JvbGxMZWZ0KCk7XHJcblx0XHRcdFx0XHR2YXIgdG9wID0gb2Zmc2V0LnRvcCAtICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xyXG5cdFx0XHRcdFx0aWYoIChsZWZ0K21jUGFuZWxXKSA+IHdXICl7XHJcblx0XHRcdFx0XHRcdGxlZnQgPSB3VyAtIG1jUGFuZWxXIC0gNTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKCAodG9wK21jUGFuZWxIKSA+IHdIICl7XHJcblx0XHRcdFx0XHRcdHRvcCA9IHdIIC0gbWNQYW5lbEggLSAyO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoIHRvcCA8IDAgKXtcclxuXHRcdFx0XHRcdFx0dG9wID0gMjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdCRtY1BhbmVsLmNzcyh7XHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiAnZml4ZWQnLFxyXG5cdFx0XHRcdFx0XHRsZWZ0OiBsZWZ0KydweCcsXHJcblx0XHRcdFx0XHRcdHRvcDogdG9wKydweCdcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0aGlkZTogZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdCRpbnAucGFyZW50KCkuY2hpbGRyZW4oJy5taW5pY29sb3JzLXBhbmVsJykuY3NzKHtcclxuXHRcdFx0XHRcdFx0cG9zaXRpb246ICcnLFxyXG5cdFx0XHRcdFx0XHRsZWZ0OiAnJyxcclxuXHRcdFx0XHRcdFx0dG9wOiAnJ1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0aGVtZTogJ2Jvb3RzdHJhcCdcclxuXHRcdFx0fSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dmFyIHRpbWVyO1xyXG5cdFx0XHQkaW5wLmNoYW5nZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciAkZWwgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdHZhciB2YWwgPSAkZWwudmFsKCk7XHJcblx0XHRcdFx0aWYgKHRpbWVyKXtcclxuXHRcdFx0XHRcdGNsZWFyVGltZW91dCh0aW1lcik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR0aGVtZVNlbGVjdFRvQ3VzdG9tKCk7XHJcblx0XHRcdFx0XHRtZS5sZXNzVmFyc1tsZXNzVmFyXSA9IHZhbDtcclxuXHRcdFx0XHRcdGNyZWF0ZUNzcygpO1xyXG5cdFx0XHRcdC8vfSwgY2hhbmdlRGVsYXkpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGZ1bmN0aW9uIGNvbG9yRm9ybWF0KHZhbCl7XHJcblx0XHRcdGlmKCF2YWwubWF0Y2goL14jWzAtOWEtZkEtZl1bMC05YS1mQS1mXVswLTlhLWZBLWZdWzAtOWEtZkEtZl1bMC05YS1mQS1mXVswLTlhLWZBLWZdJC9pKSl7XHJcblx0XHRcdFx0aWYodmFsLm1hdGNoKC9eI1swLTlhLWZBLWZdWzAtOWEtZkEtZl1bMC05YS1mQS1mXSQvaSkpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIFwiI1wiK3ZhbC5jaGFyQXQoMSkrdmFsLmNoYXJBdCgxKSt2YWwuY2hhckF0KDIpK3ZhbC5jaGFyQXQoMikrdmFsLmNoYXJBdCgzKSt2YWwuY2hhckF0KDMpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRyZXR1cm4gdmFsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGJ1aWxkUGFuZWwoKXtcclxuXHRcdGlmKCFtZS5pc1Nob3dQYW5lbCl7XHJcblx0XHRcdCRwYW5lbC5oaWRlKCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRpZihPYmplY3Qua2V5cyh0aGVtZXMubmFtZXMpLmxlbmd0aD4wKXtcclxuXHRcdFx0XHRmb3IgKHZhciBrIGluIHRoZW1lcy5uYW1lcyl7XHJcblx0XHRcdFx0XHQkKCc8b3B0aW9uIHZhbHVlPVwiJytrKydcIj4nK3RoZW1lcy5uYW1lc1trXSsnPC9vcHRpb24+JykuYXBwZW5kVG8oJHRoZW1lc1NlbGVjdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHQkdGhlbWVzU2VsZWN0LnJlbW92ZSgpO1xyXG5cdFx0XHRcdCQoJzxhIGNsYXNzPVwiYnV0dG9uXCIgaHJlZj1cIiNcIj5SZXNldDwvYT4nKS5hcHBlbmRUbygkb3B0LmZpbmQoJy50aGVtZXMnKSkuY2xpY2soZnVuY3Rpb24oZSl7XHJcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHQkLmNvb2tpZS5qc29uID0gZmFsc2U7XHJcblx0XHRcdFx0XHQkLmNvb2tpZSgndGhlbWVTZWxlY3QnLCBcIlwiLCB7cGF0aDogY1BhdGh9KTtcclxuXHRcdFx0XHRcdCQuY29va2llLmpzb24gPSB0cnVlO1xyXG5cdFx0XHRcdFx0bWUuaGlkZSgpO1xyXG5cdFx0XHRcdFx0bG9hZGluZy5nYXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdFx0JC5jb29raWUuanNvbiA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgdGhlbWVTZWxlY3RDID0gJC5jb29raWUoJ3RoZW1lU2VsZWN0Jyk7XHJcblx0XHRcdCQuY29va2llLmpzb24gPSB0cnVlO1xyXG5cdFx0XHRpZih0aGVtZVNlbGVjdEMgPT09ICdjdXN0b20nKXtcclxuXHRcdFx0XHR0aGVtZVNlbGVjdFRvQ3VzdG9tKCk7XHJcblx0XHRcdH1lbHNlIGlmKHRoZW1lU2VsZWN0Qyl7XHJcblx0XHRcdFx0JHRoZW1lc1NlbGVjdC52YWwodGhlbWVTZWxlY3RDKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dmFyICRmYWN0b3J5ID0gJCgnI2ZhY3RvcnktdGhlbWUnKTtcclxuXHRcdFx0XHRpZigkZmFjdG9yeS5sZW5ndGggPiAwICYmICRmYWN0b3J5LmNzcygndmlzaWJpbGl0eScpID09PSAnaGlkZGVuJyl7XHJcblx0XHRcdFx0XHR2YXIgdHMgPSB0aGVtZXMub3B0aW9uc1skZmFjdG9yeS5odG1sKCldLnN0eWxlO1xyXG5cdFx0XHRcdFx0JHRoZW1lc1NlbGVjdC52YWwodHMpO1xyXG5cdFx0XHRcdFx0JC5jb29raWUuanNvbiA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JC5jb29raWUoJ3RoZW1lU2VsZWN0JywgdHMsIHtwYXRoOiBjUGF0aH0pO1xyXG5cdFx0XHRcdFx0JC5jb29raWUuanNvbiA9IHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdCR0aGVtZXNTZWxlY3QuY2hhbmdlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0JCgnLm9wdGlvbnMgLnRoZW1lcyBzZWxlY3Qgb3B0aW9uW3ZhbHVlPWN1c3RvbV0nKS5yZW1vdmUoKTtcclxuXHRcdFx0XHR2YXIgaHJlZiA9ICQodGhpcykudmFsKCk7XHJcblx0XHRcdFx0JC5jb29raWUuanNvbiA9IGZhbHNlO1xyXG5cdFx0XHRcdCQuY29va2llKCd0aGVtZVNlbGVjdCcsIGhyZWYsIHtwYXRoOiBjUGF0aH0pO1xyXG5cdFx0XHRcdCQuY29va2llLmpzb24gPSB0cnVlO1xyXG5cdFx0XHRcdG1lLmhpZGUoKTtcclxuXHRcdFx0XHRsb2FkaW5nLmdhdGUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0JHBhbmVsLmNzcyh7bGVmdDogLTEqb3B0VysncHgnfSk7XHJcblx0XHRcdCR0b2dnbGUuY2xpY2soZnVuY3Rpb24oZSl7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdGlmKCRwYW5lbC5oYXNDbGFzcygnb24nKSl7XHJcblx0XHRcdFx0XHRtZS5oaWRlKCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRtZS5zaG93KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0JG9wdC5maW5kKCcuc2F2ZS1jdXN0b20tY3NzJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHZhciAkY29udGVudCA9ICRjdXN0b21Dc3MuZmluZCgnLmNvbnRlbnQnKTtcclxuXHRcdFx0XHRpZigkLmNvb2tpZSgnc2F2ZUFzTGVzcycpKXtcclxuXHRcdFx0XHRcdHZhciBsZXNzU3RyPSdAaW1wb3J0IFwidGhlbWUubGVzc1wiO1xcclxcblxcclxcbic7XHJcblx0XHRcdFx0XHRmb3IodmFyIGtleSBpbiBtZS5sZXNzVmFycyl7XHJcblx0XHRcdFx0XHRcdGxlc3NTdHIgPSBsZXNzU3RyKydAJytrZXkrJzogJyttZS5sZXNzVmFyc1trZXldKyc7XFxyXFxuJztcclxuXHRcdFx0XHRcdFx0JGNvbnRlbnQudGV4dChsZXNzU3RyKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGlmKCFjdXN0b21Dc3MpIGNyZWF0ZUNzcygpO1xyXG5cdFx0XHRcdFx0JGNvbnRlbnQudGV4dChcclxuXHRcdFx0XHRcdFx0Y3VzdG9tQ3NzLnJlcGxhY2UoLyhcXHJcXG58XFxyfFxcbikvZywnXFxyXFxuJylcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdG5ldyBUV0VFTi5Ud2Vlbih7YXV0b0FscGhhOiAwLCB4Oi00NTB9KVxyXG5cdFx0XHRcdFx0LnRvKHthdXRvQWxwaGE6IDEsIHg6IDB9LCA0MDApXHJcblx0XHRcdFx0XHQub25VcGRhdGUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0JGN1c3RvbUNzcy5jc3Moe29wYWNpdHk6IHRoaXMuYXV0b0FscGhhLCB2aXNpYmlsaXR5OiAodGhpcy5hdXRvQWxwaGEgPiAwID8gJ3Zpc2libGUnIDogJ2hpZGRlbicpfSk7XHJcblx0XHRcdFx0XHRcdGlmKE1vZGVybml6ci5jc3N0cmFuc2Zvcm1zM2QgJiYgYXBwU2hhcmUuZm9yY2UzRCl7XHJcblx0XHRcdFx0XHRcdFx0JGN1c3RvbUNzcy5jc3Moe3RyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKCcrdGhpcy54KydweCwgMHB4LCAwcHgpJ30pO1xyXG5cdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHQkY3VzdG9tQ3NzLmNzcyh7dHJhbnNmb3JtOiAndHJhbnNsYXRlKCcrdGhpcy54KydweCwgMHB4KSd9KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5lYXNpbmcoVFdFRU4uRWFzaW5nLlF1YWRyYXRpYy5PdXQpXHJcblx0XHRcdFx0XHQuc3RhcnQoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdCRjdXN0b21Dc3MuZmluZCgnLmNsb3NlLXBhbmVsJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdG5ldyBUV0VFTi5Ud2Vlbih7YXV0b0FscGhhOiAxLCB4OiAwfSlcclxuXHRcdFx0XHRcdC50byh7YXV0b0FscGhhOiAwLCB4OiAtNDUwfSwgNDAwKVxyXG5cdFx0XHRcdFx0Lm9uVXBkYXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdCRjdXN0b21Dc3MuY3NzKHtvcGFjaXR5OiB0aGlzLmF1dG9BbHBoYSwgdmlzaWJpbGl0eTogKHRoaXMuYXV0b0FscGhhID4gMCA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKX0pO1xyXG5cdFx0XHRcdFx0XHRpZihNb2Rlcm5penIuY3NzdHJhbnNmb3JtczNkICYmIGFwcFNoYXJlLmZvcmNlM0Qpe1xyXG5cdFx0XHRcdFx0XHRcdCRjdXN0b21Dc3MuY3NzKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgnK3RoaXMueCsncHgsIDBweCwgMHB4KSd9KTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0JGN1c3RvbUNzcy5jc3Moe3RyYW5zZm9ybTogJ3RyYW5zbGF0ZSgnK3RoaXMueCsncHgsIDBweCknfSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuZWFzaW5nKFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZSlcclxuXHRcdFx0XHRcdC5zdGFydCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0dG9vbHMuc2VsZWN0VGV4dGFyZWEoJGN1c3RvbUNzcy5maW5kKFwidGV4dGFyZWFcIikpO1xyXG5cdFx0XHR2YXIgY29sb3JzQmcgPSAkY29sb3JzLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xyXG5cdFx0XHRpZighY29sb3JzQmcgfHwgY29sb3JzQmcgPT0gJ25vbmUnKXtcclxuXHRcdFx0XHR2YXIgJGJnSW0gPSAkKCdpbWcuYmcnKTtcclxuXHRcdFx0XHRpZigkYmdJbS5sZW5ndGg+MCl7XHJcblx0XHRcdFx0XHQkY29sb3JzLmNzcyh7XHJcblx0XHRcdFx0XHRcdCdiYWNrZ3JvdW5kLWltYWdlJzogXCJ1cmwoJ1wiKyRiZ0ltLmdldCgwKS5zcmMrXCInKVwiLFxyXG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1wb3NpdGlvbic6ICdjZW50ZXIgY2VudGVyJyxcclxuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtc2l6ZSc6ICdjb3ZlcidcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiBjcmVhdGVDc3MoaXNJbml0T25seSl7XHJcblx0XHR2YXIgY3VzdG9tID0gYXRvYihjdXN0b21MZXNzKTtcclxuXHRcdCQuY29va2llKCdsZXNzVmFycycsIG1lLmxlc3NWYXJzLCB7cGF0aDogY1BhdGh9KTtcclxuXHRcdGRvTGVzcyhjdXN0b20sIGZ1bmN0aW9uKGNzcyl7XHJcblx0XHRcdGlmKCFpc0luaXRPbmx5KXtcclxuXHRcdFx0XHR2YXIgZW1zID0gJ2VkaXQtbW9kZS1zdHlsZXMnO1xyXG5cdFx0XHRcdGN1c3RvbUNzcyA9IGNzcztcclxuXHRcdFx0XHR2YXIgJGN1ciA9ICQoJyMnK2Vtcyk7XHJcblx0XHRcdFx0aWYoJGN1ci5sZW5ndGg8MSl7XHJcblx0XHRcdFx0XHQkKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCIgaWQ9XCInK2VtcysnXCI+XFxuJytjc3MrJzwvc3R5bGU+JykuYXBwZW5kVG8oJ2hlYWQnKTtcclxuXHRcdFx0XHRcdCQoJyNjdXN0b20tY3NzJykucmVtb3ZlKCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRpZigkY3VyWzBdLmlubmVySFRNTCl7XHJcblx0XHRcdFx0XHRcdCRjdXJbMF0uaW5uZXJIVE1MID0gY3VzdG9tQ3NzO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdCRjdXJbMF0uc3R5bGVTaGVldC5jc3NUZXh0ID0gY3VzdG9tQ3NzO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGRvTGVzcyhkYXRhLCBjYWxsYmFjayl7XHJcblx0XHRsZXNzLnJlbmRlcihcclxuXHRcdFx0ZGF0YSxcclxuXHRcdFx0e1x0Y3VycmVudERpcmVjdG9yeTogXCJzdHlsZXMvdGhlbWVzL1wiLFxyXG5cdFx0XHRcdGZpbGVuYW1lOiBcInN0eWxlcy90aGVtZXMvdGhlbWUtZGVmYXVsdC5sZXNzXCIsXHJcblx0XHRcdFx0ZW50cnlQYXRoOiBcInN0eWxlcy90aGVtZXMvXCIsXHJcblx0XHRcdFx0cm9vdHBhdGg6IFwic3R5bGVzL3RoZW1lcy9zdHlsZXMvdGhlbWVzL1wiLFxyXG5cdFx0XHRcdHJvb3RGaWxlbmFtZTogXCJzdHlsZXMvdGhlbWVzL3RoZW1lLWRlZmF1bHQubGVzc1wiLFxyXG5cdFx0XHRcdHJlbGF0aXZlVXJsczogZmFsc2UsXHJcblx0XHRcdFx0dXNlRmlsZUNhY2hlOiBtZS5sZXNzVmFycyB8fCBsZXNzLmdsb2JhbFZhcnMsXHJcblx0XHRcdFx0Y29tcHJlc3M6IGZhbHNlLFxyXG5cdFx0XHRcdG1vZGlmeVZhcnM6IG1lLmxlc3NWYXJzLFxyXG5cdFx0XHRcdGdsb2JhbFZhcnM6IGxlc3MuZ2xvYmFsVmFyc1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRmdW5jdGlvbihlLCBvdXRwdXQpIHtcclxuXHRcdFx0XHRjYWxsYmFjayhvdXRwdXQuY3NzKTtcclxuXHRcdFx0fVxyXG5cdFx0KTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gdG9IZXgocmdiKXtcclxuXHRcdGlmKHJnYi5pbmRleE9mKCdyZ2InKSA9PT0gLTEpe1xyXG5cdFx0XHRyZXR1cm4gcmdiO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHZhciB0cmlwbGV0ID0gcmdiLm1hdGNoKC9bXjAtOV0qKFswLTldKilbXjAtOV0qKFswLTldKilbXjAtOV0qKFswLTldKilbXjAtOV0qL2kpO1xyXG5cdFx0XHRyZXR1cm4gXCIjXCIrZGlnaXRUb0hleCh0cmlwbGV0WzFdKStkaWdpdFRvSGV4KHRyaXBsZXRbMl0pK2RpZ2l0VG9IZXgodHJpcGxldFszXSk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBkaWdpdFRvSGV4KGRpZyl7XHJcblx0XHRcdGlmKGlzTmFOKGRpZykpe1xyXG5cdFx0XHRcdHJldHVybiBcIjAwXCI7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHZhciBoeCA9IHBhcnNlSW50KGRpZykudG9TdHJpbmcoMTYpO1xyXG5cdFx0XHRcdHJldHVybiBoeC5sZW5ndGggPT0gMSA/IFwiMFwiK2h4IDogaHg7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYobWUuaXNTaG93UGFuZWwpe1xyXG5cdFx0JCgnPGRpdiBpZD1cImN1c3RvbWl6ZS1wYW5lbFwiPjwvZGl2PicpLmFwcGVuZFRvKCdib2R5JykubG9hZCgnY3VzdG9taXplL2N1c3RvbWl6ZS5odG1sICNjdXN0b21pemUtcGFuZWw+KicsIGZ1bmN0aW9uKHhociwgc3RhdHVzVGV4dCwgcmVxdWVzdCl7XHJcblx0XHRcdGlmKHN0YXR1c1RleHQgIT09IFwic3VjY2Vzc1wiICYmIHN0YXR1c1RleHQgIT09IFwibm90bW9kaWZpZWRcIil7XHJcblx0XHRcdFx0JCgnI2N1c3RvbWl6ZS1wYW5lbCcpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdHNjcmlwdC5hZnRlckNvbmZpZ3VyZSgpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHQkLmdldFNjcmlwdCggXCJjdXN0b21pemUvY3VzdG9tLWxlc3MuanNcIiwgZnVuY3Rpb24oIGRhdGEsIGxlc3NTdGF0dXNUZXh0LCBqcXhociApIHtcclxuXHRcdFx0XHRcdGlmKGxlc3NTdGF0dXNUZXh0ICE9PSBcInN1Y2Nlc3NcIiAmJiBsZXNzU3RhdHVzVGV4dCAhPT0gXCJub3Rtb2RpZmllZFwiKXtcclxuXHRcdFx0XHRcdFx0JCgnI2N1c3RvbWl6ZS1wYW5lbCcpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0XHRzY3JpcHQuYWZ0ZXJDb25maWd1cmUoKTtcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHQkcGFuZWwgPSAkKCcjY3VzdG9taXplLXBhbmVsJyk7XHJcblx0XHRcdFx0XHRcdCRvcHQgPSAkcGFuZWwuZmluZCgnLm9wdGlvbnMnKTtcclxuXHRcdFx0XHRcdFx0JHRvZ2dsZSA9ICRwYW5lbC5maW5kKCcudG9nZ2xlLWJ1dHRvbicpO1xyXG5cdFx0XHRcdFx0XHRvcHRXID0gJG9wdC53aWR0aCgpO1xyXG5cdFx0XHRcdFx0XHQkY3VzdG9tQ3NzID0gJHBhbmVsLmZpbmQoJy5jdXN0b20tY3NzJyk7XHJcblx0XHRcdFx0XHRcdCR0aGVtZXNTZWxlY3QgPSAkb3B0LmZpbmQoJy50aGVtZXMgc2VsZWN0Jyk7XHJcblx0XHRcdFx0XHRcdCRjb2xvcnMgPSAkb3B0LmZpbmQoJy5jb2xvcnMnKTtcclxuXHRcdFx0XHRcdFx0JC5jb29raWUuanNvbiA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGJ1aWxkUGFuZWwoKTtcclxuXHRcdFx0XHRcdFx0aWYodG9vbHMuZ2V0VXJsUGFyYW1ldGVyKCdzYXZlLWFzLWxlc3MnKSl7XHJcblx0XHRcdFx0XHRcdFx0JC5jb29raWUoJ3NhdmVBc0xlc3MnLCAneWVzJywge3BhdGg6IGNQYXRofSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0JC5jb29raWUuanNvbiA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR2YXIgdHNjID0gJC5jb29raWUoJ3RoZW1lU2VsZWN0Jyk7XHJcblx0XHRcdFx0XHRcdCQuY29va2llLmpzb24gPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRpZiggdHNjID09PSAnY3VzdG9tJyApe1xyXG5cdFx0XHRcdFx0XHRcdGlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdG1lLmxlc3NWYXJzID0gJC5jb29raWUoJ2xlc3NWYXJzJyk7XHJcblx0XHRcdFx0XHRcdFx0Y3JlYXRlQ3NzKCk7XHJcblx0XHRcdFx0XHRcdFx0aW5pdExlc3NWYXJzKCk7XHJcblx0XHRcdFx0XHRcdFx0JG9wdC5maW5kKCcub3B0aW9ucy1nYXRlJykuY3NzKHt2aXNpYmlsaXR5OiAnaGlkZGVuJ30pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdCR3aW5kb3cucmVzaXplKHJlc2l6ZSk7XHJcblx0XHRcdFx0XHRcdHJlc2l6ZSgpO1xyXG5cdFx0XHRcdFx0XHRzY3JpcHQuYWZ0ZXJDb25maWd1cmUoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fWVsc2V7XHJcblx0XHRzY3JpcHQuYWZ0ZXJDb25maWd1cmUoKTtcclxuXHR9XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG4kKGZ1bmN0aW9uKCkgeyBuZXcgKGZ1bmN0aW9uKCl7XHJcblx0dmFyIEN1c3RvbWl6ZSA9IHJlcXVpcmUoJy4vY3VzdG9taXplL2N1c3RvbWl6ZS5qcycpO1xyXG5cdHZhciBUb3BOYXYgPSByZXF1aXJlKCcuL3dpZGdldHMvdG9wLW5hdi5qcycpO1xyXG5cdHZhciBNZW51VG9nZ2xlID0gcmVxdWlyZSgnLi93aWRnZXRzL21lbnUtdG9nZ2xlLmpzJyk7XHJcblx0dmFyIFBsYXllcnMgPSByZXF1aXJlKCcuL2FuaW1hdGlvbi9wbGF5ZXJzLmpzJyk7XHJcblx0dmFyIFNjcm9sbGluZyA9IHJlcXVpcmUoJy4vYW5pbWF0aW9uL3Njcm9sbGluZy5qcycpO1xyXG5cdHZhciB0b29scyA9IHJlcXVpcmUoJy4vdG9vbHMvdG9vbHMuanMnKTtcclxuXHR2YXIgU2hvd0xpc3QgPSByZXF1aXJlKCcuL3dpZGdldHMvc2hvdy1saXN0LmpzJyk7XHJcblx0dmFyIEdhbGxlcnkgPSByZXF1aXJlKCcuL3dpZGdldHMvZ2FsbGVyeS5qcycpO1xyXG5cdHZhciBmbHVpZCA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9mbHVpZC5qcycpO1xyXG5cdHZhciBDb3VudGVyID0gcmVxdWlyZSgnLi93aWRnZXRzL2NvdW50ZXIuanMnKTtcclxuXHR2YXIgQ2hhbmdlQ29sb3JzID0gcmVxdWlyZSgnLi93aWRnZXRzL2NoYW5nZS1jb2xvcnMuanMnKTtcclxuXHR2YXIgU2xpZGVycyA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9zbGlkZXJzLmpzJyk7XHJcblx0dmFyIGxvYWRpbmcgPSByZXF1aXJlKCcuL3dpZGdldHMvbG9hZGluZy5qcycpO1xyXG5cdHZhciBDc3NBbmltYXRpb24gPSByZXF1aXJlKCcuL2FuaW1hdGlvbi9jc3MtYW5pbWF0aW9uLmpzJyk7XHJcblx0dmFyIGRvdFNjcm9sbCA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9kb3Qtc2Nyb2xsLmpzJyk7XHJcblx0dmFyIE1hcCA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9tYXAuanMnKTtcclxuXHR2YXIgU2tpbGxiYXIgPSByZXF1aXJlKCcuL3dpZGdldHMvc2tpbGxiYXIuanMnKTtcclxuXHR2YXIgQWpheEZvcm0gPSByZXF1aXJlKCcuL3dpZGdldHMvYWpheC1mb3JtLmpzJyk7XHJcblx0dmFyIFlvdXR1YmVCRyA9IHJlcXVpcmUoJy4vd2lkZ2V0cy95b3V0dWJlLWJnLmpzJyk7XHJcblx0dmFyIFZpbWVvQkcgPSByZXF1aXJlKCcuL3dpZGdldHMvdmltZW8tYmcuanMnKTtcclxuXHR2YXIgVmlkZW9CRyA9IHJlcXVpcmUoJy4vd2lkZ2V0cy92aWRlby1iZy5qcycpO1xyXG5cdHZhciBhcHAgPSByZXF1aXJlKCcuL2FwcC9hcHAuanMnKTtcclxuXHR2YXIgT3ZlcmxheVdpbmRvdyA9IHJlcXVpcmUoJy4vd2lkZ2V0cy9vdmVybGF5LXdpbmRvdy5qcycpO1xyXG5cdHZhciBpc1Bvb3JCcm93c2VyID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdwb29yLWJyb3dzZXInKTtcclxuXHR2YXIgaXNBbmRyb2lkNDNtaW51cyA9ICQoJ2h0bWwnKS5oYXNDbGFzcygnYW5kcm9pZC1icm93c2VyLTRfM21pbnVzJyk7XHJcblx0dmFyICRwYWdlVHJhbnNpdGlvbiA9ICQoJy5wYWdlLXRyYW5zaXRpb24nKTtcclxuXHR2YXIgbWUgPSB0aGlzO1xyXG5cdHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xyXG5cdHZhciAkc2VjdGlvbnMgPSAkKCdzZWN0aW9uJyk7XHJcblx0dmFyIHNlY3Rpb25UcmlnZ2VycyA9IFtdO1xyXG5cdHZhciBsYXN0QWN0aXZlU2VjdGlvbkhhc2g7XHJcblx0dmFyIGxvY2F0aW9uID0gZG9jdW1lbnQubG9jYXRpb24uaGFzaCA/IGRvY3VtZW50LmxvY2F0aW9uLmhyZWYucmVwbGFjZShuZXcgUmVnRXhwKGRvY3VtZW50LmxvY2F0aW9uLmhhc2grJyQnKSwnJykgOiBkb2N1bWVudC5sb2NhdGlvbi5ocmVmLnJlcGxhY2UoJyMnLCcnKTtcclxuXHR2YXIgJG5hdkxpbmtzID0gKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgJHJlcyA9IGpRdWVyeSgpO1xyXG5cdFx0JCgnI3RvcC1uYXYgLm5hdmJhci1uYXYgYScpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcclxuXHRcdFx0aWYoXHJcblx0XHRcdFx0KCF0aGlzLmhhc2gpIHx8XHJcblx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0KHRoaXMuaHJlZiA9PT0gbG9jYXRpb24rdGhpcy5oYXNoKSAmJlxyXG5cdFx0XHRcdFx0KCQoJ3NlY3Rpb24nK3RoaXMuaGFzaCkubGVuZ3RoID4gMClcclxuXHRcdFx0XHQpXHJcblx0XHRcdCl7XHJcblx0XHRcdFx0JHJlcyA9ICRyZXMuYWRkKCR0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gJHJlcztcclxuXHR9KSgpO1xyXG5cdHZhciBpc01vYmlsZSA9ICQoJ2h0bWwnKS5oYXNDbGFzcygnbW9iaWxlJyk7XHJcblx0dmFyIHNjcm9sbGluZztcclxuXHR2YXIgbWF4U2Nyb2xsUG9zaXRpb247XHJcblx0dmFyIHRpY2tlciA9IG5ldyAoZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR3aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IChmdW5jdGlvbigpe1xyXG5cdFx0XHRyZXR1cm4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICAgfHwgXHJcblx0XHRcdFx0d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcclxuXHRcdFx0XHR3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8IFxyXG5cdFx0XHRcdHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgfHwgXHJcblx0XHRcdFx0d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fCBcclxuXHRcdFx0XHRmdW5jdGlvbigvKiBmdW5jdGlvbiAqLyBjYWxsYmFjaywgLyogRE9NRWxlbWVudCAqLyBlbGVtZW50KXtcclxuXHRcdFx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xyXG5cdFx0XHRcdH07XHJcblx0XHR9KSgpO1xyXG5cdFx0dmFyIGxhc3RQb3NpdGlvbiA9IC0xO1xyXG5cdFx0dGhpcy5wYWdlSXNSZWFkeSA9IGZhbHNlO1xyXG5cdFx0KGZ1bmN0aW9uIGFuaW1hdGUodGltZSl7XHJcblx0XHRcdGlmKG1lLnBhZ2VJc1JlYWR5KXtcclxuXHRcdFx0XHR2YXIgd2luZG93VG9wUG9zID0gdG9vbHMud2luZG93WU9mZnNldCgpO1xyXG5cdFx0XHRcdGlmIChsYXN0UG9zaXRpb24gIT09IHdpbmRvd1RvcFBvcykge1xyXG5cdFx0XHRcdFx0c2Nyb2xsaW5nLnNjcm9sbCh3aW5kb3dUb3BQb3MpO1xyXG5cdFx0XHRcdFx0dHJpZ05hdmlnYXRpb25MaW5rcyh3aW5kb3dUb3BQb3MpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRsYXN0UG9zaXRpb24gPSB3aW5kb3dUb3BQb3M7XHJcblx0XHRcdFx0VFdFRU4udXBkYXRlKCk7XHJcblx0XHRcdFx0YXBwLnRpY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZihsb2FkaW5nLnF1ZXVlLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHQobG9hZGluZy5xdWV1ZS5wb3AoKSkoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXF1ZXN0QW5pbUZyYW1lKGFuaW1hdGUpO1xyXG5cdFx0fSkoKTtcclxuXHR9KSgpO1xyXG5cdFxyXG5cdHRoaXMudG9wTmF2ID0gdW5kZWZpbmVkO1xyXG5cdHRoaXMucGxheWVycyA9IFBsYXllcnM7XHJcblx0dGhpcy5hZnRlckNvbmZpZ3VyZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xyXG5cdFx0aWYgKGhpc3RvcnkgJiYgaGlzdG9yeS5yZXBsYWNlU3RhdGUpIHtcclxuXHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUoXCJcIiwgZG9jdW1lbnQudGl0bGUsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG5cdFx0fVxyXG5cdFx0bmV3IFlvdXR1YmVCRygpO1xyXG5cdFx0bmV3IFZpbWVvQkcoKTtcclxuXHRcdG5ldyBWaWRlb0JHKCk7XHJcblx0XHRhcHAucHJlcGFyZShmdW5jdGlvbigpe1xyXG5cdFx0XHRsb2FkaW5nLmxvYWQoZnVuY3Rpb24gKCl7XHJcblx0XHRcdFx0JG5hdkxpbmtzID0gJG5hdkxpbmtzLmFkZChkb3RTY3JvbGwubGlua3MoKSkuY2xpY2soZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdCRuYXZMaW5rcy5yZW1vdmVDbGFzcygndGFyZ2V0Jyk7XHJcblx0XHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCd0YXJnZXQnKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRtZS50b3BOYXYgPSBuZXcgVG9wTmF2KCk7XHJcblx0XHRcdFx0bmV3IE1lbnVUb2dnbGUoKTtcclxuXHRcdFx0XHRzY3JvbGxpbmcgPSBuZXcgU2Nyb2xsaW5nKG1lKTtcclxuXHRcdFx0XHR3aWRnZXRzKCQoJ2JvZHknKSk7XHJcblx0XHRcdFx0bmV3IEdhbGxlcnkob25Cb2R5SGVpZ2h0UmVzaXplLCB3aWRnZXRzLCB1bndpZGdldHMpO1xyXG5cdFx0XHRcdHZhciB3aW5kb3dXID0gJHdpbmRvdy53aWR0aCgpO1xyXG5cdFx0XHRcdHZhciB3aW5kb3dIID0gJHdpbmRvdy5oZWlnaHQoKTtcclxuXHRcdFx0XHQkd2luZG93LnJlc2l6ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dmFyIG5ld1dpbmRvd1cgPSAkd2luZG93LndpZHRoKCk7XHJcblx0XHRcdFx0XHR2YXIgbmV3V2luZG93SCA9ICR3aW5kb3cuaGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRpZihuZXdXaW5kb3dXIT09d2luZG93VyB8fCBuZXdXaW5kb3dIIT09d2luZG93SCl7IC8vSUUgOCBmaXhcclxuXHRcdFx0XHRcdFx0d2luZG93VyA9IG5ld1dpbmRvd1c7XHJcblx0XHRcdFx0XHRcdHdpbmRvd0ggPSBuZXdXaW5kb3dIO1xyXG5cdFx0XHRcdFx0XHRmbHVpZC5zZXR1cCgkKCdib2R5JykpO1xyXG5cdFx0XHRcdFx0XHRvbkJvZHlIZWlnaHRSZXNpemUoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRhcHAuc2V0dXAoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHZhciBmaW5pc2ggPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRidWlsZFNpemVzKCk7XHJcblx0XHRcdFx0XHRcdGNhbGNOYXZpZ2F0aW9uTGlua1RyaWdnZXJzKCk7XHJcblx0XHRcdFx0XHRcdHRpY2tlci5wYWdlSXNSZWFkeSA9IHRydWU7XHJcblx0XHRcdFx0XHRcdCRuYXZMaW5rcy5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0aWYodGhpcy5ocmVmPT1sb2NhdGlvbil7XHJcblx0XHRcdFx0XHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHQkKCcuYmlndGV4dCcpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0XHQkKHRoaXMpLmJpZ3RleHQoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdGFwcC51bmdhdGVkKCk7XHJcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0XHRsb2FkaW5nLnVuZ2F0ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdG5hdmlnYXRlKHdpbmRvdy5sb2NhdGlvbi5ocmVmLCBoYXNoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0dmFyIHRlc3QgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHR2YXIgJGV4Y2wgPSAkKCcubm9uLXByZWxvYWRpbmcsIC5ub24tcHJlbG9hZGluZyBpbWcnKTtcclxuXHRcdFx0XHRcdFx0dmFyICRpbWdzID0gJCgnaW1nJykubm90KCRleGNsKTtcclxuXHRcdFx0XHRcdFx0Zm9yKHZhciBpPTA7IGk8JGltZ3MubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRcdFx0XHRcdGlmKCAoISRpbWdzW2ldLndpZHRoIHx8ICEkaW1nc1tpXS5oZWlnaHQpICYmICghJGltZ3NbaV0ubmF0dXJhbFdpZHRoIHx8ICEkaW1nc1tpXS5uYXR1cmFsSGVpZ2h0KSApe1xyXG5cdFx0XHRcdFx0XHRcdFx0c2V0VGltZW91dCh0ZXN0LCAxMDApO1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRmaW5pc2goKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHRlc3QoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gb25Cb2R5SGVpZ2h0UmVzaXplKCkge1xyXG5cdFx0YnVpbGRTaXplcygpO1xyXG5cdFx0c2Nyb2xsaW5nLnNjcm9sbCh0b29scy53aW5kb3dZT2Zmc2V0KCkpO1xyXG5cdFx0Y2FsY05hdmlnYXRpb25MaW5rVHJpZ2dlcnMoKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gd2lkZ2V0cygkY29udGV4dCl7XHJcblx0XHRuZXcgU2hvd0xpc3QoJGNvbnRleHQsIG1lKTtcclxuXHRcdG5ldyBTbGlkZXJzKCRjb250ZXh0KTtcclxuXHRcdGlmKCFpc01vYmlsZSkgJGNvbnRleHQuZmluZCgnLmhvdmVyLWRpcicpLmVhY2goIGZ1bmN0aW9uKCkgeyAkKHRoaXMpLmhvdmVyZGlyKHtzcGVlZDogMzAwfSk7IH0gKTtcclxuXHRcdCRjb250ZXh0LmZpbmQoXCJhXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG5cdFx0XHRpZigkdGhpcy5kYXRhKCd0b2dnbGUnKSkgcmV0dXJuO1xyXG5cdFx0XHRuYXZpZ2F0ZSh0aGlzLmhyZWYsIHRoaXMuaGFzaCwgZSwgJHRoaXMpXHJcblx0XHR9KTtcclxuXHRcdGZsdWlkLnNldHVwKCRjb250ZXh0KTtcclxuXHRcdG5ldyBNYXAoJGNvbnRleHQpO1xyXG5cdFx0bmV3IENvdW50ZXIoJGNvbnRleHQsIG1lKTtcclxuXHRcdG5ldyBDaGFuZ2VDb2xvcnMoJGNvbnRleHQpO1xyXG5cdFx0bmV3IFNraWxsYmFyKCRjb250ZXh0LCBtZSk7XHJcblx0XHQkY29udGV4dC5maW5kKFwiaW5wdXQsc2VsZWN0LHRleHRhcmVhXCIpLm5vdChcIlt0eXBlPXN1Ym1pdF1cIikuanFCb290c3RyYXBWYWxpZGF0aW9uKCk7XHJcblx0XHRuZXcgQWpheEZvcm0oJGNvbnRleHQpO1xyXG5cdFx0bmV3IENzc0FuaW1hdGlvbigkY29udGV4dCwgbWUpO1xyXG5cdFx0JCgnLndpZGdldC10YWJzIGEnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KClcclxuXHRcdFx0JCh0aGlzKS50YWIoJ3Nob3cnKVxyXG5cdFx0fSk7XHJcblx0XHQkKCcud2lkZ2V0LXRvb2x0aXAnKS50b29sdGlwKCk7XHJcblx0XHQkKCcud2lkZ2V0LXBvcG92ZXInKS5wb3BvdmVyKCk7XHJcblx0XHQkY29udGV4dC5maW5kKCd2aWRlbycpLmVhY2goZnVuY3Rpb24oKXsgLy8gSUUgOSBGaXhcclxuXHRcdFx0aWYoJCh0aGlzKS5hdHRyKCdtdXRlZCcpIT09dW5kZWZpbmVkKXtcclxuXHRcdFx0XHR0aGlzLm11dGVkPXRydWU7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0JGNvbnRleHQuZmluZCgnLm9wZW4tb3ZlcmxheS13aW5kb3cnKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XHJcblx0XHRcdHZhciAkb3ZlcmxheSA9ICQoJHRoaXMuZGF0YSgnb3ZlcmxheS13aW5kb3cnKSk7XHJcblx0XHRcdHZhciBvdmVybGF5V2luZG93ID0gbmV3IE92ZXJsYXlXaW5kb3coJG92ZXJsYXkpO1xyXG5cdFx0XHQkdGhpcy5jbGljayhmdW5jdGlvbihlKXtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0b3ZlcmxheVdpbmRvdy5zaG93KCk7XHJcblx0XHRcdH0pXHJcblx0XHR9KTtcclxuXHRcdGlmKGlzUG9vckJyb3dzZXIpe1xyXG5cdFx0XHQkY29udGV4dC5maW5kKCcudGx0LWxvb3AnKS5yZW1vdmUoKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHQkY29udGV4dC5maW5kKCcudGV4dGlsbGF0ZScpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgJHRsdCA9ICQodGhpcyk7XHJcblx0XHRcdFx0JHRsdC50ZXh0aWxsYXRlKGV2YWwoJygnKyR0bHQuZGF0YSgndGV4dGlsbGF0ZS1vcHRpb25zJykrJyknKSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiB1bndpZGdldHMoJGNvbnRleHQpe1xyXG5cdFx0bmV3IFNsaWRlcnMoJGNvbnRleHQsIHRydWUpO1xyXG5cdFx0JGNvbnRleHQuZmluZCgnLnBsYXllcicpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyIGluZCA9ICQodGhpcykuZGF0YSgncGxheWVyLWluZCcpO1xyXG5cdFx0XHRtZS5wbGF5ZXJzW2luZF0ucGF1c2UoKTtcclxuXHRcdFx0bWUucGxheWVycy5zcGxpY2UoaW5kLCAxKTtcclxuXHRcdH0pXHJcblx0fVxyXG5cdGZ1bmN0aW9uIG5hdmlnYXRlKGhyZWYsIGhhc2gsIGUsICRlbGVtKSB7XHJcblx0XHR2YXIgaHJlZkJIID0gaGFzaCA/IGhyZWYucmVwbGFjZShuZXcgUmVnRXhwKGhhc2grJyQnKSwgJycpIDogaHJlZjtcclxuXHRcdGlmKGxvY2F0aW9uID09PSBocmVmQkggJiYgaGFzaCAmJiBoYXNoLmluZGV4T2YoXCIhXCIpID09PSAtMSl7XHJcblx0XHRcdHZhciAkY29udGVudCA9ICQoaGFzaCk7XHJcblx0XHRcdGlmIChlKSB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCRjb250ZW50Lmxlbmd0aCA+IDApe1xyXG5cdFx0XHRcdHZhciBvZmZzZXQgPSAkY29udGVudC5vZmZzZXQoKS50b3AgLSBtZS50b3BOYXYuc3RhdGUySDtcclxuXHRcdFx0XHR2YXIgdG4gPSAkY29udGVudC5nZXQoMCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRcdGlmKHRuID09PSAnaDEnIHx8IHRuID09PSAnaDInIHx8IHRuID09PSAnaDMnIHx8IHRuID09PSAnaDQnIHx8IHRuID09PSAnaDUnIHx8IHRuID09PSAnaDYnKXtcclxuXHRcdFx0XHRcdG9mZnNldCAtPSAyMDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKG9mZnNldCA8IDApIG9mZnNldCA9IDA7XHJcblx0XHRcdFx0dG9vbHMuc2Nyb2xsVG8ob2Zmc2V0KTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dG9vbHMuc2Nyb2xsVG8oMCk7XHJcblx0XHRcdH1cclxuXHRcdH1lbHNlIGlmKGUgJiYgKGhyZWYgIT09IGxvY2F0aW9uKycjJykpe1xyXG5cdFx0XHRpZighJGVsZW0uYXR0cigndGFyZ2V0Jykpe1xyXG5cdFx0XHRcdHZhciBwYWdlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRtZS50b3BOYXYuc3RhdGUxKCk7XHJcblx0XHRcdFx0XHRsb2FkaW5nLmdhdGUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uID0gaHJlZjtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZigkZWxlbS5oYXNDbGFzcygncGFnZS10cmFuc2l0aW9uJykpe1xyXG5cdFx0XHRcdFx0cGFnZVRyYW5zaXRpb24oKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdCRwYWdlVHJhbnNpdGlvbi5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdHZhciBjb250YWluZXIgPSAkKHRoaXMpLmdldCgwKTtcclxuXHRcdFx0XHRcdFx0aWYoJC5jb250YWlucyhjb250YWluZXIsICRlbGVtWzBdKSl7XHJcblx0XHRcdFx0XHRcdFx0cGFnZVRyYW5zaXRpb24oKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGNhbGNOYXZpZ2F0aW9uTGlua1RyaWdnZXJzKCl7XHJcblx0XHR2YXIgd2ggPSAkd2luZG93LmhlaWdodCgpO1xyXG5cdFx0dmFyIHRyaWdnZXJEZWx0YSA9IHdoLzM7XHJcblx0XHRzZWN0aW9uVHJpZ2dlcnMgPSBbXTtcclxuXHRcdCRzZWN0aW9ucy5lYWNoKGZ1bmN0aW9uKGkpe1xyXG5cdFx0XHR2YXIgJHMgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgaWQgPSAkcy5hdHRyKCdpZCcpO1xyXG5cdFx0XHRpZihpZCl7XHJcblx0XHRcdFx0c2VjdGlvblRyaWdnZXJzLnB1c2goe2hhc2g6ICcjJytpZCwgdHJpZ2dlck9mZnNldDogJHMuZGF0YSgncG9zaXRpb24nKS10cmlnZ2VyRGVsdGF9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHR0cmlnTmF2aWdhdGlvbkxpbmtzKHRvb2xzLndpbmRvd1lPZmZzZXQoKSk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHRyaWdOYXZpZ2F0aW9uTGlua3Mod2luZG93VG9wUG9zKXtcclxuXHRcdHZhciBhY3RpdmVTZWN0aW9uSGFzaDtcclxuXHRcdGZvcih2YXIgaT0wOyBpPHNlY3Rpb25UcmlnZ2Vycy5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdGlmKHNlY3Rpb25UcmlnZ2Vyc1tpXS50cmlnZ2VyT2Zmc2V0PHdpbmRvd1RvcFBvcyl7XHJcblx0XHRcdFx0YWN0aXZlU2VjdGlvbkhhc2ggPSBzZWN0aW9uVHJpZ2dlcnNbaV0uaGFzaDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoYWN0aXZlU2VjdGlvbkhhc2ghPWxhc3RBY3RpdmVTZWN0aW9uSGFzaCl7XHJcblx0XHRcdHZhciBzZWN0aW9uTGluayA9IGxvY2F0aW9uICsgYWN0aXZlU2VjdGlvbkhhc2g7XHJcblx0XHRcdGxhc3RBY3RpdmVTZWN0aW9uSGFzaCA9IGFjdGl2ZVNlY3Rpb25IYXNoO1xyXG5cdFx0XHQkbmF2TGlua3MuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciAkYSA9ICQodGhpcyk7XHJcblx0XHRcdFx0aWYodGhpcy5ocmVmID09PSBzZWN0aW9uTGluayl7XHJcblx0XHRcdFx0XHQkYS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdFx0XHQkYS5yZW1vdmVDbGFzcygndGFyZ2V0Jyk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHQkYS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0YXBwLmNoYW5nZVNlY3Rpb24obWUsIGFjdGl2ZVNlY3Rpb25IYXNoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gYnVpbGRTaXplcygpe1xyXG5cdFx0YXBwLmJ1aWxkU2l6ZXMobWUpO1xyXG5cdFx0bWF4U2Nyb2xsUG9zaXRpb24gPSAkKCdib2R5JykuaGVpZ2h0KCkgLSAkd2luZG93LmhlaWdodCgpO1xyXG5cdFx0Zm9yKHZhciBpPTA7IGk8bWUucGxheWVycy5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdHZhciAkdiA9IG1lLnBsYXllcnNbaV0uJHZpZXc7XHJcblx0XHRcdCR2LmRhdGEoJ3Bvc2l0aW9uJywgJHYub2Zmc2V0KCkudG9wKTtcclxuXHRcdH1cclxuXHR9XHJcblx0dmFyIGFuaW1FbmQgPSBmdW5jdGlvbihlbGVtcywgZW5kLCBtb2Rlcm4sIGNhbGxiYWNrLCB0aW1lKXtcclxuXHRcdHZhciBhZGRpdGlvblRpbWUgPSAxMDA7XHJcblx0XHR2YXIgZGVmYXVsdFRpbWUgPSAxMDAwO1xyXG5cdFx0cmV0dXJuIGVsZW1zLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBlbGVtID0gdGhpcztcclxuXHRcdFx0aWYgKG1vZGVybiAmJiAhaXNBbmRyb2lkNDNtaW51cykge1xyXG5cdFx0XHRcdHZhciBkb25lID0gZmFsc2U7XHJcblx0XHRcdFx0JChlbGVtKS5iaW5kKGVuZCwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRkb25lID0gdHJ1ZTtcclxuXHRcdFx0XHRcdCQoZWxlbSkudW5iaW5kKGVuZCk7XHJcblx0XHRcdFx0XHRyZXR1cm4gY2FsbGJhY2suY2FsbChlbGVtKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRpZih0aW1lID49IDAgfHwgdGltZSA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRcdHZhciB3VGltZSA9IHRpbWUgPT09IHVuZGVmaW5lZCA/IDEwMDAgOiBkZWZhdWx0VGltZSArIGFkZGl0aW9uVGltZTtcclxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0aWYoIWRvbmUpe1xyXG5cdFx0XHRcdFx0XHRcdCQoZWxlbSkudW5iaW5kKGVuZCk7XHJcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChlbGVtKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSwgd1RpbWUpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRjYWxsYmFjay5jYWxsKGVsZW0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblx0JC5mbi5hbmltYXRpb25FbmQgPSBmdW5jdGlvbihjYWxsYmFjaywgdGltZSkge1xyXG5cdFx0cmV0dXJuIGFuaW1FbmQodGhpcywgdG9vbHMuYW5pbWF0aW9uRW5kLCBNb2Rlcm5penIuY3NzYW5pbWF0aW9ucywgY2FsbGJhY2ssIHRpbWUpO1xyXG5cdH07XHJcblx0JC5mbi50cmFuc2l0aW9uRW5kID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRpbWUpIHtcclxuXHRcdHJldHVybiBhbmltRW5kKHRoaXMsIHRvb2xzLnRyYW5zaXRpb25FbmQsIE1vZGVybml6ci5jc3N0cmFuc2l0aW9ucywgY2FsbGJhY2ssIHRpbWUpO1xyXG5cdH07XHJcblx0JC5mbi5zdG9wVHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5jc3Moe1xyXG5cdFx0XHQnLXdlYmtpdC10cmFuc2l0aW9uJzogJ25vbmUnLFxyXG5cdFx0XHQnLW1vei10cmFuc2l0aW9uJzogJ25vbmUnLFxyXG5cdFx0XHQnLW1zLXRyYW5zaXRpb24nOiAnbm9uZScsXHJcblx0XHRcdCctby10cmFuc2l0aW9uJzogJ25vbmUnLFxyXG5cdFx0XHQndHJhbnNpdGlvbic6ICAnbm9uZSdcclxuXHRcdH0pO1xyXG5cdH1cclxuXHQkLmZuLmNsZWFuVHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5jc3Moe1xyXG5cdFx0XHQnLXdlYmtpdC10cmFuc2l0aW9uJzogJycsXHJcblx0XHRcdCctbW96LXRyYW5zaXRpb24nOiAnJyxcclxuXHRcdFx0Jy1tcy10cmFuc2l0aW9uJzogJycsXHJcblx0XHRcdCctby10cmFuc2l0aW9uJzogJycsXHJcblx0XHRcdCd0cmFuc2l0aW9uJzogICcnXHJcblx0XHR9KTtcclxuXHR9XHJcblx0JC5mbi5ub25UcmFuc2l0aW9uID0gIGZ1bmN0aW9uKGNzcykge1xyXG5cdFx0cmV0dXJuIHRoaXMuc3RvcFRyYW5zaXRpb24oKS5jc3MoY3NzKS5jbGVhblRyYW5zaXRpb24oKTtcclxuXHR9O1xyXG5cdCQuZm4udHJhbnNmb3JtID0gIGZ1bmN0aW9uKHN0ciwgb3JpZ2luKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jc3ModG9vbHMudHJhbnNmb3JtQ3NzKHN0ciwgb3JpZ2luKSk7XHJcblx0fTtcclxuXHQkKCd2aWRlbycpLmVhY2goZnVuY3Rpb24oKXsgLy8gSUUgOSBGaXhcclxuXHRcdGlmKCQodGhpcykuYXR0cignbXV0ZWQnKSE9PXVuZGVmaW5lZCl7XHJcblx0XHRcdHRoaXMubXV0ZWQ9dHJ1ZTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRuZXcgQ3VzdG9taXplKG1lKTtcclxufSkoKTt9KTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IChmdW5jdGlvbigpe1xyXG5cdHZhciBtZSA9IHRoaXM7XHJcblx0dmFyIHNjcmlwdCA9IHJlcXVpcmUoJy4uL3NjcmlwdC5qcycpO1xyXG5cdHZhciBpc0FuZHJvaWRCcm93c2VyNF8zbWludXMgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ2FuZHJvaWQtYnJvd3Nlci00XzNtaW51cycpO1xyXG5cdHRoaXMuYW5pbWF0aW9uRW5kID0gJ2FuaW1hdGlvbmVuZCB3ZWJraXRBbmltYXRpb25FbmQgb0FuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCc7XHJcblx0dGhpcy50cmFuc2l0aW9uRW5kID0gJ3RyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCc7XHJcblx0dGhpcy50cmFuc2l0aW9uID0gWyctd2Via2l0LXRyYW5zaXRpb24nLCAnLW1vei10cmFuc2l0aW9uJywgJy1tcy10cmFuc2l0aW9uJywgJy1vLXRyYW5zaXRpb24nLCAndHJhbnNpdGlvbiddO1xyXG5cdHRoaXMudHJhbnNmb3JtID0gW1wiLXdlYmtpdC10cmFuc2Zvcm1cIiwgXCItbW96LXRyYW5zZm9ybVwiLCBcIi1tcy10cmFuc2Zvcm1cIiwgXCItby10cmFuc2Zvcm1cIiwgXCJ0cmFuc2Zvcm1cIl07XHJcblx0dGhpcy5wcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleXMsIHZhbHVlLCBvYmope1xyXG5cdFx0dmFyIHJlcyA9IG9iaiA/IG9iaiA6IHt9O1xyXG5cdFx0Zm9yKHZhciBpPTA7IGk8a2V5cy5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdHJlc1trZXlzW2ldXT12YWx1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG5cdHRoaXMud2luZG93WU9mZnNldCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gd2luZG93LnBhZ2VZT2Zmc2V0ICE9IG51bGwgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiAoZG9jdW1lbnQuY29tcGF0TW9kZSA9PT0gXCJDU1MxQ29tcGF0XCIgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDogZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApO1xyXG5cdH1cclxuXHR0aGlzLmdldFVybFBhcmFtZXRlciA9IGZ1bmN0aW9uKHNQYXJhbSl7XHJcblx0XHR2YXIgc1BhZ2VVUkwgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKTtcclxuXHRcdHZhciBzVVJMVmFyaWFibGVzID0gc1BhZ2VVUkwuc3BsaXQoJyYnKTtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc1VSTFZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR2YXIgc1BhcmFtZXRlck5hbWUgPSBzVVJMVmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XHJcblx0XHRcdGlmIChzUGFyYW1ldGVyTmFtZVswXSA9PSBzUGFyYW0pIHtcclxuXHRcdFx0XHRyZXR1cm4gZGVjb2RlVVJJKHNQYXJhbWV0ZXJOYW1lWzFdKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLnNlbGVjdFRleHRhcmVhID0gZnVuY3Rpb24oJGVsKXtcclxuXHRcdCRlbC5mb2N1cyhmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcclxuXHRcdFx0JHRoaXMuc2VsZWN0KCk7XHJcblx0XHRcdC8vIFdvcmsgYXJvdW5kIENocm9tZSdzIGxpdHRsZSBwcm9ibGVtXHJcblx0XHRcdCR0aGlzLm1vdXNldXAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Ly8gUHJldmVudCBmdXJ0aGVyIG1vdXNldXAgaW50ZXJ2ZW50aW9uXHJcblx0XHRcdFx0JHRoaXMudW5iaW5kKFwibW91c2V1cFwiKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHZhciB0aW1lcjtcclxuXHR0aGlzLnRpbWUgPSBmdW5jdGlvbihsYWJlbCl7XHJcblx0XHRpZighdGltZXIpe1xyXG5cdFx0XHR0aW1lciA9IERhdGUubm93KCk7XHJcblx0XHRcdGNvbnNvbGUubG9nKCc9PT09IFRpbWVyIHN0YXJ0ZWQnKyhsYWJlbCA/ICcgfCAnK2xhYmVsIDogJycpKVxyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHZhciB0ID0gRGF0ZS5ub3coKTtcclxuXHRcdFx0Y29uc29sZS5sb2coJz09PT0gJysodC10aW1lcikrJyBtcycrKGxhYmVsID8gJyB8ICcrbGFiZWwgOiAnJykpO1xyXG5cdFx0XHR0aW1lciA9IHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuc2Nyb2xsVG8gPSBmdW5jdGlvbiAoeSwgY2FsbGJhY2ssIHRpbWUpIHtcclxuXHRcdGlmKHRpbWUgPT09IHVuZGVmaW5lZCkgdGltZSA9IDEyMDA7XHJcblx0XHRuZXcgVFdFRU4uVHdlZW4oe3k6IG1lLndpbmRvd1lPZmZzZXQoKX0pXHJcblx0XHRcdC50byh7eTogTWF0aC5yb3VuZCh5KX0sIHRpbWUpXHJcblx0XHRcdC5vblVwZGF0ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdC8vJHcuc2Nyb2xsVG9wKHRoaXMueSk7XHJcblx0XHRcdFx0d2luZG93LnNjcm9sbFRvKDAsIHRoaXMueSk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5lYXNpbmcoVFdFRU4uRWFzaW5nLlF1YWRyYXRpYy5Jbk91dClcclxuXHRcdFx0Lm9uQ29tcGxldGUoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGlmKGNhbGxiYWNrKXtcclxuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhcnQoKTtcclxuXHR9XHJcblx0dGhpcy5hbmRyb2lkU3R5bGVzRml4ID0gZnVuY3Rpb24oJHEpe1xyXG5cdFx0aWYoaXNBbmRyb2lkQnJvd3NlcjRfM21pbnVzKXtcclxuXHRcdFx0JHEuaGlkZSgpO1xyXG5cdFx0XHQkcS5nZXQoMCkub2Zmc2V0SGVpZ2h0O1xyXG5cdFx0XHQkcS5zaG93KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMudHJhbnNmb3JtQ3NzID0gZnVuY3Rpb24oc3RyLCBvcmlnaW4pe1xyXG5cdFx0dmFyIHJlcyA9IHtcclxuXHRcdFx0Jy13ZWJraXQtdHJhbnNmb3JtJzogc3RyLFxyXG5cdFx0XHQnLW1vei10cmFuc2Zvcm0nOiBzdHIsXHJcblx0XHRcdCctbXMtdHJhbnNmb3JtJzogc3RyLFxyXG5cdFx0XHQnLW8tdHJhbnNmb3JtJzogc3RyLFxyXG5cdFx0XHQndHJhbnNmb3JtJzogIHN0clxyXG5cdFx0fTtcclxuXHRcdGlmKG9yaWdpbil7XHJcblx0XHRcdHJlc1snLXdlYmtpdC10cmFuc2Zvcm0tb3JpZ2luJ10gPSBvcmlnaW47XHJcblx0XHRcdHJlc1snLW1vei10cmFuc2Zvcm0tb3JpZ2luJ10gPSBvcmlnaW47XHJcblx0XHRcdHJlc1snLW1zLXRyYW5zZm9ybS1vcmlnaW4nXSA9IG9yaWdpbjtcclxuXHRcdFx0cmVzWyctby10cmFuc2Zvcm0tb3JpZ2luJ10gPSBvcmlnaW47XHJcblx0XHRcdHJlc1sndHJhbnNmb3JtLW9yaWdpbiddID0gb3JpZ2luO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlcztcclxuXHR9XHJcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkY29udGV4dCkge1xuXHR2YXIgbG9hZGluZyA9IHJlcXVpcmUoJy4vbG9hZGluZy5qcycpO1xuXHR2YXIgJGdhdGVMb2FkZXIgPSAkKCcuZ2F0ZSAubG9hZGVyJyk7XG5cdCRjb250ZXh0LmZpbmQoJy5hamF4LWZvcm0nKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkZnJtID0gJCh0aGlzKTtcblx0XHQkZnJtLnN1Ym1pdChmdW5jdGlvbihlKSB7XG5cdFx0XHRpZigkZnJtLmZpbmQoJy5oZWxwLWJsb2NrIHVsJykubGVuZ3RoIDwgMSl7XG5cdFx0XHRcdCRnYXRlTG9hZGVyLmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdGxvYWRpbmcuZ2F0ZShmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgbWVzc2FnZSA9IGZ1bmN0aW9uKG1zZykge1xuXHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImFqYXgtZm9ybS1hbGVydCBhbGVydCBoZWFkaW5nIGZhZGUgaW4gdGV4dC1jZW50ZXJcIj5cdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPsOXPC9idXR0b24+ICcgKyBtc2cgKyAnPC9kaXY+Jylcblx0XHRcdFx0XHRcdFx0XHQuYWRkQ2xhc3MoJGZybS5kYXRhKCdtZXNzYWdlLWNsYXNzJykpLmFwcGVuZFRvKCdib2R5Jyk7XG5cdFx0XHRcdFx0XHRsb2FkaW5nLnVuZ2F0ZSgpO1xuXHRcdFx0XHRcdFx0JGdhdGVMb2FkZXIucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdFx0XHR0eXBlOiAkZnJtLmF0dHIoJ21ldGhvZCcpLFxuXHRcdFx0XHRcdFx0dXJsOiAkZnJtLmF0dHIoJ2FjdGlvbicpLFxuXHRcdFx0XHRcdFx0ZGF0YTogJGZybS5zZXJpYWxpemUoKSxcblx0XHRcdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0XHRcdFx0JGZybVswXS5yZXNldCgpO1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlKGRhdGEpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0cikge1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlKCdFcnJvcjogJyArIHhoci5yZXNwb25zZUNvZGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkY29udGV4dCl7XHJcblx0dmFyIHRoZW1lcyA9IHJlcXVpcmUoJy4uL2FwcC90aGVtZXMuanMnKTtcclxuXHQkY29udGV4dC5maW5kKCcuY2hhbmdlLWNvbG9ycycpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdHZhciAkZ3JvdXAgPSAkKHRoaXMpO1xyXG5cdFx0dmFyICR0YXJnZXQgPSAkKCRncm91cC5kYXRhKCd0YXJnZXQnKSk7XHJcblx0XHR2YXIgJGxpbmtzID0gJGdyb3VwLmZpbmQoJ2EnKTtcclxuXHRcdHZhciBjdXJyZW50Q29sb3JzO1xyXG5cdFx0Zm9yKHZhciBpPTA7IGk8dGhlbWVzLmNvbG9yczsgaSsrKXtcclxuXHRcdFx0dmFyIGNvbG9ycyA9ICdjb2xvcnMtJytTdHJpbmcuZnJvbUNoYXJDb2RlKDY1K2kpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdGlmKCR0YXJnZXQuaGFzQ2xhc3MoY29sb3JzKSl7XHJcblx0XHRcdFx0Y3VycmVudENvbG9ycyA9IGNvbG9ycztcclxuXHRcdFx0XHQkbGlua3MuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dmFyICRlbCA9ICQodGhpcyk7XHJcblx0XHRcdFx0XHRpZigkZWwuZGF0YSgnY29sb3JzJykgPT09IGN1cnJlbnRDb2xvcnMpe1xyXG5cdFx0XHRcdFx0XHQkZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdCRsaW5rcy5jbGljayhmdW5jdGlvbihlKXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR2YXIgJGxpbmsgPSAkKHRoaXMpO1xyXG5cdFx0XHQkdGFyZ2V0LnJlbW92ZUNsYXNzKGN1cnJlbnRDb2xvcnMpO1xyXG5cdFx0XHRjdXJyZW50Q29sb3JzID0gJGxpbmsuZGF0YSgnY29sb3JzJyk7XHJcblx0XHRcdCR0YXJnZXQuYWRkQ2xhc3MoY3VycmVudENvbG9ycyk7XHJcblx0XHRcdCRsaW5rcy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdCRsaW5rLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59OyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkY29udGV4dCwgc2NyaXB0KXtcclxuXHR2YXIgaXNQb29yQnJvd3NlciA9ICQoJ2h0bWwnKS5oYXNDbGFzcygncG9vci1icm93c2VyJyk7XHJcblx0aWYoaXNQb29yQnJvd3NlcikgcmV0dXJuO1xyXG5cdCRjb250ZXh0LmZpbmQoJy5jb3VudGVyIC5jb3VudCcpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XHJcblx0XHR2YXIgY291bnQgPSBwYXJzZUludCgkdGhpcy50ZXh0KCkpO1xyXG5cdFx0dmFyIGNudCA9IHtuOiAwfVxyXG5cdFx0dmFyIHR3ID0gbmV3IFRXRUVOLlR3ZWVuKGNudClcclxuXHRcdFx0LnRvKHtuOiBjb3VudH0sIDEwMDApXHJcblx0XHRcdC5vblVwZGF0ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdCR0aGlzLnRleHQoTWF0aC5yb3VuZCh0aGlzLm4pKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LmVhc2luZyhUV0VFTi5FYXNpbmcuUXVhcnRpYy5Jbk91dCk7XHJcblx0XHR2YXIgcGF1c2UgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHR0dy5zdG9wKCk7XHJcblx0XHR9XHJcblx0XHR2YXIgcmVzdW1lID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0Y250Lm4gPSAwO1xyXG5cdFx0XHR0dy5zdGFydCgpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHN0YXJ0ID0gcmVzdW1lO1xyXG5cdFx0c2NyaXB0LnBsYXllcnMuYWRkUGxheWVyKCR0aGlzLCBzdGFydCwgcGF1c2UsIHJlc3VtZSk7XHJcblx0fSk7XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyAoZnVuY3Rpb24oKXtcclxuXHR2YXIgaXNNb2JpbGUgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpO1xyXG5cdHZhciAkc2VjID0gJCgnYm9keT5zZWN0aW9uW2lkXScpO1xyXG5cdHZhciAkbG5rcztcclxuXHRpZighaXNNb2JpbGUgJiYgJHNlYy5sZW5ndGg+MSl7XHJcblx0XHR2YXIgJHVsID0gJCgnI2RvdC1zY3JvbGwnKTtcclxuXHRcdCRzZWMuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHQkdWwuYXBwZW5kKCc8bGk+PGEgaHJlZj1cIiMnKyQodGhpcykuYXR0cignaWQnKSsnXCI+PHNwYW4+PC9zcGFuPjwvYT48L2xpPicpO1xyXG5cdFx0fSk7XHJcblx0XHQkbG5rcyA9ICR1bC5maW5kKCdhJyk7XHJcblx0fWVsc2V7XHJcblx0XHQkbG5rcyA9IGpRdWVyeSgpO1xyXG5cdH1cclxuXHR0aGlzLmxpbmtzID0gZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiAkbG5rcztcclxuXHR9XHJcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyAoZnVuY3Rpb24oKXtcclxuXHR0aGlzLnNldHVwID0gZnVuY3Rpb24oJGNvbnRleHQpe1xyXG5cdFx0JGNvbnRleHQuZmluZCgnLmZsdWlkIConKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgJGVsID0gJCh0aGlzKTtcclxuXHRcdFx0dmFyICR3cmFwID0gJGVsLnBhcmVudCgnLmZsdWlkJyk7XHJcblx0XHRcdHZhciBuZXdXaWR0aCA9ICR3cmFwLndpZHRoKCk7XHJcblx0XHRcdHZhciBhciA9ICRlbC5hdHRyKCdkYXRhLWFzcGVjdC1yYXRpbycpO1xyXG5cdFx0XHRpZighYXIpe1xyXG5cdFx0XHRcdGFyID0gdGhpcy5oZWlnaHQgLyB0aGlzLndpZHRoO1xyXG5cdFx0XHRcdCRlbFxyXG5cdFx0XHRcdFx0Ly8galF1ZXJ5IC5kYXRhIGRvZXMgbm90IHdvcmsgb24gb2JqZWN0L2VtYmVkIGVsZW1lbnRzXHJcblx0XHRcdFx0XHQuYXR0cignZGF0YS1hc3BlY3QtcmF0aW8nLCBhcilcclxuXHRcdFx0XHRcdC5yZW1vdmVBdHRyKCdoZWlnaHQnKVxyXG5cdFx0XHRcdFx0LnJlbW92ZUF0dHIoJ3dpZHRoJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIG5ld0hlaWdodCA9IE1hdGgucm91bmQobmV3V2lkdGggKiBhcik7XHJcblx0XHRcdCRlbC53aWR0aChNYXRoLnJvdW5kKG5ld1dpZHRoKSkuaGVpZ2h0KG5ld0hlaWdodCk7XHJcblx0XHRcdCR3cmFwLmhlaWdodChuZXdIZWlnaHQpO1xyXG5cdFx0fSk7XHJcblx0fTtcclxufSkoKTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob25Cb2R5SGVpZ2h0UmVzaXplLCB3aWRnZXRzLCB1bndpZGdldHMpe1xyXG5cdHZhciB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzL3Rvb2xzLmpzJyk7XHJcblx0dmFyIE92ZXJsYXlXaW5kb3cgPSByZXF1aXJlKCcuL292ZXJsYXktd2luZG93LmpzJyk7XHJcblx0dmFyICR0b3BOYXYgPSAkKCcjdG9wLW5hdicpO1xyXG5cdCQoJy5nYWxsZXJ5JykuZWFjaChmdW5jdGlvbihpKXtcclxuXHRcdHZhciAkZ2FsbGVyeSA9ICQodGhpcyk7XHJcblx0XHR2YXIgJG92ZXJsYXkgPSAkKCRnYWxsZXJ5LmRhdGEoJ292ZXJsYXknKSk7XHJcblx0XHR2YXIgb3ZlcmxheVdpbmRvdyA9IG5ldyBPdmVybGF5V2luZG93KCRvdmVybGF5LCB3aWRnZXRzLCB1bndpZGdldHMpO1xyXG5cdFx0dmFyICRvdmVybGF5TmV4dCA9ICRvdmVybGF5LmZpbmQoJy5uZXh0Jyk7XHJcblx0XHR2YXIgJG92ZXJsYXlQcmV2aW9zID0gJG92ZXJsYXkuZmluZCgnLnByZXZpb3MnKTtcclxuXHRcdHZhciAkb3ZlcmxheUNsb3NlID0gJG92ZXJsYXkuZmluZCgnLmNyb3NzJyk7XHJcblx0XHR2YXIgaXNGaWx0ZXIgPSBmYWxzZTtcclxuXHRcdHZhciBkZWZhdWx0R3JvdXAgPSAkZ2FsbGVyeS5kYXRhKCdkZWZhdWx0LWdyb3VwJykgPyAkZ2FsbGVyeS5kYXRhKCdkZWZhdWx0LWdyb3VwJykgOiAnYWxsJztcclxuXHRcdHZhciBpc05vbkZpcnN0TGF5b3V0ID0gZmFsc2U7XHJcblx0XHRpZighZGVmYXVsdEdyb3VwKSBkZWZhdWx0R3JvdXAgPSAnYWxsJztcclxuXHRcdHZhciAkZ3JpZCA9ICRnYWxsZXJ5LmZpbmQoJy5ncmlkJylcclxuXHRcdFx0LnNodWZmbGUoe1xyXG5cdFx0XHRcdGdyb3VwOiBkZWZhdWx0R3JvdXAsXHJcblx0XHRcdFx0c3BlZWQ6IDUwMFxyXG5cdFx0XHR9KVxyXG5cdFx0XHQub24oJ2ZpbHRlci5zaHVmZmxlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aXNGaWx0ZXIgPSB0cnVlO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQub24oJ2xheW91dC5zaHVmZmxlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYoaXNOb25GaXJzdExheW91dCl7XHJcblx0XHRcdFx0XHRvbkJvZHlIZWlnaHRSZXNpemUodHJ1ZSk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRvbkJvZHlIZWlnaHRSZXNpemUoKTtcclxuXHRcdFx0XHRcdGlzTm9uRmlyc3RMYXlvdXQgPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0Lm9uKCdmaWx0ZXJlZC5zaHVmZmxlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYoaXNGaWx0ZXIpe1xyXG5cdFx0XHRcdFx0aXNGaWx0ZXIgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0dmFyICRidG5zID0gJGdhbGxlcnkuZmluZCgnLmZpbHRlciBhJyk7XHJcblx0XHR2YXIgJGl0ZW1WaWV3ID0gJGdhbGxlcnkuZmluZCgnLml0ZW0tdmlldycpO1xyXG5cdFx0dmFyICRhbGwgPSAkZ2FsbGVyeS5maW5kKCcuZmlsdGVyIGFbZGF0YS1ncm91cD1hbGxdJyk7XHJcblx0XHR2YXIgJGl0ZW1zID0gJGdyaWQuZmluZCgnLml0ZW0nKTtcclxuXHRcdHZhciBjdXJyZW50R3JvdXAgPSBkZWZhdWx0R3JvdXA7XHJcblx0XHR2YXIgJGN1cnJlbnRJdGVtO1xyXG5cdFx0JGdhbGxlcnkuZmluZCgnLmZpbHRlciBhW2RhdGEtZ3JvdXA9JytkZWZhdWx0R3JvdXArJ10nKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHQkaXRlbXMuYWRkQ2xhc3MoJ29uJyk7XHJcblx0XHQkb3ZlcmxheUNsb3NlLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHQkY3VycmVudEl0ZW0gPSBmYWxzZTtcclxuXHRcdH0pO1xyXG5cdFx0JGJ0bnMuY2xpY2soZnVuY3Rpb24oZSl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0aWYoaXNGaWx0ZXIpIHJldHVybjtcclxuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcclxuXHRcdFx0dmFyIGlzQWN0aXZlID0gJHRoaXMuaGFzQ2xhc3MoICdhY3RpdmUnICk7XHJcblx0XHRcdHZhclx0Z3JvdXAgPSBpc0FjdGl2ZSA/ICdhbGwnIDogJHRoaXMuZGF0YSgnZ3JvdXAnKTtcclxuXHRcdFx0aWYoY3VycmVudEdyb3VwICE9PSBncm91cCl7XHJcblx0XHRcdFx0Y3VycmVudEdyb3VwID0gZ3JvdXA7XHJcblx0XHRcdFx0JGJ0bnMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0XHRcdGlmKCFpc0FjdGl2ZSl7XHJcblx0XHRcdFx0XHQkdGhpcy5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHQkYWxsLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0JGdyaWQuc2h1ZmZsZSggJ3NodWZmbGUnLCBncm91cCApO1xyXG5cdFx0XHRcdCRpdGVtcy5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgJGkgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdFx0dmFyIGZpbHRlciA9IGV2YWwoJGkuZGF0YSgnZ3JvdXBzJykpO1xyXG5cdFx0XHRcdFx0aWYoIGdyb3VwID09ICdhbGwnIHx8ICQuaW5BcnJheShncm91cCwgZmlsdGVyKSE9LTEgKXtcclxuXHRcdFx0XHRcdFx0JGkuYWRkQ2xhc3MoJ29uJyk7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0JGkucmVtb3ZlQ2xhc3MoJ29uJyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0JGl0ZW1zLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdG9wZW5JdGVtKCQodGhpcykpO1xyXG5cdFx0fSk7XHJcblx0XHRmdW5jdGlvbiBvcGVuSXRlbSgkaXRlbSl7XHJcblx0XHRcdCRjdXJyZW50SXRlbSA9ICRpdGVtO1xyXG5cdFx0XHR2YXIgdXJsID0gJGl0ZW0uY2hpbGRyZW4oJ2EnKVswXS5oYXNoLnJlcGxhY2UoJyMhJywnJyk7XHJcblx0XHRcdG92ZXJsYXlXaW5kb3cuc2hvdyh1cmwgKycgLml0ZW0tY29udGVudCcpO1xyXG5cdFx0fVxyXG5cdFx0JG92ZXJsYXlOZXh0LmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRpZighJGN1cnJlbnRJdGVtKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR2YXIgJGkgPSAkY3VycmVudEl0ZW0ubmV4dEFsbCgnLm9uJykuZmlyc3QoKTtcclxuXHRcdFx0aWYoJGkubGVuZ3RoPDEpe1xyXG5cdFx0XHRcdCRpID0gJGl0ZW1zLmZpbHRlcignLm9uJykuZmlyc3QoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRvcGVuSXRlbSgkaSk7XHJcblx0XHR9KTtcclxuXHRcdCRvdmVybGF5UHJldmlvcy5jbGljayhmdW5jdGlvbihlKXtcclxuXHRcdFx0aWYoISRjdXJyZW50SXRlbSl7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0dmFyICRpID0gJGN1cnJlbnRJdGVtLnByZXZBbGwoJy5vbicpLmZpcnN0KCk7XHJcblx0XHRcdGlmKCRpLmxlbmd0aDwxKXtcclxuXHRcdFx0XHQkaSA9ICRpdGVtcy5maWx0ZXIoJy5vbicpLmxhc3QoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRvcGVuSXRlbSgkaSk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IChmdW5jdGlvbigpe1xyXG5cdHZhciB0b29scyA9IHJlcXVpcmUoJy4uL3Rvb2xzL3Rvb2xzLmpzJyk7XHJcblx0dmFyICRnYXRlID0gJCgnLmdhdGUnKTtcclxuXHR2YXIgJGdhdGVCYXIgPSAkZ2F0ZS5maW5kKCcuZ2F0ZS1iYXInKTtcclxuXHR2YXIgJGdhdGVMb2FkZXIgPSAkZ2F0ZS5maW5kKCcubG9hZGVyJyk7XHJcblx0dmFyIGlzQW5kcm9pZEJyb3dzZXI0XzNtaW51cyA9ICQoJ2h0bWwnKS5oYXNDbGFzcygnYW5kcm9pZC1icm93c2VyLTRfM21pbnVzJyk7XHJcblx0dmFyIG1lID0gdGhpcztcclxuXHR0aGlzLnF1ZXVlID0gW107XHJcblx0dGhpcy5sb2FkID0gZnVuY3Rpb24oY2FsbGJhY2spe1xyXG5cdFx0dmFyIHVybHMgPSBbXTtcclxuXHRcdHZhciAkZXhjbCA9ICQoJy5ub24tcHJlbG9hZGluZywgLm5vbi1wcmVsb2FkaW5nIGltZycpO1xyXG5cdFx0JCgnKjp2aXNpYmxlOm5vdChzY3JpcHQpJykubm90KCRleGNsKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciAkZWwgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgbmFtZSA9ICRlbFswXS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHR2YXIgYkltZyA9ICRlbC5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIpO1xyXG5cdFx0XHR2YXIgc3JjID0gJGVsLmF0dHIoJ3NyYycpO1xyXG5cdFx0XHR2YXIgZnVuYyA9ICRlbC5kYXRhKCdsb2FkaW5nJyk7XHJcblx0XHRcdGlmKGZ1bmMpe1xyXG5cdFx0XHRcdHVybHMucHVzaChmdW5jKTtcclxuXHRcdFx0fWVsc2UgaWYobmFtZSA9PT0gJ2ltZycgJiYgc3JjICYmICQuaW5BcnJheShzcmMsIHVybHMpID09PSAtMSl7XHJcblx0XHRcdFx0dXJscy5wdXNoKHNyYyk7XHJcblx0XHRcdH1lbHNlIGlmIChiSW1nICE9ICdub25lJyl7XHJcblx0XHRcdFx0dmFyIG11cmwgPSBiSW1nLm1hdGNoKC91cmxcXChbJ1wiXT8oW14nXCIpXSopL2kpO1xyXG5cdFx0XHRcdGlmKG11cmwgJiYgbXVybC5sZW5ndGg+MSAmJiAkLmluQXJyYXkobXVybFsxXSwgdXJscykgPT09IC0xKXtcclxuXHRcdFx0XHRcdHVybHMucHVzaChtdXJsWzFdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0dmFyIGxvYWRlZCA9IDA7XHJcblx0XHRpZih1cmxzLmxlbmd0aCA9PT0gMCl7XHJcblx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0JGdhdGVMb2FkZXIuYWRkQ2xhc3MoJ3Nob3cnKTtcclxuXHRcdFx0dmFyIHdhdGVyUGVyYyA9IDA7XHJcblx0XHRcdHZhciBkb25lID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRsb2FkZWQrKztcclxuXHRcdFx0XHR3YXRlclBlcmMgPSBsb2FkZWQvdXJscy5sZW5ndGggKiAxMDA7XHJcblx0XHRcdFx0JGdhdGVCYXIuY3NzKHt3aWR0aDogd2F0ZXJQZXJjKyclJ30pO1xyXG5cdFx0XHRcdC8vJGdhdGVDb3VudC5odG1sKE1hdGguY2VpbCh3YXRlclBlcmMpKTtcclxuXHRcdFx0XHRpZihsb2FkZWQgPT09IHVybHMubGVuZ3RoKXtcclxuXHRcdFx0XHRcdGlmKCRnYXRlLmxlbmd0aDwxKXtcclxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHQkZ2F0ZUxvYWRlci50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0JGdhdGVMb2FkZXIucmVtb3ZlQ2xhc3MoJ2hpZGVkJyk7XHJcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdFx0XHRcdFx0fSwgMjAwKS5hZGRDbGFzcygnaGlkZWQnKS5yZW1vdmVDbGFzcygnc2hvdycpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRmb3IodmFyIGk9MDsgaTx1cmxzLmxlbmd0aDsgaSsrKXtcclxuXHRcdFx0XHRpZih0eXBlb2YodXJsc1tpXSkgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRcdFx0XHR1cmxzW2ldKGRvbmUpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0dmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cdFx0XHRcdFx0JChpbWcpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCl7bWUucXVldWUucHVzaChkb25lKX0pO1xyXG5cdFx0XHRcdFx0aW1nLnNyYyA9IHVybHNbaV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuZ2F0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcclxuXHRcdC8vJGdhdGVDb3VudC5odG1sKCcwJyk7XHJcblx0XHQkZ2F0ZUJhci5jc3Moe3dpZHRoOiAnMCUnfSk7XHJcblx0XHQkZ2F0ZS50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uKCl7XHJcblx0XHRcdGlmKGNhbGxiYWNrKXtcclxuXHRcdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblx0XHR9KS5jc3Moe29wYWNpdHk6IDEsIHZpc2liaWxpdHk6ICd2aXNpYmxlJ30pO1xyXG5cdH1cclxuXHR0aGlzLnVuZ2F0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcclxuXHRcdCRnYXRlLnRyYW5zaXRpb25FbmQoZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYoaXNBbmRyb2lkQnJvd3NlcjRfM21pbnVzKXtcclxuXHRcdFx0XHR0b29scy5hbmRyb2lkU3R5bGVzRml4KCQoJ2JvZHknKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoY2FsbGJhY2spe1xyXG5cdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pLmNzcyh7b3BhY2l0eTogMCwgdmlzaWJpbGl0eTogJ2hpZGRlbid9KTtcclxuXHR9O1xyXG59KSgpOyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkY29udGV4dCl7XHJcblx0dmFyIHRvb2xzID0gcmVxdWlyZSgnLi4vdG9vbHMvdG9vbHMuanMnKTtcclxuXHR2YXIgT3ZlcmxheVdpbmRvdyA9IHJlcXVpcmUoJy4vb3ZlcmxheS13aW5kb3cuanMnKTtcclxuXHRpZih0eXBlb2YoZ29vZ2xlKSA9PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XHJcblx0JGNvbnRleHQuZmluZCgnLm1hcC1vcGVuJykuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0dmFyICRtYXBPcGVuID0gJCh0aGlzKTtcclxuXHRcdHZhciAkb3ZlcmxheSA9ICQoJG1hcE9wZW4uZGF0YSgnbWFwLW92ZXJsYXknKSk7XHJcblx0XHR2YXIgJG1hcENhbnZhcyA9ICRvdmVybGF5LmZpbmQoJy5tYXAtY2FudmFzJyk7XHJcblx0XHR2YXIgbWFwT3B0aW9ucyA9IHtcclxuXHRcdFx0Y2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKCRtYXBDYW52YXMuZGF0YSgnbGF0aXR1ZGUnKSwgJG1hcENhbnZhcy5kYXRhKCdsb25naXR1ZGUnKSksXHJcblx0XHRcdHpvb206ICRtYXBDYW52YXMuZGF0YSgnem9vbScpLFxyXG5cdFx0XHRtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQXHJcblx0XHR9XHJcblx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cdFx0JG1hcENhbnZhcy5maW5kKCcubWFwLW1hcmtlcicpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyICRtYXJrZXIgPSAkKHRoaXMpO1xyXG5cdFx0XHRtYXJrZXJzLnB1c2goe1xyXG5cdFx0XHRcdGxhdGl0dWRlOiAkbWFya2VyLmRhdGEoJ2xhdGl0dWRlJyksXHJcblx0XHRcdFx0bG9uZ2l0dWRlOiAkbWFya2VyLmRhdGEoJ2xvbmdpdHVkZScpLFxyXG5cdFx0XHRcdHRleHQ6ICRtYXJrZXIuZGF0YSgndGV4dCcpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0XHQkbWFwQ2FudmFzLmFkZENsYXNzKCdjbG9zZS1tYXAnKS53cmFwKCc8ZGl2IGNsYXNzPVwibWFwLXZpZXdcIj48L2Rpdj4nKTtcclxuXHRcdHZhciAkbWFwVmlldyA9ICRtYXBDYW52YXMucGFyZW50KCk7XHJcblx0XHR2YXIgb3ZlcmxheVdpbmRvdyA9IG5ldyBPdmVybGF5V2luZG93KCRvdmVybGF5LCBmYWxzZSwgZmFsc2UsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdG5ldyBUV0VFTi5Ud2Vlbih7YXV0b0FscGhhOiAxfSlcclxuXHRcdFx0XHRcdC50byh7YXV0b0FscGhhOiAwfSwgNTAwKVxyXG5cdFx0XHRcdFx0Lm9uVXBkYXRlKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdCRtYXBWaWV3LmNzcyh7b3BhY2l0eTogdGhpcy5hdXRvQWxwaGEsIHZpc2liaWxpdHk6ICh0aGlzLmF1dG9BbHBoYSA+IDAgPyAndmlzaWJsZScgOiAnaGlkZGVuJyl9KTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuZWFzaW5nKFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZSlcclxuXHRcdFx0XHRcdC5zdGFydCgpO1xyXG5cdFx0fSk7XHJcblx0XHR2YXIgaXNJbml0ZWQgPSBmYWxzZTtcclxuXHRcdCRtYXBPcGVuLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdG92ZXJsYXlXaW5kb3cuc2hvdyhmYWxzZSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYgKCFpc0luaXRlZCkge1xyXG5cdFx0XHRcdFx0aXNJbml0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0dmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcENhbnZhc1swXSwgbWFwT3B0aW9ucyk7XHJcblx0XHRcdFx0XHR2YXIgYWRkTGlzdGVuZXIgPSBmdW5jdGlvbihtYXJrZXIsIHRleHQpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGluZm93aW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyh7XHJcblx0XHRcdFx0XHRcdFx0Y29udGVudDogdGV4dFxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCBcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdGluZm93aW5kb3cub3BlbihtYXAsIG1hcmtlcik7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuXHRcdFx0XHRcdFx0XHRtYXA6IG1hcCxcclxuXHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhtYXJrZXJzW2ldLmxhdGl0dWRlLCBtYXJrZXJzW2ldLmxvbmdpdHVkZSlcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdHZhciB0ZXh0ID0gbWFya2Vyc1tpXS50ZXh0O1xyXG5cdFx0XHRcdFx0XHRpZiAodGV4dCkge1xyXG5cdFx0XHRcdFx0XHRcdGFkZExpc3RlbmVyKG1hcmtlciwgdGV4dCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dmFyICRvYyA9ICRvdmVybGF5LmZpbmQoJy5vdmVybGF5LWNvbnRyb2wnKTtcclxuXHRcdFx0XHQkbWFwVmlldy5jc3Moe2hlaWdodDogKCQod2luZG93KS5oZWlnaHQoKSAtICRvYy5oZWlnaHQoKSkgKyAncHgnfSk7XHJcblx0XHRcdFx0bmV3IFRXRUVOLlR3ZWVuKHthdXRvQWxwaGE6IDB9KVxyXG5cdFx0XHRcdFx0LnRvKHthdXRvQWxwaGE6IDF9LCA1MDApXHJcblx0XHRcdFx0XHQub25VcGRhdGUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0JG1hcFZpZXcuY3NzKHtvcGFjaXR5OiB0aGlzLmF1dG9BbHBoYSwgdmlzaWJpbGl0eTogKHRoaXMuYXV0b0FscGhhID4gMCA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKX0pO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5lYXNpbmcoVFdFRU4uRWFzaW5nLkxpbmVhci5Ob25lKVxyXG5cdFx0XHRcdFx0LnN0YXJ0KCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn0iLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cdHZhciAkdG9nZ2xlID0gJCgnLm1lbnUtdG9nZ2xlJyk7XG5cdCR0b2dnbGUuY2xpY2soZnVuY3Rpb24oZSl7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHZhciAkdGcgPSAkKHRoaXMpO1xuXHRcdGlmKCR0Zy5oYXNDbGFzcygnZXh0LW5hdi10b2dnbGUnKSl7XG5cdFx0XHR2YXIgdGFyZ2V0USA9ICR0Zy5kYXRhKCd0YXJnZXQnKTtcblx0XHRcdHZhciAkZXh0TmF2ID0gJCh0YXJnZXRRKTtcblx0XHRcdHZhciAkY2xpY2tFbHMgPSAkKHRhcmdldFErJywjdG9wLW5hdiBhOm5vdCgubWVudS10b2dnbGUpLC5wYWdlLWJvcmRlciBhJyk7XG5cdFx0XHR2YXIgY2xpY2tIbmQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGV4dE5hdi5yZW1vdmVDbGFzcygnc2hvdycpO1xuXHRcdFx0XHQkdGcucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdFx0JCgnYm9keScpLnJlbW92ZUNsYXNzKCdleHQtbmF2LXNob3cnKTtcblx0XHRcdFx0JCgnaHRtbCwgYm9keScpLmNzcyh7b3ZlcmZsb3c6ICcnLCBwb3NpdGlvbjogJyd9KTtcblx0XHRcdFx0JGNsaWNrRWxzLnVuYmluZCgnY2xpY2snLCBjbGlja0huZCk7XG5cdFx0XHR9XG5cdFx0XHRpZigkdGcuaGFzQ2xhc3MoJ3Nob3cnKSl7XG5cdFx0XHRcdCRleHROYXYucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdFx0JHRnLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdCQoJ2JvZHknKS5yZW1vdmVDbGFzcygnZXh0LW5hdi1zaG93Jyk7XG5cdFx0XHRcdCRjbGlja0Vscy51bmJpbmQoJ2NsaWNrJywgY2xpY2tIbmQpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdCRleHROYXYuYWRkQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdFx0JHRnLmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdCQoJ2JvZHknKS5hZGRDbGFzcygnZXh0LW5hdi1zaG93Jyk7XG5cdFx0XHRcdCRjbGlja0Vscy5iaW5kKCdjbGljaycsIGNsaWNrSG5kKTtcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdGlmKCR0Zy5oYXNDbGFzcygnc2hvdycpKXtcblx0XHRcdFx0JHRnLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0JHRnLmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkb3ZlcmxheSwgd2lkZ2V0cywgdW53aWRnZXRzLCBoaWRlRnVuYyl7XG5cdHZhciAkb3ZlcmxheUNsb3NlID0gJG92ZXJsYXkuZmluZCgnLmNyb3NzJyk7XG5cdHZhciAkb3ZlcmxheVpvb20gPSAkKCRvdmVybGF5LmRhdGEoJ292ZXJsYXktem9vbScpKTtcblx0dmFyICRvdmVybGF5VmlldyA9ICRvdmVybGF5LmZpbmQoJy5vdmVybGF5LXZpZXcnKTtcblx0dmFyICRvdmVybGF5Q2xvc2UgPSAkb3ZlcmxheS5maW5kKCcuY3Jvc3MnKTtcblx0dmFyIG1lID0gdGhpcztcblx0dGhpcy5zaG93ID0gZnVuY3Rpb24obG9hZCwgY2FsbGJhY2spIHtcblx0XHR2YXIgb3BlbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JG92ZXJsYXlab29tLmFkZENsYXNzKCdvdmVybGF5LXpvb20nKTtcblx0XHRcdCRvdmVybGF5LnRyYW5zaXRpb25FbmQoZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYgKGxvYWQpIHtcblx0XHRcdFx0XHR2YXIgJGxvYWRlciA9ICRvdmVybGF5LmZpbmQoJy5sb2FkZXInKTtcblx0XHRcdFx0XHR2YXIgJGxvYWRlZENvbnRlbnQgPSAkKCc8ZGl2IGNsYXNzPVwibG9hZGVkLWNvbnRlbnRcIj48L2Rpdj4nKTtcblx0XHRcdFx0XHQkbG9hZGVyLmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdFx0JGxvYWRlZENvbnRlbnQuYWRkQ2xhc3MoJ2NvbnRlbnQtY29udGFpbmVyJykuYXBwZW5kVG8oJG92ZXJsYXlWaWV3KTtcblx0XHRcdFx0XHQkbG9hZGVkQ29udGVudC5sb2FkKGxvYWQsIGZ1bmN0aW9uKHhociwgc3RhdHVzVGV4dCwgcmVxdWVzdCkge1xuXHRcdFx0XHRcdFx0aWYgKHN0YXR1c1RleHQgIT09IFwic3VjY2Vzc1wiICYmIHN0YXR1c1RleHQgIT09IFwibm90bW9kaWZpZWRcIikge1xuXHRcdFx0XHRcdFx0XHQkbG9hZGVkQ29udGVudC50ZXh0KHN0YXR1c1RleHQpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR2YXIgJGltYWdlcyA9ICRsb2FkZWRDb250ZW50LmZpbmQoJ2ltZycpO1xuXHRcdFx0XHRcdFx0dmFyIG5pbWFnZXMgPSAkaW1hZ2VzLmxlbmd0aDtcblx0XHRcdFx0XHRcdGlmIChuaW1hZ2VzID4gMCkge1xuXHRcdFx0XHRcdFx0XHQkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmltYWdlcy0tO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChuaW1hZ2VzID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzaG93KCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHNob3coKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGZ1bmN0aW9uIHNob3coKSB7XG5cdFx0XHRcdFx0XHRcdGlmKHdpZGdldHMpe1xuXHRcdFx0XHRcdFx0XHRcdHdpZGdldHMoJGxvYWRlZENvbnRlbnQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCRsb2FkZWRDb250ZW50LmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0XHRcdFx0XHRcdCRsb2FkZXIucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdFx0XHRcdFx0aWYoY2FsbGJhY2spe1xuXHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0aWYoY2FsbGJhY2spe1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pLmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0fTtcblx0XHRpZiAoJG92ZXJsYXkuaGFzQ2xhc3MoJ3Nob3cnKSkge1xuXHRcdFx0bWUuaGlkZShvcGVuKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3BlbigpO1xuXHRcdH1cblx0fVxuXHR0aGlzLmhpZGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdCRvdmVybGF5Wm9vbS5yZW1vdmVDbGFzcygnb3ZlcmxheS16b29tJyk7XG5cdFx0JG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyICRsb2FkZWRDb250ZW50ID0gJG92ZXJsYXkuZmluZCgnLmxvYWRlZC1jb250ZW50Jyk7XG5cdFx0XHRpZigkbG9hZGVkQ29udGVudC5sZW5ndGg+MCl7XG5cdFx0XHRcdGlmKHVud2lkZ2V0cyl7XG5cdFx0XHRcdFx0dW53aWRnZXRzKCRsb2FkZWRDb250ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzdG9wSWZyYW1lQmVmb3JlUmVtb3ZlKCRsb2FkZWRDb250ZW50LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkbG9hZGVkQ29udGVudC5yZW1vdmUoKTtcblx0XHRcdFx0XHRpZihoaWRlRnVuYyl7XG5cdFx0XHRcdFx0XHRoaWRlRnVuYygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoY2FsbGJhY2spIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRpZihoaWRlRnVuYyl7XG5cdFx0XHRcdFx0aGlkZUZ1bmMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoY2FsbGJhY2spIHtcblx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwgNTAwKTtcblx0fVxuXHRmdW5jdGlvbiBzdG9wSWZyYW1lQmVmb3JlUmVtb3ZlKCRjb250ZXh0LCBjYWxsYmFjaykge1xuXHRcdHZhciBpc0RvU3RvcCA9ICQoJ2h0bWwnKS5oYXNDbGFzcygnaWU5Jylcblx0XHRcdFx0fHwgJCgnaHRtbCcpLmhhc0NsYXNzKCdpZTEwJyk7XG5cdFx0aWYgKGlzRG9TdG9wKSB7XG5cdFx0XHQkY29udGV4dC5maW5kKCdpZnJhbWUnKS5hdHRyKCdzcmMnLCAnJyk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0fSwgMzAwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cdH1cblx0JG92ZXJsYXlDbG9zZS5jbGljayhmdW5jdGlvbihlKXtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0bWUuaGlkZSgpO1xuXHR9KTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7IHZhciAkID0galF1ZXJ5O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRjb250ZXh0LCBzY3JpcHQpe1xyXG5cdCRjb250ZXh0LmZpbmQoJy5zaG93LWxpc3QnKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHQkKHRoaXMpLndyYXBJbm5lcignPGRpdiBjbGFzcz1cIndyYXBwZXJcIj48L2Rpdj4nKS50ZXh0aWxsYXRlKHtcclxuXHRcdFx0bG9vcDp0cnVlLFxyXG5cdFx0XHRpbjp7ZWZmZWN0OidmYWRlSW5SaWdodCcsIHJldmVyc2U6dHJ1ZX0sXHJcblx0XHRcdG91dDp7ZWZmZWN0OidmYWRlT3V0TGVmdCcsIHNlcXVlbmNlOnRydWV9LFxyXG5cdFx0XHRzZWxlY3RvcjonLndyYXBwZXInXHJcblx0XHR9KTtcclxuXHR9KTtcclxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGNvbnRleHQsIHNjcmlwdCl7XHJcblx0dmFyIGlzUG9vckJyb3dzZXIgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ3Bvb3ItYnJvd3NlcicpO1xyXG5cdCRjb250ZXh0LmZpbmQoJy5za2lsbGJhcicpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdHZhciAkdGhpcyA9ICQodGhpcylcclxuXHRcdHZhciAkYmFyID0gJHRoaXMuZmluZCgnLnNraWxsYmFyLWJhcicpO1xyXG5cdFx0dmFyIHBlcmMgPSAgcGFyc2VJbnQoJHRoaXMuYXR0cignZGF0YS1wZXJjZW50JykucmVwbGFjZSgnJScsJycpKTtcclxuXHRcdGlmKGlzUG9vckJyb3dzZXIpe1xyXG5cdFx0XHQkYmFyLmNzcyh7d2lkdGg6IHBlcmMrJyUnfSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dmFyIHcgPSB7d2lkdGg6IDB9XHJcblx0XHRcdHZhciB0dyA9IG5ldyBUV0VFTi5Ud2Vlbih3KVxyXG5cdFx0XHRcdC50byh7d2lkdGg6IHBlcmN9LCAxMDAwKVxyXG5cdFx0XHRcdC5vblVwZGF0ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0JGJhci5jc3Moe3dpZHRoOiB0aGlzLndpZHRoKyclJ30pO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LmVhc2luZyhUV0VFTi5FYXNpbmcuUXVhcnRpYy5PdXQpO1xyXG5cdFx0XHR2YXIgcGF1c2UgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHR3LnN0b3AoKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0dmFyIHJlc3VtZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0dy53aWR0aCA9IDA7XHJcblx0XHRcdFx0dHcuc3RhcnQoKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0dmFyIHN0YXJ0ID0gcmVzdW1lO1xyXG5cdFx0XHRzY3JpcHQucGxheWVycy5hZGRQbGF5ZXIoJHRoaXMsIHN0YXJ0LCBwYXVzZSwgcmVzdW1lKTtcclxuXHRcdH1cclxuXHR9KTtcclxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGNvbnRleHQsIGlzUmVtb3ZlZCl7XHJcblx0aWYoaXNSZW1vdmVkKXtcclxuXHRcdCRjb250ZXh0LmZpbmQoXCIuY2Fyb3VzZWwsIC5zbGlkZXJcIikuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHQkKHRoaXMpLnNsaWNrKCd1bnNsaWNrJyk7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0dmFyIHRvb2xzID0gcmVxdWlyZSgnLi4vdG9vbHMvdG9vbHMuanMnKTtcclxuXHQkY29udGV4dC5maW5kKFwiLnNsaWRlclwiKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpXHJcblx0XHQkdGhpcy5zbGljayh7XHJcblx0XHRcdGF1dG9wbGF5OiB0cnVlLFxyXG5cdFx0XHRkb3RzOiB0cnVlXHJcblx0XHR9KTtcclxuXHR9KTtcclxuXHQkY29udGV4dC5maW5kKFwiLmNhcm91c2VsXCIpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdHZhciAkdGhpcyA9ICQodGhpcylcclxuXHRcdCR0aGlzLnNsaWNrKHtcclxuXHRcdFx0YXV0b3BsYXk6IGZhbHNlLFxyXG5cdFx0XHRkb3RzOiB0cnVlLFxyXG5cdFx0XHRpbmZpbml0ZTogdHJ1ZSxcclxuXHRcdFx0c2xpZGVzVG9TaG93OiAzLFxyXG5cdFx0XHRzbGlkZXNUb1Njcm9sbDogMyxcclxuXHRcdFx0cmVzcG9uc2l2ZTogW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGJyZWFrcG9pbnQ6IDEwMDAsXHJcblx0XHRcdFx0XHRzZXR0aW5nczoge1xyXG5cdFx0XHRcdFx0XHRkb3RzOiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Nob3c6IDIsXHJcblx0XHRcdFx0XHRcdHNsaWRlc1RvU2Nyb2xsOiAyXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRicmVha3BvaW50OiA0ODAsXHJcblx0XHRcdFx0XHRzZXR0aW5nczoge1xyXG5cdFx0XHRcdFx0XHRkb3RzOiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Nob3c6IDEsXHJcblx0XHRcdFx0XHRcdHNsaWRlc1RvU2Nyb2xsOiAxXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdXHJcblx0XHR9KTtcclxuXHR9KTtcclxufSIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblx0dmFyIHRvb2xzID0gcmVxdWlyZSgnLi4vdG9vbHMvdG9vbHMuanMnKTtcblx0dmFyICR0b3BOYXYgPSAgJCgnI3RvcC1uYXYnKTtcblx0dmFyICRib2R5ID0gJCgnYm9keScpO1xuXHR2YXIgaXNUb3BOYXYgPSAkdG9wTmF2Lmxlbmd0aCA+IDA7XG5cdHZhciAkdG9wTWVudU5hdiA9ICAkdG9wTmF2LmZpbmQoJy5uYXZiYXItY29sbGFwc2UnKTtcblx0dmFyIHVwcGVySCA9IDIwO1xuXHR2YXIgYmlnVG9wTmF2ID0gaXNUb3BOYXYgPyA4OSA6IDA7XG5cdHZhciBzbWFsbFRvcE5hdiA9IGlzVG9wTmF2ID8gNDkgOiAwO1xuXHR2YXIgdGhlbWVzID0gcmVxdWlyZSgnLi4vYXBwL3RoZW1lcy5qcycpO1xuXHR2YXIgdG9wTmF2U3RhdGUxVG9wID0gKGZ1bmN0aW9uKCl7XG5cdFx0aWYoaXNUb3BOYXYpe1xuXHRcdFx0cmV0dXJuIHVwcGVySDtcblx0XHR9ZWxzZXtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblx0fSkoKTtcblx0dmFyIGlzVG9wTmF2U3RhdGUxID0gZmFsc2U7XG5cdHZhciBpc1RvcE5hdlN0YXRlMiA9IGZhbHNlO1xuXHR2YXIgbWUgPSB0aGlzO1xuXHR2YXIgc3RhdGUxQ29sb3JzID0gJHRvcE5hdi5kYXRhKCdzdGF0ZTEtY29sb3JzJyk7XG5cdHZhciBzdGF0ZTJDb2xvcnMgPSAkdG9wTmF2LmRhdGEoJ3N0YXRlMi1jb2xvcnMnKTtcblx0dGhpcy5zdGF0ZTFIID0gYmlnVG9wTmF2O1xuXHR0aGlzLnN0YXRlMkggPSBzbWFsbFRvcE5hdjtcblx0dGhpcy5zdGF0ZTFUb3AgPSBmdW5jdGlvbigpeyByZXR1cm4gdG9wTmF2U3RhdGUxVG9wOyB9O1xuXHR0aGlzLnN0YXRlMSA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYoaXNUb3BOYXYgJiYgIWlzVG9wTmF2U3RhdGUxKXtcblx0XHRcdCRib2R5LnJlbW92ZUNsYXNzKCdzdGF0ZTInKS5hZGRDbGFzcygnc3RhdGUxJyk7XG5cdFx0XHRpc1RvcE5hdlN0YXRlMSA9IHRydWU7XG5cdFx0XHRpc1RvcE5hdlN0YXRlMiA9IGZhbHNlO1xuXHRcdFx0dG9vbHMuYW5kcm9pZFN0eWxlc0ZpeCgkdG9wTmF2KTtcblx0XHR9XG5cdH07XG5cdHRoaXMuc3RhdGUyID0gZnVuY3Rpb24oKXtcblx0XHRpZihpc1RvcE5hdiAmJiAhaXNUb3BOYXZTdGF0ZTIpe1xuXHRcdFx0JGJvZHkucmVtb3ZlQ2xhc3MoJ3N0YXRlMScpLmFkZENsYXNzKCdzdGF0ZTInKTtcblx0XHRcdGlzVG9wTmF2U3RhdGUxID0gZmFsc2U7XG5cdFx0XHRpc1RvcE5hdlN0YXRlMiA9IHRydWU7XG5cdFx0XHR0b29scy5hbmRyb2lkU3R5bGVzRml4KCR0b3BOYXYpO1xuXHRcdH1cblx0fTtcblx0dGhpcy4kbWVudSA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuICR0b3BNZW51TmF2O1xuXHR9O1xuXHRpZihpc1RvcE5hdil7XG5cdFx0bWUuc3RhdGUxKCk7XG5cdFx0JHRvcE1lbnVOYXYuZmluZCgnYTpub3QoLmRyb3Bkb3duLXRvZ2dsZSknKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdFx0JHRvcE5hdi5maW5kKCcubmF2YmFyLWNvbGxhcHNlLmluJykuY29sbGFwc2UoJ2hpZGUnKTtcblx0XHRcdCR0b3BOYXYuZmluZCgnLm1lbnUtdG9nZ2xlLm5hdmJhci10b2dnbGUnKS5yZW1vdmVDbGFzcygnc2hvdycpO1xuXHRcdH0pO1xuXHRcdCQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKXtcblx0XHRcdCR0b3BOYXYuZmluZCgnLm5hdmJhci1jb2xsYXBzZS5pbicpLmNvbGxhcHNlKCdoaWRlJyk7XG5cdFx0XHQkdG9wTmF2LmZpbmQoJy5tZW51LXRvZ2dsZS5uYXZiYXItdG9nZ2xlJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHR9KTtcblx0fVxufTsiLCJcInVzZSBzdHJpY3RcIjsgdmFyICQgPSBqUXVlcnk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgJHZpZGVvQmdzID0gJChcIi52aWRlby1iZ1wiKTtcclxuXHRpZigkdmlkZW9CZ3MubGVuZ3RoIDwxKXtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0dmFyIGlzUGxheVZpZGVvID0gKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgaXNNb2JpbGUgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpO1xyXG5cdFx0dmFyIHY9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcclxuXHRcdHZhciBjYW5NUDQgPSB2LmNhblBsYXlUeXBlID8gdi5jYW5QbGF5VHlwZSgndmlkZW8vbXA0JykgOiBmYWxzZTtcclxuXHRcdHJldHVybiBjYW5NUDQgJiYgIWlzTW9iaWxlO1xyXG5cdH0pKCk7XHJcblx0aWYoICFpc1BsYXlWaWRlbyApe1xyXG5cdFx0JHZpZGVvQmdzLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyICR2aWRlb0JnID0gJCh0aGlzKTtcclxuXHRcdFx0dmFyIGFsdCA9ICR2aWRlb0JnLmRhdGEoJ2FsdGVybmF0aXZlJyk7XHJcblx0XHRcdGlmKGFsdCl7XHJcblx0XHRcdFx0dmFyICRpbWcgPSAkKCc8aW1nIGFsdCBjbGFzcz1cImJnXCIgc3JjPVwiJythbHQrJ1wiLz4nKTtcclxuXHRcdFx0XHQkdmlkZW9CZy5hZnRlcigkaW1nKS5yZW1vdmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdCR2aWRlb0Jncy5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgJGRpdkJnID0gJCh0aGlzKTtcclxuXHRcdCRkaXZCZy5kYXRhKCdsb2FkaW5nJywgZnVuY3Rpb24oZG9uZSl7XHJcblx0XHRcdHZhciAkdmlkZW9CZyA9ICQoJzx2aWRlbyBjbGFzcz1cInZpZGVvLWJnXCI+PC92aWRlbz4nKTtcclxuXHRcdFx0aWYoJGRpdkJnLmRhdGEoJ211dGUnKT09PSd5ZXMnKSAkdmlkZW9CZ1swXS5tdXRlZCA9IHRydWU7XHJcblx0XHRcdHZhciB2b2wgPSAkZGl2QmcuZGF0YSgndm9sdW1lJyk7XHJcblx0XHRcdGlmKHZvbCAhPT0gdW5kZWZpbmVkKSAkdmlkZW9CZ1swXS52b2x1bWU9IHZvbC8xMDA7XHJcblx0XHRcdHZhciBkb0RvbmUgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciB2dyA9ICR2aWRlb0JnLndpZHRoKCk7XHJcblx0XHRcdFx0dmFyIHZoID0gJHZpZGVvQmcuaGVpZ2h0KCk7XHJcblx0XHRcdFx0dmFyIHZyID0gdncvdmg7XHJcblx0XHRcdFx0dmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcblx0XHRcdFx0dmFyIHJlc2l6ZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgd3cgPSAkd2luZG93LndpZHRoKCk7XHJcblx0XHRcdFx0XHR2YXIgd2ggPSAkd2luZG93LmhlaWdodCgpO1xyXG5cdFx0XHRcdFx0dmFyIHdyID0gd3cvd2g7XHJcblx0XHRcdFx0XHR2YXIgdywgaDtcclxuXHRcdFx0XHRcdGlmKHZyID4gd3Ipe1xyXG5cdFx0XHRcdFx0XHRoID0gTWF0aC5jZWlsKHdoKTtcclxuXHRcdFx0XHRcdFx0dyA9IE1hdGguY2VpbChoICogdnIpO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdHcgPSBNYXRoLmNlaWwod3cpO1xyXG5cdFx0XHRcdFx0XHRoID0gTWF0aC5jZWlsKHcgLyB2cik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQkdmlkZW9CZy5jc3Moe1xyXG5cdFx0XHRcdFx0XHR3aWR0aDogIHcrJ3B4JyxcclxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBoKydweCcsXHJcblx0XHRcdFx0XHRcdHRvcDogTWF0aC5yb3VuZCgod2ggLSBoKS8yKSsncHgnLFxyXG5cdFx0XHRcdFx0XHRsZWZ0OiBNYXRoLnJvdW5kKCh3dyAtIHcpLzIpKydweCdcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0JHdpbmRvdy5yZXNpemUocmVzaXplKTtcclxuXHRcdFx0XHRyZXNpemUoKTtcclxuXHRcdFx0XHQkdmlkZW9CZ1swXS5wbGF5KCk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHQkdmlkZW9CZy5vbignZW5kZWQnLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHRoaXMuY3VycmVudFRpbWUgPSAwO1xyXG5cdFx0XHRcdHRoaXMucGxheSgpO1xyXG5cdFx0XHRcdGlmKHRoaXMuZW5kZWQpIHtcclxuXHRcdFx0XHRcdHRoaXMubG9hZCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdHZhciBpc05vdERvbmUgPSB0cnVlO1xyXG5cdFx0XHQkdmlkZW9CZy5vbignY2FucGxheXRocm91Z2gnLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGlmKGlzTm90RG9uZSl7XHJcblx0XHRcdFx0XHRpc05vdERvbmUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdGRvRG9uZSgpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0dGhpcy5wbGF5KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0JHZpZGVvQmdbMF0uc3JjID0gJGRpdkJnLmRhdGEoJ3ZpZGVvJyk7XHJcblx0XHRcdCR2aWRlb0JnWzBdLnByZWxvYWQ9XCJhdXRvXCI7XHJcblx0XHRcdCRkaXZCZy5hZnRlcigkdmlkZW9CZyk7XHJcblx0XHRcdCRkaXZCZy5yZW1vdmUoKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59OyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciAkdmltZW9CZ3MgPSAkKFwiLnZpbWVvLWJnXCIpO1xyXG5cdGlmKCR2aW1lb0Jncy5sZW5ndGggPDEpe1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRpZigkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpKXtcclxuXHRcdCR2aW1lb0Jncy5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciAkdmltZW9CZyA9ICQodGhpcyk7XHJcblx0XHRcdHZhciBhbHQgPSAkdmltZW9CZy5kYXRhKCdhbHRlcm5hdGl2ZScpO1xyXG5cdFx0XHRpZihhbHQpe1xyXG5cdFx0XHRcdHZhciAkaW1nID0gJCgnPGltZyBhbHQgY2xhc3M9XCJiZ1wiIHNyYz1cIicrYWx0KydcIi8+Jyk7XHJcblx0XHRcdFx0JHZpbWVvQmcuYWZ0ZXIoJGltZykucmVtb3ZlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHR2YXIgZG9uZXMgPSBbXTtcclxuXHQkdmltZW9CZ3MuZWFjaChmdW5jdGlvbihpKXtcclxuXHRcdHZhciAkdmltZW9CZyA9ICQodGhpcyk7XHJcblx0XHR2YXIgZWxJZCA9ICR2aW1lb0JnLmF0dHIoJ2lkJyk7XHJcblx0XHRpZighZWxJZCkge1xyXG5cdFx0XHRlbElkID0gJ3ZpbWVvLWJnLScraTtcclxuXHRcdFx0JHZpbWVvQmcuYXR0cignaWQnLCBlbElkKTtcclxuXHRcdH1cclxuXHRcdCR2aW1lb0JnLmRhdGEoJ2xvYWRpbmcnLCBmdW5jdGlvbihkb25lKXtcclxuXHRcdFx0ZG9uZXNbZWxJZF0gPSBkb25lO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcblx0JC5nZXRTY3JpcHQoIFwiaHR0cHM6Ly9mLnZpbWVvY2RuLmNvbS9qcy9mcm9vZ2Fsb29wMi5taW4uanNcIiApXHJcblx0XHQuZG9uZShmdW5jdGlvbiggc2NyaXB0LCB0ZXh0U3RhdHVzICkge1xyXG5cdFx0XHQkdmltZW9CZ3MuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciAkdmltZW9CZ0RpdiA9ICQodGhpcyk7XHJcblx0XHRcdFx0dmFyIGlkID0gJHZpbWVvQmdEaXYuYXR0cignaWQnKTtcclxuXHRcdFx0XHR2YXIgdm9sdW1lID0gKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgciA9ICR2aW1lb0JnRGl2LmRhdGEoJ3ZvbHVtZScpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHIgPT09IHVuZGVmaW5lZCA/IDAgOiByO1xyXG5cdFx0XHRcdH0pKCk7XHJcblx0XHRcdFx0dmFyIHZpZGVvSWQgPSAkdmltZW9CZ0Rpdi5kYXRhKCd2aWRlbycpO1xyXG5cdFx0XHRcdHZhciAkdmltZW9CZyA9ICQoJzxpZnJhbWUgY2xhc3M9XCJ2aW1lby1iZ1wiIHNyYz1cImh0dHBzOi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby8nK3ZpZGVvSWQrJz9hcGk9MSZiYWRnZT0wJmJ5bGluZT0wJnBvcnRyYWl0PTAmdGl0bGU9MCZhdXRvcGF1c2U9MCZwbGF5ZXJfaWQ9JytpZCsnJmxvb3A9MVwiIGZyYW1lYm9yZGVyPVwiMFwiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPicpO1xyXG5cdFx0XHRcdCR2aW1lb0JnRGl2LmFmdGVyKCR2aW1lb0JnKTtcclxuXHRcdFx0XHQkdmltZW9CZ0Rpdi5yZW1vdmUoKTtcclxuXHRcdFx0XHQkdmltZW9CZy5hdHRyKCdpZCcsIGlkKTtcclxuXHRcdFx0XHR2YXIgcGxheWVyID0gJGYoJHZpbWVvQmdbMF0pO1xyXG5cdFx0XHRcdHBsYXllci5hZGRFdmVudCgncmVhZHknLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHZhciByZXNpemUgPSBmdW5jdGlvbih2UmF0aW8pe1xyXG5cdFx0XHRcdFx0XHR2YXIgd2luZG93VyA9ICQod2luZG93KS53aWR0aCgpO1xyXG5cdFx0XHRcdFx0XHR2YXIgd2luZG93SCA9ICQod2luZG93KS5oZWlnaHQoKTtcclxuXHRcdFx0XHRcdFx0dmFyIGlGcmFtZVcgPSAkdmltZW9CZy53aWR0aCgpO1xyXG5cdFx0XHRcdFx0XHR2YXIgaUZyYW1lSCA9ICR2aW1lb0JnLmhlaWdodCgpO1xyXG5cdFx0XHRcdFx0XHR2YXIgaWZSYXRpbyA9IGlGcmFtZVcvaUZyYW1lSDtcclxuXHRcdFx0XHRcdFx0dmFyIHdSYXRpbyA9IHdpbmRvd1cvd2luZG93SDtcclxuXHRcdFx0XHRcdFx0Ly92YXIgdlJhdGlvID0gcmF0aW8gPT09IHVuZGVmaW5lZCA/IGlmUmF0aW8gOiBldmFsKHJhdGlvKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNldFNpemUgPSBmdW5jdGlvbih2dywgdmgpe1xyXG5cdFx0XHRcdFx0XHRcdHZhciBpZncsIGlmaDtcclxuXHRcdFx0XHRcdFx0XHRpZihpZlJhdGlvID4gdlJhdGlvKXtcclxuXHRcdFx0XHRcdFx0XHRcdGlmaCA9IE1hdGguY2VpbCh2aCk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZncgPSBNYXRoLmNlaWwoaWZoICogaWZSYXRpbyk7XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRpZncgPSBNYXRoLmNlaWwodncpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWZoID0gTWF0aC5jZWlsKGlmdyAvIGlmUmF0aW8pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHQkdmltZW9CZy5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6ICBpZncrJ3B4JyxcclxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDogaWZoKydweCcsXHJcblx0XHRcdFx0XHRcdFx0XHR0b3A6IE1hdGgucm91bmQoKHdpbmRvd0ggLSBpZmgpLzIpKydweCcsXHJcblx0XHRcdFx0XHRcdFx0XHRsZWZ0OiBNYXRoLnJvdW5kKCh3aW5kb3dXIC0gaWZ3KS8yKSsncHgnLFxyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmKHdSYXRpbyA+IHZSYXRpbyl7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHZ3ID0gd2luZG93VztcclxuXHRcdFx0XHRcdFx0XHR2YXIgdmggPSB2dy92UmF0aW87XHJcblx0XHRcdFx0XHRcdFx0c2V0U2l6ZSh2dywgdmgpO1xyXG5cdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHR2YXIgdmggPSB3aW5kb3dIO1xyXG5cdFx0XHRcdFx0XHRcdHZhciB2dyA9IHZoICogdlJhdGlvO1xyXG5cdFx0XHRcdFx0XHRcdHNldFNpemUodncsIHZoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgnZmluaXNoJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0cGxheWVyLmFwaSgncGxheScpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR2YXIgaXNOb3REb25lID0gdHJ1ZTtcclxuXHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgncGxheScsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGlmKGlzTm90RG9uZSl7XHJcblx0XHRcdFx0XHRcdFx0aXNOb3REb25lID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0ZG9uZXNbaWRdKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0cGxheWVyLmFwaSgnc2V0Vm9sdW1lJywgdm9sdW1lKTtcclxuXHRcdFx0XHRcdHBsYXllci5hcGkoJ2dldFZpZGVvV2lkdGgnLCBmdW5jdGlvbiAodmFsdWUsIHBsYXllcl9pZCkge1xyXG5cdFx0XHRcdFx0XHR2YXIgdyA9IHZhbHVlXHJcblx0XHRcdFx0XHRcdHBsYXllci5hcGkoJ2dldFZpZGVvSGVpZ2h0JywgZnVuY3Rpb24gKHZhbHVlLCBwbGF5ZXJfaWQpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgaCA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRcdHZhciB2UmF0aW8gPSB3IC8gaDtcclxuXHRcdFx0XHRcdFx0XHQkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCl7cmVzaXplKHZSYXRpbyk7fSk7XHJcblx0XHRcdFx0XHRcdFx0cmVzaXplKHZSYXRpbyk7XHJcblx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSgncGxheScpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pXHJcblx0XHQuZmFpbChmdW5jdGlvbigganF4aHIsIHNldHRpbmdzLCBleGNlcHRpb24gKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCAnVHJpZ2dlcmVkIGFqYXhFcnJvciBoYW5kbGVyLicgKTtcclxuXHRcdH0pO1xyXG59OyIsIlwidXNlIHN0cmljdFwiOyB2YXIgJCA9IGpRdWVyeTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciAkeW91dHViZUJncyA9ICQoXCIueW91dHViZS1iZ1wiKTtcclxuXHRpZigkeW91dHViZUJncy5sZW5ndGggPDEpe1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRpZigkKCdodG1sJykuaGFzQ2xhc3MoJ21vYmlsZScpKXtcclxuXHRcdCR5b3V0dWJlQmdzLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyICR5b3V0dWJlQmcgPSAkKHRoaXMpO1xyXG5cdFx0XHR2YXIgYWx0ID0gJHlvdXR1YmVCZy5kYXRhKCdhbHRlcm5hdGl2ZScpO1xyXG5cdFx0XHRpZihhbHQpe1xyXG5cdFx0XHRcdHZhciAkaW1nID0gJCgnPGltZyBhbHQgY2xhc3M9XCJiZ1wiIHNyYz1cIicrYWx0KydcIi8+Jyk7XHJcblx0XHRcdFx0JHlvdXR1YmVCZy5hZnRlcigkaW1nKS5yZW1vdmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdHZhciBkb25lcyA9IFtdO1xyXG5cdCR5b3V0dWJlQmdzLmVhY2goZnVuY3Rpb24oaSl7XHJcblx0XHR2YXIgJHlvdXR1YmVCZyA9ICQodGhpcyk7XHJcblx0XHR2YXIgZWxJZCA9ICR5b3V0dWJlQmcuYXR0cignaWQnKTtcclxuXHRcdGlmKCFlbElkKSB7XHJcblx0XHRcdGVsSWQgPSAneW91dHViZS1iZy0nK2k7XHJcblx0XHRcdCR5b3V0dWJlQmcuYXR0cignaWQnLCBlbElkKTtcclxuXHRcdH1cclxuXHRcdCR5b3V0dWJlQmcuZGF0YSgnbG9hZGluZycsIGZ1bmN0aW9uKGRvbmUpe1xyXG5cdFx0XHRkb25lc1tlbElkXSA9IGRvbmU7XHJcblx0XHR9KTtcclxuXHR9KTtcclxuXHR2YXIgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcblx0dGFnLnNyYyA9IFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vaWZyYW1lX2FwaVwiO1xyXG5cdHZhciBmaXJzdFNjcmlwdFRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcclxuXHRmaXJzdFNjcmlwdFRhZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YWcsIGZpcnN0U2NyaXB0VGFnKTtcclxuXHR3aW5kb3cub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSBmdW5jdGlvbigpe1xyXG5cdFx0JHlvdXR1YmVCZ3MuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHR2YXIgJHlvdXR1YmVCZyA9ICQodGhpcyk7XHJcblx0XHRcdHZhciB2aWRlb0lkID0gJHlvdXR1YmVCZy5kYXRhKCd2aWRlbycpO1xyXG5cdFx0XHR2YXIgdm9sID0gJHlvdXR1YmVCZy5kYXRhKCd2b2x1bWUnKTtcclxuXHRcdFx0dmFyIG11dGUgPSAkeW91dHViZUJnLmRhdGEoJ211dGUnKTtcclxuXHRcdFx0dmFyIGVsSWQgPSAkeW91dHViZUJnLmF0dHIoJ2lkJyk7XHJcblx0XHRcdHZhciBpc05vdERvbmUgPSB0cnVlO1xyXG5cdFx0XHR2YXIgcGxheWVyID0gbmV3IFlULlBsYXllcihlbElkLCB7XHJcblx0XHRcdFx0dmlkZW9JZDogdmlkZW9JZCxcclxuXHRcdFx0XHRwbGF5ZXJWYXJzOiB7aHRtbDU6IDEsIGNvbnRyb2xzOiAwLCAnc2hvd2luZm8nOiAwLCAnbW9kZXN0YnJhbmRpbmcnOiAxLCAncmVsJzogMCwgJ2FsbG93ZnVsbHNjcmVlbic6IHRydWUsICdpdl9sb2FkX3BvbGljeSc6IDMsIHdtb2RlOiAndHJhbnNwYXJlbnQnIH0sXHJcblx0XHRcdFx0ZXZlbnRzOiB7XHJcblx0XHRcdFx0XHRvblJlYWR5OiBmdW5jdGlvbihldmVudCl7XHJcblx0XHRcdFx0XHRcdHZhciByZXNpemUgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdHZhciAkaUZyYW1lID0gJChldmVudC50YXJnZXQuZ2V0SWZyYW1lKCkpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciB3aW5kb3dXID0gJCh3aW5kb3cpLndpZHRoKCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHdpbmRvd0ggPSAkKHdpbmRvdykuaGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGlGcmFtZVcgPSAkaUZyYW1lLndpZHRoKCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGlGcmFtZUggPSAkaUZyYW1lLmhlaWdodCgpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBpZlJhdGlvID0gaUZyYW1lVy9pRnJhbWVIO1xyXG5cdFx0XHRcdFx0XHRcdHZhciB3UmF0aW8gPSB3aW5kb3dXL3dpbmRvd0g7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHZSYXRpbyA9IChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHIgPSAkeW91dHViZUJnLmRhdGEoJ3JhdGlvJyk7XHJcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gciA9PT0gdW5kZWZpbmVkID8gaWZSYXRpbyA6IGV2YWwocik7XHJcblx0XHRcdFx0XHRcdFx0fSkoKTsgXHJcblx0XHRcdFx0XHRcdFx0dmFyIHNldFNpemUgPSBmdW5jdGlvbih2dywgdmgpe1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGlmdywgaWZoO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYoaWZSYXRpbyA+IHZSYXRpbyl7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmaCA9IE1hdGguY2VpbCh2aCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmdyA9IE1hdGguY2VpbChpZmggKiBpZlJhdGlvKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZncgPSBNYXRoLmNlaWwodncpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZmggPSBNYXRoLmNlaWwoaWZ3IC8gaWZSYXRpbyk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHQkaUZyYW1lLmNzcyh7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHdpZHRoOiAgaWZ3KydweCcsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGhlaWdodDogaWZoKydweCcsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHRvcDogTWF0aC5yb3VuZCgod2luZG93SCAtIGlmaCkvMikrJ3B4JyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0bGVmdDogTWF0aC5yb3VuZCgod2luZG93VyAtIGlmdykvMikrJ3B4JyxcclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZih3UmF0aW8gPiB2UmF0aW8pe1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHZ3ID0gd2luZG93VztcclxuXHRcdFx0XHRcdFx0XHRcdHZhciB2aCA9IHZ3L3ZSYXRpbztcclxuXHRcdFx0XHRcdFx0XHRcdHNldFNpemUodncsIHZoKTtcclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciB2aCA9IHdpbmRvd0g7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgdncgPSB2aCAqIHZSYXRpbztcclxuXHRcdFx0XHRcdFx0XHRcdHNldFNpemUodncsIHZoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdCQod2luZG93KS5yZXNpemUocmVzaXplKTtcclxuXHRcdFx0XHRcdFx0cmVzaXplKCk7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnRhcmdldC5zZXRQbGF5YmFja1F1YWxpdHkoJ2hpZ2hyZXMnKTtcclxuXHRcdFx0XHRcdFx0aWYodm9sICE9PSB1bmRlZmluZWQpIGV2ZW50LnRhcmdldC5zZXRWb2x1bWUodm9sKTtcclxuXHRcdFx0XHRcdFx0aWYobXV0ZSA9PT0gJ3llcycgfHwgbXV0ZSA9PT0gdW5kZWZpbmVkKSBldmVudC50YXJnZXQubXV0ZSgpO1xyXG5cdFx0XHRcdFx0XHRldmVudC50YXJnZXQucGxheVZpZGVvKCk7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0b25TdGF0ZUNoYW5nZTogZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0XHRcdFx0XHRpZihpc05vdERvbmUgJiYgZXZlbnQuZGF0YSA9PT0gWVQuUGxheWVyU3RhdGUuUExBWUlORyl7XHJcblx0XHRcdFx0XHRcdFx0aXNOb3REb25lID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0KGRvbmVzW2VsSWRdKSgpO1xyXG5cdFx0XHRcdFx0XHR9ZWxzZSBpZihldmVudC5kYXRhID09PSBZVC5QbGF5ZXJTdGF0ZS5FTkRFRCl7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQudGFyZ2V0LnBsYXlWaWRlbygpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1x0XHJcblx0fTtcclxufTsiXX0=
