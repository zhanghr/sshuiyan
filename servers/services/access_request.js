/**
 * Created by dolphineor on 2015-5-20.
 */

var buildQuery = function (filters, start, end) {
    var mustQuery = [
        {
            "range": {
                "utime": {
                    "gte": start,
                    "lte": end,
                    "time_zone": "+8:00"
                }
            }
        }
    ];

    if (filters != null) {
        filters.forEach(function (filter) {
            mustQuery.push({
                "terms": filter
            });
        });
    }

    return {
        "bool": {
            "must": mustQuery
        }
    }
};

// pv
var pvFn = function (result) {
    var keyArr = [];
    var quotaArr = [];

    for (var i = 0, l = result.length; i < l; i++) {
        var pv = result[i].pv_aggs.value;
        Array.prototype.push.call(keyArr, result[i].key);
        Array.prototype.push.call(quotaArr, pv);
    }

    return {
        "label": "pv",
        "key": keyArr,
        "quota": quotaArr
    };
};

// uv
var uvFn = function (result) {
    var keyArr = [];
    var quotaArr = [];

    for (var i = 0, l = result.length; i < l; i++) {
        var uv = result[i].uv_aggs.value;
        keyArr.push(result[i].key);
        quotaArr.push(uv);
    }

    return {
        "label": "uv",
        "key": keyArr,
        "quota": quotaArr
    };
};

// 入口页查询结果解析
var entranceFn = function (result) {
    var keyArr = [];
    var quotaArr = [];

    for (var i = 0, l = result.length; i < l; i++) {
        var uv = result[i].entrance_aggs.value;
        keyArr.push(result[i].key);
        quotaArr.push(uv);
    }

    return {
        "label": "entrance",
        "key": keyArr,
        "quota": quotaArr
    };
};

