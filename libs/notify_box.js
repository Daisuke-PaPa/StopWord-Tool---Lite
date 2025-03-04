function showStatusNotification(message, showCloseButton = true) {
    M.toast({html: message, classes: 'rounded', displayLength: 4000} );
}