/**
 * Created by MrDeng on 2015/6/7.
 */
var express = require('express');
var url = require('url');
var date = require('../utils/date');
var datautils = require('../utils/datautils');
var daoutil = require('../db/daoutil');
var initial = require('../services/visitors/initialData');
var map = require('../utils/map');
var api = express.Router();
var dao = require('../db/daos');
var schemas = require('../db/schemas');
var randstring = require('../utils/randstring');
var querystring = require('querystring');
var async = require('async');


// ================================= eventchnage_list ===============================
/**
 *事件转化目标
 */
api.get("/eventchnage_list", function (req, res) {
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var schema_name = "event_change_model";//设置选择schemas Model名称
    switch (type) {
        case "save":
            var entity = query['entity'];
            var temp = JSON.parse(entity);
            temp.update_time = new Date().getTime();
            dao.save(schema_name, temp, function (ins) {
                datautils.send(res, JSON.stringify(ins));
                if (ins != null) {
                    var qry = {//用户ID+站点ID+页面URL
                        uid: ins.uid,
                        root_url: ins.root_url,
                        event_page: ins.event_page
                    }
                    dao.find(schema_name, JSON.stringify(qry), null, {}, function (err, docs) {//查询所有配置
                        if (docs != null && docs.length > 0) {//存在配置
                            var confs = [];
                            docs.forEach(function (item) {
                                var event_config = {
                                    eid: item.event_id,//事件ID
                                    evttag: item.event_name,//事件名称
                                    evpage: item.event_page,//事件页面
                                    evtarget: item.event_target,//是否为转化目标
                                    evpause:item.event_status==0?true:false,
                                    evtime: item.update_time//转化修改时间
                                };
                                confs.push(event_config);
                            });

                            var tempRef = ins.event_page
                            if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                                tempRef = tempRef.substring(7, tempRef.length)
                            if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                                tempRef = tempRef.substring(8, tempRef.length)
                            if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                                tempRef = tempRef.substring(0,tempRef.length-1)
                            }
                            //consolelog("save 刷新Redis：" + ins.root_url + ":e:" + tempRef + " = " + JSON.stringify(confs))
                            req.redisclient.multi().set(ins.root_url + ":e:" + tempRef, JSON.stringify(confs)).exec();
                        }
                    });
                }
            });
            break;
        case "search":
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "update":
            var update = JSON.parse(query['updates']);
            //update["update_time"] = new Date().getTime();
            dao.update(schema_name, query['query'], JSON.stringify(update), function (err, up) {
                datautils.send(res, up);
                if (up.nModified > 0) {//有更新 刷新配置
                    dao.find(schema_name, query['query'], null, {}, function (err, sres) {//先获取一条 用这条的获取uid 和site_id
                        if (sres != null & sres.length > 0) {
                            var qry = {
                                uid: sres[0].uid,
                                root_url: sres[0].root_url,
                                event_page: sres[0].event_page
                            }
                            dao.find(schema_name, JSON.stringify(qry), null, {}, function (err, docs) {//查询所有配置
                                if (docs != null && docs.length > 0) {//存在配置
                                    var confs = [];
                                    docs.forEach(function (item) {
                                        var event_config = {
                                            eid: item.event_id,//事件ID
                                            evttag: item.event_name,//事件名称
                                            evpage: item.event_page,//事件页面
                                            evtarget: item.event_target,//是否为转化目标
                                            evpause:item.event_status==0?true:false,
                                            evtime: item.update_time//转化修改时间
                                        };
                                        confs.push(event_config);
                                    });
                                    var tempRef = sres[0].event_page
                                    if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                                        tempRef = tempRef.substring(7, tempRef.length)
                                    if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                                        tempRef = tempRef.substring(8, tempRef.length)
                                    if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                                        tempRef = tempRef.substring(0,tempRef.length-1)
                                    }
                                    console.log("1 update 刷新Redis：" + sres[0].root_url + ":e:" + tempRef + " = " + JSON.stringify(confs))
                                    req.redisclient.multi().set(sres[0].root_url + ":e:" + tempRef, JSON.stringify(confs)).exec();
                                }
                                datautils.send(res, docs);
                            });
                        }
                    });

                }
            });
            break;
        case "delete":
            var qry = query['query'];
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                if (docs != null && docs.length > 0) {
                    docs.forEach(function (item) {
                        req.redisclient.del(item.root_url + ":e:" + item.event_page);
                    });
                    //查询 删除级联 删除本身
                    dao.remove(schema_name, qry, function (del) {
                        datautils.send(res, "success");
                        var jsonqry = JSON.parse(qry)
                        dao.find(schema_name, JSON.stringify({
                            root_url: jsonqry.root_url,
                            event_page: jsonqry.event_page
                        }), null, {}, function (err, docs) {//查询所有配置
                            var confs = [];
                            docs.forEach(function (item) {
                                var event_config = {
                                    eid: item.event_id,//事件ID
                                    evttag: item.event_name,//事件名称
                                    evpage: item.event_page,//事件页面
                                    evpause:item.event_status==0?true:false,
                                    evtarget: item.event_target//是否为转化目标
                                };
                                confs.push(event_config);
                            });
                            var tempRef = jsonqry.event_page
                            if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                                tempRef = tempRef.substring(7, tempRef.length)
                            if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                                tempRef = tempRef.substring(8, tempRef.length)
                            if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                                tempRef = tempRef.substring(0,tempRef.length-1)
                            }
                            //consolelog("delete 刷新Redis：" + jsonqry.root_url + ":e:" + tempRef + " = " + JSON.stringify(confs))
                            req.redisclient.multi().set(jsonqry.root_url + ":e:" + tempRef, JSON.stringify(confs)).exec();
                            datautils.send(res, docs);
                        });
                    });
                }
            });

            break;
        case "findById":
            var qry = query['query'];
            dao.findById(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        default :
            break;
    }

});


