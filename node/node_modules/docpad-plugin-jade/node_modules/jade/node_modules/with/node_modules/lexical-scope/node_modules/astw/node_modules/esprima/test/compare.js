/*
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint browser: true node: true */
/*global load:true, print:true */
var setupBenchmarks,
    parsers,
    fixtureList,
    suite;

parsers = [
    'Esprima',
    'parse-js',
    'Acorn'
];

fixtureList = [
    'jQuery 1.7.1',
    'Prototype 1.7.0.0',
    'MooTools 1.4.1',
    'Ext Core 3.1.0'
];

function slug(name) {
    'use strict';
    return name.toLowerCase().replace(/\s/g, '-');
}

function kb(bytes) {
    'use strict';
    return (bytes / 1024).toFixed(1);
}

function inject(fname) {
    'use strict';
    var head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');

    script.src = fname;
    script.type = 'text/javascript';
    head.appendChild(script);
}

if (typeof window !== 'undefined') {

    // Run all tests in a browser environment.
    setupBenchmarks = function () {
        'use strict';

        function id(i) {
            return document.getElementById(i);
        }

        function setText(id, str) {
            var el = document.getElementById(id);
            if (typeof el.innerText === 'string') {
                el.innerText = str;
            } else {
                el.textContent = str;
            }
        }

        function enableRunButtons() {
            id('run').disabled = false;
        }

        function disableRunButtons() {
            id('run').disabled = true;
        }

        function createTable() {
            var str = '',
                i,
                index,
                test,
                name;

            str += '<table>';
            str += '<thead><tr><th>Source</th><th>Size (KiB)</th>';
            for (i = 0; i < parsers.length; i += 1) {
                str += '<th>' + parsers[i] + '</th>';
            }
            str += '</tr></thead>';
            str += '<tbody>';
            for (index = 0; index < fixtureList.length; index += 1) {
                test = fixtureList[index];
                name = slug(test);
                str += '<tr>';
                str += '<td>' + test + '</td>';
                if (window.data && window.data[name]) {
                    str += '<td id="' + name + '-size">' + kb(window.data[name].length) + '</td>';
                } else {
                    str += '<td id="' + name + '-size"></td>';
                }
                for (i = 0; i < parsers.length; i += 1) {
                    str += '<td id="' + name + '-' + slug(parsers[i]) + '-time"></td>';
                }
                str += '</tr>';
            }
            str += '<tr><td><b>Total</b></td>';
            str += '<td id="total-size"></td>';
            for (i = 0; i < parsers.length; i += 1) {
                str += '<td id="' + slug(parsers[i]) + '-total"></td>';
            }
            str += '</tr>';
            str += '</tbody>';
            str += '</table>';

            id('result').innerHTML = str;
        }

        function loadFixtures() {

            var index = 0,
                totalSize = 0;

            function load(test, callback) {
                var xhr = new XMLHttpRequest(),
                    src = '3rdparty/' + test + '.js';

                window.data = window.data || {};
                window.data[test] = '';

                try {
                    xhr.timeout = 30000;
                    xhr.open('GET', src, true);

                    xhr.ontimeout = function () {
                        setText('status', 'Error: time out while loading ' + test);
                        callback.apply();
                    };

                    xhr.onreadystatechange = function () {
                        var success = false,
                            size = 0;

                        if (this.readyState === XMLHttpRequest.DONE) {
                            if (this.status === 200) {
                                window.data[test] = this.responseText;
                                size = this.responseText.length;
                                totalSize += size;
                                success = true;
                            }
                        }

                        if (success) {
                            setText(test + '-size', kb(size));
                        } else {
                            setText('status', 'Please wait. Error loading ' + src);
                            setText(test + '-size', 'Error');
                        }

                        callback.apply();
                    };

                    xhr.send(null);
                } catch (e) {
                    setText('status', 'Please wait. Error loading ' + src);
                    callback.apply();
                }
            }

            function loadNextTest() {
                var test;

                if (index < fixtureList.length) {
                    test = fixtureList[index];
                    index += 1;
                    setText('status', 'Please wait. Loading ' + test +
                            ' (' + index + ' of ' + fixtureList.length + ')');
                    window.setTimeout(function () {
                        load(slug(test), loadNextTest);
                    }, 100);
                } else {
                    setText('total-size', kb(totalSize));
                    setText('status', 'Ready.');
                    enableRunButtons();
                }
            }

            loadNextTest();
        }

        function setupParser() {
            var i, j;

            suite = [];
            for (i = 0; i < fixtureList.length; i += 1) {
                for (j = 0; j < parsers.length; j += 1) {
                    suite.push({
                        fixture: fixtureList[i],
                        parser: parsers[j]
                    });
                }
            }

            createTable();
        }

        function runBenchmarks() {

            var index = 0,
                totalTime = {};

            function reset() {
                var i, name;
                for (i = 0; i < suite.length; i += 1) {
                    name = slug(suite[i].fixture) + '-' + slug(suite[i].parser);
                    setText(name + '-time', '');
                }
            }

            function run() {
                var fixture, parser, test, source, fn, benchmark;

                if (index >= suite.length) {
                    setText('status', 'Ready.');
                    enableRunButtons();
                    return;
                }

                fixture = suite[index].fixture;
                parser = suite[index].parser;

                source = window.data[slug(fixture)];

                test = slug(fixture) + '-' + slug(parser);
                setText(test + '-time', 'Running...');

                setText('status', 'Please wait. Parsing ' + fixture + '...');

                // Force the result to be held in this array, thus defeating any
                // possible "dead code elimination" optimization.
                window.tree = [];

                switch (parser) {
                case 'Esprima':
                    fn = function () {
                        var syntax = window.esprima.parse(source);
                        window.tree.push(syntax.body.length);
                    };
                    break;

                case 'parse-js':
                    fn = function () {
                        var syntax = window.parseJS.parse(source);
                        window.tree.push(syntax.length);
                    };
                    break;

                case 'Acorn':
                    fn = function () {
                        var syntax = window.acorn.parse(source);
                        window.tree.push(syntax.body.length);
                    };
                    break;

                default:
                    throw 'Unknown parser type ' + parser;
                }

                benchmark = new window.Benchmark(test, fn, {
                    'onComplete': function () {
                        setText(this.name + '-time', (1000 * this.stats.mean).toFixed(1));
                        if (!totalTime[parser]) {
                            totalTime[parser] = this.stats.mean;
                        } else {
                            totalTime[parser] += this.stats.mean;
                        }
                        setText(slug(parser) + '-total', (1000 * totalTime[parser]).toFixed(1));
                    }
                });

                window.setTimeout(function () {
                    benchmark.run();
                    index += 1;
                    window.setTimeout(run, 211);
                }, 211);
            }


            disableRunButtons();
            setText('status', 'Please wait. Running benchmarks...');

            reset();
            run();
        }

        id('run').onclick = function () {
            runBenchmarks();
        };

        setText('benchmarkjs-version', ' version ' + window.Benchmark.version);
        setText('version', window.esprima.version);

        setupParser();
        createTable();

        disableRunButtons();
        loadFixtures();
    };
} else {
    // TODO
    console.log('Not implemented yet!');
}
/* vim: set sw=4 ts=4 et tw=80 : */
