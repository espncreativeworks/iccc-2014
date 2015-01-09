jQuery(document).ready(function($){
  
  var bootstrap = {}
    , social = { fb: {}, twttr: {} }
    , slidesShown = 0;
  
  // ---------------- 
  // Shims
  // ---------------- 
  if (!String.prototype.toProperCase){
    String.prototype.toProperCase = function(){
      var _copy = this.slice(0)
        , _first = _copy.slice(0,1)
        , _rest = _copy.slice(1);
      return _first.toUpperCase() + _rest.toLowerCase();
    };
  }

  if (!String.prototype.trim){
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g,'');
    };
  }
  
  // ---------------- 
  // Constants
  // ---------------- 
  
  
  // ---------------- 
  // Bootstrap vars
  // ---------------- 
  bootstrap['screenSm'] = 768;
  bootstrap['screenSmMin'] = bootstrap.screenSm;
  bootstrap['gridFloatBreakpoint'] = bootstrap.screenSmMin;
  
  // ---------------- 
  // Social vars
  // ----------------
  window.fbAsyncInit = function(){
    // init the FB JS SDK
    FB.init({
      appId: '550572098365621',
      status: true,
      cookie: true,
      xfbml: true
    });
  };
  
  social.fb.opts = {
    method: 'feed',
    redirect_uri: 'http://promo.espn.go.com/espn/contests/infiniti/2015/',
    name: 'Infiniti Coaches Charity Challenge',
    link: 'http://promo.espn.go.com/espn/contests/infiniti/2015/',
    picture: 'http://a.espncdn.com/contests/infiniti/2015/coaches-charity-challenge/display/180x180.jpg',
    caption: 'http://es.pn/1aSRogz',
    description: 'Coaches are competing to win up to $100,000 for charity. Raise votes for your coach by promoting him through social media and e-mail. Visit http://espn.com/infiniti to get started!'
  };
  
  social.fb.callback = function (res) {
    if (res && res.post_id) {
      // TODO: Track Post
    } else {
      // TODO: Track Adondonment
    }
  };
 
  // ---------------- 
  // Options
  // ---------------- 
  $.cookie.defaults.json = true;
  window.location.uri = window.location.uri || new URI(window.location.href);
  debug.setLevel(0);
  
  // ---------------- 
  // Event Handling
  // ---------------- 
  function onslid(){
    slidesShown++;
    if (slidesShown === $('#masthead-carousel .item').length){
      $('#masthead-carousel').carousel('pause');
    } 
  }
  
  // ---------------- 
  // Event Handlers
  // ---------------- 
  $('#masthead-carousel').on('slid.bs.carousel', onslid);
  $('.social .facebook').on('click', function(e){
    e.preventDefault();
    return FB.ui(social.fb.opts, social.fb.callback);
  });
  
  // ---------------- 
  // Utilities 
  // ---------------- 
  function activateNav(){
    $('.nav li').each(function(){
      var $this = $(this)
        , $a = $this.find('a').first();
      if ( $this.hasClass('social') || $this.hasClass('countdown-container') ){ return; }
      if ( window.location.uri.equals($a.get(0).href) || ( $a.get(0).href.indexOf('index') > 0 && window.location.pathname === '/' ) ){
        $this.addClass('active');
      }
    });
  }
  
  function activateAffix(){
    if (!Modernizr.touch){
      var options = {};
      options.offset = {};
      options.offset.top = function(){ 
        return $('.header.promo').outerHeight(true) - 10; 
      };
      $('.navbar.sticky').affix($.extend({}, options));
    
      options.offset.top = function(){ 
        return $('.header.promo').outerHeight(true) + $('.masthead').outerHeight(true) + $('.collapse-controls').outerHeight(true) - 10; 
      };
      $('.toolbar-content.sticky').affix($.extend({}, options));
    }
  }
  
  // ---------------- 
  // Event Handling
  // ----------------  
  $('[data-control-action="submit-vote"]').on('click', function (e){
  	if (Modernizr.touch){
    	ga('send', 'event', 'Landing Page', 'Vote Button', 'Mobile');
    } else {
    	ga('send', 'event', 'Landing Page', 'Vote Button', 'Desktop');
    }
  });
  
  $('.logo-container.infiniti').on('click', function (e) {
  	ga('send', 'event', 'Header', 'Infiniti Logo', 'Infiniti Logo');
  });
  
  $('[data-btn-action="logout"]').on('click', function (e){
    e.preventDefault();
    espn.memberservices.logout();
    return false;
  });

  $('[data-btn-action="submit"], [data-btn-action="reset"]').on('click', function (e){
    var _action = $(e.target).attr('data-btn-action');
    $(e.target).parents('form').first().find('input[type="' + _action + '"]').trigger('click');
  });

  $('input[type="text"], input[type="password"]').on('keypress', function(e){
   var ENTER_KEY = 13;
    if (e.which === ENTER_KEY){
      e.preventDefault();
      $(e.target).parents('form').first().find('[data-btn-action="submit"]').trigger('click');
    }
  });

  $('form[name="login"]').on('submit', function(e){
    var _inputs = [], _invalid = 0;
    _inputs.push( $(e.target).find('input[name="username"]') );
    _inputs.push( $(e.target).find('input[name="password"]') );
    $.each(_inputs, function(idx, $el){
      debug.dir($el);
      if ( $el.val().trim() === '' ){
        $el.attr('data-validity', 'false');
      }
    });
    $.each(_inputs, function(idx, $el){
      debug.dir($el);
      var _valid = $el.attr('data-validity') !== 'true' ? false : true;
      if ( !_valid ){
        _invalid++;
        var options = {
          html: true,
          title: '<span class="text-warning"><i class="glyphicon glyphicon-warning-sign"></i> Invalid ' + $el.attr('name').toProperCase() + '</span>',
          content: '<span class="text-warning">Please enter a valid ' + $el.attr('name').toLowerCase() + '.</span>',
          placement: (function(invalid){
            return function(){
              if ( 767 > $(window).width() ){
                return invalid % 2 === 0 ? 'bottom' : 'top';
              } else {
                return invalid % 2 === 0 ? 'left' : 'right';
              }
            };
          })(_invalid),
          trigger: 'manual'
        };
        $el.popover(options).popover('show');
        debug.dir($el.data('bs.popover'));
      }
    });
    debug.info(_invalid);
    if ( _invalid === 0 ){
      return true;
    } else {
      e.stopImmediatePropagation();
      return false;
    }
  });

  $('form[name="login"]').find('input[name="username"], input[name="password"]').on('input', function(e){
    if( $(e.target).data('bs.popover') ){ $(e.target).popover('destroy'); }
    $(e.target).attr('data-validity', 'true');
  });

  $('form[name="login"]').on('reset', function(e){
    $(e.target).find('input[name="username"], input[name="password"]').each(function(){
      if( $(this).data('bs.popover') ){ $(this).popover('destroy'); }
      $(this).attr('data-validity', 'true');
    });
  });

  // Custom link tracking
  $('body').on('click', 'a.track', function(e){
    // e.preventDefault();
  
    var _this, _linkName, _linkType, _overrides, _cb, _s = window.s_omni;
 
    _this = e.target;
    _linkName = $(_this).attr('title');
    _linkType = $(_this).attr('data-omniture-link-type'); // cache attribute
    _linkType = typeof _linkType === 'undefined' || _linkType === 'null' || _linkType === '' ? 'o' : _linkType;
    _overrides = {
      'useForcedLinkTracking': true,
      'forcedLinkTrackingTimeout': 1000
    };
    /**
      # future proofing for H.26
      --------------------------
      this callback argument will be ignored until update
    **/
    _cb = (function(_o, $){
      return function(){
        var _options = '', options;
        options = { 
          'left' : 0, 
          'top' : 0, 
          'width' : $(document).width(), 
          'height' : $(document).height(),
          'menubar' : 1, 
          'toolbar' : 1, 
          'location' : 1, 
          'personalbar' : 1, 
          'status' : 1, 
          'resizable' : 1,
          'scrollbar' : 1 
        };
     
        $.each(options, function(key,val){
          _options += key + '=' + val;
        });
     
        window.open(_o.href, ($(_o).attr('data-target') || 'newWindow'), _options);
        debug.log(_o);
        debug.log($(_o).attr('data-target') || 'newWindow');
        debug.log(_options);
      };
    })(_this, jQuery);
 
    _s.tl(_this, _linkType, _linkName, _overrides, _cb);
    debug.log('tracking link...\n  href: %s, type: %s, name: %s', _this.href, _linkType, _linkName);
    // return false;
  });

  $('a[data-target="_blank"]').on('click', function (){
    $(this).attr('target', $(this).attr('data-target'));
  }); 
  
  $('a[data-target="#masthead-carousel"]').on('click', function (){
    if ( !($('#masthead-carousel.carousel.slide').hasClass('in')) ) {
    	var rand = Math.floor(Math.random()*(10-0+1)+0);
    	console.log("rand: " + rand);
    	if (rand % 2 == 0) {
    		var dsrc = "http://www.youtube.com/embed/jx6lcYsy6FE"
    	} else {
    		var dsrc = "http://www.youtube.com/embed/UPLnmUx-Lig"
    	}
    	
      //var dsrc = $('iframe.video').data("src");
      $('iframe.video').attr('src',dsrc);
    } else {
      $('iframe.video').attr('src',"");
    } 
  });
  
  // Confirmation
  $('input[type="checkbox"].optin').on('change', function(){
    var $disclaimer = $('#optin-disclaimers').children('[data-disclaimer-for="' + $(this).attr('name') + '"].optin').first();
    $('#optin-disclaimers').fadeToggle().toggleClass('opted-out opted-in');
    setTimeout(function(){ $disclaimer.slideToggle('fast'); }, 300);
  });   
  
  // ---------------- 
  // Initializers 
  // ---------------- 
  function init(){
    //Shadowbox.init({ skipSetup: true });
    activateNav();
    activateAffix(); 
    return $('body').removeClass('loading').addClass('loaded');
  }
  
  // ---------------- 
  // Init
  // ---------------- 
  init();
  
});

window.FLOOD1 = function _FLOOD1(type, cat) {
  var axel = Math.random()+"";
  var a = axel * 10000000000000000;
  var flDiv=document.body.appendChild(document.createElement("div"));
  flDiv.setAttribute("id","DCLK_FLDiv1");
  flDiv.style.position="absolute";
  flDiv.style.top="0";
  flDiv.style.left="0";
  flDiv.style.width="1px";
  flDiv.style.height="1px";
  flDiv.style.display="none";
  flDiv.innerHTML='<iframe id="DCLK_FLIframe1" src="http://1361547.fls.doubleclick.net/activityi;src=1361547;type=' + type + ';cat=' + cat + ';ord=' + a + '?" width="1" height="1" frameborder="0"><\/iframe>';
};