jQuery(document).ready(function($){

  $('.search-icon i').on('click', function(){
    if ( $('#ballot-search').css('visibility') == "hidden" ) {
      $('#ballot-search').css("visibility", "visible");
    } else {
      $('#ballot-search').css("visibility", "hidden");
    }
  });

  $('#ballot-search').hideseek();

});