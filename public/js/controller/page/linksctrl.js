/**
 * Created by john on 2015/3/30.
 */
define(["./module"], function (ctrs) {

    "use strict";

    ctrs.controller('linksctrl', function ($scope, $rootScope, $http, $modal, $log, requestService, messageService, areaService) {
        $scope.todayClass = true;
        $scope.dt = new Date();
        $scope.dayClass = true;
        $scope.isCollapsed = true;

        $scope.links = [{
            "id": 1,
            "name": "http://jsfiddle.net/czerwin/5qFzg/4/",
            "ratio": "50%",
            "count": 213
        }, {
            "id": 2,
            "name": "http://jsfiddle.net/czerwin/5qFzg/4/",
            "ratio": "50%",
            "count": 213
        }, {
            "id": 3,
            "name": "http://jsfiddle.net/czerwin/5qFzg/4/",
            "ratio": "50%",
            "count": 213
        }, {
            "id": 4,
            "name": "http://jsfiddle.net/czerwin/5qFzg/4/",
            "ratio": "50%",
            "count": 213
        },
            {
                "id": 4,
                "name": "http://jsfiddle.net/czerwin/5qFzg/4/",
                "ratio": "50%",
                "count": 213
            }
        ];
        $scope.offsitelinks = [
            {
                "id": 1,
                "name": "http://127.0.0.1:8000/#/page/offsitelinks"
            },
            {
                "id": 2,
                "name": "http://127.0.0.1:8000/#/extension/survey"
            }
        ]
        $scope.hoverIn = function () {
            this.hoverEdit = true;
        };
        $scope.hoverOut = function () {
            this.hoverEdit = false;
        };
        $scope.weblink = function () {
            $scope.isCollapsed = true
            $scope.offsitelinks = offsitelink.value;

        }
        $scope.timeselect = true;
        $scope.reset = function () {
            $scope.todayClass = false;
            $scope.yesterdayClass = false;
            $scope.sevenDayClass = false;
            $scope.monthClass = false;
            $scope.definClass = false;
        };
        $scope.today = function () {
            $scope.reset();
            $scope.todayClass = true;
            $rootScope.start = 0;
            $rootScope.end = 0;
        };
        $scope.yesterday = function () {
            $scope.reset();
            $scope.yesterdayClass = true;
            $rootScope.start = -1;
            $rootScope.end = -1;
        };
        $scope.sevenDay = function () {
            $scope.reset();
            $scope.sevenDayClass = true;
            $rootScope.start = -7;
            $rootScope.end = -1;
            $rootScope.interval = 7;

        };
        $scope.month = function () {
            $scope.reset();
            $scope.monthClass = true;
            $rootScope.start = -30;
            $rootScope.end = -1;
            $rootScope.interval = 30;

        };
        $scope.open = function ($event) {
            $scope.opened = true;
            $scope.reset();
            $scope.definClass = true;
        };

        $scope.hourcheck = function () {
            $scope.hourcheckClass = true;
            $scope.dayClass = false;
            $scope.timeselect = false;

        };
        $scope.daycheck = function () {
            $scope.hourcheckClass = false;
            $scope.dayClass = true;
            $scope.timeselect = true;

            $scope.today();
        };


        //index select
        //弹窗

        $scope.open = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

        };
        //日历
        this.selectedDates = [new Date().setHours(0, 0, 0, 0)];
        this.type = 'range';
        /*      this.identity = angular.identity;*/

        this.removeFromSelected = function (dt) {
            this.selectedDates.splice(this.selectedDates.indexOf(dt), 1);
        }
        function GetDateStr(AddDayCount) {
            var dd = new Date();
            dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
            var y = dd.getFullYear();
            var m = dd.getMonth() + 1;//获取当前月份的日期
            var d = dd.getDate();
            return y + "-" + m + "-" + d;
        }
        //刷新
        $scope.page_refresh = function(){
            $rootScope.start = 0;
            $rootScope.end = 0;
            $rootScope.tableTimeStart = 0;
            $rootScope.tableTimeEnd = 0;
            $scope.reloadByCalendar("today");
            $('#reportrange span').html(GetDateStr(0));
            //classcurrent
            $scope.reset();
            $scope.todayClass = true;
        };
    });

    ctrs.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

});
