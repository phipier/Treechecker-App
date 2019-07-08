function isNumberKey(evt)
{
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31
    && (charCode < 48 || charCode > 57))
    return false;
    return true;
}

function displayMessage(message, action_OK, action_cancel) {
    if(document.getElementById("messagepopupdata").getElementsByTagName('p').length > 0) {
        $("#messagepopupdata>p").html("");
    }
    $("#messagepopupdata").prepend("<p><i class='fas'></i> " + message + "</p>");
    $('#messagepopup').modal('show');   
    $("#ok_sent").click(()=>{action_OK();$("#messagepopup").modal("hide");});    
    if (typeof action_cancel === 'undefined')   {$("#cancel_sent").hide();}
    else                                        {$("#cancel_sent").click(()=>{action_cancel();$("#messagepopup").modal("hide");});}
}