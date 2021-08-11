var parent_btn_scrap;
var parent2_btn_scrap;
var parent_item;
var list_item;
var list_itemA              = [];
var list_product            = [];
var list_product_raw        = [];
var list_product_total      = 0;
var parent_item_found       = false;
var product_list_page_url   = window.location.href;
var url_payload_productlist = null;
var total_page              = 0;
var curr_pagination         = -1;
var total_pagination        = -1;
var access_token            = "";
var url_detail_product      = "https://api.bukalapak.com/products/get_id_product?access_token=get_access_token";
var table;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if( request.message === "user" ) {

        console.log(request);
		
        if(request.url_payload_productlist !== "undefined" && request.url_payload_productlist !== null){
          url_payload_productlist = request.url_payload_productlist;
          var url           = new URL(url_payload_productlist);
          var get_ac_token  = url.searchParams.get("access_token");
          access_token      = get_ac_token;
          // console.log('url_payload_productlist : '+url_payload_productlist+"|"+get_ac_token);
        }

        add_btn_scrap("user");
                
      }else
      if( request.message === "product" ) {
        // console.log('product:response');
        add_btn_scrap("product");
      }

    }
  );

  $(document).on("click","#btn_load_product",function(){

    chrome.storage.local.get(null, function (items) {
      var allKeys = Object.keys(items);
      if (allKeys.length != 0) {
          getProduct = JSON.parse(items["product"]);
          
          show_product(getProduct);
      } else {
          // SendResponse(false);
      }
    });
    
  })

  $(document).on("click","#btn_scrap_user",function(){

    // Open scrap modal 
    if($("#scrap_modal").length === 0){   
      let progress_scrap = create_modal_scrap();
      $("body").append(progress_scrap);
    }

    $("#scrap_modal").modal("show");

    scrap_productlist_allpage(total_pagination);
  })

  //---------------- Function -----------------
  function add_btn_scrap(type){
    parent_btn_scrap    = $("#merchant-page-product-list");
    parent2_btn_scrap   = parent_btn_scrap.parent();

    if(!parent2_btn_scrap.find("#btn_scrap_user").length){
        
      if(type == "user"){
        // var parent_pagination = $(".c-pagination");
        var parent_pagination = parent_btn_scrap.children().eq(1).children().eq(2).children().children();
		
        curr_pagination       = parseInt(parent_pagination.find(".is-current").text());
        total_pagination      = parseInt(parent_pagination.children().length) - 2;

          //get parent item
          parent_item = parent2_btn_scrap.children().children().eq(1).children().eq(1);
          
          //get list item
          list_item   = parent_item.children();

          //add button scrap
          var add_btn = '<div class="row pt-3 pb-3"><div class="col-6"><button type="button" id="btn_scrap_user" class="btn btn-info w-100">Scrap Data</button></div></div>';
          parent2_btn_scrap.prepend(add_btn);
          create_modal();

      }else
      if(type == "product"){

      }
    }
  }
  
  function makeRequest(url) {
    return new Promise(function (resolve, reject) {
      let xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                loadFromUrl_cache = JSON.parse(xmlhttp.responseText);
                resolve(loadFromUrl_cache.data);
            } else {
              reject("url not Found");
              console.log('ERROR, something else other than status 200:'+xmlhttp.status);
            }
          }
      };
      xmlhttp.open("GET", url, true); // async
      xmlhttp.send();
    })
  }

  async function updatePageBar(total_page, page, valuemax){
    await delay();
    $(".progress-page").text("Page : "+page+"/"+total_page);
    // $(".progress-bar").attr("aria-valuemax",valuemax);
    console.log("updatePageBar"+total_page+"|"+page+"|"+valuemax);
  
  }

  async function updateLabel(bar, label){
    
    let myPromise = new Promise(function(myResolve, myReject) {
      myResolve(label);
    });
    let glabel = await myPromise;
    if(glabel === "finish")
      $(".progress-label").append("<p>>>>>>>>>>>>>>>>>>>>>>>>> Completed <<<<<<<<<<<<<<<<<<<<</p>");
    else
      $(".progress-label").append("<p>Scrapping product >>> "+glabel+"</p>");
    
  
  }

  function delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
  
  async function scrap_productlist_req(total_page) {
    
      for (var i = 1; i <= total_page; i++) {
        
        // url format : https://api.bukalapak.com/stores/86656103/products?offset=32&limit=16&sort=bestselling
        // &access_token=5DvJcOOpYcKvZhPqmQfAFToAB0GKH9J2TJzwGemcMmH91A
        var url        = url_payload_productlist;
        var pat_offset = /offset=\d+/;
        var result_offset = url.match(pat_offset);

        if(result_offset !== ""){
          url = url.replace(result_offset, "offset="+((i-1)*16));
        }
        // await code here
        let get_productlist = await makeRequest(url);
        // console.log(get_productlist);
        
        // update the DOM
        updatePageBar(total_page, i, get_productlist.length);
        // update the DOM

        let index = 0;
        $.each(get_productlist, function(v, i){
          ++index;
          var data = { 
            "id": i.id, 
            "url": i.url,
            "name": i.name,
            "price": i.price,
            "sku_id": i.sku_id,
            "state": i.state,
            "stock": i.stock,
            "description": i.description,
            "images1": i.images.large_urls[0],
            "images2": i.images.large_urls[1],
            "images3": i.images.large_urls[2],
            "images4": i.images.large_urls[3],
            "images5": i.images.large_urls[4],
            "min_quantity": i.min_quantity,
            "video_url": i.video_url,
            "category_id": i.category.id,
            "category_name": i.category.name,
            "condition": i.condition,
            "weight": i.weight,
          };
          // console.log(i);
          list_product.push(data);
          ++list_product_total;

          // update the DOM
          updateLabel(index, i.name);
          // update the DOM
          //update progress

        })
        
        list_product_total = list_product_total + get_productlist.length;
        
        updateLabel(list_product_total, "finish");
      }
    
    return new Promise(function (resolve, reject) {
      resolve(list_product_total);
    })
  }

  async function scrap_productdetail_req(url) {
    // await code here
    // console.log(url);
    let get_detail = await makeRequest(url);
      // console.log(get_detail);
  }

  async function scrap_productlist_allpage(total_page){
	  console.log('total_page :'+total_page);
    
    let product_total = await scrap_productlist_req(total_page);
    list_product_total = product_total;
    
    // Get data
    chrome.storage.local.get(null, function (items) {
      var allKeys = Object.keys(items);
      if (allKeys.length != 0) {
          getProduct = JSON.parse(items["product"]);
          
          setStorageProduct(list_product, getProduct);
      } else {
          // SendResponse(false);
          setStorageProduct(list_product, []);
      }
    });
  }

  async function setStorageProduct(newData, oldData){
    var updateProduct;
    var getProduct = [];

    // Mengambil data di storage
    getProduct = oldData;

    // Update data dari storage dengan hasil scrap terbaru
    if(getProduct.length){

      //check exists data
      var t_newData = []; 
      let index = 0;

      $.each(newData,function(v,i){
        ++index;
        // if(typeof i.id !== 'undefined'){
          // let id = i.id;
          // console.log(index+' : '+i.id);
          const found = getProduct.some(el => el.id == i.id);
          // console.log(index+' : '+found);
          if (!found) {
            // newData.splice(v, 1); 
            t_newData.push(i); 
          
            // console.log(newData[v]);
          }
          // console.log(i);
        // }
      })
      // console.log(t_newData);

      if(t_newData.length)
        updateProduct = getProduct.concat(t_newData);

    }else{
      updateProduct = newData;
    }
    chrome.storage.local.set({product: JSON.stringify(updateProduct)}, function() {
    });
  }
  
  function create_modal(){

    if(!$("#result_modal").length){
      var text = '<div class="modal" id="result_modal">'+
        '<div class="modal-dialog modal-lg">'+
          '<div class="modal-content">'+
      
            '<!-- Modal Header -->'+
            '<div class="modal-header">'+
              '<h4 class="modal-title">Hasil Scrap</h4>'+
              '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
            '</div>'+
            '<!-- Modal body -->'+
            '<div class="modal-body">'+
              '<div class="table-responsive">'+
                '<table id="example" class="table table-striped table-bordered" style="width:100%">'+
                  '<thead>'+
                      '<tr>'+
                          '<th>Name</th>'+
                          '<th>Category</th>'+
                          '<th>Stock</th>'+
                          '<th>price</th>'+
                          '<th>Condition</th>'+
                          '<th>State</th>'+
                          '<th>Image 1</th>'+
                          '<th>Image 2</th>'+
                          '<th>Image 3</th>'+
                          '<th>Image 4</th>'+
                          '<th>Image 5</th>'+
                          '<th>Video</th>'+
                      '</tr>'+
                  '</thead>'+
                  '<tbody id="result_productlist">'+
                  '</tbody>'+
                '</table>'+
              '</div>'+
            '</div>'+
      
            '<!-- Modal footer -->'+
            '<div class="modal-footer">'+
              '<button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>'+
            '</div>'+
      
          '</div>'+
        '</div>'+
      '</div>';
      $("body").append(text);
      
    }

  }
  
  
  function create_modal_scrap(){

      var text = '<div class="modal" id="scrap_modal">'+
        '<div class="modal-dialog modal-lg">'+
          '<div class="modal-content">'+
      
            '<!-- Modal Header -->'+
            '<div class="modal-header">'+
              '<h4 class="modal-title">Scrapping</h4>'+
              '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
            '</div>'+
            '<!-- Modal body -->'+
            '<div class="modal-body">'+
              '<h5 class="card-title">Progress Scrapping</h5>'+
              '<div class="mb-3 progress">'+
                '<div class="progress-bar progress-bar-animated progress-bar-striped" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
              '</div>'+
              '<div class="text-left progress-page"></div>'+
              '<div class="text-left progress-label" style="max-height: 320px;overflow-y:scroll"></div>'+
            '</div>'+
      
            '<!-- Modal footer -->'+
            '<div class="modal-footer">'+
              '<button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>'+
            '</div>'+
      
          '</div>'+
        '</div>'+
      '</div>';
      return text;
  }
  
  function show_product(product){

    // add to modal
    $("#result_productlist").empty();
    $.each(product, function(v, i){
      var add_product = '<tr>'+
                          '<td>'+i.name+'</td>'+
                          '<td>'+i.category_name+'</td>'+
                          '<td>'+i.stock+'</td>'+
                          '<td>'+i.price+'</td>'+
                          '<td>'+i.condition+'</td>'+
                          '<td>'+i.state+'</td>'+
                          '<td>'+i.images1+'</td>'+
                          '<td>'+i.images2+'</td>'+
                          '<td>'+i.images3+'</td>'+
                          '<td>'+i.images4+'</td>'+
                          '<td>'+i.images5+'</td>'+
                          '<td>'+i.video_url+'</td>'+
                      '</tr>';
        $("#result_productlist").append(add_product);
    })
    
    table = $('#example').DataTable({
      // dom: 'Bfrtip',
      // buttons: [
      //     'copy', 'csv', 'excel', 'pdf', 'print'
      // ]
    });
    $("#result_modal").modal("show");
  }