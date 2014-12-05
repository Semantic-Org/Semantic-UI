/*!
Jasmine-jQuery: a set of jQuery helpers for Jasmine tests.

Version 1.5.91

https://github.com/velesin/jasmine-jquery

Copyright (c) 2010-2013 Wojciech Zawistowski, Travis Jeffery

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

+function (jasmine, $) { "use strict";

  jasmine.spiedEventsKey = function (selector, eventName) {
    return [$(selector).selector, eventName].toString()
  }

  jasmine.getFixtures = function () {
    return jasmine.currentFixtures_ = jasmine.currentFixtures_ || new jasmine.Fixtures()
  }

  jasmine.getStyleFixtures = function () {
    return jasmine.currentStyleFixtures_ = jasmine.currentStyleFixtures_ || new jasmine.StyleFixtures()
  }

  jasmine.Fixtures = function () {
    this.containerId = 'jasmine-fixtures'
    this.fixturesCache_ = {}
    this.fixturesPath = 'spec/javascripts/fixtures'
  }

  jasmine.Fixtures.prototype.set = function (html) {
    this.cleanUp()
    return this.createContainer_(html)
  }

  jasmine.Fixtures.prototype.appendSet= function (html) {
    this.addToContainer_(html)
  }

  jasmine.Fixtures.prototype.preload = function () {
    this.read.apply(this, arguments)
  }

  jasmine.Fixtures.prototype.load = function () {
    this.cleanUp()
    this.createContainer_(this.read.apply(this, arguments))
  }

  jasmine.Fixtures.prototype.appendLoad = function () {
    this.addToContainer_(this.read.apply(this, arguments))
  }

  jasmine.Fixtures.prototype.read = function () {
    var htmlChunks = []
      , fixtureUrls = arguments

    for(var urlCount = fixtureUrls.length, urlIndex = 0; urlIndex < urlCount; urlIndex++) {
      htmlChunks.push(this.getFixtureHtml_(fixtureUrls[urlIndex]))
    }

    return htmlChunks.join('')
  }

  jasmine.Fixtures.prototype.clearCache = function () {
    this.fixturesCache_ = {}
  }

  jasmine.Fixtures.prototype.cleanUp = function () {
    $('#' + this.containerId).remove()
  }

  jasmine.Fixtures.prototype.sandbox = function (attributes) {
    var attributesToSet = attributes || {}
    return $('<div id="sandbox" />').attr(attributesToSet)
  }

  jasmine.Fixtures.prototype.createContainer_ = function (html) {
    var container = $('<div>')
    .attr('id', this.containerId)
    .html(html)

    $(document.body).append(container)
    return container
  }

  jasmine.Fixtures.prototype.addToContainer_ = function (html){
    var container = $(document.body).find('#'+this.containerId).append(html)
    if(!container.length){
      this.createContainer_(html)
    }
  }

  jasmine.Fixtures.prototype.getFixtureHtml_ = function (url) {
    if (typeof this.fixturesCache_[url] === 'undefined') {
      this.loadFixtureIntoCache_(url)
    }
    return this.fixturesCache_[url]
  }

  jasmine.Fixtures.prototype.loadFixtureIntoCache_ = function (relativeUrl) {
    var self = this
      , url = this.makeFixtureUrl_(relativeUrl)
      , request = $.ajax({
        async: false, // must be synchronous to guarantee that no tests are run before fixture is loaded
        cache: false,
        url: url,
        success: function (data, status, $xhr) {
          self.fixturesCache_[relativeUrl] = $xhr.responseText
        },
        error: function (jqXHR, status, errorThrown) {
          throw new Error('Fixture could not be loaded: ' + url + ' (status: ' + status + ', message: ' + errorThrown.message + ')')
        }
      })
  }

  jasmine.Fixtures.prototype.makeFixtureUrl_ = function (relativeUrl){
    return this.fixturesPath.match('/$') ? this.fixturesPath + relativeUrl : this.fixturesPath + '/' + relativeUrl
  }

  jasmine.Fixtures.prototype.proxyCallTo_ = function (methodName, passedArguments) {
    return this[methodName].apply(this, passedArguments)
  }


  jasmine.StyleFixtures = function () {
    this.fixturesCache_ = {}
    this.fixturesNodes_ = []
    this.fixturesPath = 'spec/javascripts/fixtures'
  }

  jasmine.StyleFixtures.prototype.set = function (css) {
    this.cleanUp()
    this.createStyle_(css)
  }

  jasmine.StyleFixtures.prototype.appendSet = function (css) {
    this.createStyle_(css)
  }

  jasmine.StyleFixtures.prototype.preload = function () {
    this.read_.apply(this, arguments)
  }

  jasmine.StyleFixtures.prototype.load = function () {
    this.cleanUp()
    this.createStyle_(this.read_.apply(this, arguments))
  }

  jasmine.StyleFixtures.prototype.appendLoad = function () {
    this.createStyle_(this.read_.apply(this, arguments))
  }

  jasmine.StyleFixtures.prototype.cleanUp = function () {
    while(this.fixturesNodes_.length) {
      this.fixturesNodes_.pop().remove()
    }
  }

  jasmine.StyleFixtures.prototype.createStyle_ = function (html) {
    var styleText = $('<div></div>').html(html).text()
      , style = $('<style>' + styleText + '</style>')

    this.fixturesNodes_.push(style)
    $('head').append(style)
  }

  jasmine.StyleFixtures.prototype.clearCache = jasmine.Fixtures.prototype.clearCache
  jasmine.StyleFixtures.prototype.read_ = jasmine.Fixtures.prototype.read
  jasmine.StyleFixtures.prototype.getFixtureHtml_ = jasmine.Fixtures.prototype.getFixtureHtml_
  jasmine.StyleFixtures.prototype.loadFixtureIntoCache_ = jasmine.Fixtures.prototype.loadFixtureIntoCache_
  jasmine.StyleFixtures.prototype.makeFixtureUrl_ = jasmine.Fixtures.prototype.makeFixtureUrl_
  jasmine.StyleFixtures.prototype.proxyCallTo_ = jasmine.Fixtures.prototype.proxyCallTo_

  jasmine.getJSONFixtures = function () {
    return jasmine.currentJSONFixtures_ = jasmine.currentJSONFixtures_ || new jasmine.JSONFixtures()
  }

  jasmine.JSONFixtures = function () {
    this.fixturesCache_ = {}
    this.fixturesPath = 'spec/javascripts/fixtures/json'
  }

  jasmine.JSONFixtures.prototype.load = function () {
    this.read.apply(this, arguments)
    return this.fixturesCache_
  }

  jasmine.JSONFixtures.prototype.read = function () {
    var fixtureUrls = arguments

    for(var urlCount = fixtureUrls.length, urlIndex = 0; urlIndex < urlCount; urlIndex++) {
      this.getFixtureData_(fixtureUrls[urlIndex])
    }

    return this.fixturesCache_
  }

  jasmine.JSONFixtures.prototype.clearCache = function () {
    this.fixturesCache_ = {}
  }

  jasmine.JSONFixtures.prototype.getFixtureData_ = function (url) {
    if (!this.fixturesCache_[url]) this.loadFixtureIntoCache_(url)
    return this.fixturesCache_[url]
  }

  jasmine.JSONFixtures.prototype.loadFixtureIntoCache_ = function (relativeUrl) {
    var self = this
      , url = this.fixturesPath.match('/$') ? this.fixturesPath + relativeUrl : this.fixturesPath + '/' + relativeUrl

    $.ajax({
      async: false, // must be synchronous to guarantee that no tests are run before fixture is loaded
      cache: false,
      dataType: 'json',
      url: url,
      success: function (data) {
        self.fixturesCache_[relativeUrl] = data
      },
      error: function (jqXHR, status, errorThrown) {
        throw new Error('JSONFixture could not be loaded: ' + url + ' (status: ' + status + ', message: ' + errorThrown.message + ')')
      }
    })
  }

  jasmine.JSONFixtures.prototype.proxyCallTo_ = function (methodName, passedArguments) {
    return this[methodName].apply(this, passedArguments)
  }

  jasmine.JQuery = function () {}

  jasmine.JQuery.browserTagCaseIndependentHtml = function (html) {
    return $('<div/>').append(html).html()
  }

  jasmine.JQuery.elementToString = function (element) {
    var domEl = $(element).get(0)

    if (domEl === undefined || domEl.cloneNode)
      return $('<div />').append($(element).clone()).html()
    else
      return element.toString()
  }

  jasmine.JQuery.matchersClass = {}

  !function (namespace) {
    var data = {
        spiedEvents: {}
      , handlers:    []
    }

    namespace.events = {
      spyOn: function (selector, eventName) {
        var handler = function (e) {
          data.spiedEvents[jasmine.spiedEventsKey(selector, eventName)] = jasmine.util.argsToArray(arguments)
        }

        $(selector).on(eventName, handler)
        data.handlers.push(handler)

        return {
          selector: selector,
          eventName: eventName,
          handler: handler,
          reset: function (){
            delete data.spiedEvents[jasmine.spiedEventsKey(selector, eventName)]
          }
        }
      },

      args: function (selector, eventName) {
        var actualArgs = data.spiedEvents[jasmine.spiedEventsKey(selector, eventName)]

        if (!actualArgs) {
          throw "There is no spy for " + eventName + " on " + selector.toString() + ". Make sure to create a spy using spyOnEvent."
        }

        return actualArgs
      },

      wasTriggered: function (selector, eventName) {
        return !!(data.spiedEvents[jasmine.spiedEventsKey(selector, eventName)])
      },

      wasTriggeredWith: function (selector, eventName, expectedArgs, env) {
        var actualArgs = jasmine.JQuery.events.args(selector, eventName).slice(1)
        if (Object.prototype.toString.call(expectedArgs) !== '[object Array]') {
          actualArgs = actualArgs[0]
        }
        return env.equals_(expectedArgs, actualArgs)
      },

      wasPrevented: function (selector, eventName) {
        var args = data.spiedEvents[jasmine.spiedEventsKey(selector, eventName)]
          , e = args ? args[0] : undefined

        return e && e.isDefaultPrevented()
      },

      wasStopped: function (selector, eventName) {
        var args = data.spiedEvents[jasmine.spiedEventsKey(selector, eventName)]
          , e = args ? args[0] : undefined
        return e && e.isPropagationStopped()
      },

      cleanUp: function () {
        data.spiedEvents = {}
        data.handlers    = []
      }
    }
  }(jasmine.JQuery)

  !function (){
    var jQueryMatchers = {
      toHaveClass: function (className) {
        return this.actual.hasClass(className)
      },

      toHaveCss: function (css){
        for (var prop in css){
          var value = css[prop]
          // see issue #147 on gh
          ;if (value === 'auto' && this.actual.get(0).style[prop] === 'auto') continue
          if (this.actual.css(prop) !== value) return false
        }
        return true
      },

      toBeVisible: function () {
        return this.actual.is(':visible')
      },

      toBeHidden: function () {
        return this.actual.is(':hidden')
      },

      toBeSelected: function () {
        return this.actual.is(':selected')
      },

      toBeChecked: function () {
        return this.actual.is(':checked')
      },

      toBeEmpty: function () {
        return this.actual.is(':empty')
      },

      toExist: function () {
        return this.actual.length
      },

      toHaveLength: function (length) {
        return this.actual.length === length
      },

      toHaveAttr: function (attributeName, expectedAttributeValue) {
        return hasProperty(this.actual.attr(attributeName), expectedAttributeValue)
      },

      toHaveProp: function (propertyName, expectedPropertyValue) {
        return hasProperty(this.actual.prop(propertyName), expectedPropertyValue)
      },

      toHaveId: function (id) {
        return this.actual.attr('id') == id
      },

      toHaveHtml: function (html) {
        return this.actual.html() == jasmine.JQuery.browserTagCaseIndependentHtml(html)
      },

      toContainHtml: function (html){
        var actualHtml = this.actual.html()
          , expectedHtml = jasmine.JQuery.browserTagCaseIndependentHtml(html)

        return (actualHtml.indexOf(expectedHtml) >= 0)
      },

      toHaveText: function (text) {
        var trimmedText = $.trim(this.actual.text())

        if (text && $.isFunction(text.test)) {
          return text.test(trimmedText)
        } else {
          return trimmedText == text
        }
      },

      toContainText: function (text) {
        var trimmedText = $.trim(this.actual.text())

        if (text && $.isFunction(text.test)) {
          return text.test(trimmedText)
        } else {
          return trimmedText.indexOf(text) != -1
        }
      },

      toHaveValue: function (value) {
        return this.actual.val() === value
      },

      toHaveData: function (key, expectedValue) {
        return hasProperty(this.actual.data(key), expectedValue)
      },

      toBe: function (selector) {
        return this.actual.is(selector)
      },

      toContain: function (selector) {
        return this.actual.find(selector).length
      },

      toBeMatchedBy: function (selector) {
        return this.actual.filter(selector).length
      },

      toBeDisabled: function (selector){
        return this.actual.is(':disabled')
      },

      toBeFocused: function (selector) {
        return this.actual[0] === this.actual[0].ownerDocument.activeElement
      },

      toHandle: function (event) {
        var events = $._data(this.actual.get(0), "events")

        if(!events || !event || typeof event !== "string") {
          return false
        }

        var namespaces = event.split(".")
          , eventType = namespaces.shift()
          , sortedNamespaces = namespaces.slice(0).sort()
          , namespaceRegExp = new RegExp("(^|\\.)" + sortedNamespaces.join("\\.(?:.*\\.)?") + "(\\.|$)")

        if(events[eventType] && namespaces.length) {
          for(var i = 0; i < events[eventType].length; i++) {
            var namespace = events[eventType][i].namespace

            if(namespaceRegExp.test(namespace)) {
              return true
            }
          }
        } else {
          return events[eventType] && events[eventType].length > 0
        }
      },

      toHandleWith: function (eventName, eventHandler) {
        var normalizedEventName = eventName.split('.')[0]
          , stack = $._data(this.actual.get(0), "events")[normalizedEventName]

        for (var i = 0; i < stack.length; i++) {
          if (stack[i].handler == eventHandler) return true
        }

        return false
      }
    }

    var hasProperty = function (actualValue, expectedValue) {
      if (expectedValue === undefined) return actualValue !== undefined

      return actualValue == expectedValue
    }

    var bindMatcher = function (methodName) {
      var builtInMatcher = jasmine.Matchers.prototype[methodName]

      jasmine.JQuery.matchersClass[methodName] = function () {
        if (this.actual
          && (this.actual instanceof $
            || jasmine.isDomNode(this.actual))) {
              this.actual = $(this.actual)
              var result = jQueryMatchers[methodName].apply(this, arguments)
                , element

              if (this.actual.get && (element = this.actual.get()[0]) && !$.isWindow(element) && element.tagName !== "HTML")
                this.actual = jasmine.JQuery.elementToString(this.actual)

              return result
            }

            if (builtInMatcher) {
              return builtInMatcher.apply(this, arguments)
            }

            return false
      }
    }

    for(var methodName in jQueryMatchers) {
      bindMatcher(methodName)
    }
  }()

  beforeEach(function () {
    this.addMatchers(jasmine.JQuery.matchersClass)
    this.addMatchers({
      toHaveBeenTriggeredOn: function (selector) {
        this.message = function () {
          return [
            "Expected event " + this.actual + " to have been triggered on " + selector,
            "Expected event " + this.actual + " not to have been triggered on " + selector
          ]
        }
        return jasmine.JQuery.events.wasTriggered(selector, this.actual)
      }
    })
    this.addMatchers({
      toHaveBeenTriggered: function (){
        var eventName = this.actual.eventName
          , selector = this.actual.selector

        this.message = function () {
          return [
            "Expected event " + eventName + " to have been triggered on " + selector,
            "Expected event " + eventName + " not to have been triggered on " + selector
          ]
        }

        return jasmine.JQuery.events.wasTriggered(selector, eventName)
      }
    })
    this.addMatchers({
      toHaveBeenTriggeredOnAndWith: function () {
        var selector = arguments[0]
          , expectedArgs = arguments[1]
          , wasTriggered = jasmine.JQuery.events.wasTriggered(selector, this.actual)

        this.message = function () {
          if (wasTriggered) {
            var actualArgs = jasmine.JQuery.events.args(selector, this.actual, expectedArgs)[1]
            return [
              "Expected event " + this.actual + " to have been triggered with " + jasmine.pp(expectedArgs) + "  but it was triggered with " + jasmine.pp(actualArgs),
              "Expected event " + this.actual + " not to have been triggered with " + jasmine.pp(expectedArgs) + " but it was triggered with " + jasmine.pp(actualArgs)
            ]
          } else {
            return [
              "Expected event " + this.actual + " to have been triggered on " + selector,
              "Expected event " + this.actual + " not to have been triggered on " + selector
            ]
          }
        }

        return wasTriggered && jasmine.JQuery.events.wasTriggeredWith(selector, this.actual, expectedArgs, this.env)
      }
    })
    this.addMatchers({
      toHaveBeenPreventedOn: function (selector) {
        this.message = function () {
          return [
            "Expected event " + this.actual + " to have been prevented on " + selector,
            "Expected event " + this.actual + " not to have been prevented on " + selector
          ]
        }

        return jasmine.JQuery.events.wasPrevented(selector, this.actual)
      }
    })
    this.addMatchers({
      toHaveBeenPrevented: function () {
        var eventName = this.actual.eventName
          , selector = this.actual.selector
        this.message = function () {
          return [
            "Expected event " + eventName + " to have been prevented on " + selector,
            "Expected event " + eventName + " not to have been prevented on " + selector
          ]
        }

        return jasmine.JQuery.events.wasPrevented(selector, eventName)
      }
    })
    this.addMatchers({
      toHaveBeenStoppedOn: function (selector) {
        this.message = function () {
          return [
            "Expected event " + this.actual + " to have been stopped on " + selector,
            "Expected event " + this.actual + " not to have been stopped on " + selector
          ]
        }

        return jasmine.JQuery.events.wasStopped(selector, this.actual)
      }
    })
    this.addMatchers({
      toHaveBeenStopped: function () {
        var eventName = this.actual.eventName
          , selector = this.actual.selector
        this.message = function () {
          return [
            "Expected event " + eventName + " to have been stopped on " + selector,
            "Expected event " + eventName + " not to have been stopped on " + selector
          ]
        }
        return jasmine.JQuery.events.wasStopped(selector, eventName)
      }
    })
    jasmine.getEnv().addEqualityTester(function (a, b) {
      if(a instanceof jQuery && b instanceof jQuery) {
        if(a.size() != b.size()) {
          return jasmine.undefined
        }
        else if(a.is(b)) {
          return true
        }
      }

      return jasmine.undefined
    })
  })

  afterEach(function () {
    jasmine.getFixtures().cleanUp()
    jasmine.getStyleFixtures().cleanUp()
    jasmine.JQuery.events.cleanUp()
  })
}(window.jasmine, window.jQuery)

+function (jasmine, global) { "use strict";

  global.readFixtures = function () {
    return jasmine.getFixtures().proxyCallTo_('read', arguments)
  }

  global.preloadFixtures = function () {
    jasmine.getFixtures().proxyCallTo_('preload', arguments)
  }

  global.loadFixtures = function () {
    jasmine.getFixtures().proxyCallTo_('load', arguments)
  }

  global.appendLoadFixtures = function () {
    jasmine.getFixtures().proxyCallTo_('appendLoad', arguments)
  }

  global.setFixtures = function (html) {
    return jasmine.getFixtures().proxyCallTo_('set', arguments)
  }

  global.appendSetFixtures = function () {
    jasmine.getFixtures().proxyCallTo_('appendSet', arguments)
  }

  global.sandbox = function (attributes) {
    return jasmine.getFixtures().sandbox(attributes)
  }

  global.spyOnEvent = function (selector, eventName) {
    return jasmine.JQuery.events.spyOn(selector, eventName)
  }

  global.preloadStyleFixtures = function () {
    jasmine.getStyleFixtures().proxyCallTo_('preload', arguments)
  }

  global.loadStyleFixtures = function () {
    jasmine.getStyleFixtures().proxyCallTo_('load', arguments)
  }

  global.appendLoadStyleFixtures = function () {
    jasmine.getStyleFixtures().proxyCallTo_('appendLoad', arguments)
  }

  global.setStyleFixtures = function (html) {
    jasmine.getStyleFixtures().proxyCallTo_('set', arguments)
  }

  global.appendSetStyleFixtures = function (html) {
    jasmine.getStyleFixtures().proxyCallTo_('appendSet', arguments)
  }

  global.loadJSONFixtures = function () {
    return jasmine.getJSONFixtures().proxyCallTo_('load', arguments)
  }

  global.getJSONFixture = function (url) {
    return jasmine.getJSONFixtures().proxyCallTo_('read', arguments)[url]
  }
}(jasmine, window);