var http = require('http');
var url = require('url');
var superagent = require('superagent');
var async = require('async');
var cheerio = require('cheerio');

var findPage = (pn, callback) => {
    superagent
        .get(`http://tieba.baidu.com/f?kw=太原科技大学&ie=utf-8&pn=${pn}`)
        .end( (err, res) => {
            if (res && res.ok) {
                var $ = cheerio.load(res.text);
                var thread_list = $('.j_thread_list');
                // method 1
                thread_list.each(function(index, el) {
                    el = $(el);
                    var data_field = JSON.parse(el.attr('data-field'));
                    var title = el.find('a.j_th_tit').text();
                    var text = el.find('.threadlist_abs_onlyline').text();

                    Object.assign(data_field, {title, text});
                    callback(data_field);
                });
            } else {
                console.log(res.text);
            }
        });
}

var startFind = () => {
    var pageList = [];
    for (var i=0; i<80; i++) {
        pageList.push(i*50)
    }
    console.time('spider');
    async.mapLimit(pageList, 12, (page, callback) => {
        console.log('enter:', page);
        findPage(page, (data) => {
            console.log(data);
            try{
                callback(null, page);
            }catch(e){
                if (e.message !== 'Callback was already called.')
                    throw new Error(e);
            }
        });
    }, (err, results) => {
        console.log('err', err);
        console.log('results', results);
        console.timeEnd('spider');
    });
};

var start = () => {
    startFind();
}

export {start, startFind}