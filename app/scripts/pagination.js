function getCurrentSortSelector(){
  var currentOption = $('#sorting-input').find(':selected').val()
    , selector = ''
  ;
  
  selector = $('#options').find('[data-control-action="sort"][data-option-value="' + currentOption + '"]').attr('data-sort');
  debug.log('getCurrentSortSelector() = ' + selector);
  return selector;
}

function getCurrentSortSelectorDesktop(){
  var desktopCurrentOption = $('#sorting-input-desktop').find(':selected').val()
    , selector = ''
  ;

  desktopSelector = $('#options-desktop').find('[data-control-action="sort"][data-option-value="' + currentOption + '"]').attr('data-sort');
  return desktopSelector;
}

function findFirstIndexOf(letter, selector){
  var firstIndex = 0;
  letter = letter.toLowerCase();
  $('#phone-content-container .ballot .' + selector).each(function(i, $el){
    if ( letter.localeCompare( $el.text().slice(0,1).toLowerCase() <= 0 ) ){
      firstIndex = i;
    }
    return false;
  });
  debug.log('findFirstIndexOf(' + letter + ', ' + selector + ') = ' + firstIndex);
  return firstIndex;
}

function currentSlideIsInRange(startLetter, endLetter, selector){
  var result = false 
    , currentSlide = $('.ios-slider').data('args', 'currentSlideObject')
    , sortedByLetter = $(currentSlide).find(selector).first().text().slice(0,1).toLowerCase()
  ;
  
  startLetter = startLetter.toLowerCase();
  endLetter = startLetter.toLowerCase();
  result = ( startLetter.localeCompare( sortedByLetter ) <= 0 && endLetter.localeCompare( sortedByLetter ) > 0 );
  
  debug.log('currentSlideIsInRange(' + startLetter +  ', ' + endLetter + ', ' + selector + ') = ' + result);
  return result;
}

function updatePagination($scope){
  if (!$scope.parent().hasClass('active')){
    $('.pagination li').removeClass('active');
    return $scope.parent().addClass('active');
  }
}

$('.pagination').on('click', '[data-control-action="paginate"]', function(e){
  e.preventDefault();
  
  var $this = $(this)
    , startLetter = $this.attr('data-page-start')
    , endLetter = $this.attr('data-page-end')
    , currentSelector = getCurrentSortSelector()
  ;
  
  if ( !currentSlideIsInRange(startLetter, endLetter, currentSelector) ){
    var pageToIndex = findFirstIndexOf(startLetter, currentSelector);
    $('.ios-slider').iosSlider('goToSlide', pageToIndex).iosSlider('update');
    updatePagination($this);
  }
});