// ================================= subdirectory_list ===============================
/**
 *子目录管理
 */
api.get("/subdirectory_list", function (req, res) {
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var schema_name = "subdirectories_model";//设置选择schemas Model名称
    switch (type) {
        case "save":
            var entity = query['entity'];
            var temp = JSON.parse(unescape(entity));
            dao.save(schema_name, temp, function (ins) {
                datautils.send(res, JSON.stringify(ins));
            });
            break;
        case "search":
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "update":
            var updateqry = unescape(query['updates']);
            dao.update(schema_name, query['query'], updateqry, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "delete":
            var qry = query['query'];
            dao.remove(schema_name, qry, function (docs) {
                datautils.send(res, "success");
            });
            break;
        case "findById":
            var qry = query['query'];
            dao.findById(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        default :
            break;
    }

});
// ================================= Config  ===============================
/**
 * 网站列表管理
 */
api.get("/site_list", function (req, res) {

    //config 鼠标点击配置
    var config_mouse = {
        mouse_ckick: false
    };
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var schema_name = "sites_model";
    switch (type) {
        case "save":
            var entity = query['entity'];
            var temp = JSON.parse(entity);
            temp.type_id = randstring.rand_string();
            temp.track_id = randstring.rand_string();
            temp.ctime  =  new Date().getTime();
            temp.token = temp.token==undefined?"":temp.token
            temp.is_top = temp.is_top==undefined?false:temp.is_top
            temp.account_id = temp.account_id==undefined?0:temp.account_id
            dao.save(schema_name, temp, function (ins) {
                datautils.send(res, ins);
                // 参考 https://github.com/zerocoolys/suiyan/wiki/%E9%85%8D%E7%BD%AE%E5%8F%82%E6%95%B0%5Bredis-key-%E8%A7%84%E8%8C%83%5D
                var siteconfig = {
                    siteid: ins._id.toString(),//站点ID 对应MongoDb _id
                    siteurl: temp.site_url,//站点URL
                    sitepause: ins.site_pause,//站点暂停状态，false启用，true暂停
                    icon: ins.icon == undefined ? 1 : ins.icon
                }
                //默认存储时长转化和PV转化到Redis
                var time_config = {
                    ttpause: false,
                    tttime: 30
                }
                var pv_config = {
                    pvpause: false,
                    pvtimes: 3
                }
                req.redisclient.multi().set("typeid:".concat(ins.track_id), ins.type_id)//
                    .set("ts:" + temp.track_id, ins._id)//
                    .set("st:" + ins._id, ins.track_id)//
                    .set("tsu:" + ins.track_id, temp.site_url)
                    .set("tsj:" + ins.track_id, JSON.stringify(siteconfig))
                    //.set(ins._id + ":mouse:" + ins.site_url, JSON.stringify(config_mouse))//目前无具体URL配置 暂时设置在站点上
                    .set("duration:" + ins._id, JSON.stringify(time_config))//站点级别设置
                    .set("visit:" + ins._id, JSON.stringify(pv_config)).exec();
            });
            break;
        case "search":
            dao.find(schema_name, query['query'], null, {}, function (err, up) {
                datautils.send(res, up);
                // TODO 为什么要去差redis
            });
            break;
        case "update":
            var update = query['updates'];
            console.log(query)
            console.log(update)
            dao.update(schema_name, query['query'], query['updates'], function (err, up) {
                datautils.send(res, up);
                if (up.nModified > 0) {//有更新 刷新配置
                    dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                        if (docs != null && docs.length > 0) {//站点更新时候只更新状态
                            var siteconfig = {
                                siteid: docs[0]._id.toString(),//站点ID 对应MongoDb _id
                                siteurl: docs[0].site_url,//站点URL
                                sitepause: docs[0].site_pause,//站点暂停状态，false启用，true暂停
                                icon: docs[0].icon == undefined ? 1 : docs[0].icon
                            }
                            //默认存储时长转化和PV转化到Redis
                            var time_config = {
                                ttpause: false,
                                tttime: 30
                            }
                            var pv_config = {
                                pvpause: false,
                                pvtimes: 3
                            }
                            req.redisclient.multi().set("typeid:".concat(docs[0].track_id), docs[0].type_id)//
                                .set("ts:" + docs[0].track_id, docs[0]._id)//
                                .set("st:" + docs[0]._id, docs[0].track_id)//
                                .set("tsu:" + docs[0].track_id, docs[0].site_url)
                                .set("tsj:" + docs[0].track_id, JSON.stringify(siteconfig))
                                //.set(ins._id + ":mouse:" + ins.site_url, JSON.stringify(config_mouse))//目前无具体URL配置 暂时设置在站点上
                                .set("duration:" + docs[0]._id, JSON.stringify(time_config))//站点级别设置
                                .set("visit:" + docs[0]._id, JSON.stringify(pv_config)).exec();
                        }
                    });
                }
            });
            break;
        case "delete":
            var qry = query['query'];
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                if (docs != null && docs.length > 0) {
                    docs.forEach(function (item) {
                        //删除Redis
                        req.redisclient.del("typeid:" + item.track_id);
                        req.redisclient.del("ts:" + item.track_id);
                        req.redisclient.del("tsu:" + item.track_id);
                        req.redisclient.del("tsj:" + item.track_id);
                        req.redisclient.del("st:" + item.type_id);
                        req.redisclient.del("duration:" + item._id);
                        req.redisclient.del("visit:" + item._id);
                        req.redisclient.del(item._id + ":mouse:*");
                        req.redisclient.del(item._id + ":e:*");
                        //删除级联表
                        var del_qry1 = {
                            site_id: item._id,
                            uid: item.uid
                        };
                        dao.remove("siterules_model", JSON.stringify(del_qry1), function () {
                        });//统计规则
                        dao.remove("page_conv_model", JSON.stringify(del_qry1), function () {
                        });//页面转化
                        dao.remove("converts_model", JSON.stringify(del_qry1), function () {
                        });//时长转化
                        dao.remove("page_title_model", JSON.stringify(del_qry1), function () {
                        });//页面标题
                        dao.remove("adtrack_model", JSON.stringify(del_qry1), function () {
                        });//广告
                        var del_qry2 = {
                            root_url: item._id,
                            uid: item.uid
                        };
                        dao.remove("subdirectories_model", JSON.stringify(del_qry2), function () {
                        });//子目录管理
                        dao.remove("event_change_model", JSON.stringify(del_qry2), function () {
                        });//事件转化
                    });
                    //查询 删除级联 删除本身
                    dao.remove(schema_name, qry, function (del) {
                        datautils.send(res, "success");
                    });
                }else{
                    datautils.send(res, "fail");
                }
            });
            break;
        case "logicdelete":
            var qry = query['query'];
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                if (docs != null && docs.length > 0) {
                    docs.forEach(function (item) {
                        //删除Redis

                        //删除Redis
                        req.redisclient.del("typeid:" + item.track_id);
                        req.redisclient.del("ts:" + item.track_id);
                        req.redisclient.del("tsu:" + item.track_id);
                        req.redisclient.del("tsj:" + item.track_id);
                        req.redisclient.del("st:" + item.type_id);
                        req.redisclient.del("duration:" + item._id);
                        req.redisclient.del("visit:" + item._id);
                        req.redisclient.del(item._id + ":mouse:*");
                        req.redisclient.del(item._id + ":e:*");
                        //删除级联表
                        var del_qry1 = {
                            site_id: item._id,
                            uid: item.uid
                        };
                        dao.remove("siterules_model", JSON.stringify(del_qry1), function () {
                        });//统计规则
                        dao.remove("page_conv_model", JSON.stringify(del_qry1), function () {
                        });//页面转化
                        dao.remove("converts_model", JSON.stringify(del_qry1), function () {
                        });//时长转化
                        dao.remove("page_title_model", JSON.stringify(del_qry1), function () {
                        });//页面标题
                        dao.remove("adtrack_model", JSON.stringify(del_qry1), function () {
                        });//广告
                        var del_qry2 = {
                            root_url: item._id,
                            uid: item.uid
                        };
                        dao.remove("subdirectories_model", JSON.stringify(del_qry2), function () {
                        });//子目录管理
                        dao.remove("event_change_model", JSON.stringify(del_qry2), function () {
                        });//事件转化
                    });
                    //查询 删除级联 删除本身
                    dao.update(schema_name, query['query'], JSON.stringify({is_use: 0}), function (err, up) {//逻辑删除置is_use=0
                        datautils.send(res, "success");
                    });
                }else{
                    datautils.send(res, "fail");
                }
            });
            break;
        default :
            break;
    }

});
/**
 * 原config配置设置 主要路由网站统计规则设置
 */
