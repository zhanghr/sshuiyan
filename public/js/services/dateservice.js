/**
 * Created by baizz on 15-3-25.
 */
app.service('requestService', ['$rootScope', '$http', function ($rootScope, $http) {
    this.request = function (id, start, end, opt) {
        var chart = echarts.init(document.getElementById(id));

        chart.showLoading({
            text: "正在努力的读取数据中..."
        });

        $http.get("/api/charts?start=" + start.getTime() + "&end=" + end.getTime() + "&type=" + opt.type).success(function (data) {

            console.log(data)

            var jsons = JSON.parse(data);

            var option = {
                calculable: true,
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        magicType: {show: true, type: ['line', 'bar']},
                        restore: {show: true},
                        saveAsImage: {show: true}
                    }
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: jsons.lables
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: []
            };

            var types = type.split(",");
            var lables = [];
            types.forEach(function (item) {

                var serie = {
                    name: item,
                    type: opt.chart,
                    data: jsons[item],
                    markPoint: {
                        data: [
                            {type: 'max', name: '最大值'},
                            {type: 'min', name: '最小值'}
                        ]
                    },
                    markLine: {
                        data: [
                            {type: 'average', name: '平均值'}
                        ]
                    }
                };
                option.series.push(serie)
            });


            chart.hideLoading();

            chart.setOption(option);


        }).error(function (err) {
            console.error(err)
        })
    }
}]);