/**
 * Created by john on 2015/4/2.
 */
define(["./../module"], function (ctrs) {

    "use strict";

    ctrs.controller('urlspeed_m', function ($scope, $q, $rootScope, $http, $cookieStore, requestService, messageService, areaService, uiGridConstants) {
        $scope.todayClass = true;

        //table配置
        $rootScope.tableTimeStart = 0;
        $rootScope.tableTimeEnd = 0;
        $rootScope.tableFormat = null;
        //配置默认指标
        $rootScope.checkedArray = ["pv", "vc"];
        $rootScope.gridArray = [
            {
                name: "xl",
                displayName: "",
                cellTemplate: "<div class='table_xlh'>{{grid.appScope.getIndex(this)}}</div>",
                maxWidth: 10,
                enableSorting: false
            },
            {
                name: "地域",
                displayName: "地域",
                field: "region",
                footerCellTemplate: "<div class='ui-grid-cell-contents'>当页汇总</div>",
                sort: {
                    direction: uiGridConstants.ASC,
                    priority: 0
                }
            },
            {
                name: " ",
                cellTemplate: "<div class='table_box'><button onmousemove='getMyButton(this)' class='table_btn'></button><div class='table_win'><ul style='color: #45b1ec'><li><a ng-click='grid.appScope.getHistoricalTrend(this, \"history\")' target='_parent' target='_blank'>查看历史趋势</a></li><li><a href='javascript:void(0)' ng-click='grid.appScope.showEntryPageLink(row, 1)'>查看入口页链接</a></li></ul></div></div>",
                enableSorting: false
                // cellTemplate:" <button popover-placement='right' popover='On the Right!' class='btn btn-default'>Right</button>"
            },
            {
                name: "打开速度",
                displayName: "打开速度",
                field: "openSpeed",
                footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getFooterData(this,grid.getVisibleRows())}}</div>"
            },
            {
                name: "访问次数",
                displayName: "访问次数",
                field: "vc",
                footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getFooterData(this,grid.getVisibleRows())}}</div>"
            }
        ];
        $rootScope.tableSwitch = {
            latitude: {name: "地域", displayName: "地域", field: "region"},
            tableFilter: null,
            dimen: false,
            // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
            number: 5,
            //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
            coding: false,
            //coding:"<li><a href='http://www.best-ad.cn'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看入口页连接</a></li>"
            arrayClear: false //是否清空指标array
        };
        //
        $scope.reset = function () {
            $scope.todayClass = false;
            $scope.yesterdayClass = false;
            $scope.sevenDayClass = false;
            $scope.monthClass = false;
            $scope.definClass = false;
        };
        // $scope.init();


        //$scope.initMap();
        //点击显示指标
        $scope.visible = false;
        $scope.select = function () {
            $scope.visible = false;
        };
        $scope.clear = function () {
            $scope.page.selected = undefined;
            $scope.city.selected = undefined;
            $scope.country.selected = undefined;
            $scope.continent.selected = undefined;
        };
        $scope.page = {};
        $scope.pages = [
            {name: '全部'},
            {name: '百思'},
            {name: '品牌计划'},
            {name: '通用词'}
        ];
        //日历
        $scope.$on("ssh_refresh_charts", function (e, msg) {
            $rootScope.targetSearch();
        });

        this.removeFromSelected = function (dt) {
            this.selectedDates.splice(this.selectedDates.indexOf(dt), 1);
        }
        //刷新
        $scope.page_refresh = function () {
//            $rootScope.start = -1;
//            $rootScope.end = -1;
//            $rootScope.tableTimeStart = -1;//开始时间
//            $rootScope.tableTimeEnd = -1;//结束时间、
//            $rootScope.tableFormat = null;
//            $rootScope.targetSearchSpread();
//            $scope.init($rootScope.user, $rootScope.baiduAccount, "creative", $scope.selectedQuota, $rootScope.start, $rootScope.end);
            //图表
//            requestService.refresh($scope.charts);
            //其他页面表格
            //classcurrent
            $scope.reloadByCalendar("today");
            $('#reportrange span').html(GetDateStr(0));
            $scope.$broadcast("ssh_dateShow_options_time_change");
            $scope.reset();
            $scope.today = true;
        };

        $rootScope.initMailData = function () {
            $http.get("api/saveMailConfig?rt=read&rule_url=" + $rootScope.mailUrl[1] + "").success(function (result) {
                if (result) {
                    var ele = $("ul[name='sen_form']");
                    formUtils.rendererMailData(result, ele);
                }
            });
        };

        $scope.sendConfig = function () {
            var formData = formUtils.vaildateSubmit($("ul[name='sen_form']"));
            var result = formUtils.validateEmail(formData.mail_address, formData);
            if (result.ec) {
                alert(result.info);
            } else {
                formData.rule_url = $rootScope.mailUrl[1];
                formData.uid = $cookieStore.get('uid');
                formData.site_id = $rootScope.siteId;
                formData.type_id = $rootScope.userType;
                formData.schedule_date = $scope.mytime.time.Format('hh:mm');
                $http.get("api/saveMailConfig?data=" + JSON.stringify(formData)).success(function (data) {
                    var result = JSON.parse(eval("(" + data + ")").toString());
                    if (result.ok == 1) {
                        alert("操作成功!");
                        $http.get("/api/initSchedule");
                    } else {
                        alert("操作失败!");
                    }
                });
            }
        };
    });

});

