$(document).on("click","#btn_open", function(){
    chrome.runtime.sendMessage({"message": "open_data"});
    console.log("message:open_data");
})