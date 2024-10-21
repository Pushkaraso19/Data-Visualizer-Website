$(document).ready(function() {
    // Set initial opacity to 0
    $('body').css('opacity', 0);

    // Fade in effect on load
    $(window).on('load', function() {
        $('body').fadeTo(500, 1); // Fade in over 500ms
    });
});
