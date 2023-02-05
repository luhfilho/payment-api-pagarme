function exists_and_has_value(value, key) {
    if (!value in key || key[value] == null || typeof (key[value]) == 'undefined' || key[value] == ' ' || key[value].length <= 0) {
        return false;
    }
    return true;
}

function merge_products_info (product, image, stock, type) {
    if(type == 'one product') {
        product['stock'] = stock;
        product['image'] = image;
        return product;
    } else {
        let product_result = [];
        for(let p in product) {
            let new_product = product[p];
            let images_list = [];
            let stocks_list = [];
            for(let s in stock){
                let new_stock = stock[s];
                if(new_product['_id'].toString() == new_stock['products_id'].toString()) {
                    stocks_list.push(new_stock);
                }
                new_product['stock'] = stocks_list;
            }
            for(let i in image){
                let new_image = image[i];
                if(new_product['_id'].toString() == new_image['products_id'].toString()) {
                    images_list.push(new_image);
                }
                new_product['image'] = images_list;
            }
            product_result.push(new_product);
        }
        return product_result;
    }
}

const capitalize = (str, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
;

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = {
    exists_and_has_value,
    merge_products_info,
    capitalize,
    formatDate,
}