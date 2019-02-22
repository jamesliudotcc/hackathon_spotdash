$(window).load(function() {
  // Animate loader off screen
  $(".se-pre-con").fadeOut("slow");;
});

$(document).ready(function(){
  // alert window auto disappear
  $("#success-alert").fadeTo(2000, 500).slideUp(500, function(){
      $("#success-alert").alert('close');
  });
  // materialize side menu on mobile
  $('.sidenav').sidenav();
  // materialize carousel
  $('.carousel').carousel({fullWidth: true});
  setInterval(function() {
      $('.carousel').carousel('next');
  }, 3000);
});

$(document).ready(function(){
  $('.collapsible').collapsible();
});