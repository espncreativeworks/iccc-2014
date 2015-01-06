jQuery(document).ready(function($){
  var CONSTANTS = {} 
    , social = { fb: {}, twttr: {} }
    , options = {}
    , ballotUrl = 'api/ballots/index' 
    , ballot = window.ballot || null
    , coaches = window.coaches || null
  ;
  
  // ---------------- 
  // Shims
  // ---------------- 
  if (!Number.prototype.ordinalize){
    Number.prototype.ordinalize = function ordinalize(){
      var self = this, val = Math.round(self.valueOf()), cent, dec, ordinalized = self.toString();
      
      cent = val % 100;
      dec = val % 10;
      if (cent - dec === 10) {
        ordinalized += 'th';
        return ordinalized;
      }

      switch (dec) {
        case 1:
          ordinalized += 'st';
          return ordinalized;
        case 2:
          ordinalized += 'nd';
          return ordinalized;
        case 3:
          ordinalized += 'rd';
          return ordinalized;
        default:
          ordinalized += 'th';
          return ordinalized;
      }
    };
  } 
  
  // ---------------- 
  // Constants
  // ---------------- 
  CONSTANTS['ASCENDING'] = 'asc';
  CONSTANTS['DESCENDING'] = 'desc';
  CONSTANTS['ASSET_PATH'] = espn.core.cdnHTTPPath + 'promotions/bsa/apps/infiniti/2015/coaches-charity-challenge/';
  CONSTANTS['THUMBNAIL_PATH'] = CONSTANTS['ASSET_PATH'] + 'images/coaches/';
  
  // ---------------- 
  // Options
  // ---------------- 
  $.cookie.json = true;
  window.location.uri = new URI(window.location.href);
  social.fb.opts = {
    method: 'feed',
    name: 'Infiniti Coaches’ Charity Challenge',
    link: 'http://promo.espn.go.com/espn/contests/infiniti/2014/',
    picture: 'http://a.espncdn.com/contests/infiniti/2014/coaches-charity-challenge/display/100x100.jpg',
    caption: 'http://es.pn/1aSRogz',
    description: 'Coaches are competing to win up to $100k for charity. Raise votes for your coach by promoting him through social media and e-mail. Visit http://espn.com/infiniti to get started!'
  };
  social.fb.callback = function (res) {
    if (res && res.post_id) {
      // TODO: Track Post
    } else {
      // TODO: Track Adondonment
    }
  };
  
  // List Options
  options['listjs'] = {};
  options['listjs']['desktop-content-container'] = {
    valueNames: ['sort-name-coach', 'sort-name-school', 'sort-name-charity', 'sort-ranking', 'sort-result']
  };
  options['listjs']['phone-content-container'] = {
    valueNames: ['sort-name-coach', 'sort-name-school', 'sort-name-charity']
  };
  options['listjs']['thanks-content-container'] = {
    valueNames: ['sort-name-coach', 'sort-name-school', 'sort-name-charity', 'sort-ranking', 'sort-result']
  };
  
  // iosSlider Options
  options['iosSlider'] = {
    keyboardControls: true,
    desktopClickDrag: true,
    snapToChildren: true,
    snapSlideCenter: true
  };  

  // ---------------- 
  // Event Handlers
  // ---------------- 
  function onsort(e){
    e.preventDefault();
    var $this = $(this); 
    if ( !$this.hasClass('selected') ){
      //var evt = { type: 'sortcomplete', sortKey: $this.attr('data-sort').split('-').pop(), target: $this };
      $this.parents('.sorting-controls').find('[data-control-action="sort"]').each(function(){
        $(this).removeClass('selected');
      });
      $this.addClass('selected');
      //$(document).trigger(evt);
    }
  }
  
  function onmobilesort(e){
    e.preventDefault();
    var $this = $(this);
    if ( !$this.parent().hasClass('active') ){
      $('#options li.active').removeClass('active');
    
      var $target = $(e.target) 
        , $accordion = $('#sorting-options-accordion')
        , $selected = $('#sorting-input').find('[selected="selected"]').removeAttr('selected').siblings('[value="' + $target.attr('data-option-value') + '"]').attr('selected','selected');
        //, evt = { type: 'sortcomplete', sortKey: $this.attr('data-sort').split('-').pop(), target: $this };
      
      $target.parent().addClass('active');
      $accordion.find('.panel-title [data-toggle="collapse"] .control-text.current-value').text($selected.val());
      $accordion.find('.panel-title [data-toggle="collapse"]').trigger('click');
      $('.ios-slider').iosSlider('update');
      $('.ios-slider').iosSlider('goToSlide', 1);
      updatePagination($('.pagination [data-control-action="paginate"]').first());
      //$(document).trigger(evt);
    } else {
      e.stopImmediatePropagation();
    }
  }
  
  /*
  function onsortcomplete(e){
    $(e.target).parents('.container').find('.ballot-item .info-container .display-name').each(function(){
      var $displayName = $(this)
        , $field = $displayName.children().first();
      
      if ( $field.hasClass(e.sortKey) ){
        $displayName.addClass('sorted-by');
      } else {
        $displayName.removeClass('sorted-by');
      }
    });
  }
  */
  
  function onslidecomplete(){
    var $activeRangeControl = $('.pagination li.active [data-control-action="paginate"]')
      , $inactiveRangeControls = $('.pagination li').not('.active').find('[data-control-action="paginate"]')
      , activeStartLetter = $activeRangeControl.attr('data-page-start')
      , activeEndLetter = $activeRangeControl.attr('data-page-end')
      , currentSelector = getCurrentSortSelector()
    ;
    
    if ( currentSlideIsInRange(activeStartLetter, activeEndLetter, currentSelector) ){
      return; // nothing to do, already in active range, return early
    } 
    
    // loop through inactive ranges looking for first match
    $.each($inactiveRangeControls, function(){
      var $this = $(this)
        , startLetter = $this.attr('data-page-start')
        , endLetter = $this.attr('data-page-end')
      ;
      if ( currentSlideIsInRange(startLetter, endLetter, currentSelector) ){
        updatePagination($this);
        return true;
      }
    });
  }
  
  function ontoggleview(e){
    e.preventDefault();
    if (!$(this).parents('.card').hasClass('flipped')){
      $('.ballot .card').removeClass('flipped');
      $(this).parents('.card').toggleClass('flipped');
    } else {
      $(this).parents('.card').removeClass('flipped');
    }
    return ;
  }
  
  function ontogglefavorite(e){
    e.preventDefault();
    
    if ($(e.target).hasClass('selected')){
      return false;
    }
    
    var $this = $(this)
      , coachId = $this.parents('.ballot-item-container').attr('data-nominee-id')
      , data = $.cookie('iccc') || {}
      , expiration = new Date(window.ballot.endDate);
    

    if (typeof data.favorites === 'undefined'){
      data.favorites = [coachId];
    } else {
      data.favorites.push(coachId);
    }
    
    $.cookie('iccc', data, { expires: expiration });
    $this.addClass('selected');
  }
  
  function onvote(e){
    
    var $this = $(this)
      , coachId = $this.parents('.ballot-item-container').attr('data-nominee-id')
      , data = $.cookie('iccc') || {}
      , expiration = new Date(window.ballot.endDate)
    ;
    
    if (typeof data.coachIds === 'undefined'){
      data.coachIds = [coachId];
    } else {
      data.coachIds.push(coachId);
    }
    
    data.lastVoted = Date.now();
    $.cookie('iccc', data, { expires: expiration });
    //debug.dir($.cookie('iccc'));
    
    /*
    if ($this.attr('rel') === 'desktop'){
      e.preventDefault();
      Shadowbox.open(e.target);
      return false;
    }
    */
  }
  
  // ---------------- 
  // Event Handling
  // ----------------
  $('#desktop-content-container .sorting-controls, #thanks-content-container .sorting-controls').on('click', '[data-control-action="sort"]', onsort);
  $('#options').on('click', '[data-control-action="sort"]', onmobilesort);
  //$(document).on('sortcomplete', onsortcomplete);
  
  $('.pagination').on('click', '[data-control-action="paginate"]', function(e){
    e.preventDefault();
    debug.group('Paging...');
    var $this = $(this)
      , startLetter = $this.attr('data-page-start')
      , endLetter = $this.attr('data-page-end')
      , currentSelector = getCurrentSortSelector()
    ;
    debug.log('startLetter = ' + startLetter);
    debug.log('endLetter = ' + endLetter);
    debug.log('currentSelector = ' + currentSelector);
    
    if ( !currentSlideIsInRange(startLetter, endLetter, currentSelector) ){
      var pageToIndex = findFirstIndexOf(startLetter, currentSelector);
      //$('.ios-slider').iosSlider('goToSlide', pageToIndex + 1);
      $('.ios-slider').iosSlider('goToSlide', pageToIndex + 1);
      //$('.ios-slider').iosSlider('update');
      updatePagination($this);
    }
    debug.groupEnd();
  });
  
  $(document).on('ballotloaded', function(evt){
    var _ballot = window.ballot = evt.ballot;
    return $(document).trigger({ type: 'ballotrendered' });
  }); 
  
  $(document).on('coachesloaded', function(evt){
    var _coaches, $template, coach, ranking;
    _coaches = window.coaches = addRankings(evt.coaches);
    
    if ($('#desktop-content-container .active.ballot-item-container.template').length > 0){
      $template = renderCoaches('#desktop-content-container .active.ballot-item-container.template', filterActive(_coaches));
    }
    
    if ($('#desktop-content-container .eliminated.ballot-item-container.template').length > 0){
      $template = renderCoaches('#desktop-content-container .eliminated.ballot-item-container.template', filterInactive(_coaches));
    }
    
    if ($('.leaderboard-item.template').length > 0){
      $template = renderCoaches('.leaderboard-item.template', filterActive(_coaches));
    }
    
    if ($('#phone-content-container .ballot-item-container.template').length > 0){
      $template = renderCoaches('#phone-content-container .ballot-item-container.template', filterActive(_coaches));
    }
    
    if ($('body').hasClass('info') && $('body').attr('id') !== 'leaderboard'){
      coach = getCurrentCoach();
      ranking = getCurrentCoachRanking();
      if ($('.thanks-content .thanks-item-container.template').length > 0){
        $template = renderCoaches('.thanks-content .thanks-item-container.template', [coach]);  
      }
      $('.thanks-content .display-name-coach').html(coach.name.first + ' ' + coach.name.last);
      $('.thanks-content .display-ranking').html(ranking.ordinalize());
    }  
    
    return $(document).trigger({ type: 'coachesrendered' });
  });  
  
  $(document).on('coachesrendered', function(){
    new List('desktop-content-container', options['listjs']['desktop-content-container']);
    new List('phone-content-container', options['listjs']['phone-content-container']);
    new List('thanks-content-container', options['listjs']['thanks-content-container']);
    //lists.push(new List('desktop-content-container', options['listjs']['desktop-content-container']));
    //lists.push(new List('phone-content-container', options['listjs']['phone-content-container']));
    addBallotEventListeners();
    //initFavorites();
    autosort();
    initiosSlider();    
    animateProgress();
    autovote();
    if ($('body').attr('id') === 'thanks'){
      initThanksSharing();
    }
  });
  
  function addBallotEventListeners(){
    $('.ballot, body.info').on('click', '[data-control-action="toggle-view"]', ontoggleview);
    $('.ballot').on('click', '[data-control-action="toggle-favorite"]', ontogglefavorite);
    $('.ballot').on('click', '[data-control-action="submit-vote"]', onvote);
  }
  
  function initThanksSharing(){
    var coach = getCurrentCoach()
    , fbLink = window.location.uri.scheme() + '://' + window.location.uri.hostname() + window.location.uri.directory() + '/' 
    , twttrBaseUrl = 'https://twitter.com/intent/tweet?source=webclient&text='
    , twttrText = 'I just voted for Coach ' + coach.name.last + ' in the Infiniti Coaches\' Charity Challenge! Vote now http://espn.com/infiniti'
    , overrides = {}
    , settings = {};
    
    overrides = {
      link: fbLink,
      name: 'I just voted for Coach ' + coach.name.last + ' in the Infiniti Coaches\' Charity Challenge!',
      picture: coach.headshot.url,
      description: 'Coach ' + coach.name.last + ' is currently ranked ' + coach.rank.ordinalize() + '. Visit http://espn.com/infiniti to vote for your coach\'s favorite charity!'
    };
    
    social.fb.opts = $.extend(settings, social.fb.opts, overrides);
    
    $('body#thanks .social-share-container').on('click', '.facebook', function(e){
      e.preventDefault();
      return FB.ui(social.fb.opts, social.fb.callback);
    });
    
    twttrText = encodeURIComponent(twttrText);
    
    $('body#thanks .social-share-container .twitter').first().attr('href', twttrBaseUrl + twttrText);
  }
  
  function animateProgress(){
    $('.votes .progress').each(function(){
      var pct = $(this).attr('data-progress') + '%';
      $(this).transition({ width: pct , delay: 1000 }, 1000).find('.progress-label').text(pct).addClass('visible');
      if ( Math.round(parseInt(pct,10)) < 15 ){
        $(this).find('.progress-label').css({ position: 'absolute', left: Math.round(parseInt(pct,10) + 2) + '%', color: 'black' });
      }
    });
  }
  
  function autovote(){
    var params = window.location.uri.search(true);
    if (params.coachId && parseInt(params.coachId,10)){
      $('.ballot-item-container[data-nominee-id="' + params.coachId + '"]').first().find('[data-control-action="submit-vote"]').trigger('click');
    }
  }
  
  function autosort(){
    $('.sorting-controls').each(function(){
      $(this).find('[data-control-action="sort"]').first().trigger('click');
      debug.log($(this).find('[data-control-action="sort"]').first());
    });
  }
  
  /*
  function initFavorites(){
    var data = $.cookie('iccc');
    if (typeof data.favorites !== 'undefined' && data.favorites.length){
      $.each(data.favorites, function(i, favorite){
        $('.ballot-item-container[data-nominee-id="' + favorite + '"]').each(function(i, ballotItem){
          $(ballotItem).find('.personalization-control').addClass('selected');
        });
      });
    }
  }
  */
  
  function initiosSlider(){
    var settings = $.extend({}, options.iosSlider, { onSlideComplete: onslidecomplete });
    //debug.dir(settings);
    return $('.ios-slider').iosSlider(settings);
  }
  
  function getCurrentCoach(){
    var params = window.location.uri.search(true)
      , coachId
      , coach = null;
    
    if (!(window.coaches && params.coachId && $.trim(params.coachId))){
      return coach;
    }
    
    coachId = $.trim(params.coachId);
    $.each(window.coaches, function(i, item){
      if (item._id === coachId){
        coach = item;
        return true;
      }
    });
    debug.dir(coach);
    return coach;
  }
  
  function getCurrentCoachRanking(){
    var coach = getCurrentCoach()
      , ranking = null;
    
    if ( !(coach && window.coaches) ){
      ranking = -1;
    } else {
      ranking = coach.rank;
    }
    
    return ranking;
  }
  
  function getCurrentSortSelector(){
    var currentOption = $('#sorting-input').find('[selected="selected"]').val()
      , selector = ''
    ;
  
    selector = $('#options').find('[data-control-action="sort"][data-option-value="' + currentOption + '"]').attr('data-sort');
    //debug.log('getCurrentSortSelector() = ' + selector);
    return selector;
  }

  function findFirstIndexOf(letter, selector){
    var firstIndex = 0;
    letter = letter.toLowerCase();
    $('#phone-content-container .ballot .' + selector).each(function(i){
      var $this = $(this);
      //debug.log(letter + '.localeCompare( ' + $this.text().toLowerCase() + ' ) = ' + letter.localeCompare( $this.text().toLowerCase() ));
      if ( letter.localeCompare( $this.text().toLowerCase() ) <= 0 ){
        firstIndex = i;
        return false;
      }
    });
    //debug.log('findFirstIndexOf(' + letter + ', ' + selector + ') = ' + firstIndex);
    return firstIndex;
  }

  function currentSlideIsInRange(startLetter, endLetter, selector){
    var result = false 
      , currentSlide = $('.ios-slider').data('args').currentSlideObject
      , sortedByLetter = $(currentSlide).find('.' + selector).first().text().slice(0,1).toLowerCase()
    ;
  
    startLetter = startLetter.toLowerCase();
    endLetter = endLetter.toLowerCase();
    result = ( startLetter.localeCompare( sortedByLetter ) <= 0 && endLetter.localeCompare( sortedByLetter ) >= 0 );
    
    //debug.log(currentSlide);
    //debug.log('sortedByLetter = ' + sortedByLetter);
    //debug.log('currentSlideIsInRange(' + startLetter +  ', ' + endLetter + ', ' + selector + ') = ' + result);
    return result;
  }

  function updatePagination($scope){
    if (!$scope.parent().hasClass('active')){
      $('.pagination li').removeClass('active');
      return $scope.parent().addClass('active');
    }
  }
  
  function addRankings(data){
    var sorted, votes, rankings;
    
    sorted = data.slice().sort(function(a,b){
      return b.totalVotes - a.totalVotes;
    });
    
    votes = sorted.slice().map(function(coach){
      return coach.totalVotes;
    });
    
    rankings = votes.slice().map(function(vote){
      return votes.indexOf(vote) + 1;
    });
    
    debug.log(votes);
    debug.log(rankings);
    
    $.each(sorted, function(i, item){
     // debug.log(item.name.last + ' is ranked ' + rankings[i]);
      item.rank = rankings[i];
    });
    
    return sorted;
  }
  
  function filterActive(data){
    var _data =  $.grep(data, function(item){
      return item.isActive;
    });
    return _data;
  }
  
  function filterInactive(data){
    var _data =  $.grep(data, function(item){
      return !item.isActive;
    });
    return _data;
  }
  
  function renderCoaches(selector, data){
    var $ballotContainer = $(selector).parent();    
    if ($('body').hasClass('info')){
      data.sort(function(a,b){
        return a.rank - b.rank;
      });
    } else {
      data.sort(function(a,b){
        return a.sortName.localeCompare(b.sortName);
      });
    }
    
    //debug.group('Coaches');
    $.each(data, function(i, item){
      //debug.dir(item);
      var $itemContainer = $(selector).first().clone(true, true)
        , ranking = item.rank
        , pct = Math.round((item.totalVotes / (window.ballot.totalVotes * 1.0) * 100), 10)
        , params = { next: 'vote', coachId: item._id, medium: Modernizr.touch ? 'mobile' : 'desktop' }
        , href = $.param(params)
      ;
      
      $itemContainer.attr('data-nominee-id', item._id);
      $itemContainer.find('.progress-container.money .progress').text('$' + item.donation);
      $itemContainer.find('.progress-container.votes .progress').attr('data-progress', pct);
      //$itemContainer.find('.thumbnail-container .thumbnail').css({ backgroundImage: 'url(' + CONSTANTS['THUMBNAIL_PATH'] + item.thumbnail.base + ')' });
      $itemContainer.find('.thumbnail-container .thumbnail').css({ backgroundImage: 'url(' +  item.headshot.url + ')' });
      $itemContainer.find('.display-ranking').text(ranking.toString());
      $itemContainer.find('.sort-ranking').text(ranking);
      $itemContainer.find('.biography-container .biography p').text(item.charity.description);
      $itemContainer.find('.display-name-coach').text(item.name.first + ' ' + item.name.last);
      $itemContainer.find('.display-name-school').text(item.school.name);
      $itemContainer.find('.display-name-charity').text(item.charity.name);
      $itemContainer.find('.sort-name-coach').text(item.name.last);
      $itemContainer.find('.sort-name-school').text(item.school.slug);
      $itemContainer.find('.sort-name-charity').text(item.charity.name);
      $itemContainer.find('.display-result').text(pct + '%');
      $itemContainer.find('.sort-result').text(pct / 100.0);
      $itemContainer.find('[data-control-action="submit-vote"]').attr('href', '?' + href).attr('rel', params.medium);
      $ballotContainer.append($itemContainer.removeClass('template'));
    });
    //debug.groupEnd('coaches');
    return $(selector).remove();
  }
  
  function loadBallot(){
    var settings = {
      url: ballotUrl,
      type: 'GET',
      dataType: 'json',
      data: {
        active: 1,
        populate: 'coaches'
      }, 
      cache: false,
      success: function(data){
        $(document).trigger({ type:'ballotloaded', ballot: data });
        $(document).trigger({ type:'coachesloaded', coaches: data.coaches, ballotId: data._id });
      },
      error: function(jqXhr, textStatus, errorThrown){
        return debug.error('Error loading ballot [' + textStatus + ']: ' + errorThrown);
      }
    };
    return $.ajax(settings);
  }
  
  function loadCoaches(){
    var settings = {
      url: ballotUrl,
      type: 'GET',
      dataType: 'json',
      data: {
        active: 1,
        populate: 'coaches'
      }, 
      cache: false,
      success: function(data){
      	//console.log('Ballot: ', data);
      	//console.log('Coaches: ', data.coaches);
        return $(document).trigger({ type:'coachesloaded', coaches: data.coaches });
      },
      error: function(jqXhr, textStatus, errorThrown){
        return debug.error('Error loading ballot [' + textStatus + ']: ' + errorThrown);
      }
    };
    return $.ajax(settings);
  }
  
  function init(){
    if (!ballot){ loadBallot(); }
    //if (!coaches){ loadCoaches(); }
  }
  
  init();
  
});