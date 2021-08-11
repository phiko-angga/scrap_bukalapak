$(document).ready(function(){
  $( "#content" ).load( "datascrap.html .app-main__inner" );
});

$(document).on("click","#listmenu", function(){
  ele = $(this).data("html");
  if(ele === "datascrap"){
    $( "#content" ).empty();
    $( "#content" ).load( "datascrap.html .app-main__inner" );

    setTimeout(() => {
      get_datascrap_storage();
    }, 100);

  }else
  if(ele === "config"){

    $( "#content" ).empty();
    $( "#content" ).load( "config.html .app-main__inner" );

    setTimeout(() => {
      get_config_storage();
    }, 100);
  }
})