function SetUpBgt(niceReportObj) {
  console.log(niceReportObj);
  console.log("SETTING UP BUG TEMPLATE WIDGET");
  
  var bgt_html = '<div class="bug-wrapper">\
    <form action="javascript:void(0)" class="bug-list" id="Bugform" method="get">\
      <label>Bug Template</label><br>\
      <textarea type="text" rows="30" cols="50" id="bgt" name="bgt"></textarea><br>\
      <button class="copyBGT" type="button">Copy</button>\
      <div class="switch-wrapper">\
        <label class="switch">\
          <input type="checkbox" name="switch">\
          <span class="slider round"></span>\
        </label>\
        <span class="switch-label">Feature Request</span>\
      </div>\
    </form>\
    <button class="bug-button">\
      <img src="https://icon-library.com/images/icon-bug/icon-bug-7.jpg" style="display: inline !important; height: 2em; opacity: 0.5;">\
    </button>\
  </div>';
  
  $("body").append($(bgt_html));

  let reporturl = window.location.href.match(/(http.*\d{9})/)[1];
  let guestOS = `${niceReportObj.guestOS.type} ${niceReportObj.guestOS.version}`;
  
  if (niceReportObj.guestOS.type == 'Linux') {
    guestOS += niceReportObj.guestOS.kernel;
  }
  
  let hostOS

  try {
  hostOS = strToXmlToJson(bigReportObj.ParallelsProblemReport.HostInfo).ParallelsHostInfo.OsVersion.StringPresentation;
  }
  catch {
   hostOS = 'undefined'
  }

  var frTemplate = `**User story:**

  When I…
  
  I want to..
  
  So that..
  
  
  **Expected results:**
  
   
  **Actual results:**
  
  
  **Proposal:**
  

  **Report URL:**
  ${reporturl}
  
  **Additional information:**
  
  `
  
  var bugTemplate = `**Description of problem:**
  
  
  **How reproducible:**
  Frequency: ?/3
  Local reproduction: reproducible/not reproducible/haven't tried.
  
  
  **Steps to Reproduce:**
  1. Run the virtual machine.
  
  
  **Actual results:**
  
  
  **Expected results:**
  VM works fine
  
  **Host OS:**
  ${hostOS}
  
  **Guest OS:**
  ${guestOS}
  
  **Report URL:**
  ${reporturl}
  
  **Affected software**
  
  
  **Additional info:**
  `
  
  
  // Set initial template to bugTemplate
  $("textarea#bgt").val(bugTemplate);

  // Switch between bugTemplate and frTemplate based on switch position
  $("input[name='switch']").on("change", function() {
    if ($(this).is(":checked")) {
      $("textarea#bgt").val(frTemplate);
      $("textarea#bgt").attr("rows", 20);
    } else {
      $("textarea#bgt").val(bugTemplate);
      $("textarea#bgt").attr("rows", 30);
    }
  });
  
  $('.copyBGT').click(function(e) {
    GM_setClipboard($("textarea#bgt").val());
    $(".bug-wrapper").toggleClass("expanded");
  });
  
  $(".bug-button").on("click", function() {
    $(".bug-wrapper").toggleClass("expanded");
  });
}