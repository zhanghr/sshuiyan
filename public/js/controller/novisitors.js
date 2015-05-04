/**
 * Created by SubDong on 2015/4/23.
 */
app.controller('novisitors', function ($scope, $rootScope, $http) {
    $scope.todayClass = true;
    $rootScope.tableTimeStart = 0;
    $rootScope.tableTimeEnd = 0;
    $rootScope.tableSwitch = {
        latitude:{name: "新老访客", field: "ct"},
        tableFilter:undefined,
        dimen:false,
        // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
        number:1,
        //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
        coding:false,
        //coding:"<li><a href='http://www.best-ad.cn'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看入口页连接</a></li>"
        arrayClear: true //是否清空指标array
    };
    $scope.defaultObject = {
        percent : "0.00%",
        pv : 0,
        uv : 0,
        outRate : 0,
        avgTime : "--",
        avgPage : 0
    };

    $scope.$on("ssh_refresh_charts", function(e, msg) {
        $rootScope.targetSearch();
        $scope.newVisitor = angular.copy($scope.defaultObject);
        $scope.oldVisitor = angular.copy($scope.defaultObject);
        $scope.newVisitorFwlywzTop5 = [];
        $scope.oldVisitorFwlywzTop5 = [];
        $scope.newVisitorFwrkyTop5 = [];
        $scope.oldVisitorFwrkyTop5 = [];
        $scope.loadBaseData();
        $scope.loadFwlywzData();
        $scope.loadFwrkyData();
    });

    $scope.initPage = function() {
        $scope.newVisitor = angular.copy($scope.defaultObject);
        $scope.oldVisitor = angular.copy($scope.defaultObject);
        $scope.newVisitorFwlywzTop5 = [];
        $scope.oldVisitorFwlywzTop5 = [];
        $scope.newVisitorFwrkyTop5 = [];
        $scope.oldVisitorFwrkyTop5 = [];
        $scope.loadBaseData();
        $scope.loadFwlywzData();
        $scope.loadFwrkyData();
    };
    // 读取基础数据
    $scope.loadBaseData = function() {
        $scope.sumPv = 0;
        $http({
            method: 'GET',
            url: '/api/indextable/?type=1&start=' + $rootScope.tableTimeStart + '&end=' + $rootScope.tableTimeEnd + '&indic=pv,uv,outRate,avgTime,avgPage&dimension=ct'
        }).success(function(data, status) {
            console.log(data);
            angular.forEach(data, function(e) {
                if("新访客" === e.ct) {
                    $scope.newVisitor = e;
                }
                if("老访客" === e.ct) {
                    $scope.oldVisitor = e;
                }
                $scope.sumPv += parseInt(e.pv);
            });
            if($scope.sumPv == 0) {
                $scope.newVisitor.percent = "0.00%";
                $scope.oldVisitor.percent = "0.00%";
            } else if($scope.newVisitor.pv == 0) {
                $scope.oldVisitor.percent = "100%";
            } else if($scope.oldVisitor.pv == 0) {
                $scope.newVisitor.percent = "100%";
            } else {
                $scope.newVisitor.percent = ($scope.newVisitor.pv * 100 / $scope.sumPv).toFixed(2) + "%";
                $scope.oldVisitor.percent = ($scope.oldVisitor.pv * 100 / $scope.sumPv).toFixed(2) + "%";
            }
        }).error(function(error) {
            console.log(error);
        });
    };
    // 访问来源网站TOP5
    $scope.loadFwlywzData = function() {
        $http({
            method: 'GET',
            url: '/api/fwlywz/?type=1&start=' + $rootScope.tableTimeStart + '&end=' + $rootScope.tableTimeEnd + '&indic=pv&ct=0'
        }).success(function(data, status) {
            console.log(data);
            $scope.newVisitorFwlywzTop5 = data;
        }).error(function(error) {
            console.log(error);
        });
        $http({
            method: 'GET',
            url: '/api/fwlywz/?type=1&start=' + $rootScope.tableTimeStart + '&end=' + $rootScope.tableTimeEnd + '&indic=pv&ct=1'
        }).success(function(data, status) {
            $scope.oldVisitorFwlywzTop5 = data;
        }).error(function(error) {
            console.log(error);
        });
    };
    // 访问入口页TOP5
    $scope.loadFwrkyData = function() {
        $http({
            method: 'GET',
            url: '/api/indextable/?type=1&start=' + $rootScope.tableTimeStart + '&end=' + $rootScope.tableTimeEnd + '&indic=vc&dimension=loc&filerInfo=[{"ct": ["0"]}]'
        }).success(function(data, status) {
            $scope.newVisitorFwrkyTop5 = data ? ((data.length > 5) ? data.slice(0, 5) : data) : [];
        }).error(function(error) {
            console.log(error);
        });
        $http({
            method: 'GET',
            url: '/api/indextable/?type=1&start=' + $rootScope.tableTimeStart + '&end=' + $rootScope.tableTimeEnd + '&indic=vc&dimension=loc&filerInfo=[{"ct": ["1"]}]'
        }).success(function(data, status) {
            $scope.oldVisitorFwrkyTop5 = data ? ((data.length > 5) ? data.slice(0, 5) : data) : [];
        }).error(function(error) {
            console.log(error);
        });
    };
});