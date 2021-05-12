let getMacSpecsDatabase = new Promise (function(){
  let macDataBaseUrl = "https://docs.google.com/spreadsheets/d/1lmcn0aRxolP5eXfsuaekRFcMl7dAFjxTe9ItQEUOarM/gviz/tq?tqx=out:csv&sheet=Database"
  $.get(macDataBaseUrl, function ldd(data) {
    resolve(data)
    })
})

function doReportOverview() {
   getMacSpecsDatabase.then(function(data){
     let macDatabase = googleCsv2JsonMacModels(data)
     computerModel(macDatabase);
   })
 
   