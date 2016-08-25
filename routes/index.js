var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({storage: storage});
var csv = require('csv');
var twitter = require('twitter');
var conf = require('../conf.json');
var DiskStorage = require('node-storage');
var cache = new DiskStorage('../../data/cache.json');

var tClient = new twitter({
    consumer_key: conf.consumerKey,
    consumer_secret: conf.consumerSecret,
    access_token_key: conf.accessToken,
    access_token_secret: conf.accessSecret
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Twitter Users Lookup Tool' });
});

router.post('/',upload.single('users'),function(req, res, next){
  if(req.file){
    csv.parse(req.file.buffer,function(err,csvdata){
        if(err){res.send(err)}
        else{
            if(csvdata){
                csvdata = flatten(csvdata).join();
                //poll twitter for user information
                getUsers(csvdata,function(err, user_data){
                    if(err){res.send(err)}
                    else{
                        cleanResults(user_data, function(err, clean_data){
                            if(err){res.send(err)}
                            else{
                                var stringify_options = {
                                    header: true,
                                    columns: {
                                        name: "User Name",
                                        screen_name: "Screen Name",
                                        id_str: "User ID",
                                        friends_count: "Friends Count",
                                        followers_count: "Followers Count",
                                        following: "Following",
                                        followed: "Followed"
                                    }
                                }
                                csv.stringify(clean_data, stringify_options, function(err,result){
                                    if(err){res.send(err)}
                                    else{
                                        res.attachment('results.csv');
                                        res.send(result);
                                    }
                                });
                            }
                        });
                    }

                })
            }else{
                res.send(new Error('No data'));
            }
        }
    })
  }else{
      res.send(new Error('Whoops, no file'));
  }
});

function flatten(a, r){
    if(!r){ r = []}
    for(var i=0; i<a.length; i++){
        if(a[i].constructor == Array){
            flatten(a[i], r);
        }else{
            r.push(a[i]);
        }
    }
    return r;
}

function cleanResults(results, callback){
    var output = [];
    loadFollowers(function(err, followers){
        if(err){
            callback(err);
        }
        if(results.constructor == Array){
            for(var i=0; i<results.length; i++){
                /**
                 * user_name
                 * screen_name
                 * user_id
                 * friends_count
                 * followers_count
                 * following
                 * followed (computed)
                 */
                var obj = {
                    name: results[i].name,
                    screen_name: results[i].screen_name,
                    id_str: results[i].id_str,
                    friends_count: results[i].friends_count,
                    followers_count: results[i].followers_count,
                    following: results[i].following,
                    followed: followers.indexOf(results[i].id_str) > 0 ? true : false,
                }
                output.push(obj);
            }
            callback(null, output);
        }else{
            callback(new Error('No results'));
        }
    });
}

function getUsers(user_list, callback){
    tClient.post('users/lookup',{'screen_name': user_list,'include_entities': false}, function(err, udata){
        if(err){
            callback(err);
        }else{
            callback(null, udata);
        }
    });
}

function getFollowers(callback, list, cursor){
    if(typeof list == 'undefined'){
        list = [];
    }
    tClient.get('followers/ids', {
            screen_name: conf.screenName,
            stringify_ids: true,
            cursor: cursor ? cursor : -1
        },
        function(err, friend_data){
            if(err){
                callback(err);
            }

            if(friend_data){
                list = list.concat(friend_data.ids);
                if(friend_data.next_cursor_str != 0 && friend_data.next_cursor_str != cursor){
                    //callback(null, list);
                    getFollowers(callback, list, friend_data.next_cursor_str);
                }else{
                    callback(null, list);
                }
            }else{
                callback(null, list);
            }
        }
    );
}

function loadFollowers(callback){
    var followers = cache.get('followers');
    //see if cache is still good
    if(followers && followers.time > (Date.now() - 900000) ){
        console.log('from cache');
        callback(null, followers.data);
    }else{
        getFollowers(function(err, list){
            console.log('got new');
            cache.put('followers',{
                time: Date.now(),
                data: list
            });
            callback(null, list);
        });
    }
}

module.exports = router;
