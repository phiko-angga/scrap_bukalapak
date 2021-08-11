$("body").on("click","#btn_excel", function(){
    load_product_export();
})

$(document).ready(function(){
    get_datascrap_storage();
})

function get_datascrap_storage(){

    chrome.storage.local.get(null, function (items) {
        var allKeys = Object.keys(items);
        if (allKeys.length != 0) {
            getProduct = JSON.parse(items["product"]);
            
            show_product(getProduct);
        } else {
            // SendResponse(false);
        }
    });
}

function show_product(product){
    // add to modal
    $("#result_productlist").empty();
    $.each(product, function(v, i){
    var add_product = '<tr>'+
                        '<td>'+i.id+" : "+i.name+'</td>'+
                        '<td>'+i.category_name+'</td>'+
                        '<td>'+i.stock+'</td>'+
                        '<td>'+i.price+'</td>'+
                        '<td>'+i.condition+'</td>'+
                        '<td>'+i.state+'</td>'+
                    '</tr>';
        $("#result_productlist").append(add_product);
    })

    table = $('#example').DataTable({
    dom: '<"html5buttons">Bfrtip',
    buttons: [
        {extend: 'excel', title: 'Data Scrap'},
    ]
    });
}

function load_product_export(){
    
    chrome.storage.local.get(null, function (items) {
        var allKeys = Object.keys(items);
        if (allKeys.length != 0) {
            getProduct = JSON.parse(items["product"]);
            
            fnExcelReport(getProduct);
        } else {
            // SendResponse(false);
        }
    });
}

function show_product_export(product){
    var getConfig = (function() {
        return new Promise(function(resolve) {
            chrome.storage.sync.get(function(result) {
                resolve(result);
            });
            chrome.storage.local.get(null, function (items) {
                var allKeys = Object.keys(items);
                if (allKeys.length != 0 && typeof value !== "undefined") {
                    config = JSON.parse(items["config"]);
                    
                    resolve(config);
                } else {
                    // SendResponse(false);
                }
            });
        });
    })();

    return new Promise(function (resolve, reject) {
        $("#table-export-row").empty();
        $.each(product, function(v, i){

            //Config Replace
            let description = i.description;
            let patern      = config.patern;
            $.each(patern, function(i, v){
                var regex   = new RegExp(v.word, "g");
                description = description.replace(regex, v.change);
            })

            // config markup price
            let price   = i.price;
            if(config.mark_price_jenis === "percent")
                price   = parseFloat(i.price)+(parseFloat(i.price)*parseFloat(config.mark_price)/100);
            else if(config.mark_price_jenis === "rp")
                price   = parseFloat(i.price)+parseFloat(config.mark_price);

            // config random image 
            let images = [];
            images.push(i.images1);
            images.push(i.images2);
            images.push(i.images3);
            images.push(i.images4);
            images.push(i.images5);
            if(config.random_main_img == "1"){
                shuffle(images);
            }

            var add_product = '<tr>'+
                                '<td></td>'+
                                '<td>'+i.name+'</td>'+
                                '<td>'+description+'</td>'+
                                '<td>'+i.category_id+'</td>'+
                                '<td>'+i.weight+'</td>'+
                                '<td>'+i.min_quantity+'</td>'+
                                '<td></td>'+
                                '<td></td>'+
                                '<td>'+i.condition+'</td>'+
                                '<td>'+images[0]+'</td>'+
                                '<td>'+images[1]+'</td>'+
                                '<td>'+images[2]+'</td>'+
                                '<td>'+images[3]+'</td>'+
                                '<td>'+images[4]+'</td>'+
                                '<td>'+i.video_url+'</td>'+
                                '<td></td>'+
                                '<td></td>'+
                                '<td>'+i.sku_id+'</td>'+
                                '<td>'+i.state+'</td>'+
                                '<td>'+i.stock+'</td>'+
                                '<td>'+price+'</td>'+
                                '<td></td>'+
                            '</tr>';
                $("#table-export-row").append(add_product);
        })
        resolve(1);
    })
    
}
    
async function fnExcelReport(getProduct)
{
    let results = await show_product_export(getProduct);

    if(results == 1){
        var tab_text="<table border='2px'><tr bgcolor='#87AFC6'>";
        var textRange; var j=0;
        tab = document.getElementById('table-export'); // id of table

        for(j = 0 ; j < tab.rows.length ; j++) 
        {     
            tab_text=tab_text+tab.rows[j].innerHTML+"</tr>";
            //tab_text=tab_text+"</tr>";
        }
        tab_text=tab_text+"</table>";
        // tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
        // tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
        // tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
        // tab_text= tab_text.replace(/<br>/g, "<br style='mso-data-placement:same-cell;' />");
        tab_text= tab_text.replace(/<br>/g, " ");

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE "); 

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
        {
            txtArea1.document.open("txt/html","replace");
            txtArea1.document.write(tab_text);
            txtArea1.document.close();
            txtArea1.focus(); 
            sa=txtArea1.document.execCommand("SaveAs",true,"Data Scrap.xls");
        }  
        else                 //other browser not tested on IE 11
            sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));  

        return (sa);
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  