

function BgtToNormal(){
 $(".bug-button").html('<img src="https://icon-library.com/images/icon-bug/icon-bug-7.jpg" style= "display: linline !important; height: 4em;">')
}

function bgtSubmit(e){
 $(".bug-button").text('Copied')
 $("#form").trigger("reset");
 $(".bug-button-wrapper").toggleClass("expanded");
 // Prevent reload page
 e.preventDefault();}

function SetUpBgt(){
 console.log("SETTING UP BUG"); 
var bgt_html = '<div class="bug-wrapper">\
<form action="javascript:void(0)"; class = "bug-list"; id="Bugform"; method="get">\
<label>Bug Template</label><br>\
<textarea type="text" rows="30" cols="50" id="bgt" name="bgt"></textarea ><br>\
<button class="copyBGT" type="button">Copy</button>\
</form>\
<button class="bug-button">\
<img src="https://icon-library.com/images/icon-bug/icon-bug-7.jpg" style= "display: linline !important; height: 2em; opacity: 0.5;">\
</button>\
</div>'



$("body").append($(bgt_html))


let reporturl = window.location.href.match(/(http.*\d{9})/)[1]
let guestOS =  $("#form1 > table.reportList > tbody > tr:nth-child(19) > td:nth-child(2)").text().replace(/Windows: |Linux: |: OS X /,'')
let hostOS = $("#form1 > table.reportList > tbody > tr:nth-child(13) > td:nth-child(2)").text()

var bugTemplate = `*Description of problem:*


*How reproducible:*
Frequency: ?/3
Local reproduction: reproducable/not reproducable/haven't tried.


*Steps to Reproduce:*
1. Run the virtual machine.


*Actual results:*


*Expected results:*
VM works fine

*Host OS:*
${hostOS}

*Guest OS:*
${guestOS}

*Report URL:*
${reporturl}

*Additional info:*
`


$("textarea#bgt").val(bugTemplate);

$('.copyBGT').click(function(e) {
  GM_setClipboard($("textarea#bgt").val())
  $(".bug-wrapper").toggleClass("expanded");
});

$(".bug-button").on("click", function() {
$(".bug-wrapper").toggleClass("expanded");
});

}

SetUpBgt()