api.get("/conf", function (req, res) {
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var index = query['index'];
    var schema_name = "";
    switch (index) {
        case "site_list":
            schema_name = "sites_model";
            break;
        case "0":
            schema_name = "siterules_model";
            break;
        case "5":
            schema_name = "converts_model";
            break;
        default :
    }

    switch (type) {
        case "save":
            var entity = JSON.parse(query['entity']);
            dao.save(schema_name, entity, function (ins) {
                datautils.send(res, JSON.stringify(ins));
            });
            break;
        case "search":
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "update":
            dao.update(schema_name, query['query'], query['updates'], function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "delete":
            dao.remove(schema_name, query['query'], function () {
                datautils.send(res, "remove");
            });
            break;
        default :
            break;
    }

});
/**
 * 页面转化规则单独剥离 路由
 */
api.get("/page_conv", function (req, res) {
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var schema_name = "page_conv_model";
    switch (type) {
        case "save":
            var entity = JSON.parse(query['entity']);
            entity.update_time = new Date().getTime();
            ////consolelog(JSON.stringify(entity))
            dao.save(schema_name, entity, function (ins, err) {
                datautils.send(res, ins);
                if (ins._id != undefined) {
                    var tpaths = [];
                    ins.paths.forEach(function (path, index) {
                        if (path.path_mark) {
                            var pathsteps = []
                            path.steps.forEach(function (step) {
                                var stepurls = []
                                step.step_urls.forEach(function (step_url) {
                                    stepurls.push(step_url.url)
                                })
                                pathsteps.push(stepurls)
                            })
                            var tpath = {
                                path_num: index + 1,
                                steps: pathsteps
                            }
                            tpaths.push(tpath)
                        }
                    })
                    var conf = {
                        target_name: ins.target_name,
                        record_type: ins.record_type,
                        expected_yield: ins.expected_yield,
                        pecent_yield: ins.pecent_yield,
                        update_time : ins.update_time,
                        pause:ins.is_pause,
                        paths: tpaths,
                    }
                    ins.target_urls.forEach(function (target_url) {
                        var tempRef = target_url.url
                        if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                            tempRef = tempRef.substring(7, tempRef.length)
                        if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                            tempRef = tempRef.substring(8, tempRef.length)
                        if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                            tempRef = tempRef.substring(0,tempRef.length-1)
                        }
                        //consolelog("save page_conv 刷新Redis：" + ins.site_id + ":pc:" + tempRef + " = " + JSON.stringify(conf))
                        req.redisclient.multi().set(ins.site_id + ":pc:" + tempRef, JSON.stringify(conf)).exec()
                    })
                }
            });
            break;
        case "search":
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "update":
            dao.update(schema_name, query['query'], query['updates'], function (err, up) {
                datautils.send(res, up);
                if (up.nModified > 0) {//有更新 刷新配置
                    dao.find(schema_name, query['query'], null, {}, function (err, configs) {
                        if (configs != undefined && configs.length == 1) {
                            var config = configs[0]
                            if (config._id != undefined) {
                                var tpaths = [];
                                config.paths.forEach(function (path, index) {
                                    if (path.path_mark) {
                                        var pathsteps = []
                                        path.steps.forEach(function (step) {
                                            var stepurls = []
                                            step.step_urls.forEach(function (step_url) {
                                                stepurls.push(step_url.url)
                                            })
                                            pathsteps.push(stepurls)
                                        })
                                        var tpath = {
                                            path_num: index + 1,
                                            steps: pathsteps
                                        }
                                        tpaths.push(tpath)
                                    }
                                })
                                var conf = {
                                    target_name: config.target_name,
                                    record_type: config.record_type,
                                    expected_yield: config.expected_yield,
                                    pecent_yield: config.pecent_yield,
                                    update_time : config.update_time,
                                    pause:config.is_pause,
                                    paths: tpaths,
                                }
                                config.target_urls.forEach(function (target_url) {

                                    var tempRef = target_url.url
                                    if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                                        tempRef = tempRef.substring(7, tempRef.length)
                                    if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                                        tempRef = tempRef.substring(8, tempRef.length)
                                    if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                                        tempRef = tempRef.substring(0,tempRef.length-1)
                                    }
                                    //consolelog("update page_conv 刷新Redis：" + config.site_id + ":pc:" + tempRef + " = " + JSON.stringify(conf))
                                    req.redisclient.multi().set(config.site_id + ":pc:" + tempRef, JSON.stringify(conf)).exec()
                                })
                            }
                        }
                    });
                }
            });
            break;
        case "delete":
            dao.remove(schema_name, query['query'], function () {
                datautils.send(res, "success");
            });
            break;
        default :
            break;
    }

});

