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
 $(".help-button").html('<img src="http://icon-library.com/images/feedback-icon-png/feedback-icon-png-20.jpg" style= "display: linline !important; height: 4em;">')
}

function doSubmit(e){
  $.get(url, $('#form').serialize()+'&url='+curr_url)
 
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
<input type="radio" id="FR " name="type" value="FR">\
<a class = "left"><label for="FR">[FR]</label><br>\
<input type="radio" id="BUG" name="type" value="BUG">\
<label for="BUG">[BUG]</label><br></a>\
<label for="fname">Description</label><br>\
<textarea type="text" id="feedback" name="feedback"></textarea ><br>\
<button class="submit" type="submit">Submit</button>\
</form>\
<button class="help-button">\
<img src="http://icon-library.com/images/feedback-icon-png/feedback-icon-png-20.jpg" style= "display: linline !important; height: 4em; opacity: 0.5;">\
</button>\
</div>'}

else if (curr_url.match(/\=vm\.log/))///TESTTEXT
{
form_html = '<div class="help-button-wrapper">\
<form action="javascript:void(0)"; class = "help-list"; id="form"; method="get">\
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
$('#form').submit(function(e) {
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
var curr_url = window.location.href
var form_html


//window.addEventListener("load", function(event) {
 SetUpFeedback()
//});
