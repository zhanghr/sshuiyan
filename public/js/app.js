/**
 * Created by weims on 2015/5/15.
 */
define([
    "angular",
    "./controller/module",
    "./controller/trend/module",
    "./controller/source/module",
    "./controller/page/module",
    "./controller/visitor/module",
    "./controller/value/module",
    "./controller/conf/module",
    "./controller/transform/module",
    "./controller/ads/module",
    "./controller/group_analysis/module",
    "./controller/subcatalog/module",
    "js002",
    "js003",
    "js006",
    "./angularjs/ui-bootstrap-tpls",
    "./angularjs/ui-grid-unstable.min"
], function (angular) {

    'use strict';

    var myApp = angular.module("myApp", [
        "app.controllers",
        "trend.controllers",
        "source.controllers",
        "page.controllers",
        "visitor.controllers",
        "value.controllers",
        "conf.controllers",
        "transform.controllers",
        "ads.controllers",
        "group_analysis.controllers",
        "subcatalog.controllers",
        'ui.grid',
        'ui.grid.autoResize',
        'ui.grid.grouping',
        'ui.grid.expandable',
        'ui.grid.pagination',
        'ui.grid.treeView',
        'ui.bootstrap',
        'ngDialog',
        'ngSanitize',
        'ui.select',
        'ui.grid.selection'


    ]);

    myApp.constant('SEM_API_URL', 'http://api.hy.best-ad.cn');

    myApp.controller('menuctr', function ($scope, $rootScope, $location) {
        $scope.oneAtATime = true;
        // 项目导航模块。用于页面刷新时，当前选中模块index的获取
        $scope.array = ["index", "extension", "trend", "source", "page", "visitor", "value", "transform", "ads", "group_analysis", "subcatalog"];
        $scope.selectRestaurant = function (row) {
            $scope.selectedRow = row;
        };
        var menu = $location.path();
        $scope.menuClass = function (menu, hrefs, i) {
            if ("" === menu || menu === "/conf") {

                return 0;
            }
            if ((menu.indexOf(hrefs[i]) != -1 & menu.indexOf(hrefs[i]) < 3) || i > hrefs.length) {
                return i;
            }
            return $scope.menuClass(menu, hrefs, i + 1);
        };
        if (menu.indexOf("/conf") != -1) {
            $scope.selectedRow = menu.length > 6 ? 1 : 0;
        } else {
            $scope.selectedRow = $scope.menuClass(menu, $scope.array, 0);
        }
        $scope.groups = [
            {
                title: '趋向分析 ',
                content: 'Dynamic Group Body - 1',
                template: "<h3>Hello, Directive</h3>"
            },
            {
                title: 'Dynamic Group Header - 2',
                content: 'Dynamic Group Body - 2'
            }
        ];

        $scope.items = ['Item 1', 'Item 2', 'Item 3'];

        $scope.addItem = function () {
            var newItemNo = $scope.items.length + 1;
            $scope.items.push('Item ' + newItemNo);
        };
        $scope.currentMenu = "menuFirst";
        $scope.selectMenu = function (menu) {
            $scope.currentMenu = menu;
        }

        $scope.$on("$locationChangeSuccess", function (e, n, o) {
            if ($location.path().indexOf("/conf") != -1) {// 后台管理
                $scope.expanders = angular.copy($scope.adminmenus);
            } else {
                $scope.expanders = angular.copy($scope.frontmenus);
            }
        });

        $scope.frontmenus = [
            {
                title: '网站概览',
                icon: 'glyphicon glyphicon-th-large',
                stype: 0,
                sref: '#index',
                current: 'current'
            }, {
                title: '百度推广',
                icon: 'glyphicon glyphicon-asterisk',
                stype: 2,
                sref: 'extension',
                child: [{
                    text: '推广概况',
                    sref: '#extension/survey'
                }, {
                    text: '推广方式',
                    sref: '#extension/way'
                }, {
                    text: '搜索推广',
                    sref: '#extension/search'
                }, {
                    text: '网盟推广',
                    sref: '#extension/alliance'
                }, {
                    text: '推广URL速度',
                    sref: '#extension/urlspeed'
                }
                ]
            }, {
                title: '趋向分析',
                icon: 'glyphicon glyphicon-stats',
                stype: 1,
                sref: 'trend',
                child: [{
                    text: '实时访客',
                    sref: '#trend/realtime'
                }, {
                    text: '今日统计',
                    sref: '#trend/today'
                }, {
                    text: '昨日统计',
                    sref: '#trend/yesterday'
                }, {
                    text: '最近30天',
                    sref: '#trend/month'
                }]
            }, {
                title: '来源分析',
                icon: 'glyphicon glyphicon-globe',
                stype: 1,
                sref: 'source',
                child: [{
                    text: '全部来源',
                    sref: '#source/source'
                }, {
                    text: '搜索引擎',
                    sref: '#source/searchengine'
                }, {
                    text: '搜索词',
                    sref: '#source/searchterm'
                }, {
                    text: '外部链接',
                    sref: '#source/externallinks'
                }, {
                    text: '来源变化榜',
                    sref: '#source/changelist'
                }]
            }, {
                title: '页面分析',
                icon: 'glyphicon glyphicon-blackboard',
                stype: 1,
                sref: 'page',
                child: [{
                    text: '受访页面',
                    sref: '#page/indexoverview'
                }, {
                    text: '入口页面',
                    sref: '#page/entrancepage'
                }, {
                    text: '页面热点图',
                    sref: '#page/pagetitle'
                }/*, {
                 text: '离站链接',
                 sref: '#page/offsitelinks'
                 }*/]
            }, {
                title: '访客分析',
                icon: 'glyphicon glyphicon-signal',
                stype: 1,
                sref: 'visitor',
                child: [{
                    text: '访客地图',
                    sref: '#visitor/provincemap'
                }, {
                    text: '设备环境',
                    sref: '#visitor/equipment'
                }, {
                    text: '新老访客',
                    sref: '#visitor/novisitors'
                }/*, {
                 text: '访客特征',
                 sref: '#visitor/visitorfeature'
                 }*/]
            }, {
                title: '价值透析',
                icon: 'glyphicon glyphicon-yen',
                stype: 1,
                sref: 'value',
                child: [{
                    text: '流量地图',
                    sref: '#value/exchange'
                }, {
                    text: '频道流转',
                    sref: '#value/trafficmap'
                }]
            }, {
                title: '转化分析',
                icon: 'glyphicon glyphicon-sort',
                stype: 0,
                sref: '#transform/transformAnalysis'
            }, {
                title: '指定广告跟踪',
                icon: 'glyphicon glyphicon-map-marker',
                stype: 0,
                sref: '#ads/adsSource'
            }, {
                title: '同类群组分析',
                icon: 'glyphicon glyphicon-list-alt',
                stype: 0,
                sref: '#group_analysis/sameGroupAnalysis'
            },
            {
                title: '子目录',
                icon: 'glyphicon glyphicon-list',
                stype: 0,
                sref: '#subcatalog/subcatalog'
            }
        ];
        $scope.adminmenus = [
            {
                title: '网站列表',
                icon: 'glyphicon glyphicon-list',
                stype: 0,
                sref: '#conf',
                current: 'current'
            },
            {
                title: '网站统计设置',
                icon: 'glyphicon glyphicon-cog',
                stype: 1,
                sref: 'webcountsite',
                child: [{
                    text: ' 统计规则设置',
                    sref: '#conf/webcountsite/countrules'
                }, {
                    text: '子目录管理',
                    sref: '#conf/webcountsite/childlist'
                }, {
                    text: '页面转化目标',
                    sref: '#conf/webcountsite/pagechange'
                }, {
                    text: '事件转化目标',
                    sref: '#conf/webcountsite/eventchange'
                }, {
                    text: '时长转化目标',
                    sref: '#conf/webcountsite/timechange'
                }, {
                    text: '指定广告跟踪',
                    sref: '#conf/webcountsite/adtrack'
                }]
            }
            //{
            //    title: '系统管理设置',
            //    icon: 'glyphicon glyphicon-user',
            //    stype: 1,
            //    sref: 'admin',
            //    child: [{
            //        text: ' 权限账户管理',
            //        sref: '#conf/admin/root'
            //    }, {
            //        text: '统计图标设置',
            //        sref: '#conf/admin/counticon'
            //    }, {
            //        text: '报告发送设置',
            //        sref: '#conf/admin/reportsite'
            //
            //    }]
            //}
        ];

    });


    /*********nav-select*********/
    myApp.controller('ngSelect', function ($scope, $location, $cookieStore, $window, $rootScope, $state, $http) {
        $scope.clear = function () {
            $scope.siteselect.selected = undefined;
        };

        $scope.initPerfectAccount = function () {
            var userObj = $cookieStore.get('uname');
            $rootScope.perfectUser = userObj;
            $rootScope.user = userObj;
            $rootScope.usites = $cookieStore.get('usites');
            $rootScope.default = $rootScope.usites!=undefined&&$rootScope.usites.length>0 ? $rootScope.usites[0].site_name : '用户信息加载失败，请重新刷新页面！';     // default site
            $rootScope.defaultType = $rootScope.usites!=undefined&&$rootScope.usites.length>0 ? $rootScope.usites[0].type_id : '暂无';   // default site id
            $http.get("/api/initSchedule");
        }
        $scope.initPerfectAccount();
        $scope.siteselect = {};
        $scope.siteselects = $rootScope.usites;
        if ($rootScope.usites!=undefined&&$rootScope.usites.length>0) {
            $rootScope.baiduAccount = $rootScope.usites[0].bd_name;//baidu-perfect2151880
            $rootScope.userType = $rootScope.usites[0].type_id;//www.perfect-cn.cn
            $rootScope.siteId = $rootScope.usites[0].site_id;
            $rootScope.userTypeName = $rootScope.usites[0].site_name;
            $rootScope.siteUrl = $rootScope.usites[0].site_url;
            $rootScope.siteTrackId = $rootScope.usites[0].site_track_id;
        }
        $scope.changeUrl = function (select) {
            $rootScope.user = $rootScope.perfectUser;
            $rootScope.baiduAccount = select.bd_name;
            $rootScope.userType = select.type_id;
            $rootScope.siteId = select.site_id;
            $rootScope.siteUrl = select.site_url;
            $rootScope.userTypeName = select.site_name;
            $rootScope.siteTrackId = select.site_track_id;
            $http.get("/api/initSchedule");
            if ($location.path().indexOf("conf") > -1) {
                $state.go("conf");
            } else {
                $state.go("index");
            }

        }
    });


    myApp.run(function ($rootScope) {

        $rootScope.$on("$locationChangeStart", function () {
            $rootScope.datePickerCompare = function () {
                // 处理datePickerCompare方法不存在的问题
            }
            $rootScope.timeFilter = null;
        });

        $rootScope.copy = function (obj) {
            return angular.copy(obj);
        };

        // 获取table行index
        // 求别删
        $rootScope.getIndex = function (b) {
            return b.$parent.$parent.rowRenderIndex + 1;
        };
        // 获取通用表格的PDF长度
        $rootScope.getPDFTableWidths = function (dataHeadInfo) {
            var tableHeadObj = [];
            for (var i = 0; i < dataHeadInfo.length; i++) {
                if (dataHeadInfo[i].field != undefined) {
                    tableHeadObj.push(i == 0 ? 100 : "auto");
                }
            }
            return tableHeadObj;
        };
        // 获取通用表格的PDF下载数据
        $rootScope.getPDFTableBody = function (dataInfo, dataHeadInfo) {
            var _tableBody = [];
            var tableHeadObj = [];
            for (var i = 0; i < dataHeadInfo.length; i++) {
                if (dataHeadInfo[i].field != undefined) {
                    tableHeadObj.push(dataHeadInfo[i].field);
                }
            }
            _tableBody.push(tableHeadObj);
            for (var i = 0; i < dataInfo.length; i++) {
                var _obj = dataInfo[i];
                var _array = [];
                for (var j = 0; j < dataHeadInfo.length; j++) {
                    if (dataHeadInfo[j].field != undefined) {
                        var _t = _obj[dataHeadInfo[j].field];
                        if (_t["text"]) {
                            var arr = (_t["text"] + "").split('');
                            for (var m = 9; m < arr.length; m += 10) {
                                arr[m] += ' ';
                            }
                            _array.push(arr.join(""));
                        } else {
                            var arr = (_t + "").split('');
                            for (var m = 9; m < arr.length; m += 10) {
                                arr[m] += ' ';
                            }
                            _array.push(arr.join(""));
                        }
                    }
                }
                _tableBody.push(_array);
            }
            return _tableBody;
        };

    });

    return myApp;
});
