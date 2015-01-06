jQuery(document).ready(function($){
  var bootstrap = {}
    , $countdown = null
    , timers = []; 
  
  // ---------------- 
  // Bootstrap vars
  // ---------------- 
  bootstrap['screenXs'] = 480;
  bootstrap['screenSm'] = 768;
  bootstrap['screenMd'] = 992;
  bootstrap['screenLg'] = 1200;
  bootstrap['screenXsMax'] = bootstrap['screenSm'] - 1;
  bootstrap['screenSmMax'] = bootstrap['screenMd'] - 1;
  bootstrap['screenMdMax'] = bootstrap['screenLg'] - 1;
  bootstrap['gridFloatBreakpoint'] = bootstrap['screenSm'];  
  
  $countdown = {
    container: $('.countdown-container').first(),
    days: $('.countdown-container').first().find('[data-countdown-unit="days"]'),
    hours: $('.countdown-container').first().find('[data-countdown-unit="hours"]'),
    minutes: $('.countdown-container').first().find('[data-countdown-unit="minutes"]'),
    seconds: $('.countdown-container').first().find('[data-countdown-unit="seconds"]')
  };
  
  function updateCountdown(ts){
    $countdown.days.text(ts.days < 10 ? '0' + ts.days.toString() : ts.days.toString());
    $countdown.hours.text(ts.hours < 10 ? '0' + ts.hours.toString() : ts.hours.toString());
    $countdown.minutes.text(ts.minutes < 10 ? '0' + ts.minutes.toString() : ts.minutes.toString());
    $countdown.seconds.text(ts.seconds < 10 ? '0' + ts.seconds.toString() : ts.seconds.toString());
    return $countdown;
  }
  
  function ontick(ts){
    return updateCountdown(ts);
  }
  
  function initCountdown(d){
    var timer = countdown(ontick, d, ~(countdown.YEARS | countdown.MONTHS | countdown.WEEKS | countdown.MILLISECONDS), 0);
    return timers.push(timer);
  }
  
  function reqisterMediaQueries(){
    enquire.register('screen and (max-width:' + bootstrap['screenXsMax'] + 'px)', {
      match: function(){
        $('#subheading').addClass('gutter-less');
      },
      unmatch: function(){
        $('#subheading').removeClass('gutter-less');
      },
      setup: function(){
        var klass = $(window).width() < bootstrap['screenXsMax'] ? 'gutter-less' : '';
        $('#subheading').addClass(klass);
      },
      deferSetup: false
    });
  }
  
  function init(){
    var startDate = new Date(Date.UTC(2015,0,5,20,0,0));
    initCountdown(startDate);
    reqisterMediaQueries();
    return $('body').removeClass('loading').addClass('loaded');
  }
  
  init();
});