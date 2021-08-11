$(document).on("click","#new_patern",function(){
    let child   = template_word_change();
    var parent  = $("#word_replace");
    parent.append(child);
})

$(document).on("click","#save_change",function(){
    let mark_price          = $("#mark_price").val();
    let mark_price_jenis    = $("input[name='mark_price_jenis']:checked").val();
    let random_main_img     = $("input[name='random_main_img']:checked").val();
    let word_replace        = $("#word_replace");
    
    var config    = {};
    config.patern = [];
    config.mark_price       = mark_price;
    config.mark_price_jenis = mark_price_jenis;
    config.random_main_img  = random_main_img;

    patern = word_replace.children();
    patern.each(function(){
        let word    = $(this).find("#patern_word").val();
        let change  = $(this).find("#patern_change").val();
        config.patern.push({word:word,change:change});
    })

    chrome.storage.local.set({config: JSON.stringify(config)}, function() {
    });
})

function get_config_storage(){

    chrome.storage.local.get(null, function (items) {
        var allKeys = Object.keys(items);
        if (allKeys.length != 0) {
            config = JSON.parse(items["config"]);
            
            show_config(config);
        } else {
            // SendResponse(false);
        }
    });
}

function show_config(config){
    // load price markup
    $("#mark_price").val(config.mark_price);
    var price_jenis = config.mark_price_jenis;
    if(price_jenis == "percent"){
        $("#mark_price_percent").attr("checked",true);
    }else{
        $("#mark_price_rp").attr("checked",true);
    }

    // load random img
    var random = config.random_main_img;
    if(random == 1){
        $("#random_main_img_e").attr("checked",true);
    }else{
        $("#random_main_img_d").attr("checked",true);
    }
    
    // load patern
    var patern = config.patern;
    var parent = $("#word_replace");
    var child = "";
    $.each(patern, function(i, v){
        child += template_word_change(v.word, v.change);
    })
    parent.empty();
    parent.append(child);

}


function template_word_change(word = "", change = ""){
    let temp = '<div>'+
                    '<div class="row">'+
                        '<div class="col-md-6">'+
                            '<div class="input-group">'+
                                '<div class="input-group-prepend"><span class="input-group-text">Word Patern</span>'+
                                '</div>'+
                                '<input value="'+word+'" placeholder="ex: bukalapak" type="text" id="patern_word" class="form-control">'+
                            '</div>'+
                        '</div>'+
                        '<div class="col-md-6">'+
                            '<div class="input-group">'+
                                '<div class="input-group-prepend"><span class="input-group-text">Change With</span></div>'+
                                '<input value="'+change+'" id="patern_change" placeholder="ex: tokopedia" type="text" class="form-control">'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>';
    return temp;
}