/**
 * 页面转化规则单独剥离 路由
 */
api.get("/page_conv_urls", function (req, res) {

    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var schema_name = "page_conv_urls_model";
    switch (type) {
        case "save":
            var entity = JSON.parse(query['entity']);
            dao.save(schema_name, entity, function (ins) {
                datautils.send(res, JSON.stringify(ins));
            });
            break;
        case "saveAll":
            var entitys = JSON.parse(query['entitys']);

            ////consolelog(entitys.length)
            if (entitys.length > 0) {
                dao.saveAll(schema_name, entitys, function () {
                    datautils.send(res, "SUCCESS");
                    //Redis存放以Path为单位
                    var tempPathMark = entitys[0];
                    var redisPageUrls = [];
                    var bulk = req.redisclient.multi();
                    for (var index = 0; index < entitys.length; index++) {
                        if (entitys[index].path == tempPathMark.path) {
                            redisPageUrls.push(entitys[index]);
                            if (index == (entitys.length - 1)) {
                                var key = tempPathMark.page_conv_id + ":pcu:" + tempPathMark.path;
                                //consolelog("save page_conv_urls 刷新Redis：" + key + " = " + JSON.stringify(redisPageUrls))
                                bulk.set(key, JSON.stringify(redisPageUrls));
                                break;
                            }
                        } else {
                            var key = tempPathMark.page_conv_id + ":pcu:" + tempPathMark.path;
                            bulk.set(key, JSON.stringify(redisPageUrls));
                            redisPageUrls = [];
                            redisPageUrls.push(entitys[index]);
                            tempPathMark = entitys[index]
                            if (index == (entitys.length - 1)) {

                                var key = tempPathMark.page_conv_id + ":pcu:" + tempPathMark.path;

                                //consolelog("save page_conv_urls 刷新Redis：" + key + " = " + JSON.stringify(redisPageUrls))
                                bulk.set(key, JSON.stringify(redisPageUrls));
                                break;
                            }
                        }
                    }
                    bulk.exec();
                })
            }
            break;
        case "search":
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "update":
            dao.update(schema_name, query['query'], query['updates'], function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "delete":
            dao.remove(schema_name, query['query'], function () {
                datautils.send(res, "success");
            });
            break;
        default :
            break;
    }

});

/**
 * 时长转化规则单独剥离 路由
 * 包括PV转化
 */
api.get("/time_conv", function (req, res) {

    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var schema_name = "converts_model";
    switch (type) {
        case "save":
            var entity = JSON.parse(query['entity']);
            dao.save(schema_name, entity, function (ins) {
                datautils.send(res, JSON.stringify(ins));

                //存储时长转化和PV转化到Redsi
                var time_config = {
                    ttpause: ins.time_conv.status,
                    tttime: ins.time_conv.val
                }
                var pv_config = {
                    pvpause: ins.pv_conv.status,
                    pvtimes: ins.pv_conv.val
                }
                //通过site_id 去获取track_id
                req.redisclient.multi().set("duration:" + ins.site_id, JSON.stringify(time_config))//站点级别设置
                    .set("visit:" + ins.site_id, JSON.stringify(pv_config)).exec();
            });
            break;
        case "search":
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "update":
            dao.update(schema_name, query['query'], query['updates'], function (err, up) {

                datautils.send(res, up);
                if (up.nModified > 0) {//有更新 刷新配置
                    dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                        if (docs != null && docs.length > 0) {
                            //存储时长转化和PV转化到Redis
                            var time_config = {
                                ttpause: docs[0].time_conv.status,
                                tttime: docs[0].time_conv.val
                            }
                            var pv_config = {
                                pvpause: docs[0].pv_conv.status,
                                pvtimes: docs[0].pv_conv.val
                            }
                            //通过site_id 去获取track_id
                            req.redisclient.multi().set("duration:" + docs[0].site_id, JSON.stringify(time_config))//站点级别设置
                                .set("visit:" + docs[0].site_id, JSON.stringify(pv_config)).exec();
                        }
                    });
                }
            });
            break;
        case "delete":
            //先删除Redis 查询到要删除的数据
            var qry = query['query'];
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                if (docs != null && docs.length > 0) {
                    docs.forEach(function (item) {
                        req.redisclient.del("duration:" + item.site_id);
                        req.redisclient.del("visit:" + item.site_id);
                    });
                    //查询 删除级联 删除本身
                    dao.remove(schema_name, qry, function (del) {
                        datautils.send(res, "success");
                    });
                }
            });
            break;
        default :
            break;
    }

});

