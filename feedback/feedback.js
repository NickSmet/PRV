css_feedback = ['https://codepen.io/nicksmet-the-vuer/pen/XWbNxLB.css']


// for (i in css_feedback){
//     var addStyle = css_feedback[i]
//     if ($('head').html().match(addStyle)){
//       console.log('skipping css, since already present: '+ addStyle)
//       continue}
//     else
//     {$('head').append('<link rel="stylesheet" type="text/css" href="'+addStyle+'">');
//   }
//   }

var curr_rvmain
var curr_vmLog_prod = /Log\.aspx\?ReportId/
var curr_vmLog_test = /vm\.log\.html/

var curr_vmLog = curr_vmLog_prod


function hideBug(x) {
  if (x.checked) {
    $('#bugDiv').attr('style', 'display: none !important');
    $('#knowhowDiv').attr('style', 'display: inline-block !important');
  }
}

function hideKnowHow(x) {
  if (x.checked) {
    $('#bugDiv').attr('style', 'display: inline-block !important');
    $('#knowhowDiv').attr('style', 'display: none !important');
  }
}

function FeedbackToNormal(){
 $(".help-button").html('<img src="http://icon-library.com/images/feedback-icon-png/feedback-icon-png-20.jpg" style= "display: linline !important; height: 4em;opacity: 0.5">')
}

function doSubmit(e){
  console.log($('#form.help-list').serialize())
  $.get(url, $('#form.help-list').serialize()+'&url='+curr_url.replace("&","%26"))//because url contains '&' which is '%26' in curl (otherwise everything after & is percieved as next parameter)
 
 setTimeout(FeedbackToNormal, 1000);

 $(".help-button").text('Spasiba! :D')
 $("#form").trigger("reset");
 $(".help-button-wrapper").toggleClass("expanded");
 // Prevent reload page
 e.preventDefault();
}

function SetUpFeedback(){
 if(curr_url.match(/Report.aspx\?ReportId/))
{ form_html = '<div class="help-button-wrapper">\
<form action="javascript:void(0);"; class = "help-list"; id="form" method="get">\
<label> Report #'+curr_url.match(/ReportId=(\d+)/)[1]+'</label><br>\
<div class = "left"><input type="radio" id="FR " name="type" value="FR">\
<label for="FR">[FR]</label><br>\
<input type="radio" id="BUG" name="type" value="BUG">\
<label for="BUG">[BUG]</label><br></div>\
<label for="fname">Description</label><br>\
<textarea type="text" id="feedback" name="feedback"></textarea ><br>\
<button class="submit" type="submit">Submit</button>\
</form>\
<button class="help-button">\
<img src="http://icon-library.com/images/feedback-icon-png/feedback-icon-png-20.jpg" style= "display: linline !important; height: 4em; opacity: 0.5;">\
</button>\
</div>'}

else if (curr_url.match(curr_vmLog))
{
form_html = '<div class="help-button-wrapper">\
<form action="javascript:void(0)"; class = "help-list"; id="form"; method="get">\
<label> Log for report #'+curr_url.match(/ReportId=(\d+)/)[1]+'</label><br>\
<div class = "left"><input type="radio"; id="knowhow"; name="type"; value="Knowhow"; checked>\
<label for="knowhow">[KnowHow]</label><br>\
<input type="radio"; id="BUG"; name="type"; value="BUG">\
<label for="BUG">[BUG]</label><br></div>\
<div id="knowhowDiv">\
Log code\
<textarea type="text" id="feedback" name="lines"></textarea ><br>\
Its meaning\
<textarea type="text" id="feedback" name="meaning"></textarea ><br></div>\
<div id="bugDiv" style="display:none">\
Bug description<br>\
<textarea type="text" id="feedback" name="feedback"></textarea >\
</div>\
<button class="submit" type="submit">Submit</button>\
</form>\
<button class="help-button">\
<img src="http://icon-library.com/images/feedback-icon-png/feedback-icon-png-20.jpg" style= "display: linline; height: 4em; opacity: 0.5;">\
</button>\
</div>'}

$("body").append($(form_html))
$('.submit').click(function(e) {
doSubmit(e)
});


$("#BUG").on("change", function() {
hideKnowHow(this);
});

$("#knowhow").on("change", function() {
hideBug(this);
});

$(".help-button").on("click", function() {
$(".help-button-wrapper").toggleClass("expanded");
});

}

var url = "https://script.google.com/macros/s/AKfycbyIieYDWx-25wYZmpEuB4o8j6Tj03c_MjIoMIes/exec"
var curr_url
var form_html


window.addEventListener("load", function(event) {
curr_url = window.location.href
 SetUpFeedback()
});
