/**
 * Created by XiaoWei on 2015/6/13.
 */
var daos = require('../db/daos'),
    dateutils = require('../utils/date'),
    async = require('async');

var security = {
    login: function (req, res, next) {
        res.cookie('uname', JSON.stringify(req.session.user.userName), {maxAge: 60 * 60 * 1000});
        res.cookie('uid', JSON.stringify(req.session.user.id), {maxAge: 60 * 60 * 1000});
        daos.findSync('sites_model', JSON.stringify({uid: req.session.user.id}), null, {}, function (err, docs) {
            var usites = [{
                'site_id': -1,
                'site_name': '<无>',
                'type_id': -1,
                'site_top': 1,
                site_track_id: 1
            }];
            if (docs) {
                if (docs.length > 0) {
                    usites = [];
                    docs.forEach(function (item) {
                        if (item.is_use == 1) {
                            var site = {};
                            site['site_id'] = item._id.toString();
                            site["site_name"] = item.site_name;
                            site['site_track_id'] = item.track_id;
                            if (item.is_top)
                                site["site_top"] = 1;
                            else
                                site["site_top"] = 0;

                            site["type_id"] = item.type_id;
                            site["site_url"] = item.site_url;
                            if (!!req.session.user.baiduAccounts && req.session.user.baiduAccounts.length > 0)
                                site["bd_name"] = req.session.user.baiduAccounts[0].baiduUserName;

                            usites.push(site);
                        }
                    });
                }
            }
            usites.sort(dateutils.by('site_top'));
            res.cookie('usites', '' + JSON.stringify(usites) + '', {maxAge: 60 * 60 * 1000});
            next();
        });
    }
}
module.exports = security;