/**
 * 时长转化规则单独剥离 路由
 * 包括PV转化
 */
api.get("/page_title", function (req, res) {
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var schema_name = "page_title_model";
    switch (type) {
        case "save":
            var entity = JSON.parse(query['entity']);
            dao.save(schema_name, entity, function (ins) {
                datautils.send(res, JSON.stringify(ins));

                //存储时长转化和PV转化到Redsi
                var page_title = {//默认状态下存储
                    page_url: "",
                    icon_name: "",
                    is_open: false
                }
                if (ins != null) {
                    page_title.page_url = ins.page_url;
                    page_title.icon_name = ins.icon_name;
                    page_title.is_open = ins.is_open;
                }
                //通过site_id 去获取track_id
                if (entity.site_id != null && entity.page_url != null) {
                    var tempRef = entity.page_url
                    if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                        tempRef = tempRef.substring(7, tempRef.length)
                    if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                        tempRef = tempRef.substring(8, tempRef.length)
                    if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                        tempRef = tempRef.substring(0,tempRef.length-1)
                    }
                    req.redisclient.multi().set(entity.site_id + ":mouse:" + tempRef, JSON.stringify(page_title)).exec();//站点级别设置
                }
            });
            break;
        case "search":
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "update":
            dao.update(schema_name, query['query'], query['updates'], function (err, up) {
                datautils.send(res, up);
            });
            break;
        case "delete":
            //先删除Redis 查询到要删除的数据
            var qry = query['query'];
            dao.find(schema_name, query['query'], null, {}, function (err, docs) {
                if (docs != null && docs.length > 0) {
                    docs.forEach(function (item) {
                        req.redisclient.del(item.site_id + ":mouse:" + item.page_url);
                    });
                    //查询 删除级联 删除本身
                    dao.remove(schema_name, qry, function (del) {
                        datautils.send(res, "success");
                    });
                }
            });
            break;
        default :
            break;
    }

});