// 目前查询仅适用于页面分析模块中受访页面的入口页
var access_request = {
    search: function (es, indexes, type, quotas, dimension, filters, start, end, callbackFn) {
        var request = {
            "index": indexes,
            "type": type,
            "body": {
                "query": buildQuery(filters),
                "size": 0,
                "aggs": {
                    "url_group": {
                        "terms": {
                            "field": "loc"
                        },
                        "aggs": {
                            "pv_aggs": {
                                "sum": {
                                    "script": "1"
                                }
                            },
                            "uv_aggs": {
                                "cardinality": {
                                    "field": "tt"
                                }
                            },
                            "entrance_aggs": {
                                "sum": {
                                    "script": "e = 0; if (doc['entrance'].value == 1) {e = 1}; e"
                                }
                            }
                        }
                    }
                }
            }
        };


        es.search(request, function (error, response) {
            var data = [];
            if (response != undefined && response.aggregations != undefined) {
                var result = response.aggregations.url_group.buckets;

                quotas.forEach(function (quota) {
                    switch (quota) {
                        case "pv":
                            data.push(pvFn(result));
                            break;
                        case "uv":
                            data.push(uvFn(result));
                            break;
                        case "entrance":
                            data.push(entranceFn(result));
                            break;
                        default :
                            break;
                    }
                });

                callbackFn(data);
            } else
                callbackFn(data);
        });
    },
    //exchangeSearch: function (es, indexs, type, callbackFn) {
    //    var request = {
    //        "index": indexs,
    //        "type": type,
    //        "body": {
    //            "size": 0,
    //            "aggs": {
    //                "aggs_pv": {
    //                    "terms": {
    //                        "field": "_type"
    //                    },
    //                    "aggs": {
    //                        "pv": {
    //                            "sum": {
    //                                "script": "1"
    //                            }
    //                        }
    //                    }
    //                },
    //                "uv": {
    //                    "cardinality": {
    //                        "field": "tt"
    //                    }
    //                }
    //            }
    //        }
    //    }
    //    es.search(request, function (error, response) {
    //        var data = [];
    //        if (response != undefined && response.aggregations != undefined) {
    //            var result = response.aggregations;
    //            data.push({"pv": result.aggs_pv.buckets[0].pv.value, "uv": result.uv.value});
    //            callbackFn(data);
    //        } else
    //            callbackFn(data);
    //    });
    //},
    exchangeSearch: function (es, indexs, type, callbackFn) {
        var request = {
            index: indexs,
            type: type,
            body: {
                "size": 0,
                "aggs": {
                    "pv_uv": {
                        "terms": {
                            "field": "_type"
                        },
                        "aggs": {
                            "path0": {
                                "terms": {
                                    "field": "path0"
                                },
                                "aggs": {
                                    "path1": {
                                        "terms": {
                                            "field": "path1"
                                        },
                                        "aggs": {
                                            "path2": {
                                                "terms": {
                                                    "field": "path2"
                                                },
                                                "aggs": {
                                                    "pv": {
                                                        "sum": {
                                                            "script": "1"
                                                        }
                                                    },
                                                    "uv": {
                                                        "cardinality": {
                                                            "field": "tt"
                                                        }
                                                    }
                                                }
                                            },
                                            "pv": {
                                                "sum": {
                                                    "script": "1"
                                                }
                                            },
                                            "uv": {
                                                "cardinality": {
                                                    "field": "tt"
                                                }
                                            }
                                        }
                                    },
                                    "pv": {
                                        "sum": {
                                            "script": "1"
                                        }
                                    },
                                    "uv": {
                                        "cardinality": {
                                            "field": "tt"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        es.search(request, function (error, response) {
            var data = [];
            var path1Data = [];
            if (response != undefined && response.aggregations != undefined) {
                var result = response.aggregations.pv_uv.buckets;
                for (var i = 0; i < result.length; i++) {
                    for (var c = 0; c < result[i].path0.buckets.length; c++) {
                        path1Data = [];
                        for (var k = 0; k < result[i].path0.buckets[c].path1.buckets.length; k++) {
                            path1Data.push({
                                "pv": result[i].path0.buckets[c].path1.buckets[k].pv.value,
                                "uv": result[i].path0.buckets[c].path1.buckets[k].uv.value,
                                "pathName": result[i].path0.buckets[c].path1.buckets[k].key
                            });
                        }
                        console.log("pv:" + result[i].key);
                        data.push({
                            "pv": result[i].path0.buckets[c].pv.value,
                            "uv": result[i].path0.buckets[c].pv.value,
                            "pathName": result[i].path0.buckets[c].key,
                            "path1": path1Data,
                            "id": result[i].key
                        });
                    }

                }
                callbackFn(data);
            } else
                callbackFn(data);
        });
    },
    trafficmapSearch: function (es, indexs, callbackFn) {
        var request = {
            index: indexs,
            type: null,
            body: {
                "aggs": {
                    "se_pv_uv": {
                        "terms": {
                            "field": "se"
                        },
                        "aggs": {
                            "pv": {
                                "sum": {
                                    "script": "1"
                                }
                            },
                            "uv": {
                                "cardinality": {
                                    "field": "tt"
                                }
                            }
                            //"test": {
                            //    "terms": {
                            //        "script": ""
                            //    }
                            //}
                        }
                    },
                    "all_uv": {
                        "cardinality": {
                            "field": "tt"
                        }
                    }
                }
            }
        }
        es.search(request, function (error, response) {
            var data = [];
            var path1Data = [];
            if (response != undefined && response.aggregations != undefined) {
                var result = response.aggregations;
                var mostOfResult = result.se_pv_uv.buckets;
                for (var i = 0; i < mostOfResult.length; i++) {
                    data.push({
                        "pathName": mostOfResult[i].key,
                        "pv": mostOfResult[i].pv.value,
                        "uv": ((Number(mostOfResult[i].uv.value) / Number(result.all_uv.value)) * 100).toFixed(2) + "%"
                    });
                }
                callbackFn(data);
            } else
                callbackFn(data);
        });
    },
    offsitelinksSearch: function (es, indexs, targetPathName, callbackFn) {
        var request = {
            index: indexs,
            type: null,
            body: {
                "size": 0,
                "aggs": {
                    "all_pv": {
                        "filters": {
                            "filters": {
                                "data": {
                                    "term": {
                                        "loc": targetPathName
                                    }
                                }
                            }
                        },
                        "aggs": {
                            "pv": {
                                "value_count": {
                                    "field": "rf"
                                }
                            }
                        }
                    },
                    "in_pv": {
                        "filters": {
                            "filters": {
                                "data": {
                                    "bool": {
                                        "must": //{
                                        //    "term": {
                                        //        "rf_type": "3"
                                        //    }
                                        //},
                                        {
                                            "term": {
                                                "loc": targetPathName
                                            }
                                        }

                                    }
                                }
                            }
                        },
                        "aggs": {
                            "filtered_data": {
                                "terms": {
                                    "field": "dm"
                                },
                                "aggs": {
                                    "pv": {
                                        "value_count": {
                                            "field": "rf"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "out_pv": {
                        "filters": {
                            "filters": {
                                "data": {
                                    "bool": {
                                        "must": [
                                            {
                                                "range": {
                                                    "rf_type": {
                                                        "gt": "0",
                                                        "lt": "4"
                                                    }
                                                }
                                            },
                                            {
                                                "term": {
                                                    "rf": targetPathName
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        "aggs": {
                            "filtered_data": {
                                "terms": {
                                    "field": "loc"
                                },
                                "aggs": {
                                    "pv": {
                                        "value_count": {
                                            "field": "loc"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        es.search(request, function (error, response) {
            var data = [];//总结果
            var targetPathName_pv = [];//监控目标的pv
            var in_data = [];//进过其他页面跳入的监控目标页面的pv
            var out_data = [];//流经监控目标的pv
            var out_site = [];//离站占比
            if (response != undefined && response.aggregations != undefined) {
                var result = response.aggregations;
                targetPathName_pv.push({
                    "pathname": targetPathName,
                    "pv": result.all_pv.buckets.data.pv.value
                });
                var in_pv_sum = 0;
                for (var i = 0; i < result.in_pv.buckets.data.filtered_data.buckets.length; i++) {
                    in_pv_sum += Number(result.in_pv.buckets.data.filtered_data.buckets[i].pv.value);
                    in_data.push({
                        "pathname": result.in_pv.buckets.data.filtered_data.buckets[i].key,
                        "proportion": ((Number(result.in_pv.buckets.data.filtered_data.buckets[i].pv.value) / Number(result.all_pv.buckets.data.pv.value)) * 100).toFixed(2) + "%",
                        "pv": result.in_pv.buckets.data.filtered_data.buckets[i].pv.value
                    });
                }
                if(in_pv_sum<Number(targetPathName_pv[0].pv)){
                    in_data.push({
                        "pathname":"直接输入网址",
                        "proportion":(Number(result.all_pv.buckets.data.pv.value)-in_pv_sum)/Number(result.all_pv.buckets.data.pv.value)+"%",
                        "pv":(Number(result.all_pv.buckets.data.pv.value)-in_pv_sum)
                    })
                }
                var out_pv_sum = 0;
                console.log(result.out_pv.buckets.data.filtered_data.buckets);
                for (var i = 0; i < result.out_pv.buckets.data.filtered_data.buckets.length; i++) {
                    out_data.push({
                        "pathname": result.out_pv.buckets.data.filtered_data.buckets[i].key,
                        "proportion": ((Number(result.out_pv.buckets.data.filtered_data.buckets[i].pv.value) / Number(result.all_pv.buckets.data.pv.value)) * 100).toFixed(2) + "%",
                        "pv": result.out_pv.buckets.data.filtered_data.buckets[i].pv.value
                    });
                    out_pv_sum += Number(result.out_pv.buckets.data.filtered_data.buckets[i].pv.value);
                }

                if (out_pv_sum == 0) {
                    out_site.push({
                        "proportion": "100%"
                    });
                } else if (out_pv_sum == Number(result.all_pv.buckets.data.pv.value)) {
                    out_site.push({
                        "proportion": "0%"
                    });
                } else {
                    out_site.push({
                        "proportion": (((Number(result.all_pv.buckets.data.pv.value) - out_pv_sum) / Number(result.all_pv.buckets.data.pv.value)) * 100).toFixed(2) + "%"
                    });
                }

                data.push({
                    "targetPathName_pv": targetPathName_pv,
                    "in_data": in_data,
                    "out_data": out_data,
                    "out_site": out_site
                });
                callbackFn(data);

            } else
                callbackFn(data);
        });
    },
    offsitelinksSearchForPathName: function (es, indexs, pathName, callbackFn) {
        var request = {
            index: indexs,
            type: null,
            body: {
                "size": 0,
                "query": {
                    "bool": {
                        "should": requestBodyBoolForPathName(pathName)
                    }
                },
                "aggs": {
                    "pv_uv": {
                        "terms": {
                            "field": "loc"
                        },
                        "aggs": {
                            "uv": {
                                "cardinality": {
                                    "field": "tt"
                                }
                            },
                            "pv": {
                                "value_count": {
                                    "field": "loc"
                                }
                            }
                        }
                    },
                    "uv": {
                        "cardinality": {
                            "field": "tt"
                        }
                    }
                }
            }
        };
        es.search(request, function (error, response) {
            var data = [];
            var path1Data = [];
            if (response != undefined && response.aggregations != undefined) {
                var result = response.aggregations;
                console.log(result);
                for (var i = 0; i < result.pv_uv.buckets.length; i++) {
                    //for(var k = 0;k<pathName.split(",").length;k++){
                    //    if(result.pv_uv.buckets[i].key==pathName.split(",")[k]){
                    data.push({
                        name: result.pv_uv.buckets[i].key,
                        count: result.pv_uv.buckets[i].pv.value,
                        ratio: ((Number(result.pv_uv.buckets[i].uv.value) / Number(result.uv.value)) * 100).toFixed(2) + "%"
                    });
                    //        break;
                    //    }
                    //}

                }
                console.log(data);
                callbackFn(data);
            } else
                callbackFn(data);
        });

    }

};
var requestBodyBoolForPathName = function (value) {
    var data = value.split(",");
    var requestSentence = [];
    for (var i = 0; i < data.length; i++) {
        requestSentence.push({
            term: {
                "loc": data[i]
            }
        });

    }
    console.log(requestSentence)
    return requestSentence;
}
var exchangeField = function (value) {
    if (value.indexOf(",") == -1) {
        return "loc";
    } else {
        return "_type";
    }
}
module.exports = access_request;
//去重
//Array.prototype.removal = function () {
//    this.sort();
//    var re = [this[0]];
//    for (var i = 1; i < this.length; i++) {
//        if (this[i] !== re[re.length - 1]) {
//            re.push(this[i]);
//        }
//    }
//    return re;
//}