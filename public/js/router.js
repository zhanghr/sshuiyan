/**
 * Created by weims on 2015/5/15.
 */
define(["angular", "app"], function (ng, app) {
    'use strict';

    app.config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.when('', '/index');

        $stateProvider
            .state('index', {
                url: '/index',
                templateUrl: '../home/main.html'
            })
            .state('realtime', {
                url: "/trend/realtime",
                templateUrl: "../trend/realtime.html"
            })
            .state('today', {
                url: "/trend/today",
                templateUrl: "../trend/today.html"
            })
            .state('yesterday', {
                url: "/trend/yesterday",
                templateUrl: "../trend/yesterday.html"
            })
            .state('month', {
                url: "/trend/month",
                templateUrl: "../trend/month.html"
            })
            .state('source', {
                url: "/source/source",
                templateUrl: "../source/source.html"
            })
            .state('searchengine', {
                url: "/source/searchengine",
                templateUrl: "../source/searchengine.html"
            })
            .state('searchterm', {
                url: "/source/searchterm",
                templateUrl: "../source/searchterm.html"
            })
            .state('externallinks', {
                url: "/source/externallinks",
                templateUrl: "../source/externallinks.html"
            })
            .state('visitedpages', {
                url: "/page/visitedpages",
                templateUrl: "../page/visitedpages.html"
            })
            .state('offsitelinks', {
                url: "/page/offsitelinks",
                templateUrl: "../page/offsitelinks.html"
            })
            .state('entrancepage', {
                url: "/page/entrancepage",
                templateUrl: "../page/entrancepage.html"
            })
            .state('entrancepage/1', {
                url: "/page/secendpage/flowanalysis",
                templateUrl: "../page/secendpage/flowanalysis.html"
            })
            .state('entrancepage/2', {
                url: "/page/secendpage/newvisitors",
                templateUrl: "../page/secendpage/newvisitors.html"
            })
            .state('entrancepage/3', {
                url: "/page/secendpage/attractivenessanalysis",
                templateUrl: "../page/secendpage/attractivenessanalysis.html"
            })
            .state('entrancepage/4', {
                url: "/page/secendpage/analysistransformation",
                templateUrl: "../page/secendpage/analysistransformation.html"
            })
            .state('pagetitle', {
                url: "/page/pagetitle",
                templateUrl: "../page/pagetitle.html"
            })
            /*      .state('heatmap', {
             url: "/page/heatmap",
             templateUrl: "../page/heatmap.html"
             })*/
            .state('indexoverview', {
                url: "/page/indexoverview",
                templateUrl: "../page/indexoverview.html"
            })
            .state('indexoverview/1', {
                url: "/page/indexoverview/pagevalue",
                templateUrl: "../page/secendpage/pagevalue.html"
            })
            .state('indexoverview/2', {
                url: "/page/secendpage/visitedpages",
                templateUrl: "../page/secendpage/visitedpages.html"
            })
            .state('indexoverview/3', {
                url: "/page/secendpage/exitpages",
                templateUrl: "../page/secendpage/exitpages.html"
            })
            .state('provincemap/1', {
                url: "/visitor/visitormap",
                templateUrl: "../visitor/visitormap.html"
            })
            .state('provincemap', {
                url: "/visitor/provincemap",
                templateUrl: "../visitor/provincemap.html"
            })
            .state('equipment', {
                url: "/visitor/equipment",
                templateUrl: "../visitor/equipment.html"
            })
            .state('novisitors', {
                url: "/visitor/novisitors",
                templateUrl: "../visitor/novisitors.html"
            })
            .state('visitorfeature', {
                url: "/visitor/visitorfeature",
                templateUrl: "../visitor/visitorfeature.html"
            })
            .state('survey', {
                url: "/extension/survey",
                templateUrl: "../extension/survey.html"
            })
            .state('search', {
                url: "/extension/search",
                templateUrl: "../extension/search.html"
            })
            .state('search_dy', {
                url: "/extension/search_dy",
                templateUrl: "../extension/search_dy.html"
            })
            .state('search_gjc', {
                url: "/extension/search_gjc",
                templateUrl: "../extension/search_gjc.html"
            })
            .state('search_cy', {
                url: "/extension/search_cy",
                templateUrl: "../extension/search_cy.html"
            })
            .state('search_ssc', {
                url: "/extension/search_ssc",
                templateUrl: "../extension/search_ssc.html"
            })
            .state('search_tg_url', {
                url: "/extension/search_tg_url",
                templateUrl: "../extension/search_tg_url.html"
            })
            .state('way', {
                url: "/extension/way",
                templateUrl: "../extension/way.html"
            })
            .state('urlspeed', {
                url: "/extension/urlspeed",
                templateUrl: "../extension/urlspeed.html"
            })
            .state('alliance', {
                url: "/extension/alliance",
                templateUrl: "../extension/alliance.html"
            })
            .state('exchange', {
                url: "/value/exchange",
                templateUrl: "../value/exchange.html"
            })
            .state('trafficmap', {
                url: "/value/trafficmap",
                templateUrl: "../value/trafficmap.html"
            })
    });
});