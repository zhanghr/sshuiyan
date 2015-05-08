/**
 * Created by XiaoWei on 2015/4/22.
 */
app.controller('entrancepagectr', function ($scope, $rootScope, $http, requestService) {
    $scope.todayClass = true;

    $rootScope.tableTimeStart = 0;
    $rootScope.tableTimeEnd = 0;
    $rootScope.tableSwitch = {
        latitude: {name: "页面url", field: "loc"},
        tableFilter: null,
        dimen: false,
        // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
        number: 2,
        //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
        coding: "<li><a href='http://www.best-ad.cn' target='_blank'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看来源分布</a></li>",
        arrayClear: true
    };

    $scope.onLegendClick = function (radio, chartInstance, config, checkedVal) {
        clear.lineChart(config, checkedVal);
        $scope.charts.forEach(function (chart) {
            chart.config.instance = echarts.init(document.getElementById(chart.config.id));
            chart.types = checkedVal;
        });
        requestService.refresh($scope.charts);
    }
    //
    //
    //
    $scope.pieFormat = function (data, config) {
        var json = JSON.parse(eval("(" + data + ")").toString());
        cf.renderChart(json, config);
    }
    $scope.mainFormat = function (data, config, e) {
        var json = JSON.parse(eval("(" + data + ")").toString());
        var result = chartUtils.getRf_type(json, $rootScope.start, "serverLabel", e.types);
        config['noFormat'] = true;
        config['twoYz'] = "none";

        /*===============TopN开始=============*/
        //if (result.length > 5) {
        //    var top = [];
        //    var _index = [];
        //    result.forEach(function (e, i) {
        //        var value = 0;
        //        e.quota.forEach(function (item) {
        //            value += item;
        //        });
        //        top.push(value);
        //        _index.push(i);
        //    });
        //}
        /*=================TopN结束==================*/
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
                bGap: true,
                min_max: false,
                chartType: "bar",
                keyFormat: 'none',
                dataKey: "key",
                dataValue: "quota"
            },
            types: ["pv"],
            dimension: ["period,loc"],
            interval: $rootScope.interval,
            url: "/api/charts",
            cb: $scope.mainFormat
        }
    ]
    $scope.init = function () {
        $rootScope.start = 0;
        $rootScope.end = 0;
        $rootScope.interval = undefined;
        var char = $scope.charts[1];
        var chart = echarts.init(document.getElementById(char.config.id));
        char.config.instance = chart;
        util.renderLegend(chart, char.config);
        var chartArray = [char];
        requestService.refresh(chartArray);
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
    this.selectedDates = [new Date().setHours(0, 0, 0, 0)];
    this.type = 'range';
    /*      this.identity = angular.identity;*/

    this.removeFromSelected = function (dt) {
        this.selectedDates.splice(this.selectedDates.indexOf(dt), 1);
    }
});