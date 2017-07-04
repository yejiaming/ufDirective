/**
 * Created by Administrator on 2016/5/9.
 */
define(['IFS'], function (app) {
    /**
     * 该指令用于格式化数据字典
     */
    app.directive("hsFormatDict", ["dicts", function (dicts) {
        return {
            scope: {
                hsFormatDict: '@hsFormatDict'
            },
            link: function (scope, element, attrs) {
                var dictEntry = attrs.dictEntry;        //字典条目
                scope.$watch('hsFormatDict', function () {
                    var dictEntrys = [];
                    var reg = /^[A-Za-z]+$/;
                    if (dicts.isJson(dictEntry) && angular.isArray(JSON.parse(dictEntry))) {
                        dictEntrys = JSON.parse(dictEntry);
                    } else {
                        dictEntrys = dicts.getDictType(dictEntry);
                    }
                    for (var i = 0; i < dictEntrys.length; i++) {
                        if (dictEntrys[i].code === scope.hsFormatDict) {
                            element.html(dictEntrys[i].value);
                            return;
                        }
                    }
                })

            }
        }
    }])

    /**
     * 该指令用于格式化数据字典（只适用于table中）
     */
    /*app.directive("hsFormatDict", ["dicts", function (dicts) {
        return {
            link: function (scope, element, attrs) {
                var dictChildEntry = attrs.hsFormatDict;    //字典子项
                var dictEntry = attrs.dictEntry;        //字典条目
                var dictEntrys = [];
                var reg = /^[A-Za-z]+$/;
                if (dicts.isJson(dictEntry) && angular.isArray(JSON.parse(dictEntry))) {
                    dictEntrys = JSON.parse(dictEntry);
                } else {
                    dictEntrys = dicts.getDictType(dictEntry);
                }
                for (var i = 0; i < dictEntrys.length; i++) {
                    if (dictEntrys[i].code === dictChildEntry) {
                        element.html(dictEntrys[i].value);
                        return;
                    }
                }
            }
        }
    }])*/

    app.directive("hsFormatBusinessflag", ["businessflags", function (businessflags) {
        return {
            link: function (scope, element, attrs) {
                var bf = attrs.hsFormatBusinessflag;
                element.html(businessflags.getBusinessName(bf).businessName);
            }
        }
    }])

    app.directive('ngFocus', [function () {
        var FOCUS_CLASS = "ng-focused";
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$focused = false;
                ctrl.$isInit = true;
                element.bind('focus', function (evt) {
                    element.addClass(FOCUS_CLASS);
                    scope.$apply(function () {
                        ctrl.$focused = true;
                        ctrl.$isInit = false;
                    });
                }).bind('blur', function (evt) {
                    element.removeClass(FOCUS_CLASS);
                    scope.$apply(function () {
                        ctrl.$focused = false;
                    });
                });
            }
        };
    }]);

    app.directive('hsFormatToDate', [function () {
        return {
            restrict: 'EA',
            templateUrl: function () {
                return "template/formatDate.html";
            },
            scope: {
                date: '=',
                isOpen: '=',
                closeText: "=",
                dateOptions: "="
            },
            controller: ['$scope', function ($scope) {
                $scope.$watch('date', function (newValue, oldValue) {
                    if (newValue != "" && angular.isString(newValue) && newValue.length == 8) {
                        $scope.date = new Date($scope.date.substring(0, 4), $scope.date.substring(4, 6) - 1, $scope.date.substring(6, 8));
                    }
                });
            }]
        };
    }]);

    app.directive('checkDependency', function () {
        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, ctrl) {
                var info = (angular.isDefined(scope.ui) && scope.ui.bll != undefined) ? scope.ui.bll.checkList[attrs.checkDependency] : scope.bll.checkList[attrs.checkDependency];
                var modelData = (angular.isDefined(scope.ui) && scope.ui.modalData != undefined) ? scope.ui.modalData : (scope.ui.bll != undefined) ? scope.ui.bll.setParams : scope.bll.setParams;
                if (info != undefined && info.labels != undefined && info.labels.length > 0) {
                    ctrl.$parsers.push(function (val) {
                        if (!val || val.length === 0) {
                            return;
                        }
                        var hsLabel = info.handle(modelData, val);
                        for (var i = 0; i < info.labels.length; i++) {
                            if (info.labels[i] == hsLabel) {
                                ctrl.$setValidity(info.labels[i], false);
                            }
                            else {
                                ctrl.$setValidity(info.labels[i], true);
                            }
                        }
                        return val;
                    });
                }
            }
        }
    });

    app.directive('menuView', [function () {
        return {
            restrict: 'E',
            templateUrl: function () {
                return "template/menuView.html";
            },
            scope: {
                treeData: '=',
                id: "@",
                pid: "@",
                hasLeaf: "@",
                textField: '@',
                isLeft: '@',
                itemTemplateUrl: '@',
                itemClicked: '&',
                getIcon: "&",
                menu: "=",
                moveLeft: "&",
                isLeft: "=",
                showLeve: "@",
                children: "@"
            },
            controller: ['$scope', "$sce", function ($scope, $sce) {
                var preItem;
                var id = $scope.id;
                $scope.menuId = "";
                var copyPid = "$pid";
                var pid = $scope.pid ? $scope.pid : copyPid;
                var pidFlag = $scope.pid ? true : false;
                var children = $scope.children;
                var hasLeaf = $scope.hasLeaf;
                var getAllNode = function () {
                    return $scope.treeData;
                }
                /**
                 * 监听result结果集
                 */
                $scope.$watch("treeData", function (newValue, oldValue) {
                    if (angular.isUndefined(newValue) || newValue.length <= 0) {
                        return;
                    }
                    if (!pidFlag) {
                        hasParendId(newValue);
                    }
                }, true);
                /**
                 * 判断是否具有父级节点，没有就加上
                 */
                var hasParendId = function (tree) {
                    if (angular.isArray(tree)) {
                        var len = tree.length;
                        for (var i = 0; i < len; i++) {
                            var node = getNodeById(getAllNode(), tree[i][id]);
                            if (angular.isDefined(node[pid]) && node[pid]) {
                                tree[i][copyPid] = node[pid];
                            }
                            hasParendId(tree[i]);
                        }
                    } else {
                        if ($scope.isLeaf(tree)) {
                            var clen = tree[children].length
                            for (var i = 0; i < clen; i++) {
                                if (!tree[children][i][copyPid]) {
                                    tree[children][i][copyPid] = tree[id];
                                }
                            }
                            hasParendId(tree[children]);
                        }
                    }
                };
                $scope.getItemIcon = function (item) {
                    if (item[children] && item[children][0].leafFlag == '0') {
                        return item.$isExpend ? 'images/bottom.png' : 'images/left.png';
                    }

                };
                $scope.getIconCallBack = function (callback, item) {
                    return ($scope[callback] || angular.noop)({
                        item: item
                    });
                };

                /**
                 * 显示子节点
                 * @param callback
                 * @param item
                 * @param move
                 * @param isLeft
                 * @param $event
                 */
                $scope.warpCallback = function (callback, item, $event) {
                    if (item.$isExpend == undefined) {
                        item.$isExpend = false;
                    }
                    //改变节点颜色
                    $scope.menuId = item[id];
                    if (item[children] && item[children][0].leafFlag == '0') {
                        if (angular.element(document.querySelector('.left-side-collapsed')).length == 1) {
                            $scope.isLeft = false;
                            if (item.$isExpend == false) {
                                $scope.itemExpended(item, $event);
                            }
                        }
                        else if (angular.element(document.querySelector('.left-side-collapsed')).length == 0) {
                            $scope.itemExpended(item, $event);
                        }
                    } else {
                        //该函数调用了外部函数callback,并使用angular.noop，防止外部函数不存在的情况
                        ($scope[callback] || angular.noop)({
                            item: item,
                            $event: $event
                        });
                    }
                };
                /**
                 * 改变字节点的状态
                 */
                $scope.itemExpended = function (item, $event) {
                    item.$isExpend = !item.$isExpend;
                    $event.stopPropagation();
                };
                /**
                 * 判断是否含有子节点，并且子节点的长度大于0
                 * @param item
                 * @returns {boolean}
                 */
                $scope.isLeaf = function (item) {
                    return item[children] && item[children].length;
                };

                /**
                 * 通过ID判断两个节点是否相等
                 * @param node
                 * @param targetNode
                 * @param id
                 * @returns {boolean}
                 */
                var isEqual = function (node, targetNode, id) {
                    if (node[id] === targetNode[id]) {
                        return true;
                    } else {
                        return false;
                    }
                }
                /**
                 * 通过ID获取节点
                 * @param branch_no
                 */
                var getNodeById = function (arryNode, targetId) {
                    var len = arryNode.length;
                    for (var i = 0; i < len; i++) {
                        if (arryNode[i][id] === targetId) {
                            return arryNode[i];
                        } else {
                            if ($scope.isLeaf(arryNode[i])) {
                                var node = getNodeById(arryNode[i][children], targetId);
                                if (node) {
                                    return node;
                                }
                            }
                        }
                    }
                }
                /**
                 * 获取当前节点的父节点
                 */
                var getParent = function (node) {
                    if (node[pid]) {
                        return getNodeById(getAllNode, pid);
                    } else {
                        return getAllNode();
                    }
                };
                /**
                 *改变节点颜色
                 */
                var changeMenuStyle = function (item) {
                    item["$showFlag"] = true;
                    var nodes = getParent(item);
                    var len = nodes.length;
                    for (var i = 0; i < len; i++) {
                        if (item[id] !== nodes[i][id]) {
                            nodes[i]["$showFlag"] = false;
                        }
                    }
                }
            }]
        };
    }]);

    /**
     * 权限通用树
     */
    app.directive("rightTree", [function () {
        return {
            restrict: 'E',
            link: function ($scope, element, attrs) {
                // Trigger when number of children changes,
                // including by directives like ng-repeat
                var watch = $scope.$watch(function () {
                    return element.children().length;
                }, function () {
                    // Wait for templates to render
                    $scope.$evalAsync(function () {
                        // Finally, directives are evaluated
                        // and templates are renderer here
                        //$scope.initExpand();
                    });
                });
            },
            templateUrl: function () {
                return "template/rightView.html";
            },
            scope: {
                isRightTree: "=",   //是否是权限树
                treeData: '=',  //树的数据
                textField: '@', //节点显示名称
                mustDisplyText: '@', //必须显示的节点名称
                id: "@",          //id(唯一标识）
                pid: "@",        //父ID
                hasRight: "@",   //是否具有权限
                children: "@",      //孩子节点
                itemClicked: "&", //点击节点
                hasRightFun: "&",   //判断是否具有权限的外部方法
                searchCallback: "&",   //搜索的事件回调
                ownResult: "=",       //已经拥有权限的结果集
                ownResultFlag: "=",    //是否有已经拥有权限的结果集
                isChange: "=",        //是否改变
                changeRight: "&",        //改变权限的回调
                ownResultType: "@",        //已拥有的结果集是数组还是树
                displayNode: "=",        //显示某一个节点
                diplayAllFlag: "=",        //是否显示全部的textFiled
                addResult: "=",        //添加结果集
                delResult: "=",        //删除结果集
                showLevel: "@",        //显示等级,如：3，那么3节点之前都会被显示，在已拥有结果集的刷新的时候
                initShow: "@",        //权限树在初始化的时候是打钩，还是打岔
            },
            controller: ['$scope', function ($scope) {
                var children = $scope.children || "children";
                var textField = $scope.textField;
                var textFieldArray = textField.split(",");
                var fidldArry = textField.split(",");
                var mustDisplyText = $scope.mustDisplyText;
                var hasRight = $scope.hasRight;
                var pidFlag = $scope.pid ? true : false;
                /*总的是否含有pid*/
                var orPidFlag = pidFlag;
                /*orPidFlag表示已拥有结果集是否含有PID*/
                var tdPidFlag = pidFlag;
                /*tdPidFlag表示结果集是否含有PID*/
                var copyPid = "$pid";
                /*默认的pid名称为“$pid”*/
                var pid = $scope.pid ? $scope.pid : copyPid;
                /*如果没有pid，给一个默认的pid名称为“$pid”*/
                var id = $scope.id;
                /*id,这是必须的，唯一标识*/
                var hasRightFun = $scope.hasRightFun;
                var ownResult = $scope.ownResult;
                var ownResultType = $scope.ownResultType;
                var initShow = $scope.initShow;
                /*初始化展示，是打钩还是打岔*/
                var treeOverFlag = false;
                var ownFlag = false;
                var level = "$level";
                var levelIndex = 1;
                var displayNode = $scope.displayNode;
                var diplayAllFlag = $scope.diplayAllFlag;
                var showLevel = parseInt($scope.showLevel);
                var ownResultCopy = [];
                var nodeMap = {};
                var nodeList = [];
                var rootList = [];
                var firstOperRoleExtend = 0;//默认收缩

                var printTime = function (value) {
                    var d = new Date();
                    console.log(value + "=" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds());
                }
                /**
                 *获取所有节点
                 * @type {string}
                 */
                var getAllNode = function () {
                    return $scope.treeData;
                };
                /**
                 * 获取节点名称
                 */
                $scope.showField = function (item) {
                    //printTime("showField");
                    //console.log(item);
                    //if (angular.isDefined(item["fieldStr"])) {
                        var fieldStr1 = "";
                        //console.log(fidldArry.length);
                        //console.log(fidldArry[0]);
                        for (var i = 0; i < fidldArry.length; i++) {
                            fieldStr1 = fieldStr1 + " " + item[fidldArry[i]];
                            //console.log(itembranchNo"]);
                        }
                        item["fieldStr"] = fieldStr1;
                        //console.log(fieldStr);
                        //console.log(item["fieldStr"]);
                    //}

                    return item["fieldStr"];
                };

                $scope.isLoaded = function (item) {
                    return item["isLoaded"];
                };
                /**
                 * 判断是否具有权限
                 */
                var hasRightCallback = function (item) {
                    if (hasRightFun) {
                        return $scope.$parent[hasRightFun](item);
                    } else {
                        if (parseInt(hasRight)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                };
                /**
                 * 获取当前节点的父节点
                 */
                var getParent = function (node) {
                    if (node[pid]) {
                        return getNodeById(getAllNode, pid);
                    }
                };
                /**
                 * 通过ID判断两个节点是否相等
                 * @param node
                 * @param targetNode
                 * @param id
                 * @returns {boolean}
                 */
                var isEqual = function (node, targetNode, id) {
                    if (node[id] === targetNode[id]) {
                        return true;
                    } else {
                        return false;
                    }
                }
                /**
                 * 通过ID获取节点
                 * @param branch_no
                 */
                var getNodeById = function (arryNode, targetId) {
                    //printTime("getNodeById");
                    /* var len = arryNode.length;
                     for (var i = 0; i < len; i++) {
                     if (arryNode[i][id] === targetId) {
                     return arryNode[i];
                     } else {
                     if ($scope.isLeaf(arryNode[i])) {
                     var node = getNodeById(arryNode[i][children], targetId);
                     if (node) {
                     return node;
                     }
                     }
                     }
                     }*/
                    return nodeMap[targetId];
                }
                /**
                 * 判断是否需要展开
                 * @param item
                 * @param $event
                 */
                $scope.itemExpended = function (item, $event) {
                    item.$isExpend = !item.$isExpend;
                    $event.stopPropagation();
                };
                /**
                 * 获取打开关闭的ICON
                 * @param item
                 * @returns {*}
                 */
                $scope.getItemIcon = function (item, first, middle, last) {
                    var isLeaf = $scope.isLeaf(item);
                    var iconStr = "";
                    /*无子节点*/
                    if (!isLeaf) {
                        /*如果是一级节点*/
                        if (item.$level === 1) {
                            iconStr = "images/sy.png";
                        } else { //如果是非一级节点
                            /*只有一个节点的时候*/
                            if (first && last) {
                                iconStr = "images/sy.png";
                            } else if (last) {    //末节点
                                iconStr = "images/sy.png";
                            } else if (first) {                   //首节点
                                iconStr = "images/syx.png";
                            } else {                                    //中间节点
                                iconStr = "images/syx.png";
                            }
                        }
                    } else {
                        /*如果是一级节点*/
                        if (item.$level === 1) {
                            /*有子节点,且打开*/
                            if (item.$isExpend) {
                                /*只有一个节点的时候*/
                                if (first && last) {
                                    iconStr = "images/jiany.png";
                                } else if (last) {
                                    iconStr = "images/jiansy.png";
                                } else if (first) {
                                    iconStr = "images/jianyx.png";
                                } else {
                                    iconStr = "images/jiansyx.png";
                                }
                                /*有子节点，且关闭*/
                            } else {
                                /*只有一个节点的时候*/
                                if (first && last) {
                                    iconStr = "images/jiay.png";
                                } else if (last) {
                                    iconStr = "images/jiasy.png";
                                } else if (first) {
                                    iconStr = "images/jiayx.png";
                                } else {
                                    iconStr = "images/jiasyx.png";
                                }
                            }
                        } else { //如果是非一级节点
                            /*有子节点,且打开*/
                            if (item.$isExpend) {
                                /*只有一个节点的时候*/
                                if (first && last) {
                                    iconStr = "images/jiansy.png";
                                } else if (last) {
                                    iconStr = "images/jiansy.png";
                                } else if (first) {
                                    iconStr = "images/jiansyx.png";
                                } else {
                                    iconStr = "images/jiansyx.png";
                                }
                                /*有子节点，且关闭*/
                            } else {
                                /*只有一个节点的时候*/
                                if (first && last) {
                                    iconStr = "images/jiasy.png";
                                } else if (last) {
                                    iconStr = "images/jiasy.png";
                                } else if (first) {
                                    iconStr = "images/jiasyx.png";
                                } else {
                                    iconStr = "images/jiasyx.png";
                                }
                            }
                        }
                    }
                    return iconStr;
                };
                /**
                 * 获取权限ICON
                 */
                $scope.getRightIcon = function (item) {
                    switch (item.$isIcon) {
                        case undefined:
                            return (initShow === undefined || initShow === "true") ? "icon-1 gou-color" : "icon-2 cha-color";    //如果initShow为true，那么就打钩，否则打岔
                        case 1:
                            return "icon-1 gou-color";    //为1是打钩
                        case 2:
                            return "icon-2 cha-color";    //为2是打岔
                        case 3:
                            return "icon-3 wenhao-bgcolor";    //为3是打问号
                    }
                };
                /**
                 * 有无子节点
                 * @param item
                 * @returns {boolean}
                 */
                $scope.isLeaf = function (item) {
                    return angular.isDefined(item[children]) && item[children] !== null && item[children].length > 0;
                };
                /**
                 * 改变权限图标
                 * @param callback
                 * @param item
                 */
                $scope.changeItemIcon = function (callback, item) {
                    console.log(111);
                    //if (item.roleId == undefined) {
                    //    firstOperRoleExtend = 1;
                    //}
                    //else {
                    //    firstOperRoleExtend = 0;
                    //}
                    //改变本节点的权限图标
                    changeSelfIcon(item);
                    //改变父级节点图标
                    changeParentIcon(item);
                    //改变子集节点图标
                    changeChildrenIcon(item);
                    //回调函数，传递结果集
                    //console.log($scope.addResult);
                    //console.log($scope.delResult);
                    var curentItem = angular.copy(item);
                    curentItem[children] = null;
                    var root = angular.copy(getAllNode()[0]);
                    root[children] = null;
                    ($scope[callback] || angular.noop)({
                        addResult: $scope.addResult,
                        delResult: $scope.delResult,
                        item: item,
                        root: root
                    });
                    console.log($scope[callback]);
                };
                /**
                 * 改变本节点的权限图标
                 */
                var changeSelfIcon = function (item) {
                    switch (item.$isIcon) {
                        case undefined:
                            item.$isIcon = 2;   //打岔
                            break;
                        case 1:
                            item.$isIcon = 2; //打岔
                            break;
                        case 2:
                            item.$isIcon = 1; //打钩
                            break;
                        case 3:
                            item.$isIcon = 1;//打钩
                            break;
                    }
                    updateResult(item);
                };
                /*跟新结果集，addResult,delResult*/
                var updateResult = function (item) {
                    var index = isExist(ownResultCopy, item[id]);
                    var delIndex = isExist($scope.delResult, item[id]);
                    var addIndex = isExist($scope.addResult, item[id]);
                    if (index >= 0) {    //如果在已拥有结果集中存在
                        if (item.$isIcon === 1 || item.$isIcon === 3) {
                            if (delIndex >= 0) {
                                $scope.delResult.splice(delIndex, 1);
                            }
                        } else if (item.$isIcon === 2) {
                            if (delIndex < 0) {
                                $scope.delResult.push(item[id]);
                            }
                        } else {
                            return;
                        }
                    } else {            //如果不存在
                        if (item.$isIcon === 1) {
                            if (addIndex < 0) {
                                $scope.addResult.push(item[id]);
                            }
                        } else if (item.$isIcon === 2) {
                            if (addIndex >= 0) {
                                $scope.addResult.splice(addIndex, 1);
                            }
                        } else {
                            return;
                        }
                    }
                }

                /**
                 * 改变父节点的权限图标
                 */
                var changeParentIcon = function (node) {
                    firstGruntRightParent(node, function (parentNode) {
                        updateResult(parentNode);
                    });
                };
                /**
                 * 改变子集节点的图标
                 * @param item  当前节点
                 * @param isPush    是否放到结果集中delResult和addResult
                 */
                var changeChildrenIcon = function (item) {
                    firstGruntRightChildren(item, function (child) {
                        updateResult(child);
                    });
                };
                /**
                 * 下拉显示子节点
                 * @param callback
                 * @param item
                 * @param $event
                 */
                $scope.warpCallback = function (item, $event) {
                    if (!(item.children == null)) {
                        $scope.itemExpended(item, $event);
                        item["isLoaded"] = true;
                    }
                    return;
                };
                /**
                 * 点击获取节点信息
                 * @param callback
                 * @param item
                 * @param $event
                 */
                $scope.getItemCallback = function (callback, item) {
                    if (!$scope[callback]) {
                        return;
                    }
                    if (angular.isDefined($scope.isChange)) {
                        $scope.isChange = item[id];
                        if (!(angular.element(document.querySelector('#wenjianjia')) && (item.children == null))) {
                            item.$isExpend = true;
                        }
                    }
                    ($scope[callback] || angular.noop)({
                        item: item
                    });
                };
                /**
                 * 控制是否显示textField还是mustField
                 */
                $scope.$watch("diplayAllFlag", function (newValue, oldValue) {
                    if (angular.isDefined(newValue) && $scope.mustDisplyText) {
                        if (!newValue) {
                            fidldArry = [];
                            fidldArry.push(mustDisplyText);
                        } else {
                            fidldArry = textField.split(",");
                        }
                    }
                });
                $scope.$watch("displayNode", function (newValue, oldValue) {
                    if (angular.isArray(newValue)) {
                        if (newValue[0] === "" || !newValue[0] || newValue.length <= 0) {
                            preField = newValue[0];
                            return;
                        }
                    } else {
                        if (newValue === "" || !newValue) {
                            preField = newValue;
                            return;
                        }
                    }
                    var field = "";
                    var fieldIndex = 0;
                    if (angular.isArray(newValue)) {
                        field = newValue[0]; //0是需要查询的字符串
                        fieldIndex = newValue[1];    //1是查询的位置，默认查询第一个位置
                    } else {
                        field = newValue;
                    }
                    /*如果两次查询的值相等就下一个*/
                    if (preField === field) {
                        /*如果查找的没了*/
                        if (searchResult.length - 1 < fieldIndex) {
                            ($scope["searchCallback"] || angular.noop)({
                                length: searchResult.length,
                                result: null
                            });
                            return;
                        } else {
                            //重置所有的节点岔并关闭
                            loopTree(getAllNode(), function (node) {
                                node.$isExpend = false;
                            });
                            searchNextNode(fieldIndex);
                        }
                        return;
                    } else {
                        preField = field;
                        searchResult = [];
                    }
                    loopTree(getAllNode(), function (node) {
                        findTextFieldArray(textFieldArray, node, field);
                    });
                    searchNextNode(0);
                }, true);
                /*查询某个节点*/
                function searchNextNode(index) {
                    if (searchResult.length <= 0) {
                        ($scope["searchCallback"] || angular.noop)({
                            length: searchResult.length,
                            result: null
                        });
                        return;
                    }
                    /*回调*/
                    ($scope["searchCallback"] || angular.noop)({
                        length: searchResult.length,
                        result: searchResult[index]
                    });
                    $scope.isChange = searchResult[index][id];

                    searchResult[index].$isExpend = false;
                    if (searchResult[index][pid]) {
                        loopParent(getAllNode(), searchResult[index][pid], function (pNode) {
                            pNode.$isExpend = true;
                        })
                    }
                }

                /**
                 * 找到某个节点并打开
                 * @param array
                 * @param node
                 * @param field
                 */
                var searchResult = [];  //查询出来的结果集
                var preField = ""; //上一次查询的值
                var findTextFieldArray = function (array, node, field) {
                    //printTime("findTextFieldArray");
                    var len = array.length;
                    for (var i = 0; i < len; i++) {
                        if (parseInt(field) === field) {
                            /*精确查找*/
                            if ((node[array[i]] + "") === (field + "")) {
                                searchResult.push(node);
                                return;
                            } else {
                                node.$isExpend = false;
                            }
                        } else {
                            /*模糊匹配*/
                            if ((node[array[i]] + "").indexOf(field + "") >= 0) {
                                searchResult.push(node);
                                return;
                            } else {
                                node.$isExpend = false;
                            }
                        }
                    }
                }

                var scanTree = function (node, lvl) {
                    nodeMap[node[id]] = node;
                    nodeList.push(node);
                    node[level] = lvl;
                    if (showLevel && lvl <= showLevel) {  /*如果有显示多少个节点，就按显示多少个节点来*/
                        node.$isExpend = true;
                    } else {
                        node.$isExpend = false;
                    }
                    var children = node["children"];
                    if (children && children.length) {
                        for (var i = 0; i < children.length; i++) {
                            children[i][pid] = node[id];
                            scanTree(children[i], lvl + 1);
                        }
                    }
                }

                var scanSelectTree = function (node) {
                    var children = node["children"];
                    if (children && children.length) {
                        for (var i = 0; i < children.length; i++) {
                            children[i][pid] = node[id];
                            scanTree(children[i], lvl + 1);
                        }
                    }
                }

                /*添加parentId，当parentId不纯在的情况*/
                var addParentId = function (newValue, targetPidFlag, callback) {
                    if (!targetPidFlag) {
                        hasParendId(newValue);
                        if (callback) {
                            callback();
                        }
                    }
                }
                /*给树添加等级*/
                var addLevel = function (data, targetIndex) {
                    //printTime("addLevel");
                    if (angular.isArray(data)) {
                        var len = data.length;
                        for (var i = 0; i < len; i++) {
                            data[i][level] = targetIndex;
                            if (showLevel && targetIndex <= showLevel) {  /*如果有显示多少个节点，就按显示多少个节点来*/
                                data[i].$isExpend = true;
                            }
                        }
                        targetIndex++;
                        for (var j = 0; j < len; j++) {
                            if ($scope.isLeaf(data[j])) {
                                addLevel(data[j][children], targetIndex);
                            }
                        }
                    }
                }
                /**
                 * 监听result结果集
                 */
                $scope.$watch("treeData", function (newValue, oldValue) {
                    if (angular.isUndefined(newValue) || newValue.length <= 0) {
                        return;
                    }

                    var data = getAllNode();
                    //console.log(data);
                    nodeMap = {};
                    nodeList = [];
                    rootList = [];
                    if (angular.isArray(data)) {
                        for (var i = 0; i < data.length; i++) {
                            rootList.push(data[i]);
                            scanTree(data[i], 1);
                        }
                    } else {
                        rootList.push(data);
                        scanTree(data, 1);
                    }

                    /*/*加父节点ID*!/
                     addParentId(getAllNode(), tdPidFlag, function () {
                     //tdPidFlag = !tdPidFlag;
                     });
                     /!*加等级*!/
                     addLevel(getAllNode(), levelIndex);*/
                    treeOverFlag = true;
                    if (ownFlag) {
                        ownResultDeal($scope.ownResult);
                    }
                });

                /**
                 * 判断是否具有父级节点，没有就加上
                 */
                var hasParendId = function (tree) {
                    //printTime("hasParendId");
                    if (angular.isArray(tree)) {
                        var len = tree.length;
                        for (var i = 0; i < len; i++) {
                            var node = getNodeById(getAllNode(), tree[i][id]);
                            if (angular.isDefined(node[pid]) && node[pid]) {
                                tree[i][copyPid] = node[pid];
                            }
                            hasParendId(tree[i]);
                        }
                    } else {
                        if ($scope.isLeaf(tree)) {
                            var clen = tree[children].length
                            for (var i = 0; i < clen; i++) {
                                if (!tree[children][i][copyPid]) {
                                    tree[children][i][copyPid] = tree[id];
                                }
                            }
                            hasParendId(tree[children]);
                        }
                    }
                };

                /*监听delResult和addResult*/
                $scope.$watch("addResult", function (newValue, oldValue) {
                    if (angular.isUndefined(newValue)) {
                        return;
                    }
                    ownResultCopy = ownResultCopy.concat(oldValue);
                });
                /*监听delResult和addResult*/
                $scope.$watch("delResult", function (newValue, oldValue) {
                    //printTime("delResult");
                    if (angular.isUndefined(newValue)) {
                        return;
                    }
                    var len = oldValue.length;
                    for (var i = 0; i < len; i++) {
                        var index = ownResultCopy.indexOf(oldValue[i]);
                        if (index >= 0) {
                            ownResultCopy.splice(index, 1);
                        }
                    }
                });
                /**
                 * 监听ownResult结果集
                 */
                $scope.$watch("ownResult", function (newValue, oldValue) {
                    if (angular.isUndefined(newValue)) {
                        return;
                    }
                    if (treeOverFlag) {
                        /*添加pid*/
                        /*addParentId(getAllNode(), tdPidFlag, function () {
                         //tdPidFlag = !tdPidFlag;
                         });*/
                        ownResultDeal($scope.ownResult);
                    } else {
                        ownFlag = true;
                    }
                }, true);
                var ownResultDeal = function (newValue) {
                    //重置所有的节点岔并关闭
                    loopTree(getAllNode(), function (node) {
                        node.$isIcon = 2;
                        //node.$isExpend = false;
                        node.$preIcon = undefined;
                    });
                    //如果已拥有的结果集是数组，那么久执行这个方法
                    if (ownResultType === "array") {
                        /*已拥有结果集副本*/
                        ownResultCopy = angular.copy(newValue);
                        $scope.changeArryDisplayRight(newValue);
                    } else {
                        ownResultCopy = [];
                        //addParentId(newValue, orPidFlag);
                        scanSelectTree(newValue);
                        $scope.changeDisplayRight(newValue);
                    }
                };
                //当已拥有结果集是数组
                $scope.changeArryDisplayRight = function (ownResult) {
                    //printTime("changeArryDisplayRight");
                    var result = getAllNode();
                    angular.forEach(ownResult, function (targetId) {
                        var node = getNodeById(result, targetId);
                        if (!node) {
                            //console.error("找不到该节点:" + targetId);
                            return;
                        }
                        if (node.$pid == null || node.$pid == undefined) {
                            console.log(targetId);
                        }
                        /*改变当前节点*/
                        firstGruntRgihtSelf(node, 1);
                        /*改变父节点*/
                        firstGruntRightParent(node, function (parent) {
                            var index = isExist(ownResultCopy, parent);
                            if (index < 0) {
                                ownResultCopy.push(parent[id]);
                            }
                        });
                        /*改变子节点*/
                        firstGruntRightChildren(node, function (child) {
                            var index = isExist(ownResultCopy, child);
                            if (index < 0) {
                                ownResultCopy.push(child[id]);
                            }
                        });
                    });
                };

                /**
                 *改变权限图标（当已经拥有的结果集是树）
                 */
                $scope.changeDisplayRight = function (ownResult) {
                    //重置所有的节点岔并关闭
                    loopTree(getAllNode(), function (node) {
                        node.$isIcon = 2;
                        node.$isExpend = false;
                        node.$preIcon = undefined;
                    });
                    var result = getAllNode();
                    /*已拥有结果集赋值权限，首次赋值*/
                    firstGruntRight(ownResult, result);
                };
                /*已拥有结果集赋值权限，首次赋值*/
                var firstGruntRight = function (targetResult, result) {
                    //printTime("firstGruntRight");
                    if (angular.isArray(targetResult)) {
                        var len = targetResult.length;
                        for (var i = 0; i < len; i++) {
                            var index = isExist(ownResultCopy, targetResult[i]);
                            if (index < 0) {
                                ownResultCopy.push(targetResult[i][id]);
                            }
                            if ($scope.isLeaf(targetResult[i])) {
                                firstGruntRight(targetResult[i][children], result);
                            } else {
                                firstGruntRight(targetResult[i], result);
                            }
                        }
                    } else {
                        var index = isExist(ownResultCopy, targetResult);
                        if (index < 0) {
                            ownResultCopy.push(targetResult[id]);
                        }
                        var node = getNodeById(result, targetResult[id]);
                        if (!node) {
                            //console.error("找不到该节点:" + targetResult[id]);
                            return;
                        }
                        /*改变当前节点*/
                        firstGruntRgihtSelf(node, 1);
                        /*改变父节点*/
                        firstGruntRightParent(node);
                        /*改变子节点*/
                        firstGruntRightChildren(node, function (child) {
                            var index = isExist(ownResultCopy, child);
                            if (index < 0) {
                                ownResultCopy.push(child[id]);
                            }
                        });
                    }
                };
                /*改变当前节点的权限图标*/
                var firstGruntRgihtSelf = function (node, icon) {
                    node.$isIcon = icon;
                    /*当前节点*/
                    node.$preIcon = icon;
                    /*上一次节点图标*/
                    if (showLevel) {  /*如果有显示多少个节点，就按显示多少个节点来，没有就只要赋值权限了就打开*/
                        if (node[level] <= showLevel) {
                            node.$isExpend = true;
                        }
                    } else {
                        node.$isExpend = true;
                    }
                }
                /*改变父节点的权限图标*/
                var firstGruntRightParent = function (node, callback) {
                    //printTime("firstGruntRightParent");
                    var parentId = node[pid];
                    if (angular.isDefined(parentId) && parentId !== "" && parentId !== null) {
                        var parentNode = getNodeById(getAllNode(), parentId);
                        var len = parentNode[children].length;
                        var gouNum = 0;
                        var chaNum = 0;
                        var wenNum = 0;
                        for (var i = 0; i < len; i++) {
                            if (angular.isUndefined(parentNode[children][i].$isIcon) || parentNode[children][i].$isIcon === 1) {
                                gouNum++;
                            } else if (parentNode[children][i].$isIcon === 2) {
                                chaNum++;
                            } else {
                                wenNum++;
                            }
                        }
                        if (gouNum === len) {
                            firstGruntRgihtSelf(parentNode, 1);
                        } else if (chaNum === len) {
                            firstGruntRgihtSelf(parentNode, 2);
                        } else {
                            firstGruntRgihtSelf(parentNode, 3);
                            if (firstOperRoleExtend) {
                                parentNode.$isExpend = true;
                            }
                        }
                        /*如果回调存在，更新结果集*/
                        if (callback) {
                            callback(parentNode);
                        }
                        firstGruntRightParent(parentNode, callback);
                    }
                };
                /*改变子节点的权限图标*/
                var firstGruntRightChildren = function (node, callback) {
                    //printTime("firstGruntRightChildren");
                    if ($scope.isLeaf(node)) {
                        var children = node[$scope.children];
                        var len = children.length;
                        for (var i = 0; i < len; i++) {
                            firstGruntRgihtSelf(children[i], node.$isIcon);
                            /*跟新子节点的结果集*/
                            if (callback) {
                                callback(children[i]);
                            }
                            firstGruntRightChildren(children[i], callback);
                        }
                    }
                }

                /**
                 * 循环遍历父节点
                 * @param result
                 * @param pid
                 * @param callback
                 */
                var loopParent = function (result, cpid, callback) {
                    var parNode = getNodeById(result, cpid);
                    callback(parNode);
                    if (parNode[pid]) {
                        loopParent(result, parNode[pid], callback);
                    }
                };

                /**
                 * 循环树,并回调
                 */
                var loopTree = function (tree, callback) {
                    //printTime("loopTree");
                    /*if (angular.isArray(tree)) {
                     var len = tree.length;
                     for (var i = 0; i < len; i++) {
                     loopTree(tree[i], callback);
                     }
                     } else {
                     callback(tree);
                     if ($scope.isLeaf(tree)) {
                     loopTree(tree[children], callback);
                     }
                     }*/
                    for (var i = 0; i < nodeList.length; i++) {
                        callback(nodeList[i]);
                    }
                };
                /**
                 * 循环双ARRAY，当相等时并做回调
                 * @param array
                 * @param targetArray
                 * @param equalBack
                 */
                var loopArray = function (array, targetArray, equalBack) {
                    //printTime("loopArray");
                    var alen = array.length;
                    var tlen = targetArray.length;
                    for (var i = 0; i < alen; i++) {
                        for (var j = 0; j < tlen; j++) {
                            if (array[i][id] === targetArray[j][id]) {
                                equalBack(array[i], targetArray[j]);
                            }
                        }
                    }
                };
                /**
                 * 判断是否在数组中存在该项
                 * @param array
                 * @param node
                 * @returns {Number}
                 */
                var isExist = function (array, node) {
                    //printTime("isExist");
                    var len = array.length;
                    for (var i = 0; i < len; i++) {
                        if (array[i] === node) {
                            return i;
                        }
                    }
                    return -1;
                };

            }]
        };
    }]);

    //按钮权限指令
    app.directive('buttonRights', ["$routeParams", function ($routeParams) {
        return {
            restrict: 'A',
            //priority: 1000,
            //teminal: true,
            link: function (scope, elem, attrs) {
                var parms = $routeParams.parms.split(",");
                for (var i in parms) {
                    if (attrs.buttonRights == parms[i]) {
                        if (elem.attr("disabled")) {
                            elem[0].removeAttribute('href');
                            elem.unbind();
                            elem.addClass("button-disabled");
                        }
                        return;
                    }
                }
                elem.addClass("button-hide");
            }
        };
    }]);

    /**
     * 点击tr改变tr行颜色
     */
    app.directive("changeTrStyle", function () {
        return {
            link: function (scope, element, attrs) {
                var active = attrs['changeTrStyle'] || 'active';
                element.bind("click", function () {
                    element.siblings().removeClass(active);
                    element.addClass(active);
                });
            }
        }
    });

    /*下拉多选指令依赖*/
    app.factory('$positionEx', ['$document', '$window', function ($document, $window) {
        var scollBarSize = 17;
        var zIndex = 5000;// 系统 z-index 从 5000 开始，最大为 2147483647
        /**
         * 获取计算后 el 元素的 cssprop 样式
         * @param el - DOM 元素
         * @param cssprop - 要获取的样式名
         */
        function getStyle(el, cssprop) {
            if (el.currentStyle) { //IE
                return el.currentStyle[cssprop];
            } else if ($window.getComputedStyle) {
                return $window.getComputedStyle(el)[cssprop];
            }
            // finally try and get inline style
            return el.style[cssprop];
        }

        /**
         * 检查 element 的 position 是否为 static
         * @param element - DOM 元素
         */
        function isStaticPositioned(element) {
            return (getStyle(element, 'position') || 'static' ) === 'static';
        }

        /**
         * 返回 element 最近的，非 static 布局的父元素(dom)，定位的参照元素
         * @param element - DOM 元素
         */
        var parentOffsetEl = function (element) {// 获取用于定位的父元素（已进行过 css 定位的元素 / <body>）
            var docDomEl = $document[0];
            var offsetParent = element.offsetParent || docDomEl;
            while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docDomEl;
        };

        /**
         * 返回是否需要反向
         * @param nowS - 当前空间尺寸
         * @param otherS - 备选空间尺寸
         * @param targetS - 需要的空间尺寸
         */
        var shouldChange = function (nowS, otherS, targetS) {
            return nowS < targetS && otherS >= targetS;//当前空间不足，反向空间足够，返回 true，即需要反向
        };

        return {
            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#getZIndex
             * @methodOf ui.wisoft.position.factory:$position
             * @description 获取最大 z-index，使指定元素在顶层展现，从 5000 开始。
             * @return {number} z-index 数值。
             */
            getZIndex: function () {
                return zIndex++;
            },

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#position
             * @methodOf ui.wisoft.position.factory:$position
             * @description 获取 element 相对于父元素（定位元素）的偏移，参考 jQuery 中的 element.position()。
             * @param {element} element 要计算的元素 - jqLite 元素。
             * @return {object} position {width:xx, height:xx, top:xx, left:xx, bottom:xx, right:xx} - 属性值是单位为 px 的数字。
             */
            position: function (element) {
                var pel = parentOffsetEl(element[0]),// element 最近的定位参照元素 parent
                    elBCR = element[0].getBoundingClientRect(),
                    w = elBCR.width || element.prop('offsetWidth'),
                    h = elBCR.height || element.prop('offsetHeight'),
                    top, left;
                if (pel !== $document[0]) {// 非根节点
                    var pelBCR = angular.element(pel)[0].getBoundingClientRect();
                    top = elBCR.top - pelBCR.top + pel.scrollTop - pel.clientTop;// 考虑父元素滚动与边框，box-sizing: boxder-box 时，clientTop = 0
                    left = elBCR.left - pelBCR.left + pel.scrollLeft - pel.clientLeft;
                } else {
                    top = elBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop);
                    left = elBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft);
                }
                return {
                    width: w,
                    height: h,
                    top: top,
                    left: left,
                    bottom: top + h,
                    right: left + w
                };
            },

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#offset
             * @methodOf ui.wisoft.position.factory:$position
             * @description 获取 element 相对于文档的偏移，参考 jQuery 中的 element.offset()。
             * @param {element} element 要计算的元素 - jqLite 元素。
             * @return {object} {width:.., height:.., top:.., left:.., bottom:.., right:..} - 属性值是单位为 px 的数字。
             */
            offset: function (element) {
                var boundingClientRect = element[0].getBoundingClientRect()// element 相对于文档可见区域的 BCR
                    , w = boundingClientRect.width || element.prop('offsetWidth')
                    , h = boundingClientRect.height || element.prop('offsetHeight')
                    , top = boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)// 考虑 scroll
                    , left = boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft);// 考虑 scroll
                return {
                    width: w,
                    height: h,
                    top: top,
                    left: left,
                    bottom: top + h,
                    right: left + w
                };
            },

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#offsetTop
             * @methodOf ui.wisoft.position.factory:$position
             * @description 获取 element 相对于顶层 window 的偏移。
             * @param {element} element 要计算的元素 - jqLite 元素。
             * @return {object} [viewElPos(相对顶层 window 的偏移), domElPos(相对顶层 window 的 body 的偏移)] <br />
             * viewElPos、domElPos：{width:.., height:.., top:.., left:.., bottom:.., right:..} - 属性值是单位为 px 的数字。
             */
            offsetTop: function (element) {
                var _topWindow = $window.top // 顶层 window
                    , _window = $window // 当前判断到的 window
                    , _top = 0, _left = 0
                    , _inFrame = false // element 是否在 frame 中
                    , _viewElPos = element[0].getBoundingClientRect()
                    , viewElPos // 触发元素相对顶层窗口的位置（含尺寸）
                    , domElPos;// 触发元素相对顶层窗口 body 的位置（含尺寸）

                var _document = element[0].ownerDocument // element 所在的文档，用于寻找弹出窗口/frame
                    , _windowBCR;

                while (_window !== _topWindow) {// 由 _window 向外查找 frame
                    if (!_inFrame && _document === _window.document) { // element 在当前 frame 中
                        _inFrame = true;
                    }
                    if (_inFrame) { // element 已经确定在内层 frame 中
                        _windowBCR = _window.frameElement.getBoundingClientRect();
                        _top += _windowBCR.top;
                        _left += _windowBCR.left + 10;
                    }
                    _window = _window.parent;
                }
                viewElPos = {
                    top: _viewElPos.top + _top
                    , bottom: _viewElPos.bottom + _top
                    , left: _viewElPos.left + _left
                    , right: _viewElPos.right + _left
                    , width: _viewElPos.width
                    , height: _viewElPos.height
                };
                var _scrollY = 0
                    , _scrollX = 0;
                // body 非 static，因弹出项加在 body，将根据 body 定位，产生偏移
                if (getStyle(_topWindow.document.body, 'position') !== 'static') {
                    var _bodyBCR = _topWindow.document.body.getBoundingClientRect();
                    _scrollX -= _bodyBCR.left;
                    _scrollY -= _bodyBCR.top;
                } else {
                    _scrollX += _topWindow.pageXOffset || _topWindow.document.documentElement.scrollLeft;
                    _scrollY += _topWindow.pageYOffset || _topWindow.document.documentElement.scrollTop;
                }
                domElPos = {
                    top: viewElPos.top + _scrollY
                    , bottom: viewElPos.bottom + _scrollY
                    , left: viewElPos.left + _scrollX
                    , right: viewElPos.right + _scrollX
                    , width: viewElPos.width
                    , height: viewElPos.height
                };
                return [viewElPos, domElPos];
            },

            /**
             * 获取计算后 el 元素的 cssprop 样式
             * @param el - DOM 元素
             * @param cssprop - 要获取的样式名
             */
            getStyle: getStyle,

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#positionElements
             * @methodOf ui.wisoft.position.factory:$position
             * @description 根据 referEl 计算 targetEl 相对于父定位元素的位置。
             * @param {element} refEl 触发元素 - jqLite 元素。
             * @param {number} targetElWidth 要定位的元素的宽(单位：像素)。
             * @param {number} targetElHeight 要定位的元素的高(单位：像素)。
             * @param {string} positionStr 定位方向: p-p，可能的值：top,left,right,bottom,center，但一级弹出方向不支持 center。
             * @return {position} {top:.., left:..} - 属性值是单位为 px 的数字。
             */
            positionTooltip: function (refEl, targetElWidth, targetElHeight, positionStr) {
                var positionStrParts = angular.isString(positionStr) ? positionStr.split('-') : [];
                var pos0 = positionStrParts[0] || 'bottom';
                var pos1 = positionStrParts[1] || 'left';

                var refElPos,
                    targetElPos;
                refElPos = this.position(refEl);

                var shiftWidth = {
                    center: function () {
                        return refElPos.left + refElPos.width / 2 - targetElWidth / 2;
                    },
                    left: function () {
                        return refElPos.left;
                    },
                    right: function () {
                        return refElPos.left + refElPos.width - targetElWidth;
                    }
                };

                var shiftHeight = {
                    center: function () {
                        return refElPos.top + refElPos.height / 2 - targetElHeight / 2;
                    },
                    top: function () {
                        return refElPos.top;
                    },
                    bottom: function () {
                        return refElPos.top + refElPos.height - targetElHeight;
                    }
                };

                switch (pos0) {
                    case 'right':
                        targetElPos = {
                            top: shiftHeight[pos1]() + 'px',
                            left: refElPos.right + 'px'
                        };
                        break;
                    case 'left':
                        targetElPos = {
                            top: shiftHeight[pos1]() + 'px',
                            left: refElPos.left - targetElWidth + 'px'
                        };
                        break;
                    case 'bottom':
                        targetElPos = {
                            top: refElPos.bottom + 'px',
                            left: shiftWidth[pos1]() + 'px'
                        };
                        break;
                    default:
                        targetElPos = {
                            top: refElPos.top - targetElHeight + 'px',
                            left: shiftWidth[pos1]() + 'px'
                        };
                        break;
                }

                return targetElPos;
            },

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#positionElements
             * @methodOf ui.wisoft.position.factory:$position
             * @description 根据 referEl 的位置，弹出项的尺寸，弹出方向，计算 弹出项的位置。
             * @param {element} referEl 参照元素，根据其位置确定弹出项位置 - jqLite 元素。
             * @param {number} targetElWidth 要定位的元素的宽(单位：像素)。
             * @param {number} targetElHeight 要定位的元素的高(单位：像素)。
             * @param {string} positionStr 定位方向: p-p，可能的值：top,left,right,bottom,center。
             * @param {boolean} adaptable 是否自适应，根据浏览器可视部分空间调整弹出方向。
             * @param {boolean} appendToBody 弹出项是否是 <body> 的直接子元素，若为 true,位置相对于文档，若为 false，位置相对于定位父元素。
             * @return {array} [<br />
             *   {top:'..px', bottom:'..px', left: '..px', right:'..px'}, - 属性值是单位为 px 的数字 <br />
             *   positionStr - 'top-left'/'top-right'/'bottom-left'/'bottom-right'/'top-left'/'top-right'/'bottom-left'/'bottom-right'<br />
             *   ] - 属性值是单位为 px 的数字。
             */
            adaptElements: function (referEl, targetElWidth, targetElHeight, positionStr, adaptable, appendToBody) {
                var viewElPos// 触发元素相对文档可见区域位置（含尺寸）
                    , pos0, pos1
                    , elemStyle = {}// 弹出项样式{top, bottom, left, right}
                    , viewW, viewH, domElPos;// 文档可见区域尺寸，为滚动条留白
                var positionStrParts = angular.isString(positionStr) ? positionStr.split('-') : [];
                pos0 = positionStrParts[0] || 'bottom';
                pos1 = positionStrParts[1] || 'left';
                /** 确定弹出区域，触发元素位置等 **/
                // 相对于顶层窗口文档
                if (appendToBody) {
                    var _topWindow = $window.top // 顶层 window
                        , offsetTopArr = this.offsetTop(referEl);
                    viewW = _topWindow.innerWidth - scollBarSize;
                    viewH = _topWindow.innerHeight - scollBarSize;
                    viewElPos = offsetTopArr[0];
                    domElPos = offsetTopArr[1];
                }
                // 相对于触发元素
                else {
                    viewW = $window.innerWidth - scollBarSize;
                    viewH = $window.innerHeight - scollBarSize;
                    viewElPos = referEl[0].getBoundingClientRect();
                }

                // 允许自适应：根据弹出项实际尺寸，及可见范围调整弹出方向和位置
                if (adaptable) {
                    // 确定 pos0，若当前空间不足且备选空间足够，或都不足但备选空间较大，则反向
                    switch (pos0) {
                        case 'left':
                            if (shouldChange(viewElPos.left, viewW - viewElPos.right, targetElWidth)) {
                                pos0 = 'right';
                            }
                            break;
                        case 'right':
                            if (shouldChange(viewW - viewElPos.right, viewElPos.left, targetElWidth)) {
                                pos0 = 'left';
                            }
                            break;
                        case 'top':
                            if (shouldChange(viewElPos.top, viewH - viewElPos.bottom, targetElHeight)) {
                                pos0 = 'bottom';
                            }
                            break;
                        default :
                            pos0 = 'bottom';
                            if (shouldChange(viewH - viewElPos.bottom, viewElPos.top, targetElHeight)) {
                                pos0 = 'top';
                            }
                    }
                    // 确定 pos1
                    switch (pos1) {
                        case 'center':
                            break;
                        case 'top' :
                            if (shouldChange(viewH - viewElPos.top, viewElPos.bottom, targetElHeight)) {
                                pos1 = 'bottom';
                            }
                            break;
                        case 'bottom':
                            if (shouldChange(viewElPos.bottom, viewH - viewElPos.top, targetElHeight)) {
                                pos1 = 'top';
                            }
                            break;
                        case 'right':
                            if (shouldChange(viewElPos.right, viewW - viewElPos.left, targetElWidth)) {
                                pos1 = 'left';
                            }
                            break;
                        default :
                            pos1 = 'left';
                            if (shouldChange(viewW - viewElPos.left, viewElPos.right, targetElWidth)) {
                                pos1 = 'right';
                            }
                    }
                }

                /** 精确弹出位置 **/
                // 相对于顶层窗口文档绝对定位
                if (appendToBody) {
                    // 根据参照元素的文档位置，计算弹出项的文档位置
                    switch (pos0) {
                        case 'left':
                            elemStyle.left = domElPos.left - targetElWidth + 'px';
                            break;
                        case 'right':
                            elemStyle.left = domElPos.right + 'px';
                            break;
                        case 'top':
                            elemStyle.top = domElPos.top - targetElHeight + 'px';
                            break;
                        default :
                            pos0 = 'bottom';
                            elemStyle.top = domElPos.bottom + 'px';
                    }
                    // 二级方向位置确定，单向空间不足时，向右/下贴边
                    switch (pos1) {
                        case 'center':
                            if (['left', 'right'].indexOf(pos0) >= 0) {
                                elemStyle.top = domElPos.top + Math.floor((viewElPos.height - targetElHeight) / 2) + 'px';
                            }
                            else {
                                elemStyle.left = domElPos.left + Math.floor((viewElPos.width - targetElWidth) / 2) + 'px';
                            }
                            break;
                        case 'top':
                            if (adaptable !== false && viewH - viewElPos.top < targetElHeight) {
                                elemStyle.top = domElPos.top - viewElPos.top + viewH - targetElHeight + 'px';// 贴边
                            }
                            else {
                                elemStyle.top = domElPos.top + 'px';
                            }
                            break;
                        case 'bottom':
                            if (adaptable !== false && viewElPos.bottom < targetElHeight) {
                                elemStyle.top = domElPos.top - viewElPos.top + viewH - targetElHeight + 'px';// 贴边
                            }
                            else {
                                elemStyle.top = domElPos.bottom - targetElHeight + 'px';
                            }
                            break;
                        case 'right':
                            if (adaptable !== false && viewElPos.right < targetElWidth) {
                                elemStyle.left = domElPos.left - viewElPos.left + viewW - targetElWidth + 'px';
                            }
                            else {
                                elemStyle.left = domElPos.right - targetElWidth + 'px';
                            }
                            break;
                        default :
                            pos1 = 'left';
                            if (adaptable !== false && viewW - viewElPos.left < targetElWidth) {
                                elemStyle.left = domElPos.left - viewElPos.left + viewW - targetElWidth + 'px';
                            }
                            else {
                                elemStyle.left = domElPos.left + 'px';
                            }
                    }
                }
                // 相对于触发元素绝对定位
                else {
                    // 一级位置已确定，通过返回方向由 class 名控制，不需计算
                    // 二级方向位置确定，单向空间不足时，向右/下贴边
                    switch (pos1) {
                        case 'center':
                            if (['left', 'right'].indexOf(pos0) >= 0) {
                                elemStyle.top = Math.floor((viewElPos.height - targetElHeight) / 2) + 'px';
                            }
                            else {
                                elemStyle.left = Math.floor((viewElPos.width - targetElWidth) / 2) + 'px';
                            }
                            break;
                        case 'top' :
                            if (adaptable !== false && viewH - viewElPos.top < targetElHeight) {
                                elemStyle.top = viewH - viewElPos.top - targetElHeight + 'px';
                            }
                            break;
                        case 'bottom':
                            if (adaptable !== false && viewElPos.bottom < targetElHeight) {
                                elemStyle.bottom = viewElPos.bottom - viewH + 'px';
                            }
                            break;
                        case 'right':
                            if (adaptable !== false && viewElPos.right < targetElWidth) {
                                elemStyle.right = viewElPos.right - viewW + 'px';
                            }
                            break;
                        default:
                            pos1 = 'left';
                            if (adaptable !== false && viewW - viewElPos.left < targetElWidth) {
                                elemStyle.left = viewW - viewElPos.left - targetElWidth + 'px';
                            }
                    }
                }

                return [{
                    'top': elemStyle.top ? elemStyle.top : ''
                    , 'bottom': elemStyle.bottom ? elemStyle.bottom : ''
                    , 'left': elemStyle.left ? elemStyle.left : ''
                    , 'right': elemStyle.right ? elemStyle.right : ''
                }, pos0 + '-' + pos1];
            }
        };
    }]);

    app.constant('popupConfig', {
        openClass: 'st-popup-open'
    })

    app.service('popupService', ['$document', '$window', function ($document, $window) {
        var openScope // 记录当前打开的 scope
            , _document = angular.element($window.top.document);
        // 打开，若未打开其它 scope，则绑定触发关闭的事件，否则直接关闭其他 scope
        this.open = function (scope, digest) {
            if (!openScope) {// 没有其它已打开的 scope
                $document.bind('click', closeMenu);
                $document.bind('keydown', escapeKeyBind);
                _document.bind('click', closeMenu);
                _document.bind('keydown', escapeKeyBind);
            }
            if (openScope && openScope !== scope) {
                openScope.isOpen = false;
                if (digest) {
                    openScope.$digest();
                }
            }
            openScope = scope;
        };
        // 关闭，解绑触发关闭的事件
        this.close = function (scope) {
            if (openScope === scope) {
                openScope = null;
//                $document.unbind('click', closeMenu);
//                $document.unbind('keydown', escapeKeyBind);
                _document.unbind('click', closeMenu);
                _document.unbind('keydown', escapeKeyBind);
            }
        };
        this.closeAll = function (digest) {
            closeMenu(digest);
        };
        // 关闭事件 - 仅当 digest 为 false 时脏检查（menu 中执行菜单项操作时关闭菜单）
        var closeMenu = function (digest) {
            if (openScope) {
                if (digest) {
                    openScope.$apply(function () {
                        openScope.isOpen = false;
                    });
                }
                else {
                    openScope.isOpen = false;
                }
                openScope = null;
            }
        };
        var escapeKeyBind = function (evt) {
            if (evt.which === 27) {
                if (openScope.focusToggleElement) {
                    openScope.focusToggleElement();
                }// 若定义了聚焦方法，关闭后聚焦当前项
                closeMenu();
            }
        };
    }])

    app.controller('PopupController', ['$scope', '$attrs', '$parse', '$timeout', '$positionEx', 'popupService', 'popupConfig', function ($scope, $attrs, $parse, $timeout, $position, popupService, popupConfig) {
        var self = this,
            scope = $scope.$new(),// 创建子 scope，避免污染原始 scope
            openClass = popupConfig.openClass,
            getIsOpen,
            setIsOpen = angular.noop,
            toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;
        self.popupOptions = {};

        this.init = function (element) {
            self.$element = element;

            if ($attrs.isOpen) {// 定义了 is-open 绑定的对象，添加监听
                getIsOpen = $parse($attrs.isOpen);
                setIsOpen = getIsOpen.assign;
                $scope.$watch(getIsOpen, function (value) {
                    scope.isOpen = !!value;
                });
            }
        };

        // 切换并返回 scope.isOpen，若传入 open 则切换为 open 指定的状态，否则根据当前状态切换
        this.toggle = function (open) {
            return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
        };

        // 允许其他指令监听 isOpen
        this.isOpen = function () {
            return scope.isOpen;
        };

        scope.getToggleElement = function () {
            return self.$element;
        };

        scope.focusToggleElement = function () {
            self.$element[0].focus();
        };

        scope.$watch('isOpen', function (isOpen, wasOpen) {
            if (!self.popupOptions || !self.popupOptions.elem) {
                return;
            }// 无弹出项
            var pElem = self.$element,
                options = self.popupOptions,// 指令中定义的弹出项配置（elem: jqlite 元素 - 必须, height: 需用 style 定义的高度数值 - 可选, width: 同 height）
                popupElem = options.elem;
            if (isOpen) {
                scope.focusToggleElement();
                pElem.addClass(openClass);
                popupService.open(scope);
                popupElem.addClass('st-popup-menu-open');
                popupElem.css({'top': 0, 'left': 0});// 避免导致 body 长度变化，引起滚动条变化

                $timeout(function () {// 延迟计算，1.3.6 版本中，此时无法获得弹出项尺寸
                    var targetPos = popupElem[0].getBoundingClientRect()// 弹出项 BCR
                        , width = options.width || targetPos.width
                        , height = options.height || targetPos.height
                        , popupStyle = {
                        'visibility': 'visible'// 避免改变位置时造成闪烁，此时才设置可见
                        , 'zIndex': $position.getZIndex()
                        , 'width': width + 'px'// 避免打开状态时内容变化造成 popup-menu 尺寸变化与 element 分离
                        , 'height': height + 'px'
                    };
                    popupStyle = angular.extend(
                        popupStyle,
                        $position.adaptElements(pElem, width, height, 'bottom-left', true, true)[0]// 计算得出的位置 style
                    );
                    popupElem.css(popupStyle);
                });
            } else {
                pElem.removeClass(openClass);
                popupElem.removeClass('st-popup-menu-open').css({// 重置样式
                    'visibility': ''
                    , 'zIndex': ''
                    , 'width': ''
                    , 'height': ''
                });
                popupService.close(scope);
            }
            setIsOpen($scope, isOpen);
            if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                toggleInvoker($scope, {open: !!isOpen});// 切换完成执行自定义操作
            }
        });

        $scope.$on('$locationChangeSuccess', function () {
            scope.isOpen = false;
        });

        $scope.$on('$destroy', function () {
            scope.$destroy();
        });
    }])

    app.directive('stPopup', ['$window', function ($window) {
        return {
            restrict: 'CA',
            controller: 'PopupController',
            link: function (scope, element, attrs, popupCtrl) {
                // 提取弹出项，附加到 body 中
                var popupElem;
                angular.forEach(element.children(), function (child) {
                    if (popupElem === undefined && (' ' + child.className + ' ').indexOf('st-popup-menu') >= 0) {
                        popupElem = angular.element(child);// 用 class = wi-popup-menu 标记元素为弹出项
                        $window.top.document.body.appendChild(child);// 将弹出的菜单附加到 <body> - 考虑 iframe 情况，弹出层附加在最外层 window 中
                        popupCtrl.popupOptions.elem = popupElem;
                    }
                });

                // 切换弹出层打开状态
                var togglePopup = function (event) {
                    if (event.type === 'keydown' && event.keyCode !== 13) {// 回车键
                        return;
                    }
                    event.preventDefault();// 禁止浏览器默认事件
                    event.stopPropagation();// qq:防止重复触发关闭事件
                    if (!element.hasClass('disabled') && !attrs.disabled) {// 未禁用
                        scope.$apply(function () {
                            popupCtrl.toggle();// 执行切换
                        });
                    }
                };
                element.bind('click', togglePopup);
                element.bind('keydown', togglePopup);
                scope.$on('$destroy', function () {
                    if (popupElem !== undefined) {
                        popupElem.remove();// 移除
                        popupElem = null;// 销毁
                    }
                    element.unbind('click', togglePopup);
                    element.unbind('keydown', togglePopup);
                });

                // WAI-ARIA
                element.attr({'aria-haspopup': true, 'aria-expanded': false});
                scope.$watch(popupCtrl.isOpen, function (isOpen) {
                    element.attr('aria-expanded', !!isOpen);
                });

                popupCtrl.init(element);
            }
        };
    }]);

    app.constant('comboboxConfig', {
        liHeight: 18, // 弹出框li高度
        emptyMenuHeight: 12 // 弹出框空内容时高度 2 *（border + padding）
    })

    app.factory('comboboxService', function () {
        var comboboxService = {};

        // 分组数据转换（数据源，label 域，group 域）TODO 未考虑数据源顺序
        comboboxService.initData = function (data, displayName, groupname) {
            var result = [], group = {};
            angular.forEach(data, function (item) {
                if (item[groupname] && !group[item[groupname]]) {
                    var gp = {};
                    gp[displayName] = item[groupname];
                    gp.isGroup = true;
                    result.push(gp);
                    result.push(item);
                    group[item[groupname]] = gp;
                } else {
                    result.push(item);
                }
            });
            return result;
        };
        return comboboxService;
    })

    /**
     * 前端匹配
     */
    app.filter('comboboxFilter', ['comboboxService', function (comboboxService) {
        return function (data, key, displayName, groupname) {
            var result;

            if (!key || key.length === 0) {
                result = data;
            } else {
                result = [];

                angular.forEach(data, function (item) {
                    if (item[displayName].toLowerCase().indexOf(key.toLowerCase()) === 0) {
                        result.push(item);
                    }
                });
            }
            if (groupname) {
                result = comboboxService.initData(result, displayName, groupname);
            }
            return result;
        };
    }]);

    /**
     * 下拉多选指令
     */
    app.directive('stCombobox', ['$filter', '$timeout', 'comboboxService', 'comboboxConfig',
        function ($filter, $timeout, comboboxService, comboboxConfig) {
            return {
                restrict: 'E',
                templateUrl: 'template/combobox.html',
                replace: true,
                scope: {
                    //Properties
                    datasource: '='// 数据源
                    , itemrenderer: '@'// 自定义渲染
                    , displayName: '@'// 显示字段，默认为"name"
                    , valuefield: '@'// 值字段
                    , groupname: '@'// 分组字段
                    , stmodel: '='// 值对象
                    , labelfunction: '&'// 自定义显示文本
                    , prompt: '@'// 提示文本，默认为"--请选择--"
                    , rowcount: '@'// 显示行数，默认为"5"
                    , rowheight: '@'// 行高
                    , selecteditem: '='// 所选条目，默认为null
                    , editable: '@'// 是否可输入，默认为"true"，TODO 输入时autoComplete，
                    , multiselect: '@'// 多选
                    , enable: '@'// 是否可用
                    //Events
                    , itemchange: '&'// 所选条目改变
                },
                require: 'stPopup',
                link: function (scope, element, attrs, popupCtrl) {
                    var parentScope = scope.$parent,
                        vm = scope.vm = {},
                        input = element.find('INPUT');// 文本框
                    /**
                     * 根据stmodel设置初始选中条目
                     * itemChange的时候同步更新stmodel
                     */
                        // 初始化
                    vm.displayName = scope.displayName || 'name';// 用于显示的字段名
                    vm.valuefield = scope.valuefield || 'value';// 值字段
                    vm.prompt = scope.prompt || '--请选择--';
                    vm.editable = scope.editable !== 'false';
                    vm.enable = scope.enable;
                    vm.watermark = attrs.watermark || '';
                    vm.selecteditem = scope.selecteditem || null;
                    // 分组数据处理
                    if (scope.groupname) {
                        vm.datasource = comboboxService.initData(scope.datasource, vm.displayName, scope.groupname);
                    } else {
                        vm.datasource = scope.datasource;
                    }
                    vm.rowcount = Math.min(vm.datasource.length, scope.rowcount || 5);// 下拉菜单显示行数 TODO 数据量动态变化
                    if (scope.multiselect) {
                        input.attr("readOnly", 'true');
                    }// 多选禁止输入
                    if (!vm.editable) {
                        input.attr("readOnly", 'true');
                    }// 只读
                    vm.selectedindex = vm.selecteditem ? vm.datasource.indexOf(vm.selecteditem) : -1;// 默认选中条目 - 默认为 -1

                    // 从属性获取 dropdownwidth，弹出部分的宽度
                    var dropdownwidth = parentScope.$eval(attrs.dropdownwidth);
                    if (!angular.isNumber(dropdownwidth)) {
                        dropdownwidth = undefined;
                    }
                    // 从属性获取 width，并处理
                    var dealWidth = function (attr) {
                        if (!attr) {
                            return;
                        }
                        var width;
                        if (/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)) {// 数字开始
                            width = attr;
                        } else {// 非数字开始，可能是 scope 对象
                            width = parentScope.$eval(attr);
                        }
                        if (Number(width)) {
                            element.css('width', width + 'px');
                            if (!dropdownwidth) {
                                dropdownwidth = width;
                            }// 若未定义 dropdownwidth，则为 width
                        } else {
                            element.css('width', width);
                        }
                    };
                    dealWidth(attrs.width);

                    // 向 popup 服务中传递弹出项配置
                    popupCtrl.popupOptions.height = comboboxConfig.emptyMenuHeight + comboboxConfig.liHeight * vm.rowcount;
                    popupCtrl.popupOptions.width = dropdownwidth;
                    if (vm.selecteditem) {
                        vm._text = vm.selecteditem[vm.displayName];
                    }// input 中显示选中项 label

                    if (scope.stmodel !== undefined) {
                        angular.forEach(vm.datasource, function (item, index) {
                            if (item[vm.valuefield] === scope.stmodel) {
                                vm._text = item[vm.displayName];
                                vm.selectedindex = index;
                            }
                        });
                    }

                    // 若定义了 enable，监听禁用状态
                    if (attrs.hasOwnProperty('enable')) {
                        scope.$watch('enable', function (oldValue, newValue) {
                            if (oldValue !== newValue) {
                                vm.enable = oldValue === 'false';
                            }
                        });
                    }

                    /* 事件监听 */
                    var _onFocus = false;// 标记是否聚焦
                    input[0].addEventListener('focus', focus);
                    function focus(event) {// 聚焦已关闭的 combobox，打开
                        if (!vm.isopen) {
                            scope.$apply(function () {
                                vm.isopen = true;// 在 popup 服务中，焦点转移至 element
                                _onFocus = true;
                            });
                        }
                        event.stopPropagation();
                    }

                    element[0].addEventListener('blur', function () {// 失焦时修改 _onFocus - 失焦时由 popup 服务关闭
                        _onFocus = false;
                    });
                    input[0].addEventListener('click', inputClick);
                    function inputClick(event) {
                        if (_onFocus && vm.isopen) {// 若 _onFocus=true 且已打开，修改 _onFocus，此时聚焦元素为 element
                            _onFocus = false;
                            event.stopPropagation();// 禁止冒泡，防止在 popup 中再次修改 vm.isopen
                        }
                    }

                    // 列表项点击事件 - data：被点击的列表项数据
                    vm.itemClickHandler = function (data, event) {
                        if (data.isGroup) {
                            // 阻止事件传播，不关闭弹出框
                            event.stopPropagation();
                            return;
                        }
                        if (scope.multiselect) {// 多选
                            event.stopPropagation();
                            data._checked = !data._checked;// 修改选中状态
                            var txt = [], selItems = [];// 所有选中项文本及选中项
                            angular.forEach(scope.datasource, function (item) {
                                if (item._checked) {
                                    txt.push(item[vm.displayName]);
                                    selItems.push(item);
                                }
                            });
                            if (scope.itemchange()) {
                                scope.itemchange()(selItems);
                            }
                            vm.selecteditem = selItems;
                            vm._text = txt.join('; ');
                            // TODO 多选时model如何传

                        } else {// 单选
                            if (data !== vm.selecteditem) {
                                if (scope.itemchange()) {
                                    scope.itemchange()(data);
                                }
                            }
                            vm.selecteditem = data;
                            vm.selectedindex = vm.datasource.indexOf(vm.selecteditem);
                            vm._text = data[vm.displayName];
                            scope.stmodel = data[vm.valuefield];
                        }
                    };

                    // 根据输入的内容过滤下拉框数据
                    vm.inputChange = function () {
                        $timeout(function () {
                            vm.datasource = $filter('comboboxFilter')(scope.datasource, vm._text, vm.displayName, scope.groupname);
                            if (!vm.isopen) {
                                vm.isopen = true;
                            }
                            vm.selectedindex = vm.datasource.length > 0 && vm._text.length > 0 ? 0 : -1;
                            // 选中第一个非group
                            while (vm.datasource[vm.selectedindex]
                            && vm.datasource[vm.selectedindex.isGroup]
                            && vm.selectedindex < vm.datasource.length) {
                                vm.selectedindex++;
                            }
                        }, 0);
                    };

                    // 上、下、回车
                    vm.keydownHandler = function (event) {
                        var keyCode = event.keyCode;

                        // 上
                        if (keyCode === 38) {
                            do {
                                if (vm.selectedindex !== 0 && vm.selectedindex !== -1) {
                                    vm.selectedindex--;
                                }
                                else {
                                    vm.selectedindex = vm.datasource.length - 1;
                                }
                            } while (vm.datasource[vm.selectedindex].isGroup && vm.selectedindex >= 0);
                        }
                        // 下
                        else if (keyCode === 40) {
                            do {
                                if (vm.selectedindex < vm.datasource.length - 1) {
                                    vm.selectedindex++;
                                }
                                else {
                                    vm.selectedindex = 0;
                                }
                            } while (vm.datasource[vm.selectedindex].isGroup && vm.selectedindex < vm.datasource.length);
                        }
                        // 回车
                        else if (keyCode === 13) {
                            if (vm.isopen) {
                                vm.datasource = $filter('comboboxFilter')(scope.datasource, '', vm.displayName, scope.groupname);
                                vm.selectedindex = vm.datasource.indexOf(vm.selecteditem);
                            } else {
                                var selitem = vm.datasource[vm.selectedindex];
                                if (vm.selecteditem !== selitem) {
                                    if (scope.itemchange()) {
                                        scope.itemchange()(selitem);
                                    }
                                }
                                vm.selecteditem = selitem;
                                if (vm.selecteditem) {
                                    vm._text = vm.selecteditem[vm.displayName];
                                    if (vm._text) {
                                        scope.stmodel = vm.selecteditem[vm.valuefield];
                                    }
                                }
                            }
                        }
                        else {
                            return;
                        }

                        $timeout(function () {
                            popupCtrl.popupOptions.elem[0].scrollTop = comboboxConfig.liHeight * vm.selectedindex;// 滚动到选中项
                        });
                    };

                    // TODO 是否需要，若需要未考虑 input.focus
                    vm.clickHandler = function () {
                        popupCtrl.popupOptions.elem[0].scrollTop = comboboxConfig.liHeight * vm.selectedindex;
                        if (vm.isopen) {
                            vm.datasource = $filter('comboboxFilter')(scope.datasource, '', vm.displayName, scope.groupname);
                        }
                    };

                }
            };
        }]);
    //时间过滤指令
    app.directive('timeFilter', [function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                var strTime = attrs.timeFilter + "";
                if (strTime.length <= 6) {
                    if (strTime.length < 6) {
                        for (var i = strTime.length; i < 6; i++) {
                            strTime = "0" + strTime;
                        }
                    }
                    elem[0].value = strTime.substring(0, 2) + ":" + strTime.substring(2, 4) + ":" + strTime.substring(4, 6);
                }
                else {
                    return strTime;
                }
            }
        };
    }]);

    //日期过滤指令
    app.directive('dateformatFilter', [function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                var strDate = attrs.dateformatFilter + "";
                if (strDate.length <= 8) {
                    elem[0].value = strDate.substring(0, 4) + "-" + strDate.substring(4, 6) + "-" + strDate.substring(6, 8);
                }
                else {
                    return strDate;
                }
            }
        };
    }]);
    //非数字非字母过滤
    app.directive("hsKeyup", function ($filter) {
        return {
            scope: {
                data: "="
            },
            link: function (scope, element, attrs) {
                element.bind('keyup', function () {
                    var result = new RegExp(attrs.hsKeyup);
                    if (scope.data) {
                        scope.data = scope.data.replace(result, "");
                        scope.$apply();
                    }
                });

            }
        }
    });

    /**
     * 下拉刷新指令
     */
    app.directive("scrollRefresh", function () {
        return {
            restrict: 'EA',
            link: function ($scope, elem, attrs) {
                var scrollE = elem[0];
                elem.bind('scroll', function () {
                    if (scrollE.scrollTop + scrollE.offsetHeight >= scrollE.scrollHeight && scrollE.scrollTop > 0) {
                        $scope.$apply(attrs.scrollRefresh);
                    }
                });
            }
        }
    });

})