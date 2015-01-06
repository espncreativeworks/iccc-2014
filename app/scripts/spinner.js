(function(w,d,m){
  var s, ivl;
  
  s = d.createElement('script');
  s.async = true;
  s.type = 'text/javascript';
  s.src = window.location.protocol + '//cdnjs.cloudflare.com/ajax/libs/spin.js/1.3.2/spin.min.js';
  
  s.onload = function(){
    var opts
      , target
      , messageContainer
      , message
      , c = 0;
    
    if ( typeof w.spnnr !== 'undefined' ){
      return w.spnnr;
    }
    
    opts = {
      lines: 13, // The number of lines to draw
      length: 10, // The length of each line
      width: 5, // The line thickness
      radius: 15, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#1a2227', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };
    
    target = d.createElement('div');
    messageContainer = d.createElement('div');
    message = d.createElement('p');
    
    target.className = 'spinner-container';
    messageContainer.className = 'loading-message-container';
    message.className = 'loading-message';
    
    message.innerHTML = 'loading';
    message.update = function update(){
      var dots
        , re = /\./g;
      
      c++;
      dots = this.innerHTML.match(re);
      
      if (!dots){
        this.innerHTML += ' .';
        return;
      } 
      
      if (c % 12 === 0){
        //debug.log(dots);
      }
      
      if (dots.length >= 3){
        this.innerHTML = 'loading';
        return;
      } else {
        this.innerHTML += '.';
        return;
      }
    };
    
    //messageContainer.appendChild(heading);
    messageContainer.appendChild(message);
    ivl = setInterval((function (m){ return function(){ return m.update(); }; })(message), 1250);
    setTimeout((function (i){ return function(){ return clearInterval(i); }; })(ivl), 10000);
    target.style.height = m.availHeight;
    target.appendChild(messageContainer);
    target = d.body.insertBefore(target,d.body.childNodes[0]);
    w.spnnr = new Spinner(opts).spin(target);
    return w.spnnr;
  };
  
  d.getElementsByTagName('head')[0].appendChild(s);
  return s;

})(window,document,screen);