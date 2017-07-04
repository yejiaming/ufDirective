/**
 * Created by Administrator on 2016/5/9.
 */
/**
 *  自定一个filter,日期20161111格式化成2016-11-11
 */
define(['IFS'], function (app) {
    app.filter("hsFormatDict", ["dicts", function (dicts) {
        return function (strTime,param) {
            if(angular.isUndefined(strTime)){
                return;
            }
            var dictChildEntry = strTime;    //字典子项
            var dictEntry = param;        //字典条目
            var dictEntrys = [];
            var reg = /^[A-Za-z]+$/;
            if (dicts.isJson(dictEntry) && angular.isArray(JSON.parse(dictEntry))) {
                dictEntrys = JSON.parse(dictEntry);
            } else {
                dictEntrys = dicts.getDictType(dictEntry);
            }
            for (var i = 0; i < dictEntrys.length; i++) {
                if (dictEntrys[i].code === dictChildEntry) {
                    return dictEntrys[i].value;
                }
            }
            return strTime;
        }
    }])

    app.filter("formatStrToDate", function () {
            return function (strTime) {
                var strTime = strTime + "";
                if (strTime.length != 8) {
                    return strTime;
                }
                return strTime.substring(0, 4) + "-" + strTime.substring(4, 6) + "-" + strTime.substring(6, 8);
            }
        }
    );
    /**
     * 格式化时间戳成20121011
     */
    app.filter("formatTimeStamp", function () {
            return function (_strTime) {
                var strTime = _strTime +'';
                strTime = strTime.replace(/ GMT.+$/, '');// Or str = str.substring(0, 24)
                var d = new Date(strTime);
                console.log(d);
                var a = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
                for(var i = 0, len = a.length; i < len; i ++) {
                    if(a[i] < 10) {
                        a[i] = '0' + a[i];
                    }
                }
                strTime = a[0] + a[1] + a[2];
                console.log(strTime);
                return strTime;
            }
        }
    );
    /**
     * 格式化成2016年06月11日
     */
    app.filter("formatToDateChina", function () {
            return function (strTime) {
                var strTime = strTime + "";
                if (strTime.length != 8) {
                    return strTime;
                }
                return strTime.substring(0, 4) + "年" + strTime.substring(4, 6) + "月" + strTime.substring(6, 8)+'日';
            }
        }
    );
    /**
     *  自定一个filter,时间161111格式化成16：11:11
     */
    app.filter("formatStrToTime", function () {
            return function (strTime) {
                var strTime = strTime + "";
                if (strTime.length <= 6) {
                    if (strTime.length < 6) {
                        for (var i = strTime.length; i < 6; i++) {
                            strTime = "0" + strTime;
                        }
                    }
                    return strTime.substring(0, 2) + ":" + strTime.substring(2, 4) + ":" + strTime.substring(4, 6);
                } else {
                    return strTime;
                }

            }
        }
    );

    /**
     * 租户ID换Name
     */
    app.filter("tenantIdToName", function () {
            return function (tenantId) {
                var output = tenantId;
                var branch_list = JSON.parse(sessionStorage.getItem("allBranchListData"));
                if(null != branch_list){
                    for(i=0;i<branch_list.length;i++){
                        if (branch_list[i].branchCode == tenantId){
                            output = branch_list[i].branchName;
                            break;
                        }
                    }
                }
                return output;
            }
        }
    );

    /**
     * 菜单filter
     */
    app.filter("menuFilter", function () {
        return function(input,param) {
            var output = [];
            angular.forEach(input, function(v){
                if (!v.menu_site.indexOf(param)) {
                    output.push(v);
                }
            });
            return output;
        }
    });

    /**
     * 将URL地址转成信任地址
     */
    app.filter('trustAsResourceUrl', ['$sce', function($sce) {
        return function(val) {
            return $sce.trustAsResourceUrl(val);
        };
    }]);
    app.filter("toDate", function($filter) {
        return function(date) {
            date = new Date(date);
            var fmt = "yyyy-MM-dd hh:mm:ss";
            var d = (date == undefined || date == null) ? new Date() : new Date(date);
            fmt = (fmt == undefined || fmt == "") ? DateTools.default : fmt;
            var o = {
                "M+" : d.getMonth()+1,         //月份
                "d+" : d.getDate(),          //日
                "h+" : d.getHours(),          //小时
                "m+" : d.getMinutes(),         //分
                "s+" : d.getSeconds(),         //秒
                "q+" : Math.floor((d.getMonth()+3)/3), //季度
                "S" : d.getMilliseconds()       //毫秒
            };

            if(/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for(var k in o)
                if(new RegExp("("+ k +")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            return fmt;
        }
    });
})
