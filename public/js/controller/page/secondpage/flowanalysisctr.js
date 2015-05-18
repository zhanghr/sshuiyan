/**
 * Created by XiaoWei on 2015/4/22.
 */
app.controller('flowanalysisctr', function ($scope, $rootScope, $http, requestService, messageService, areaService, uiGridConstants) {
    $scope.todayClass = true;
    $scope.reset = function () {
        $scope.todayClass = false;
        $scope.yesterdayClass = false;
        $scope.sevenDayClass = false;
        $scope.monthClass = false;
        $scope.definClass = false;
        $scope.btnchecked = true;
    };

    //table配置
    $rootScope.tableTimeStart = 0;
    $rootScope.tableTimeEnd = 0;
    $rootScope.tableFormat = null;
    $rootScope.tableSwitch = {
        latitude: {name: "页面url", displayName: "页面url", field: "loc"},
        tableFilter: null,
        dimen: false,
        // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
        number: 0,
        //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
        coding: "<li><a ui-sref='history' ng-click='grid.appScope.getHistoricalTrend(this)' target='_parent'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看来源分布</a></li>",
        arrayClear: false
    };
    //


    $scope.onLegendClick = function (radio, chartInstance, config, checkedVal) {
        clear.lineChart(config, checkedVal);
        $scope.charts.forEach(function (chart) {
            chart.config.instance = echarts.init(document.getElementById(chart.config.id));
            chart.types = checkedVal;
        });
        requestService.refresh($scope.charts);
    }
    $scope.pieFormat = function (data, config) {
        var json = JSON.parse(eval("(" + data + ")").toString());
        cf.renderChart(json, config);
    }
    $scope.flowanalyFomrmat = function (data, config, e) {
        var json = JSON.parse(eval("(" + data + ")").toString());
        var result = chartUtils.getRf_type(json, $rootScope.start, "serverLabel", e.types);
        config['noFormat'] = true;
        config['twoYz'] = "none";
        if (result.length > 5) {
            result = result.slice(result.length - 5);
        }
        cf.renderChart(result, config);
        var final_result = chartUtils.getExternalinkPie(result);//获取barchart的数据
        var pieData = chartUtils.getEnginePie(final_result);
        $scope.charts[0].config.instance = echarts.init(document.getElementById($scope.charts[0].config.id));
        cf.renderChart(pieData, $scope.charts[0].config);
    }
    $scope.charts = [
        {
            config: {
                legendData: [],
                id: "sourse_charts",
                pieStyle: true,
                serieName: "入口页面",
                chartType: "pie",
                dataKey: "key",
                dataValue: "quota"
            },
            types: ["pv"],
            dimension: ["rf"],
            url: "/api/map",
            cb: $scope.pieFormat
        },
        {
            config: {
                legendId: "indicators_charts_legend",
                legendData: ["访客数(UV)", "访问次数", "新访客数", "IP数", "贡献浏览量", "转化次数"],
                legendClickListener: $scope.onLegendClick,
                legendAllowCheckCount: 1,
                id: "indicators_charts",
                min_max: false,
                bGap: true,
                chartType: "bar",
                keyFormat: 'none',
                dataKey: "key",
                dataValue: "quota"
            },
            types: ["pv"],
            dimension: ["period,loc"],
            interval: $rootScope.interval,
            url: "/api/charts",
            cb: $scope.flowanalyFomrmat
        }
    ]
    $scope.init = function () {
        $rootScope.start = 0;
        $rootScope.end = 0;
        $rootScope.interval = undefined;
        $scope.charts.forEach(function (e) {
            var chart = echarts.init(document.getElementById(e.config.id));
            e.config.instance = chart;
            util.renderLegend(chart, e.config);
        })
        requestService.refresh($scope.charts);
    }
    $scope.init();

    $scope.$on("ssh_refresh_charts", function (e, msg) {
        $rootScope.targetSearch();
        var chart = echarts.init(document.getElementById($scope.charts[1].config.id));
        $scope.charts[1].config.instance = chart;
        var arrayChart = [$scope.charts[1]]
        requestService.refresh(arrayChart);
    });
    //日历
    $scope.dateClosed = function () {
        $rootScope.start = $scope.startOffset;
        $rootScope.end = $scope.endOffset;
        $scope.charts.forEach(function (e) {
            var chart = echarts.init(document.getElementById(e.config.id));
            e.config.instance = chart;
        })
        if ($rootScope.start <= -1) {
            $scope.charts[0].config.keyFormat = "day";
        } else {
            $scope.charts[0].config.keyFormat = "hour";
        }
        requestService.refresh($scope.charts);
        $rootScope.targetSearch();
        $rootScope.tableTimeStart = $scope.startOffset;
        $rootScope.tableTimeEnd = $scope.endOffset;
        $scope.$broadcast("ssh_dateShow_options_time_change");
    };
    //

    this.selectedDates = [new Date().setHours(0, 0, 0, 0)];
    //this.type = 'range';
    /*      this.identity = angular.identity;*/
    //$scope.$broadcast("update", "msg");
    $scope.$on("update", function (e, datas) {
        // 选择时间段后接收的事件
        datas.sort();
        //console.log(datas);
        var startTime = datas[0];
        var endTime = datas[datas.length - 1];
        $scope.startOffset = (startTime - today_start()) / 86400000;
        $scope.endOffset = (endTime - today_start()) / 86400000;
        //console.log("startOffset=" + startOffset + ", " + "endOffset=" + endOffset);
    });
});