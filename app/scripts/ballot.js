jQuery(document).ready(function($){
  var CONSTANTS = {} 
    , ballotUrl = 'api/ballots/index' 
    , ballot = window.ballot || null
    , timers = []
    , $countdown = {
        container: $('.countdown-container').first(),
        days: $('.countdown-container').first().find('[data-countdown-unit="days"]'),
        hours: $('.countdown-container').first().find('[data-countdown-unit="hours"]'),
        minutes: $('.countdown-container').first().find('[data-countdown-unit="minutes"]'),
        seconds: $('.countdown-container').first().find('[data-countdown-unit="seconds"]')
      }
  ;
  
  // ---------------- 
  // Constants
  // ---------------- 
  CONSTANTS['ASCENDING'] = 'asc';
  CONSTANTS['DESCENDING'] = 'desc';
  
  // ---------------- 
  // Options
  // ---------------- 
  $.cookie.defaults.json = true;
  window.location.uri = window.location.uri || new URI(window.location.href);

  // ---------------- 
  // Event Handling
  // ---------------- 
  $(document).on('ballotloaded', function(evt){
    var _ballot = window.ballot = evt.ballot;
    debug.dir(ballot);  
    
    initCountdown(new Date(_ballot.endedAt));
    initMasthead();
    initVisualization("1");
    //initVotingClosedModal();
    //return $(document).trigger({ type: 'ballotrendered' });
    
  });  
  
  function ontick(ts){
    return updateCountdown(ts);
  }
  
  function updateCountdown(ts){
    $countdown.days.text(ts.days < 10 ? '0' + ts.days.toString() : ts.days.toString());
    $countdown.hours.text(ts.hours < 10 ? '0' + ts.hours.toString() : ts.hours.toString());
    $countdown.minutes.text(ts.minutes < 10 ? '0' + ts.minutes.toString() : ts.minutes.toString());
    $countdown.seconds.text(ts.seconds < 10 ? '0' + ts.seconds.toString() : ts.seconds.toString());
    return $countdown;
  }

  function initCountdown(d){
    if (Date.now() < d.valueOf()){
      var timer = countdown(ontick, d, ~(countdown.YEARS | countdown.MONTHS | countdown.WEEKS | countdown.MILLISECONDS), 0);
      return timers.push(timer);
    } else {
      $countdown.days.text('00');
      $countdown.hours.text('00');
      $countdown.minutes.text('00');
      $countdown.seconds.text('00');
      return $countdown;
    }
  }
  
  function initVotingClosedModal(){
    var _ballot = window.ballot
      , currentLabel = _ballot.label.slice(0).toLowerCase()
      , comebackDate = new Date(_ballot.nextRound.startDate)
      , $modal = $('#voting-closed-modal');
      
      $modal.find('[data-ballot="label"]').text(currentLabel);
      $modal.find('[data-ballot="nextRound.startDate"]').text(comebackDate.toLocaleString());
    if (Date.now() < _ballot.currentRound.startDate || Date.now() > _ballot.currentRound.endDate){
      $modal.modal({ backdrop: false });
    }
  }
  
  function initVisualization(currentRd){
    return $('.visualization-container .phase').each(function(i){
      if (i + 1 <= currentRd){
        $(this).addClass('in-progress');
      }
    });
  }
  
  function initMasthead(){
    var params = window.location.uri.search(true)
    , data = $.cookie('iccc') || {}
    , expiration = new Date(window.ballot.endDate);
    
    $('#masthead-carousel').carousel();
    
    if (typeof data.lastVisit === 'undefined' || parseInt(params['masthead'], 10) === 1){
      disableCollapse({ showTarget: true });
    }
    
    data.lastVisit = Date.now();
    $.cookie('iccc', data, expiration);
    
    $('[data-target="#masthead-carousel"][data-toggle="collapse"]').on('click', function(){
      return disableCollapse({ showTarget: false });
    });
    
    initVideoPlayers();
    autoslide();
  }
  
  function disableCollapse(opts){
    var $collapseControls = $('.collapse-controls').first();
      
    $collapseControls.css({ display: 'none' });
    if (opts.showTarget){
      $collapseControls.find('[data-toggle="collapse"]').trigger('click');
    }
    return ;
  }
  
  function initVideoPlayers(){
    $('.video-player .video').each(function(){
      var $this = $(this)
        // , $container = $this.parent()
        // , w = parseInt($container.width(), 10)
        // , h = parseInt($container.height(), 10)
        //, src = $this.attr('data-src')
      ;
      
      //src = src + '&width=' + w + '&height=' + h;
      // $this.css({ width: w, height: h }).attr('src', src);
      //$this.attr('src', src);
    });
  }
  
  function autoslide(){
    var params = window.location.uri.search(true);
    if (params['slide'] && parseInt(params['slide'], 10) === 1){
      $('#masthead-carousel').carousel('next');
      //$('#masthead-carousel .carousel-indicators').find('[data-slide-to="' + params['slide'] + '"]').trigger('click');
      //$('#masthead-carousel').carousel('cycle');
    }
  }  
  
  function loadBallot(){
    var settings = {
      url: ballotUrl,
      type: 'GET',
      dataType: 'json',
      cache: true,
      success: function(data){
        return $(document).trigger({ type:'ballotloaded', ballot: data });
      },
      error: function(jqXhr, textStatus, errorThrown){
        return debug.error('Error loading ballot [' + textStatus + ']: ' + errorThrown);
      }
    };
    return $.ajax(settings);
  }
  
  function init(){
    if (!ballot){ loadBallot(); }
  }
  
  init();
  
});