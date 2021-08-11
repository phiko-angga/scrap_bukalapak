class storage {
  
  get() {
    chrome.storage.local.get(null, function (items) {
        var allKeys = Object.keys(items);
        if (allKeys.length != 0) {
            getProduct = JSON.parse(items["product"]);
            
            return new Promise(function (resolve, reject) {
                resolve(getProduct);
              })
        } else {
            // SendResponse(false);
        }
      });
  }

  async load() {
    let get_product = await this.get();
    return new Promise(function (resolve, reject) {
        resolve(get_product);
      })
  }

}
