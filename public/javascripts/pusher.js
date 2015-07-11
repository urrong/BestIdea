var sendNotification = function(){

    // get the contents of the input
    var text = $('input.create-notification').val();

    // POST to our server
    $.post('/notification', {message: text}).success(function(){
        console.log('Notification sent!');
    });
};

$('button.submit-notification').on('click', sendNotification);