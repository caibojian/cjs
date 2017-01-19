 // 启用报警检查和通知
        var netdataShowAlarms = true;

        // 启用注册表更新
        var netdataRegistry = true;

        // --------------------------------------------------------------------
        // urlOptions

        var urlOptions = {
            hash: '#',
            theme: null,
            help: null,
            update_always: false,
            pan_and_zoom: false,
            after: 0,
            before: 0,
            nowelcome: false,
            show_alarms: false,
            chart: null,
            family: null,
            alarm: null,
            alarm_unique_id: 0,
            alarm_id: 0,
            alarm_event_id: 0,

            hasProperty: function(property) {
                // console.log('checking property ' + property + ' of type ' + typeof(this[property]));
                return typeof this[property] !== 'undefined';
            },

            genHash: function() {
                var hash = urlOptions.hash;

                if(urlOptions.pan_and_zoom === true) {
                    hash += ';after='  + urlOptions.after.toString() +
                            ';before=' + urlOptions.before.toString();
                }

                if(urlOptions.theme !== null)
                    hash += ';theme=' + urlOptions.theme.toString();

                if(urlOptions.help !== null)
                    hash += ';help=' + urlOptions.help.toString();

                if(urlOptions.update_always === true)
                    hash += ';update_always=true';

                return hash;
            },

            parseHash: function() {
                var variables = document.location.hash.split(';');
                var len = variables.length;
                while(len--) {
                    if(len !== 0) {
                        var p = variables[len].split('=');
                        if(urlOptions.hasProperty(p[0]) && typeof p[1] !== 'undefined')
                            urlOptions[p[0]] = decodeURIComponent(p[1]);
                    }
                    else {
                        if(variables[len].length > 0)
                            urlOptions.hash = variables[len];
                    }
                }

                var booleans = [ 'nowelcome', 'show_alarms', 'pan_and_zoom', 'update_always' ];
                len = booleans.length;
                while(len--) {
                    if(urlOptions[booleans[len]] === 'true' || urlOptions[booleans[len]] === true || urlOptions[booleans[len]] === '1' || urlOptions[booleans[len]] === 1)
                        urlOptions[booleans[len]] = true;
                    else
                        urlOptions[booleans[len]] = false;
                }

                if(urlOptions.before > 0 && urlOptions.after > 0) {
                    urlOptions.pan_and_zoom = true;
                    urlOptions.nowelcome = true;
                }
                else
                    urlOptions.pan_and_zoom = false;

                // console.log(urlOptions);
            },

            hashUpdate: function() {
                history.replaceState(null, '', urlOptions.genHash());
            },

            netdataPanAndZoomCallback: function(status, after, before) {
                urlOptions.pan_and_zoom = status;
                urlOptions.after = after;
                urlOptions.before = before;
                urlOptions.hashUpdate();
            }

        };

        urlOptions.parseHash();

        // --------------------------------------------------------------------
        // 检查在加载netdata.js之前应该处理的选项

        function loadLocalStorage(name) {
            var ret = null;

            try {
                if(typeof Storage !== "undefined" && typeof localStorage === 'object')
                    ret = localStorage.getItem(name);
            }
            catch(error) {
                ;
            }

            if(typeof ret === 'undefined' || ret === null)
                return null;

            // console.log('loaded: ' + name.toString() + ' = ' + ret.toString());

            return ret;
        }

        function saveLocalStorage(name, value) {
            // console.log('saving: ' + name.toString() + ' = ' + value.toString());
            try {
                if(typeof Storage !== "undefined" && typeof localStorage === 'object') {
                    localStorage.setItem(name, value.toString());
                    return true;
                }
            }
            catch(error) {
                ;
            }

            return false;
        }

        function getTheme(def) {
            var ret = loadLocalStorage('netdataTheme');
            if(typeof ret === 'undefined' || ret === null || ret === 'undefined')
                return def;
            else
                return ret;
        }

        function setTheme(theme) {
            if(theme === netdataTheme) return false;
            return saveLocalStorage('netdataTheme', theme);
        }

        var netdataTheme = getTheme('slate');
        var netdataShowHelp = true;

        if(urlOptions.theme !== null) {
            setTheme(urlOptions.theme);
            netdataTheme = urlOptions.theme;
        }
        else
            urlOptions.theme = netdataTheme;

        if(urlOptions.help !== null) {
            saveLocalStorage('options.show_help', urlOptions.help);
            netdataShowHelp = urlOptions.help;
        }
        else {
            urlOptions.help = loadLocalStorage('options.show_help');
        }

        // --------------------------------------------------------------------
        // 注册表回调来渲染我的netdata菜单

        var netdataRegistryCallback = function(machines_array) {
            var el = '';
            var a1 = '';
            var found = 0;

            if(machines_array === null) {
                var ret = loadLocalStorage("registryCallback");
                if(typeof ret !== 'undefined' && ret !== null) {
                    machines_array = JSON.parse(ret);
                    console.log("failed to contact the registry - loaded registry data from browser local storage");
                }
            }

            if(machines_array) {
                saveLocalStorage("registryCallback", JSON.stringify(machines_array));

                var machines = machines_array.sort(function (a, b) {
                    if (a.name > b.name) return -1;
                    if (a.name < b.name) return 1;
                    return 0;
                });

                var len = machines.length;
                while(len--) {
                    var u = machines[len];
                    found++;
                    el += '<li id="registry_server_' + u.guid + '"><a class="registry_link" href="' + u.url + '" onClick="return gotoServerModalHandler(\'' + u.guid + '\');">' + u.name + '</a></li>';
                    a1 += '<li id="registry_action_' + u.guid + '"><a href="#" onclick="deleteRegistryModalHandler(\'' + u.guid + '\',\'' + u.name + '\',\'' + u.url + '\'); return false;"><i class="fa fa-trash-o" aria-hidden="true" style="color: #999;"></i></a></li>';
                }
            }

            if(!found) {
                if(machines)
                    el += '<li><a href="https://github.com/firehol/netdata/wiki/mynetdata-menu-item" style="color: #666;" target="_blank">your netdata server list is empty...</a></li>';
                else
                    el += '<li><a href="https://github.com/firehol/netdata/wiki/mynetdata-menu-item" style="color: #666;" target="_blank">failed to contact the registry...</a></li>';

                a1 += '<li><a href="#" onClick="return false;">&nbsp;</a></li>';

                el += '<li role="separator" class="divider"></li>' +
                        '<li><a href="//london.netdata.rocks/default.html">UK - London (DigitalOcean.com)</a></li>' +
                        '<li><a href="//newyork.netdata.rocks/default.html">US - New York (DigitalOcean.com)</a></li>' +
                        '<li><a href="//sanfrancisco.netdata.rocks/default.html">US - San Francisco (DigitalOcean.com)</a></li>' +
                        '<li><a href="//atlanta.netdata.rocks/default.html">US - Atlanta (CDN77.com)</a></li>' +
                        '<li><a href="//frankfurt.netdata.rocks/default.html">Germany - Frankfurt (DigitalOcean.com)</a></li>' +
                        '<li><a href="//toronto.netdata.rocks/default.html">Canada - Toronto (DigitalOcean.com)</a></li>' +
                        '<li><a href="//singapore.netdata.rocks/default.html">Japan - Singapore (DigitalOcean.com)</a></li>' +
                        '<li><a href="//bangalore.netdata.rocks/default.html">India - Bangalore (DigitalOcean.com)</a></li>';
                a1 += '<li role="separator" class="divider"></li>' +
                        '<li><a href="#">&nbsp;</a></li>' +
                        '<li><a href="#">&nbsp;</a></li>'+
                        '<li><a href="#">&nbsp;</a></li>'+
                        '<li><a href="#">&nbsp;</a></li>'+
                        '<li><a href="#">&nbsp;</a></li>'+
                        '<li><a href="#">&nbsp;</a></li>'+
                        '<li><a href="#">&nbsp;</a></li>'+
                        '<li><a href="#">&nbsp;</a></li>';
            }

            el += '<li role="separator" class="divider"></li>';
            a1 += '<li role="separator" class="divider"></li>';

            el += '<li><a href="https://github.com/firehol/netdata/wiki/mynetdata-menu-item" style="color: #999;" target="_blank">What is this?</a></li>';
            a1 += '<li><a href="#" style="color: #999;" onclick="switchRegistryModalHandler(); return false;"><i class="fa fa-sliders" aria-hidden="true" style="color: #999;"></i></a></li>'

            document.getElementById('mynetdata_servers').innerHTML = el;
            document.getElementById('mynetdata_servers2').innerHTML = el;
            document.getElementById('mynetdata_actions1').innerHTML = a1;

            gotoServerInit();
        };

        var this_is_demo = null; // FIXME
        function isdemo() {
            if(this_is_demo !== null) return this_is_demo;
            this_is_demo = false;

            try {
                if(typeof document.location.hostname === 'string') {
                    if(document.location.hostname.endsWith('.my-netdata.io') ||
                            document.location.hostname.endsWith('.mynetdata.io') ||
                            document.location.hostname.endsWith('.netdata.rocks') ||
                            document.location.hostname.endsWith('.firehol.org') ||
                            document.location.hostname.endsWith('.netdata.online'))
                            this_is_demo = true;
                }
            }
            catch(error) {
                ;
            }

            return this_is_demo;
        }

        function netdataURL(url) {
            if(typeof url === 'undefined')
                url = document.location.toString();

            if(url.indexOf('#') !== -1)
                url = url.substring(0, url.indexOf('#'));

            var hash = urlOptions.genHash();

            // console.log('netdataURL: ' + url + hash);

            return url + hash;
        }

        function netdataReload(url) {
            var t = netdataURL(url);
            // console.log('netdataReload: ' + t);
            document.location = t;

            // 因为我们玩哈希
            //这是需要重新加载页面
            location.reload();
        }

        var gotoServerValidateRemaining = 0;
        var gotoServerMiddleClick = false;
        var gotoServerStop = false;
        function gotoServerValidateUrl(id, guid, url) {
            var penaldy = 0;
            var error = 'failed';

            if(document.location.toString().startsWith('http://') && url.toString().startsWith('https://'))
                // 我们惩罚https只有当前的URL是http 
                //允许用户遍历所有的服务器。
                penaldy = 500;

            else if(document.location.toString().startsWith('https://') && url.toString().startsWith('http://'))
                error = 'can\'t check';

            var finalURL = netdataURL(url);

            setTimeout(function() {
                document.getElementById('gotoServerList').innerHTML += '<tr><td style="padding-left: 20px;"><a href="' + finalURL + '" target="_blank">' + url + '</a></td><td style="padding-left: 30px;"><code id="' + guid + '-' + id + '-status">checking...</code></td></tr>';

                NETDATA.registry.hello(url, function(data) {
                    if(typeof data !== 'undefined' && data !== null && typeof data.machine_guid === 'string' && data.machine_guid === guid) {
                        // console.log('OK ' + id + ' URL: ' + url);
                        document.getElementById(guid + '-' + id + '-status').innerHTML = "OK";

                        if(!gotoServerStop) {
                            gotoServerStop = true;

                            if(gotoServerMiddleClick) {
                                window.open(finalURL, '_blank');
                                gotoServerMiddleClick = false;
                                document.getElementById('gotoServerResponse').innerHTML = '<b>Opening new window to ' + NETDATA.registry.machines[guid].name + '<br/><a href="' + finalURL + '">' + url + '</a></b><br/>(check your pop-up blocker if it fails)';
                            }
                            else {
                                document.getElementById('gotoServerResponse').innerHTML += 'found it! It is at:<br/><small>' + url + '</small>';
                                document.location = finalURL;
                            }
                        }
                    }
                    else {
                        if(typeof data !== 'undefined' && data !== null && typeof data.machine_guid === 'string' && data.machine_guid !== guid)
                            error = 'wrong machine';

                        document.getElementById(guid + '-' + id + '-status').innerHTML = error;
                        gotoServerValidateRemaining--;
                        if(gotoServerValidateRemaining <= 0) {
                            gotoServerMiddleClick = false;
                            document.getElementById('gotoServerResponse').innerHTML = '<b>Sorry! I cannot find any operational URL for this server</b>';
                        }
                    }
                });
            }, (id * 50) + penaldy);
        }

        function gotoServerModalHandler(guid) {
            // console.log('goto server: ' + guid);

            gotoServerStop = false;
            var checked = {};
            var len = NETDATA.registry.machines[guid].alternate_urls.length;
            var count = 0;

            document.getElementById('gotoServerResponse').innerHTML = '';
            document.getElementById('gotoServerList').innerHTML = '';
            document.getElementById('gotoServerName').innerHTML = NETDATA.registry.machines[guid].name;
            $('#gotoServerModal').modal('show');

            gotoServerValidateRemaining = len;
            while(len--) {
                var url = NETDATA.registry.machines[guid].alternate_urls[len];
                checked[url] = true;
                gotoServerValidateUrl(count++, guid, url);
            }

            setTimeout(function() {
                if(gotoServerStop === false) {
                    document.getElementById('gotoServerResponse').innerHTML = '<b>Added all the known URLs for this machine.</b>';
                    NETDATA.registry.search(guid, function(data) {
                        // console.log(data);
                        len = data.urls.length;
                        while(len--) {
                            var url = data.urls[len][1];
                            // console.log(url);
                            if(typeof checked[url] === 'undefined') {
                                gotoServerValidateRemaining++;
                                checked[url] = true;
                                gotoServerValidateUrl(count++, guid, url);
                            }
                        }
                    });
                }
            }, 2000);
            return false;
        }

        function gotoServerInit() {
            $(".registry_link").on('click', function(e) {
                if(e.which === 2) {
                    e.preventDefault();
                    gotoServerMiddleClick = true;
                }
                else {
                    gotoServerMiddleClick = false;
                }

                return true;
            });
        }

        function switchRegistryModalHandler() {
            document.getElementById('switchRegistryPersonGUID').value = NETDATA.registry.person_guid;
            document.getElementById('switchRegistryURL').innerHTML = NETDATA.registry.server;
            document.getElementById('switchRegistryResponse').innerHTML = '';
            $('#switchRegistryModal').modal('show');
        }

        function notifyForSwitchRegistry() {
            var n = document.getElementById('switchRegistryPersonGUID').value;

            if(n !== '' && n.length === 36) {
                NETDATA.registry.switch(n, function(result) {
                    if(result !== null) {
                        $('#switchRegistryModal').modal('hide');
                        NETDATA.registry.init();
                    }
                    else {
                        document.getElementById('switchRegistryResponse').innerHTML = "<b>Sorry! The registry rejected your request.</b>";
                    }
                });
            }
            else
                document.getElementById('switchRegistryResponse').innerHTML = "<b>The ID you have entered is not a GUID.</b>";
        }

        var deleteRegistryUrl = null;
        function deleteRegistryModalHandler(guid, name, url) {
            deleteRegistryUrl = url;
            document.getElementById('deleteRegistryServerName').innerHTML = name;
            document.getElementById('deleteRegistryServerName2').innerHTML = name;
            document.getElementById('deleteRegistryServerURL').innerHTML = url;
            document.getElementById('deleteRegistryResponse').innerHTML = '';
            $('#deleteRegistryModal').modal('show');
        }

        function notifyForDeleteRegistry() {
            if(deleteRegistryUrl) {
                NETDATA.registry.delete(deleteRegistryUrl, function(result) {
                    if(result !== null) {
                        deleteRegistryUrl = null;
                        $('#deleteRegistryModal').modal('hide');
                        NETDATA.registry.init();
                    }
                    else {
                        document.getElementById('deleteRegistryResponse').innerHTML = "<b>Sorry! this command was rejected by the registry server.</b>";
                    }
                });
            }
        }

        var options = {
            sparklines_registry: {},
            menus: {},
            submenu_names: {},
            data: null,
            hostname: 'netdata_server', // will be overwritten by the netdata server
            categories: new Array(),
            categories_idx: {},
            families: new Array(),
            families_idx: {},

            chartsPerRow: 0,
            chartsMinWidth: 1450,
            chartsHeight: 180,
            sparklinesHeight: 60,
        };

        // 生成sparkline 
        //在文档中使用
        function sparkline(chart, dimension, units) {
            var key = chart + '.' + dimension;

            if(typeof units === 'undefined')
                units = '';

            if(typeof options.sparklines_registry[key] === 'undefined')
                options.sparklines_registry[key] = { count: 1 };
            else
                options.sparklines_registry[key].count++;

            key = key + '.' + options.sparklines_registry[key].count;

            var h = '<div data-netdata="' + chart + '" data-after="-120" data-width="25%" data-height="15px" data-chart-library="dygraph" data-dygraph-theme="sparkline" data-dimensions="' + dimension + '" data-show-value-of-' + dimension + '-at="' + key + '"></div> (<span id="' + key + '" style="display: inline-block; min-width: 50px; text-align: right;">X</span>' + units + ')';

            return h;
        }

        function chartsPerRow(total) {
            if(options.chartsPerRow === 0) {
                width = Math.floor(total / options.chartsMinWidth);
                if(width === 0) width = 1;
                return width;
            }
            else return options.chartsPerRow;
        }

        function prioritySort(a, b) {
            if(a.priority < b.priority) return -1;
            if(a.priority > b.priority) return 1;
            if(a.name < b.name) return -1;
            return 1;
        }

        function sortObjectByPriority(object) {
            var idx = {};
            var sorted = new Array();

            for(var i in object) {
                if(typeof idx[i] === 'undefined') {
                    idx[i] = object[i];
                    sorted.push(i);
                }
            }

            sorted.sort(function(a, b) {
                if(idx[a].priority < idx[b].priority) return -1;
                if(idx[a].priority > idx[b].priority) return 1;
                if(a < b) return -1;
                return 1;
            });

            return sorted;
        }


        // ----------------------------------------------------------------------------
        // 滚动到某个部分，而不更改浏览器历史记录

        function scrollToId(hash) {
            if(hash && hash != '' && document.getElementById(hash) !== null) {
                var offset = $('#' + hash).offset();
                if(typeof offset !== 'undefined')
                    $('html, body').animate({ scrollTop: offset.top }, 0);
            }

            // we must return false to prevent the default action
            return false;
        }

        // ----------------------------------------------------------------------------

        var netdataDashboard = {
            menu: {},
            submenu: {},
            context: {},

            gaugeChart: function(title, width, dimensions, colors) {
                if(typeof colors === 'undefined')
                    colors = '';

                if(typeof dimensions === 'undefined')
                    dimensions = '';

                return '<div data-netdata="CHART_UNIQUE_ID"'
                                        + ' data-dimensions="' + dimensions + '"'
                                        + ' data-chart-library="gauge"'
                                        + ' data-gauge-adjust="width"'
                                        + ' data-title="' + title + '"'
                                        + ' data-width="' + width + '"'
                                        + ' data-before="0"'
                                        + ' data-after="-CHART_DURATION"'
                                        + ' data-points="CHART_DURATION"'
                                        + ' data-colors="' + colors + '"'
                                        + ' role="application"></div>';
            },

            anyAttribute: function(obj, attr, key, def) {
                if(typeof obj[key] !== 'undefined') {
                    if(typeof obj[key][attr] !== 'undefined')
                        return obj[key][attr];
                }
                return def;
            },

            menuTitle: function(chart) {
                if(typeof chart.menu_pattern !== 'undefined') {
                    return (netdataDashboard.anyAttribute(netdataDashboard.menu, 'title', chart.menu_pattern, chart.menu_pattern).toString()
                            + '&nbsp;' + chart.type.slice(-(chart.type.length - chart.menu_pattern.length - 1)).toString()).replace(/_/g, ' ');
                }

                return (netdataDashboard.anyAttribute(netdataDashboard.menu, 'title', chart.menu, chart.menu)).toString().replace(/_/g, ' ');
            },

            menuIcon: function(chart) {
                if(typeof chart.menu_pattern !== 'undefined')
                    return netdataDashboard.anyAttribute(netdataDashboard.menu, 'icon', chart.menu_pattern, '<i class="fa fa-puzzle-piece" aria-hidden="true"></i>').toString();

                return netdataDashboard.anyAttribute(netdataDashboard.menu, 'icon', chart.menu, '<i class="fa fa-puzzle-piece" aria-hidden="true"></i>');
            },

            menuInfo: function(menu) {
                return netdataDashboard.anyAttribute(netdataDashboard.menu, 'info', menu, null);
            },

            menuHeight: function(menu, relative) {
                return netdataDashboard.anyAttribute(netdataDashboard.menu, 'height', menu, 1.0) * relative;
            },

            submenuTitle: function(menu, submenu) {
                var key = menu + '.' + submenu;
                var title = netdataDashboard.anyAttribute(netdataDashboard.submenu, 'title', key, submenu).toString().replace(/_/g, ' ');;
                if(title.length > 28) {
                    var a = title.substring(0, 13);
                    var b = title.substring(title.length - 12, title.length);
                    return a + '...' + b;
                }
                return title;
            },

            submenuInfo: function(menu, submenu) {
                var key = menu + '.' + submenu;
                return netdataDashboard.anyAttribute(netdataDashboard.submenu, 'info', key, null);
            },

            submenuHeight: function(menu, submenu, relative) {
                var key = menu + '.' + submenu;
                return netdataDashboard.anyAttribute(netdataDashboard.submenu, 'height', key, 1.0) * relative;
            },

            contextInfo: function(id) {
                if(typeof netdataDashboard.context[id] !== 'undefined' && typeof netdataDashboard.context[id].info !== 'undefined')
                    return '<div class="chart-message netdata-chart-alignment" role="document">' + netdataDashboard.context[id].info + '</div>';
                else
                    return '';
            },

            contextValueRange: function(id) {
                if(typeof netdataDashboard.context[id] !== 'undefined' && typeof netdataDashboard.context[id].valueRange !== 'undefined')
                    return netdataDashboard.context[id].valueRange;
                else
                    return '[null, null]';
            },

            contextHeight: function(id, def) {
                if(typeof netdataDashboard.context[id] !== 'undefined' && typeof netdataDashboard.context[id].height !== 'undefined')
                    return def * netdataDashboard.context[id].height;
                else
                    return def;
            }
        };

        // ----------------------------------------------------------------------------

        // 丰富netdata返回的数据结构
        //以反映我们的菜单系统和内容
        function enrichChartData(chart) {
            var tmp = chart.type.split('_')[0];

            switch(tmp) {
                case 'ap':
                case 'net':
                case 'disk':
                    chart.menu = tmp;
                    break;

                case 'cgroup':
                    chart.menu = chart.type;
                    if(chart.id.match(/.*[\._\/-:]qemu[\._\/-:]*/) || chart.id.match(/.*[\._\/-:]kvm[\._\/-:]*/))
                        chart.menu_pattern = 'cgqemu';
                    else
                        chart.menu_pattern = 'cgroup';
                    break;

                case 'apache':
                case 'exim':
                case 'dovecot':
                case 'hddtemp':
                case 'ipfs':
                case 'memcached':
                case 'mysql':
                case 'named':
                case 'nginx':
                case 'nut':
                case 'phpfpm':
                case 'postfix':
                case 'postgres':
                case 'redis':
                case 'retroshare':
                case 'smawebbox':
                case 'snmp':
                case 'squid':
                case 'tomcat':
                    chart.menu = chart.type;
                    chart.menu_pattern = tmp;
                    break;

                case 'tc':
                    chart.menu = tmp;

                    // find a name for this device from fireqos info
                    // we strip '_(in|out)' or '(in|out)_'
                    if(typeof options.submenu_names[chart.family] === 'undefined' || options.submenu_names[chart.family] === chart.family) {
                        var n = chart.name.split('.')[1];
                        if(n.endsWith('_in'))
                            options.submenu_names[chart.family] = n.slice(0, n.lastIndexOf('_in'));
                        else if(n.endsWith('_out'))
                            options.submenu_names[chart.family] = n.slice(0, n.lastIndexOf('_out'));
                        else if(n.startsWith('in_'))
                            options.submenu_names[chart.family] = n.slice(3, n.length);
                        else if(n.startsWith('out_'))
                            options.submenu_names[chart.family] = n.slice(4, n.length);
                    }

                    // increase the priority of IFB devices
                    // to have inbound appear before outbound
                    if(chart.id.match(/.*-ifb$/))
                        chart.priority--;

                    break;

                default:
                    chart.menu = chart.type;
                    break;
            }

            chart.submenu = chart.family;
        }

        // ----------------------------------------------------------------------------

        function headMain(charts, duration) {
            var head = '';

            if(typeof charts['system.swap'] !== 'undefined')
                head += '<div style="margin-right: 10px;" data-netdata="system.swap"'
                + ' data-dimensions="used"'
                + ' data-append-options="percentage"'
                + ' data-chart-library="easypiechart"'
                + ' data-title="Used Swap"'
                + ' data-units="%"'
                + ' data-easypiechart-max-value="100"'
                + ' data-width="8%"'
                + ' data-before="0"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' data-colors="#DD4400"'
                + ' role="application"></div>';

            if(typeof charts['system.io'] !== 'undefined') {
                head += '<div style="margin-right: 10px;" data-netdata="system.io"'
                + ' data-dimensions="in"'
                + ' data-chart-library="easypiechart"'
                + ' data-title="Disk Read"'
                + ' data-width="10%"'
                + ' data-before="0"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' role="application"></div>';

                head += '<div style="margin-right: 10px;" data-netdata="system.io"'
                + ' data-dimensions="out"'
                + ' data-chart-library="easypiechart"'
                + ' data-title="Disk Write"'
                + ' data-width="10%"'
                + ' data-before="0"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' role="application"></div>';
            }

            if(typeof charts['system.cpu'] !== 'undefined')
                head += '<div data-netdata="system.cpu"'
                + ' data-chart-library="gauge"'
                + ' data-title="CPU"'
                + ' data-units="%"'
                + ' data-gauge-max-value="100"'
                + ' data-width="18%"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' data-colors="' + NETDATA.colors[12] + '"'
                + ' role="application"></div>';

            if(typeof charts['system.ipv4'] !== 'undefined') {
                head += '<div style="margin-right: 10px;" data-netdata="system.ipv4"'
                + ' data-dimensions="received"'
                + ' data-chart-library="easypiechart"'
                + ' data-title="IPv4 Inbound"'
                + ' data-width="10%"'
                + ' data-before="0"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' role="application"></div>';

                head += '<div style="margin-right: 10px;" data-netdata="system.ipv4"'
                + ' data-dimensions="sent"'
                + ' data-chart-library="easypiechart"'
                + ' data-title="IPv4 Outbound"'
                + ' data-width="10%"'
                + ' data-before="0"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' role="application"></div>';
            }
            else if(typeof charts['system.ipv6'] !== 'undefined') {
                head += '<div style="margin-right: 10px;" data-netdata="system.ipv6"'
                + ' data-dimensions="received"'
                + ' data-chart-library="easypiechart"'
                + ' data-title="IPv6 Inbound"'
                + ' data-units="kbps"'
                + ' data-width="10%"'
                + ' data-before="0"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' role="application"></div>';

                head += '<div style="margin-right: 10px;" data-netdata="system.ipv6"'
                + ' data-dimensions="sent"'
                + ' data-chart-library="easypiechart"'
                + ' data-title="IPv6 Outbound"'
                + ' data-units="kbps"'
                + ' data-width="10%"'
                + ' data-before="0"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' role="application"></div>';
            }

            if(typeof charts['system.ram'] !== 'undefined')
                head += '<div style="margin-right: 10px;" data-netdata="system.ram"'
                + ' data-dimensions="used|buffers|active|wired"' // active and wired are FreeBSD stats
                + ' data-append-options="percentage"'
                + ' data-chart-library="easypiechart"'
                + ' data-title="Used RAM"'
                + ' data-units="%"'
                + ' data-easypiechart-max-value="100"'
                + ' data-width="8%"'
                + ' data-after="-' + duration.toString() + '"'
                + ' data-points="' + duration.toString() + '"'
                + ' data-colors="' + NETDATA.colors[7] + '"'
                + ' role="application"></div>';

            return head;
        }

        function generateHeadCharts(type, chart, duration) {
            var head = '';
            var hcharts = netdataDashboard.anyAttribute(netdataDashboard.context, type, chart.context, []);
            if(hcharts.length > 0) {
                var hi = 0, hlen = hcharts.length;
                while(hi < hlen) {
                    if(typeof hcharts[hi] === 'function')
                        head += hcharts[hi](chart.id).replace('CHART_DURATION', duration.toString()).replace('CHART_UNIQUE_ID', chart.id);
                    else
                        head += hcharts[hi].replace('CHART_DURATION', duration.toString()).replace('CHART_UNIQUE_ID', chart.id);
                    hi++;
                }
            }
            return head;
        }

        function renderPage(menus, data) {
            var div = document.getElementById('charts_div');
            var pcent_width = Math.floor(100 / chartsPerRow($(div).width()));

            // 找到每秒更新的适当持续时间
            var duration = Math.round(($(div).width() * pcent_width / 100 * data.update_every / 3) / 60) * 60;
            var html = '';
            var sidebar = '<ul class="nav dashboard-sidenav" data-spy="affix" id="sidebar_ul">';
            var mainhead = headMain(data.charts, duration);

            // sort the menus
            var main = sortObjectByPriority(menus);
            var i = 0, len = main.length;
            while(i < len) {
                var menu = main[i++];

                // generate an entry at the main menu

                var menuid = NETDATA.name2id('menu_' + menu);
                sidebar += '<li class=""><a href="#' + menuid + '" onClick="return scrollToId(\'' + menuid + '\');">' + menus[menu].icon + ' ' + menus[menu].title + '</a><ul class="nav">';
                html += '<div role="section"><div role="sectionhead"><h1 id="' + menuid + '" role="heading">' + menus[menu].title + '</h1></div><div role="document">';

                if(menus[menu].info !== null)
                    html += menus[menu].info;

                // console.log(' >> ' + menu + ' (' + menus[menu].priority + '): ' + menus[menu].title);

                var shtml = '';
                var mhead = '<div class="netdata-chart-row">' + mainhead;
                mainhead = '';

                // sort the submenus of this menu
                var sub = sortObjectByPriority(menus[menu].submenus);
                var si = 0, slen = sub.length;
                while(si < slen) {
                    var submenu = sub[si++];

                    // generate an entry at the submenu
                    var submenuid = NETDATA.name2id('menu_' + menu + '_submenu_' + submenu);
                    sidebar += '<li class><a href="#' + submenuid + '" onClick="return scrollToId(\'' + submenuid + '\');">' + menus[menu].submenus[submenu].title + '</a></li>';
                    shtml += '<div class="netdata-group-container" id="' + submenuid + '" style="display: inline-block; width: ' + pcent_width.toString() + '%"><h2 id="' + submenuid + '" class="netdata-chart-alignment" role="heading">' + menus[menu].submenus[submenu].title + '</h2>';

                    if(menus[menu].submenus[submenu].info !== null)
                        shtml += '<div class="chart-message netdata-chart-alignment" role="document">' + menus[menu].submenus[submenu].info + '</div>';

                    var head = '<div class="netdata-chart-row">';
                    var chtml = '';

                    // console.log('    \------- ' + submenu + ' (' + menus[menu].submenus[submenu].priority + '): ' + menus[menu].submenus[submenu].title);

                    // sort the charts in this submenu of this menu
                    menus[menu].submenus[submenu].charts.sort(prioritySort);
                    var ci = 0, clen = menus[menu].submenus[submenu].charts.length;
                    while(ci < clen) {
                        var chart = menus[menu].submenus[submenu].charts[ci++];

                        // generate the submenu heading charts
                        mhead += generateHeadCharts('mainheads', chart, duration);
                        head += generateHeadCharts('heads', chart, duration);

                        // generate the chart
                        chtml += netdataDashboard.contextInfo(chart.context) + '<div id="chart_' + NETDATA.name2id(chart.id) + '" data-netdata="' + chart.id + '"'
                            + ' data-width="' + pcent_width.toString() + '%"'
                            + ' data-height="' + netdataDashboard.contextHeight(chart.context, options.chartsHeight).toString() + 'px"'
                            + ' data-dygraph-valuerange="' + netdataDashboard.contextValueRange(chart.context) + '"'
                            + ' data-before="0"'
                            + ' data-after="-' + duration.toString() + '"'
                            + ' data-id="' + NETDATA.name2id(options.hostname + '/' + chart.id) + '"'
                            + ' data-colors="' + netdataDashboard.anyAttribute(netdataDashboard.context, 'colors', chart.context, '') + '"'
                            + ' role="application"></div>';

                        // console.log('         \------- ' + chart.id + ' (' + chart.priority + '): ' + chart.context  + ' height: ' + menus[menu].submenus[submenu].height);
                    }

                    head += '</div>';
                    shtml += head + chtml + '</div>';
                }

                mhead += '</div>';
                sidebar += '</ul></li>';
                html += mhead + shtml + '</div></div><hr role="separator"/>';
            }

            sidebar += '<li class="" style="padding-top:15px;"><a href="https://github.com/firehol/netdata/wiki/Add-more-charts-to-netdata" target="_blank"><i class="fa fa-plus" aria-hidden="true"></i> add more charts</a></li>';
            sidebar += '<li class=""><a href="https://github.com/firehol/netdata/wiki/Add-more-alarms-to-netdata" target="_blank"><i class="fa fa-plus" aria-hidden="true"></i> add more alarms</a></li>';
            sidebar += '<li class="" style="margin:20px;color:#666;"><small>netdata on <b>' + data.hostname.toString() + '</b>, collects every ' + ((data.update_every == 1)?'second':data.update_every.toString() + ' seconds') + ' <b>' + data.dimensions_count.toLocaleString() + '</b> metrics, presented as <b>' + data.charts_count.toLocaleString() + '</b> charts and monitored by <b>' + data.alarms_count.toLocaleString() + '</b> alarms, using ' + Math.round(data.rrd_memory_bytes / 1024 / 1024).toLocaleString() + ' MB of memory for ' + Math.round(data.history / (3600/data.update_every)).toLocaleString() + ' ' + ((data.history == (3600/data.update_every))?'hour':'hours').toString() + ' of real-time history.</small></li>';
            sidebar += '</ul>';
            div.innerHTML = html;
            document.getElementById('sidebar').innerHTML = sidebar;
            finalizePage();
        }

        function renderChartsAndMenu(data) {
            var menus = options.menus;
            var charts = data.charts;

            for(var c in charts) {
                enrichChartData(charts[c]);

                // create the menu
                if(typeof menus[charts[c].menu] === 'undefined') {
                    menus[charts[c].menu] = {
                        priority: charts[c].priority,
                        submenus: {},
                        title: netdataDashboard.menuTitle(charts[c]),
                        icon: netdataDashboard.menuIcon(charts[c]),
                        info: netdataDashboard.menuInfo(charts[c].menu),
                        height: netdataDashboard.menuHeight(charts[c].menu, options.chartsHeight)
                    };
                }

                if(charts[c].priority < menus[charts[c].menu].priority)
                    menus[charts[c].menu].priority = charts[c].priority;

                // create the submenu
                if(typeof menus[charts[c].menu].submenus[charts[c].submenu] === 'undefined') {
                    menus[charts[c].menu].submenus[charts[c].submenu] = {
                        priority: charts[c].priority,
                        charts: new Array(),
                        title: null,
                        info: netdataDashboard.submenuInfo(charts[c].menu, charts[c].submenu),
                        height: netdataDashboard.submenuHeight(charts[c].menu, charts[c].submenu, menus[charts[c].menu].height)
                    };
                }

                if(charts[c].priority < menus[charts[c].menu].submenus[charts[c].submenu].priority)
                    menus[charts[c].menu].submenus[charts[c].submenu].priority = charts[c].priority;

                // index the chart in the menu/submenu
                menus[charts[c].menu].submenus[charts[c].submenu].charts.push(charts[c]);
            }

            // 将给定给QoS 
            //的描述性子名称传播给具有相同名称的所有其他子菜单
            for(var m in menus) {
                for(var s in menus[m].submenus) {
                    // set the family using a name
                    if(typeof options.submenu_names[s] !== 'undefined') {
                        menus[m].submenus[s].title = s + ' (' + options.submenu_names[s] + ')';
                    }
                    else {
                        menus[m].submenus[s].title = netdataDashboard.submenuTitle(m, s);
                    }
                }
            }

            renderPage(menus, data);
        }

        // ----------------------------------------------------------------------------

        function loadJs(url, callback) {
            $.ajax({
                url: url,
                cache: true,
                dataType: "script",
                xhrFields: { withCredentials: true } // required for the cookie
            })
            .fail(function() {
                alert('Cannot load required JS library: ' + url);
            })
            .always(function() {
                if(typeof callback === 'function')
                    callback();
            })
        }

        var bootstrapTableLoaded = false;
        function loadBootstrapTable(callback) {
            if(bootstrapTableLoaded === false) {
                bootstrapTableLoaded === true;
                loadJs(NETDATA.serverDefault + 'lib/bootstrap-table-1.11.0.min.js', function() {
                    loadJs(NETDATA.serverDefault + 'lib/bootstrap-table-export-1.11.0.min.js', function() {
                        loadJs(NETDATA.serverDefault + 'lib/tableExport-1.6.0.min.js', callback);
                    })
                });
            }
            else callback();
        }

        function alarmsUpdateModal() {
            var active = '<h3>Raised Alarms</h3><table class="table">';
            var all = '<h3>All Running Alarms</h3><div class="panel-group" id="alarms_all_accordion" role="tablist" aria-multiselectable="true">';
            var footer = '<hr/><a href="https://github.com/firehol/netdata/wiki/Generating-Badges" target="_blank">netdata badges</a> refresh automatically. Their color indicates the state of the alarm: <span style="color: #e05d44"><b>&nbsp;red&nbsp;</b></span> is critical, <span style="color:#fe7d37"><b>&nbsp;orange&nbsp;</b></span> is warning, <span style="color: #4c1"><b>&nbsp;bright green&nbsp;</b></span> is ok, <span style="color: #9f9f9f"><b>&nbsp;light grey&nbsp;</b></span> is undefined (i.e. no data or no status), <span style="color: #000"><b>&nbsp;black&nbsp;</b></span> is not initialized. You can copy and paste their URLs to embed them in any web page.<br/>netdata can send notifications for these alarms. Check <a href="https://github.com/firehol/netdata/blob/master/conf.d/health_alarm_notify.conf">this configuration file</a> for more information.';

            NETDATA.alarms.get('all', function(data) {
                options.alarm_families = new Array();

                alarmsCallback(data);

                if(data === null) {
                    document.getElementById('alarms_active').innerHTML =
                            document.getElementById('alarms_all').innerHTML =
                                    document.getElementById('alarms_log').innerHTML =
                                            'failed to load alarm data!';
                    return;
                }

                function alarmid4human(id) {
                    if(id === 0)
                        return '-';

                    return id.toString();
                }

                function timestamp4human(timestamp, space) {
                    if(timestamp === 0)
                        return '-';

                    if(typeof space === 'undefined')
                        space = '&nbsp;';

                    var t = new Date(timestamp * 1000);
                    var now = new Date();

                    if(t.toDateString() == now.toDateString())
                        return t.toLocaleTimeString();

                    return t.toLocaleDateString() + space + t.toLocaleTimeString();
                }

                function seconds4human(seconds, options) {
                    var default_options = {
                        now: 'now',
                        space: '&nbsp;',
                        negative_suffix: 'ago',
                        hour: 'hour',
                        hours: 'hours',
                        minute: 'minute',
                        minutes: 'minutes',
                        second: 'second',
                        seconds: 'seconds',
                        and: 'and'
                    };

                    if(typeof options !== 'object')
                        options = default_options;
                    else {
                        var x;
                        for(x in default_options) {
                            if(typeof options[x] !== 'string')
                                options[x] = default_options[x];
                        }
                    }

                    if(typeof seconds === 'string')
                        seconds = parseInt(seconds);

                    if(seconds === 0)
                        return options.now;

                    var suffix = '';
                    if(seconds < 0) {
                        seconds = -seconds;
                        if(options.negative_suffix !== '') suffix = options.space + options.negative_suffix;
                    }

                    var hours = Math.floor(seconds / 3600);
                    seconds -= (hours * 3600);

                    var minutes = Math.floor(seconds / 60);
                    seconds -= (minutes * 60);

                    var txt = '';

                    if(hours > 1) txt += hours.toString() + options.space + options.hours;
                    else if(hours === 1) txt += hours.toString() + options.space + options.hour;

                    if(hours > 0 && minutes > 0 && seconds == 0)
                        txt += options.space + options.and + options.space;
                    else if(hours > 0 && minutes > 0 && seconds > 0)
                        txt += ',' + options.space;

                    if(minutes > 1) txt += minutes.toString() + options.space + options.minutes;
                    else if(minutes === 1) txt += minutes.toString() + options.space + options.minute;

                    if((minutes > 0 || minutes > 0) && seconds > 0)
                        txt += options.space + options.and + options.space;

                    if(seconds > 1) txt += Math.floor(seconds).toString() + options.space + options.seconds;
                    else if(seconds === 1) txt += Math.floor(seconds).toString() + options.space + options.second;

                    return txt + suffix;
                }

                function alarm_lookup_explain(alarm, chart) {
                    var dimensions = ' of all values ';

                    if(chart.dimensions.length > 1)
                        dimensions = ' of the sum of all dimensions ';

                    if(typeof alarm.lookup_dimensions !== 'undefined') {
                        var d = alarm.lookup_dimensions.replace('|', ',');
                        var x = d.split(',');
                        if(x.length > 1)
                            dimensions = 'of the sum of dimensions <code>' + alarm.lookup_dimensions + '</code> ';
                        else
                            dimensions = 'of all values of dimension <code>' + alarm.lookup_dimensions + '</code> ';
                    }

                    return '<code>' + alarm.lookup_method + '</code> '
                        + dimensions + ', of chart <code>' + alarm.chart + '</code>'
                        + ', starting <code>' + seconds4human(alarm.lookup_after + alarm.lookup_before) + '</code> and up to <code>' + seconds4human(alarm.lookup_before) + '</code>'
                        + ((alarm.lookup_options)?(', with options <code>' + alarm.lookup_options.replace(' ', ',&nbsp;') + '</code>'):'')
                        + '.';
                }

                function alarm_to_html(alarm, full) {
                    var chart = options.data.charts[alarm.chart];
                    var has_alarm = ((typeof alarm.warn !== 'undefined' || typeof alarm.crit !== 'undefined')?true:false);

                    var role_href = ((has_alarm === true)?('<br/>&nbsp;<br/>role: <b>' + alarm.recipient + '</b><br/>&nbsp;<br/><b><i class="fa fa-line-chart" aria-hidden="true"></i></b><small>&nbsp;&nbsp;<a href="#" onClick="NETDATA.alarms.scrollToChart(\'' + alarm.chart + '\'); $(\'#alarmsModal\').modal(\'hide\'); return false;">jump to chart</a></small>'):('&nbsp;'));

                    var html = '<tr><td class="text-center" style="vertical-align:middle" width="40%"><b>' + alarm.chart + '</b><br/>&nbsp;<br/><embed src="' + NETDATA.alarms.server + '/api/v1/badge.svg?chart=' + alarm.chart + '&alarm=' + alarm.name + '&refresh=auto" type="image/svg+xml" height="20"/><br/>&nbsp;<br/><span style="font-size: 18px">' + alarm.info + '</span>' + role_href + '</td>'
                        + '<td><table class="table">'
                        + ((typeof alarm.warn !== 'undefined')?('<tr><td width="10%" style="text-align:right">warning&nbsp;when</td><td><span style="font-family: monospace; color:#fe7d37; font-weight: bold;">' + alarm.warn + '</span></td></tr>'):'')
                        + ((typeof alarm.crit !== 'undefined')?('<tr><td width="10%" style="text-align:right">critical&nbsp;when</td><td><span style="font-family: monospace; color: #e05d44; font-weight: bold;">' + alarm.crit + '</span></td></tr>'):'');

                    if(full === true) {
                            html += ((typeof alarm.lookup_after !== 'undefined')?('<tr><td width="10%" style="text-align:right">db&nbsp;lookup</td><td>' + alarm_lookup_explain(alarm, chart) + '</td></tr>'):'')
                            + ((typeof alarm.calc !== 'undefined')?('<tr><td width="10%" style="text-align:right">calculation</td><td><span style="font-family: monospace;">' + alarm.calc + '</span></td></tr>'):'')
                            + ((chart.green !== null)?('<tr><td width="10%" style="text-align:right">green&nbsp;threshold</td><td><code>' + chart.green + ' ' + chart.units + '</code></td></tr>'):'')
                            + ((chart.red !== null)?('<tr><td width="10%" style="text-align:right">red&nbsp;threshold</td><td><code>' + chart.red + ' ' + chart.units + '</code></td></tr>'):'');
                    }

                    var delay = '';
                    if((alarm.delay_up_duration > 0 || alarm.delay_down_duration > 0) && alarm.delay_multiplier != 0 && alarm.delay_max_duration > 0) {
                        if(alarm.delay_up_duration == alarm.delay_down_duration) {
                            delay += '<small><br/>hysteresis ' + seconds4human(alarm.delay_up_duration, { negative_suffix: '' });
                        }
                        else {
                            delay = '<small><br/>hysteresis ';
                            if(alarm.delay_up_duration > 0) {
                                delay += 'on&nbsp;escalation&nbsp;<code>' + seconds4human(alarm.delay_up_duration, { negative_suffix: '' }) + '</code>, ';
                            }
                            if(alarm.delay_down_duration > 0) {
                                delay += 'on&nbsp;recovery&nbsp;<code>' + seconds4human(alarm.delay_down_duration, { negative_suffix: '' }) + '</code>, ';
                            }
                        }
                        if(alarm.delay_multiplier != 1.0) {
                            delay += 'multiplied&nbsp;by&nbsp;<code>' + alarm.delay_multiplier.toString() + '</code>';
                            delay += ',&nbsp;up&nbsp;to&nbsp;<code>' + seconds4human(alarm.delay_max_duration, { negative_suffix: '' }) + '</code>';
                        }
                        delay += '</small>';
                    }

                    html += '<tr><td width="10%" style="text-align:right">check&nbsp;every</td><td>' + seconds4human(alarm.update_every, { negative_suffix: '' }) + '</td></tr>'
                        + ((has_alarm === true)?('<tr><td width="10%" style="text-align:right">execute</td><td><span style="font-family: monospace;">' + alarm.exec + '</span>' + delay + '</td></tr>'):'')
                        + '<tr><td width="10%" style="text-align:right">source</td><td><span style="font-family: monospace;">' + alarm.source + '</span></td></tr>'
                        + '</table></td></tr>';

                    return html;
                }

                function alarm_family_show(id) {
                    var html = '<table class="table">';
                    var family = options.alarm_families[id];
                    var len = family.arr.length;
                    while(len--) {
                        var alarm = family.arr[len];
                        html += alarm_to_html(alarm, true);
                    }
                    html += '</table>';

                    $('#alarm_all_' + id.toString()).html(html);
                }

                // find the proper family of each alarm
                var now = Date.now();
                var x;
                var count_active = 0;
                var count_all = 0;
                var families = {};
                var families_sort = new Array();
                for(x in data.alarms) {
                    var alarm = data.alarms[x];
                    var family = alarm.family;

                    // find the chart
                    var chart = options.data.charts[alarm.chart];
                    if(typeof chart === 'undefined')
                        chart = options.data.charts_by_name[alarm.chart];

                    // not found - this should never happen!
                    if(typeof chart === 'undefined') {
                        console.log('WARNING: alarm ' + x + ' is linked to chart ' + alarm.chart + ', which is not found in the list of chart got from the server.');
                        chart = { priority: 9999999 };
                    }
                    else if(typeof chart.menu !== 'undefined' && typeof chart.submenu !== 'undefined')
                        // the family based on the chart
                        family = chart.menu + ' - ' + chart.submenu;

                    if(typeof families[family] === 'undefined') {
                        families[family] = {
                            name: family,
                            arr: new Array(),
                            priority: chart.priority
                        };

                        families_sort.push(families[family]);
                    }

                    if(chart.priority < families[family].priority)
                        families[family].priority = chart.priority;

                    families[family].arr.unshift(alarm);
                }

                // sort the families, like the dashboard menu does
                var families_sorted = families_sort.sort(function (a, b) {
                    if (a.priority > b.priority) return -1;
                    if (a.priority < b.priority) return 1;
                    return 0;
                });

                var fc = 0;
                var len = families_sorted.length;
                while(len--) {
                    var family = families_sorted[len].name;
                    var active_family_added = false;
                    var expanded = 'true';
                    var collapsed = '';
                    var cin = 'in';

                    if(fc !== 0) {
                        all += "</table></div></div></div>";
                        expanded = 'false';
                        collapsed = 'class="collapsed"'
                        cin = '';
                    }

                    all += '<div class="panel panel-default"><div class="panel-heading" role="tab" id="alarm_all_heading_' + fc.toString() + '"><h4 class="panel-title"><a ' + collapsed + ' role="button" data-toggle="collapse" data-parent="#alarms_all_accordion" href="#alarm_all_' + fc.toString() + '" aria-expanded="' + expanded + '" aria-controls="alarm_all_' + fc.toString() + '">' + family.toString() + '</a></h4></div><div id="alarm_all_' + fc.toString() + '" class="panel-collapse collapse ' + cin + '" role="tabpanel" aria-labelledby="alarm_all_heading_' + fc.toString() + '" data-alarm-id="' + fc.toString() + '"><div class="panel-body" id="alarm_all_body_' + fc.toString() + '">';

                    options.alarm_families[fc] = families[family];

                    fc++;

                    var arr = families[family].arr;
                    var c = arr.length;
                    while(c--) {
                        var alarm = arr[c];
                        if(alarm.status === 'WARNING' || alarm.status === 'CRITICAL') {
                            if(!active_family_added) {
                                active_family_added = true;
                                active += '<tr><th class="text-center" colspan="2"><h4>' + family + '</h4></th></tr>';
                            }
                            count_active++;
                            active += alarm_to_html(alarm, true);
                        }

                        count_all++;
                    }
                }
                active += "</table>";
                if(families_sorted.length > 0) all += "</div></div></div>";
                all += "</div>";

                if(!count_active)
                    active += "<h4>Everything is normal. No raised alarms.</h4>";
                else
                    active += footer;

                if(!count_all)
                    all += "<h4>No alarms are running in this system.</h4>";
                else
                    all += footer;

                document.getElementById('alarms_active').innerHTML = active;
                document.getElementById('alarms_all').innerHTML = all;

                if(families_sorted.length > 0) alarm_family_show(0);

                // register bootstrap events
                $('#alarms_all_accordion').on('show.bs.collapse', function (d) {
                    var target = $(d.target);
                    var id = $(target).data('alarm-id');
                    alarm_family_show(id);
                });
                $('#alarms_all_accordion').on('hidden.bs.collapse', function (d) {
                    var target = $(d.target);
                    var id = $(target).data('alarm-id');
                    $('#alarm_all_' + id.toString()).html('');
                });

                document.getElementById('alarms_log').innerHTML = '<h3>Alarm Log</h3><table id="alarms_log_table"></table>';

                loadBootstrapTable(function () {
                    $('#alarms_log_table').bootstrapTable({
                        url: NETDATA.alarms.server + '/api/v1/alarm_log?all',
                        cache: false,
                        pagination: true,
                        pageSize: 10,
                        showPaginationSwitch: false,
                        search: true,
                        searchTimeOut: 300,
                        searchAlign: 'left',
                        showColumns: true,
                        showExport: true,
                        exportDataType: 'basic',
                        exportOptions: {
                            fileName: 'netdata_alarm_log'
                        },
                        rowStyle: function(row, index) {
                            switch(row.status) {
                                case 'CRITICAL' : return { classes: 'danger'  }; break;
                                case 'WARNING'  : return { classes: 'warning' }; break;
                                case 'UNDEFINED': return { classes: 'info'    }; break;
                                case 'CLEAR'    : return { classes: 'success' }; break;
                            }
                            return {};
                        },
                        showFooter: false,
                        showHeader: true,
                        showRefresh: true,
                        showToggle: false,
                        sortable: true,
                        silentSort: false,
                        columns: [
                            {
                                field: 'when',
                                title: 'Event Date',
                                valign: 'middle',
                                titleTooltip: 'The date and time the even took place',
                                formatter: function(value, row, index) { return timestamp4human(value, ' '); },
                                align: 'center',
                                valign: 'middle',
                                switchable: false,
                                sortable: true
                            },
                            {
                                field: 'hostname',
                                title: 'Host',
                                valign: 'middle',
                                titleTooltip: 'The host that generated this event',
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'unique_id',
                                title: 'Unique ID',
                                titleTooltip: 'The host unique ID for this event',
                                formatter: function(value, row, index) { return alarmid4human(value); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'alarm_id',
                                title: 'Alarm ID',
                                titleTooltip: 'The ID of the alarm that generated this event',
                                formatter: function(value, row, index) { return alarmid4human(value); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'alarm_event_id',
                                title: 'Alarm Event ID',
                                titleTooltip: 'The incremental ID of this event for the given alarm',
                                formatter: function(value, row, index) { return alarmid4human(value); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'chart',
                                title: 'Chart',
                                titleTooltip: 'The chart the alarm is attached to',
                                align: 'center',
                                valign: 'middle',
                                switchable: false,
                                sortable: true
                            },
                            {
                                field: 'family',
                                title: 'Family',
                                titleTooltip: 'The family of the chart the alarm is attached to',
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'name',
                                title: 'Alarm',
                                titleTooltip: 'The alarm name that generated this event',
                                formatter: function(value, row, index) {
                                    return value.toString().replace(/_/g, ' ');
                                },
                                align: 'center',
                                valign: 'middle',
                                switchable: false,
                                sortable: true
                            },
                            {
                                field: 'old_value',
                                title: 'Old Value',
                                titleTooltip: 'The value of the alarm, just before this event',
                                formatter: function(value, row, index) {
                                    return ((value !== null)?Math.round(value * 100) / 100:'NaN').toString();
                                },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'value',
                                title: 'Value',
                                titleTooltip: 'The value of the alarm, that triggered this event',
                                formatter: function(value, row, index) {
                                    return ((value !== null)?Math.round(value * 100) / 100:'NaN').toString();
                                },
                                align: 'right',
                                valign: 'middle',
                                sortable: true
                            },
                            {
                                field: 'units',
                                title: 'Units',
                                titleTooltip: 'The units of the value of the alarm',
                                align: 'left',
                                valign: 'middle',
                                sortable: true
                            },
                            {
                                field: 'old_status',
                                title: 'Old Status',
                                titleTooltip: 'The status of the alarm, just before this event',
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'status',
                                title: 'Status',
                                titleTooltip: 'The status of the alarm, that was set due to this event',
                                align: 'center',
                                valign: 'middle',
                                switchable: false,
                                sortable: true
                            },
                            {
                                field: 'duration',
                                title: 'Last Duration',
                                titleTooltip: 'The duration the alarm was at its previous state, just before this event',
                                formatter: function(value, row, index) { return seconds4human(value, { negative_suffix: '', space: ' ', now: 'no time' }); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'non_clear_duration',
                                title: 'Raised Duration',
                                titleTooltip: 'The duration the alarm was raised, just before this event',
                                formatter: function(value, row, index) { return seconds4human(value, { negative_suffix: '', space: ' ', now: 'no time' }); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'recipient',
                                title: 'Recipient',
                                titleTooltip: 'The recipient of this event',
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'processed',
                                title: 'Processed Status',
                                titleTooltip: 'True when this event is processed',
                                formatter: function(value, row, index) {
                                    if(value === true)
                                        return 'DONE';
                                    else
                                        return 'PENDING';
                                },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'updated',
                                title: 'Updated Status',
                                titleTooltip: 'True when this event has been updated by another event',
                                formatter: function(value, row, index) {
                                    if(value === true)
                                        return 'UPDATED';
                                    else
                                        return 'CURRENT';
                                },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'updated_by_id',
                                title: 'Updated By ID',
                                titleTooltip: 'The unique ID of the event that obsoleted this one',
                                formatter: function(value, row, index) { return alarmid4human(value); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'updates_id',
                                title: 'Updates ID',
                                titleTooltip: 'The unique ID of the event obsoleted because of this event',
                                formatter: function(value, row, index) { return alarmid4human(value); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'exec',
                                title: 'Script',
                                titleTooltip: 'The script to handle the event notification',
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'exec_run',
                                title: 'Script Run At',
                                titleTooltip: 'The date and time the script has been ran',
                                formatter: function(value, row, index) { return timestamp4human(value, ' '); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'exec_code',
                                title: 'Script Return Value',
                                titleTooltip: 'The return code of the script',
                                formatter: function(value, row, index) {
                                    if(value === 0)
                                        return 'OK (returned 0)';
                                    else
                                        return 'FAILED (with code ' + value.toString() + ')';
                                },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'delay',
                                title: 'Script Delay',
                                titleTooltip: 'The hysteresis of the notification',
                                formatter: function(value, row, index) { return seconds4human(value, { negative_suffix: '', space: ' ', now: 'no time' }); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'delay_up_to_timestamp',
                                title: 'Script Delay Run At',
                                titleTooltip: 'The date and time the script should be run, after hysteresis',
                                formatter: function(value, row, index) { return timestamp4human(value, ' '); },
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'info',
                                title: 'Description',
                                titleTooltip: 'A short description of the alarm',
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            },
                            {
                                field: 'source',
                                title: 'Alarm Source',
                                titleTooltip: 'The source of configuration of the alarm',
                                align: 'center',
                                valign: 'middle',
                                visible: false,
                                sortable: true
                            }
                        ]
                    });
                    // console.log($('#alarms_log_table').bootstrapTable('getOptions'));
                });
            });
        }

        function alarmsCallback(data) {
            var count = 0;
            for(x in data.alarms) {
                var alarm = data.alarms[x];
                if(alarm.status === 'WARNING' || alarm.status === 'CRITICAL')
                    count++;
            }

            if(count > 0)
                document.getElementById('alarms_count_badge').innerHTML = count.toString();
            else
                document.getElementById('alarms_count_badge').innerHTML = '';
        }

        function initializeDynamicDashboard(netdata_url) {
            if(typeof netdata_url === 'undefined' || netdata_url === null)
                netdata_url = NETDATA.serverDefault;

            // initialize clickable alarms
            NETDATA.alarms.chart_div_offset = 100;
            NETDATA.alarms.chart_div_id_prefix = 'chart_';
            NETDATA.alarms.chart_div_animation_duration = 0;

            NETDATA.pause(function() {
                NETDATA.alarms.callback = alarmsCallback;

                // download all the charts the server knows
                NETDATA.chartRegistry.downloadAll(netdata_url, function(data) {
                    if(data !== null) {
                        options.hostname = data.hostname;
                        options.data = data;

                        // update the dashboard hostname
                        document.getElementById('hostname').innerHTML = options.hostname;
                        document.getElementById('hostname').href = NETDATA.serverDefault;

                        // update the dashboard title
                        document.title = options.hostname + ' netdata dashboard';

                        // close the splash screen
                        $("#loadOverlay").css("display","none");

                        // create a chart_by_name index
                        data.charts_by_name = {};
                        var charts = data.charts;
                        var x;
                        for(x in charts) {
                            var chart = charts[x];
                            data.charts_by_name[chart.name] = chart;
                        }

                        // render all charts
                        renderChartsAndMenu(data);
                    }
                });
            });
        }

        // ----------------------------------------------------------------------------

        function versionLog(msg) {
            document.getElementById('versionCheckLog').innerHTML = msg;
        }

        function getNetdataVersion(callback) {
            versionLog('Downloading installed version info from netdata...');

            $.ajax({
                url: 'version.txt',
                async: true,
                cache: false,
                xhrFields: { withCredentials: true } // required for the cookie
            })
            .done(function(data) {
                data = data.replace(/(\r\n|\n|\r| |\t)/gm,"");
                if(data.length !== 40) {
                    versionLog('Received version string is invalid.');
                    callback(null);
                }
                else {
                    versionLog('Installed version of netdata is ' + data);
                    document.getElementById('netdataVersion').innerHTML = data;
                    callback(data);
                }
            })
            .fail(function() {
                versionLog('Failed to download installed version info from netdata!');
                callback(null);
            });
        }

        function getGithubLatestCommit(callback) {
            versionLog('Downloading latest version info from github...');

            $.ajax({
                url: 'https://api.github.com/repos/firehol/netdata/commits',
                async: true,
                cache: false
            })
            .done(function(data) {
                versionLog('Latest version info from github is ' + data[0].sha);
                callback(data[0].sha);
            })
            .fail(function() {
                versionLog('Failed to download installed version info from github!');
                callback(null);
            });
        }

        function checkForUpdate(callback) {
            getNetdataVersion(function(sha1) {
                if(sha1 === null) callback(null, null);

                getGithubLatestCommit(function(sha2) {
                    callback(sha1, sha2);
                });
            });

            return null;
        }

        function notifyForUpdate(force) {
            versionLog('<p>checking for updates...</p>');

            var now = Date.now();

            if(typeof force === 'undefined' || force !== true) {
                var last = loadLocalStorage('last_update_check');

                if(typeof last === 'string')
                    last = parseInt(last);
                else
                    last = 0;

                if(now - last < 3600000 * 8) {
                    // no need to check it - too soon
                    return;
                }
            }

            checkForUpdate(function(sha1, sha2) {
                var save = false;

                if(sha1 === null) {
                    save = false;
                    versionLog('<p><big>Failed to get your netdata version!</big></p><p>You can always get the latest version of netdata from <a href="https://github.com/firehol/netdata" target="_blank">its github page</a>.</p>');
                }
                else if(sha2 === null) {
                    save = false;
                    versionLog('<p><big>Failed to get the latest version from github.</big></p><p>You can always get the latest version of netdata from <a href="https://github.com/firehol/netdata" target="_blank">its github page</a>.</p>');
                }
                else if(sha1 === sha2) {
                    save = true;
                    versionLog('<p><big>You already have the latest version of netdata!</big></p><p>No update yet?<br/>Probably, we need some motivation to keep going on!</p><p>If you haven\'t already, <a href="https://github.com/firehol/netdata" target="_blank">give netdata a <b>Star</b> at its github page</a>.</p>');
                }
                else {
                    save = true;
                    var compare = 'https://github.com/firehol/netdata/compare/' + sha1.toString() + '...' + sha2.toString();

                    versionLog('<p><big><strong>New version of netdata available!</strong></big></p><p>Latest version: ' + sha2.toString() + '</p><p><a href="' + compare + '" target="_blank">Click here for the changes log</a> since your installed version, and<br/><a href="https://github.com/firehol/netdata/wiki/Updating-Netdata" target="_blank">click here for directions on updating</a> your netdata installation.</p><p>We suggest to review the changes log for new features you may be interested, or important bug fixes you may need.<br/>Keeping your netdata updated, is generally a good idea.</p>');

                    document.getElementById('update_badge').innerHTML = '!';
                }

                if(save)
                    saveLocalStorage('last_update_check', now.toString());
            });
        }

        // ----------------------------------------------------------------------------

        function finalizePage() {
            // resize all charts - without starting the background thread
            // this has to be done while NETDATA is paused
            // if we ommit this, the affix menu will be wrong, since all
            // the Dom elements are initially zero-sized
            NETDATA.parseDom();

            if(urlOptions.pan_and_zoom === true)
                NETDATA.globalPanAndZoom.setMaster(NETDATA.options.targets[0], urlOptions.after, urlOptions.before);

            // ------------------------------------------------------------------------
            // https://github.com/viralpatel/jquery.shorten/blob/master/src/jquery.shorten.js
            $.fn.shorten = function(settings) {
                "use strict";

                var config = {
                    showChars: 750,
                    minHideChars: 10,
                    ellipsesText: "...",
                    moreText: '<i class="fa fa-expand" aria-hidden="true"></i> show more information',
                    lessText: '<i class="fa fa-compress" aria-hidden="true"></i> show less information',
                    onLess: function() { NETDATA.onscroll(); },
                    onMore: function() { NETDATA.onscroll(); },
                    errMsg: null,
                    force: false
                };

                if (settings) {
                    $.extend(config, settings);
                }

                if ($(this).data('jquery.shorten') && !config.force) {
                    return false;
                }
                $(this).data('jquery.shorten', true);

                $(document).off("click", '.morelink');

                $(document).on({
                    click: function() {

                        var $this = $(this);
                        if ($this.hasClass('less')) {
                            $this.removeClass('less');
                            $this.html(config.moreText);
                            $this.parent().prev().animate({'height':'0'+'%'}, 0, function () { $this.parent().prev().prev().show(); }).hide(0, function() {
                                config.onLess();
                            });

                        } else {
                            $this.addClass('less');
                            $this.html(config.lessText);
                            $this.parent().prev().animate({'height':'100'+'%'}, 0, function () { $this.parent().prev().prev().hide(); }).show(0, function() {
                                config.onMore();
                            });
                        }
                        return false;
                    }
                }, '.morelink');

                return this.each(function() {
                    var $this = $(this);

                    var content = $this.html();
                    var contentlen = $this.text().length;
                    if (contentlen > config.showChars + config.minHideChars) {
                        var c = content.substr(0, config.showChars);
                        if (c.indexOf('<') >= 0) // If there's HTML don't want to cut it
                        {
                            var inTag = false; // I'm in a tag?
                            var bag = ''; // Put the characters to be shown here
                            var countChars = 0; // Current bag size
                            var openTags = []; // Stack for opened tags, so I can close them later
                            var tagName = null;

                            for (var i = 0, r = 0; r <= config.showChars; i++) {
                                if (content[i] == '<' && !inTag) {
                                    inTag = true;

                                    // This could be "tag" or "/tag"
                                    tagName = content.substring(i + 1, content.indexOf('>', i));

                                    // If its a closing tag
                                    if (tagName[0] == '/') {


                                        if (tagName != '/' + openTags[0]) {
                                            config.errMsg = 'ERROR en HTML: the top of the stack should be the tag that closes';
                                        } else {
                                            openTags.shift(); // Pops the last tag from the open tag stack (the tag is closed in the retult HTML!)
                                        }

                                    } else {
                                        // There are some nasty tags that don't have a close tag like <br/>
                                        if (tagName.toLowerCase() != 'br') {
                                            openTags.unshift(tagName); // Add to start the name of the tag that opens
                                        }
                                    }
                                }
                                if (inTag && content[i] == '>') {
                                    inTag = false;
                                }

                                if (inTag) { bag += content.charAt(i); } // Add tag name chars to the result
                                else {
                                    r++;
                                    if (countChars <= config.showChars) {
                                        bag += content.charAt(i); // Fix to ie 7 not allowing you to reference string characters using the []
                                        countChars++;
                                    } else // Now I have the characters needed
                                    {
                                        if (openTags.length > 0) // I have unclosed tags
                                        {
                                            //console.log('They were open tags');
                                            //console.log(openTags);
                                            for (j = 0; j < openTags.length; j++) {
                                                //console.log('Cierro tag ' + openTags[j]);
                                                bag += '</' + openTags[j] + '>'; // Close all tags that were opened

                                                // You could shift the tag from the stack to check if you end with an empty stack, that means you have closed all open tags
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                            c = $('<div/>').html(bag + '<span class="ellip">' + config.ellipsesText + '</span>').html();
                        }else{
                            c+=config.ellipsesText;
                        }

                        var html = '<div class="shortcontent">' + c +
                                '</div><div class="allcontent">' + content +
                                '</div><span><a href="javascript://nop/" class="morelink">' + config.moreText + '</a></span>';

                        $this.html(html);
                        $this.find(".allcontent").hide(); // Hide all text
                        $('.shortcontent p:last', $this).css('margin-bottom', 0); //Remove bottom margin on last paragraph as it's likely shortened
                    }
                });

            };
            $(".chart-message").shorten();
            // ------------------------------------------------------------------------

            // callback for us to track PanAndZoom operations
            NETDATA.globalPanAndZoom.callback = urlOptions.netdataPanAndZoomCallback;

            // let it run (update the charts)
            NETDATA.unpause();

            // check if we have to jump to a specific section
            scrollToId(urlOptions.hash.replace('#',''));

            if(urlOptions.chart !== null) {
                NETDATA.alarms.scrollToChart(urlOptions.chart);
                //urlOptions.hash = '#' + NETDATA.name2id('menu_' + charts[c].menu + '_submenu_' + charts[c].submenu);
                //urlOptions.hash = '#chart_' + NETDATA.name2id(urlOptions.chart);
                //console.log('hash = ' + urlOptions.hash);
            }

            /* activate bootstrap sidebar (affix) */
            $('#sidebar').affix({
                offset: {
                    top: (isdemo())?150:0,
                    bottom: 0
                }
            });

            /* fix scrolling of very long affix lists
               http://stackoverflow.com/questions/21691585/bootstrap-3-1-0-affix-too-long
             */
            $('#sidebar').on('affixed.bs.affix', function() {
                $(this).removeAttr('style');
            });

            /* activate bootstrap scrollspy (needed for sidebar) */
            $(document.body).scrollspy({
                target: '#sidebar',
                offset: $(window).height() / 5 // controls the diff of the <hX> element to the top, to select it
            });

            // change the URL based on the current position of the screen
            $('#sidebar').on('activate.bs.scrollspy', function (e) {
                // console.log(e);
                var el = $(e.target);
                //if(el.find('ul').size() == 0) {
                var hash = el.find('a').attr('href');
                if(typeof hash === 'string' && hash.substring(0, 1) === '#' && urlOptions.hash.startsWith(hash + '_submenu_') === false) {
                    urlOptions.hash = hash;
                    //console.log(urlOptions.hash);
                    urlOptions.hashUpdate();
                }
                //else console.log('hash: not accepting ' + hash);
                //}
                //else console.log('el.find(): not found');
            });

            document.getElementById('footer').style.display = 'block';

            var update_options_modal = function() {
                // console.log('update_options_modal');

                var sync_option = function(option) {
                    var self = $('#' + option);

                    if(self.prop('checked') !== NETDATA.getOption(option)) {
                        // console.log('switching ' + option.toString());
                        self.bootstrapToggle(NETDATA.getOption(option)?'on':'off');
                    }
                }

                var theme_sync_option = function(option) {
                    var self = $('#' + option);

                    self.bootstrapToggle(netdataTheme === 'slate'?'on':'off');
                }

                sync_option('eliminate_zero_dimensions');
                sync_option('destroy_on_hide');
                sync_option('async_on_scroll');
                sync_option('parallel_refresher');
                sync_option('concurrent_refreshes');
                sync_option('sync_selection');
                sync_option('sync_pan_and_zoom');
                sync_option('stop_updates_when_focus_is_lost');
                sync_option('smooth_plot');
                sync_option('pan_and_zoom_data_padding');
                sync_option('show_help');
                theme_sync_option('netdata_theme_control');

                if(NETDATA.getOption('parallel_refresher') === false) {
                    $('#concurrent_refreshes_row').hide();
                }
                else {
                    $('#concurrent_refreshes_row').show();
                }
            };
            NETDATA.setOption('setOptionCallback', update_options_modal);

            // handle options changes
            $('#eliminate_zero_dimensions').change(function()       { NETDATA.setOption('eliminate_zero_dimensions', $(this).prop('checked')); });
            $('#destroy_on_hide').change(function()                 { NETDATA.setOption('destroy_on_hide', $(this).prop('checked')); });
            $('#async_on_scroll').change(function()                 { NETDATA.setOption('async_on_scroll', $(this).prop('checked')); });
            $('#parallel_refresher').change(function()              { NETDATA.setOption('parallel_refresher', $(this).prop('checked')); });
            $('#concurrent_refreshes').change(function()            { NETDATA.setOption('concurrent_refreshes', $(this).prop('checked')); });
            $('#sync_selection').change(function()                  { NETDATA.setOption('sync_selection', $(this).prop('checked')); });
            $('#sync_pan_and_zoom').change(function()               { NETDATA.setOption('sync_pan_and_zoom', $(this).prop('checked')); });
            $('#stop_updates_when_focus_is_lost').change(function() {
                urlOptions.update_always = !$(this).prop('checked');
                urlOptions.hashUpdate();

                NETDATA.setOption('stop_updates_when_focus_is_lost', !urlOptions.update_always);
            });
            $('#smooth_plot').change(function()                     { NETDATA.setOption('smooth_plot', $(this).prop('checked')); });
            $('#pan_and_zoom_data_padding').change(function()       { NETDATA.setOption('pan_and_zoom_data_padding', $(this).prop('checked')); });
            $('#show_help').change(function()                       {
                urlOptions.help = $(this).prop('checked');
                urlOptions.hashUpdate();

                NETDATA.setOption('show_help', urlOptions.help);
                netdataReload();
            });

            // this has to be the last
            // it reloads the page
            $('#netdata_theme_control').change(function() {
                urlOptions.theme = $(this).prop('checked')?'slate':'white';
                urlOptions.hashUpdate();

                if(setTheme(urlOptions.theme))
                    netdataReload();
            });

            $('#updateModal').on('show.bs.modal', function() {
                versionLog('checking, please wait...');
            });

            $('#updateModal').on('shown.bs.modal', function() {
                notifyForUpdate(true);
            });

            $('#alarmsModal').on('shown.bs.modal', function() {
                NETDATA.pause(alarmsUpdateModal);
            });

            $('#alarmsModal').on('hidden.bs.modal', function() {
                NETDATA.unpause();
                document.getElementById('alarms_active').innerHTML =
                        document.getElementById('alarms_all').innerHTML =
                        document.getElementById('alarms_log').innerHTML =
                                'loading...';
            });

            $('#deleteRegistryModal').on('hidden.bs.modal', function() {
                deleteRegistryGuid = null;
            });

            if(isdemo()) {
                // do not to give errors on netdata demo servers for 60 seconds
                NETDATA.options.current.retries_on_data_failures = 60;

                if(urlOptions.nowelcome !== true) {
                    setTimeout(function() {
                        $('#welcomeModal').modal();
                    }, 1000);
                }

                // google analytics when this is used for the home page of the demo sites
                // this does not run on user's installations
                setTimeout(function() {
                    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

                    ga('create', 'UA-64295674-3', 'auto');
                    ga('send', 'pageview');
                }, 2000);
            }
            else notifyForUpdate();

            if(urlOptions.show_alarms === true)
                setTimeout(function() { $('#alarmsModal').modal('show'); }, 1000);

            var sidebar = document.getElementById('sidebar');
            Ps.initialize(sidebar, {
                wheelSpeed: 0.5,
                wheelPropagation: true,
                swipePropagation: true,
                minScrollbarLength: null,
                maxScrollbarLength: null,
                useBothWheelAxes: false,
                suppressScrollX: true,
                suppressScrollY: false,
                scrollXMarginOffset: 0,
                scrollYMarginOffset: 0,
                theme: 'default'
            });
            Ps.update(sidebar);

            var registry = document.getElementById('myNetdataDropdownUL');
            Ps.initialize(registry, {
                wheelSpeed: 1,
                wheelPropagation: false,
                swipePropagation: false,
                minScrollbarLength: null,
                maxScrollbarLength: null,
                useBothWheelAxes: false,
                suppressScrollX: true,
                suppressScrollY: false,
                scrollXMarginOffset: 0,
                scrollYMarginOffset: 0,
                theme: 'default'
            });
            Ps.update(registry);

            NETDATA.onresizeCallback = function() {
                Ps.update(sidebar);
                Ps.update(registry);
            };

            $('#myNetdataDropdownParent')
                .on('show.bs.dropdown', function () {
                    NETDATA.pause(function() {});
                })
                .on('shown.bs.dropdown', function () {
                    Ps.update(registry);
                })
                .on('hidden.bs.dropdown', function () {
                    NETDATA.unpause();
                });

            // var netdataEnded = performance.now();
            // console.log('start up time: ' + (netdataEnded - netdataStarted).toString() + ' ms');
        }

        function resetDashboardOptions() {
            var help = NETDATA.options.current.show_help;

            NETDATA.resetOptions();
            if(setTheme('slate'))
                netdataReload();

            if(help !== NETDATA.options.current.show_help)
                netdataReload();
        }

        // callback to add the dashboard info to the
        // parallel javascript downloader in netdata
        var netdataPrepCallback = function() {
            NETDATA.requiredCSS.push({
                url: NETDATA.serverDefault + 'css/bootstrap-toggle-2.2.2.min.css',
                isAlreadyLoaded: function() { return false; }
            });

            NETDATA.requiredJs.push({
                url: NETDATA.serverDefault + 'lib/bootstrap-toggle-2.2.2.min.js',
                isAlreadyLoaded: function() { return false; }
            });

            NETDATA.requiredJs.push({
                url: NETDATA.serverDefault + 'dashboard_info.js?v20161226-1',
                async: false,
                isAlreadyLoaded: function() { return false; }
            });

            if(isdemo()) {
                document.getElementById('masthead').style.display = 'block';
            }
            else {
                if(urlOptions.update_always === true)
                    NETDATA.setOption('stop_updates_when_focus_is_lost', !urlOptions.update_always);
            }
        };

        // our entry point
        // var netdataStarted = performance.now();
        var netdataCallback = initializeDynamicDashboard;