/**
 *Redis测试获取内容接口
 */
api.get("/tt_conf", function (req, res) {
    var query = url.parse(req.url, true).query;
    req.redisclient.get(query['query'], function (error, redis_type_id) {

        datautils.send(res, redis_type_id);
    });
});
/**
 *
 */
api.get("/redis", function (req, res) {
    var query = url.parse(req.url, true).query;
    req.redisclient.get(query['key'], function (error, redis_conf) {//
        datautils.send(res, redis_conf);
    });
});

api.get("/redisjson", function (req, res) {
    var query = url.parse(req.url, true).query;
    req.redisclient.get(query['key'], function (error, redis_conf) {//
        datautils.send(res, redis_conf);
    });
});

//================================adtrack-icepros==========================
//nodejs   路由处理
api.get("/adtrack", function (req, res) {
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var index = query['index'];
    var schema_name = "adtrack_model";
    switch (type) {
        case "save":
            var entity = JSON.parse(query['entity']);

            var strUrl = "";
            var sourceUrl = entity.targetUrl;
            var yesParam = "?adsrf=" + entity.mediaPlatform;
            var noParam = "&adsrf=" + entity.mediaPlatform;
            var notHostName = "&media=" + entity.adTypes
                + "&cpna=" + entity.planName
                + "&kwna=" + entity.keywords
                + "&crt=" + entity.creative
                + "&t=" + entity.tid
                + "&atk=1"
                + "&adstt=0";

            if (sourceUrl.indexOf("?") == -1) {
                if (sourceUrl.indexOf("http://") == -1) {
                    strUrl = "http://" + sourceUrl + yesParam + notHostName;
                } else {
                    strUrl = sourceUrl + yesParam + notHostName;
                }
            } else {
                if (sourceUrl.indexOf("http://") == -1) {
                    strUrl = "http://" + sourceUrl + noParam + notHostName;
                } else {
                    strUrl = sourceUrl + noParam + notHostName;
                }
            }
            entity.produceUrl = encodeURI(strUrl.trim());

            dao.save(schema_name, entity, function (ins) {
                datautils.send(res, JSON.stringify(ins));
            });
            break;
        case "search":
            dao.sortbyid(schema_name, query['query'], null, {}, function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "update":
            dao.update(schema_name, query['query'], query['updates'], function (err, docs) {
                datautils.send(res, docs);
            });
            break;
        case "delete":
            dao.remove(schema_name, query['query'], function () {
                datautils.send(res, "remove");
            });
            break;
        default :
            break;
    }


});
//JS测试
api.get("/select", function (req, res) {
    var ref = req.header('Referer');
    //判断refer 和track_id对应的站点匹配
    var query = url.parse(req.url, true).query;
    var type = query["type"];
    var td = query["td"];
    var uid = query["cuid"]
    if (td != null && uid != null) {
        req.redisclient.get("tsj:" + td, function (error, sitejsons) {
            var sitejson = sitejsons == null ? null : JSON.parse(sitejsons);
            if (sitejson != null && ref != undefined && ref.indexOf(sitejson.siteurl) > -1) {
                var schema_name = "event_change_model";//设置选择schemas Model名称
                switch (type) {
                    case "saveTips":
                        var entityJson = JSON.parse(query["entity"]);
                        var existQry = {
                            uid: uid,
                            event_id: entityJson["id"],
                            event_page: entityJson["monUrl"],
                            //event_name: entityJson["name"],
                            root_url: sitejson.siteid
                        }
                        dao.find(schema_name, JSON.stringify(existQry), null, {}, function (err, docs) {//查询所有配置
                            var eventData = {
                                uid: uid,
                                event_id: entityJson["id"],
                                event_name: entityJson["name"],
                                event_page: entityJson["monUrl"],
                                event_target: entityJson["isTarget"]==undefined|| entityJson["isTarget"]=="false"|| entityJson["isTarget"]==""?false:true,
                                root_url: sitejson.siteid,
                            }
                            //console.log(JSON.stringify(eventData))
                            if (docs == null || docs.length == 0) {//存在配置
                                eventData.event_status = 1
                                eventData.event_method = "自动"
                                //eventData.event_target = false
                                eventData.update_time = new Date().getTime();
                                dao.save(schema_name, eventData, function (ins) {
                                    if (ins != null) {
                                        res.write("crossDomainCallback({code:1,state:'Save Success'}," + query["index"] + ");");
                                        res.end()
                                        dao.find(schema_name, JSON.stringify({
                                            uid: uid,
                                            event_page: entityJson["monUrl"],
                                            root_url: sitejson.siteid
                                        }), null, {}, function (err, docs) {//查询所有配置
                                            if (docs != null && docs.length > 0) {//存在配置
                                                var confs = [];
                                                docs.forEach(function (item) {
                                                    var event_config = {
                                                        eid: item.event_id,//事件ID
                                                        evttag: item.event_name,//事件名称
                                                        evpage: item.event_page,//事件页面
                                                        evtarget: item.event_target,//是否为转化目标
                                                        evtime: item.update_time
                                                    };
                                                    confs.push(event_config);
                                                });

                                                var tempRef = docs[0].event_page
                                                if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                                                    tempRef = tempRef.substring(7, tempRef.length)
                                                if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                                                    tempRef = tempRef.substring(8, tempRef.length)
                                                if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                                                    tempRef = tempRef.substring(0,tempRef.length-1)
                                                }
                                                //consolelog("saveTips 刷新Redis：" + docs[0].root_url + ":e:" + tempRef + " = " + JSON.stringify(confs))
                                                req.redisclient.multi().set(docs[0].root_url + ":e:" + tempRef, JSON.stringify(confs)).exec();
                                            }
                                            datautils.send(res, docs);
                                        });
                                    }
                                });
                            }
                            else {
                                //console.log("*******该事件配置已存在 更新********")
                                dao.update(schema_name, JSON.stringify({
                                    _id: docs[0]._id,
                                }), JSON.stringify({
                                    event_name: entityJson["name"],
                                    event_target: entityJson["isTarget"]==undefined|| entityJson["isTarget"]=="false"|| entityJson["isTarget"]==""?false:true,
                                }), function (err, docs) {
                                    res.write("crossDomainCallback({code:2,state:'Update Success'}," + query["index"] + ");");
                                    res.end();
                                    dao.find(schema_name, JSON.stringify(existQry), null, {}, function (err, docs) {//查询所有配置
                                        if (docs != null && docs.length > 0) {//存在配置
                                            var confs = [];
                                            docs.forEach(function (item) {
                                                var event_config = {
                                                    eid: item.event_id,//事件ID
                                                    evttag: item.event_name,//事件名称
                                                    evpage: item.event_page,//事件页面
                                                    evtarget: item.event_target,//是否为转化目标
                                                    evtime: item.update_time
                                                };
                                                confs.push(event_config);
                                            });
                                            var tempRef = docs[0].event_page
                                            if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                                                tempRef = tempRef.substring(7, tempRef.length)
                                            if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                                                tempRef = tempRef.substring(8, tempRef.length)
                                            if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                                                tempRef = tempRef.substring(0,tempRef.length-1)
                                            }
                                            //consolelog("updateTips 刷新Redis：" + docs[0].root_url + ":e:" + tempRef + " = " + JSON.stringify(confs))
                                            req.redisclient.multi().set(docs[0].root_url + ":e:" + tempRef, JSON.stringify(confs)).exec();
                                        }
                                        datautils.send(res, docs);
                                    });
                                });
                            }
                        });
                        break;
                    case "getTips"://获取
                        var existQry = {//用户 站点 页面 为查询条件
                            uid: uid,
                            event_path: query["eventPath"],
                            root_url: sitejson.siteid,
                            event_method:"自动"
                        }
                        dao.find(schema_name, JSON.stringify(existQry), null, {}, function (err, docs) {//查询所有配置
                            if (docs != null) {//存在配置
                                res.write("crossDomainCallback(" + JSON.stringify(docs) + "," + query["index"] + ");");
                            } else if (err) {
                                res.write("crossDomainCallback({state:'FAILED'}," + query["index"] + ");");
                            }
                            res.end();
                        });
                        break;
                    case "deleteTip"://删除
                        var existQry = {//用户 站点 页面 为查询条件
                            uid: uid,
                            event_page: query["event_page"],
                            event_id: query["event_id"],
                            root_url: sitejson.siteid
                        }
                        dao.remove(schema_name, JSON.stringify(existQry), function (err) {
                            res.write("crossDomainCallback({code:1,state:'Delete Success'}," + query["index"] + ");");
                            res.end();
                            dao.find(schema_name, JSON.stringify({
                                uid: uid,
                                event_page: query["event_page"],
                                root_url: sitejson.siteid
                            }), null, {}, function (err, docs) {//查询所有配置
                                var confs = [];
                                docs.forEach(function (item) {
                                    var event_config = {
                                        eid: item.event_id,//事件ID
                                        evttag: item.event_name,//事件名称
                                        evpage: item.event_page,//事件页面
                                        evtarget: item.event_target//是否为转化目标
                                    };
                                    confs.push(event_config);
                                });
                                var tempRef = existQry.event_page
                                if (tempRef!=undefined&&tempRef.indexOf("http://") > -1 && tempRef.length > 8)
                                    tempRef = tempRef.substring(7, tempRef.length)
                                if (tempRef!=undefined&&tempRef.indexOf("https://") > -1 && tempRef.length > 9)
                                    tempRef = tempRef.substring(8, tempRef.length)
                                if(tempRef!=undefined&&tempRef!=""&&tempRef[tempRef.length-1]=="/"){
                                    tempRef = tempRef.substring(0,tempRef.length-1)
                                }
                                //consolelog("deleteTips 刷新Redis：" + existQry.root_url + ":e:" + tempRef + " = " + JSON.stringify(confs))
                                req.redisclient.multi().set(existQry.root_url + ":e:" + tempRef, JSON.stringify(confs)).exec();
                                datautils.send(res, docs);
                            });
                        });
                        break;
                    default:
                        break;

                }
            }
        });
    }
});
api.get("/searchByUID", function (req, res) {
    //判断refer 和track_id对应的站点匹配
    var query = url.parse(req.url, true).query;
    var uid = query["uid"];
    var track_id = query["track_id"];
    if (uid != null) {
        dao.findSync("sites_model", JSON.stringify({uid: uid, track_id: track_id}), null, {}, function (data) {
            datautils.send(res, data);
        });

    }
});

/**
 * 网站列表管理
 */
api.get("/test", function (req, res) {

    //config 鼠标点击配置
    var config_mouse = {
        mouse_ckick: false
    };
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var schema_name = "adgroup_model";
    switch (type) {
        case "search":
            daoutil.find(schema_name, JSON.stringify({}), null, {}, function (err, up) {
                ////consolelog(up)
                datautils.send(res, up);
                // TODO 为什么要去差redis
            });
            break;
        default :
            break;
    }

});
module.exports = api;