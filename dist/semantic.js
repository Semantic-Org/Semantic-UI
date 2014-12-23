 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
/*
 * # Semantic - Accordion
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.accordion = function(parameters) {
  var
    $allModules     = $(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.accordion.settings, parameters)
          : $.extend({}, $.fn.accordion.settings),

        className       = settings.className,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        $module  = $(this),
        $title   = $module.find(selector.title),
        $content = $module.find(selector.content),

        element  = this,
        instance = $module.data(moduleNamespace),
        observer,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing accordion with bound events', $module);
          $module
            .on('click' + eventNamespace, selector.title, module.event.click)
          ;
          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.debug('Destroying previous accordion for', $module);
          $module
            .removeData(moduleNamespace)
          ;
          $title
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          $title   = $module.find(selector.title);
          $content = $module.find(selector.content);
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },


        event: {
          click: function() {
            $.proxy(module.toggle, this)();
          }
        },

        toggle: function(query) {
          var
            $activeTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? $title.eq(query)
                : $(query)
              : $(this),
            $activeContent = $activeTitle.next($content),
            contentIsOpen  = $activeContent.is(':visible')
          ;
          module.debug('Toggling visibility of content', $activeTitle);
          if(contentIsOpen) {
            if(settings.collapsible) {
              $.proxy(module.close, $activeTitle)();
            }
            else {
              module.debug('Cannot close accordion content collapsing is disabled');
            }
          }
          else {
            $.proxy(module.open, $activeTitle)();
          }
        },

        open: function(query) {
          var
            $activeTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? $title.eq(query)
                : $(query)
              : $(this),
            $activeContent     = $activeTitle.next($content),
            currentlyAnimating = $activeContent.is(':animated'),
            currentlyActive    = $activeContent.hasClass(className.active)
          ;
          if(!currentlyAnimating && !currentlyActive) {
            module.debug('Opening accordion content', $activeTitle);
            if(settings.exclusive) {
              $.proxy(module.closeOthers, $activeTitle)();
            }
            $activeTitle
              .addClass(className.active)
            ;
            $activeContent
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 1
                }, settings.duration, module.reset.display)
                .end()
              .slideDown(settings.duration, settings.easing, function() {
                $activeContent
                  .addClass(className.active)
                ;
                $.proxy(module.reset.display, this)();
                $.proxy(settings.onOpen, this)();
                $.proxy(settings.onChange, this)();
              })
            ;
          }
        },

        close: function(query) {
          var
            $activeTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? $title.eq(query)
                : $(query)
              : $(this),
            $activeContent = $activeTitle.next($content),
            isActive       = $activeContent.hasClass(className.active)
          ;
          if(isActive) {
            module.debug('Closing accordion content', $activeContent);
            $activeTitle
              .removeClass(className.active)
            ;
            $activeContent
              .removeClass(className.active)
              .show()
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 0
                }, settings.duration, module.reset.opacity)
                .end()
              .slideUp(settings.duration, settings.easing, function() {
                $.proxy(module.reset.display, this)();
                $.proxy(settings.onClose, this)();
                $.proxy(settings.onChange, this)();
              })
            ;
          }
        },

        closeOthers: function(index) {
          var
            $activeTitle = (index !== undefined)
              ? $title.eq(index)
              : $(this),
            $parentTitles    = $activeTitle.parents(selector.content).prev(selector.title),
            $activeAccordion = $activeTitle.closest(selector.accordion),
            activeSelector   = selector.title + '.' + className.active + ':visible',
            activeContent    = selector.content + '.' + className.active + ':visible',
            $openTitles,
            $nestedTitles,
            $openContents
          ;
          if(settings.closeNested) {
            $openTitles   = $activeAccordion.find(activeSelector).not($parentTitles);
            $openContents = $openTitles.next($content);
          }
          else {
            $openTitles   = $activeAccordion.find(activeSelector).not($parentTitles);
            $nestedTitles = $activeAccordion.find(activeContent).find(activeSelector).not($parentTitles);
            $openTitles = $openTitles.not($nestedTitles);
            $openContents = $openTitles.next($content);
          }
          if( ($openTitles.size() > 0) ) {
            module.debug('Exclusive enabled, closing other content', $openTitles);
            $openTitles
              .removeClass(className.active)
            ;
            $openContents
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 0
                }, settings.duration, module.resetOpacity)
                .end()
              .slideUp(settings.duration , settings.easing, function() {
                $(this).removeClass(className.active);
                $.proxy(module.reset.display, this)();
              })
            ;
          }
        },

        reset: {

          display: function() {
            module.verbose('Removing inline display from element', this);
            $(this).css('display', '');
            if( $(this).attr('style') === '') {
              $(this)
                .attr('style', '')
                .removeAttr('style')
              ;
            }
          },

          opacity: function() {
            module.verbose('Removing inline opacity from element', this);
            $(this).css('opacity', '');
            if( $(this).attr('style') === '') {
              $(this)
                .attr('style', '')
                .removeAttr('style')
              ;
            }
          },

        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          module.debug('Changing internal', name, value);
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.accordion.settings = {

  name        : 'Accordion',
  namespace   : 'accordion',

  debug       : false,
  verbose     : true,
  performance : true,

  exclusive   : true,
  collapsible : true,
  closeNested : false,

  duration    : 500,
  easing      : 'easeInOutQuint',

  onOpen      : function(){},
  onClose     : function(){},
  onChange    : function(){},

  error: {
    method : 'The method you called is not defined'
  },

  className   : {
    active : 'active'
  },

  selector    : {
    accordion : '.accordion',
    title     : '.title',
    content   : '.content'
  }

};

// Adds easing
$.extend( $.easing, {
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});

})( jQuery, window , document );


 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,n,t,i){"use strict";e.fn.accordion=function(t){{var o,s=e(this),r=(new Date).getTime(),a=[],c=arguments[0],l="string"==typeof c,u=[].slice.call(arguments,1);n.requestAnimationFrame||n.mozRequestAnimationFrame||n.webkitRequestAnimationFrame||n.msRequestAnimationFrame||function(e){setTimeout(e,0)}}return s.each(function(){var d,p,m=e.isPlainObject(t)?e.extend(!0,{},e.fn.accordion.settings,t):e.extend({},e.fn.accordion.settings),f=m.className,g=m.namespace,h=m.selector,v=m.error,b="."+g,y="module-"+g,x=s.selector||"",C=e(this),O=C.find(h.title),T=C.find(h.content),A=this,w=C.data(y);p={initialize:function(){p.debug("Initializing accordion with bound events",C),C.on("click"+b,h.title,p.event.click),p.observeChanges(),p.instantiate()},instantiate:function(){w=p,C.data(y,p)},destroy:function(){p.debug("Destroying previous accordion for",C),C.removeData(y),O.off(b)},refresh:function(){O=C.find(h.title),T=C.find(h.content)},observeChanges:function(){"MutationObserver"in n&&(d=new MutationObserver(function(){p.debug("DOM tree modified, updating selector cache"),p.refresh()}),d.observe(A,{childList:!0,subtree:!0}),p.debug("Setting up mutation observer",d))},event:{click:function(){e.proxy(p.toggle,this)()}},toggle:function(n){var t=n!==i?"number"==typeof n?O.eq(n):e(n):e(this),o=t.next(T),s=o.is(":visible");p.debug("Toggling visibility of content",t),s?m.collapsible?e.proxy(p.close,t)():p.debug("Cannot close accordion content collapsing is disabled"):e.proxy(p.open,t)()},open:function(n){var t=n!==i?"number"==typeof n?O.eq(n):e(n):e(this),o=t.next(T),s=o.is(":animated"),r=o.hasClass(f.active);s||r||(p.debug("Opening accordion content",t),m.exclusive&&e.proxy(p.closeOthers,t)(),t.addClass(f.active),o.stop().children().stop().animate({opacity:1},m.duration,p.reset.display).end().slideDown(m.duration,m.easing,function(){o.addClass(f.active),e.proxy(p.reset.display,this)(),e.proxy(m.onOpen,this)(),e.proxy(m.onChange,this)()}))},close:function(n){var t=n!==i?"number"==typeof n?O.eq(n):e(n):e(this),o=t.next(T),s=o.hasClass(f.active);s&&(p.debug("Closing accordion content",o),t.removeClass(f.active),o.removeClass(f.active).show().stop().children().stop().animate({opacity:0},m.duration,p.reset.opacity).end().slideUp(m.duration,m.easing,function(){e.proxy(p.reset.display,this)(),e.proxy(m.onClose,this)(),e.proxy(m.onChange,this)()}))},closeOthers:function(n){var t,o,s,r=n!==i?O.eq(n):e(this),a=r.parents(h.content).prev(h.title),c=r.closest(h.accordion),l=h.title+"."+f.active+":visible",u=h.content+"."+f.active+":visible";m.closeNested?(t=c.find(l).not(a),s=t.next(T)):(t=c.find(l).not(a),o=c.find(u).find(l).not(a),t=t.not(o),s=t.next(T)),t.size()>0&&(p.debug("Exclusive enabled, closing other content",t),t.removeClass(f.active),s.stop().children().stop().animate({opacity:0},m.duration,p.resetOpacity).end().slideUp(m.duration,m.easing,function(){e(this).removeClass(f.active),e.proxy(p.reset.display,this)()}))},reset:{display:function(){p.verbose("Removing inline display from element",this),e(this).css("display",""),""===e(this).attr("style")&&e(this).attr("style","").removeAttr("style")},opacity:function(){p.verbose("Removing inline opacity from element",this),e(this).css("opacity",""),""===e(this).attr("style")&&e(this).attr("style","").removeAttr("style")}},setting:function(n,t){if(p.debug("Changing setting",n,t),e.isPlainObject(n))e.extend(!0,m,n);else{if(t===i)return m[n];m[n]=t}},internal:function(n,t){return p.debug("Changing internal",n,t),t===i?p[n]:void(e.isPlainObject(n)?e.extend(!0,p,n):p[n]=t)},debug:function(){m.debug&&(m.performance?p.performance.log(arguments):(p.debug=Function.prototype.bind.call(console.info,console,m.name+":"),p.debug.apply(console,arguments)))},verbose:function(){m.verbose&&m.debug&&(m.performance?p.performance.log(arguments):(p.verbose=Function.prototype.bind.call(console.info,console,m.name+":"),p.verbose.apply(console,arguments)))},error:function(){p.error=Function.prototype.bind.call(console.error,console,m.name+":"),p.error.apply(console,arguments)},performance:{log:function(e){var n,t,i;m.performance&&(n=(new Date).getTime(),i=r||n,t=n-i,r=n,a.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:A,"Execution Time":t})),clearTimeout(p.performance.timer),p.performance.timer=setTimeout(p.performance.display,100)},display:function(){var n=m.name+":",t=0;r=!1,clearTimeout(p.performance.timer),e.each(a,function(e,n){t+=n["Execution Time"]}),n+=" "+t+"ms",x&&(n+=" '"+x+"'"),(console.group!==i||console.table!==i)&&a.length>0&&(console.groupCollapsed(n),console.table?console.table(a):e.each(a,function(e,n){console.log(n.Name+": "+n["Execution Time"]+"ms")}),console.groupEnd()),a=[]}},invoke:function(n,t,s){var r,a,c,l=w;return t=t||u,s=A||s,"string"==typeof n&&l!==i&&(n=n.split(/[\. ]/),r=n.length-1,e.each(n,function(t,o){var s=t!=r?o+n[t+1].charAt(0).toUpperCase()+n[t+1].slice(1):n;if(e.isPlainObject(l[s])&&t!=r)l=l[s];else{if(l[s]!==i)return a=l[s],!1;if(!e.isPlainObject(l[o])||t==r)return l[o]!==i?(a=l[o],!1):(p.error(v.method,n),!1);l=l[o]}})),e.isFunction(a)?c=a.apply(s,t):a!==i&&(c=a),e.isArray(o)?o.push(c):o!==i?o=[o,c]:c!==i&&(o=c),a}},l?(w===i&&p.initialize(),p.invoke(c)):(w!==i&&p.destroy(),p.initialize())}),o!==i?o:this},e.fn.accordion.settings={name:"Accordion",namespace:"accordion",debug:!1,verbose:!0,performance:!0,exclusive:!0,collapsible:!0,closeNested:!1,duration:500,easing:"easeInOutQuint",onOpen:function(){},onClose:function(){},onChange:function(){},error:{method:"The method you called is not defined"},className:{active:"active"},selector:{accordion:".accordion",title:".title",content:".content"}},e.extend(e.easing,{easeInOutQuint:function(e,n,t,i,o){return(n/=o/2)<1?i/2*n*n*n*n*n+t:i/2*((n-=2)*n*n*n*n+2)+t}})}(jQuery,window,document);
/*
 * # Semantic - API
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.api = $.fn.api = function(parameters) {

  var
    // use window context if none specified
    $allModules     = $.isFunction(this)
        ? $(window)
        : $(this),
    moduleSelector = $allModules.selector || '',
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.api.settings, parameters)
          : $.extend({}, $.fn.api.settings),

        // internal aliases
        namespace       = settings.namespace,
        metadata        = settings.metadata,
        selector        = settings.selector,
        error           = settings.error,
        className       = settings.className,

        // define namespaces for modules
        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        // element that creates request
        $module         = $(this),
        $form           = $module.closest(selector.form),

        // context used for state
        $context        = (settings.stateContext)
          ? $(settings.stateContext)
          : $module,

        // request details
        ajaxSettings,
        requestSettings,
        url,
        data,

        // standard module
        element         = this,
        context         = $context.get(),
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          var
            triggerEvent = module.get.event()
          ;
          // bind events
          if(!methodInvoked) {
            if( triggerEvent ) {
              module.debug('Attaching API events to element', triggerEvent);
              $module
                .on(triggerEvent + eventNamespace, module.event.trigger)
              ;
            }
            else {
              module.query();
            }
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        query: function() {

          if(module.is.disabled()) {
            module.debug('Element is disabled API request aborted');
            return;
          }
          // determine if an api event already occurred
          if(module.is.loading() && settings.throttle === 0 ) {
            module.debug('Cancelling request, previous request is still pending');
            return;
          }

          // pass element metadata to url (value, text)
          if(settings.defaultData) {
            $.extend(true, settings.urlData, module.get.defaultData());
          }

          // Add form content
          if(settings.serializeForm !== false || $context.is('form')) {
            if(settings.serializeForm == 'json') {
              $.extend(true, settings.data, module.get.formData());
            }
            else {
              settings.data = module.get.formData();
            }
          }

          // call beforesend and get any settings changes
          requestSettings = module.get.settings();

          // check if beforesend cancelled request
          if(requestSettings === false) {
            module.error(error.beforeSend);
            return;
          }

          if(settings.url) {
            // override with url if specified
            module.debug('Using specified url', url);
            url = module.add.urlData( settings.url );
          }
          else {
            // otherwise find url from api endpoints
            url = module.add.urlData( module.get.templateURL() );
            module.debug('Added URL Data to url', url);
          }

          // exit conditions reached, missing url parameters
          if( !url ) {
            if($module.is('form')) {
              module.debug('No url or action specified, defaulting to form action');
              url = $module.attr('action');
            }
            else {
              module.error(error.missingURL, settings.action);
              return;
            }
          }

          // add loading state
          module.set.loading();

          // look for jQuery ajax parameters in settings
          ajaxSettings = $.extend(true, {}, settings, {
            type       : settings.method || settings.type,
            data       : data,
            url        : settings.base + url,
            beforeSend : settings.beforeXHR,
            success    : function() {},
            failure    : function() {},
            complete   : function() {}
          });

          module.verbose('Creating AJAX request with settings', ajaxSettings);

          if( !module.is.loading() ) {
            module.request = module.create.request();
            module.xhr = module.create.xhr();
          }
          else {
            // throttle additional requests
            module.timer = setTimeout(function() {
              module.request = module.create.request();
              module.xhr = module.create.xhr();
            }, settings.throttle);
          }

        },


        is: {
          disabled: function() {
            return ($module.filter(settings.filter).size() > 0);
          },
          loading: function() {
            return (module.request && module.request.state() == 'pending');
          }
        },

        was: {
          succesful: function() {
            return (module.request && module.request.state() == 'resolved');
          },
          failure: function() {
            return (module.request && module.request.state() == 'rejected');
          },
          complete: function() {
            return (module.request && (module.request.state() == 'resolved' || module.request.state() == 'rejected') );
          }
        },

        add: {
          urlData: function(url, urlData) {
            var
              requiredVariables,
              optionalVariables
            ;
            if(url) {
              requiredVariables = url.match(settings.regExp.required);
              optionalVariables = url.match(settings.regExp.optional);
              urlData           = urlData || settings.urlData;
              if(requiredVariables) {
                module.debug('Looking for required URL variables', requiredVariables);
                $.each(requiredVariables, function(index, templatedString) {
                  var
                    // allow legacy {$var} style
                    variable = (templatedString.indexOf('$') !== -1)
                      ? templatedString.substr(2, templatedString.length - 3)
                      : templatedString.substr(1, templatedString.length - 2),
                    value   = ($.isPlainObject(urlData) && urlData[variable] !== undefined)
                      ? urlData[variable]
                      : ($module.data(variable) !== undefined)
                        ? $module.data(variable)
                        : ($context.data(variable) !== undefined)
                          ? $context.data(variable)
                          : urlData[variable]
                  ;
                  // remove value
                  if(value === undefined) {
                    module.error(error.requiredParameter, variable, url);
                    url = false;
                    return false;
                  }
                  else {
                    module.verbose('Found required variable', variable, value);
                    url = url.replace(templatedString, value);
                  }
                });
              }
              if(optionalVariables) {
                module.debug('Looking for optional URL variables', requiredVariables);
                $.each(optionalVariables, function(index, templatedString) {
                  var
                    // allow legacy {/$var} style
                    variable = (templatedString.indexOf('$') !== -1)
                      ? templatedString.substr(3, templatedString.length - 4)
                      : templatedString.substr(2, templatedString.length - 3),
                    value   = ($.isPlainObject(urlData) && urlData[variable] !== undefined)
                      ? urlData[variable]
                      : ($module.data(variable) !== undefined)
                        ? $module.data(variable)
                        : ($context.data(variable) !== undefined)
                          ? $context.data(variable)
                          : urlData[variable]
                  ;
                  // optional replacement
                  if(value !== undefined) {
                    module.verbose('Optional variable Found', variable, value);
                    url = url.replace(templatedString, value);
                  }
                  else {
                    module.verbose('Optional variable not found', variable);
                    // remove preceding slash if set
                    if(url.indexOf('/' + templatedString) !== -1) {
                      url = url.replace('/' + templatedString, '');
                    }
                    else {
                      url = url.replace(templatedString, '');
                    }
                  }
                });
              }
            }
            return url;
          }
        },

        event: {
          trigger: function(event) {
            module.query();
            if(event.type == 'submit' || event.type == 'click') {
              event.preventDefault();
            }
          },
          xhr: {
            always: function() {
              // calculate if loading time was below minimum threshold
            },
            done: function(response) {
              var
                context      = this,
                elapsedTime  = (new Date().getTime() - time),
                timeLeft     = (settings.loadingDuration - elapsedTime)
              ;
              timeLeft = (timeLeft > 0)
                ? timeLeft
                : 0
              ;
              setTimeout(function() {
                module.request.resolveWith(context, [response]);
              }, timeLeft);
            },
            fail: function(xhr, status, httpMessage) {
              var
                context     = this,
                elapsedTime = (new Date().getTime() - time),
                timeLeft    = (settings.loadingDuration - elapsedTime)
              ;
              timeLeft = (timeLeft > 0)
                ? timeLeft
                : 0
              ;
              // page triggers abort on navigation, dont show error
              setTimeout(function() {
                if(status !== 'abort') {
                  module.request.rejectWith(context, [xhr, status, httpMessage]);
                }
                else {
                  module.reset();
                }
              }, timeLeft);
            }
          },
          request: {
            complete: function(response) {
              module.remove.loading();
              $.proxy(settings.onComplete, context)(response, $module);
            },
            done: function(response) {
              module.debug('API Response Received', response);
              if(settings.dataType == 'json') {
                if( $.isFunction(settings.successTest) ) {
                  module.debug('Checking JSON returned success', settings.successTest, response);
                  if( settings.successTest(response) ) {
                    $.proxy(settings.onSuccess, context)(response, $module);
                  }
                  else {
                    module.debug('JSON test specified by user and response failed', response);
                    $.proxy(settings.onFailure, context)(response, $module);
                  }
                }
                else {
                  $.proxy(settings.onSuccess, context)(response, $module);
                }
              }
              else {
                $.proxy(settings.onSuccess, context)(response, $module);
              }
            },
            error: function(xhr, status, httpMessage) {
              var
                errorMessage = (settings.error[status] !== undefined)
                  ? settings.error[status]
                  : httpMessage,
                response
              ;
              // let em know unless request aborted
              if(xhr !== undefined) {
                // readyState 4 = done, anything less is not really sent
                if(xhr.readyState !== undefined && xhr.readyState == 4) {

                  // if http status code returned and json returned error, look for it
                  if( xhr.status != 200 && httpMessage !== undefined && httpMessage !== '') {
                    module.error(error.statusMessage + httpMessage);
                  }
                  else {
                    if(status == 'error' && settings.dataType == 'json') {
                      try {
                        response = $.parseJSON(xhr.responseText);
                        if(response && response.error !== undefined) {
                          errorMessage = response.error;
                        }
                      }
                      catch(e) {
                        module.error(error.JSONParse);
                      }
                    }
                  }
                  module.remove.loading();
                  module.set.error();
                  // show error state only for duration specified in settings
                  if(settings.errorDuration) {
                    setTimeout(module.remove.error, settings.errorDuration);
                  }
                  module.debug('API Request error:', errorMessage);
                  $.proxy(settings.onError, context)(errorMessage, context);
                }
                else {
                  $.proxy(settings.onAbort, context)(errorMessage, context);
                  module.debug('Request Aborted (Most likely caused by page change or CORS Policy)', status, httpMessage);
                }
              }
            }
          }
        },

        create: {
          request: function() {
            return $.Deferred()
              .always(module.event.request.complete)
              .done(module.event.request.done)
              .fail(module.event.request.error)
            ;
          },
          xhr: function() {
            $.ajax(ajaxSettings)
              .always(module.event.xhr.always)
              .done(module.event.xhr.done)
              .fail(module.event.xhr.fail)
            ;
          }
        },

        set: {
          error: function() {
            module.verbose('Adding error state to element', $context);
            $context.addClass(className.error);
          },
          loading: function() {
            module.verbose('Adding loading state to element', $context);
            $context.addClass(className.loading);
          }
        },

        remove: {
          error: function() {
            module.verbose('Removing error state from element', $context);
            $context.removeClass(className.error);
          },
          loading: function() {
            module.verbose('Removing loading state from element', $context);
            $context.removeClass(className.loading);
          }
        },

        get: {
          request: function() {
            return module.request || false;
          },
          xhr: function() {
            return module.xhr || false;
          },
          settings: function() {
            var
              runSettings
            ;
            runSettings = $.proxy(settings.beforeSend, $module)(settings);
            if(runSettings) {
              if(runSettings.success !== undefined) {
                module.debug('Legacy success callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.success);
                runSettings.onSuccess = runSettings.success;
              }
              if(runSettings.failure !== undefined) {
                module.debug('Legacy failure callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.failure);
                runSettings.onFailure = runSettings.failure;
              }
              if(runSettings.complete !== undefined) {
                module.debug('Legacy complete callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.complete);
                runSettings.onComplete = runSettings.complete;
              }
            }
            if(runSettings === undefined) {
              module.error(error.noReturnedValue);
            }
            return (runSettings !== undefined)
              ? runSettings
              : settings
            ;
          },
          defaultData: function() {
            var
              data = {}
            ;
            if( !$.isWindow(element) ) {
              if( $module.is('input') ) {
                data.value = $module.val();
              }
              else if( $module.is('form') ) {

              }
              else {
                data.text = $module.text();
              }
            }
            return data;
          },
          event: function() {
            if( $.isWindow(element) || settings.on == 'now' ) {
              module.debug('API called without element, no events attached');
              return false;
            }
            else if(settings.on == 'auto') {
              if( $module.is('input') ) {
                return (element.oninput !== undefined)
                  ? 'input'
                  : (element.onpropertychange !== undefined)
                    ? 'propertychange'
                    : 'keyup'
                ;
              }
              else if( $module.is('form') ) {
                return 'submit';
              }
              else {
                return 'click';
              }
            }
            else {
              return settings.on;
            }
          },
          formData: function() {
            var
              formData
            ;
            if($(this).serializeObject() !== undefined) {
              formData = $form.serializeObject();
            }
            else {
              module.error(error.missingSerialize);
              formData = $form.serialize();
            }
            module.debug('Retrieved form data', formData);
            return formData;
          },
          templateURL: function(action) {
            var
              url
            ;
            action = action || $module.data(settings.metadata.action) || settings.action || false;
            if(action) {
              module.debug('Looking up url for action', action, settings.api);
              if(settings.api[action] !== undefined) {
                url = settings.api[action];
                module.debug('Found template url', url);
              }
              else {
                module.error(error.missingAction, settings.action, settings.api);
              }
            }
            return url;
          }
        },

        // reset state
        reset: function() {
          module.remove.error();
          module.remove.loading();
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                //'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.api.settings = {

  name            : 'API',
  namespace       : 'api',

  debug           : true,
  verbose         : true,
  performance     : true,

  // event binding
  on              : 'auto',
  filter          : '.disabled',
  stateContext    : false,

  // state
  loadingDuration : 0,
  errorDuration   : 2000,

  // templating
  action          : false,
  url             : false,
  base            : '',

  // data
  urlData         : {},

  // ui
  defaultData     : true,
  serializeForm   : false,
  throttle        : 0,

  // jQ ajax
  method          : 'get',
  data            : {},
  dataType        : 'json',

  // callbacks
  beforeSend  : function(settings) { return settings; },
  beforeXHR   : function(xhr) {},

  onSuccess   : function(response, $module) {},
  onComplete  : function(response, $module) {},
  onFailure   : function(errorMessage, $module) {},
  onError     : function(errorMessage, $module) {},
  onAbort     : function(errorMessage, $module) {},

  successTest : false,

  // errors
  error : {
    beforeSend        : 'The before send function has aborted the request',
    error             : 'There was an error with your request',
    exitConditions    : 'API Request Aborted. Exit conditions met',
    JSONParse         : 'JSON could not be parsed during error handling',
    legacyParameters  : 'You are using legacy API success callback names',
    method            : 'The method you called is not defined',
    missingAction     : 'API action used but no url was defined',
    missingSerialize  : 'Required dependency jquery-serialize-object missing, using basic serialize',
    missingURL        : 'No URL specified for api event',
    noReturnedValue   : 'The beforeSend callback must return a settings object, beforeSend ignored.',
    parseError        : 'There was an error parsing your request',
    requiredParameter : 'Missing a required URL parameter: ',
    statusMessage     : 'Server gave an error: ',
    timeout           : 'Your request timed out'
  },

  regExp  : {
    required: /\{\$*[A-z0-9]+\}/g,
    optional: /\{\/\$*[A-z0-9]+\}/g,
  },

  className: {
    loading : 'loading',
    error   : 'error'
  },

  selector: {
    form: 'form'
  },

  metadata: {
    action  : 'action',
    request : 'request',
    xhr     : 'xhr'
  }
};


$.api.settings.api = {};


})( jQuery, window , document );
 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,r,t,n){e.api=e.fn.api=function(t){var o,a=e(e.isFunction(this)?r:this),i=a.selector||"",s=(new Date).getTime(),u=[],c=arguments[0],l="string"==typeof c,d=[].slice.call(arguments,1);return a.each(function(){var r,a,f,g,m,p=e.isPlainObject(t)?e.extend(!0,{},e.fn.api.settings,t):e.extend({},e.fn.api.settings),b=p.namespace,v=(p.metadata,p.selector),h=p.error,y=p.className,q="."+b,x="module-"+b,D=e(this),T=D.closest(v.form),A=p.stateContext?e(p.stateContext):D,P=this,S=A.get(),R=D.data(x);m={initialize:function(){var e=m.get.event();l||(e?(m.debug("Attaching API events to element",e),D.on(e+q,m.event.trigger)):m.query()),m.instantiate()},instantiate:function(){m.verbose("Storing instance of module",m),R=m,D.data(x,R)},destroy:function(){m.verbose("Destroying previous module for",P),D.removeData(x).off(q)},query:function(){if(m.is.disabled())return void m.debug("Element is disabled API request aborted");if(m.is.loading()&&0===p.throttle)return void m.debug("Cancelling request, previous request is still pending");if(p.defaultData&&e.extend(!0,p.urlData,m.get.defaultData()),(p.serializeForm!==!1||A.is("form"))&&("json"==p.serializeForm?e.extend(!0,p.data,m.get.formData()):p.data=m.get.formData()),a=m.get.settings(),a===!1)return void m.error(h.beforeSend);if(p.url?(m.debug("Using specified url",f),f=m.add.urlData(p.url)):(f=m.add.urlData(m.get.templateURL()),m.debug("Added URL Data to url",f)),!f){if(!D.is("form"))return void m.error(h.missingURL,p.action);m.debug("No url or action specified, defaulting to form action"),f=D.attr("action")}m.set.loading(),r=e.extend(!0,{},p,{type:p.method||p.type,data:g,url:p.base+f,beforeSend:p.beforeXHR,success:function(){},failure:function(){},complete:function(){}}),m.verbose("Creating AJAX request with settings",r),m.is.loading()?m.timer=setTimeout(function(){m.request=m.create.request(),m.xhr=m.create.xhr()},p.throttle):(m.request=m.create.request(),m.xhr=m.create.xhr())},is:{disabled:function(){return D.filter(p.filter).size()>0},loading:function(){return m.request&&"pending"==m.request.state()}},was:{succesful:function(){return m.request&&"resolved"==m.request.state()},failure:function(){return m.request&&"rejected"==m.request.state()},complete:function(){return m.request&&("resolved"==m.request.state()||"rejected"==m.request.state())}},add:{urlData:function(r,t){var o,a;return r&&(o=r.match(p.regExp.required),a=r.match(p.regExp.optional),t=t||p.urlData,o&&(m.debug("Looking for required URL variables",o),e.each(o,function(o,a){var i=-1!==a.indexOf("$")?a.substr(2,a.length-3):a.substr(1,a.length-2),s=e.isPlainObject(t)&&t[i]!==n?t[i]:D.data(i)!==n?D.data(i):A.data(i)!==n?A.data(i):t[i];return s===n?(m.error(h.requiredParameter,i,r),r=!1,!1):(m.verbose("Found required variable",i,s),void(r=r.replace(a,s)))})),a&&(m.debug("Looking for optional URL variables",o),e.each(a,function(o,a){var i=-1!==a.indexOf("$")?a.substr(3,a.length-4):a.substr(2,a.length-3),s=e.isPlainObject(t)&&t[i]!==n?t[i]:D.data(i)!==n?D.data(i):A.data(i)!==n?A.data(i):t[i];s!==n?(m.verbose("Optional variable Found",i,s),r=r.replace(a,s)):(m.verbose("Optional variable not found",i),r=-1!==r.indexOf("/"+a)?r.replace("/"+a,""):r.replace(a,""))}))),r}},event:{trigger:function(e){m.query(),("submit"==e.type||"click"==e.type)&&e.preventDefault()},xhr:{always:function(){},done:function(e){var r=this,t=(new Date).getTime()-s,n=p.loadingDuration-t;n=n>0?n:0,setTimeout(function(){m.request.resolveWith(r,[e])},n)},fail:function(e,r,t){var n=this,o=(new Date).getTime()-s,a=p.loadingDuration-o;a=a>0?a:0,setTimeout(function(){"abort"!==r?m.request.rejectWith(n,[e,r,t]):m.reset()},a)}},request:{complete:function(r){m.remove.loading(),e.proxy(p.onComplete,S)(r,D)},done:function(r){m.debug("API Response Received",r),"json"==p.dataType&&e.isFunction(p.successTest)?(m.debug("Checking JSON returned success",p.successTest,r),p.successTest(r)?e.proxy(p.onSuccess,S)(r,D):(m.debug("JSON test specified by user and response failed",r),e.proxy(p.onFailure,S)(r,D))):e.proxy(p.onSuccess,S)(r,D)},error:function(r,t,o){var a,i=p.error[t]!==n?p.error[t]:o;if(r!==n)if(r.readyState!==n&&4==r.readyState){if(200!=r.status&&o!==n&&""!==o)m.error(h.statusMessage+o);else if("error"==t&&"json"==p.dataType)try{a=e.parseJSON(r.responseText),a&&a.error!==n&&(i=a.error)}catch(s){m.error(h.JSONParse)}m.remove.loading(),m.set.error(),p.errorDuration&&setTimeout(m.remove.error,p.errorDuration),m.debug("API Request error:",i),e.proxy(p.onError,S)(i,S)}else e.proxy(p.onAbort,S)(i,S),m.debug("Request Aborted (Most likely caused by page change or CORS Policy)",t,o)}}},create:{request:function(){return e.Deferred().always(m.event.request.complete).done(m.event.request.done).fail(m.event.request.error)},xhr:function(){e.ajax(r).always(m.event.xhr.always).done(m.event.xhr.done).fail(m.event.xhr.fail)}},set:{error:function(){m.verbose("Adding error state to element",A),A.addClass(y.error)},loading:function(){m.verbose("Adding loading state to element",A),A.addClass(y.loading)}},remove:{error:function(){m.verbose("Removing error state from element",A),A.removeClass(y.error)},loading:function(){m.verbose("Removing loading state from element",A),A.removeClass(y.loading)}},get:{request:function(){return m.request||!1},xhr:function(){return m.xhr||!1},settings:function(){var r;return r=e.proxy(p.beforeSend,D)(p),r&&(r.success!==n&&(m.debug("Legacy success callback detected",r),m.error(h.legacyParameters,r.success),r.onSuccess=r.success),r.failure!==n&&(m.debug("Legacy failure callback detected",r),m.error(h.legacyParameters,r.failure),r.onFailure=r.failure),r.complete!==n&&(m.debug("Legacy complete callback detected",r),m.error(h.legacyParameters,r.complete),r.onComplete=r.complete)),r===n&&m.error(h.noReturnedValue),r!==n?r:p},defaultData:function(){var r={};return e.isWindow(P)||(D.is("input")?r.value=D.val():D.is("form")||(r.text=D.text())),r},event:function(){return e.isWindow(P)||"now"==p.on?(m.debug("API called without element, no events attached"),!1):"auto"==p.on?D.is("input")?P.oninput!==n?"input":P.onpropertychange!==n?"propertychange":"keyup":D.is("form")?"submit":"click":p.on},formData:function(){var r;return e(this).serializeObject()!==n?r=T.serializeObject():(m.error(h.missingSerialize),r=T.serialize()),m.debug("Retrieved form data",r),r},templateURL:function(e){var r;return e=e||D.data(p.metadata.action)||p.action||!1,e&&(m.debug("Looking up url for action",e,p.api),p.api[e]!==n?(r=p.api[e],m.debug("Found template url",r)):m.error(h.missingAction,p.action,p.api)),r}},reset:function(){m.remove.error(),m.remove.loading()},setting:function(r,t){if(m.debug("Changing setting",r,t),e.isPlainObject(r))e.extend(!0,p,r);else{if(t===n)return p[r];p[r]=t}},internal:function(r,t){if(e.isPlainObject(r))e.extend(!0,m,r);else{if(t===n)return m[r];m[r]=t}},debug:function(){p.debug&&(p.performance?m.performance.log(arguments):(m.debug=Function.prototype.bind.call(console.info,console,p.name+":"),m.debug.apply(console,arguments)))},verbose:function(){p.verbose&&p.debug&&(p.performance?m.performance.log(arguments):(m.verbose=Function.prototype.bind.call(console.info,console,p.name+":"),m.verbose.apply(console,arguments)))},error:function(){m.error=Function.prototype.bind.call(console.error,console,p.name+":"),m.error.apply(console,arguments)},performance:{log:function(e){var r,t,n;p.performance&&(r=(new Date).getTime(),n=s||r,t=r-n,s=r,u.push({Name:e[0],Arguments:[].slice.call(e,1)||"","Execution Time":t})),clearTimeout(m.performance.timer),m.performance.timer=setTimeout(m.performance.display,100)},display:function(){var r=p.name+":",t=0;s=!1,clearTimeout(m.performance.timer),e.each(u,function(e,r){t+=r["Execution Time"]}),r+=" "+t+"ms",i&&(r+=" '"+i+"'"),(console.group!==n||console.table!==n)&&u.length>0&&(console.groupCollapsed(r),console.table?console.table(u):e.each(u,function(e,r){console.log(r.Name+": "+r["Execution Time"]+"ms")}),console.groupEnd()),u=[]}},invoke:function(r,t,a){var i,s,u,c=R;return t=t||d,a=P||a,"string"==typeof r&&c!==n&&(r=r.split(/[\. ]/),i=r.length-1,e.each(r,function(t,o){var a=t!=i?o+r[t+1].charAt(0).toUpperCase()+r[t+1].slice(1):r;if(e.isPlainObject(c[a])&&t!=i)c=c[a];else{if(c[a]!==n)return s=c[a],!1;if(!e.isPlainObject(c[o])||t==i)return c[o]!==n?(s=c[o],!1):(m.error(h.method,r),!1);c=c[o]}})),e.isFunction(s)?u=s.apply(a,t):s!==n&&(u=s),e.isArray(o)?o.push(u):o!==n?o=[o,u]:u!==n&&(o=u),s}},l?(R===n&&m.initialize(),m.invoke(c)):(R!==n&&m.destroy(),m.initialize())}),o!==n?o:this},e.api.settings={name:"API",namespace:"api",debug:!0,verbose:!0,performance:!0,on:"auto",filter:".disabled",stateContext:!1,loadingDuration:0,errorDuration:2e3,action:!1,url:!1,base:"",urlData:{},defaultData:!0,serializeForm:!1,throttle:0,method:"get",data:{},dataType:"json",beforeSend:function(e){return e},beforeXHR:function(){},onSuccess:function(){},onComplete:function(){},onFailure:function(){},onError:function(){},onAbort:function(){},successTest:!1,error:{beforeSend:"The before send function has aborted the request",error:"There was an error with your request",exitConditions:"API Request Aborted. Exit conditions met",JSONParse:"JSON could not be parsed during error handling",legacyParameters:"You are using legacy API success callback names",method:"The method you called is not defined",missingAction:"API action used but no url was defined",missingSerialize:"Required dependency jquery-serialize-object missing, using basic serialize",missingURL:"No URL specified for api event",noReturnedValue:"The beforeSend callback must return a settings object, beforeSend ignored.",parseError:"There was an error parsing your request",requiredParameter:"Missing a required URL parameter: ",statusMessage:"Server gave an error: ",timeout:"Your request timed out"},regExp:{required:/\{\$*[A-z0-9]+\}/g,optional:/\{\/\$*[A-z0-9]+\}/g},className:{loading:"loading",error:"error"},selector:{form:"form"},metadata:{action:"action",request:"request",xhr:"xhr"}},e.api.settings.api={}}(jQuery,window,document);
/*
 * # Semantic - Checkbox
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.checkbox = function(parameters) {
  var
    $allModules    = $(this),
    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.checkbox.settings, parameters),

        className       = settings.className,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $label          = $(this).find(selector.label).first(),
        $input          = $(this).find(selector.input),

        instance        = $module.data(moduleNamespace),

        observer,
        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing checkbox', settings);

          module.create.label();
          module.add.events();

          if( module.is.checked() ) {
            module.set.checked();
            if(settings.fireOnInit) {
              $.proxy(settings.onChecked, $input.get())();
            }
          }
          else {
            module.remove.checked();
            if(settings.fireOnInit) {
              $.proxy(settings.onUnchecked, $input.get())();
            }
          }
          module.observeChanges();

          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying module');
          module.remove.events();
          $module
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          $module = $(this);
          $label  = $(this).find(selector.label).first();
          $input  = $(this).find(selector.input);
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        attachEvents: function(selector, event) {
          var
            $element = $(selector)
          ;
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if($element.size() > 0) {
            module.debug('Attaching checkbox events to element', selector, event);
            $element
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound);
          }
        },

        event: {
          keydown: function(event) {
            var
              key     = event.which,
              keyCode = {
                enter  : 13,
                escape : 27
              }
            ;
            if( key == keyCode.escape) {
              module.verbose('Escape key pressed blurring field');
              $module
                .blur()
              ;
            }
            if(!event.ctrlKey && key == keyCode.enter) {
              module.verbose('Enter key pressed, toggling checkbox');
              $.proxy(module.toggle, this)();
              event.preventDefault();
            }
          }
        },

        is: {
          radio: function() {
            return $module.hasClass(className.radio);
          },
          checked: function() {
            return $input.prop('checked') !== undefined && $input.prop('checked');
          },
          unchecked: function() {
            return !module.is.checked();
          }
        },

        can: {
          change: function() {
            return !( $module.hasClass(className.disabled) || $module.hasClass(className.readOnly) || $input.prop('disabled') );
          },
          uncheck: function() {
            return (typeof settings.uncheckable === 'boolean')
              ? settings.uncheckable
              : !module.is.radio()
            ;
          }
        },

        set: {
          checked: function() {
            $module.addClass(className.checked);
          },
          tab: function() {
            if( $input.attr('tabindex') === undefined) {
              $input
                .attr('tabindex', 0)
              ;
            }
          }
        },

        create: {
          label: function() {
            if($input.prevAll(selector.label).size() > 0) {
              $input.prev(selector.label).detach().insertAfter($input);
              module.debug('Moving existing label', $label);
            }
            else if( !module.has.label() ) {
              $label = $('<label>').insertAfter($input);
              module.debug('Creating label', $label);
            }
          }
        },

        has: {
          label: function() {
            return ($label.size() > 0);
          }
        },

        add: {
          events: function() {
            module.verbose('Attaching checkbox events');
            $module
              .on('click'   + eventNamespace, module.toggle)
              .on('keydown' + eventNamespace, selector.input, module.event.keydown)
            ;
          }
        },

        remove: {
          checked: function() {
            $module.removeClass(className.checked);
          },
          events: function() {
            module.debug('Removing events');
            $module
              .off(eventNamespace)
              .removeData(moduleNamespace)
            ;
            $input
              .off(eventNamespace, module.event.keydown)
            ;
            $label
              .off(eventNamespace)
            ;
          }
        },

        enable: function() {
          module.debug('Enabling checkbox functionality');
          $module.removeClass(className.disabled);
          $input.prop('disabled', false);
          $.proxy(settings.onEnabled, $input.get())();
        },

        disable: function() {
          module.debug('Disabling checkbox functionality');
          $module.addClass(className.disabled);
          $input.prop('disabled', 'disabled');
          $.proxy(settings.onDisabled, $input.get())();
        },

        check: function() {
          module.debug('Enabling checkbox', $input);
          $input
            .prop('checked', true)
            .trigger('change')
          ;
          module.set.checked();
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onChecked, $input.get())();
        },

        uncheck: function() {
          module.debug('Disabling checkbox');
          $input
            .prop('checked', false)
            .trigger('change')
          ;
          module.remove.checked();
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onUnchecked, $input.get())();
        },

        toggle: function(event) {
          if( !module.can.change() ) {
            console.log(module.can.change());
            module.debug('Checkbox is read-only or disabled, ignoring toggle');
            return;
          }
          module.verbose('Determining new checkbox state');
          if( module.is.unchecked() ) {
            module.check();
          }
          else if( module.is.checked() && module.can.uncheck() ) {
            module.uncheck();
          }
        },
        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.checkbox.settings = {

  name        : 'Checkbox',
  namespace   : 'checkbox',

  debug       : false,
  verbose     : true,
  performance : true,

  // delegated event context
  uncheckable : 'auto',
  fireOnInit  : true,

  onChange    : function(){},
  onChecked   : function(){},
  onUnchecked : function(){},
  onEnabled   : function(){},
  onDisabled  : function(){},

  className   : {
    checked  : 'checked',
    disabled : 'disabled',
    radio    : 'radio',
    readOnly : 'read-only'
  },

  error     : {
    method   : 'The method you called is not defined'
  },

  selector : {
    input  : 'input[type=checkbox], input[type=radio]',
    label  : 'label'
  }

};

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,n,o,t){"use strict";e.fn.checkbox=function(o){var c,i=e(this),r=i.selector||"",a=(new Date).getTime(),s=[],l=arguments[0],u="string"==typeof l,d=[].slice.call(arguments,1);return i.each(function(){var i,b,g=e.extend(!0,{},e.fn.checkbox.settings,o),h=g.className,f=g.namespace,p=g.selector,m=g.error,k="."+f,v="module-"+f,y=e(this),x=e(this).find(p.label).first(),C=e(this).find(p.input),D=y.data(v),E=this;b={initialize:function(){b.verbose("Initializing checkbox",g),b.create.label(),b.add.events(),b.is.checked()?(b.set.checked(),g.fireOnInit&&e.proxy(g.onChecked,C.get())()):(b.remove.checked(),g.fireOnInit&&e.proxy(g.onUnchecked,C.get())()),b.observeChanges(),b.instantiate()},instantiate:function(){b.verbose("Storing instance of module",b),D=b,y.data(v,b)},destroy:function(){b.verbose("Destroying module"),b.remove.events(),y.removeData(v)},refresh:function(){y=e(this),x=e(this).find(p.label).first(),C=e(this).find(p.input)},observeChanges:function(){"MutationObserver"in n&&(i=new MutationObserver(function(){b.debug("DOM tree modified, updating selector cache"),b.refresh()}),i.observe(E,{childList:!0,subtree:!0}),b.debug("Setting up mutation observer",i))},attachEvents:function(n,o){var t=e(n);o=e.isFunction(b[o])?b[o]:b.toggle,t.size()>0?(b.debug("Attaching checkbox events to element",n,o),t.on("click"+k,o)):b.error(m.notFound)},event:{keydown:function(n){var o=n.which,t={enter:13,escape:27};o==t.escape&&(b.verbose("Escape key pressed blurring field"),y.blur()),n.ctrlKey||o!=t.enter||(b.verbose("Enter key pressed, toggling checkbox"),e.proxy(b.toggle,this)(),n.preventDefault())}},is:{radio:function(){return y.hasClass(h.radio)},checked:function(){return C.prop("checked")!==t&&C.prop("checked")},unchecked:function(){return!b.is.checked()}},can:{change:function(){return!(y.hasClass(h.disabled)||y.hasClass(h.readOnly)||C.prop("disabled"))},uncheck:function(){return"boolean"==typeof g.uncheckable?g.uncheckable:!b.is.radio()}},set:{checked:function(){y.addClass(h.checked)},tab:function(){C.attr("tabindex")===t&&C.attr("tabindex",0)}},create:{label:function(){C.prevAll(p.label).size()>0?(C.prev(p.label).detach().insertAfter(C),b.debug("Moving existing label",x)):b.has.label()||(x=e("<label>").insertAfter(C),b.debug("Creating label",x))}},has:{label:function(){return x.size()>0}},add:{events:function(){b.verbose("Attaching checkbox events"),y.on("click"+k,b.toggle).on("keydown"+k,p.input,b.event.keydown)}},remove:{checked:function(){y.removeClass(h.checked)},events:function(){b.debug("Removing events"),y.off(k).removeData(v),C.off(k,b.event.keydown),x.off(k)}},enable:function(){b.debug("Enabling checkbox functionality"),y.removeClass(h.disabled),C.prop("disabled",!1),e.proxy(g.onEnabled,C.get())()},disable:function(){b.debug("Disabling checkbox functionality"),y.addClass(h.disabled),C.prop("disabled","disabled"),e.proxy(g.onDisabled,C.get())()},check:function(){b.debug("Enabling checkbox",C),C.prop("checked",!0).trigger("change"),b.set.checked(),e.proxy(g.onChange,C.get())(),e.proxy(g.onChecked,C.get())()},uncheck:function(){b.debug("Disabling checkbox"),C.prop("checked",!1).trigger("change"),b.remove.checked(),e.proxy(g.onChange,C.get())(),e.proxy(g.onUnchecked,C.get())()},toggle:function(){return b.can.change()?(b.verbose("Determining new checkbox state"),void(b.is.unchecked()?b.check():b.is.checked()&&b.can.uncheck()&&b.uncheck())):(console.log(b.can.change()),void b.debug("Checkbox is read-only or disabled, ignoring toggle"))},setting:function(n,o){if(b.debug("Changing setting",n,o),e.isPlainObject(n))e.extend(!0,g,n);else{if(o===t)return g[n];g[n]=o}},internal:function(n,o){if(e.isPlainObject(n))e.extend(!0,b,n);else{if(o===t)return b[n];b[n]=o}},debug:function(){g.debug&&(g.performance?b.performance.log(arguments):(b.debug=Function.prototype.bind.call(console.info,console,g.name+":"),b.debug.apply(console,arguments)))},verbose:function(){g.verbose&&g.debug&&(g.performance?b.performance.log(arguments):(b.verbose=Function.prototype.bind.call(console.info,console,g.name+":"),b.verbose.apply(console,arguments)))},error:function(){b.error=Function.prototype.bind.call(console.error,console,g.name+":"),b.error.apply(console,arguments)},performance:{log:function(e){var n,o,t;g.performance&&(n=(new Date).getTime(),t=a||n,o=n-t,a=n,s.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:E,"Execution Time":o})),clearTimeout(b.performance.timer),b.performance.timer=setTimeout(b.performance.display,100)},display:function(){var n=g.name+":",o=0;a=!1,clearTimeout(b.performance.timer),e.each(s,function(e,n){o+=n["Execution Time"]}),n+=" "+o+"ms",r&&(n+=" '"+r+"'"),(console.group!==t||console.table!==t)&&s.length>0&&(console.groupCollapsed(n),console.table?console.table(s):e.each(s,function(e,n){console.log(n.Name+": "+n["Execution Time"]+"ms")}),console.groupEnd()),s=[]}},invoke:function(n,o,i){var r,a,s,l=D;return o=o||d,i=E||i,"string"==typeof n&&l!==t&&(n=n.split(/[\. ]/),r=n.length-1,e.each(n,function(o,c){var i=o!=r?c+n[o+1].charAt(0).toUpperCase()+n[o+1].slice(1):n;if(e.isPlainObject(l[i])&&o!=r)l=l[i];else{if(l[i]!==t)return a=l[i],!1;if(!e.isPlainObject(l[c])||o==r)return l[c]!==t?(a=l[c],!1):(b.error(m.method,n),!1);l=l[c]}})),e.isFunction(a)?s=a.apply(i,o):a!==t&&(s=a),e.isArray(c)?c.push(s):c!==t?c=[c,s]:s!==t&&(c=s),a}},u?(D===t&&b.initialize(),b.invoke(l)):(D!==t&&b.destroy(),b.initialize())}),c!==t?c:this},e.fn.checkbox.settings={name:"Checkbox",namespace:"checkbox",debug:!1,verbose:!0,performance:!0,uncheckable:"auto",fireOnInit:!0,onChange:function(){},onChecked:function(){},onUnchecked:function(){},onEnabled:function(){},onDisabled:function(){},className:{checked:"checked",disabled:"disabled",radio:"radio",readOnly:"read-only"},error:{method:"The method you called is not defined"},selector:{input:"input[type=checkbox], input[type=radio]",label:"label"}}}(jQuery,window,document);
/*
 * # Semantic - Colorize
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

  "use strict";

  $.fn.colorize = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.colorize.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function(instanceIndex) {

        var
          $module         = $(this),

          mainCanvas      = $('<canvas />')[0],
          imageCanvas     = $('<canvas />')[0],
          overlayCanvas   = $('<canvas />')[0],

          backgroundImage = new Image(),

          // defs
          mainContext,
          imageContext,
          overlayContext,

          image,
          imageName,

          width,
          height,

          // shortucts
          colors    = settings.colors,
          paths     = settings.paths,
          namespace = settings.namespace,
          error     = settings.error,

          // boilerplate
          instance   = $module.data('module-' + namespace),
          module
        ;

        module = {

          checkPreconditions: function() {
            module.debug('Checking pre-conditions');

            if( !$.isPlainObject(colors) || $.isEmptyObject(colors) ) {
              module.error(error.undefinedColors);
              return false;
            }
            return true;
          },

          async: function(callback) {
            if(settings.async) {
              setTimeout(callback, 0);
            }
            else {
              callback();
            }
          },

          getMetadata: function() {
            module.debug('Grabbing metadata');
            image     = $module.data('image') || settings.image || undefined;
            imageName = $module.data('name')  || settings.name  || instanceIndex;
            width     = settings.width        || $module.width();
            height    = settings.height       || $module.height();
            if(width === 0 || height === 0) {
              module.error(error.undefinedSize);
            }
          },

          initialize: function() {
            module.debug('Initializing with colors', colors);
            if( module.checkPreconditions() ) {

              module.async(function() {
                module.getMetadata();
                module.canvas.create();

                module.draw.image(function() {
                  module.draw.colors();
                  module.canvas.merge();
                });
                $module
                  .data('module-' + namespace, module)
                ;
              });
            }
          },

          redraw: function() {
            module.debug('Redrawing image');
            module.async(function() {
              module.canvas.clear();
              module.draw.colors();
              module.canvas.merge();
            });
          },

          change: {
            color: function(colorName, color) {
              module.debug('Changing color', colorName);
              if(colors[colorName] === undefined) {
                module.error(error.missingColor);
                return false;
              }
              colors[colorName] = color;
              module.redraw();
            }
          },

          canvas: {
            create: function() {
              module.debug('Creating canvases');

              mainCanvas.width     = width;
              mainCanvas.height    = height;
              imageCanvas.width    = width;
              imageCanvas.height   = height;
              overlayCanvas.width  = width;
              overlayCanvas.height = height;

              mainContext    = mainCanvas.getContext('2d');
              imageContext   = imageCanvas.getContext('2d');
              overlayContext = overlayCanvas.getContext('2d');

              $module
                .append( mainCanvas )
              ;
              mainContext    = $module.children('canvas')[0].getContext('2d');
            },
            clear: function(context) {
              module.debug('Clearing canvas');
              overlayContext.fillStyle = '#FFFFFF';
              overlayContext.fillRect(0, 0, width, height);
            },
            merge: function() {
              if( !$.isFunction(mainContext.blendOnto) ) {
                module.error(error.missingPlugin);
                return;
              }
              mainContext.putImageData( imageContext.getImageData(0, 0, width, height), 0, 0);
              overlayContext.blendOnto(mainContext, 'multiply');
            }
          },

          draw: {

            image: function(callback) {
              module.debug('Drawing image');
              callback = callback || function(){};
              if(image) {
                backgroundImage.src    = image;
                backgroundImage.onload = function() {
                  imageContext.drawImage(backgroundImage, 0, 0);
                  callback();
                };
              }
              else {
                module.error(error.noImage);
                callback();
              }
            },

            colors: function() {
              module.debug('Drawing color overlays', colors);
              $.each(colors, function(colorName, color) {
                settings.onDraw(overlayContext, imageName, colorName, color);
              });
            }

          },

          debug: function(message, variableName) {
            if(settings.debug) {
              if(variableName !== undefined) {
                console.info(settings.name + ': ' + message, variableName);
              }
              else {
                console.info(settings.name + ': ' + message);
              }
            }
          },
          error: function(errorMessage) {
            console.warn(settings.name + ': ' + errorMessage);
          },
          invoke: function(methodName, context, methodArguments) {
            var
              method
            ;
            methodArguments = methodArguments || Array.prototype.slice.call( arguments, 2 );

            if(typeof methodName == 'string' && instance !== undefined) {
              methodName = methodName.split('.');
              $.each(methodName, function(index, name) {
                if( $.isPlainObject( instance[name] ) ) {
                  instance = instance[name];
                  return true;
                }
                else if( $.isFunction( instance[name] ) ) {
                  method = instance[name];
                  return true;
                }
                module.error(settings.error.method);
                return false;
              });
            }
            return ( $.isFunction( method ) )
              ? method.apply(context, methodArguments)
              : false
            ;
          }

        };
        if(instance !== undefined && moduleArguments) {
          // simpler than invoke realizing to invoke itself (and losing scope due prototype.call()
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // initializing
        module.initialize();
      })
    ;
    return this;
  };

  $.fn.colorize.settings = {
    name      : 'Image Colorizer',
    debug     : true,
    namespace : 'colorize',

    onDraw    : function(overlayContext, imageName, colorName, color) {},

    // whether to block execution while updating canvas
    async     : true,
    // object containing names and default values of color regions
    colors    : {},

    metadata: {
      image : 'image',
      name  : 'name'
    },

    error: {
      noImage         : 'No tracing image specified',
      undefinedColors : 'No default colors specified.',
      missingColor    : 'Attempted to change color that does not exist',
      missingPlugin   : 'Blend onto plug-in must be included',
      undefinedHeight : 'The width or height of image canvas could not be automatically determined. Please specify a height.'
    }

  };

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,n,i,t){"use strict";e.fn.colorize=function(n){var i=e.extend(!0,{},e.fn.colorize.settings,n),a=arguments||!1;return e(this).each(function(n){var o,r,c,s,d,g,u,l,m=e(this),f=e("<canvas />")[0],h=e("<canvas />")[0],p=e("<canvas />")[0],v=new Image,w=i.colors,b=(i.paths,i.namespace),y=i.error,C=m.data("module-"+b);return l={checkPreconditions:function(){return l.debug("Checking pre-conditions"),!e.isPlainObject(w)||e.isEmptyObject(w)?(l.error(y.undefinedColors),!1):!0},async:function(e){i.async?setTimeout(e,0):e()},getMetadata:function(){l.debug("Grabbing metadata"),s=m.data("image")||i.image||t,d=m.data("name")||i.name||n,g=i.width||m.width(),u=i.height||m.height(),(0===g||0===u)&&l.error(y.undefinedSize)},initialize:function(){l.debug("Initializing with colors",w),l.checkPreconditions()&&l.async(function(){l.getMetadata(),l.canvas.create(),l.draw.image(function(){l.draw.colors(),l.canvas.merge()}),m.data("module-"+b,l)})},redraw:function(){l.debug("Redrawing image"),l.async(function(){l.canvas.clear(),l.draw.colors(),l.canvas.merge()})},change:{color:function(e,n){return l.debug("Changing color",e),w[e]===t?(l.error(y.missingColor),!1):(w[e]=n,void l.redraw())}},canvas:{create:function(){l.debug("Creating canvases"),f.width=g,f.height=u,h.width=g,h.height=u,p.width=g,p.height=u,o=f.getContext("2d"),r=h.getContext("2d"),c=p.getContext("2d"),m.append(f),o=m.children("canvas")[0].getContext("2d")},clear:function(){l.debug("Clearing canvas"),c.fillStyle="#FFFFFF",c.fillRect(0,0,g,u)},merge:function(){return e.isFunction(o.blendOnto)?(o.putImageData(r.getImageData(0,0,g,u),0,0),void c.blendOnto(o,"multiply")):void l.error(y.missingPlugin)}},draw:{image:function(e){l.debug("Drawing image"),e=e||function(){},s?(v.src=s,v.onload=function(){r.drawImage(v,0,0),e()}):(l.error(y.noImage),e())},colors:function(){l.debug("Drawing color overlays",w),e.each(w,function(e,n){i.onDraw(c,d,e,n)})}},debug:function(e,n){i.debug&&(n!==t?console.info(i.name+": "+e,n):console.info(i.name+": "+e))},error:function(e){console.warn(i.name+": "+e)},invoke:function(n,a,o){var r;return o=o||Array.prototype.slice.call(arguments,2),"string"==typeof n&&C!==t&&(n=n.split("."),e.each(n,function(n,t){return e.isPlainObject(C[t])?(C=C[t],!0):e.isFunction(C[t])?(r=C[t],!0):(l.error(i.error.method),!1)})),e.isFunction(r)?r.apply(a,o):!1}},C!==t&&a?("invoke"==a[0]&&(a=Array.prototype.slice.call(a,1)),l.invoke(a[0],this,Array.prototype.slice.call(a,1))):void l.initialize()}),this},e.fn.colorize.settings={name:"Image Colorizer",debug:!0,namespace:"colorize",onDraw:function(){},async:!0,colors:{},metadata:{image:"image",name:"name"},error:{noImage:"No tracing image specified",undefinedColors:"No default colors specified.",missingColor:"Attempted to change color that does not exist",missingPlugin:"Blend onto plug-in must be included",undefinedHeight:"The width or height of image canvas could not be automatically determined. Please specify a height."}}}(jQuery,window,document);
/*
 * # Semantic - Dimmer
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.dimmer = function(parameters) {
  var
    $allModules     = $(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.dimmer.settings, parameters)
          : $.extend({}, $.fn.dimmer.settings),

        selector        = settings.selector,
        namespace       = settings.namespace,
        className       = settings.className,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        clickEvent      = ('ontouchstart' in document.documentElement)
          ? 'touchstart'
          : 'click',

        $module = $(this),
        $dimmer,
        $dimmable,

        element   = this,
        instance  = $module.data(moduleNamespace),
        module
      ;

      module = {

        preinitialize: function() {
          if( module.is.dimmer() ) {
            $dimmable = $module.parent();
            $dimmer   = $module;
          }
          else {
            $dimmable = $module;
            if( module.has.dimmer() ) {
              if(settings.dimmerName) {
                $dimmer = $dimmable.children(selector.dimmer).filter('.' + settings.dimmerName);
              }
              else {
                $dimmer = $dimmable.children(selector.dimmer);
              }
            }
            else {
              $dimmer = module.create();
            }
          }
        },

        initialize: function() {
          module.debug('Initializing dimmer', settings);
          if(settings.on == 'hover') {
            $dimmable
              .on('mouseenter' + eventNamespace, module.show)
              .on('mouseleave' + eventNamespace, module.hide)
            ;
          }
          else if(settings.on == 'click') {
            $dimmable
              .on(clickEvent + eventNamespace, module.toggle)
            ;
          }
          if( module.is.page() ) {
            module.debug('Setting as a page dimmer', $dimmable);
            module.set.pageDimmer();
          }

          if( module.is.closable() ) {
            module.verbose('Adding dimmer close event', $dimmer);
            $dimmer
              .on(clickEvent + eventNamespace, module.event.click)
            ;
          }
          module.set.dimmable();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', $dimmer);
          $module
            .removeData(moduleNamespace)
          ;
          $dimmable
            .off(eventNamespace)
          ;
          $dimmer
            .off(eventNamespace)
          ;
        },

        event: {
          click: function(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if( $dimmer.find(event.target).size() === 0 || $(event.target).is(selector.content) ) {
              module.hide();
              event.stopImmediatePropagation();
            }
          }
        },

        addContent: function(element) {
          var
            $content = $(element)
          ;
          module.debug('Add content to dimmer', $content);
          if($content.parent()[0] !== $dimmer[0]) {
            $content.detach().appendTo($dimmer);
          }
        },

        create: function() {
          var
            $element = $( settings.template.dimmer() )
          ;
          if(settings.variation) {
            module.debug('Creating dimmer with variation', settings.variation);
            $element.addClass(className.variation);
          }
          if(settings.dimmerName) {
            module.debug('Creating named dimmer', settings.dimmerName);
            $element.addClass(settings.dimmerName);
          }
          $element
            .appendTo($dimmable)
          ;
          return $element;
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Showing dimmer', $dimmer, settings);
          if( (!module.is.dimmed() || module.is.animating()) && module.is.enabled() ) {
            module.animate.show(callback);
            $.proxy(settings.onShow, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.dimmed() || module.is.animating() ) {
            module.debug('Hiding dimmer', $dimmer);
            module.animate.hide(callback);
            $.proxy(settings.onHide, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is not visible');
          }
        },

        toggle: function() {
          module.verbose('Toggling dimmer visibility', $dimmer);
          if( !module.is.dimmed() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        animate: {
          show: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              $dimmer
                .transition({
                  animation : settings.transition + ' in',
                  queue       : false,
                  duration  : module.get.duration(),
                  onStart   : function() {
                    module.set.dimmed();
                  },
                  onComplete : function() {
                    module.set.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Showing dimmer animation with javascript');
              module.set.dimmed();
              $dimmer
                .stop()
                .css({
                  opacity : 0,
                  width   : '100%',
                  height  : '100%'
                })
                .fadeTo(module.get.duration(), 1, function() {
                  $dimmer.removeAttr('style');
                  module.set.active();
                  callback();
                })
              ;
            }
          },
          hide: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              module.verbose('Hiding dimmer with css');
              $dimmer
                .transition({
                  animation  : settings.transition + ' out',
                  queue      : false,
                  duration   : module.get.duration(),
                  onStart    : function() {
                    module.remove.dimmed();
                  },
                  onComplete : function() {
                    module.remove.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Hiding dimmer with javascript');
              module.remove.dimmed();
              $dimmer
                .stop()
                .fadeOut(module.get.duration(), function() {
                  module.remove.active();
                  $dimmer.removeAttr('style');
                  callback();
                })
              ;
            }
          }
        },

        get: {
          dimmer: function() {
            return $dimmer;
          },
          duration: function() {
            if(typeof settings.duration == 'object') {
              if( module.is.active() ) {
                return settings.duration.hide;
              }
              else {
                return settings.duration.show;
              }
            }
            return settings.duration;
          }
        },

        has: {
          dimmer: function() {
            if(settings.dimmerName) {
              return ($module.children(selector.dimmer).filter('.' + settings.dimmerName).size() > 0);
            }
            else {
              return ( $module.children(selector.dimmer).size() > 0 );
            }
          }
        },

        is: {
          active: function() {
            return $dimmer.hasClass(className.active);
          },
          animating: function() {
            return ( $dimmer.is(':animated') || $dimmer.hasClass(className.animating) );
          },
          closable: function() {
            if(settings.closable == 'auto') {
              if(settings.on == 'hover') {
                return false;
              }
              return true;
            }
            return settings.closable;
          },
          dimmer: function() {
            return $module.is(selector.dimmer);
          },
          dimmable: function() {
            return $module.is(selector.dimmable);
          },
          dimmed: function() {
            return $dimmable.hasClass(className.dimmed);
          },
          disabled: function() {
            return $dimmable.hasClass(className.disabled);
          },
          enabled: function() {
            return !module.is.disabled();
          },
          page: function () {
            return $dimmable.is('body');
          },
          pageDimmer: function() {
            return $dimmer.hasClass(className.pageDimmer);
          }
        },

        can: {
          show: function() {
            return !$dimmer.hasClass(className.disabled);
          }
        },

        set: {
          active: function() {
            $dimmer.addClass(className.active);
          },
          dimmable: function() {
            $dimmable.addClass(className.dimmable);
          },
          dimmed: function() {
            $dimmable.addClass(className.dimmed);
          },
          pageDimmer: function() {
            $dimmer.addClass(className.pageDimmer);
          },
          disabled: function() {
            $dimmer.addClass(className.disabled);
          }
        },

        remove: {
          active: function() {
            $dimmer
              .removeClass(className.active)
            ;
          },
          dimmed: function() {
            $dimmable.removeClass(className.dimmed);
          },
          disabled: function() {
            $dimmer.removeClass(className.disabled);
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      module.preinitialize();

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.dimmer.settings = {

  name        : 'Dimmer',
  namespace   : 'dimmer',

  debug       : false,
  verbose     : true,
  performance : true,

  dimmerName  : false,
  variation   : false,
  closable    : 'auto',
  transition  : 'fade',
  useCSS      : true,
  on          : false,

  duration    : {
    show : 500,
    hide : 500
  },

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},

  error   : {
    method   : 'The method you called is not defined.'
  },

  selector: {
    dimmable : '.dimmable',
    dimmer   : '.ui.dimmer',
    content  : '.ui.dimmer > .content, .ui.dimmer > .content > .center'
  },

  template: {
    dimmer: function() {
     return $('<div />').attr('class', 'ui dimmer');
    }
  },

  className : {
    active     : 'active',
    animating  : 'animating',
    dimmable   : 'dimmable',
    dimmed     : 'dimmed',
    disabled   : 'disabled',
    hide       : 'hide',
    pageDimmer : 'page',
    show       : 'show'
  }

};

})( jQuery, window , document );
 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,i,n,t){e.fn.dimmer=function(i){var o,a=e(this),r=(new Date).getTime(),m=[],s=arguments[0],d="string"==typeof s,c=[].slice.call(arguments,1);return a.each(function(){var u,l,f,g=e.isPlainObject(i)?e.extend(!0,{},e.fn.dimmer.settings,i):e.extend({},e.fn.dimmer.settings),p=g.selector,b=g.namespace,h=g.className,v=g.error,C="."+b,y="module-"+b,w=a.selector||"",D="ontouchstart"in n.documentElement?"touchstart":"click",S=e(this),T=this,N=S.data(y);f={preinitialize:function(){f.is.dimmer()?(l=S.parent(),u=S):(l=S,u=f.has.dimmer()?g.dimmerName?l.children(p.dimmer).filter("."+g.dimmerName):l.children(p.dimmer):f.create())},initialize:function(){f.debug("Initializing dimmer",g),"hover"==g.on?l.on("mouseenter"+C,f.show).on("mouseleave"+C,f.hide):"click"==g.on&&l.on(D+C,f.toggle),f.is.page()&&(f.debug("Setting as a page dimmer",l),f.set.pageDimmer()),f.is.closable()&&(f.verbose("Adding dimmer close event",u),u.on(D+C,f.event.click)),f.set.dimmable(),f.instantiate()},instantiate:function(){f.verbose("Storing instance of module",f),N=f,S.data(y,N)},destroy:function(){f.verbose("Destroying previous module",u),S.removeData(y),l.off(C),u.off(C)},event:{click:function(i){f.verbose("Determining if event occured on dimmer",i),(0===u.find(i.target).size()||e(i.target).is(p.content))&&(f.hide(),i.stopImmediatePropagation())}},addContent:function(i){var n=e(i);f.debug("Add content to dimmer",n),n.parent()[0]!==u[0]&&n.detach().appendTo(u)},create:function(){var i=e(g.template.dimmer());return g.variation&&(f.debug("Creating dimmer with variation",g.variation),i.addClass(h.variation)),g.dimmerName&&(f.debug("Creating named dimmer",g.dimmerName),i.addClass(g.dimmerName)),i.appendTo(l),i},show:function(i){i=e.isFunction(i)?i:function(){},f.debug("Showing dimmer",u,g),f.is.dimmed()&&!f.is.animating()||!f.is.enabled()?f.debug("Dimmer is already shown or disabled"):(f.animate.show(i),e.proxy(g.onShow,T)(),e.proxy(g.onChange,T)())},hide:function(i){i=e.isFunction(i)?i:function(){},f.is.dimmed()||f.is.animating()?(f.debug("Hiding dimmer",u),f.animate.hide(i),e.proxy(g.onHide,T)(),e.proxy(g.onChange,T)()):f.debug("Dimmer is not visible")},toggle:function(){f.verbose("Toggling dimmer visibility",u),f.is.dimmed()?f.hide():f.show()},animate:{show:function(i){i=e.isFunction(i)?i:function(){},g.useCSS&&e.fn.transition!==t&&u.transition("is supported")?u.transition({animation:g.transition+" in",queue:!1,duration:f.get.duration(),onStart:function(){f.set.dimmed()},onComplete:function(){f.set.active(),i()}}):(f.verbose("Showing dimmer animation with javascript"),f.set.dimmed(),u.stop().css({opacity:0,width:"100%",height:"100%"}).fadeTo(f.get.duration(),1,function(){u.removeAttr("style"),f.set.active(),i()}))},hide:function(i){i=e.isFunction(i)?i:function(){},g.useCSS&&e.fn.transition!==t&&u.transition("is supported")?(f.verbose("Hiding dimmer with css"),u.transition({animation:g.transition+" out",queue:!1,duration:f.get.duration(),onStart:function(){f.remove.dimmed()},onComplete:function(){f.remove.active(),i()}})):(f.verbose("Hiding dimmer with javascript"),f.remove.dimmed(),u.stop().fadeOut(f.get.duration(),function(){f.remove.active(),u.removeAttr("style"),i()}))}},get:{dimmer:function(){return u},duration:function(){return"object"==typeof g.duration?f.is.active()?g.duration.hide:g.duration.show:g.duration}},has:{dimmer:function(){return g.dimmerName?S.children(p.dimmer).filter("."+g.dimmerName).size()>0:S.children(p.dimmer).size()>0}},is:{active:function(){return u.hasClass(h.active)},animating:function(){return u.is(":animated")||u.hasClass(h.animating)},closable:function(){return"auto"==g.closable?"hover"==g.on?!1:!0:g.closable},dimmer:function(){return S.is(p.dimmer)},dimmable:function(){return S.is(p.dimmable)},dimmed:function(){return l.hasClass(h.dimmed)},disabled:function(){return l.hasClass(h.disabled)},enabled:function(){return!f.is.disabled()},page:function(){return l.is("body")},pageDimmer:function(){return u.hasClass(h.pageDimmer)}},can:{show:function(){return!u.hasClass(h.disabled)}},set:{active:function(){u.addClass(h.active)},dimmable:function(){l.addClass(h.dimmable)},dimmed:function(){l.addClass(h.dimmed)},pageDimmer:function(){u.addClass(h.pageDimmer)},disabled:function(){u.addClass(h.disabled)}},remove:{active:function(){u.removeClass(h.active)},dimmed:function(){l.removeClass(h.dimmed)},disabled:function(){u.removeClass(h.disabled)}},setting:function(i,n){if(f.debug("Changing setting",i,n),e.isPlainObject(i))e.extend(!0,g,i);else{if(n===t)return g[i];g[i]=n}},internal:function(i,n){if(e.isPlainObject(i))e.extend(!0,f,i);else{if(n===t)return f[i];f[i]=n}},debug:function(){g.debug&&(g.performance?f.performance.log(arguments):(f.debug=Function.prototype.bind.call(console.info,console,g.name+":"),f.debug.apply(console,arguments)))},verbose:function(){g.verbose&&g.debug&&(g.performance?f.performance.log(arguments):(f.verbose=Function.prototype.bind.call(console.info,console,g.name+":"),f.verbose.apply(console,arguments)))},error:function(){f.error=Function.prototype.bind.call(console.error,console,g.name+":"),f.error.apply(console,arguments)},performance:{log:function(e){var i,n,t;g.performance&&(i=(new Date).getTime(),t=r||i,n=i-t,r=i,m.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:T,"Execution Time":n})),clearTimeout(f.performance.timer),f.performance.timer=setTimeout(f.performance.display,100)},display:function(){var i=g.name+":",n=0;r=!1,clearTimeout(f.performance.timer),e.each(m,function(e,i){n+=i["Execution Time"]}),i+=" "+n+"ms",w&&(i+=" '"+w+"'"),a.size()>1&&(i+=" ("+a.size()+")"),(console.group!==t||console.table!==t)&&m.length>0&&(console.groupCollapsed(i),console.table?console.table(m):e.each(m,function(e,i){console.log(i.Name+": "+i["Execution Time"]+"ms")}),console.groupEnd()),m=[]}},invoke:function(i,n,a){var r,m,s,d=N;return n=n||c,a=T||a,"string"==typeof i&&d!==t&&(i=i.split(/[\. ]/),r=i.length-1,e.each(i,function(n,o){var a=n!=r?o+i[n+1].charAt(0).toUpperCase()+i[n+1].slice(1):i;if(e.isPlainObject(d[a])&&n!=r)d=d[a];else{if(d[a]!==t)return m=d[a],!1;if(!e.isPlainObject(d[o])||n==r)return d[o]!==t?(m=d[o],!1):(f.error(v.method,i),!1);d=d[o]}})),e.isFunction(m)?s=m.apply(a,n):m!==t&&(s=m),e.isArray(o)?o.push(s):o!==t?o=[o,s]:s!==t&&(o=s),m}},f.preinitialize(),d?(N===t&&f.initialize(),f.invoke(s)):(N!==t&&f.destroy(),f.initialize())}),o!==t?o:this},e.fn.dimmer.settings={name:"Dimmer",namespace:"dimmer",debug:!1,verbose:!0,performance:!0,dimmerName:!1,variation:!1,closable:"auto",transition:"fade",useCSS:!0,on:!1,duration:{show:500,hide:500},onChange:function(){},onShow:function(){},onHide:function(){},error:{method:"The method you called is not defined."},selector:{dimmable:".dimmable",dimmer:".ui.dimmer",content:".ui.dimmer > .content, .ui.dimmer > .content > .center"},template:{dimmer:function(){return e("<div />").attr("class","ui dimmer")}},className:{active:"active",animating:"animating",dimmable:"dimmable",dimmed:"dimmed",disabled:"disabled",hide:"hide",pageDimmer:"page",show:"show"}}}(jQuery,window,document);
/*
 * # Semantic - Dropdown
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.dropdown = function(parameters) {
  var
    $allModules    = $(this),
    $document      = $(document),

    moduleSelector = $allModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.dropdown.settings, parameters)
          : $.extend({}, $.fn.dropdown.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $text           = $module.find(selector.text),
        $search         = $module.find(selector.search),
        $input          = $module.find(selector.input),

        $combo = ($module.prev().find(selector.text).size() > 0)
          ? $module.prev().find(selector.text)
          : $module.prev(),

        $menu           = $module.children(selector.menu),
        $item           = $menu.find(selector.item),

        activated       = false,
        itemActivated   = false,
        element         = this,
        instance        = $module.data(moduleNamespace),

        elementNamespace,
        id,
        observer,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);
          module.setup.layout();
          module.save.defaults();
          module.set.selected();

          module.create.id();

          if(hasTouch) {
            module.bind.touchEvents();
          }
          module.bind.mouseEvents();
          module.bind.keyboardEvents();

          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of dropdown', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous dropdown for', $module);
          module.remove.tabbable();
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
          $document
            .off(elementNamespace)
          ;
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        create: {
          id: function() {
            module.verbose('Creating unique id for element');
            id = module.get.uniqueID();
            elementNamespace = '.' + id;
          }
        },

        search: function() {
          var
            query
          ;
          query = $search.val();

          module.verbose('Searching for query', query);

          if(module.is.searchSelection()) {
            module.filter(query);
            if( module.can.show() ) {
              module.show();
            }
          }
        },

        setup: {

          layout: function() {
            if( $module.is('select') ) {
              module.setup.select();
            }
            if( module.is.search() && !module.is.searchable() ) {
              $search = $('<input />')
                .addClass(className.search)
                .insertBefore($text)
              ;
            }
            if(settings.allowTab) {
              module.set.tabbable();
            }
          },
          select: function() {
            var
              selectValues = module.get.selectValues()
            ;
            module.debug('Dropdown initialized on a select', selectValues);
            // see if select exists inside a dropdown
            $input = $module;
            if($input.parents(selector.dropdown).size() > 0) {
              module.debug('Creating dropdown menu only from template');
              $module = $input.closest(selector.dropdown);
              if($module.find('.' + className.dropdown).size() === 0) {
                $('<div />')
                  .addClass(className.menu)
                  .html( settings.templates.menu( selectValues ))
                  .appendTo($module)
                ;
              }
            }
            else {
              module.debug('Creating entire dropdown from template');
              $module = $('<div />')
                .attr('class', $input.attr('class') )
                .addClass(className.selection)
                .addClass(className.dropdown)
                .html( settings.templates.dropdown(selectValues) )
                .insertBefore($input)
              ;
              $input
                .removeAttr('class')
                .prependTo($module)
              ;
            }
            module.refresh();
          }
        },

        refresh: function() {
          $text   = $module.find(selector.text);
          $search = $module.find(selector.search);
          $input  = $module.find(selector.input);
          $menu   = $module.children(selector.menu);
          $item   = $menu.find(selector.item);
        },

        toggle: function() {
          module.verbose('Toggling menu visibility');
          if( !module.is.active() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( !module.is.active() && !module.is.allFiltered() ) {
            module.debug('Showing dropdown');
            module.animate.show(function() {
              if( module.can.click() ) {
                module.bind.intent();
              }
              module.set.visible();
              $.proxy(callback, element)();
            });
            $.proxy(settings.onShow, element)();
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.active() ) {
            module.debug('Hiding dropdown');
            module.animate.hide(function() {
              module.remove.visible();
              $.proxy(callback, element)();
            });
            $.proxy(settings.onHide, element)();
          }
        },

        hideOthers: function() {
          module.verbose('Finding other dropdowns to hide');
          $allModules
            .not($module)
              .has(selector.menu + ':visible:not(.' + className.animating + ')')
                .dropdown('hide')
          ;
        },

        hideSubMenus: function() {
          var
            $subMenus = $menu.find(selector.menu)
          ;
          $subMenus.transition('hide');
        },

        bind: {
          keyboardEvents: function() {
            module.debug('Binding keyboard events');
            $module
              .on('keydown' + eventNamespace, module.event.keydown)
            ;
            if( module.is.searchable() ) {
              $module
                .on(module.get.inputEvent(), selector.search, module.event.input)
              ;
            }
          },
          touchEvents: function() {
            module.debug('Touch device detected binding additional touch events');
            if( module.is.searchSelection() ) {
              // do nothing special yet
            }
            else {
              $module
                .on('touchstart' + eventNamespace, module.event.test.toggle)
              ;
            }
            $menu
              .on('touchstart' + eventNamespace, selector.item, module.event.item.mouseenter)
            ;
          },
          mouseEvents: function() {
            module.verbose('Mouse detected binding mouse events');

            if( module.is.searchSelection() ) {
              $module
                .on('mousedown' + eventNamespace, selector.menu, module.event.menu.activate)
                .on('mouseup'   + eventNamespace, selector.menu, module.event.menu.deactivate)
                .on('click'     + eventNamespace, selector.search, module.show)
                .on('focus'     + eventNamespace, selector.search, module.event.searchFocus)
                .on('blur'      + eventNamespace, selector.search, module.event.searchBlur)
              ;
            }
            else {
              if(settings.on == 'click') {
                $module
                  .on('click' + eventNamespace, module.event.test.toggle)
                ;
              }
              else if(settings.on == 'hover') {
                $module
                  .on('mouseenter' + eventNamespace, module.delay.show)
                  .on('mouseleave' + eventNamespace, module.delay.hide)
                ;
              }
              else {
                $module
                  .on(settings.on + eventNamespace, module.toggle)
                ;
              }
              $module
                .on('mousedown' + eventNamespace, module.event.mousedown)
                .on('mouseup'   + eventNamespace, module.event.mouseup)
                .on('focus'     + eventNamespace, module.event.focus)
                .on('blur'      + eventNamespace, module.event.blur)
              ;
            }
            $menu
              .on('mouseenter' + eventNamespace, selector.item, module.event.item.mouseenter)
              .on('mouseleave' + eventNamespace, selector.item, module.event.item.mouseleave)
              .on('click'      + eventNamespace, selector.item, module.event.item.click)
            ;
          },
          intent: function() {
            module.verbose('Binding hide intent event to document');
            if(hasTouch) {
              $document
                .on('touchstart' + elementNamespace, module.event.test.touch)
                .on('touchmove'  + elementNamespace, module.event.test.touch)
              ;
            }
            $document
              .on('click' + elementNamespace, module.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            module.verbose('Removing hide intent event from document');
            if(hasTouch) {
              $document
                .off('touchstart' + elementNamespace)
                .off('touchmove' + elementNamespace)
              ;
            }
            $document
              .off('click' + elementNamespace)
            ;
          }
        },

        filter: function(searchTerm) {
          var
            $results       = $(),
            exactRegExp    = new RegExp('^' + searchTerm, 'igm'),
            fullTextRegExp = new RegExp(searchTerm, 'ig'),
            allItemsFiltered
          ;
          module.verbose('Searching for matching values');
          $item
            .each(function(){
              var
                $choice = $(this),
                text    = module.get.choiceText($choice, false),
                value   = module.get.choiceValue($choice, text)
              ;
              if( exactRegExp.test( text ) || exactRegExp.test( value ) ) {
                $results = $results.add($choice);
              }
              else if(settings.fullTextSearch) {
                if( fullTextRegExp.test( text ) || fullTextRegExp.test( value ) ) {
                  $results = $results.add($choice);
                }
              }
            })
          ;

          module.debug('Setting filter', searchTerm);
          module.remove.filteredItem();
          $item
            .not($results)
            .addClass(className.filtered)
          ;

          module.verbose('Selecting first non-filtered element');
          module.remove.selectedItem();
          $item
            .not('.' + className.filtered)
              .eq(0)
              .addClass(className.selected)
          ;
          if( module.is.allFiltered() ) {
            module.debug('All items filtered, hiding dropdown', searchTerm);
            module.hide();
            $.proxy(settings.onNoResults, element)(searchTerm);
          }
        },

        focusSearch: function() {
          if( module.is.search() ) {
            $search
              .focus()
            ;
          }
        },

        event: {
          // prevents focus callback from occuring on mousedown
          mousedown: function() {
            activated = true;
          },
          mouseup: function() {
            activated = false;
          },
          focus: function() {
            if(!activated && module.is.hidden()) {
              module.show();
            }
          },
          blur: function(event) {
            var
              pageLostFocus = (document.activeElement === this)
            ;
            if(!activated && !pageLostFocus) {
              module.hide();
            }
          },
          searchFocus: function() {
            activated = true;
            module.show();
          },
          searchBlur: function(event) {
            var
              pageLostFocus = (document.activeElement === this)
            ;
            if(!itemActivated && !pageLostFocus) {
              module.hide();
            }
          },
          input: function(event) {
            module.set.filtered();
            clearTimeout(module.timer);
            module.timer = setTimeout(module.search, settings.delay.search);
          },
          keydown: function(event) {
            var
              $selectedItem = $item.not(className.filtered).filter('.' + className.selected).eq(0),
              $visibleItems = $item.not('.' + className.filtered),
              pressedKey    = event.which,
              keys          = {
                enter     : 13,
                escape    : 27,
                upArrow   : 38,
                downArrow : 40
              },
              selectedClass   = className.selected,
              currentIndex    = $visibleItems.index( $selectedItem ),
              hasSelectedItem = ($selectedItem.size() > 0),
              $nextItem,
              newIndex
            ;
            // default to activated choice if no selection present
            if(!hasSelectedItem) {
              $selectedItem   = $item.filter('.' + className.active).eq(0);
              hasSelectedItem = ($selectedItem.size() > 0);
            }
            // close shortcuts
            if(pressedKey == keys.escape) {
              module.verbose('Escape key pressed, closing dropdown');
              module.hide();
            }
            // open menu
            if(pressedKey == keys.downArrow) {
              module.verbose('Down key pressed, showing dropdown');
              module.show();
            }
            // result shortcuts
            if(module.is.visible()) {
              if(pressedKey == keys.enter && hasSelectedItem) {
                module.verbose('Enter key pressed, choosing selected item');
                $.proxy(module.event.item.click, $selectedItem)(event);
                event.preventDefault();
                return false;
              }
              else if(pressedKey == keys.upArrow) {
                if(!hasSelectedItem) {
                  $nextItem = $visibleItems.eq(0);
                }
                else {
                  $nextItem = $selectedItem.prevAll(selector.item + ':not(.' + className.filtered + ')').eq(0);
                }
                if(currentIndex !== 0) {
                  module.verbose('Up key pressed, changing active item');
                  $item
                    .removeClass(selectedClass)
                  ;
                  $nextItem
                    .addClass(selectedClass)
                  ;
                  module.set.scrollPosition($nextItem);
                }
                event.preventDefault();
              }
              else if(pressedKey == keys.downArrow) {
                if(!hasSelectedItem) {
                  $nextItem = $visibleItems.eq(0);
                }
                else {
                  $nextItem = $selectedItem.nextAll(selector.item + ':not(.' + className.filtered + ')').eq(0);
                }
                if(currentIndex + 1 < $visibleItems.size() ) {
                  module.verbose('Down key pressed, changing active item');
                  $item
                    .removeClass(selectedClass)
                  ;
                  $nextItem
                    .addClass(selectedClass)
                  ;
                  module.set.scrollPosition($nextItem);
                }
                event.preventDefault();
              }
            }
            else {
              if(pressedKey == keys.enter) {
                module.show();
              }
            }
          },
          test: {
            toggle: function(event) {
              if( module.determine.eventInMenu(event, module.toggle) ) {
                event.preventDefault();
              }
            },
            touch: function(event) {
              module.determine.eventInMenu(event, function() {
                if(event.type == 'touchstart') {
                  module.timer = setTimeout(module.hide, settings.delay.touch);
                }
                else if(event.type == 'touchmove') {
                  clearTimeout(module.timer);
                }
              });
              event.stopPropagation();
            },
            hide: function(event) {
              module.determine.eventInModule(event, module.hide);
            }
          },

          menu: {
            activate: function() {
              itemActivated = true;
            },
            deactivate: function() {
              itemActivated = false;
            }
          },
          item: {
            mouseenter: function(event) {
              var
                $currentMenu = $(this).children(selector.menu),
                $otherMenus  = $(this).siblings(selector.item).children(selector.menu)
              ;
              if( $currentMenu.size() > 0 ) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  $.each($otherMenus, function() {
                    module.animate.hide(false, $(this));
                  });
                  module.verbose('Showing sub-menu', $currentMenu);
                  module.animate.show(false,  $currentMenu);
                }, settings.delay.show);
                event.preventDefault();
              }
            },

            mouseleave: function(event) {
              var
                $currentMenu = $(this).children(selector.menu)
              ;
              if($currentMenu.size() > 0) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.verbose('Hiding sub-menu', $currentMenu);
                  module.animate.hide(false,  $currentMenu);
                }, settings.delay.hide);
              }
            },

            click: function (event) {
              var
                $choice = $(this),
                text    = module.get.choiceText($choice),
                value   = module.get.choiceValue($choice, text),
                callback = function() {
                  module.remove.searchTerm();
                  module.determine.selectAction(text, value);
                },
                openingSubMenu = ($choice.find(selector.menu).size() > 0)
              ;
              if( !openingSubMenu ) {
                callback();
              }
            }

          },

          resetStyle: function() {
            $(this).removeAttr('style');
          }

        },

        determine: {
          selectAction: function(text, value) {
            module.verbose('Determining action', settings.action);
            if( $.isFunction( module.action[settings.action] ) ) {
              module.verbose('Triggering preset action', settings.action, text, value);
              module.action[ settings.action ](text, value);
            }
            else if( $.isFunction(settings.action) ) {
              module.verbose('Triggering user action', settings.action, text, value);
              settings.action(text, value);
            }
            else {
              module.error(error.action, settings.action);
            }
          },
          eventInModule: function(event, callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if( $(event.target).closest($module).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
              return false;
            }
          },
          eventInMenu: function(event, callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if( $(event.target).closest($menu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown menu, canceling callback');
              return false;
            }
          }
        },

        action: {

          nothing: function() {},

          hide: function() {
            module.hide(function() {
              module.remove.filteredItem();
            });
          },

          select: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide(function() {
              module.remove.filteredItem();
            });
          },

          activate: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide(function() {
              module.remove.filteredItem();
            });
          },

          combo: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide(function() {
              module.remove.filteredItem();
            });
          }

        },

        get: {
          text: function() {
            return $text.text();
          },
          value: function() {
            return ($input.size() > 0)
              ? $input.val()
              : $module.data(metadata.value)
            ;
          },
          choiceText: function($choice, preserveHTML) {
            preserveHTML = (preserveHTML !== undefined)
              ? preserveHTML
              : settings.preserveHTML
            ;
            if($choice !== undefined) {
              return ($choice.data(metadata.text) !== undefined)
                ? $choice.data(metadata.text)
                : (preserveHTML)
                  ? $choice.html()
                  : $choice.text()
              ;
            }
          },
          choiceValue: function($choice, choiceText) {
            choiceText = choiceText || module.get.choiceText($text);
            return ($choice.data(metadata.value) !== undefined)
              ? $choice.data(metadata.value)
              : (typeof choiceText === 'string')
                ? choiceText.toLowerCase()
                : choiceText
            ;
          },
          inputEvent: function() {
            var
              input = $search[0]
            ;
            if(input) {
              return (input.oninput !== undefined)
                ? 'input'
                : (input.onpropertychange !== undefined)
                  ? 'propertychange'
                  : 'keyup'
              ;
            }
            return false;
          },
          selectValues: function() {
            var
              select = {}
            ;
            select.values = (settings.sortSelect)
              ? {} // properties will be sorted in object when re-accessed
              : [] // properties will keep original order in array
            ;
            $module
              .find('option')
                .each(function() {
                  var
                    name  = $(this).html(),
                    value = ( $(this).attr('value') !== undefined )
                      ? $(this).attr('value')
                      : name
                  ;
                  if(value === '') {
                    select.placeholder = name;
                  }
                  else {
                    if(settings.sortSelect) {
                      select.values[value] = {
                        name  : name,
                        value : value
                      };
                    }
                    else {
                      select.values.push({
                        name: name,
                        value: value
                      });
                    }
                  }
                })
            ;
            if(settings.sortSelect) {
              module.debug('Retrieved and sorted values from select', select);
            }
            else {
              module.debug('Retreived values from select', select);
            }
            return select;
          },
          activeItem: function() {
            return $item.filter('.'  + className.active);
          },
          item: function(value, strict) {
            var
              $selectedItem = false
            ;
            value = (value !== undefined)
              ? value
              : ( module.get.value() !== undefined)
                ? module.get.value()
                : module.get.text()
            ;
            strict = (value === '' || value === 0)
              ? true
              : strict || false
            ;
            if(value !== undefined) {
              $item
                .each(function() {
                  var
                    $choice       = $(this),
                    optionText    = module.get.choiceText($choice),
                    optionValue   = module.get.choiceValue($choice, optionText)
                  ;
                  if(strict) {
                    module.verbose('Ambiguous dropdown value using strict type check', $choice, value);
                    if( optionValue === value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText === value ) {
                      $selectedItem = $(this);
                    }
                  }
                  else {
                    if( optionValue == value ) {
                      module.verbose('Found select item by value', optionValue, value);
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText == value ) {
                      module.verbose('Found select item by text', optionText, value);
                      $selectedItem = $(this);
                    }
                  }
                })
              ;
            }
            else {
              value = module.get.text();
            }
            return $selectedItem || false;
          },
          uniqueID: function() {
            return (Math.random().toString(16) + '000000000').substr(2,8);
          }
        },

        restore: {
          defaults: function() {
            module.restore.defaultText();
            module.restore.defaultValue();
          },
          defaultText: function() {
            var
              defaultText = $module.data(metadata.defaultText)
            ;
            module.debug('Restoring default text', defaultText);
            module.set.text(defaultText);
          },
          defaultValue: function() {
            var
              defaultValue = $module.data(metadata.defaultValue)
            ;
            if(defaultValue !== undefined) {
              module.debug('Restoring default value', defaultValue);
              module.set.selected(defaultValue);
              module.set.value(defaultValue);
            }
          }
        },

        save: {
          defaults: function() {
            module.save.defaultText();
            module.save.defaultValue();
          },
          defaultValue: function() {
            $module.data(metadata.defaultValue, module.get.value() );
          },
          defaultText: function() {
            $module.data(metadata.defaultText, $text.text() );
          }
        },

        set: {
          filtered: function() {
            var
              searchValue    = $search.val(),
              hasSearchValue = (typeof searchValue === 'string' && searchValue.length > 0)
            ;
            if(hasSearchValue) {
              $text.addClass(className.filtered);
            }
            else {
              $text.removeClass(className.filtered);
            }
          },
          tabbable: function() {
            if( module.is.searchable() ) {
              module.debug('Searchable dropdown initialized');
              $search
                .val('')
                .attr('tabindex', 0)
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
            else {
              module.debug('Simple selection dropdown initialized');
              if(!$module.attr('tabindex') ) {
                $module
                  .attr('tabindex', 0)
                ;
                $menu
                  .attr('tabindex', '-1')
                ;
              }
            }
          },
          scrollPosition: function($item, forceScroll) {
            var
              edgeTolerance = 5,
              hasActive,
              offset,
              itemHeight,
              itemOffset,
              menuOffset,
              menuScroll,
              menuHeight,
              abovePage,
              belowPage
            ;

            $item       = $item || module.get.activeItem();
            hasActive   = ($item && $item.size() > 0);
            forceScroll = (forceScroll !== undefined)
              ? forceScroll
              : false
            ;

            if($item && hasActive) {

              if(!$menu.hasClass(className.visible)) {
                $menu.addClass(className.loading);
              }

              menuHeight = $menu.height();
              itemHeight = $item.height();
              menuScroll = $menu.scrollTop();
              menuOffset = $menu.offset().top;
              itemOffset = $item.offset().top;
              offset     = menuScroll - menuOffset + itemOffset;
              belowPage  = menuScroll + menuHeight < (offset + edgeTolerance);
              abovePage  = ((offset - edgeTolerance) < menuScroll);
              module.debug('Scrolling to active item', offset);
              if(abovePage || belowPage || forceScroll) {
                $menu
                  .scrollTop(offset)
                  .removeClass(className.loading)
                ;
              }
            }
          },
          text: function(text) {
            if(settings.action == 'combo') {
              module.debug('Changing combo button text', text, $combo);
              if(settings.preserveHTML) {
                $combo.html(text);
              }
              else {
                $combo.text(text);
              }
            }
            else if(settings.action !== 'select') {
              module.debug('Changing text', text, $text);
              $text
                .removeClass(className.filtered)
                .removeClass(className.placeholder)
              ;
              if(settings.preserveHTML) {
                $text.html(text);
              }
              else {
                $text.text(text);
              }
            }
          },
          value: function(value) {
            module.debug('Adding selected value to hidden input', value, $input);
            if($input.size() > 0) {
              $input
                .val(value)
                .trigger('change')
              ;
            }
            else {
              $module.data(metadata.value, value);
            }
          },
          active: function() {
            $module
              .addClass(className.active)
            ;
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          selected: function(value) {
            var
              $selectedItem = module.get.item(value),
              selectedText
            ;
            if($selectedItem) {
              module.debug('Setting selected menu item to', $selectedItem);

              module.remove.activeItem();
              module.remove.selectedItem();
              $selectedItem
                .addClass(className.active)
                .addClass(className.selected)
              ;

              selectedText = module.get.choiceText($selectedItem);
              module.set.text(selectedText);
              $.proxy(settings.onChange, element)(value, selectedText, $selectedItem);
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          activeItem: function() {
            $item.removeClass(className.active);
          },
          filteredItem: function() {
            $item.removeClass(className.filtered);
          },
          searchTerm: function() {
            $search.val('');
          },
          selectedItem: function() {
            $item.removeClass(className.selected);
          },
          tabbable: function() {
            if( module.is.searchable() ) {
              module.debug('Searchable dropdown initialized');
              $search
                .attr('tabindex', '-1')
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
            else {
              module.debug('Simple selection dropdown initialized');
              $module
                .attr('tabindex', '-1')
              ;
              $menu
                .attr('tabindex', '-1')
              ;
            }
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          animating: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':animated') || $subMenu.transition && $subMenu.transition('is animating')
              : $menu.is(':animated') || $menu.transition && $menu.transition('is animating')
            ;
          },
          allFiltered: function() {
            return ($item.filter('.' + className.filtered).size() === $item.size());
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':hidden')
              : $menu.is(':hidden')
            ;
          },
          search: function() {
            return $module.hasClass(className.search);
          },
          searchable: function() {
            return ($search.size() > 0);
          },
          searchSelection: function() {
            return ( module.is.searchable() && $search.parent().is($module) );
          },
          selection: function() {
            return $module.hasClass(className.selection);
          },
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':visible')
              : $menu.is(':visible')
            ;
          }
        },

        can: {
          click: function() {
            return (hasTouch || settings.on == 'click');
          },
          show: function() {
            return !$module.hasClass(className.disabled);
          }
        },

        animate: {
          show: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu,
              start = ($subMenu)
                ? function() {}
                : function() {
                  module.hideSubMenus();
                  module.hideOthers();
                  module.set.active();
                }
            ;
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            module.set.scrollPosition(module.get.activeItem(), true);
            module.verbose('Doing menu show animation', $currentMenu);
            if( module.is.hidden($currentMenu) || module.is.animating($currentMenu) ) {
              if(settings.transition == 'none') {
                $.proxy(callback, element)();
              }
              else if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation  : settings.transition + ' in',
                    debug      : settings.debug,
                    verbose    : settings.verbose,
                    duration   : settings.duration,
                    queue      : true,
                    onStart    : start,
                    onComplete : function() {
                      $.proxy(callback, element)();
                    }
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                start();
                $currentMenu
                  .hide()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 0)
                    .delay(50)
                    .animate({
                      opacity : 1
                    }, settings.duration, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .slideDown(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                start();
                $currentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else {
                module.error(error.transition, settings.transition);
              }
            }
          },
          hide: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu,
              duration = ($subMenu)
                ? (settings.duration * 0.9)
                : settings.duration,
              start = ($subMenu)
                ? function() {}
                : function() {
                  if( module.can.click() ) {
                    module.unbind.intent();
                  }
                  module.focusSearch();
                  module.remove.active();
                }
            ;
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if( module.is.visible($currentMenu) || module.is.animating($currentMenu) ) {
              module.verbose('Doing menu hide animation', $currentMenu);

              if(settings.transition == 'none') {
                $.proxy(callback, element)();
              }
              else if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation  : settings.transition + ' out',
                    duration   : settings.duration,
                    debug      : settings.debug,
                    verbose    : settings.verbose,
                    queue      : true,
                    onStart    : start,
                    onComplete : function() {
                      $.proxy(callback, element)();
                    }
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                start();
                $currentMenu
                  .show()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 1)
                    .animate({
                      opacity : 0
                    }, 100, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .delay(50)
                  .slideUp(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                start();
                $currentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    $.proxy(module.event.resetStyle, this)();
                    $.proxy(callback, element)();
                  })
                ;
              }
              else {
                module.error(error.transition);
              }
            }
          }
        },

        delay: {
          show: function() {
            module.verbose('Delaying show event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.show, settings.delay.show);
          },
          hide: function() {
            module.verbose('Delaying hide event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.hide, settings.delay.hide);
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.dropdown.settings = {

  debug          : false,
  verbose        : true,
  performance    : true,

  on             : 'click',
  action         : 'activate',

  allowTab       : true,
  fullTextSearch : false,
  preserveHTML   : true,
  sortSelect     : false,

  delay          : {
    hide   : 300,
    show   : 200,
    search : 50,
    touch  : 50
  },

  transition : 'slide down',
  duration   : 250,

  /* Callbacks */
  onNoResults : function(searchTerm){},
  onChange    : function(value, text){},
  onShow      : function(){},
  onHide      : function(){},

  /* Component */

  name           : 'Dropdown',
  namespace      : 'dropdown',

  error   : {
    action     : 'You called a dropdown action that was not defined',
    method     : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    defaultText  : 'defaultText',
    defaultValue : 'defaultValue',
    text         : 'text',
    value        : 'value'
  },

  selector : {
    dropdown : '.ui.dropdown',
    text     : '> .text:not(.icon)',
    input    : '> input[type="hidden"], > select',
    search   : '> input.search, .menu > .search > input, .menu > input.search',
    menu     : '.menu',
    item     : '.item'
  },

  className : {
    active      : 'active',
    animating   : 'animating',
    disabled    : 'disabled',
    dropdown    : 'ui dropdown',
    filtered    : 'filtered',
    loading     : 'loading',
    menu        : 'menu',
    placeholder : 'default',
    search      : 'search',
    selected    : 'selected',
    selection   : 'selection',
    visible     : 'visible'
  }

};

/* Templates */
$.fn.dropdown.settings.templates = {
  menu: function(select) {
    var
      placeholder = select.placeholder || false,
      values      = select.values || {},
      html        = ''
    ;
    $.each(select.values, function(index, option) {
      html += '<div class="item" data-value="' + option.value + '">' + option.name + '</div>';
    });
    return html;
  },
  dropdown: function(select) {
    var
      placeholder = select.placeholder || false,
      values      = select.values || {},
      html        = ''
    ;
    html +=  '<i class="dropdown icon"></i>';
    if(select.placeholder) {
      html += '<div class="default text">' + placeholder + '</div>';
    }
    else {
      html += '<div class="text"></div>';
    }
    html += '<div class="menu">';
    $.each(select.values, function(index, option) {
      html += '<div class="item" data-value="' + option.value + '">' + option.name + '</div>';
    });
    html += '</div>';
    return html;
  }
};


/* Dependencies */
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
});


})( jQuery, window , document );
 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,n,i){"use strict";e.fn.dropdown=function(o){var a,s=e(this),r=e(n),c=s.selector||"",u="ontouchstart"in n.documentElement,d=(new Date).getTime(),l=[],f=arguments[0],v="string"==typeof f,m=[].slice.call(arguments,1);return s.each(function(){var h,p,g,b,w=e.isPlainObject(o)?e.extend(!0,{},e.fn.dropdown.settings,o):e.extend({},e.fn.dropdown.settings),y=w.className,x=w.metadata,T=w.namespace,C=w.selector,S=w.error,k="."+T,z="module-"+T,I=e(this),D=I.find(C.text),E=I.find(C.search),F=I.find(C.input),A=I.prev().find(C.text).size()>0?I.prev().find(C.text):I.prev(),M=I.children(C.menu),O=M.find(C.item),q=!1,V=!1,Q=this,P=I.data(z);b={initialize:function(){b.debug("Initializing dropdown",w),b.setup.layout(),b.save.defaults(),b.set.selected(),b.create.id(),u&&b.bind.touchEvents(),b.bind.mouseEvents(),b.bind.keyboardEvents(),b.observeChanges(),b.instantiate()},instantiate:function(){b.verbose("Storing instance of dropdown",b),P=b,I.data(z,b)},destroy:function(){b.verbose("Destroying previous dropdown for",I),b.remove.tabbable(),I.off(k).removeData(z),r.off(h)},observeChanges:function(){"MutationObserver"in t&&(g=new MutationObserver(function(){b.debug("DOM tree modified, updating selector cache"),b.refresh()}),g.observe(Q,{childList:!0,subtree:!0}),b.debug("Setting up mutation observer",g))},create:{id:function(){b.verbose("Creating unique id for element"),p=b.get.uniqueID(),h="."+p}},search:function(){var e;e=E.val(),b.verbose("Searching for query",e),b.is.searchSelection()&&(b.filter(e),b.can.show()&&b.show())},setup:{layout:function(){I.is("select")&&b.setup.select(),b.is.search()&&!b.is.searchable()&&(E=e("<input />").addClass(y.search).insertBefore(D)),w.allowTab&&b.set.tabbable()},select:function(){var t=b.get.selectValues();b.debug("Dropdown initialized on a select",t),F=I,F.parents(C.dropdown).size()>0?(b.debug("Creating dropdown menu only from template"),I=F.closest(C.dropdown),0===I.find("."+y.dropdown).size()&&e("<div />").addClass(y.menu).html(w.templates.menu(t)).appendTo(I)):(b.debug("Creating entire dropdown from template"),I=e("<div />").attr("class",F.attr("class")).addClass(y.selection).addClass(y.dropdown).html(w.templates.dropdown(t)).insertBefore(F),F.removeAttr("class").prependTo(I)),b.refresh()}},refresh:function(){D=I.find(C.text),E=I.find(C.search),F=I.find(C.input),M=I.children(C.menu),O=M.find(C.item)},toggle:function(){b.verbose("Toggling menu visibility"),b.is.active()?b.hide():b.show()},show:function(t){t=e.isFunction(t)?t:function(){},b.is.active()||b.is.allFiltered()||(b.debug("Showing dropdown"),b.animate.show(function(){b.can.click()&&b.bind.intent(),b.set.visible(),e.proxy(t,Q)()}),e.proxy(w.onShow,Q)())},hide:function(t){t=e.isFunction(t)?t:function(){},b.is.active()&&(b.debug("Hiding dropdown"),b.animate.hide(function(){b.remove.visible(),e.proxy(t,Q)()}),e.proxy(w.onHide,Q)())},hideOthers:function(){b.verbose("Finding other dropdowns to hide"),s.not(I).has(C.menu+":visible:not(."+y.animating+")").dropdown("hide")},hideSubMenus:function(){var e=M.find(C.menu);e.transition("hide")},bind:{keyboardEvents:function(){b.debug("Binding keyboard events"),I.on("keydown"+k,b.event.keydown),b.is.searchable()&&I.on(b.get.inputEvent(),C.search,b.event.input)},touchEvents:function(){b.debug("Touch device detected binding additional touch events"),b.is.searchSelection()||I.on("touchstart"+k,b.event.test.toggle),M.on("touchstart"+k,C.item,b.event.item.mouseenter)},mouseEvents:function(){b.verbose("Mouse detected binding mouse events"),b.is.searchSelection()?I.on("mousedown"+k,C.menu,b.event.menu.activate).on("mouseup"+k,C.menu,b.event.menu.deactivate).on("click"+k,C.search,b.show).on("focus"+k,C.search,b.event.searchFocus).on("blur"+k,C.search,b.event.searchBlur):("click"==w.on?I.on("click"+k,b.event.test.toggle):"hover"==w.on?I.on("mouseenter"+k,b.delay.show).on("mouseleave"+k,b.delay.hide):I.on(w.on+k,b.toggle),I.on("mousedown"+k,b.event.mousedown).on("mouseup"+k,b.event.mouseup).on("focus"+k,b.event.focus).on("blur"+k,b.event.blur)),M.on("mouseenter"+k,C.item,b.event.item.mouseenter).on("mouseleave"+k,C.item,b.event.item.mouseleave).on("click"+k,C.item,b.event.item.click)},intent:function(){b.verbose("Binding hide intent event to document"),u&&r.on("touchstart"+h,b.event.test.touch).on("touchmove"+h,b.event.test.touch),r.on("click"+h,b.event.test.hide)}},unbind:{intent:function(){b.verbose("Removing hide intent event from document"),u&&r.off("touchstart"+h).off("touchmove"+h),r.off("click"+h)}},filter:function(t){var n=e(),i=new RegExp("^"+t,"igm"),o=new RegExp(t,"ig");b.verbose("Searching for matching values"),O.each(function(){var t=e(this),a=b.get.choiceText(t,!1),s=b.get.choiceValue(t,a);i.test(a)||i.test(s)?n=n.add(t):w.fullTextSearch&&(o.test(a)||o.test(s))&&(n=n.add(t))}),b.debug("Setting filter",t),b.remove.filteredItem(),O.not(n).addClass(y.filtered),b.verbose("Selecting first non-filtered element"),b.remove.selectedItem(),O.not("."+y.filtered).eq(0).addClass(y.selected),b.is.allFiltered()&&(b.debug("All items filtered, hiding dropdown",t),b.hide(),e.proxy(w.onNoResults,Q)(t))},focusSearch:function(){b.is.search()&&E.focus()},event:{mousedown:function(){q=!0},mouseup:function(){q=!1},focus:function(){!q&&b.is.hidden()&&b.show()},blur:function(){var e=n.activeElement===this;q||e||b.hide()},searchFocus:function(){q=!0,b.show()},searchBlur:function(){var e=n.activeElement===this;V||e||b.hide()},input:function(){b.set.filtered(),clearTimeout(b.timer),b.timer=setTimeout(b.search,w.delay.search)},keydown:function(t){var n,i=O.not(y.filtered).filter("."+y.selected).eq(0),o=O.not("."+y.filtered),a=t.which,s={enter:13,escape:27,upArrow:38,downArrow:40},r=y.selected,c=o.index(i),u=i.size()>0;if(u||(i=O.filter("."+y.active).eq(0),u=i.size()>0),a==s.escape&&(b.verbose("Escape key pressed, closing dropdown"),b.hide()),a==s.downArrow&&(b.verbose("Down key pressed, showing dropdown"),b.show()),b.is.visible()){if(a==s.enter&&u)return b.verbose("Enter key pressed, choosing selected item"),e.proxy(b.event.item.click,i)(t),t.preventDefault(),!1;a==s.upArrow?(n=u?i.prevAll(C.item+":not(."+y.filtered+")").eq(0):o.eq(0),0!==c&&(b.verbose("Up key pressed, changing active item"),O.removeClass(r),n.addClass(r),b.set.scrollPosition(n)),t.preventDefault()):a==s.downArrow&&(n=u?i.nextAll(C.item+":not(."+y.filtered+")").eq(0):o.eq(0),c+1<o.size()&&(b.verbose("Down key pressed, changing active item"),O.removeClass(r),n.addClass(r),b.set.scrollPosition(n)),t.preventDefault())}else a==s.enter&&b.show()},test:{toggle:function(e){b.determine.eventInMenu(e,b.toggle)&&e.preventDefault()},touch:function(e){b.determine.eventInMenu(e,function(){"touchstart"==e.type?b.timer=setTimeout(b.hide,w.delay.touch):"touchmove"==e.type&&clearTimeout(b.timer)}),e.stopPropagation()},hide:function(e){b.determine.eventInModule(e,b.hide)}},menu:{activate:function(){V=!0},deactivate:function(){V=!1}},item:{mouseenter:function(t){var n=e(this).children(C.menu),i=e(this).siblings(C.item).children(C.menu);n.size()>0&&(clearTimeout(b.itemTimer),b.itemTimer=setTimeout(function(){e.each(i,function(){b.animate.hide(!1,e(this))}),b.verbose("Showing sub-menu",n),b.animate.show(!1,n)},w.delay.show),t.preventDefault())},mouseleave:function(){var t=e(this).children(C.menu);t.size()>0&&(clearTimeout(b.itemTimer),b.itemTimer=setTimeout(function(){b.verbose("Hiding sub-menu",t),b.animate.hide(!1,t)},w.delay.hide))},click:function(){var t=e(this),n=b.get.choiceText(t),i=b.get.choiceValue(t,n),o=function(){b.remove.searchTerm(),b.determine.selectAction(n,i)},a=t.find(C.menu).size()>0;a||o()}},resetStyle:function(){e(this).removeAttr("style")}},determine:{selectAction:function(t,n){b.verbose("Determining action",w.action),e.isFunction(b.action[w.action])?(b.verbose("Triggering preset action",w.action,t,n),b.action[w.action](t,n)):e.isFunction(w.action)?(b.verbose("Triggering user action",w.action,t,n),w.action(t,n)):b.error(S.action,w.action)},eventInModule:function(t,n){return n=e.isFunction(n)?n:function(){},0===e(t.target).closest(I).size()?(b.verbose("Triggering event",n),n(),!0):(b.verbose("Event occurred in dropdown, canceling callback"),!1)},eventInMenu:function(t,n){return n=e.isFunction(n)?n:function(){},0===e(t.target).closest(M).size()?(b.verbose("Triggering event",n),n(),!0):(b.verbose("Event occurred in dropdown menu, canceling callback"),!1)}},action:{nothing:function(){},hide:function(){b.hide(function(){b.remove.filteredItem()})},select:function(e,t){t=t!==i?t:e,b.set.selected(t),b.set.value(t),b.hide(function(){b.remove.filteredItem()})},activate:function(e,t){t=t!==i?t:e,b.set.selected(t),b.set.value(t),b.hide(function(){b.remove.filteredItem()})},combo:function(e,t){t=t!==i?t:e,b.set.selected(t),b.set.value(t),b.hide(function(){b.remove.filteredItem()})}},get:{text:function(){return D.text()},value:function(){return F.size()>0?F.val():I.data(x.value)},choiceText:function(e,t){return t=t!==i?t:w.preserveHTML,e!==i?e.data(x.text)!==i?e.data(x.text):t?e.html():e.text():void 0},choiceValue:function(e,t){return t=t||b.get.choiceText(D),e.data(x.value)!==i?e.data(x.value):"string"==typeof t?t.toLowerCase():t},inputEvent:function(){var e=E[0];return e?e.oninput!==i?"input":e.onpropertychange!==i?"propertychange":"keyup":!1},selectValues:function(){var t={};return t.values=w.sortSelect?{}:[],I.find("option").each(function(){var n=e(this).html(),o=e(this).attr("value")!==i?e(this).attr("value"):n;""===o?t.placeholder=n:w.sortSelect?t.values[o]={name:n,value:o}:t.values.push({name:n,value:o})}),w.sortSelect?b.debug("Retrieved and sorted values from select",t):b.debug("Retreived values from select",t),t},activeItem:function(){return O.filter("."+y.active)},item:function(t,n){var o=!1;return t=t!==i?t:b.get.value()!==i?b.get.value():b.get.text(),n=""===t||0===t?!0:n||!1,t!==i?O.each(function(){var i=e(this),a=b.get.choiceText(i),s=b.get.choiceValue(i,a);n?(b.verbose("Ambiguous dropdown value using strict type check",i,t),s===t?o=e(this):o||a!==t||(o=e(this))):s==t?(b.verbose("Found select item by value",s,t),o=e(this)):o||a!=t||(b.verbose("Found select item by text",a,t),o=e(this))}):t=b.get.text(),o||!1},uniqueID:function(){return(Math.random().toString(16)+"000000000").substr(2,8)}},restore:{defaults:function(){b.restore.defaultText(),b.restore.defaultValue()},defaultText:function(){var e=I.data(x.defaultText);b.debug("Restoring default text",e),b.set.text(e)},defaultValue:function(){var e=I.data(x.defaultValue);e!==i&&(b.debug("Restoring default value",e),b.set.selected(e),b.set.value(e))}},save:{defaults:function(){b.save.defaultText(),b.save.defaultValue()},defaultValue:function(){I.data(x.defaultValue,b.get.value())},defaultText:function(){I.data(x.defaultText,D.text())}},set:{filtered:function(){var e=E.val(),t="string"==typeof e&&e.length>0;t?D.addClass(y.filtered):D.removeClass(y.filtered)},tabbable:function(){b.is.searchable()?(b.debug("Searchable dropdown initialized"),E.val("").attr("tabindex",0),M.attr("tabindex","-1")):(b.debug("Simple selection dropdown initialized"),I.attr("tabindex")||(I.attr("tabindex",0),M.attr("tabindex","-1")))},scrollPosition:function(e,t){var n,o,a,s,r,c,u,d,l,f=5;e=e||b.get.activeItem(),n=e&&e.size()>0,t=t!==i?t:!1,e&&n&&(M.hasClass(y.visible)||M.addClass(y.loading),u=M.height(),a=e.height(),c=M.scrollTop(),r=M.offset().top,s=e.offset().top,o=c-r+s,l=o+f>c+u,d=c>o-f,b.debug("Scrolling to active item",o),(d||l||t)&&M.scrollTop(o).removeClass(y.loading))},text:function(e){"combo"==w.action?(b.debug("Changing combo button text",e,A),w.preserveHTML?A.html(e):A.text(e)):"select"!==w.action&&(b.debug("Changing text",e,D),D.removeClass(y.filtered).removeClass(y.placeholder),w.preserveHTML?D.html(e):D.text(e))},value:function(e){b.debug("Adding selected value to hidden input",e,F),F.size()>0?F.val(e).trigger("change"):I.data(x.value,e)},active:function(){I.addClass(y.active)},visible:function(){I.addClass(y.visible)},selected:function(t){var n,i=b.get.item(t);i&&(b.debug("Setting selected menu item to",i),b.remove.activeItem(),b.remove.selectedItem(),i.addClass(y.active).addClass(y.selected),n=b.get.choiceText(i),b.set.text(n),e.proxy(w.onChange,Q)(t,n,i))}},remove:{active:function(){I.removeClass(y.active)},visible:function(){I.removeClass(y.visible)},activeItem:function(){O.removeClass(y.active)},filteredItem:function(){O.removeClass(y.filtered)},searchTerm:function(){E.val("")},selectedItem:function(){O.removeClass(y.selected)},tabbable:function(){b.is.searchable()?(b.debug("Searchable dropdown initialized"),E.attr("tabindex","-1"),M.attr("tabindex","-1")):(b.debug("Simple selection dropdown initialized"),I.attr("tabindex","-1"),M.attr("tabindex","-1"))}},is:{active:function(){return I.hasClass(y.active)},animating:function(e){return e?e.is(":animated")||e.transition&&e.transition("is animating"):M.is(":animated")||M.transition&&M.transition("is animating")},allFiltered:function(){return O.filter("."+y.filtered).size()===O.size()},hidden:function(e){return e?e.is(":hidden"):M.is(":hidden")},search:function(){return I.hasClass(y.search)},searchable:function(){return E.size()>0},searchSelection:function(){return b.is.searchable()&&E.parent().is(I)},selection:function(){return I.hasClass(y.selection)},visible:function(e){return e?e.is(":visible"):M.is(":visible")}},can:{click:function(){return u||"click"==w.on},show:function(){return!I.hasClass(y.disabled)}},animate:{show:function(t,n){var o=n||M,a=n?function(){}:function(){b.hideSubMenus(),b.hideOthers(),b.set.active()};t=e.isFunction(t)?t:function(){},b.set.scrollPosition(b.get.activeItem(),!0),b.verbose("Doing menu show animation",o),(b.is.hidden(o)||b.is.animating(o))&&("none"==w.transition?e.proxy(t,Q)():e.fn.transition!==i&&I.transition("is supported")?o.transition({animation:w.transition+" in",debug:w.debug,verbose:w.verbose,duration:w.duration,queue:!0,onStart:a,onComplete:function(){e.proxy(t,Q)()}}):"slide down"==w.transition?(a(),o.hide().clearQueue().children().clearQueue().css("opacity",0).delay(50).animate({opacity:1},w.duration,"easeOutQuad",b.event.resetStyle).end().slideDown(100,"easeOutQuad",function(){e.proxy(b.event.resetStyle,this)(),e.proxy(t,Q)()})):"fade"==w.transition?(a(),o.hide().clearQueue().fadeIn(w.duration,function(){e.proxy(b.event.resetStyle,this)(),e.proxy(t,Q)()})):b.error(S.transition,w.transition))},hide:function(t,n){var o=n||M,a=(n?.9*w.duration:w.duration,n?function(){}:function(){b.can.click()&&b.unbind.intent(),b.focusSearch(),b.remove.active()});t=e.isFunction(t)?t:function(){},(b.is.visible(o)||b.is.animating(o))&&(b.verbose("Doing menu hide animation",o),"none"==w.transition?e.proxy(t,Q)():e.fn.transition!==i&&I.transition("is supported")?o.transition({animation:w.transition+" out",duration:w.duration,debug:w.debug,verbose:w.verbose,queue:!0,onStart:a,onComplete:function(){e.proxy(t,Q)()}}):"slide down"==w.transition?(a(),o.show().clearQueue().children().clearQueue().css("opacity",1).animate({opacity:0},100,"easeOutQuad",b.event.resetStyle).end().delay(50).slideUp(100,"easeOutQuad",function(){e.proxy(b.event.resetStyle,this)(),e.proxy(t,Q)()})):"fade"==w.transition?(a(),o.show().clearQueue().fadeOut(150,function(){e.proxy(b.event.resetStyle,this)(),e.proxy(t,Q)()})):b.error(S.transition))}},delay:{show:function(){b.verbose("Delaying show event to ensure user intent"),clearTimeout(b.timer),b.timer=setTimeout(b.show,w.delay.show)},hide:function(){b.verbose("Delaying hide event to ensure user intent"),clearTimeout(b.timer),b.timer=setTimeout(b.hide,w.delay.hide)}},setting:function(t,n){if(b.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,w,t);else{if(n===i)return w[t];w[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,b,t);else{if(n===i)return b[t];b[t]=n}},debug:function(){w.debug&&(w.performance?b.performance.log(arguments):(b.debug=Function.prototype.bind.call(console.info,console,w.name+":"),b.debug.apply(console,arguments)))},verbose:function(){w.verbose&&w.debug&&(w.performance?b.performance.log(arguments):(b.verbose=Function.prototype.bind.call(console.info,console,w.name+":"),b.verbose.apply(console,arguments)))},error:function(){b.error=Function.prototype.bind.call(console.error,console,w.name+":"),b.error.apply(console,arguments)},performance:{log:function(e){var t,n,i;w.performance&&(t=(new Date).getTime(),i=d||t,n=t-i,d=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:Q,"Execution Time":n})),clearTimeout(b.performance.timer),b.performance.timer=setTimeout(b.performance.display,100)},display:function(){var t=w.name+":",n=0;d=!1,clearTimeout(b.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",c&&(t+=" '"+c+"'"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,o){var s,r,c,u=P;return n=n||m,o=Q||o,"string"==typeof t&&u!==i&&(t=t.split(/[\. ]/),s=t.length-1,e.each(t,function(n,o){var a=n!=s?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(u[a])&&n!=s)u=u[a];else{if(u[a]!==i)return r=u[a],!1;if(!e.isPlainObject(u[o])||n==s)return u[o]!==i?(r=u[o],!1):(b.error(S.method,t),!1);u=u[o]}})),e.isFunction(r)?c=r.apply(o,n):r!==i&&(c=r),e.isArray(a)?a.push(c):a!==i?a=[a,c]:c!==i&&(a=c),r}},v?(P===i&&b.initialize(),b.invoke(f)):(P!==i&&b.destroy(),b.initialize())}),a!==i?a:this},e.fn.dropdown.settings={debug:!1,verbose:!0,performance:!0,on:"click",action:"activate",allowTab:!0,fullTextSearch:!1,preserveHTML:!0,sortSelect:!1,delay:{hide:300,show:200,search:50,touch:50},transition:"slide down",duration:250,onNoResults:function(){},onChange:function(){},onShow:function(){},onHide:function(){},name:"Dropdown",namespace:"dropdown",error:{action:"You called a dropdown action that was not defined",method:"The method you called is not defined.",transition:"The requested transition was not found"},metadata:{defaultText:"defaultText",defaultValue:"defaultValue",text:"text",value:"value"},selector:{dropdown:".ui.dropdown",text:"> .text:not(.icon)",input:'> input[type="hidden"], > select',search:"> input.search, .menu > .search > input, .menu > input.search",menu:".menu",item:".item"},className:{active:"active",animating:"animating",disabled:"disabled",dropdown:"ui dropdown",filtered:"filtered",loading:"loading",menu:"menu",placeholder:"default",search:"search",selected:"selected",selection:"selection",visible:"visible"}},e.fn.dropdown.settings.templates={menu:function(t){var n=(t.placeholder||!1,t.values||{},"");return e.each(t.values,function(e,t){n+='<div class="item" data-value="'+t.value+'">'+t.name+"</div>"}),n},dropdown:function(t){var n=t.placeholder||!1,i=(t.values||{},"");return i+='<i class="dropdown icon"></i>',i+=t.placeholder?'<div class="default text">'+n+"</div>":'<div class="text"></div>',i+='<div class="menu">',e.each(t.values,function(e,t){i+='<div class="item" data-value="'+t.value+'">'+t.name+"</div>"}),i+="</div>"}},e.extend(e.easing,{easeOutQuad:function(e,t,n,i,o){return-i*(t/=o)*(t-2)+n}})}(jQuery,window,document);
/*
 * # Semantic - Form Validation
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.form = function(fields, parameters) {
  var
    $allModules     = $(this),

    settings        = $.extend(true, {}, $.fn.form.settings, parameters),
    validation      = $.extend({}, $.fn.form.settings.defaults, fields),

    namespace       = settings.namespace,
    metadata        = settings.metadata,
    selector        = settings.selector,
    className       = settings.className,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        $module    = $(this),
        $field     = $(this).find(selector.field),
        $group     = $(this).find(selector.group),
        $message   = $(this).find(selector.message),
        $prompt    = $(this).find(selector.prompt),
        $submit    = $(this).find(selector.submit),

        formErrors = [],

        element    = this,
        instance   = $module.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing form validation', $module, validation, settings);
          module.bindEvents();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', instance);
          module.removeEvents();
          $module
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $field = $module.find(selector.field);
        },

        submit: function() {
          module.verbose('Submitting form', $module);
          $module
            .submit()
          ;
        },

        attachEvents: function(selector, action) {
          action = action || 'submit';
          $(selector)
            .on('click', function(event) {
              module[action]();
              event.preventDefault();
            })
          ;
        },

        bindEvents: function() {

          if(settings.keyboardShortcuts) {
            $field
              .on('keydown' + eventNamespace, module.event.field.keydown)
            ;
          }
          $module
            .on('submit' + eventNamespace, module.validate.form)
          ;
          $field
            .on('blur' + eventNamespace, module.event.field.blur)
          ;
          // attach submit events
          module.attachEvents($submit, 'submit');

          $field
            .each(function() {
              var
                type       = $(this).prop('type'),
                inputEvent = module.get.changeEvent(type)
              ;
              $(this)
                .on(inputEvent + eventNamespace, module.event.field.change)
              ;
            })
          ;
        },

        removeEvents: function() {
          $module
            .off(eventNamespace)
          ;
          $field
            .off(eventNamespace)
          ;
          $submit
            .off(eventNamespace)
          ;
          $field
            .off(eventNamespace)
          ;
        },

        event: {
          field: {
            keydown: function(event) {
              var
                $field  = $(this),
                key     = event.which,
                keyCode = {
                  enter  : 13,
                  escape : 27
                }
              ;
              if( key == keyCode.escape) {
                module.verbose('Escape key pressed blurring field');
                $field
                  .blur()
                ;
              }
              if(!event.ctrlKey && key == keyCode.enter && $field.is(selector.input) && $field.not(selector.checkbox).size() > 0 ) {
                module.debug('Enter key pressed, submitting form');
                $submit
                  .addClass(className.down)
                ;
                $field
                  .one('keyup' + eventNamespace, module.event.field.keyup)
                ;
              }
            },
            keyup: function() {
              module.verbose('Doing keyboard shortcut form submit');
              $submit.removeClass(className.down);
              module.submit();
            },
            blur: function() {
              var
                $field      = $(this),
                $fieldGroup = $field.closest($group)
              ;
              if( $fieldGroup.hasClass(className.error) ) {
                module.debug('Revalidating field', $field,  module.get.validation($field));
                module.validate.field( module.get.validation($field) );
              }
              else if(settings.on == 'blur' || settings.on == 'change') {
                module.validate.field( module.get.validation($field) );
              }
            },
            change: function() {
              var
                $field      = $(this),
                $fieldGroup = $field.closest($group)
              ;
              if(settings.on == 'change' || ( $fieldGroup.hasClass(className.error) && settings.revalidate) ) {
                clearTimeout(module.timer);
                module.timer = setTimeout(function() {
                  module.debug('Revalidating field', $field,  module.get.validation($field));
                  module.validate.field( module.get.validation($field) );
                }, settings.delay);
              }
            }
          }

        },

        get: {
          changeEvent: function(type) {
            if(type == 'checkbox' || type == 'radio' || type == 'hidden') {
              return 'change';
            }
            else {
              return (document.createElement('input').oninput !== undefined)
                ? 'input'
                : (document.createElement('input').onpropertychange !== undefined)
                  ? 'propertychange'
                  : 'keyup'
              ;
            }
          },
          field: function(identifier) {
            module.verbose('Finding field with identifier', identifier);
            if( $field.filter('#' + identifier).size() > 0 ) {
              return $field.filter('#' + identifier);
            }
            else if( $field.filter('[name="' + identifier +'"]').size() > 0 ) {
              return $field.filter('[name="' + identifier +'"]');
            }
            else if( $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]');
            }
            return $('<input/>');
          },
          validation: function($field) {
            var
              rules
            ;
            $.each(validation, function(fieldName, field) {
              if( module.get.field(field.identifier).get(0) == $field.get(0) ) {
                rules = field;
              }
            });
            return rules || false;
          }
        },

        has: {

          field: function(identifier) {
            module.verbose('Checking for existence of a field with identifier', identifier);
            if( $field.filter('#' + identifier).size() > 0 ) {
              return true;
            }
            else if( $field.filter('[name="' + identifier +'"]').size() > 0 ) {
              return true;
            }
            else if( $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return true;
            }
            return false;
          }

        },

        add: {
          prompt: function(identifier, errors) {
            var
              $field       = module.get.field(identifier),
              $fieldGroup  = $field.closest($group),
              $prompt      = $fieldGroup.find(selector.prompt),
              promptExists = ($prompt.size() !== 0)
            ;
            errors = (typeof errors == 'string')
              ? [errors]
              : errors
            ;
            module.verbose('Adding field error state', identifier);
            $fieldGroup
              .addClass(className.error)
            ;
            if(settings.inline) {
              if(!promptExists) {
                $prompt = settings.templates.prompt(errors);
                $prompt
                  .appendTo($fieldGroup)
                ;
              }
              $prompt
                .html(errors[0])
              ;
              if(!promptExists) {
                if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                  module.verbose('Displaying error with css transition', settings.transition);
                  $prompt.transition(settings.transition + ' in', settings.duration);
                }
                else {
                  module.verbose('Displaying error with fallback javascript animation');
                  $prompt
                    .fadeIn(settings.duration)
                  ;
                }
              }
              else {
                module.verbose('Inline errors are disabled, no inline error added', identifier);
              }
            }
          },
          errors: function(errors) {
            module.debug('Adding form error messages', errors);
            $message
              .html( settings.templates.error(errors) )
            ;
          }
        },

        remove: {
          prompt: function(field) {
            var
              $field      = module.get.field(field.identifier),
              $fieldGroup = $field.closest($group),
              $prompt     = $fieldGroup.find(selector.prompt)
            ;
            $fieldGroup
              .removeClass(className.error)
            ;
            if(settings.inline && $prompt.is(':visible')) {
              module.verbose('Removing prompt for field', field);
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                $prompt.transition(settings.transition + ' out', settings.duration, function() {
                  $prompt.remove();
                });
              }
              else {
                $prompt
                  .fadeOut(settings.duration, function(){
                    $prompt.remove();
                  })
                ;
              }
            }
          }
        },

        set: {
          success: function() {
            $module
              .removeClass(className.error)
              .addClass(className.success)
            ;
          },
          error: function() {
            $module
              .removeClass(className.success)
              .addClass(className.error)
            ;
          }
        },

        validate: {

          form: function(event) {
            var
              allValid = true,
              apiRequest
            ;
            // reset errors
            formErrors = [];
            $.each(validation, function(fieldName, field) {
              if( !( module.validate.field(field) ) ) {
                allValid = false;
              }
            });
            if(allValid) {
              module.debug('Form has no validation errors, submitting');
              module.set.success();
              return $.proxy(settings.onSuccess, element)(event);
            }
            else {
              module.debug('Form has errors');
              module.set.error();
              if(!settings.inline) {
                module.add.errors(formErrors);
              }
              // prevent ajax submit
              if($module.data('moduleApi') !== undefined) {
                event.stopImmediatePropagation();
              }
              return $.proxy(settings.onFailure, element)(formErrors);
            }
          },

          // takes a validation object and returns whether field passes validation
          field: function(field) {
            var
              $field      = module.get.field(field.identifier),
              fieldValid  = true,
              fieldErrors = []
            ;
            if($field.prop('disabled')) {
              module.debug('Field is disabled. Skipping', field.identifier);
              fieldValid = true;
            }
            else if(field.optional && $.trim($field.val()) === ''){
              module.debug('Field is optional and empty. Skipping', field.identifier);
              fieldValid = true;
            }
            else if(field.rules !== undefined) {
              $.each(field.rules, function(index, rule) {
                if( module.has.field(field.identifier) && !( module.validate.rule(field, rule) ) ) {
                  module.debug('Field is invalid', field.identifier, rule.type);
                  fieldErrors.push(rule.prompt);
                  fieldValid = false;
                }
              });
            }
            if(fieldValid) {
              module.remove.prompt(field, fieldErrors);
              $.proxy(settings.onValid, $field)();
            }
            else {
              formErrors = formErrors.concat(fieldErrors);
              module.add.prompt(field.identifier, fieldErrors);
              $.proxy(settings.onInvalid, $field)(fieldErrors);
              return false;
            }
            return true;
          },

          // takes validation rule and returns whether field passes rule
          rule: function(field, validation) {
            var
              $field        = module.get.field(field.identifier),
              type          = validation.type,
              value         = $.trim($field.val() + ''),

              bracketRegExp = /\[(.*)\]/i,
              bracket       = bracketRegExp.exec(type),
              isValid       = true,
              ancillary,
              functionType
            ;
            // if bracket notation is used, pass in extra parameters
            if(bracket !== undefined && bracket !== null) {
              ancillary    = '' + bracket[1];
              functionType = type.replace(bracket[0], '');
              isValid      = $.proxy(settings.rules[functionType], element)(value, ancillary);
            }
            // normal notation
            else {
              isValid = $.proxy(settings.rules[type], $field)(value);
            }
            return isValid;
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.form.settings = {

  name              : 'Form',
  namespace         : 'form',

  debug             : false,
  verbose           : true,
  performance       : true,


  keyboardShortcuts : true,
  on                : 'submit',
  inline            : false,

  delay             : 200,
  revalidate        : true,

  transition        : 'scale',
  duration          : 200,


  onValid           : function() {},
  onInvalid         : function() {},
  onSuccess         : function() { return true; },
  onFailure         : function() { return false; },

  metadata : {
    validate: 'validate'
  },

  selector : {
    message : '.error.message',
    field   : 'input, textarea, select',
    group   : '.field',
    checkbox: 'input[type="checkbox"], input[type="radio"]',
    input   : 'input',
    prompt  : '.prompt',
    submit  : '.submit'
  },

  className : {
    error   : 'error',
    success : 'success',
    down    : 'down',
    label   : 'ui prompt label'
  },

  error: {
    method   : 'The method you called is not defined.'
  },

  templates: {
    error: function(errors) {
      var
        html = '<ul class="list">'
      ;
      $.each(errors, function(index, value) {
        html += '<li>' + value + '</li>';
      });
      html += '</ul>';
      return $(html);
    },
    prompt: function(errors) {
      return $('<div/>')
        .addClass('ui red pointing prompt label')
        .html(errors[0])
      ;
    }
  },

  rules: {

    // checkbox checked
    checked: function() {
      return ($(this).filter(':checked').size() > 0);
    },

    // value contains (text)
    contains: function(value, text) {
      text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      return (value.search(text) !== -1);
    },

    // is most likely an email
    email: function(value){
      var
        emailRegExp = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", "i")
      ;
      return emailRegExp.test(value);
    },

    // is not empty or blank string
    empty: function(value) {
      return !(value === undefined || '' === value);
    },

    // is valid integer
    integer: function(value, range) {
      var
        intRegExp = /^\-?\d+$/,
        min,
        max,
        parts
      ;
      if (range === undefined || range === '' || range === '..') {
        // do nothing
      }
      else if (range.indexOf('..') == -1) {
        if (intRegExp.test(range)) {
          min = max = range - 0;
        }
      }
      else {
        parts = range.split('..', 2);
        if (intRegExp.test(parts[0])) {
          min = parts[0] - 0;
        }
        if (intRegExp.test(parts[1])) {
          max = parts[1] - 0;
        }
      }
      return (
        intRegExp.test(value) &&
        (min === undefined || value >= min) &&
        (max === undefined || value <= max)
      );
    },

    // is exactly value
    is: function(value, text) {
      return (value == text);
    },

    // is at least string length
    length: function(value, requiredLength) {
      return (value !== undefined)
        ? (value.length >= requiredLength)
        : false
      ;
    },

    // matches another field
    match: function(value, fieldIdentifier) {
      // use either id or name of field
      var
        $form = $(this),
        matchingValue
      ;
      if($form.find('#' + fieldIdentifier).size() > 0) {
        matchingValue = $form.find('#' + fieldIdentifier).val();
      }
      else if($form.find('[name="' + fieldIdentifier +'"]').size() > 0) {
        matchingValue = $form.find('[name="' + fieldIdentifier + '"]').val();
      }
      else if( $form.find('[data-validate="'+ fieldIdentifier +'"]').size() > 0 ) {
        matchingValue = $form.find('[data-validate="'+ fieldIdentifier +'"]').val();
      }
      return (matchingValue !== undefined)
        ? ( value.toString() == matchingValue.toString() )
        : false
      ;
    },

    // string length is less than max length
    maxLength: function(value, maxLength) {
      return (value !== undefined)
        ? (value.length <= maxLength)
        : false
      ;
    },

    // value is not exactly notValue
    not: function(value, notValue) {
      return (value != notValue);
    },

    // value is most likely url
    url: function(value) {
      var
        urlRegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      ;
      return urlRegExp.test(value);
    }
  }

};

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,n,i){e.fn.form=function(t,r){var o,a=e(this),s=e.extend(!0,{},e.fn.form.settings,r),l=e.extend({},e.fn.form.settings.defaults,t),u=s.namespace,c=s.metadata,d=s.selector,f=s.className,p=(s.error,"."+u),m="module-"+u,v=a.selector||"",g=(new Date).getTime(),h=[],b=arguments[0],y="string"==typeof b,z=[].slice.call(arguments,1);return a.each(function(){var t,r=e(this),u=e(this).find(d.field),k=e(this).find(d.group),x=e(this).find(d.message),w=(e(this).find(d.prompt),e(this).find(d.submit)),E=[],C=this,F=r.data(m);t={initialize:function(){t.verbose("Initializing form validation",r,l,s),t.bindEvents(),t.instantiate()},instantiate:function(){t.verbose("Storing instance of module",t),F=t,r.data(m,t)},destroy:function(){t.verbose("Destroying previous module",F),t.removeEvents(),r.removeData(m)},refresh:function(){t.verbose("Refreshing selector cache"),u=r.find(d.field)},submit:function(){t.verbose("Submitting form",r),r.submit()},attachEvents:function(n,i){i=i||"submit",e(n).on("click",function(e){t[i](),e.preventDefault()})},bindEvents:function(){s.keyboardShortcuts&&u.on("keydown"+p,t.event.field.keydown),r.on("submit"+p,t.validate.form),u.on("blur"+p,t.event.field.blur),t.attachEvents(w,"submit"),u.each(function(){var n=e(this).prop("type"),i=t.get.changeEvent(n);e(this).on(i+p,t.event.field.change)})},removeEvents:function(){r.off(p),u.off(p),w.off(p),u.off(p)},event:{field:{keydown:function(n){var i=e(this),r=n.which,o={enter:13,escape:27};r==o.escape&&(t.verbose("Escape key pressed blurring field"),i.blur()),!n.ctrlKey&&r==o.enter&&i.is(d.input)&&i.not(d.checkbox).size()>0&&(t.debug("Enter key pressed, submitting form"),w.addClass(f.down),i.one("keyup"+p,t.event.field.keyup))},keyup:function(){t.verbose("Doing keyboard shortcut form submit"),w.removeClass(f.down),t.submit()},blur:function(){var n=e(this),i=n.closest(k);i.hasClass(f.error)?(t.debug("Revalidating field",n,t.get.validation(n)),t.validate.field(t.get.validation(n))):("blur"==s.on||"change"==s.on)&&t.validate.field(t.get.validation(n))},change:function(){var n=e(this),i=n.closest(k);("change"==s.on||i.hasClass(f.error)&&s.revalidate)&&(clearTimeout(t.timer),t.timer=setTimeout(function(){t.debug("Revalidating field",n,t.get.validation(n)),t.validate.field(t.get.validation(n))},s.delay))}}},get:{changeEvent:function(e){return"checkbox"==e||"radio"==e||"hidden"==e?"change":n.createElement("input").oninput!==i?"input":n.createElement("input").onpropertychange!==i?"propertychange":"keyup"},field:function(n){return t.verbose("Finding field with identifier",n),u.filter("#"+n).size()>0?u.filter("#"+n):u.filter('[name="'+n+'"]').size()>0?u.filter('[name="'+n+'"]'):u.filter("[data-"+c.validate+'="'+n+'"]').size()>0?u.filter("[data-"+c.validate+'="'+n+'"]'):e("<input/>")},validation:function(n){var i;return e.each(l,function(e,r){t.get.field(r.identifier).get(0)==n.get(0)&&(i=r)}),i||!1}},has:{field:function(e){return t.verbose("Checking for existence of a field with identifier",e),u.filter("#"+e).size()>0?!0:u.filter('[name="'+e+'"]').size()>0?!0:u.filter("[data-"+c.validate+'="'+e+'"]').size()>0?!0:!1}},add:{prompt:function(n,o){var a=t.get.field(n),l=a.closest(k),u=l.find(d.prompt),c=0!==u.size();o="string"==typeof o?[o]:o,t.verbose("Adding field error state",n),l.addClass(f.error),s.inline&&(c||(u=s.templates.prompt(o),u.appendTo(l)),u.html(o[0]),c?t.verbose("Inline errors are disabled, no inline error added",n):s.transition&&e.fn.transition!==i&&r.transition("is supported")?(t.verbose("Displaying error with css transition",s.transition),u.transition(s.transition+" in",s.duration)):(t.verbose("Displaying error with fallback javascript animation"),u.fadeIn(s.duration)))},errors:function(e){t.debug("Adding form error messages",e),x.html(s.templates.error(e))}},remove:{prompt:function(n){var o=t.get.field(n.identifier),a=o.closest(k),l=a.find(d.prompt);a.removeClass(f.error),s.inline&&l.is(":visible")&&(t.verbose("Removing prompt for field",n),s.transition&&e.fn.transition!==i&&r.transition("is supported")?l.transition(s.transition+" out",s.duration,function(){l.remove()}):l.fadeOut(s.duration,function(){l.remove()}))}},set:{success:function(){r.removeClass(f.error).addClass(f.success)},error:function(){r.removeClass(f.success).addClass(f.error)}},validate:{form:function(n){var o=!0;return E=[],e.each(l,function(e,n){t.validate.field(n)||(o=!1)}),o?(t.debug("Form has no validation errors, submitting"),t.set.success(),e.proxy(s.onSuccess,C)(n)):(t.debug("Form has errors"),t.set.error(),s.inline||t.add.errors(E),r.data("moduleApi")!==i&&n.stopImmediatePropagation(),e.proxy(s.onFailure,C)(E))},field:function(n){var r=t.get.field(n.identifier),o=!0,a=[];return r.prop("disabled")?(t.debug("Field is disabled. Skipping",n.identifier),o=!0):n.optional&&""===e.trim(r.val())?(t.debug("Field is optional and empty. Skipping",n.identifier),o=!0):n.rules!==i&&e.each(n.rules,function(e,i){t.has.field(n.identifier)&&!t.validate.rule(n,i)&&(t.debug("Field is invalid",n.identifier,i.type),a.push(i.prompt),o=!1)}),o?(t.remove.prompt(n,a),e.proxy(s.onValid,r)(),!0):(E=E.concat(a),t.add.prompt(n.identifier,a),e.proxy(s.onInvalid,r)(a),!1)},rule:function(n,r){var o,a,l=t.get.field(n.identifier),u=r.type,c=e.trim(l.val()+""),d=/\[(.*)\]/i,f=d.exec(u),p=!0;return f!==i&&null!==f?(o=""+f[1],a=u.replace(f[0],""),p=e.proxy(s.rules[a],C)(c,o)):p=e.proxy(s.rules[u],l)(c),p}},setting:function(t,n){if(e.isPlainObject(t))e.extend(!0,s,t);else{if(n===i)return s[t];s[t]=n}},internal:function(n,r){if(e.isPlainObject(n))e.extend(!0,t,n);else{if(r===i)return t[n];t[n]=r}},debug:function(){s.debug&&(s.performance?t.performance.log(arguments):(t.debug=Function.prototype.bind.call(console.info,console,s.name+":"),t.debug.apply(console,arguments)))},verbose:function(){s.verbose&&s.debug&&(s.performance?t.performance.log(arguments):(t.verbose=Function.prototype.bind.call(console.info,console,s.name+":"),t.verbose.apply(console,arguments)))},error:function(){t.error=Function.prototype.bind.call(console.error,console,s.name+":"),t.error.apply(console,arguments)},performance:{log:function(e){var n,i,r;s.performance&&(n=(new Date).getTime(),r=g||n,i=n-r,g=n,h.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:C,"Execution Time":i})),clearTimeout(t.performance.timer),t.performance.timer=setTimeout(t.performance.display,100)},display:function(){var n=s.name+":",r=0;g=!1,clearTimeout(t.performance.timer),e.each(h,function(e,t){r+=t["Execution Time"]}),n+=" "+r+"ms",v&&(n+=" '"+v+"'"),a.size()>1&&(n+=" ("+a.size()+")"),(console.group!==i||console.table!==i)&&h.length>0&&(console.groupCollapsed(n),console.table?console.table(h):e.each(h,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),h=[]}},invoke:function(t,n,r){var a,s,l,u=F;return n=n||z,r=C||r,"string"==typeof t&&u!==i&&(t=t.split(/[\. ]/),a=t.length-1,e.each(t,function(n,r){var o=n!=a?r+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(u[o])&&n!=a)u=u[o];else{if(u[o]!==i)return s=u[o],!1;if(!e.isPlainObject(u[r])||n==a)return u[r]!==i?(s=u[r],!1):!1;u=u[r]}})),e.isFunction(s)?l=s.apply(r,n):s!==i&&(l=s),e.isArray(o)?o.push(l):o!==i?o=[o,l]:l!==i&&(o=l),s}},y?(F===i&&t.initialize(),t.invoke(b)):(F!==i&&t.destroy(),t.initialize())}),o!==i?o:this},e.fn.form.settings={name:"Form",namespace:"form",debug:!1,verbose:!0,performance:!0,keyboardShortcuts:!0,on:"submit",inline:!1,delay:200,revalidate:!0,transition:"scale",duration:200,onValid:function(){},onInvalid:function(){},onSuccess:function(){return!0},onFailure:function(){return!1},metadata:{validate:"validate"},selector:{message:".error.message",field:"input, textarea, select",group:".field",checkbox:'input[type="checkbox"], input[type="radio"]',input:"input",prompt:".prompt",submit:".submit"},className:{error:"error",success:"success",down:"down",label:"ui prompt label"},error:{method:"The method you called is not defined."},templates:{error:function(t){var n='<ul class="list">';return e.each(t,function(e,t){n+="<li>"+t+"</li>"}),n+="</ul>",e(n)},prompt:function(t){return e("<div/>").addClass("ui red pointing prompt label").html(t[0])}},rules:{checked:function(){return e(this).filter(":checked").size()>0},contains:function(e,t){return t=t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&"),-1!==e.search(t)},email:function(e){var t=new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?","i");return t.test(e)},empty:function(e){return!(e===i||""===e)},integer:function(e,t){var n,r,o,a=/^\-?\d+$/;return t===i||""===t||".."===t||(-1==t.indexOf("..")?a.test(t)&&(n=r=t-0):(o=t.split("..",2),a.test(o[0])&&(n=o[0]-0),a.test(o[1])&&(r=o[1]-0))),a.test(e)&&(n===i||e>=n)&&(r===i||r>=e)},is:function(e,t){return e==t},length:function(e,t){return e!==i?e.length>=t:!1},match:function(t,n){var r,o=e(this);return o.find("#"+n).size()>0?r=o.find("#"+n).val():o.find('[name="'+n+'"]').size()>0?r=o.find('[name="'+n+'"]').val():o.find('[data-validate="'+n+'"]').size()>0&&(r=o.find('[data-validate="'+n+'"]').val()),r!==i?t.toString()==r.toString():!1},maxLength:function(e,t){return e!==i?e.length<=t:!1},not:function(e,t){return e!=t},url:function(e){var t=/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;return t.test(e)}}}}(jQuery,window,document);
/*
 * # Semantic - Modal
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.modal = function(parameters) {
  var
    $allModules    = $(this),
    $window        = $(window),
    $document      = $(document),
    $body          = $('body'),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings    = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.modal.settings, parameters)
          : $.extend({}, $.fn.modal.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $context        = $(settings.context),
        $close          = $module.find(selector.close),

        $allModals,
        $otherModals,
        $focusedElement,
        $dimmable,
        $dimmer,

        element         = this,
        instance        = $module.data(moduleNamespace),

        elementNamespace,
        id,
        observer,
        module
      ;
      module  = {

        initialize: function() {
          module.verbose('Initializing dimmer', $context);

          module.create.id();
          module.create.dimmer();
          module.refreshModals();

          module.verbose('Attaching close events', $close);
          module.bind.events();
          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of modal');
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        create: {
          dimmer: function() {
            var
              defaultSettings = {
                debug      : settings.debug,
                dimmerName : 'modals',
                duration   : {
                  show     : settings.duration,
                  hide     : settings.duration
                }
              },
              dimmerSettings = $.extend(true, defaultSettings, settings.dimmerSettings)
            ;
            if($.fn.dimmer === undefined) {
              module.error(error.dimmer);
              return;
            }
            module.debug('Creating dimmer with settings', dimmerSettings);
            $dimmable = $context.dimmer(dimmerSettings);
            if(settings.detachable) {
              module.verbose('Modal is detachable, moving content into dimmer');
              $dimmable.dimmer('add content', $module);
            }
            $dimmer = $dimmable.dimmer('get dimmer');
          },
          id: function() {
            module.verbose('Creating unique id for element');
            id = module.get.uniqueID();
            elementNamespace = '.' + id;
          }
        },

        destroy: function() {
          module.verbose('Destroying previous modal');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          $window.off(elementNamespace);
          $close.off(eventNamespace);
          $context.dimmer('destroy');
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, refreshing');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        refresh: function() {
          module.remove.scrolling();
          module.cacheSizes();
          module.set.screenHeight();
          module.set.type();
          module.set.position();
        },

        refreshModals: function() {
          $otherModals = $module.siblings(selector.modal);
          $allModals   = $otherModals.add($module);
        },

        attachEvents: function(selector, event) {
          var
            $toggle = $(selector)
          ;
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if($toggle.size() > 0) {
            module.debug('Attaching modal events to element', selector, event);
            $toggle
              .off(eventNamespace)
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound, selector);
          }
        },

        bind: {
          events: function() {
            $close
              .on('click' + eventNamespace, module.event.close)
            ;
            $window
              .on('resize' + elementNamespace, module.event.resize)
            ;
          }
        },

        get: {
          uniqueID: function() {
            return (Math.random().toString(16) + '000000000').substr(2,8);
          }
        },

        event: {
          close: function() {
            module.verbose('Closing element pressed');
            if( $(this).is(selector.approve) ) {
              if($.proxy(settings.onApprove, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Approve callback returned false cancelling hide');
              }
            }
            else if( $(this).is(selector.deny) ) {
              if($.proxy(settings.onDeny, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Deny callback returned false cancelling hide');
              }
            }
            else {
              module.hide();
            }
          },
          click: function(event) {
            if( $(event.target).closest($module).size() === 0 ) {
              module.debug('Dimmer clicked, hiding all modals');
              if( module.is.active() ) {
                module.remove.clickaway();
                if(settings.allowMultiple) {
                  module.hide();
                }
                else {
                  module.hideAll();
                }
              }
            }
          },
          debounce: function(method, delay) {
            clearTimeout(module.timer);
            module.timer = setTimeout(method, delay);
          },
          keyboard: function(event) {
            var
              keyCode   = event.which,
              escapeKey = 27
            ;
            if(keyCode == escapeKey) {
              if(settings.closable) {
                module.debug('Escape key pressed hiding modal');
                module.hide();
              }
              else {
                module.debug('Escape key pressed, but closable is set to false');
              }
              event.preventDefault();
            }
          },
          resize: function() {
            if( $dimmable.dimmer('is active') ) {
              requestAnimationFrame(module.refresh);
            }
          }
        },

        toggle: function() {
          if( module.is.active() || module.is.animating() ) {
            module.hide();
          }
          else {
            module.show();
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.refreshModals();
          module.showModal(callback);
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.refreshModals();
          module.hideModal(callback);
        },

        showModal: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.animating() || !module.is.active() ) {

            module.showDimmer();
            module.cacheSizes();
            module.set.position();
            module.set.screenHeight();
            module.set.type();
            module.set.clickaway();

            if( !settings.allowMultiple && $otherModals.filter(':visible').size() > 0) {
              module.debug('Other modals visible, queueing show animation');
              module.hideOthers(module.showModal);
            }
            else {
              $.proxy(settings.onShow, element)();
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                module.debug('Showing modal with css animations');
                $module
                  .transition({
                    debug       : settings.debug,
                    animation   : settings.transition + ' in',
                    queue       : settings.queue,
                    duration    : settings.duration,
                    useFailSafe : true,
                    onComplete : function() {
                      $.proxy(settings.onVisible, element)();
                      module.add.keyboardShortcuts();
                      module.save.focus();
                      module.set.active();
                      module.set.autofocus();
                      callback();
                    }
                  })
                ;
              }
              else {
                module.debug('Showing modal with javascript');
                $module
                  .fadeIn(settings.duration, settings.easing, function() {
                    $.proxy(settings.onVisible, element)();
                    module.add.keyboardShortcuts();
                    module.save.focus();
                    module.set.active();
                    callback();
                  })
                ;
              }
            }
          }
          else {
            module.debug('Modal is already visible');
          }
        },

        hideModal: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Hiding modal');
          $.proxy(settings.onHide, element)();

          if( module.is.animating() || module.is.active() ) {
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              module.remove.active();
              $module
                .transition({
                  debug       : settings.debug,
                  animation   : settings.transition + ' out',
                  queue       : settings.queue,
                  duration    : settings.duration,
                  useFailSafe : true,
                  onStart     : function() {
                    if( !module.othersActive() ) {
                      module.hideDimmer();
                    }
                    module.remove.keyboardShortcuts();
                  },
                  onComplete : function() {
                    $.proxy(settings.onHidden, element)();
                    module.restore.focus();
                    callback();
                  }
                })
              ;
            }
            else {
              module.remove.active();
              if( !module.othersActive() ) {
                module.hideDimmer();
              }
              module.remove.keyboardShortcuts();
              $module
                .fadeOut(settings.duration, settings.easing, function() {
                  $.proxy(settings.onHidden, element)();
                  module.restore.focus();
                  callback();
                })
              ;
            }
          }
        },

        showDimmer: function() {
          if($dimmable.dimmer('is animating') || !$dimmable.dimmer('is active') ) {
            module.debug('Showing dimmer');
            $dimmable.dimmer('show');
          }
          else {
            module.debug('Dimmer already visible');
          }
        },

        hideDimmer: function() {
          if( $dimmable.dimmer('is animating') || ($dimmable.dimmer('is active')) ) {
            $dimmable.dimmer('hide', function() {
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                module.remove.clickaway();
                module.remove.screenHeight();
              }
            });
          }
          else {
            module.debug('Dimmer is not visible cannot hide');
            return;
          }
        },

        hideAll: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( $allModals.is(':visible') ) {
            module.debug('Hiding all visible modals');
            module.hideDimmer();
            $allModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        hideOthers: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( $otherModals.is(':visible') ) {
            module.debug('Hiding other modals', $otherModals);
            $otherModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        othersActive: function() {
          return ($otherModals.filter('.' + className.active).size() > 0);
        },

        add: {
          keyboardShortcuts: function() {
            module.verbose('Adding keyboard shortcuts');
            $document
              .on('keyup' + eventNamespace, module.event.keyboard)
            ;
          }
        },

        save: {
          focus: function() {
            $focusedElement = $(document.activeElement).blur();
          }
        },

        restore: {
          focus: function() {
            if($focusedElement && $focusedElement.size() > 0) {
              $focusedElement.focus();
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          clickaway: function() {
            if(settings.closable) {
              $dimmer
                .off('click' + elementNamespace)
              ;
            }
          },
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Removing page height');
              $body
                .css('height', '')
              ;
            }
          },
          keyboardShortcuts: function() {
            module.verbose('Removing keyboard shortcuts');
            $document
              .off('keyup' + eventNamespace)
            ;
          },
          scrolling: function() {
            $dimmable.removeClass(className.scrolling);
            $module.removeClass(className.scrolling);
          }
        },

        cacheSizes: function() {
          var
            modalHeight = $module.outerHeight()
          ;
          if(module.cache === undefined || modalHeight !== 0) {
            module.cache = {
              pageHeight    : $(document).outerHeight(),
              height        : modalHeight + settings.offset,
              contextHeight : (settings.context == 'body')
                ? $(window).height()
                : $dimmable.height()
            };
          }
          module.debug('Caching modal and container sizes', module.cache);
        },

        can: {
          fit: function() {
            return (module.cache.height < module.cache.contextHeight);
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          animating: function() {
            return $module.transition('is supported')
              ? $module.transition('is animating')
              : $module.is(':visible')
            ;
          },
          scrolling: function() {
            return $dimmable.hasClass(className.scrolling);
          },
          modernBrowser: function() {
            // appName for IE11 reports 'Netscape' can no longer use
            return !(window.ActiveXObject || "ActiveXObject" in window);
          }
        },

        set: {
          autofocus: function() {
            if(settings.autofocus) {
              var
                $inputs    = $module.find(':input:visible'),
                $autofocus = $inputs.filter('[autofocus]'),
                $input     = ($autofocus.size() > 0)
                  ? $autofocus
                  : $inputs
              ;
              $input.first().focus();
            }
          },
          clickaway: function() {
            if(settings.closable) {
              $dimmer
                .on('click' + elementNamespace, module.event.click)
              ;
            }
          },
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Modal is taller than page content, resizing page height');
              $body
                .css('height', module.cache.height + settings.padding)
              ;
            }
            else {
              $body.css('height', '');
            }
          },
          active: function() {
            $module.addClass(className.active);
          },
          scrolling: function() {
            $dimmable.addClass(className.scrolling);
            $module.addClass(className.scrolling);
          },
          type: function() {
            if(module.can.fit()) {
              module.verbose('Modal fits on screen');
              if(!module.othersActive) {
                module.remove.scrolling();
              }
            }
            else {
              module.verbose('Modal cannot fit on screen setting to scrolling');
              module.set.scrolling();
            }
          },
          position: function() {
            module.verbose('Centering modal on page', module.cache);
            if(module.can.fit()) {
              $module
                .css({
                  top: '',
                  marginTop: -(module.cache.height / 2)
                })
              ;
            }
            else {
              $module
                .css({
                  marginTop : '',
                  top       : $document.scrollTop()
                })
              ;
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.modal.settings = {

  name           : 'Modal',
  namespace      : 'modal',

  debug          : false,
  verbose        : true,
  performance    : true,

  allowMultiple  : false,
  detachable     : true,
  closable       : true,
  autofocus      : true,

  dimmerSettings : {
    closable : false,
    useCSS   : true
  },

  context        : 'body',

  queue          : false,
  duration       : 500,
  easing         : 'easeOutExpo',
  offset         : 0,
  transition     : 'scale',

  padding        : 30,

  onShow         : function(){},
  onHide         : function(){},

  onVisible      : function(){},
  onHidden       : function(){},

  onApprove      : function(){ return true; },
  onDeny         : function(){ return true; },

  selector    : {
    close    : '.close, .actions .button',
    approve  : '.actions .positive, .actions .approve, .actions .ok',
    deny     : '.actions .negative, .actions .deny, .actions .cancel',
    modal    : '.ui.modal'
  },
  error : {
    dimmer    : 'UI Dimmer, a required component is not included in this page',
    method    : 'The method you called is not defined.',
    notFound  : 'The element you specified could not be found'
  },
  className : {
    active    : 'active',
    animating : 'animating',
    scrolling : 'scrolling'
  }
};


})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,i,n,t){"use strict";e.fn.modal=function(o){var s,a=e(this),r=e(i),c=e(n),u=e("body"),l=a.selector||"",d=(new Date).getTime(),m=[],f=arguments[0],g="string"==typeof f,h=[].slice.call(arguments,1),v=i.requestAnimationFrame||i.mozRequestAnimationFrame||i.webkitRequestAnimationFrame||i.msRequestAnimationFrame||function(e){setTimeout(e,0)};return a.each(function(){var a,b,p,y,w,k,S,x,M,A=e.isPlainObject(o)?e.extend(!0,{},e.fn.modal.settings,o):e.extend({},e.fn.modal.settings),C=A.selector,D=A.className,H=A.namespace,z=A.error,F="."+H,T="module-"+H,O=e(this),q=e(A.context),E=O.find(C.close),j=this,I=O.data(T);M={initialize:function(){M.verbose("Initializing dimmer",q),M.create.id(),M.create.dimmer(),M.refreshModals(),M.verbose("Attaching close events",E),M.bind.events(),M.observeChanges(),M.instantiate()},instantiate:function(){M.verbose("Storing instance of modal"),I=M,O.data(T,I)},create:{dimmer:function(){var i={debug:A.debug,dimmerName:"modals",duration:{show:A.duration,hide:A.duration}},n=e.extend(!0,i,A.dimmerSettings);return e.fn.dimmer===t?void M.error(z.dimmer):(M.debug("Creating dimmer with settings",n),y=q.dimmer(n),A.detachable&&(M.verbose("Modal is detachable, moving content into dimmer"),y.dimmer("add content",O)),void(w=y.dimmer("get dimmer")))},id:function(){M.verbose("Creating unique id for element"),S=M.get.uniqueID(),k="."+S}},destroy:function(){M.verbose("Destroying previous modal"),O.removeData(T).off(F),r.off(k),E.off(F),q.dimmer("destroy")},observeChanges:function(){"MutationObserver"in i&&(x=new MutationObserver(function(){M.debug("DOM tree modified, refreshing"),M.refresh()}),x.observe(j,{childList:!0,subtree:!0}),M.debug("Setting up mutation observer",x))},refresh:function(){M.remove.scrolling(),M.cacheSizes(),M.set.screenHeight(),M.set.type(),M.set.position()},refreshModals:function(){b=O.siblings(C.modal),a=b.add(O)},attachEvents:function(i,n){var t=e(i);n=e.isFunction(M[n])?M[n]:M.toggle,t.size()>0?(M.debug("Attaching modal events to element",i,n),t.off(F).on("click"+F,n)):M.error(z.notFound,i)},bind:{events:function(){E.on("click"+F,M.event.close),r.on("resize"+k,M.event.resize)}},get:{uniqueID:function(){return(Math.random().toString(16)+"000000000").substr(2,8)}},event:{close:function(){M.verbose("Closing element pressed"),e(this).is(C.approve)?e.proxy(A.onApprove,j)()!==!1?M.hide():M.verbose("Approve callback returned false cancelling hide"):e(this).is(C.deny)?e.proxy(A.onDeny,j)()!==!1?M.hide():M.verbose("Deny callback returned false cancelling hide"):M.hide()},click:function(i){0===e(i.target).closest(O).size()&&(M.debug("Dimmer clicked, hiding all modals"),M.is.active()&&(M.remove.clickaway(),A.allowMultiple?M.hide():M.hideAll()))},debounce:function(e,i){clearTimeout(M.timer),M.timer=setTimeout(e,i)},keyboard:function(e){var i=e.which,n=27;i==n&&(A.closable?(M.debug("Escape key pressed hiding modal"),M.hide()):M.debug("Escape key pressed, but closable is set to false"),e.preventDefault())},resize:function(){y.dimmer("is active")&&v(M.refresh)}},toggle:function(){M.is.active()||M.is.animating()?M.hide():M.show()},show:function(i){i=e.isFunction(i)?i:function(){},M.refreshModals(),M.showModal(i)},hide:function(i){i=e.isFunction(i)?i:function(){},M.refreshModals(),M.hideModal(i)},showModal:function(i){i=e.isFunction(i)?i:function(){},M.is.animating()||!M.is.active()?(M.showDimmer(),M.cacheSizes(),M.set.position(),M.set.screenHeight(),M.set.type(),M.set.clickaway(),!A.allowMultiple&&b.filter(":visible").size()>0?(M.debug("Other modals visible, queueing show animation"),M.hideOthers(M.showModal)):(e.proxy(A.onShow,j)(),A.transition&&e.fn.transition!==t&&O.transition("is supported")?(M.debug("Showing modal with css animations"),O.transition({debug:A.debug,animation:A.transition+" in",queue:A.queue,duration:A.duration,useFailSafe:!0,onComplete:function(){e.proxy(A.onVisible,j)(),M.add.keyboardShortcuts(),M.save.focus(),M.set.active(),M.set.autofocus(),i()}})):(M.debug("Showing modal with javascript"),O.fadeIn(A.duration,A.easing,function(){e.proxy(A.onVisible,j)(),M.add.keyboardShortcuts(),M.save.focus(),M.set.active(),i()})))):M.debug("Modal is already visible")},hideModal:function(i){i=e.isFunction(i)?i:function(){},M.debug("Hiding modal"),e.proxy(A.onHide,j)(),(M.is.animating()||M.is.active())&&(A.transition&&e.fn.transition!==t&&O.transition("is supported")?(M.remove.active(),O.transition({debug:A.debug,animation:A.transition+" out",queue:A.queue,duration:A.duration,useFailSafe:!0,onStart:function(){M.othersActive()||M.hideDimmer(),M.remove.keyboardShortcuts()},onComplete:function(){e.proxy(A.onHidden,j)(),M.restore.focus(),i()}})):(M.remove.active(),M.othersActive()||M.hideDimmer(),M.remove.keyboardShortcuts(),O.fadeOut(A.duration,A.easing,function(){e.proxy(A.onHidden,j)(),M.restore.focus(),i()})))},showDimmer:function(){y.dimmer("is animating")||!y.dimmer("is active")?(M.debug("Showing dimmer"),y.dimmer("show")):M.debug("Dimmer already visible")},hideDimmer:function(){return y.dimmer("is animating")||y.dimmer("is active")?void y.dimmer("hide",function(){A.transition&&e.fn.transition!==t&&O.transition("is supported")&&(M.remove.clickaway(),M.remove.screenHeight())}):void M.debug("Dimmer is not visible cannot hide")},hideAll:function(i){i=e.isFunction(i)?i:function(){},a.is(":visible")&&(M.debug("Hiding all visible modals"),M.hideDimmer(),a.filter(":visible").modal("hide modal",i))},hideOthers:function(i){i=e.isFunction(i)?i:function(){},b.is(":visible")&&(M.debug("Hiding other modals",b),b.filter(":visible").modal("hide modal",i))},othersActive:function(){return b.filter("."+D.active).size()>0},add:{keyboardShortcuts:function(){M.verbose("Adding keyboard shortcuts"),c.on("keyup"+F,M.event.keyboard)}},save:{focus:function(){p=e(n.activeElement).blur()}},restore:{focus:function(){p&&p.size()>0&&p.focus()}},remove:{active:function(){O.removeClass(D.active)},clickaway:function(){A.closable&&w.off("click"+k)},screenHeight:function(){M.cache.height>M.cache.pageHeight&&(M.debug("Removing page height"),u.css("height",""))},keyboardShortcuts:function(){M.verbose("Removing keyboard shortcuts"),c.off("keyup"+F)},scrolling:function(){y.removeClass(D.scrolling),O.removeClass(D.scrolling)}},cacheSizes:function(){var o=O.outerHeight();(M.cache===t||0!==o)&&(M.cache={pageHeight:e(n).outerHeight(),height:o+A.offset,contextHeight:"body"==A.context?e(i).height():y.height()}),M.debug("Caching modal and container sizes",M.cache)},can:{fit:function(){return M.cache.height<M.cache.contextHeight}},is:{active:function(){return O.hasClass(D.active)},animating:function(){return O.transition("is supported")?O.transition("is animating"):O.is(":visible")},scrolling:function(){return y.hasClass(D.scrolling)},modernBrowser:function(){return!(i.ActiveXObject||"ActiveXObject"in i)}},set:{autofocus:function(){if(A.autofocus){var e=O.find(":input:visible"),i=e.filter("[autofocus]"),n=i.size()>0?i:e;n.first().focus()}},clickaway:function(){A.closable&&w.on("click"+k,M.event.click)},screenHeight:function(){M.cache.height>M.cache.pageHeight?(M.debug("Modal is taller than page content, resizing page height"),u.css("height",M.cache.height+A.padding)):u.css("height","")},active:function(){O.addClass(D.active)},scrolling:function(){y.addClass(D.scrolling),O.addClass(D.scrolling)},type:function(){M.can.fit()?(M.verbose("Modal fits on screen"),M.othersActive||M.remove.scrolling()):(M.verbose("Modal cannot fit on screen setting to scrolling"),M.set.scrolling())},position:function(){M.verbose("Centering modal on page",M.cache),O.css(M.can.fit()?{top:"",marginTop:-(M.cache.height/2)}:{marginTop:"",top:c.scrollTop()})}},setting:function(i,n){if(M.debug("Changing setting",i,n),e.isPlainObject(i))e.extend(!0,A,i);else{if(n===t)return A[i];A[i]=n}},internal:function(i,n){if(e.isPlainObject(i))e.extend(!0,M,i);else{if(n===t)return M[i];M[i]=n}},debug:function(){A.debug&&(A.performance?M.performance.log(arguments):(M.debug=Function.prototype.bind.call(console.info,console,A.name+":"),M.debug.apply(console,arguments)))},verbose:function(){A.verbose&&A.debug&&(A.performance?M.performance.log(arguments):(M.verbose=Function.prototype.bind.call(console.info,console,A.name+":"),M.verbose.apply(console,arguments)))},error:function(){M.error=Function.prototype.bind.call(console.error,console,A.name+":"),M.error.apply(console,arguments)},performance:{log:function(e){var i,n,t;A.performance&&(i=(new Date).getTime(),t=d||i,n=i-t,d=i,m.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:j,"Execution Time":n})),clearTimeout(M.performance.timer),M.performance.timer=setTimeout(M.performance.display,100)},display:function(){var i=A.name+":",n=0;d=!1,clearTimeout(M.performance.timer),e.each(m,function(e,i){n+=i["Execution Time"]}),i+=" "+n+"ms",l&&(i+=" '"+l+"'"),(console.group!==t||console.table!==t)&&m.length>0&&(console.groupCollapsed(i),console.table?console.table(m):e.each(m,function(e,i){console.log(i.Name+": "+i["Execution Time"]+"ms")}),console.groupEnd()),m=[]}},invoke:function(i,n,o){var a,r,c,u=I;return n=n||h,o=j||o,"string"==typeof i&&u!==t&&(i=i.split(/[\. ]/),a=i.length-1,e.each(i,function(n,o){var s=n!=a?o+i[n+1].charAt(0).toUpperCase()+i[n+1].slice(1):i;if(e.isPlainObject(u[s])&&n!=a)u=u[s];else{if(u[s]!==t)return r=u[s],!1;if(!e.isPlainObject(u[o])||n==a)return u[o]!==t?(r=u[o],!1):!1;u=u[o]}})),e.isFunction(r)?c=r.apply(o,n):r!==t&&(c=r),e.isArray(s)?s.push(c):s!==t?s=[s,c]:c!==t&&(s=c),r}},g?(I===t&&M.initialize(),M.invoke(f)):(I!==t&&M.destroy(),M.initialize())}),s!==t?s:this},e.fn.modal.settings={name:"Modal",namespace:"modal",debug:!1,verbose:!0,performance:!0,allowMultiple:!1,detachable:!0,closable:!0,autofocus:!0,dimmerSettings:{closable:!1,useCSS:!0},context:"body",queue:!1,duration:500,easing:"easeOutExpo",offset:0,transition:"scale",padding:30,onShow:function(){},onHide:function(){},onVisible:function(){},onHidden:function(){},onApprove:function(){return!0},onDeny:function(){return!0},selector:{close:".close, .actions .button",approve:".actions .positive, .actions .approve, .actions .ok",deny:".actions .negative, .actions .deny, .actions .cancel",modal:".ui.modal"},error:{dimmer:"UI Dimmer, a required component is not included in this page",method:"The method you called is not defined.",notFound:"The element you specified could not be found"},className:{active:"active",animating:"animating",scrolling:"scrolling"}}}(jQuery,window,document);
/*
 * # Semantic - Nag
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.nag = function(parameters) {
  var
    $allModules    = $(this),
    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.nag.settings, parameters)
          : $.extend({}, $.fn.nag.settings),

        className       = settings.className,
        selector        = settings.selector,
        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),

        $close          = $module.find(selector.close),
        $context        = (settings.context)
          ? $(settings.context)
          : $('body'),

        element         = this,
        instance        = $module.data(moduleNamespace),

        moduleOffset,
        moduleHeight,

        contextWidth,
        contextHeight,
        contextOffset,

        yOffset,
        yPosition,

        timer,
        module,

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); }
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing element');

          $module
            .data(moduleNamespace, module)
          ;
          $close
            .on('click' + eventNamespace, module.dismiss)
          ;

          if(settings.detachable && $module.parent()[0] !== $context[0]) {
            $module
              .detach()
              .prependTo($context)
            ;
          }

          if(settings.displayTime > 0) {
            setTimeout(module.hide, settings.displayTime);
          }
          module.show();
        },

        destroy: function() {
          module.verbose('Destroying instance');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        show: function() {
          if( module.should.show() && !$module.is(':visible') ) {
            module.debug('Showing nag', settings.animation.show);
            if(settings.animation.show == 'fade') {
              $module
                .fadeIn(settings.duration, settings.easing)
              ;
            }
            else {
              $module
                .slideDown(settings.duration, settings.easing)
              ;
            }
          }
        },

        hide: function() {
          module.debug('Showing nag', settings.animation.hide);
          if(settings.animation.show == 'fade') {
            $module
              .fadeIn(settings.duration, settings.easing)
            ;
          }
          else {
            $module
              .slideUp(settings.duration, settings.easing)
            ;
          }
        },

        onHide: function() {
          module.debug('Removing nag', settings.animation.hide);
          $module.remove();
          if (settings.onHide) {
            settings.onHide();
          }
        },

        dismiss: function(event) {
          if(settings.storageMethod) {
            module.storage.set(settings.key, settings.value);
          }
          module.hide();
          event.stopImmediatePropagation();
          event.preventDefault();
        },

        should: {
          show: function() {
            if(settings.persist) {
              module.debug('Persistent nag is set, can show nag');
              return true;
            }
            if( module.storage.get(settings.key) != settings.value.toString() ) {
              module.debug('Stored value is not set, can show nag', module.storage.get(settings.key));
              return true;
            }
            module.debug('Stored value is set, cannot show nag', module.storage.get(settings.key));
            return false;
          }
        },

        get: {
          storageOptions: function() {
            var
              options = {}
            ;
            if(settings.expires) {
              options.expires = settings.expires;
            }
            if(settings.domain) {
              options.domain = settings.domain;
            }
            if(settings.path) {
              options.path = settings.path;
            }
            return options;
          }
        },

        clear: function() {
          module.storage.remove(settings.key);
        },

        storage: {
          set: function(key, value) {
            var
              options = module.get.storageOptions()
            ;
            if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
              window.localStorage.setItem(key, value);
              module.debug('Value stored using local storage', key, value);
            }
            else if($.cookie !== undefined) {
              $.cookie(key, value, options);
              module.debug('Value stored using cookie', key, value, options);
            }
            else {
              module.error(error.noCookieStorage);
              return;
            }
          },
          get: function(key, value) {
            var
              storedValue
            ;
            if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
              storedValue = window.localStorage.getItem(key);
            }
            // get by cookie
            else if($.cookie !== undefined) {
              storedValue = $.cookie(key);
            }
            else {
              module.error(error.noCookieStorage);
            }
            if(storedValue == 'undefined' || storedValue == 'null' || storedValue === undefined || storedValue === null) {
              storedValue = undefined;
            }
            return storedValue;
          },
          remove: function(key) {
            var
              options = module.get.storageOptions()
            ;
            if(settings.storageMethod == 'local' && window.store !== undefined) {
              window.localStorage.removeItem(key);
            }
            // store by cookie
            else if($.cookie !== undefined) {
              $.removeCookie(key, options);
            }
            else {
              module.error(error.noStorage);
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.nag.settings = {

  name        : 'Nag',

  debug       : false,
  verbose     : true,
  performance : true,

  namespace   : 'Nag',

  // allows cookie to be overriden
  persist     : false,

  // set to zero to require manually dismissal, otherwise hides on its own
  displayTime : 0,

  animation   : {
    show : 'slide',
    hide : 'slide'
  },

  context       : false,
  detachable    : false,

  expires       : 30,
  domain        : false,
  path          : '/',

  // type of storage to use
  storageMethod : 'cookie',

  // value to store in dismissed localstorage/cookie
  key           : 'nag',
  value         : 'dismiss',

  error: {
    noStorage : 'Neither $.cookie or store is defined. A storage solution is required for storing state',
    method    : 'The method you called is not defined.'
  },

  className     : {
    bottom : 'bottom',
    fixed  : 'fixed'
  },

  selector      : {
    close : '.close.icon'
  },

  speed         : 500,
  easing        : 'easeOutQuad',

  onHide: function() {}

};

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,o,n,t){"use strict";e.fn.nag=function(n){var i,a=e(this),r=a.selector||"",s=(new Date).getTime(),c=[],l=arguments[0],u="string"==typeof l,g=[].slice.call(arguments,1);return a.each(function(){{var a,d=e.isPlainObject(n)?e.extend(!0,{},e.fn.nag.settings,n):e.extend({},e.fn.nag.settings),m=(d.className,d.selector),f=d.error,p=d.namespace,h="."+p,b=p+"-module",v=e(this),y=v.find(m.close),k=e(d.context?d.context:"body"),w=this,x=v.data(b);o.requestAnimationFrame||o.mozRequestAnimationFrame||o.webkitRequestAnimationFrame||o.msRequestAnimationFrame||function(e){setTimeout(e,0)}}a={initialize:function(){a.verbose("Initializing element"),v.data(b,a),y.on("click"+h,a.dismiss),d.detachable&&v.parent()[0]!==k[0]&&v.detach().prependTo(k),d.displayTime>0&&setTimeout(a.hide,d.displayTime),a.show()},destroy:function(){a.verbose("Destroying instance"),v.removeData(b).off(h)},show:function(){a.should.show()&&!v.is(":visible")&&(a.debug("Showing nag",d.animation.show),"fade"==d.animation.show?v.fadeIn(d.duration,d.easing):v.slideDown(d.duration,d.easing))},hide:function(){a.debug("Showing nag",d.animation.hide),"fade"==d.animation.show?v.fadeIn(d.duration,d.easing):v.slideUp(d.duration,d.easing)},onHide:function(){a.debug("Removing nag",d.animation.hide),v.remove(),d.onHide&&d.onHide()},dismiss:function(e){d.storageMethod&&a.storage.set(d.key,d.value),a.hide(),e.stopImmediatePropagation(),e.preventDefault()},should:{show:function(){return d.persist?(a.debug("Persistent nag is set, can show nag"),!0):a.storage.get(d.key)!=d.value.toString()?(a.debug("Stored value is not set, can show nag",a.storage.get(d.key)),!0):(a.debug("Stored value is set, cannot show nag",a.storage.get(d.key)),!1)}},get:{storageOptions:function(){var e={};return d.expires&&(e.expires=d.expires),d.domain&&(e.domain=d.domain),d.path&&(e.path=d.path),e}},clear:function(){a.storage.remove(d.key)},storage:{set:function(n,i){var r=a.get.storageOptions();if("localstorage"==d.storageMethod&&o.localStorage!==t)o.localStorage.setItem(n,i),a.debug("Value stored using local storage",n,i);else{if(e.cookie===t)return void a.error(f.noCookieStorage);e.cookie(n,i,r),a.debug("Value stored using cookie",n,i,r)}},get:function(n){var i;return"localstorage"==d.storageMethod&&o.localStorage!==t?i=o.localStorage.getItem(n):e.cookie!==t?i=e.cookie(n):a.error(f.noCookieStorage),("undefined"==i||"null"==i||i===t||null===i)&&(i=t),i},remove:function(n){var i=a.get.storageOptions();"local"==d.storageMethod&&o.store!==t?o.localStorage.removeItem(n):e.cookie!==t?e.removeCookie(n,i):a.error(f.noStorage)}},setting:function(o,n){if(a.debug("Changing setting",o,n),e.isPlainObject(o))e.extend(!0,d,o);else{if(n===t)return d[o];d[o]=n}},internal:function(o,n){if(e.isPlainObject(o))e.extend(!0,a,o);else{if(n===t)return a[o];a[o]=n}},debug:function(){d.debug&&(d.performance?a.performance.log(arguments):(a.debug=Function.prototype.bind.call(console.info,console,d.name+":"),a.debug.apply(console,arguments)))},verbose:function(){d.verbose&&d.debug&&(d.performance?a.performance.log(arguments):(a.verbose=Function.prototype.bind.call(console.info,console,d.name+":"),a.verbose.apply(console,arguments)))},error:function(){a.error=Function.prototype.bind.call(console.error,console,d.name+":"),a.error.apply(console,arguments)},performance:{log:function(e){var o,n,t;d.performance&&(o=(new Date).getTime(),t=s||o,n=o-t,s=o,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:w,"Execution Time":n})),clearTimeout(a.performance.timer),a.performance.timer=setTimeout(a.performance.display,100)},display:function(){var o=d.name+":",n=0;s=!1,clearTimeout(a.performance.timer),e.each(c,function(e,o){n+=o["Execution Time"]}),o+=" "+n+"ms",r&&(o+=" '"+r+"'"),(console.group!==t||console.table!==t)&&c.length>0&&(console.groupCollapsed(o),console.table?console.table(c):e.each(c,function(e,o){console.log(o.Name+": "+o["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(o,n,r){var s,c,l,u=x;return n=n||g,r=w||r,"string"==typeof o&&u!==t&&(o=o.split(/[\. ]/),s=o.length-1,e.each(o,function(n,i){var r=n!=s?i+o[n+1].charAt(0).toUpperCase()+o[n+1].slice(1):o;if(e.isPlainObject(u[r])&&n!=s)u=u[r];else{if(u[r]!==t)return c=u[r],!1;if(!e.isPlainObject(u[i])||n==s)return u[i]!==t?(c=u[i],!1):(a.error(f.method,o),!1);u=u[i]}})),e.isFunction(c)?l=c.apply(r,n):c!==t&&(l=c),e.isArray(i)?i.push(l):i!==t?i=[i,l]:l!==t&&(i=l),c}},u?(x===t&&a.initialize(),a.invoke(l)):(x!==t&&a.destroy(),a.initialize())}),i!==t?i:this},e.fn.nag.settings={name:"Nag",debug:!1,verbose:!0,performance:!0,namespace:"Nag",persist:!1,displayTime:0,animation:{show:"slide",hide:"slide"},context:!1,detachable:!1,expires:30,domain:!1,path:"/",storageMethod:"cookie",key:"nag",value:"dismiss",error:{noStorage:"Neither $.cookie or store is defined. A storage solution is required for storing state",method:"The method you called is not defined."},className:{bottom:"bottom",fixed:"fixed"},selector:{close:".close.icon"},speed:500,easing:"easeOutQuad",onHide:function(){}}}(jQuery,window,document);
/*
 * # Semantic - Popup
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.popup = function(parameters) {
  var
    $allModules    = $(this),
    $document      = $(document),

    moduleSelector = $allModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.popup.settings, parameters)
          : $.extend({}, $.fn.popup.settings),

        selector           = settings.selector,
        className          = settings.className,
        error              = settings.error,
        metadata           = settings.metadata,
        namespace          = settings.namespace,

        eventNamespace     = '.' + settings.namespace,
        moduleNamespace    = 'module-' + namespace,

        $module            = $(this),
        $context           = $(settings.context),
        $target            = (settings.target)
          ? $(settings.target)
          : $module,

        $window            = $(window),
        $body              = $('body'),
        $popup,
        $offsetParent,

        searchDepth        = 0,
        triedPositions     = false,

        element            = this,
        instance           = $module.data(moduleNamespace),
        module
      ;

      module = {

        // binds events
        initialize: function() {
          module.debug('Initializing module', $module);
          module.refresh();
          if(settings.on == 'click') {
            $module
              .on('click' + eventNamespace, module.toggle)
            ;
          }
          else if( module.get.startEvent() ) {
            $module
              .on(module.get.startEvent() + eventNamespace, module.event.start)
              .on(module.get.endEvent() + eventNamespace, module.event.end)
            ;
          }
          if(settings.target) {
            module.debug('Target set to element', $target);
          }
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          if( !module.exists() ) {
            module.create();
          }
          else if(settings.hoverable) {
            module.bind.popup();
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        refresh: function() {
          if(settings.popup) {
            $popup = $(settings.popup);
          }
          else {
            if(settings.inline) {
              $popup = $target.next(settings.selector.popup);
            }
          }
          if(settings.popup) {
            $popup.addClass(className.loading);
            $offsetParent = $popup.offsetParent();
            $popup.removeClass(className.loading);
          }
          else {
            $offsetParent = (settings.inline)
                ? $target.offsetParent()
                : $body
            ;
          }
          if( $offsetParent.is('html') ) {
            module.debug('Page is popups offset parent');
            $offsetParent = $body;
          }
        },

        reposition: function() {
          module.refresh();
          module.set.position();
        },

        destroy: function() {
          module.debug('Destroying previous module');
          if($popup && !settings.preserve) {
            module.removePopup();
          }
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          start:  function(event) {
            var
              delay = ($.isPlainObject(settings.delay))
                ? settings.delay.show
                : settings.delay
            ;
            clearTimeout(module.hideTimer);
            module.showTimer = setTimeout(function() {
              if( module.is.hidden() && !( module.is.active() && module.is.dropdown()) ) {
                module.show();
              }
            }, delay);
          },
          end:  function() {
            var
              delay = ($.isPlainObject(settings.delay))
                ? settings.delay.hide
                : settings.delay
            ;
            clearTimeout(module.showTimer);
            module.hideTimer = setTimeout(function() {
              if( module.is.visible() ) {
                module.hide();
              }
            }, delay);
          },
          resize: function() {
            if( module.is.visible() ) {
              module.set.position();
            }
          }
        },

        // generates popup html from metadata
        create: function() {
          var
            html      = $module.data(metadata.html)      || settings.html,
            variation = $module.data(metadata.variation) || settings.variation,
            title     = $module.data(metadata.title)     || settings.title,
            content   = $module.data(metadata.content)   || $module.attr('title') || settings.content
          ;
          if(html || content || title) {
            module.debug('Creating pop-up html');
            if(!html) {
              html = settings.templates.popup({
                title   : title,
                content : content
              });
            }
            $popup = $('<div/>')
              .addClass(className.popup)
              .addClass(variation)
              .html(html)
            ;
            if(variation) {
              $popup
                .addClass(variation)
              ;
            }
            if(settings.inline) {
              module.verbose('Inserting popup element inline', $popup);
              $popup
                .insertAfter($module)
              ;
            }
            else {
              module.verbose('Appending popup element to body', $popup);
              $popup
                .appendTo( $context )
              ;
            }
            if(settings.hoverable) {
              module.bind.popup();
            }
            $.proxy(settings.onCreate, $popup)(element);
          }
          else if($target.next(settings.selector.popup).size() !== 0) {
            module.verbose('Pre-existing popup found, reverting to inline');
            settings.inline = true;
            module.refresh();
            if(settings.hoverable) {
              module.bind.popup();
            }
          }
          else {
            module.debug('No content specified skipping display', element);
          }
        },

        // determines popup state
        toggle: function() {
          module.debug('Toggling pop-up');
          if( module.is.hidden() ) {
            module.debug('Popup is hidden, showing pop-up');
            module.unbind.close();
            module.hideAll();
            module.show();
          }
          else {
            module.debug('Popup is visible, hiding pop-up');
            module.hide();
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback) ? callback : function(){};
          module.debug('Showing pop-up', settings.transition);
          if(!settings.preserve && !settings.popup) {
            module.refresh();
          }
          if( !module.exists() ) {
            module.create();
          }
          if( $popup && module.set.position() ) {
            module.save.conditions();
            module.animate.show(callback);
          }
        },


        hide: function(callback) {
          callback = $.isFunction(callback) ? callback : function(){};
          module.remove.visible();
          module.unbind.close();
          if( module.is.visible() ) {
            module.restore.conditions();
            module.animate.hide(callback);
          }
        },

        hideAll: function() {
          $(selector.popup)
            .filter(':visible')
              .popup('hide')
          ;
        },

        hideGracefully: function(event) {
          // don't close on clicks inside popup
          if(event && $(event.target).closest(selector.popup).size() === 0) {
            module.debug('Click occurred outside popup hiding popup');
            module.hide();
          }
          else {
            module.debug('Click was inside popup, keeping popup open');
          }
        },

        exists: function() {
          if(!$popup) {
            return false;
          }
          if(settings.inline || settings.popup) {
            return ( $popup.size() !== 0 );
          }
          else {
            return ( $popup.closest($context).size() );
          }
        },

        removePopup: function() {
          module.debug('Removing popup');
          $.proxy(settings.onRemove, $popup)(element);
          if($popup.size() > 0) {
            $popup.remove();
          }
        },

        save: {
          conditions: function() {
            module.cache = {
              title: $module.attr('title')
            };
            if (module.cache.title) {
              $module.removeAttr('title');
            }
            module.verbose('Saving original attributes', module.cache.title);
          }
        },
        restore: {
          conditions: function() {
            element.blur();
            if(module.cache && module.cache.title) {
              $module.attr('title', module.cache.title);
              module.verbose('Restoring original attributes', module.cache.title);
            }
            return true;
          }
        },
        animate: {
          show: function(callback) {
            callback = $.isFunction(callback) ? callback : function(){};
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              module.set.visible();
              $popup
                .transition({
                  animation  : settings.transition + ' in',
                  queue      : false,
                  debug      : settings.debug,
                  verbose    : settings.verbose,
                  duration   : settings.duration,
                  onComplete : function() {
                    module.bind.close();
                    $.proxy(callback, $popup)(element);
                    $.proxy(settings.onVisible, $popup)(element);
                  }
                })
              ;
            }
            else {
              module.set.visible();
              $popup
                .stop()
                .fadeIn(settings.duration, settings.easing, function() {
                  module.bind.close();
                  $.proxy(callback, element)();
                })
              ;
            }
            $.proxy(settings.onShow, $popup)(element);
          },
          hide: function(callback) {
            callback = $.isFunction(callback) ? callback : function(){};
            module.debug('Hiding pop-up');
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $popup
                .transition({
                  animation  : settings.transition + ' out',
                  queue      : false,
                  duration   : settings.duration,
                  debug      : settings.debug,
                  verbose    : settings.verbose,
                  onComplete : function() {
                    module.reset();
                    $.proxy(callback, $popup)(element);
                    $.proxy(settings.onHidden, $popup)(element);
                  }
                })
              ;
            }
            else {
              $popup
                .stop()
                .fadeOut(settings.duration, settings.easing, function() {
                  module.reset();
                  callback();
                })
              ;
            }
            $.proxy(settings.onHide, $popup)(element);
          }
        },

        get: {
          startEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseenter';
            }
            else if(settings.on == 'focus') {
              return 'focus';
            }
            return false;
          },
          endEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseleave';
            }
            else if(settings.on == 'focus') {
              return 'blur';
            }
            return false;
          },
          offstagePosition: function(position) {
            var
              position = position || false,
              boundary  = {
                top    : $(window).scrollTop(),
                bottom : $(window).scrollTop() + $(window).height(),
                left   : 0,
                right  : $(window).width()
              },
              popup     = {
                width  : $popup.width(),
                height : $popup.height(),
                offset : $popup.offset()
              },
              offstage  = {},
              offstagePositions = []
            ;
            if(popup.offset && position) {
              module.verbose('Checking if outside viewable area', popup.offset);
              offstage = {
                top    : (popup.offset.top < boundary.top),
                bottom : (popup.offset.top + popup.height > boundary.bottom),
                right  : (popup.offset.left + popup.width > boundary.right),
                left   : (popup.offset.left < boundary.left)
              };
            }
            // return only boundaries that have been surpassed
            $.each(offstage, function(direction, isOffstage) {
              if(isOffstage) {
                offstagePositions.push(direction);
              }
            });
            return (offstagePositions.length > 0)
              ? offstagePositions.join(' ')
              : false
            ;
          },
          positions: function() {
            return {
              'top left'      : false,
              'top center'    : false,
              'top right'     : false,
              'bottom left'   : false,
              'bottom center' : false,
              'bottom right'  : false,
              'left center'   : false,
              'right center'  : false
            };
          },
          nextPosition: function(position) {
            var
              positions          = position.split(' '),
              verticalPosition   = positions[0],
              horizontalPosition = positions[1],
              opposite = {
                top    : 'bottom',
                bottom : 'top',
                left   : 'right',
                right  : 'left'
              },
              adjacent = {
                left   : 'center',
                center : 'right',
                right  : 'left'
              },
              backup = {
                'top left'      : 'top center',
                'top center'    : 'top right',
                'top right'     : 'right center',
                'right center'  : 'bottom right',
                'bottom right'  : 'bottom center',
                'bottom center' : 'bottom left',
                'bottom left'   : 'left center',
                'left center'   : 'top left'
              },
              adjacentsAvailable = (verticalPosition == 'top' || verticalPosition == 'bottom'),
              oppositeTried = false,
              adjacentTried = false,
              nextPosition  = false
            ;
            if(!triedPositions) {
              module.verbose('All available positions available');
              triedPositions = module.get.positions();
            }

            module.debug('Recording last position tried', position);
            triedPositions[position] = true;

            if(settings.prefer === 'opposite') {
              nextPosition  = [opposite[verticalPosition], horizontalPosition];
              nextPosition  = nextPosition.join(' ');
              oppositeTried = (triedPositions[nextPosition] === true);
              module.debug('Trying opposite strategy', nextPosition);
            }
            if((settings.prefer === 'adjacent') && adjacentsAvailable ) {
              nextPosition  = [verticalPosition, adjacent[horizontalPosition]];
              nextPosition  = nextPosition.join(' ');
              adjacentTried = (triedPositions[nextPosition] === true);
              module.debug('Trying adjacent strategy', nextPosition);
            }
            if(adjacentTried || oppositeTried) {
              module.debug('Using backup position', nextPosition);
              nextPosition = backup[position];
            }
            return nextPosition;
          }
        },

        set: {
          position: function(position, arrowOffset) {
            var
              windowWidth   = $(window).width(),
              windowHeight  = $(window).height(),

              targetWidth   = $target.outerWidth(),
              targetHeight  = $target.outerHeight(),

              popupWidth    = $popup.outerWidth(),
              popupHeight   = $popup.outerHeight(),

              parentWidth   = $offsetParent.outerWidth(),
              parentHeight  = $offsetParent.outerHeight(),

              distanceAway  = settings.distanceAway,

              targetElement = $target[0],

              marginTop     = (settings.inline)
                ? parseInt( window.getComputedStyle(targetElement).getPropertyValue('margin-top'), 10)
                : 0,
              marginLeft    = (settings.inline)
                ? parseInt( window.getComputedStyle(targetElement).getPropertyValue('margin-left'), 10)
                : 0,

              target        = (settings.inline || settings.popup)
                ? $target.position()
                : $target.offset(),

              positioning,
              offstagePosition
            ;
            position    = position    || $module.data(metadata.position)    || settings.position;
            arrowOffset = arrowOffset || $module.data(metadata.offset)      || settings.offset;

            if(searchDepth == settings.maxSearchDepth && settings.lastResort) {
              module.debug('Using last resort position to display', settings.lastResort);
              position = settings.lastResort;
            }

            if(settings.inline) {
              module.debug('Adding targets margin to calculation');
              if(position == 'left center' || position == 'right center') {
                arrowOffset  += marginTop;
                distanceAway += -marginLeft;
              }
              else if (position == 'top left' || position == 'top center' || position == 'top right') {
                arrowOffset  += marginLeft;
                distanceAway -= marginTop;
              }
              else {
                arrowOffset  += marginLeft;
                distanceAway += marginTop;
              }
            }
            module.debug('Calculating popup positioning', position);
            switch(position) {
              case 'top left':
                positioning = {
                  top    : 'auto',
                  bottom : parentHeight - target.top + distanceAway,
                  left   : target.left + arrowOffset,
                  right  : 'auto'
                };
              break;
              case 'top center':
                positioning = {
                  bottom : parentHeight - target.top + distanceAway,
                  left   : target.left + (targetWidth / 2) - (popupWidth / 2) + arrowOffset,
                  top    : 'auto',
                  right  : 'auto'
                };
              break;
              case 'top right':
                positioning = {
                  bottom :  parentHeight - target.top + distanceAway,
                  right  :  parentWidth - target.left - targetWidth - arrowOffset,
                  top    : 'auto',
                  left   : 'auto'
                };
              break;
              case 'left center':
                positioning = {
                  top    : target.top + (targetHeight / 2) - (popupHeight / 2) + arrowOffset,
                  right  : parentWidth - target.left + distanceAway,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
              case 'right center':
                positioning = {
                  top    : target.top + (targetHeight / 2) - (popupHeight / 2) + arrowOffset,
                  left   : target.left + targetWidth + distanceAway,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  left   : target.left + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom center':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  left   : target.left + (targetWidth / 2) - (popupWidth / 2) + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  right  : parentWidth - target.left  - targetWidth - arrowOffset,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
            }
            if(positioning === undefined) {
              module.error(error.invalidPosition, position);
            }

            module.debug('Calculated popup positioning values', positioning);

            // tentatively place on stage
            $popup
              .css(positioning)
              .removeClass(className.position)
              .addClass(position)
              .addClass(className.loading)
            ;
            // check if is offstage
            offstagePosition = module.get.offstagePosition(position);

            // recursively find new positioning
            if(offstagePosition) {
              module.debug('Popup cant fit into viewport', offstagePosition);
              if(searchDepth < settings.maxSearchDepth) {
                searchDepth++;
                position = module.get.nextPosition(position);
                module.debug('Trying new position', position);
                return ($popup)
                  ? module.set.position(position)
                  : false
                ;
              }
              else if(!settings.lastResort) {
                module.debug('Popup could not find a position in view', $popup);
                module.error(error.cannotPlace);
                module.remove.attempts();
                module.remove.loading();
                module.reset();
                return false;
              }
            }

            module.debug('Position is on stage', position);
            module.remove.attempts();
            module.set.fluidWidth();
            module.remove.loading();
            return true;
          },

          fluidWidth: function() {
            if( settings.setFluidWidth && $popup.hasClass(className.fluid) ) {
              $popup.css('width', $offsetParent.width());
            }
          },

          visible: function() {
            $module.addClass(className.visible);
          }
        },

        remove: {
          loading: function() {
            $popup.removeClass(className.loading);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          attempts: function() {
            module.verbose('Resetting all searched positions');
            searchDepth    = 0;
            triedPositions = false;
          }
        },

        bind: {
          popup: function() {
            module.verbose('Allowing hover events on popup to prevent closing');
            if($popup && $popup.size() > 0) {
              $popup
                .on('mouseenter' + eventNamespace, module.event.start)
                .on('mouseleave' + eventNamespace, module.event.end)
              ;
            }
          },
          close:function() {
            if(settings.hideOnScroll === true || settings.hideOnScroll == 'auto' && settings.on != 'click') {
              $document
                .one('touchmove' + eventNamespace, module.hideGracefully)
                .one('scroll' + eventNamespace, module.hideGracefully)
              ;
              $context
                .one('touchmove' + eventNamespace, module.hideGracefully)
                .one('scroll' + eventNamespace, module.hideGracefully)
              ;
            }
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Binding popup close event to document');
              $document
                .on('click' + eventNamespace, function(event) {
                  module.verbose('Pop-up clickaway intent detected');
                  $.proxy(module.hideGracefully, element)(event);
                })
              ;
            }
          }
        },

        unbind: {
          close: function() {
            if(settings.hideOnScroll === true || settings.hideOnScroll == 'auto' && settings.on != 'click') {
              $document
                .off('scroll' + eventNamespace, module.hide)
              ;
              $context
                .off('scroll' + eventNamespace, module.hide)
              ;
            }
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Removing close event from document');
              $document
                .off('click' + eventNamespace)
              ;
            }
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          animating: function() {
            return ( $popup && $popup.is(':animated') || $popup.hasClass(className.animating) );
          },
          visible: function() {
            return $popup && $popup.is(':visible');
          },
          dropdown: function() {
            return $module.hasClass(className.dropdown);
          },
          hidden: function() {
            return !module.is.visible();
          }
        },

        reset: function() {
          module.remove.visible();
          if(settings.preserve || settings.popup) {
            if($.fn.transition !== undefined) {
              $popup
                .transition('remove transition')
              ;
            }
          }
          else {
            module.removePopup();
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.popup.settings = {

  name         : 'Popup',

  debug        : false,
  verbose      : true,
  performance  : true,
  namespace    : 'popup',

  onCreate     : function(){},
  onRemove     : function(){},

  onShow       : function(){},
  onVisible    : function(){},
  onHide       : function(){},
  onHidden     : function(){},

  variation    : '',
  content      : false,
  html         : false,
  title        : false,

  on           : 'hover',
  closable     : true,
  hideOnScroll : 'auto',

  context      : 'body',

  position     : 'top left',
  prefer       : 'opposite',
  lastResort   : false,

  delay        : {
    show : 30,
    hide : 0
  },

  setFluidWidth  : true,

  target         : false,
  popup          : false,
  inline         : false,
  preserve       : true,
  hoverable      : false,

  duration       : 200,
  easing         : 'easeOutQuint',
  transition     : 'scale',

  distanceAway   : 0,
  offset         : 0,
  maxSearchDepth : 20,

  error: {
    invalidPosition : 'The position you specified is not a valid position',
    cannotPlace     : 'No visible position could be found for the popup',
    method          : 'The method you called is not defined.'
  },

  metadata: {
    content   : 'content',
    html      : 'html',
    offset    : 'offset',
    position  : 'position',
    title     : 'title',
    variation : 'variation'
  },

  className   : {
    active    : 'active',
    animating : 'animating',
    dropdown  : 'dropdown',
    fluid     : 'fluid',
    loading   : 'loading',
    popup     : 'ui popup',
    position  : 'top left center bottom right',
    visible   : 'visible'
  },

  selector    : {
    popup    : '.ui.popup'
  },

  templates: {
    escape: function(string) {
      var
        badChars     = /[&<>"'`]/g,
        shouldEscape = /[&<>"'`]/,
        escape       = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        },
        escapedChar  = function(chr) {
          return escape[chr];
        }
      ;
      if(shouldEscape.test(string)) {
        return string.replace(badChars, escapedChar);
      }
      return string;
    },
    popup: function(text) {
      var
        html   = '',
        escape = $.fn.popup.settings.templates.escape
      ;
      if(typeof text !== undefined) {
        if(typeof text.title !== undefined && text.title) {
          text.title = escape(text.title);
          html += '<div class="header">' + text.title + '</div>';
        }
        if(typeof text.content !== undefined && text.content) {
          text.content = escape(text.content);
          html += '<div class="content">' + text.content + '</div>';
        }
      }
      return html;
    }
  }

};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});


})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,o,i){"use strict";e.fn.popup=function(n){var r,s=e(this),a=e(o),p=s.selector||"",l=("ontouchstart"in o.documentElement,(new Date).getTime()),u=[],c=arguments[0],d="string"==typeof c,f=[].slice.call(arguments,1);return s.each(function(){var o,s,g,h=e.isPlainObject(n)?e.extend(!0,{},e.fn.popup.settings,n):e.extend({},e.fn.popup.settings),m=h.selector,b=h.className,v=h.error,y=h.metadata,w=h.namespace,x="."+h.namespace,P="module-"+w,C=e(this),T=e(h.context),k=h.target?e(h.target):C,O=e(t),S=e("body"),j=0,z=!1,A=this,R=C.data(P);g={initialize:function(){g.debug("Initializing module",C),g.refresh(),"click"==h.on?C.on("click"+x,g.toggle):g.get.startEvent()&&C.on(g.get.startEvent()+x,g.event.start).on(g.get.endEvent()+x,g.event.end),h.target&&g.debug("Target set to element",k),O.on("resize"+x,g.event.resize),g.exists()?h.hoverable&&g.bind.popup():g.create(),g.instantiate()},instantiate:function(){g.verbose("Storing instance of module",g),R=g,C.data(P,R)},refresh:function(){h.popup?o=e(h.popup):h.inline&&(o=k.next(h.selector.popup)),h.popup?(o.addClass(b.loading),s=o.offsetParent(),o.removeClass(b.loading)):s=h.inline?k.offsetParent():S,s.is("html")&&(g.debug("Page is popups offset parent"),s=S)},reposition:function(){g.refresh(),g.set.position()},destroy:function(){g.debug("Destroying previous module"),o&&!h.preserve&&g.removePopup(),C.off(x).removeData(P)},event:{start:function(){var t=e.isPlainObject(h.delay)?h.delay.show:h.delay;clearTimeout(g.hideTimer),g.showTimer=setTimeout(function(){!g.is.hidden()||g.is.active()&&g.is.dropdown()||g.show()},t)},end:function(){var t=e.isPlainObject(h.delay)?h.delay.hide:h.delay;clearTimeout(g.showTimer),g.hideTimer=setTimeout(function(){g.is.visible()&&g.hide()},t)},resize:function(){g.is.visible()&&g.set.position()}},create:function(){var t=C.data(y.html)||h.html,i=C.data(y.variation)||h.variation,n=C.data(y.title)||h.title,r=C.data(y.content)||C.attr("title")||h.content;t||r||n?(g.debug("Creating pop-up html"),t||(t=h.templates.popup({title:n,content:r})),o=e("<div/>").addClass(b.popup).addClass(i).html(t),i&&o.addClass(i),h.inline?(g.verbose("Inserting popup element inline",o),o.insertAfter(C)):(g.verbose("Appending popup element to body",o),o.appendTo(T)),h.hoverable&&g.bind.popup(),e.proxy(h.onCreate,o)(A)):0!==k.next(h.selector.popup).size()?(g.verbose("Pre-existing popup found, reverting to inline"),h.inline=!0,g.refresh(),h.hoverable&&g.bind.popup()):g.debug("No content specified skipping display",A)},toggle:function(){g.debug("Toggling pop-up"),g.is.hidden()?(g.debug("Popup is hidden, showing pop-up"),g.unbind.close(),g.hideAll(),g.show()):(g.debug("Popup is visible, hiding pop-up"),g.hide())},show:function(t){t=e.isFunction(t)?t:function(){},g.debug("Showing pop-up",h.transition),h.preserve||h.popup||g.refresh(),g.exists()||g.create(),o&&g.set.position()&&(g.save.conditions(),g.animate.show(t))},hide:function(t){t=e.isFunction(t)?t:function(){},g.remove.visible(),g.unbind.close(),g.is.visible()&&(g.restore.conditions(),g.animate.hide(t))},hideAll:function(){e(m.popup).filter(":visible").popup("hide")},hideGracefully:function(t){t&&0===e(t.target).closest(m.popup).size()?(g.debug("Click occurred outside popup hiding popup"),g.hide()):g.debug("Click was inside popup, keeping popup open")},exists:function(){return o?h.inline||h.popup?0!==o.size():o.closest(T).size():!1},removePopup:function(){g.debug("Removing popup"),e.proxy(h.onRemove,o)(A),o.size()>0&&o.remove()},save:{conditions:function(){g.cache={title:C.attr("title")},g.cache.title&&C.removeAttr("title"),g.verbose("Saving original attributes",g.cache.title)}},restore:{conditions:function(){return A.blur(),g.cache&&g.cache.title&&(C.attr("title",g.cache.title),g.verbose("Restoring original attributes",g.cache.title)),!0}},animate:{show:function(t){t=e.isFunction(t)?t:function(){},h.transition&&e.fn.transition!==i&&C.transition("is supported")?(g.set.visible(),o.transition({animation:h.transition+" in",queue:!1,debug:h.debug,verbose:h.verbose,duration:h.duration,onComplete:function(){g.bind.close(),e.proxy(t,o)(A),e.proxy(h.onVisible,o)(A)}})):(g.set.visible(),o.stop().fadeIn(h.duration,h.easing,function(){g.bind.close(),e.proxy(t,A)()})),e.proxy(h.onShow,o)(A)},hide:function(t){t=e.isFunction(t)?t:function(){},g.debug("Hiding pop-up"),h.transition&&e.fn.transition!==i&&C.transition("is supported")?o.transition({animation:h.transition+" out",queue:!1,duration:h.duration,debug:h.debug,verbose:h.verbose,onComplete:function(){g.reset(),e.proxy(t,o)(A),e.proxy(h.onHidden,o)(A)}}):o.stop().fadeOut(h.duration,h.easing,function(){g.reset(),t()}),e.proxy(h.onHide,o)(A)}},get:{startEvent:function(){return"hover"==h.on?"mouseenter":"focus"==h.on?"focus":!1},endEvent:function(){return"hover"==h.on?"mouseleave":"focus"==h.on?"blur":!1},offstagePosition:function(i){var i=i||!1,n={top:e(t).scrollTop(),bottom:e(t).scrollTop()+e(t).height(),left:0,right:e(t).width()},r={width:o.width(),height:o.height(),offset:o.offset()},s={},a=[];return r.offset&&i&&(g.verbose("Checking if outside viewable area",r.offset),s={top:r.offset.top<n.top,bottom:r.offset.top+r.height>n.bottom,right:r.offset.left+r.width>n.right,left:r.offset.left<n.left}),e.each(s,function(e,t){t&&a.push(e)}),a.length>0?a.join(" "):!1},positions:function(){return{"top left":!1,"top center":!1,"top right":!1,"bottom left":!1,"bottom center":!1,"bottom right":!1,"left center":!1,"right center":!1}},nextPosition:function(e){var t=e.split(" "),o=t[0],i=t[1],n={top:"bottom",bottom:"top",left:"right",right:"left"},r={left:"center",center:"right",right:"left"},s={"top left":"top center","top center":"top right","top right":"right center","right center":"bottom right","bottom right":"bottom center","bottom center":"bottom left","bottom left":"left center","left center":"top left"},a="top"==o||"bottom"==o,p=!1,l=!1,u=!1;return z||(g.verbose("All available positions available"),z=g.get.positions()),g.debug("Recording last position tried",e),z[e]=!0,"opposite"===h.prefer&&(u=[n[o],i],u=u.join(" "),p=z[u]===!0,g.debug("Trying opposite strategy",u)),"adjacent"===h.prefer&&a&&(u=[o,r[i]],u=u.join(" "),l=z[u]===!0,g.debug("Trying adjacent strategy",u)),(l||p)&&(g.debug("Using backup position",u),u=s[e]),u}},set:{position:function(n,r){var a,p,l=(e(t).width(),e(t).height(),k.outerWidth()),u=k.outerHeight(),c=o.outerWidth(),d=o.outerHeight(),f=s.outerWidth(),m=s.outerHeight(),w=h.distanceAway,x=k[0],P=h.inline?parseInt(t.getComputedStyle(x).getPropertyValue("margin-top"),10):0,T=h.inline?parseInt(t.getComputedStyle(x).getPropertyValue("margin-left"),10):0,O=h.inline||h.popup?k.position():k.offset();switch(n=n||C.data(y.position)||h.position,r=r||C.data(y.offset)||h.offset,j==h.maxSearchDepth&&h.lastResort&&(g.debug("Using last resort position to display",h.lastResort),n=h.lastResort),h.inline&&(g.debug("Adding targets margin to calculation"),"left center"==n||"right center"==n?(r+=P,w+=-T):"top left"==n||"top center"==n||"top right"==n?(r+=T,w-=P):(r+=T,w+=P)),g.debug("Calculating popup positioning",n),n){case"top left":a={top:"auto",bottom:m-O.top+w,left:O.left+r,right:"auto"};break;case"top center":a={bottom:m-O.top+w,left:O.left+l/2-c/2+r,top:"auto",right:"auto"};break;case"top right":a={bottom:m-O.top+w,right:f-O.left-l-r,top:"auto",left:"auto"};break;case"left center":a={top:O.top+u/2-d/2+r,right:f-O.left+w,left:"auto",bottom:"auto"};break;case"right center":a={top:O.top+u/2-d/2+r,left:O.left+l+w,bottom:"auto",right:"auto"};break;case"bottom left":a={top:O.top+u+w,left:O.left+r,bottom:"auto",right:"auto"};break;case"bottom center":a={top:O.top+u+w,left:O.left+l/2-c/2+r,bottom:"auto",right:"auto"};break;case"bottom right":a={top:O.top+u+w,right:f-O.left-l-r,left:"auto",bottom:"auto"}}if(a===i&&g.error(v.invalidPosition,n),g.debug("Calculated popup positioning values",a),o.css(a).removeClass(b.position).addClass(n).addClass(b.loading),p=g.get.offstagePosition(n)){if(g.debug("Popup cant fit into viewport",p),j<h.maxSearchDepth)return j++,n=g.get.nextPosition(n),g.debug("Trying new position",n),o?g.set.position(n):!1;if(!h.lastResort)return g.debug("Popup could not find a position in view",o),g.error(v.cannotPlace),g.remove.attempts(),g.remove.loading(),g.reset(),!1}return g.debug("Position is on stage",n),g.remove.attempts(),g.set.fluidWidth(),g.remove.loading(),!0},fluidWidth:function(){h.setFluidWidth&&o.hasClass(b.fluid)&&o.css("width",s.width())},visible:function(){C.addClass(b.visible)}},remove:{loading:function(){o.removeClass(b.loading)},visible:function(){C.removeClass(b.visible)},attempts:function(){g.verbose("Resetting all searched positions"),j=0,z=!1}},bind:{popup:function(){g.verbose("Allowing hover events on popup to prevent closing"),o&&o.size()>0&&o.on("mouseenter"+x,g.event.start).on("mouseleave"+x,g.event.end)},close:function(){(h.hideOnScroll===!0||"auto"==h.hideOnScroll&&"click"!=h.on)&&(a.one("touchmove"+x,g.hideGracefully).one("scroll"+x,g.hideGracefully),T.one("touchmove"+x,g.hideGracefully).one("scroll"+x,g.hideGracefully)),"click"==h.on&&h.closable&&(g.verbose("Binding popup close event to document"),a.on("click"+x,function(t){g.verbose("Pop-up clickaway intent detected"),e.proxy(g.hideGracefully,A)(t)}))}},unbind:{close:function(){(h.hideOnScroll===!0||"auto"==h.hideOnScroll&&"click"!=h.on)&&(a.off("scroll"+x,g.hide),T.off("scroll"+x,g.hide)),"click"==h.on&&h.closable&&(g.verbose("Removing close event from document"),a.off("click"+x))}},is:{active:function(){return C.hasClass(b.active)},animating:function(){return o&&o.is(":animated")||o.hasClass(b.animating)},visible:function(){return o&&o.is(":visible")},dropdown:function(){return C.hasClass(b.dropdown)},hidden:function(){return!g.is.visible()}},reset:function(){g.remove.visible(),h.preserve||h.popup?e.fn.transition!==i&&o.transition("remove transition"):g.removePopup()},setting:function(t,o){if(e.isPlainObject(t))e.extend(!0,h,t);else{if(o===i)return h[t];h[t]=o}},internal:function(t,o){if(e.isPlainObject(t))e.extend(!0,g,t);else{if(o===i)return g[t];g[t]=o}},debug:function(){h.debug&&(h.performance?g.performance.log(arguments):(g.debug=Function.prototype.bind.call(console.info,console,h.name+":"),g.debug.apply(console,arguments)))},verbose:function(){h.verbose&&h.debug&&(h.performance?g.performance.log(arguments):(g.verbose=Function.prototype.bind.call(console.info,console,h.name+":"),g.verbose.apply(console,arguments)))},error:function(){g.error=Function.prototype.bind.call(console.error,console,h.name+":"),g.error.apply(console,arguments)},performance:{log:function(e){var t,o,i;h.performance&&(t=(new Date).getTime(),i=l||t,o=t-i,l=t,u.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:A,"Execution Time":o})),clearTimeout(g.performance.timer),g.performance.timer=setTimeout(g.performance.display,100)},display:function(){var t=h.name+":",o=0;l=!1,clearTimeout(g.performance.timer),e.each(u,function(e,t){o+=t["Execution Time"]}),t+=" "+o+"ms",p&&(t+=" '"+p+"'"),(console.group!==i||console.table!==i)&&u.length>0&&(console.groupCollapsed(t),console.table?console.table(u):e.each(u,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),u=[]}},invoke:function(t,o,n){var s,a,p,l=R;return o=o||f,n=A||n,"string"==typeof t&&l!==i&&(t=t.split(/[\. ]/),s=t.length-1,e.each(t,function(o,n){var r=o!=s?n+t[o+1].charAt(0).toUpperCase()+t[o+1].slice(1):t;if(e.isPlainObject(l[r])&&o!=s)l=l[r];else{if(l[r]!==i)return a=l[r],!1;if(!e.isPlainObject(l[n])||o==s)return l[n]!==i?(a=l[n],!1):!1;l=l[n]}})),e.isFunction(a)?p=a.apply(n,o):a!==i&&(p=a),e.isArray(r)?r.push(p):r!==i?r=[r,p]:p!==i&&(r=p),a}},d?(R===i&&g.initialize(),g.invoke(c)):(R!==i&&g.destroy(),g.initialize())}),r!==i?r:this},e.fn.popup.settings={name:"Popup",debug:!1,verbose:!0,performance:!0,namespace:"popup",onCreate:function(){},onRemove:function(){},onShow:function(){},onVisible:function(){},onHide:function(){},onHidden:function(){},variation:"",content:!1,html:!1,title:!1,on:"hover",closable:!0,hideOnScroll:"auto",context:"body",position:"top left",prefer:"opposite",lastResort:!1,delay:{show:30,hide:0},setFluidWidth:!0,target:!1,popup:!1,inline:!1,preserve:!0,hoverable:!1,duration:200,easing:"easeOutQuint",transition:"scale",distanceAway:0,offset:0,maxSearchDepth:20,error:{invalidPosition:"The position you specified is not a valid position",cannotPlace:"No visible position could be found for the popup",method:"The method you called is not defined."},metadata:{content:"content",html:"html",offset:"offset",position:"position",title:"title",variation:"variation"},className:{active:"active",animating:"animating",dropdown:"dropdown",fluid:"fluid",loading:"loading",popup:"ui popup",position:"top left center bottom right",visible:"visible"},selector:{popup:".ui.popup"},templates:{escape:function(e){var t=/[&<>"'`]/g,o=/[&<>"'`]/,i={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},n=function(e){return i[e]};return o.test(e)?e.replace(t,n):e},popup:function(t){var o="",n=e.fn.popup.settings.templates.escape;return typeof t!==i&&(typeof t.title!==i&&t.title&&(t.title=n(t.title),o+='<div class="header">'+t.title+"</div>"),typeof t.content!==i&&t.content&&(t.content=n(t.content),o+='<div class="content">'+t.content+"</div>")),o}}},e.extend(e.easing,{easeOutQuad:function(e,t,o,i,n){return-i*(t/=n)*(t-2)+o}})}(jQuery,window,document);
/*
 * # Semantic - Progress
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.progress = function(parameters) {
  var
    $allModules    = $(this),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.progress.settings, parameters)
          : $.extend({}, $.fn.progress.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $bar            = $(this).find(selector.bar),
        $progress       = $(this).find(selector.progress),
        $label          = $(this).find(selector.label),

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing progress', settings);
          module.read.metadata();
          module.set.initials();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of progress', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous progress for', $module);
          module.remove.state();
          $module.removeData(moduleNamespace);
          instance = undefined;
        },

        reset: function() {
          module.set.percent(0);
        },

        complete: function() {
          if(module.percent === undefined || module.percent < 100) {
            module.set.percent(100);
          }
        },

        read: {
          metadata: function() {
            if( $module.data(metadata.percent) ) {
              module.verbose('Current percent value set from metadata');
              module.percent = $module.data(metadata.percent);
            }
            if( $module.data(metadata.total) ) {
              module.verbose('Total value set from metadata');
              module.total = $module.data(metadata.total);
            }
            if( $module.data(metadata.value) ) {
              module.verbose('Current value set from metadata');
              module.value = $module.data(metadata.value);
            }
          },
          currentValue: function() {
            return (module.value !== undefined)
              ? module.value
              : false
            ;
          }
        },

        increment: function(incrementValue) {
          var
            total          = module.total || false,
            edgeValue,
            startValue,
            newValue
          ;
          if(total) {
            startValue     = module.value || 0;
            incrementValue = incrementValue || 1;
            newValue       = startValue + incrementValue;
            edgeValue      = module.total;
            module.debug('Incrementing value by', incrementValue, startValue, edgeValue);
            if(newValue > edgeValue ) {
              module.debug('Value cannot increment above total', edgeValue);
              newValue = edgeValue;
            }
            module.set.progress(newValue);
          }
          else {
            startValue     = module.percent || 0;
            incrementValue = incrementValue || module.get.randomValue();
            newValue       = startValue + incrementValue;
            edgeValue      = 100;
            module.debug('Incrementing percentage by', incrementValue, startValue);
            if(newValue > edgeValue ) {
              module.debug('Value cannot increment above 100 percent');
              newValue = edgeValue;
            }
            module.set.progress(newValue);
          }
        },
        decrement: function(decrementValue) {
          var
            total     = module.total || false,
            edgeValue = 0,
            startValue,
            newValue
          ;
          if(total) {
            startValue     =  module.value   || 0;
            decrementValue =  decrementValue || 1;
            newValue       =  startValue - decrementValue;
            module.debug('Decrementing value by', decrementValue, startValue);
          }
          else {
            startValue     =  module.percent || 0;
            decrementValue =  decrementValue || module.get.randomValue();
            newValue       =  startValue - decrementValue;
            module.debug('Decrementing percentage by', decrementValue, startValue);
          }

          if(newValue < edgeValue) {
            module.debug('Value cannot decrement below 0');
            newValue = 0;
          }
          module.set.progress(newValue);
        },

        get: {
          text: function(templateText) {
            var
              value   = module.value || 0,
              total   = module.total || 0,
              percent = module.percent || 0
            ;
            templateText = templateText || '';
            templateText = templateText
              .replace('{value}', value)
              .replace('{total}', total)
              .replace('{percent}', percent)
            ;
            module.debug('Adding variables to progress bar text', templateText);
            return templateText;
          },
          randomValue: function() {
            module.debug('Generating random increment percentage');
            return Math.floor((Math.random() * settings.random.max) + settings.random.min);
          },
          percent: function() {
            return module.percent || 0;
          },
          value: function() {
            return module.value || false;
          },
          total: function() {
            return module.total || false;
          }
        },

        is: {
          success: function() {
            return $module.hasClass(className.success);
          },
          warning: function() {
            return $module.hasClass(className.warning);
          },
          error: function() {
            return $module.hasClass(className.error);
          }
        },

        remove: {
          state: function() {
            module.verbose('Removing stored state');
            delete module.total;
            delete module.percent;
            delete module.value;
          },
          active: function() {
            module.verbose('Removing active state');
            $module.removeClass(className.active);
          },
          success: function() {
            module.verbose('Removing success state');
            $module.removeClass(className.success);
          },
          warning: function() {
            module.verbose('Removing warning state');
            $module.removeClass(className.warning);
          },
          error: function() {
            module.verbose('Removing error state');
            $module.removeClass(className.error);
          }
        },

        set: {
          barWidth: function(value) {
            if(value > 100) {
              module.error(error.tooHigh, value);
            }
            else if (value < 0) {
              module.error(error.tooLow, value);
            }
            else {
              $bar
                .css('width', value + '%')
              ;
              $module
                .attr('data-percent', parseInt(value, 10))
              ;
            }
          },
          initials: function() {

            if(settings.total !== false) {
              module.verbose('Current total set in settings', settings.total);
              module.total = settings.total;
            }
            if(settings.value !== false) {
              module.verbose('Current value set in settings', settings.value);
              module.value = settings.value;
            }
            if(settings.percent !== false) {
              module.verbose('Current percent set in settings', settings.percent);
              module.percent = settings.percent;
            }

            if(module.percent !== undefined) {
              module.set.percent(module.percent);
            }
            else if(module.value !== undefined) {
              module.set.progress(module.value);
            }
          },
          percent: function(percent) {
            percent = (typeof percent == 'string')
              ? +(percent.replace('%', ''))
              : percent
            ;
            if(percent > 0 && percent < 1) {
              module.verbose('Module percentage passed as decimal, converting');
              percent = percent * 100;
            }
            // round percentage
            if(settings.precision === 0) {
              percent = Math.round(percent);
            }
            else {
              percent = Math.round(percent * (10 * settings.precision) / (10 * settings.precision) );
            }
            module.percent = percent;
            if(module.total) {
              module.value = Math.round( (percent / 100) * module.total);
            }
            if(settings.limitValues) {
              module.value = (module.value > 100)
                ? 100
                : (module.value < 0)
                  ? 0
                  : module.value
              ;
            }
            module.set.barWidth(percent);
            module.set.barLabel();
            if(percent === 100) {
              if(settings.autoSuccess && !(module.is.warning() || module.is.error())) {
                module.set.success();
                module.debug('Automatically triggering success at 100%');
              }
              else {
                module.remove.active();
              }
            }
            else if(percent > 0) {
              module.set.active();
            }
            $.proxy(settings.onChange, element)(percent, module.value, module.total);
          },
          label: function(text) {
            text = text || '';
            if(text) {
              text = module.get.text(text);
              module.debug('Setting label to text', text);
              $label.text(text);
            }
          },
          barLabel: function(text) {
            if(text !== undefined) {
              $progress.text( module.get.text(text) );
            }
            else if(settings.label == 'ratio' && module.total) {
              module.debug('Adding ratio to bar label');
              $progress.text( module.get.text(settings.text.ratio) );
            }
            else if(settings.label == 'percent') {
              module.debug('Adding percentage to bar label');
              $progress.text( module.get.text(settings.text.percent) );
            }
          },
          active: function(text) {
            text = text || settings.text.active;
            module.debug('Setting active state');
            if(settings.showActivity) {
              $module.addClass(className.active);
            }
            module.remove.warning();
            module.remove.error();
            module.remove.success();
            if(text) {
              module.set.label(text);
            }
            $.proxy(settings.onActive, element)(module.value, module.total);
          },
          success : function(text) {
            text = text || settings.text.success;
            module.debug('Setting success state');
            $module.addClass(className.success);
            module.remove.active();
            module.remove.warning();
            module.remove.error();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            $.proxy(settings.onSuccess, element)(module.total);
          },
          warning : function(text) {
            text = text || settings.text.warning;
            module.debug('Setting warning state');
            $module.addClass(className.warning);
            module.remove.active();
            module.remove.success();
            module.remove.error();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            $.proxy(settings.onWarning, element)(module.value, module.total);
          },
          error : function(text) {
            text = text || settings.text.error;
            module.debug('Setting error state');
            $module.addClass(className.error);
            module.remove.active();
            module.remove.success();
            module.remove.warning();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            $.proxy(settings.onError, element)(module.value, module.total);
          },
          total: function(totalValue) {
            module.total = totalValue;
          },
          progress: function(value) {
            var
              numericValue = (typeof value === 'string')
                ? (value.replace(/[^\d.]/g, '') !== '')
                  ? +(value.replace(/[^\d.]/g, ''))
                  : false
                : value,
              percentComplete
            ;
            if(numericValue === false) {
              module.error(error.nonNumeric, value);
            }
            if(module.total) {
              module.value    = numericValue;
              percentComplete = (numericValue / module.total) * 100;
              module.debug('Calculating percent complete from total', percentComplete);
              module.set.percent( percentComplete );
            }
            else {
              percentComplete = numericValue;
              module.debug('Setting value to exact percentage value', percentComplete);
              module.set.percent( percentComplete );
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.progress.settings = {

  name         : 'Progress',
  namespace    : 'progress',

  debug        : false,
  verbose      : true,
  performance  : true,

  random       : {
    min : 2,
    max : 5
  },

  autoSuccess  : true,
  showActivity : true,
  limitValues  : true,

  label        : 'percent',
  precision    : 1,

  percent      : false,
  total        : false,
  value        : false,

  onChange     : function(percent, value, total){},
  onSuccess    : function(total){},
  onActive     : function(value, total){},
  onError      : function(value, total){},
  onWarning    : function(value, total){},

  error    : {
    method     : 'The method you called is not defined.',
    nonNumeric : 'Progress value is non numeric',
    tooHigh    : 'Value specified is above 100%',
    tooLow     : 'Value specified is below 0%'
  },

  regExp: {
    variable: /\{\$*[A-z0-9]+\}/g
  },

  metadata: {
    percent : 'percent',
    total   : 'total',
    value   : 'value'
  },

  selector : {
    bar      : '> .bar',
    label    : '> .label',
    progress : '.bar > .progress'
  },

  text : {
    active  : false,
    error   : false,
    success : false,
    warning : false,
    percent : '{percent}%',
    ratio   : '{value} of {total}'
  },

  className : {
    active  : 'active',
    error   : 'error',
    success : 'success',
    warning : 'warning'
  }

};


})( jQuery, window , document );
 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,n,r){"use strict";e.fn.progress=function(t){var n,a=e(this),o=a.selector||"",s=(new Date).getTime(),i=[],c=arguments[0],l="string"==typeof c,u=[].slice.call(arguments,1);return a.each(function(){var a,g=e.isPlainObject(t)?e.extend(!0,{},e.fn.progress.settings,t):e.extend({},e.fn.progress.settings),p=g.className,v=g.metadata,m=g.namespace,d=g.selector,b=g.error,f="module-"+m,h=e(this),x=e(this).find(d.bar),y=e(this).find(d.progress),w=e(this).find(d.label),C=this,A=h.data(f);a={initialize:function(){a.debug("Initializing progress",g),a.read.metadata(),a.set.initials(),a.instantiate()},instantiate:function(){a.verbose("Storing instance of progress",a),A=a,h.data(f,a)},destroy:function(){a.verbose("Destroying previous progress for",h),a.remove.state(),h.removeData(f),A=r},reset:function(){a.set.percent(0)},complete:function(){(a.percent===r||a.percent<100)&&a.set.percent(100)},read:{metadata:function(){h.data(v.percent)&&(a.verbose("Current percent value set from metadata"),a.percent=h.data(v.percent)),h.data(v.total)&&(a.verbose("Total value set from metadata"),a.total=h.data(v.total)),h.data(v.value)&&(a.verbose("Current value set from metadata"),a.value=h.data(v.value))},currentValue:function(){return a.value!==r?a.value:!1}},increment:function(e){var t,n,r,o=a.total||!1;o?(n=a.value||0,e=e||1,r=n+e,t=a.total,a.debug("Incrementing value by",e,n,t),r>t&&(a.debug("Value cannot increment above total",t),r=t),a.set.progress(r)):(n=a.percent||0,e=e||a.get.randomValue(),r=n+e,t=100,a.debug("Incrementing percentage by",e,n),r>t&&(a.debug("Value cannot increment above 100 percent"),r=t),a.set.progress(r))},decrement:function(e){var t,n,r=a.total||!1,o=0;r?(t=a.value||0,e=e||1,n=t-e,a.debug("Decrementing value by",e,t)):(t=a.percent||0,e=e||a.get.randomValue(),n=t-e,a.debug("Decrementing percentage by",e,t)),o>n&&(a.debug("Value cannot decrement below 0"),n=0),a.set.progress(n)},get:{text:function(e){var t=a.value||0,n=a.total||0,r=a.percent||0;return e=e||"",e=e.replace("{value}",t).replace("{total}",n).replace("{percent}",r),a.debug("Adding variables to progress bar text",e),e},randomValue:function(){return a.debug("Generating random increment percentage"),Math.floor(Math.random()*g.random.max+g.random.min)},percent:function(){return a.percent||0},value:function(){return a.value||!1},total:function(){return a.total||!1}},is:{success:function(){return h.hasClass(p.success)},warning:function(){return h.hasClass(p.warning)},error:function(){return h.hasClass(p.error)}},remove:{state:function(){a.verbose("Removing stored state"),delete a.total,delete a.percent,delete a.value},active:function(){a.verbose("Removing active state"),h.removeClass(p.active)},success:function(){a.verbose("Removing success state"),h.removeClass(p.success)},warning:function(){a.verbose("Removing warning state"),h.removeClass(p.warning)},error:function(){a.verbose("Removing error state"),h.removeClass(p.error)}},set:{barWidth:function(e){e>100?a.error(b.tooHigh,e):0>e?a.error(b.tooLow,e):(x.css("width",e+"%"),h.attr("data-percent",parseInt(e,10)))},initials:function(){g.total!==!1&&(a.verbose("Current total set in settings",g.total),a.total=g.total),g.value!==!1&&(a.verbose("Current value set in settings",g.value),a.value=g.value),g.percent!==!1&&(a.verbose("Current percent set in settings",g.percent),a.percent=g.percent),a.percent!==r?a.set.percent(a.percent):a.value!==r&&a.set.progress(a.value)},percent:function(t){t="string"==typeof t?+t.replace("%",""):t,t>0&&1>t&&(a.verbose("Module percentage passed as decimal, converting"),t=100*t),t=Math.round(0===g.precision?t:10*t*g.precision/(10*g.precision)),a.percent=t,a.total&&(a.value=Math.round(t/100*a.total)),g.limitValues&&(a.value=a.value>100?100:a.value<0?0:a.value),a.set.barWidth(t),a.set.barLabel(),100===t?!g.autoSuccess||a.is.warning()||a.is.error()?a.remove.active():(a.set.success(),a.debug("Automatically triggering success at 100%")):t>0&&a.set.active(),e.proxy(g.onChange,C)(t,a.value,a.total)},label:function(e){e=e||"",e&&(e=a.get.text(e),a.debug("Setting label to text",e),w.text(e))},barLabel:function(e){e!==r?y.text(a.get.text(e)):"ratio"==g.label&&a.total?(a.debug("Adding ratio to bar label"),y.text(a.get.text(g.text.ratio))):"percent"==g.label&&(a.debug("Adding percentage to bar label"),y.text(a.get.text(g.text.percent)))},active:function(t){t=t||g.text.active,a.debug("Setting active state"),g.showActivity&&h.addClass(p.active),a.remove.warning(),a.remove.error(),a.remove.success(),t&&a.set.label(t),e.proxy(g.onActive,C)(a.value,a.total)},success:function(t){t=t||g.text.success,a.debug("Setting success state"),h.addClass(p.success),a.remove.active(),a.remove.warning(),a.remove.error(),a.complete(),t&&a.set.label(t),e.proxy(g.onSuccess,C)(a.total)},warning:function(t){t=t||g.text.warning,a.debug("Setting warning state"),h.addClass(p.warning),a.remove.active(),a.remove.success(),a.remove.error(),a.complete(),t&&a.set.label(t),e.proxy(g.onWarning,C)(a.value,a.total)},error:function(t){t=t||g.text.error,a.debug("Setting error state"),h.addClass(p.error),a.remove.active(),a.remove.success(),a.remove.warning(),a.complete(),t&&a.set.label(t),e.proxy(g.onError,C)(a.value,a.total)},total:function(e){a.total=e},progress:function(e){var t,n="string"==typeof e?""!==e.replace(/[^\d.]/g,"")?+e.replace(/[^\d.]/g,""):!1:e;n===!1&&a.error(b.nonNumeric,e),a.total?(a.value=n,t=n/a.total*100,a.debug("Calculating percent complete from total",t),a.set.percent(t)):(t=n,a.debug("Setting value to exact percentage value",t),a.set.percent(t))}},setting:function(t,n){if(a.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,g,t);else{if(n===r)return g[t];g[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,a,t);else{if(n===r)return a[t];a[t]=n}},debug:function(){g.debug&&(g.performance?a.performance.log(arguments):(a.debug=Function.prototype.bind.call(console.info,console,g.name+":"),a.debug.apply(console,arguments)))},verbose:function(){g.verbose&&g.debug&&(g.performance?a.performance.log(arguments):(a.verbose=Function.prototype.bind.call(console.info,console,g.name+":"),a.verbose.apply(console,arguments)))},error:function(){a.error=Function.prototype.bind.call(console.error,console,g.name+":"),a.error.apply(console,arguments)},performance:{log:function(e){var t,n,r;g.performance&&(t=(new Date).getTime(),r=s||t,n=t-r,s=t,i.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:C,"Execution Time":n})),clearTimeout(a.performance.timer),a.performance.timer=setTimeout(a.performance.display,100)},display:function(){var t=g.name+":",n=0;s=!1,clearTimeout(a.performance.timer),e.each(i,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",o&&(t+=" '"+o+"'"),(console.group!==r||console.table!==r)&&i.length>0&&(console.groupCollapsed(t),console.table?console.table(i):e.each(i,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),i=[]}},invoke:function(t,o,s){var i,c,l,g=A;return o=o||u,s=C||s,"string"==typeof t&&g!==r&&(t=t.split(/[\. ]/),i=t.length-1,e.each(t,function(n,o){var s=n!=i?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(g[s])&&n!=i)g=g[s];else{if(g[s]!==r)return c=g[s],!1;if(!e.isPlainObject(g[o])||n==i)return g[o]!==r?(c=g[o],!1):(a.error(b.method,t),!1);g=g[o]}})),e.isFunction(c)?l=c.apply(s,o):c!==r&&(l=c),e.isArray(n)?n.push(l):n!==r?n=[n,l]:l!==r&&(n=l),c}},l?(A===r&&a.initialize(),a.invoke(c)):(A!==r&&a.destroy(),a.initialize())}),n!==r?n:this},e.fn.progress.settings={name:"Progress",namespace:"progress",debug:!1,verbose:!0,performance:!0,random:{min:2,max:5},autoSuccess:!0,showActivity:!0,limitValues:!0,label:"percent",precision:1,percent:!1,total:!1,value:!1,onChange:function(){},onSuccess:function(){},onActive:function(){},onError:function(){},onWarning:function(){},error:{method:"The method you called is not defined.",nonNumeric:"Progress value is non numeric",tooHigh:"Value specified is above 100%",tooLow:"Value specified is below 0%"},regExp:{variable:/\{\$*[A-z0-9]+\}/g},metadata:{percent:"percent",total:"total",value:"value"},selector:{bar:"> .bar",label:"> .label",progress:".bar > .progress"},text:{active:!1,error:!1,success:!1,warning:!1,percent:"{percent}%",ratio:"{value} of {total}"},className:{active:"active",error:"error",success:"success",warning:"warning"}}}(jQuery,window,document);
/*
 * # Semantic - Rating
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.rating = function(parameters) {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.rating.settings, parameters)
          : $.extend({}, $.fn.rating.settings),

        namespace       = settings.namespace,
        className       = settings.className,
        metadata        = settings.metadata,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        element         = this,
        instance        = $(this).data(moduleNamespace),

        $module         = $(this),
        $icon           = $module.find(selector.icon),

        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing rating module', settings);

          if($icon.size() === 0) {
            module.setup.layout();
          }

          if(settings.interactive) {
            module.enable();
          }
          else {
            module.disable();
          }
          if(settings.initialRating) {
            module.debug('Setting initial rating');
            module.setRating(settings.initialRating);
          }
          if( $module.data(metadata.rating) ) {
            module.debug('Rating found in metadata');
            module.setRating( $module.data(metadata.rating) );
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Instantiating module', settings);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous instance', instance);
          $module
            .removeData(moduleNamespace)
          ;
          $icon
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          $icon   = $module.find(selector.icon);
        },

        setup: {
          layout: function() {
            var
              maxRating = $module.data(metadata.maxRating) || settings.maxRating
            ;
            module.debug('Generating icon html dynamically');
            $module
              .html($.fn.rating.settings.templates.icon(maxRating))
            ;
            module.refresh();
          }
        },

        event: {
          mouseenter: function() {
            var
              $activeIcon = $(this)
            ;
            $activeIcon
              .nextAll()
                .removeClass(className.selected)
            ;
            $module
              .addClass(className.selected)
            ;
            $activeIcon
              .addClass(className.selected)
                .prevAll()
                .addClass(className.selected)
            ;
          },
          mouseleave: function() {
            $module
              .removeClass(className.selected)
            ;
            $icon
              .removeClass(className.selected)
            ;
          },
          click: function() {
            var
              $activeIcon   = $(this),
              currentRating = module.getRating(),
              rating        = $icon.index($activeIcon) + 1,
              canClear      = (settings.clearable == 'auto')
               ? ($icon.size() === 1)
               : settings.clearable
            ;
            if(canClear && currentRating == rating) {
              module.clearRating();
            }
            else {
              module.setRating( rating );
            }
          }
        },

        clearRating: function() {
          module.debug('Clearing current rating');
          module.setRating(0);
        },

        getRating: function() {
          var
            currentRating = $icon.filter('.' + className.active).size()
          ;
          module.verbose('Current rating retrieved', currentRating);
          return currentRating;
        },

        enable: function() {
          module.debug('Setting rating to interactive mode');
          $icon
            .on('mouseenter' + eventNamespace, module.event.mouseenter)
            .on('mouseleave' + eventNamespace, module.event.mouseleave)
            .on('click' + eventNamespace, module.event.click)
          ;
          $module
            .removeClass(className.disabled)
          ;
        },

        disable: function() {
          module.debug('Setting rating to read-only mode');
          $icon
            .off(eventNamespace)
          ;
          $module
            .addClass(className.disabled)
          ;
        },

        setRating: function(rating) {
          var
            ratingIndex = (rating - 1 >= 0)
              ? (rating - 1)
              : 0,
            $activeIcon = $icon.eq(ratingIndex)
          ;
          $module
            .removeClass(className.selected)
          ;
          $icon
            .removeClass(className.selected)
            .removeClass(className.active)
          ;
          if(rating > 0) {
            module.verbose('Setting current rating to', rating);
            $activeIcon
              .prevAll()
              .andSelf()
                .addClass(className.active)
            ;
          }
          $.proxy(settings.onRate, element)(rating);
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.rating.settings = {

  name          : 'Rating',
  namespace     : 'rating',

  debug         : false,
  verbose       : true,
  performance   : true,

  initialRating : 0,
  interactive   : true,
  maxRating     : 4,
  clearable     : 'auto',

  onRate        : function(rating){},

  error         : {
    method    : 'The method you called is not defined',
    noMaximum : 'No maximum rating specified. Cannot generate HTML automatically'
  },


  metadata: {
    rating    : 'rating',
    maxRating : 'maxRating'
  },

  className : {
    active   : 'active',
    disabled : 'disabled',
    selected : 'selected',
    loading  : 'loading'
  },

  selector  : {
    icon : '.icon'
  },

  templates: {
    icon: function(maxRating) {
      var
        icon = 1,
        html = ''
      ;
      while(icon <= maxRating) {
        html += '<i class="icon"></i>';
        icon++;
      }
      return html;
    }
  }

};

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,n,t,i){"use strict";e.fn.rating=function(n){var t,a=e(this),o=a.selector||"",r=(new Date).getTime(),s=[],l=arguments[0],c="string"==typeof l,u=[].slice.call(arguments,1);return a.each(function(){var g,d=e.isPlainObject(n)?e.extend(!0,{},e.fn.rating.settings,n):e.extend({},e.fn.rating.settings),m=d.namespace,f=d.className,v=d.metadata,p=d.selector,b=(d.error,"."+m),h="module-"+m,y=this,R=e(this).data(h),C=e(this),x=C.find(p.icon);g={initialize:function(){g.verbose("Initializing rating module",d),0===x.size()&&g.setup.layout(),d.interactive?g.enable():g.disable(),d.initialRating&&(g.debug("Setting initial rating"),g.setRating(d.initialRating)),C.data(v.rating)&&(g.debug("Rating found in metadata"),g.setRating(C.data(v.rating))),g.instantiate()},instantiate:function(){g.verbose("Instantiating module",d),R=g,C.data(h,g)},destroy:function(){g.verbose("Destroying previous instance",R),C.removeData(h),x.off(b)},refresh:function(){x=C.find(p.icon)},setup:{layout:function(){var n=C.data(v.maxRating)||d.maxRating;g.debug("Generating icon html dynamically"),C.html(e.fn.rating.settings.templates.icon(n)),g.refresh()}},event:{mouseenter:function(){var n=e(this);n.nextAll().removeClass(f.selected),C.addClass(f.selected),n.addClass(f.selected).prevAll().addClass(f.selected)},mouseleave:function(){C.removeClass(f.selected),x.removeClass(f.selected)},click:function(){var n=e(this),t=g.getRating(),i=x.index(n)+1,a="auto"==d.clearable?1===x.size():d.clearable;a&&t==i?g.clearRating():g.setRating(i)}},clearRating:function(){g.debug("Clearing current rating"),g.setRating(0)},getRating:function(){var e=x.filter("."+f.active).size();return g.verbose("Current rating retrieved",e),e},enable:function(){g.debug("Setting rating to interactive mode"),x.on("mouseenter"+b,g.event.mouseenter).on("mouseleave"+b,g.event.mouseleave).on("click"+b,g.event.click),C.removeClass(f.disabled)},disable:function(){g.debug("Setting rating to read-only mode"),x.off(b),C.addClass(f.disabled)},setRating:function(n){var t=n-1>=0?n-1:0,i=x.eq(t);C.removeClass(f.selected),x.removeClass(f.selected).removeClass(f.active),n>0&&(g.verbose("Setting current rating to",n),i.prevAll().andSelf().addClass(f.active)),e.proxy(d.onRate,y)(n)},setting:function(n,t){if(g.debug("Changing setting",n,t),e.isPlainObject(n))e.extend(!0,d,n);else{if(t===i)return d[n];d[n]=t}},internal:function(n,t){if(e.isPlainObject(n))e.extend(!0,g,n);else{if(t===i)return g[n];g[n]=t}},debug:function(){d.debug&&(d.performance?g.performance.log(arguments):(g.debug=Function.prototype.bind.call(console.info,console,d.name+":"),g.debug.apply(console,arguments)))},verbose:function(){d.verbose&&d.debug&&(d.performance?g.performance.log(arguments):(g.verbose=Function.prototype.bind.call(console.info,console,d.name+":"),g.verbose.apply(console,arguments)))},error:function(){g.error=Function.prototype.bind.call(console.error,console,d.name+":"),g.error.apply(console,arguments)},performance:{log:function(e){var n,t,i;d.performance&&(n=(new Date).getTime(),i=r||n,t=n-i,r=n,s.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:y,"Execution Time":t})),clearTimeout(g.performance.timer),g.performance.timer=setTimeout(g.performance.display,100)},display:function(){var n=d.name+":",t=0;r=!1,clearTimeout(g.performance.timer),e.each(s,function(e,n){t+=n["Execution Time"]}),n+=" "+t+"ms",o&&(n+=" '"+o+"'"),a.size()>1&&(n+=" ("+a.size()+")"),(console.group!==i||console.table!==i)&&s.length>0&&(console.groupCollapsed(n),console.table?console.table(s):e.each(s,function(e,n){console.log(n.Name+": "+n["Execution Time"]+"ms")}),console.groupEnd()),s=[]}},invoke:function(n,a,o){var r,s,l,c=R;return a=a||u,o=y||o,"string"==typeof n&&c!==i&&(n=n.split(/[\. ]/),r=n.length-1,e.each(n,function(t,a){var o=t!=r?a+n[t+1].charAt(0).toUpperCase()+n[t+1].slice(1):n;if(e.isPlainObject(c[o])&&t!=r)c=c[o];else{if(c[o]!==i)return s=c[o],!1;if(!e.isPlainObject(c[a])||t==r)return c[a]!==i?(s=c[a],!1):!1;c=c[a]}})),e.isFunction(s)?l=s.apply(o,a):s!==i&&(l=s),e.isArray(t)?t.push(l):t!==i?t=[t,l]:l!==i&&(t=l),s}},c?(R===i&&g.initialize(),g.invoke(l)):(R!==i&&g.destroy(),g.initialize())}),t!==i?t:this},e.fn.rating.settings={name:"Rating",namespace:"rating",debug:!1,verbose:!0,performance:!0,initialRating:0,interactive:!0,maxRating:4,clearable:"auto",onRate:function(){},error:{method:"The method you called is not defined",noMaximum:"No maximum rating specified. Cannot generate HTML automatically"},metadata:{rating:"rating",maxRating:"maxRating"},className:{active:"active",disabled:"disabled",selected:"selected",loading:"loading"},selector:{icon:".icon"},templates:{icon:function(e){for(var n=1,t="";e>=n;)t+='<i class="icon"></i>',n++;return t}}}}(jQuery,window,document);
/*
 * # Semantic - Search
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.search = function(parameters) {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $(this)
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.search.settings, parameters),

        className       = settings.className,
        selector        = settings.selector,
        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),
        $prompt         = $module.find(selector.prompt),
        $searchButton   = $module.find(selector.searchButton),
        $results        = $module.find(selector.results),
        $result         = $module.find(selector.result),
        $category       = $module.find(selector.category),

        element         = this,
        instance        = $module.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');
          var
            prompt = $prompt[0],
            inputEvent   = (prompt !== undefined && prompt.oninput !== undefined)
              ? 'input'
              : (prompt !== undefined && prompt.onpropertychange !== undefined)
                ? 'propertychange'
                : 'keyup'
          ;
          if(settings.automatic) {
            $prompt
              .on(inputEvent + eventNamespace, module.search.throttle)
            ;
          }
          $prompt
            .on('focus' + eventNamespace, module.event.focus)
            .on('blur' + eventNamespace, module.event.blur)
            .on('keydown' + eventNamespace, module.handleKeyboard)
          ;
          $searchButton
            .on('click' + eventNamespace, module.search.query)
          ;
          $results
            .on('mousedown' + eventNamespace, module.event.mousedown)
            .on('mouseup' + eventNamespace, module.event.mouseup)
            .on('click' + eventNamespace, selector.result, module.results.select)
          ;
          module.instantiate();
        },
        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },
        destroy: function() {
          module.verbose('Destroying instance');
          $module
            .removeData(moduleNamespace)
          ;
          $prompt
            .off(eventNamespace)
          ;
          $searchButton
            .off(eventNamespace)
          ;
          $results
            .off(eventNamespace)
          ;
        },
        event: {
          focus: function() {
            $module
              .addClass(className.focus)
            ;
            clearTimeout(module.timer);
            module.search.throttle();
            if(module.has.minimum())  {
              module.results.show();
            }
          },
          mousedown: function() {
            module.resultsClicked = true;
          },
          mouseup: function() {
            module.resultsClicked = false;
          },
          blur: function(event) {
            module.search.cancel();
            $module
              .removeClass(className.focus)
            ;
            if(!module.resultsClicked) {
              module.timer = setTimeout(module.results.hide, settings.hideDelay);
            }
          }
        },
        handleKeyboard: function(event) {
          var
            // force latest jq dom
            $result       = $module.find(selector.result),
            $category     = $module.find(selector.category),
            keyCode       = event.which,
            keys          = {
              backspace : 8,
              enter     : 13,
              escape    : 27,
              upArrow   : 38,
              downArrow : 40
            },
            activeClass  = className.active,
            currentIndex = $result.index( $result.filter('.' + activeClass) ),
            resultSize   = $result.size(),
            newIndex
          ;
          // search shortcuts
          if(keyCode == keys.escape) {
            module.verbose('Escape key pressed, blurring search field');
            $prompt
              .trigger('blur')
            ;
          }
          // result shortcuts
          if($results.filter(':visible').size() > 0) {
            if(keyCode == keys.enter) {
              module.verbose('Enter key pressed, selecting active result');
              if( $result.filter('.' + activeClass).size() > 0 ) {
                $.proxy(module.results.select, $result.filter('.' + activeClass) )(event);
                event.preventDefault();
                return false;
              }
            }
            else if(keyCode == keys.upArrow) {
              module.verbose('Up key pressed, changing active result');
              newIndex = (currentIndex - 1 < 0)
                ? currentIndex
                : currentIndex - 1
              ;
              $category
                .removeClass(activeClass)
              ;
              $result
                .removeClass(activeClass)
                .eq(newIndex)
                  .addClass(activeClass)
                  .closest($category)
                    .addClass(activeClass)
              ;
              event.preventDefault();
            }
            else if(keyCode == keys.downArrow) {
              module.verbose('Down key pressed, changing active result');
              newIndex = (currentIndex + 1 >= resultSize)
                ? currentIndex
                : currentIndex + 1
              ;
              $category
                .removeClass(activeClass)
              ;
              $result
                .removeClass(activeClass)
                .eq(newIndex)
                  .addClass(activeClass)
                  .closest($category)
                    .addClass(activeClass)
              ;
              event.preventDefault();
            }
          }
          else {
            // query shortcuts
            if(keyCode == keys.enter) {
              module.verbose('Enter key pressed, executing query');
              module.search.query();
              $searchButton
                .addClass(className.down)
              ;
              $prompt
                .one('keyup', function(){
                  $searchButton
                    .removeClass(className.down)
                  ;
                })
              ;
            }
          }
        },
        has: {
          minimum: function() {
            var
              searchTerm    = $prompt.val(),
              numCharacters = searchTerm.length
            ;
            return (numCharacters >= settings.minCharacters);
          }
        },
        search: {
          cancel: function() {
            var
              xhr = $module.data('xhr') || false
            ;
            if( xhr && xhr.state() != 'resolved') {
              module.debug('Cancelling last search');
              xhr.abort();
            }
          },
          throttle: function() {
            clearTimeout(module.timer);
            if(module.has.minimum())  {
              module.timer = setTimeout(module.search.query, settings.searchDelay);
            }
            else {
              module.results.hide();
            }
          },
          query: function() {
            var
              searchTerm = $prompt.val(),
              cachedHTML = module.search.cache.read(searchTerm)
            ;
            if(cachedHTML) {
              module.debug("Reading result for '" + searchTerm + "' from cache");
              module.results.add(cachedHTML);
            }
            else {
              module.debug("Querying for '" + searchTerm + "'");
              if($.isPlainObject(settings.source) || $.isArray(settings.source)) {
                module.search.local(searchTerm);
              }
              else if(settings.apiSettings) {
                module.search.remote(searchTerm);
              }
              else if($.fn.api !== undefined && $.api.settings.api.search !== undefined) {
                module.debug('Searching with default search API endpoint');
                settings.apiSettings = {
                  action: 'search'
                };
                module.search.remote(searchTerm);
              }
              else {
                module.error(error.source);
              }
              $.proxy(settings.onSearchQuery, $module)(searchTerm);
            }
          },
          local: function(searchTerm) {
            var
              results   = [],
              fullTextResults = [],
              searchFields    = $.isArray(settings.searchFields)
                ? settings.searchFields
                : [settings.searchFields],
              searchRegExp   = new RegExp('(?:\s|^)' + searchTerm, 'i'),
              fullTextRegExp = new RegExp(searchTerm, 'i'),
              searchHTML
            ;
            $module
              .addClass(className.loading)
            ;
            // iterate through search fields in array order
            $.each(searchFields, function(index, field) {
              $.each(settings.source, function(label, content) {
                var
                  fieldExists = (typeof content[field] == 'string'),
                  notAlreadyResult = ($.inArray(content, results) == -1 && $.inArray(content, fullTextResults) == -1)
                ;
                if(fieldExists && notAlreadyResult) {
                  if( searchRegExp.test( content[field] ) ) {
                    results.push(content);
                  }
                  else if( settings.searchFullText && fullTextRegExp.test( content[field] ) ) {
                    fullTextResults.push(content);
                  }
                }
              });
            });
            searchHTML = module.results.generate({
              results: $.merge(results, fullTextResults)
            });
            $module
              .removeClass(className.loading)
            ;
            module.search.cache.write(searchTerm, searchHTML);
            module.results.add(searchHTML);
          },
          remote: function(searchTerm) {
            var
              apiSettings = {
                stateContext : $module,
                urlData      : {
                  query: searchTerm
                },
                onSuccess : function(response) {
                  searchHTML = module.results.generate(response);
                  module.search.cache.write(searchTerm, searchHTML);
                  module.results.add(searchHTML);
                },
                onFailure : module.error
              },
              searchHTML
            ;
            module.search.cancel();
            module.debug('Executing search');
            $.extend(true, apiSettings, settings.apiSettings);
            $.api(apiSettings);
          },

          cache: {
            read: function(name) {
              var
                cache = $module.data('cache')
              ;
              return (settings.cache && (typeof cache == 'object') && (cache[name] !== undefined) )
                ? cache[name]
                : false
              ;
            },
            write: function(name, value) {
              var
                cache = ($module.data('cache') !== undefined)
                  ? $module.data('cache')
                  : {}
              ;
              cache[name] = value;
              $module
                .data('cache', cache)
              ;
            }
          }
        },

        results: {
          generate: function(response) {
            module.debug('Generating html from response', response);
            var
              template = settings.templates[settings.type],
              html     = ''
            ;
            if(($.isPlainObject(response.results) && !$.isEmptyObject(response.results)) || ($.isArray(response.results) && response.results.length > 0) ) {
              if(settings.maxResults > 0) {
                response.results = $.isArray(response.results)
                  ? response.results.slice(0, settings.maxResults)
                  : response.results
                ;
              }
              if($.isFunction(template)) {
                html = template(response);
              }
              else {
                module.error(error.noTemplate, false);
              }
            }
            else {
              html = module.message(error.noResults, 'empty');
            }
            $.proxy(settings.onResults, $module)(response);
            return html;
          },
          add: function(html) {
            if(settings.onResultsAdd == 'default' || $.proxy(settings.onResultsAdd, $results)(html) == 'default') {
              $results
                .html(html)
              ;
            }
            module.results.show();
          },
          show: function() {
            if( ($results.filter(':visible').size() === 0) && ($prompt.filter(':focus').size() > 0) && $results.html() !== '') {
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported') && !$results.transition('is inward')) {
                module.debug('Showing results with css animations');
                $results
                  .transition({
                    animation  : settings.transition + ' in',
                    duration   : settings.duration,
                    queue      : true
                  })
                ;
              }
              else {
                module.debug('Showing results with javascript');
                $results
                  .stop()
                  .fadeIn(settings.duration, settings.easing)
                ;
              }
              $.proxy(settings.onResultsOpen, $results)();
            }
          },
          hide: function() {
            if($results.filter(':visible').size() > 0) {
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported') && !$results.transition('is outward')) {
                module.debug('Hiding results with css animations');
                $results
                  .transition({
                    animation  : settings.transition + ' out',
                    duration   : settings.duration,
                    queue      : true
                  })
                ;
              }
              else {
                module.debug('Hiding results with javascript');
                $results
                  .stop()
                  .fadeIn(settings.duration, settings.easing)
                ;
              }
              $.proxy(settings.onResultsClose, $results)();
            }
          },
          select: function(event) {
            module.debug('Search result selected');
            var
              $result = $(this),
              $title  = $result.find('.title'),
              title   = $title.html()
            ;
            if(settings.onSelect == 'default' || $.proxy(settings.onSelect, this)(event) == 'default') {
              var
                $link  = $result.find('a[href]').eq(0),
                $title = $result.find(selector.title).eq(0),
                href   = $link.attr('href') || false,
                target = $link.attr('target') || false,
                name   = ($title.size() > 0)
                  ? $title.text()
                  : false
              ;
              module.results.hide();
              if(name) {
                $prompt.val(name);
              }
              if(href) {
                if(target == '_blank' || event.ctrlKey) {
                  window.open(href);
                }
                else {
                  window.location.href = (href);
                }
              }
            }
          }
        },

        // displays mesage visibly in search results
        message: function(text, type) {
          type = type || 'standard';
          module.results.add( settings.templates.message(text, type) );
          return settings.templates.message(text, type);
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.search.settings = {

  name           : 'Search Module',
  namespace      : 'search',

  debug          : false,
  verbose        : true,
  performance    : true,

  // api config
  apiSettings    : false,
  type           : 'standard',
  minCharacters  : 1,

  source         : false,
  searchFields   : [
    'title',
    'description'
  ],
  searchFullText : true,

  automatic      : 'true',
  hideDelay      : 0,
  searchDelay    : 300,
  maxResults     : 7,
  cache          : true,

  transition     : 'scale',
  duration       : 300,
  easing         : 'easeOutExpo',

  // onSelect default action is defined in module
  onSelect       : 'default',
  onResultsAdd   : 'default',

  onSearchQuery  : function(){},
  onResults      : function(response){},

  onResultsOpen  : function(){},
  onResultsClose : function(){},

  className: {
    active  : 'active',
    down    : 'down',
    focus   : 'focus',
    empty   : 'empty',
    loading : 'loading'
  },

  error : {
    source      : 'Cannot search. No source used, and Semantic API module was not included',
    noResults   : 'Your search returned no results',
    logging     : 'Error in debug logging, exiting.',
    noTemplate  : 'A valid template name was not specified.',
    serverError : 'There was an issue with querying the server.',
    method      : 'The method you called is not defined.'
  },

  selector : {
    prompt       : '.prompt',
    searchButton : '.search.button',
    results      : '.results',
    category     : '.category',
    result       : '.result',
    title        : '.title, .name'
  },

  templates: {
    escape: function(string) {
      var
        badChars     = /[&<>"'`]/g,
        shouldEscape = /[&<>"'`]/,
        escape       = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        },
        escapedChar  = function(chr) {
          return escape[chr];
        }
      ;
      if(shouldEscape.test(string)) {
        return string.replace(badChars, escapedChar);
      }
      return string;
    },
    message: function(message, type) {
      var
        html = ''
      ;
      if(message !== undefined && type !== undefined) {
        html +=  ''
          + '<div class="message ' + type + '">'
        ;
        // message type
        if(type == 'empty') {
          html += ''
            + '<div class="header">No Results</div class="header">'
            + '<div class="description">' + message + '</div class="description">'
          ;
        }
        else {
          html += ' <div class="description">' + message + '</div>';
        }
        html += '</div>';
      }
      return html;
    },
    category: function(response) {
      var
        html = '',
        escape = $.fn.search.settings.templates.escape
      ;
      if(response.results !== undefined) {
        // each category
        $.each(response.results, function(index, category) {
          if(category.results !== undefined && category.results.length > 0) {
            html  += ''
              + '<div class="category">'
              + '<div class="name">' + category.name + '</div>'
            ;
            // each item inside category
            $.each(category.results, function(index, result) {
              html  += '<div class="result">';
              if(result.url) {
                html  += '<a href="' + result.url + '"></a>';
              }
              if(result.image !== undefined) {
                result.image = escape(result.image);
                html += ''
                  + '<div class="image">'
                  + ' <img src="' + result.image + '" alt="">'
                  + '</div>'
                ;
              }
              html += '<div class="content">';
              if(result.price !== undefined) {
                result.price = escape(result.price);
                html += '<div class="price">' + result.price + '</div>';
              }
              if(result.title !== undefined) {
                result.title = escape(result.title);
                html += '<div class="title">' + result.title + '</div>';
              }
              if(result.description !== undefined) {
                html += '<div class="description">' + result.description + '</div>';
              }
              html  += ''
                + '</div>'
                + '</div>'
              ;
            });
            html  += ''
              + '</div>'
            ;
          }
        });
        if(response.action) {
          html += ''
          + '<a href="' + response.action.url + '" class="action">'
          +   response.action.text
          + '</a>';
        }
        return html;
      }
      return false;
    },
    standard: function(response) {
      var
        html = ''
      ;
      if(response.results !== undefined) {

        // each result
        $.each(response.results, function(index, result) {
          if(result.url) {
            html  += '<a class="result" href="' + result.url + '">';
          }
          else {
            html  += '<a class="result">';
          }
          if(result.image !== undefined) {
            html += ''
              + '<div class="image">'
              + ' <img src="' + result.image + '">'
              + '</div>'
            ;
          }
          html += '<div class="content">';
          if(result.price !== undefined) {
            html += '<div class="price">' + result.price + '</div>';
          }
          if(result.title !== undefined) {
            html += '<div class="title">' + result.title + '</div>';
          }
          if(result.description !== undefined) {
            html += '<div class="description">' + result.description + '</div>';
          }
          html  += ''
            + '</div>'
          ;
          html += '</a>';
        });

        if(response.action) {
          html += ''
          + '<a href="' + response.action.url + '" class="action">'
          +   response.action.text
          + '</a>';
        }
        return html;
      }
      return false;
    }
  }
};

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,s,r){"use strict";e.fn.search=function(s){var n,i=e(this),a=i.selector||"",o=(new Date).getTime(),c=[],l=arguments[0],u="string"==typeof l,d=[].slice.call(arguments,1);return e(this).each(function(){var f,p=e.extend(!0,{},e.fn.search.settings,s),m=p.className,h=p.selector,g=p.error,v=p.namespace,y="."+v,b=v+"-module",w=e(this),x=w.find(h.prompt),C=w.find(h.searchButton),A=w.find(h.results),R=(w.find(h.result),w.find(h.category),this),T=w.data(b);f={initialize:function(){f.verbose("Initializing module");var e=x[0],t=e!==r&&e.oninput!==r?"input":e!==r&&e.onpropertychange!==r?"propertychange":"keyup";p.automatic&&x.on(t+y,f.search.throttle),x.on("focus"+y,f.event.focus).on("blur"+y,f.event.blur).on("keydown"+y,f.handleKeyboard),C.on("click"+y,f.search.query),A.on("mousedown"+y,f.event.mousedown).on("mouseup"+y,f.event.mouseup).on("click"+y,h.result,f.results.select),f.instantiate()},instantiate:function(){f.verbose("Storing instance of module",f),T=f,w.data(b,f)},destroy:function(){f.verbose("Destroying instance"),w.removeData(b),x.off(y),C.off(y),A.off(y)},event:{focus:function(){w.addClass(m.focus),clearTimeout(f.timer),f.search.throttle(),f.has.minimum()&&f.results.show()},mousedown:function(){f.resultsClicked=!0},mouseup:function(){f.resultsClicked=!1},blur:function(){f.search.cancel(),w.removeClass(m.focus),f.resultsClicked||(f.timer=setTimeout(f.results.hide,p.hideDelay))}},handleKeyboard:function(t){var s,r=w.find(h.result),n=w.find(h.category),i=t.which,a={backspace:8,enter:13,escape:27,upArrow:38,downArrow:40},o=m.active,c=r.index(r.filter("."+o)),l=r.size();if(i==a.escape&&(f.verbose("Escape key pressed, blurring search field"),x.trigger("blur")),A.filter(":visible").size()>0)if(i==a.enter){if(f.verbose("Enter key pressed, selecting active result"),r.filter("."+o).size()>0)return e.proxy(f.results.select,r.filter("."+o))(t),t.preventDefault(),!1}else i==a.upArrow?(f.verbose("Up key pressed, changing active result"),s=0>c-1?c:c-1,n.removeClass(o),r.removeClass(o).eq(s).addClass(o).closest(n).addClass(o),t.preventDefault()):i==a.downArrow&&(f.verbose("Down key pressed, changing active result"),s=c+1>=l?c:c+1,n.removeClass(o),r.removeClass(o).eq(s).addClass(o).closest(n).addClass(o),t.preventDefault());else i==a.enter&&(f.verbose("Enter key pressed, executing query"),f.search.query(),C.addClass(m.down),x.one("keyup",function(){C.removeClass(m.down)}))},has:{minimum:function(){var e=x.val(),t=e.length;return t>=p.minCharacters}},search:{cancel:function(){var e=w.data("xhr")||!1;e&&"resolved"!=e.state()&&(f.debug("Cancelling last search"),e.abort())},throttle:function(){clearTimeout(f.timer),f.has.minimum()?f.timer=setTimeout(f.search.query,p.searchDelay):f.results.hide()},query:function(){var t=x.val(),s=f.search.cache.read(t);s?(f.debug("Reading result for '"+t+"' from cache"),f.results.add(s)):(f.debug("Querying for '"+t+"'"),e.isPlainObject(p.source)||e.isArray(p.source)?f.search.local(t):p.apiSettings?f.search.remote(t):e.fn.api!==r&&e.api.settings.api.search!==r?(f.debug("Searching with default search API endpoint"),p.apiSettings={action:"search"},f.search.remote(t)):f.error(g.source),e.proxy(p.onSearchQuery,w)(t))},local:function(t){var s,r=[],n=[],i=e.isArray(p.searchFields)?p.searchFields:[p.searchFields],a=new RegExp("(?:s|^)"+t,"i"),o=new RegExp(t,"i");w.addClass(m.loading),e.each(i,function(t,s){e.each(p.source,function(t,i){var c="string"==typeof i[s],l=-1==e.inArray(i,r)&&-1==e.inArray(i,n);c&&l&&(a.test(i[s])?r.push(i):p.searchFullText&&o.test(i[s])&&n.push(i))})}),s=f.results.generate({results:e.merge(r,n)}),w.removeClass(m.loading),f.search.cache.write(t,s),f.results.add(s)},remote:function(t){var s,r={stateContext:w,urlData:{query:t},onSuccess:function(e){s=f.results.generate(e),f.search.cache.write(t,s),f.results.add(s)},onFailure:f.error};f.search.cancel(),f.debug("Executing search"),e.extend(!0,r,p.apiSettings),e.api(r)},cache:{read:function(e){var t=w.data("cache");return p.cache&&"object"==typeof t&&t[e]!==r?t[e]:!1},write:function(e,t){var s=w.data("cache")!==r?w.data("cache"):{};s[e]=t,w.data("cache",s)}}},results:{generate:function(t){f.debug("Generating html from response",t);var s=p.templates[p.type],r="";return e.isPlainObject(t.results)&&!e.isEmptyObject(t.results)||e.isArray(t.results)&&t.results.length>0?(p.maxResults>0&&(t.results=e.isArray(t.results)?t.results.slice(0,p.maxResults):t.results),e.isFunction(s)?r=s(t):f.error(g.noTemplate,!1)):r=f.message(g.noResults,"empty"),e.proxy(p.onResults,w)(t),r},add:function(t){("default"==p.onResultsAdd||"default"==e.proxy(p.onResultsAdd,A)(t))&&A.html(t),f.results.show()},show:function(){0===A.filter(":visible").size()&&x.filter(":focus").size()>0&&""!==A.html()&&(p.transition&&e.fn.transition!==r&&w.transition("is supported")&&!A.transition("is inward")?(f.debug("Showing results with css animations"),A.transition({animation:p.transition+" in",duration:p.duration,queue:!0})):(f.debug("Showing results with javascript"),A.stop().fadeIn(p.duration,p.easing)),e.proxy(p.onResultsOpen,A)())},hide:function(){A.filter(":visible").size()>0&&(p.transition&&e.fn.transition!==r&&w.transition("is supported")&&!A.transition("is outward")?(f.debug("Hiding results with css animations"),A.transition({animation:p.transition+" out",duration:p.duration,queue:!0})):(f.debug("Hiding results with javascript"),A.stop().fadeIn(p.duration,p.easing)),e.proxy(p.onResultsClose,A)())},select:function(s){f.debug("Search result selected");{var r=e(this),n=r.find(".title");n.html()}if("default"==p.onSelect||"default"==e.proxy(p.onSelect,this)(s)){var i=r.find("a[href]").eq(0),n=r.find(h.title).eq(0),a=i.attr("href")||!1,o=i.attr("target")||!1,c=n.size()>0?n.text():!1;f.results.hide(),c&&x.val(c),a&&("_blank"==o||s.ctrlKey?t.open(a):t.location.href=a)}}},message:function(e,t){return t=t||"standard",f.results.add(p.templates.message(e,t)),p.templates.message(e,t)},setting:function(t,s){if(e.isPlainObject(t))e.extend(!0,p,t);else{if(s===r)return p[t];p[t]=s}},internal:function(t,s){if(e.isPlainObject(t))e.extend(!0,f,t);else{if(s===r)return f[t];f[t]=s}},debug:function(){p.debug&&(p.performance?f.performance.log(arguments):(f.debug=Function.prototype.bind.call(console.info,console,p.name+":"),f.debug.apply(console,arguments)))},verbose:function(){p.verbose&&p.debug&&(p.performance?f.performance.log(arguments):(f.verbose=Function.prototype.bind.call(console.info,console,p.name+":"),f.verbose.apply(console,arguments)))},error:function(){f.error=Function.prototype.bind.call(console.error,console,p.name+":"),f.error.apply(console,arguments)},performance:{log:function(e){var t,s,r;p.performance&&(t=(new Date).getTime(),r=o||t,s=t-r,o=t,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:R,"Execution Time":s})),clearTimeout(f.performance.timer),f.performance.timer=setTimeout(f.performance.display,100)},display:function(){var t=p.name+":",s=0;o=!1,clearTimeout(f.performance.timer),e.each(c,function(e,t){s+=t["Execution Time"]}),t+=" "+s+"ms",a&&(t+=" '"+a+"'"),i.size()>1&&(t+=" ("+i.size()+")"),(console.group!==r||console.table!==r)&&c.length>0&&(console.groupCollapsed(t),console.table?console.table(c):e.each(c,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(t,s,i){var a,o,c,l=T;return s=s||d,i=R||i,"string"==typeof t&&l!==r&&(t=t.split(/[\. ]/),a=t.length-1,e.each(t,function(s,n){var i=s!=a?n+t[s+1].charAt(0).toUpperCase()+t[s+1].slice(1):t;if(e.isPlainObject(l[i])&&s!=a)l=l[i];else{if(l[i]!==r)return o=l[i],!1;if(!e.isPlainObject(l[n])||s==a)return l[n]!==r?(o=l[n],!1):!1;l=l[n]}})),e.isFunction(o)?c=o.apply(i,s):o!==r&&(c=o),e.isArray(n)?n.push(c):n!==r?n=[n,c]:c!==r&&(n=c),o}},u?(T===r&&f.initialize(),f.invoke(l)):(T!==r&&f.destroy(),f.initialize())}),n!==r?n:this},e.fn.search.settings={name:"Search Module",namespace:"search",debug:!1,verbose:!0,performance:!0,apiSettings:!1,type:"standard",minCharacters:1,source:!1,searchFields:["title","description"],searchFullText:!0,automatic:"true",hideDelay:0,searchDelay:300,maxResults:7,cache:!0,transition:"scale",duration:300,easing:"easeOutExpo",onSelect:"default",onResultsAdd:"default",onSearchQuery:function(){},onResults:function(){},onResultsOpen:function(){},onResultsClose:function(){},className:{active:"active",down:"down",focus:"focus",empty:"empty",loading:"loading"},error:{source:"Cannot search. No source used, and Semantic API module was not included",noResults:"Your search returned no results",logging:"Error in debug logging, exiting.",noTemplate:"A valid template name was not specified.",serverError:"There was an issue with querying the server.",method:"The method you called is not defined."},selector:{prompt:".prompt",searchButton:".search.button",results:".results",category:".category",result:".result",title:".title, .name"},templates:{escape:function(e){var t=/[&<>"'`]/g,s=/[&<>"'`]/,r={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},n=function(e){return r[e]};return s.test(e)?e.replace(t,n):e},message:function(e,t){var s="";return e!==r&&t!==r&&(s+='<div class="message '+t+'">',s+="empty"==t?'<div class="header">No Results</div class="header"><div class="description">'+e+'</div class="description">':' <div class="description">'+e+"</div>",s+="</div>"),s},category:function(t){var s="",n=e.fn.search.settings.templates.escape;return t.results!==r?(e.each(t.results,function(t,i){i.results!==r&&i.results.length>0&&(s+='<div class="category"><div class="name">'+i.name+"</div>",e.each(i.results,function(e,t){s+='<div class="result">',t.url&&(s+='<a href="'+t.url+'"></a>'),t.image!==r&&(t.image=n(t.image),s+='<div class="image"> <img src="'+t.image+'" alt=""></div>'),s+='<div class="content">',t.price!==r&&(t.price=n(t.price),s+='<div class="price">'+t.price+"</div>"),t.title!==r&&(t.title=n(t.title),s+='<div class="title">'+t.title+"</div>"),t.description!==r&&(s+='<div class="description">'+t.description+"</div>"),s+="</div></div>"}),s+="</div>")}),t.action&&(s+='<a href="'+t.action.url+'" class="action">'+t.action.text+"</a>"),s):!1},standard:function(t){var s="";return t.results!==r?(e.each(t.results,function(e,t){s+=t.url?'<a class="result" href="'+t.url+'">':'<a class="result">',t.image!==r&&(s+='<div class="image"> <img src="'+t.image+'"></div>'),s+='<div class="content">',t.price!==r&&(s+='<div class="price">'+t.price+"</div>"),t.title!==r&&(s+='<div class="title">'+t.title+"</div>"),t.description!==r&&(s+='<div class="description">'+t.description+"</div>"),s+="</div>",s+="</a>"}),t.action&&(s+='<a href="'+t.action.url+'" class="action">'+t.action.text+"</a>"),s):!1}}}}(jQuery,window,document);
/*
 * # Semantic - Shape
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.shape = function(parameters) {
  var
    $allModules     = $(this),
    $body           = $('body'),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        moduleSelector  = $allModules.selector || '',
        settings        = $.extend(true, {}, $.fn.shape.settings, parameters),

        // internal aliases
        namespace     = settings.namespace,
        selector      = settings.selector,
        error         = settings.error,
        className     = settings.className,

        // define namespaces for modules
        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        // selector cache
        $module       = $(this),
        $sides        = $module.find(selector.sides),
        $side         = $module.find(selector.side),

        // private variables
        nextIndex = false,
        $activeSide,
        $nextSide,

        // standard module
        element       = this,
        instance      = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing module for', element);
          module.set.defaultSide();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache for', element);
          $module = $(element);
          $sides  = $(this).find(selector.shape);
          $side   = $(this).find(selector.side);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          var
            shape          = $sides.get(0) || document.createElement('div'),
            fakeAssignment = shape.offsetWidth
          ;
        },

        animate: function(propertyObject, callback) {
          module.verbose('Animating box with properties', propertyObject);
          callback = callback || function(event) {
            module.verbose('Executing animation callback');
            if(event !== undefined) {
              event.stopPropagation();
            }
            module.reset();
            module.set.active();
          };
          $.proxy(settings.beforeChange, $nextSide[0])();
          if(module.get.transitionEvent()) {
            module.verbose('Starting CSS animation');
            $module
              .addClass(className.animating)
            ;
            $sides
              .css(propertyObject)
              .one(module.get.transitionEvent(), callback)
            ;
            module.set.duration(settings.duration);
            requestAnimationFrame(function() {
              $module
                .addClass(className.animating)
              ;
              $activeSide
                .addClass(className.hidden)
              ;
            });
          }
          else {
            callback();
          }
        },

        queue: function(method) {
          module.debug('Queueing animation of', method);
          $sides
            .one(module.get.transitionEvent(), function() {
              module.debug('Executing queued animation');
              setTimeout(function(){
                $module.shape(method);
              }, 0);
            })
          ;
        },

        reset: function() {
          module.verbose('Animating states reset');
          $module
            .removeClass(className.animating)
            .attr('style', '')
            .removeAttr('style')
          ;
          // removeAttr style does not consistently work in safari
          $sides
            .attr('style', '')
            .removeAttr('style')
          ;
          $side
            .attr('style', '')
            .removeAttr('style')
            .removeClass(className.hidden)
          ;
          $nextSide
            .removeClass(className.animating)
            .attr('style', '')
            .removeAttr('style')
          ;
        },

        is: {
          complete: function() {
            return ($side.filter('.' + className.active)[0] == $nextSide[0]);
          },
          animating: function() {
            return $module.hasClass(className.animating);
          }
        },

        set: {

          defaultSide: function() {
            $activeSide = $module.find('.' + settings.className.active);
            $nextSide   = ( $activeSide.next(selector.side).size() > 0 )
              ? $activeSide.next(selector.side)
              : $module.find(selector.side).first()
            ;
            nextIndex = false;
            module.verbose('Active side set to', $activeSide);
            module.verbose('Next side set to', $nextSide);
          },

          duration: function(duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number')
              ? duration + 'ms'
              : duration
            ;
            module.verbose('Setting animation duration', duration);
            $sides.add($side)
              .css({
                '-webkit-transition-duration': duration,
                '-moz-transition-duration': duration,
                '-ms-transition-duration': duration,
                '-o-transition-duration': duration,
                'transition-duration': duration
              })
            ;
          },

          stageSize: function() {
            var
              $clone      = $module.clone().addClass(className.loading),
              $activeSide = $clone.find('.' + settings.className.active),
              $nextSide   = (nextIndex)
                ? $clone.find(selector.side).eq(nextIndex)
                : ( $activeSide.next(selector.side).size() > 0 )
                  ? $activeSide.next(selector.side)
                  : $clone.find(selector.side).first(),
              newSize = {}
            ;
            $activeSide.removeClass(className.active);
            $nextSide.addClass(className.active);
            $clone.insertAfter($module);
            newSize = {
              width  : $nextSide.outerWidth(),
              height : $nextSide.outerHeight()
            };
            $clone.remove();
            $module
              .css(newSize)
            ;
            module.verbose('Resizing stage to fit new content', newSize);
          },

          nextSide: function(selector) {
            nextIndex = selector;
            $nextSide = $side.filter(selector);
            nextIndex = $side.index($nextSide);
            if($nextSide.size() === 0) {
              module.set.defaultSide();
              module.error(error.side);
            }
            module.verbose('Next side manually set to', $nextSide);
          },

          active: function() {
            module.verbose('Setting new side to active', $nextSide);
            $side
              .removeClass(className.active)
            ;
            $nextSide
              .addClass(className.active)
            ;
            $.proxy(settings.onChange, $nextSide[0])();
            module.set.defaultSide();
          }
        },

        flip: {

          up: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping up', $nextSide);
              module.set.stageSize();
              module.stage.above();
              module.animate( module.get.transform.up() );
            }
            else {
              module.queue('flip up');
            }
          },

          down: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping down', $nextSide);
              module.set.stageSize();
              module.stage.below();
              module.animate( module.get.transform.down() );
            }
            else {
              module.queue('flip down');
            }
          },

          left: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping left', $nextSide);
              module.set.stageSize();
              module.stage.left();
              module.animate(module.get.transform.left() );
            }
            else {
              module.queue('flip left');
            }
          },

          right: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping right', $nextSide);
              module.set.stageSize();
              module.stage.right();
              module.animate(module.get.transform.right() );
            }
            else {
              module.queue('flip right');
            }
          },

          over: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping over', $nextSide);
              module.set.stageSize();
              module.stage.behind();
              module.animate(module.get.transform.over() );
            }
            else {
              module.queue('flip over');
            }
          },

          back: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', $nextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping back', $nextSide);
              module.set.stageSize();
              module.stage.behind();
              module.animate(module.get.transform.back() );
            }
            else {
              module.queue('flip back');
            }
          }

        },

        get: {

          transform: {
            up: function() {
              var
                translate = {
                  y: -(($activeSide.outerHeight() - $nextSide.outerHeight()) / 2),
                  z: -($activeSide.outerHeight() / 2)
                }
              ;
              return {
                transform: 'translateY(' + translate.y + 'px) translateZ('+ translate.z + 'px) rotateX(-90deg)'
              };
            },

            down: function() {
              var
                translate = {
                  y: -(($activeSide.outerHeight() - $nextSide.outerHeight()) / 2),
                  z: -($activeSide.outerHeight() / 2)
                }
              ;
              return {
                transform: 'translateY(' + translate.y + 'px) translateZ('+ translate.z + 'px) rotateX(90deg)'
              };
            },

            left: function() {
              var
                translate = {
                  x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2),
                  z : -($activeSide.outerWidth() / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) translateZ(' + translate.z + 'px) rotateY(90deg)'
              };
            },

            right: function() {
              var
                translate = {
                  x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2),
                  z : -($activeSide.outerWidth() / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) translateZ(' + translate.z + 'px) rotateY(-90deg)'
              };
            },

            over: function() {
              var
                translate = {
                  x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) rotateY(180deg)'
              };
            },

            back: function() {
              var
                translate = {
                  x : -(($activeSide.outerWidth() - $nextSide.outerWidth()) / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) rotateY(-180deg)'
              };
            }
          },

          transitionEvent: function() {
            var
              element     = document.createElement('element'),
              transitions = {
                'transition'       :'transitionend',
                'OTransition'      :'oTransitionEnd',
                'MozTransition'    :'transitionend',
                'WebkitTransition' :'webkitTransitionEnd'
              },
              transition
            ;
            for(transition in transitions){
              if( element.style[transition] !== undefined ){
                return transitions[transition];
              }
            }
          },

          nextSide: function() {
            return ( $activeSide.next(selector.side).size() > 0 )
              ? $activeSide.next(selector.side)
              : $module.find(selector.side).first()
            ;
          }

        },

        stage: {

          above: function() {
            var
              box = {
                origin : (($activeSide.outerHeight() - $nextSide.outerHeight()) / 2),
                depth  : {
                  active : ($nextSide.outerHeight() / 2),
                  next   : ($activeSide.outerHeight() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as above', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'top'       : box.origin + 'px',
                'transform' : 'rotateX(90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          below: function() {
            var
              box = {
                origin : (($activeSide.outerHeight() - $nextSide.outerHeight()) / 2),
                depth  : {
                  active : ($nextSide.outerHeight() / 2),
                  next   : ($activeSide.outerHeight() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as below', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'top'       : box.origin + 'px',
                'transform' : 'rotateX(-90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          left: function() {
            var
              box = {
                origin : ( ( $activeSide.outerWidth() - $nextSide.outerWidth() ) / 2),
                depth  : {
                  active : ($nextSide.outerWidth() / 2),
                  next   : ($activeSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as left', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(-90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          right: function() {
            var
              box = {
                origin : ( ( $activeSide.outerWidth() - $nextSide.outerWidth() ) / 2),
                depth  : {
                  active : ($nextSide.outerWidth() / 2),
                  next   : ($activeSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as left', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          behind: function() {
            var
              box = {
                origin : ( ( $activeSide.outerWidth() - $nextSide.outerWidth() ) / 2),
                depth  : {
                  active : ($nextSide.outerWidth() / 2),
                  next   : ($activeSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as behind', $nextSide, box);
            $activeSide
              .css({
                'transform' : 'rotateY(0deg)'
              })
            ;
            $nextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(-180deg)'
              })
            ;
          }
        },
        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.shape.settings = {

  // module info
  name : 'Shape',

  // debug content outputted to console
  debug      : false,

  // verbose debug output
  verbose    : true,

  // performance data output
  performance: true,

  // event namespace
  namespace  : 'shape',

  // callback occurs on side change
  beforeChange : function() {},
  onChange     : function() {},

  // allow animation to same side
  allowRepeats: false,

  // animation duration
  duration   : 700,

  // possible errors
  error: {
    side   : 'You tried to switch to a side that does not exist.',
    method : 'The method you called is not defined'
  },

  // classnames used
  className   : {
    animating : 'animating',
    hidden    : 'hidden',
    loading   : 'loading',
    active    : 'active'
  },

  // selectors used
  selector    : {
    sides : '.sides',
    side  : '.side'
  }

};


})( jQuery, window , document );
 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,i,n){"use strict";e.fn.shape=function(a){var o,r=e(this),s=(e("body"),(new Date).getTime()),d=[],u=arguments[0],l="string"==typeof u,c=[].slice.call(arguments,1),g=t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame||function(e){setTimeout(e,0)};return r.each(function(){var t,f,m,p=r.selector||"",v=e.extend(!0,{},e.fn.shape.settings,a),h=v.namespace,b=v.selector,x=v.error,y=v.className,S="."+h,z="module-"+h,w=e(this),C=w.find(b.sides),W=w.find(b.side),k=!1,T=this,A=w.data(z);m={initialize:function(){m.verbose("Initializing module for",T),m.set.defaultSide(),m.instantiate()},instantiate:function(){m.verbose("Storing instance of module",m),A=m,w.data(z,A)},destroy:function(){m.verbose("Destroying previous module for",T),w.removeData(z).off(S)},refresh:function(){m.verbose("Refreshing selector cache for",T),w=e(T),C=e(this).find(b.shape),W=e(this).find(b.side)},repaint:function(){m.verbose("Forcing repaint event");{var e=C.get(0)||i.createElement("div");e.offsetWidth}},animate:function(i,a){m.verbose("Animating box with properties",i),a=a||function(e){m.verbose("Executing animation callback"),e!==n&&e.stopPropagation(),m.reset(),m.set.active()},e.proxy(v.beforeChange,f[0])(),m.get.transitionEvent()?(m.verbose("Starting CSS animation"),w.addClass(y.animating),C.css(i).one(m.get.transitionEvent(),a),m.set.duration(v.duration),g(function(){w.addClass(y.animating),t.addClass(y.hidden)})):a()},queue:function(e){m.debug("Queueing animation of",e),C.one(m.get.transitionEvent(),function(){m.debug("Executing queued animation"),setTimeout(function(){w.shape(e)},0)})},reset:function(){m.verbose("Animating states reset"),w.removeClass(y.animating).attr("style","").removeAttr("style"),C.attr("style","").removeAttr("style"),W.attr("style","").removeAttr("style").removeClass(y.hidden),f.removeClass(y.animating).attr("style","").removeAttr("style")},is:{complete:function(){return W.filter("."+y.active)[0]==f[0]},animating:function(){return w.hasClass(y.animating)}},set:{defaultSide:function(){t=w.find("."+v.className.active),f=t.next(b.side).size()>0?t.next(b.side):w.find(b.side).first(),k=!1,m.verbose("Active side set to",t),m.verbose("Next side set to",f)},duration:function(e){e=e||v.duration,e="number"==typeof e?e+"ms":e,m.verbose("Setting animation duration",e),C.add(W).css({"-webkit-transition-duration":e,"-moz-transition-duration":e,"-ms-transition-duration":e,"-o-transition-duration":e,"transition-duration":e})},stageSize:function(){var e=w.clone().addClass(y.loading),t=e.find("."+v.className.active),i=k?e.find(b.side).eq(k):t.next(b.side).size()>0?t.next(b.side):e.find(b.side).first(),n={};t.removeClass(y.active),i.addClass(y.active),e.insertAfter(w),n={width:i.outerWidth(),height:i.outerHeight()},e.remove(),w.css(n),m.verbose("Resizing stage to fit new content",n)},nextSide:function(e){k=e,f=W.filter(e),k=W.index(f),0===f.size()&&(m.set.defaultSide(),m.error(x.side)),m.verbose("Next side manually set to",f)},active:function(){m.verbose("Setting new side to active",f),W.removeClass(y.active),f.addClass(y.active),e.proxy(v.onChange,f[0])(),m.set.defaultSide()}},flip:{up:function(){return!m.is.complete()||m.is.animating()||v.allowRepeats?void(m.is.animating()?m.queue("flip up"):(m.debug("Flipping up",f),m.set.stageSize(),m.stage.above(),m.animate(m.get.transform.up()))):void m.debug("Side already visible",f)},down:function(){return!m.is.complete()||m.is.animating()||v.allowRepeats?void(m.is.animating()?m.queue("flip down"):(m.debug("Flipping down",f),m.set.stageSize(),m.stage.below(),m.animate(m.get.transform.down()))):void m.debug("Side already visible",f)},left:function(){return!m.is.complete()||m.is.animating()||v.allowRepeats?void(m.is.animating()?m.queue("flip left"):(m.debug("Flipping left",f),m.set.stageSize(),m.stage.left(),m.animate(m.get.transform.left()))):void m.debug("Side already visible",f)},right:function(){return!m.is.complete()||m.is.animating()||v.allowRepeats?void(m.is.animating()?m.queue("flip right"):(m.debug("Flipping right",f),m.set.stageSize(),m.stage.right(),m.animate(m.get.transform.right()))):void m.debug("Side already visible",f)},over:function(){return!m.is.complete()||m.is.animating()||v.allowRepeats?void(m.is.animating()?m.queue("flip over"):(m.debug("Flipping over",f),m.set.stageSize(),m.stage.behind(),m.animate(m.get.transform.over()))):void m.debug("Side already visible",f)},back:function(){return!m.is.complete()||m.is.animating()||v.allowRepeats?void(m.is.animating()?m.queue("flip back"):(m.debug("Flipping back",f),m.set.stageSize(),m.stage.behind(),m.animate(m.get.transform.back()))):void m.debug("Side already visible",f)}},get:{transform:{up:function(){var e={y:-((t.outerHeight()-f.outerHeight())/2),z:-(t.outerHeight()/2)};return{transform:"translateY("+e.y+"px) translateZ("+e.z+"px) rotateX(-90deg)"}},down:function(){var e={y:-((t.outerHeight()-f.outerHeight())/2),z:-(t.outerHeight()/2)};return{transform:"translateY("+e.y+"px) translateZ("+e.z+"px) rotateX(90deg)"}},left:function(){var e={x:-((t.outerWidth()-f.outerWidth())/2),z:-(t.outerWidth()/2)};return{transform:"translateX("+e.x+"px) translateZ("+e.z+"px) rotateY(90deg)"}},right:function(){var e={x:-((t.outerWidth()-f.outerWidth())/2),z:-(t.outerWidth()/2)};return{transform:"translateX("+e.x+"px) translateZ("+e.z+"px) rotateY(-90deg)"}},over:function(){var e={x:-((t.outerWidth()-f.outerWidth())/2)};return{transform:"translateX("+e.x+"px) rotateY(180deg)"}},back:function(){var e={x:-((t.outerWidth()-f.outerWidth())/2)};return{transform:"translateX("+e.x+"px) rotateY(-180deg)"}}},transitionEvent:function(){var e,t=i.createElement("element"),a={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(e in a)if(t.style[e]!==n)return a[e]},nextSide:function(){return t.next(b.side).size()>0?t.next(b.side):w.find(b.side).first()}},stage:{above:function(){var e={origin:(t.outerHeight()-f.outerHeight())/2,depth:{active:f.outerHeight()/2,next:t.outerHeight()/2}};m.verbose("Setting the initial animation position as above",f,e),t.css({transform:"rotateY(0deg) translateZ("+e.depth.active+"px)"}),f.addClass(y.animating).css({display:"block",top:e.origin+"px",transform:"rotateX(90deg) translateZ("+e.depth.next+"px)"})},below:function(){var e={origin:(t.outerHeight()-f.outerHeight())/2,depth:{active:f.outerHeight()/2,next:t.outerHeight()/2}};m.verbose("Setting the initial animation position as below",f,e),t.css({transform:"rotateY(0deg) translateZ("+e.depth.active+"px)"}),f.addClass(y.animating).css({display:"block",top:e.origin+"px",transform:"rotateX(-90deg) translateZ("+e.depth.next+"px)"})},left:function(){var e={origin:(t.outerWidth()-f.outerWidth())/2,depth:{active:f.outerWidth()/2,next:t.outerWidth()/2}};m.verbose("Setting the initial animation position as left",f,e),t.css({transform:"rotateY(0deg) translateZ("+e.depth.active+"px)"}),f.addClass(y.animating).css({display:"block",left:e.origin+"px",transform:"rotateY(-90deg) translateZ("+e.depth.next+"px)"})},right:function(){var e={origin:(t.outerWidth()-f.outerWidth())/2,depth:{active:f.outerWidth()/2,next:t.outerWidth()/2}};m.verbose("Setting the initial animation position as left",f,e),t.css({transform:"rotateY(0deg) translateZ("+e.depth.active+"px)"}),f.addClass(y.animating).css({display:"block",left:e.origin+"px",transform:"rotateY(90deg) translateZ("+e.depth.next+"px)"})},behind:function(){var e={origin:(t.outerWidth()-f.outerWidth())/2,depth:{active:f.outerWidth()/2,next:t.outerWidth()/2}};m.verbose("Setting the initial animation position as behind",f,e),t.css({transform:"rotateY(0deg)"}),f.addClass(y.animating).css({display:"block",left:e.origin+"px",transform:"rotateY(-180deg)"})}},setting:function(t,i){if(m.debug("Changing setting",t,i),e.isPlainObject(t))e.extend(!0,v,t);else{if(i===n)return v[t];v[t]=i}},internal:function(t,i){if(e.isPlainObject(t))e.extend(!0,m,t);else{if(i===n)return m[t];m[t]=i}},debug:function(){v.debug&&(v.performance?m.performance.log(arguments):(m.debug=Function.prototype.bind.call(console.info,console,v.name+":"),m.debug.apply(console,arguments)))},verbose:function(){v.verbose&&v.debug&&(v.performance?m.performance.log(arguments):(m.verbose=Function.prototype.bind.call(console.info,console,v.name+":"),m.verbose.apply(console,arguments)))},error:function(){m.error=Function.prototype.bind.call(console.error,console,v.name+":"),m.error.apply(console,arguments)},performance:{log:function(e){var t,i,n;v.performance&&(t=(new Date).getTime(),n=s||t,i=t-n,s=t,d.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:T,"Execution Time":i})),clearTimeout(m.performance.timer),m.performance.timer=setTimeout(m.performance.display,100)},display:function(){var t=v.name+":",i=0;s=!1,clearTimeout(m.performance.timer),e.each(d,function(e,t){i+=t["Execution Time"]}),t+=" "+i+"ms",p&&(t+=" '"+p+"'"),r.size()>1&&(t+=" ("+r.size()+")"),(console.group!==n||console.table!==n)&&d.length>0&&(console.groupCollapsed(t),console.table?console.table(d):e.each(d,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),d=[]}},invoke:function(t,i,a){var r,s,d,u=A;return i=i||c,a=T||a,"string"==typeof t&&u!==n&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(i,a){var o=i!=r?a+t[i+1].charAt(0).toUpperCase()+t[i+1].slice(1):t;if(e.isPlainObject(u[o])&&i!=r)u=u[o];else{if(u[o]!==n)return s=u[o],!1;if(!e.isPlainObject(u[a])||i==r)return u[a]!==n?(s=u[a],!1):!1;u=u[a]}})),e.isFunction(s)?d=s.apply(a,i):s!==n&&(d=s),e.isArray(o)?o.push(d):o!==n?o=[o,d]:d!==n&&(o=d),s}},l?(A===n&&m.initialize(),m.invoke(u)):(A!==n&&m.destroy(),m.initialize())}),o!==n?o:this},e.fn.shape.settings={name:"Shape",debug:!1,verbose:!0,performance:!0,namespace:"shape",beforeChange:function(){},onChange:function(){},allowRepeats:!1,duration:700,error:{side:"You tried to switch to a side that does not exist.",method:"The method you called is not defined"},className:{animating:"animating",hidden:"hidden",loading:"loading",active:"active"},selector:{sides:".sides",side:".side"}}}(jQuery,window,document);
/*
 * # Semantic - Sidebar
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.sidebar = function(parameters) {
  var
    $allModules    = $(this),
    $window        = $(window),
    $document      = $(document),
    $html          = $('html'),
    $head          = $('head'),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.sidebar.settings, parameters)
          : $.extend({}, $.fn.sidebar.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        regExp          = settings.regExp,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $context        = $(settings.context),

        $sidebars       = $module.children(selector.sidebar),
        $pusher         = $context.children(selector.pusher),
        $style,

        element         = this,
        instance        = $module.data(moduleNamespace),

        elementNamespace,
        id,
        currentScroll,
        transitionEvent,

        module
      ;

      module      = {

        initialize: function() {
          module.debug('Initializing sidebar', parameters);

          module.create.id();

          transitionEvent = module.get.transitionEvent();

          // cache on initialize
          if( module.is.legacy() || settings.legacy) {
            settings.transition = 'overlay';
            settings.useLegacy = true;
          }

          if(module.is.ios()) {
            module.set.ios();
          }

          // avoids locking rendering if initialized in onReady
          requestAnimationFrame(module.setup.layout);

          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        create: {
          id: function() {
            module.verbose('Creating unique id for element');
            id = module.get.uniqueID();
            elementNamespace = '.' + id;
          }
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          module.remove.direction();
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
          // bound by uuid
          $context.off(elementNamespace);
          $window.off(elementNamespace);
          $document.off(elementNamespace);
        },

        event: {
          clickaway: function(event) {
            if( $(event.target).closest(selector.sidebar).size() === 0 ) {
              module.verbose('User clicked on dimmed page');
              module.hide();
            }
          },
          touch: function(event) {
            //event.stopPropagation();
          },
          containScroll: function(event) {
            if(element.scrollTop <= 0)  {
              element.scrollTop = 1;
            }
            if((element.scrollTop + element.offsetHeight) >= element.scrollHeight) {
              element.scrollTop = element.scrollHeight - element.offsetHeight - 1;
            }
          },
          scroll: function(event) {
            if( $(event.target).closest(selector.sidebar).size() === 0 ) {
              event.preventDefault();
            }
          }
        },

        bind: {
          clickaway: function() {
            module.verbose('Adding clickaway events to context', $context);
            if(settings.closable) {
              $context
                .on('click' + elementNamespace, module.event.clickaway)
                .on('touchend' + elementNamespace, module.event.clickaway)
              ;
            }
          },
          scrollLock: function() {
            if(settings.scrollLock) {
              module.debug('Disabling page scroll');
              $window
                .on('DOMMouseScroll' + elementNamespace, module.event.scroll)
              ;
            }
            module.verbose('Adding events to contain sidebar scroll');
            $document
              .on('touchmove' + elementNamespace, module.event.touch)
            ;
            $module
              .on('scroll' + eventNamespace, module.event.containScroll)
            ;
          }
        },
        unbind: {
          clickaway: function() {
            module.verbose('Removing clickaway events from context', $context);
            $context.off(elementNamespace);
          },
          scrollLock: function() {
            module.verbose('Removing scroll lock from page');
            $document.off(elementNamespace);
            $window.off(elementNamespace);
            $module.off('scroll' + eventNamespace);
          }
        },

        add: {
          bodyCSS: function(direction, distance) {
            var
              width  = $module.outerWidth(),
              height = $module.outerHeight(),
              style
            ;
            style  = ''
              + '<style title="' + namespace + '">'
              + ' .ui.visible.left.sidebar ~ .fixed,'
              + ' .ui.visible.left.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d('+ width + 'px, 0, 0);'
              + '           transform: translate3d('+ width + 'px, 0, 0);'
              + ' }'
              + ' .ui.visible.right.sidebar ~ .fixed,'
              + ' .ui.visible.right.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(-'+ width + 'px, 0, 0);'
              + '           transform: translate3d(-'+ width + 'px, 0, 0);'
              + ' }'
              + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .fixed,'
              + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher,'
              + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .fixed,'
              + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0px, 0, 0);'
              + '           transform: translate3d(0px, 0, 0);'
              + ' }'
              + ' .ui.visible.top.sidebar ~ .fixed,'
              + ' .ui.visible.top.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0, ' + height + 'px, 0);'
              + '           transform: translate3d(0, ' + height + 'px, 0);'
              + ' }'
              + ' .ui.visible.bottom.sidebar ~ .fixed,'
              + ' .ui.visible.bottom.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0, -' + height + 'px, 0);'
              + '           transform: translate3d(0, -' + height + 'px, 0);'
              + ' }'
            ;

            /* IE is only browser not to create context with transforms */
            /* https://www.w3.org/Bugs/Public/show_bug.cgi?id=16328 */
            if( module.is.ie() ) {
              style += ''
                + ' .ui.visible.left.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d('+ width + 'px, 0, 0);'
                + '           transform: translate3d('+ width + 'px, 0, 0);'
                + ' }'
                + ' .ui.visible.right.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(-'+ width + 'px, 0, 0);'
                + '           transform: translate3d(-'+ width + 'px, 0, 0);'
                + ' }'
                + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher:after,'
                + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0px, 0, 0);'
                + '           transform: translate3d(0px, 0, 0);'
                + ' }'
                + ' .ui.visible.top.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0, ' + height + 'px, 0);'
                + '           transform: translate3d(0, ' + height + 'px, 0);'
                + ' }'
                + ' .ui.visible.bottom.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0, -' + height + 'px, 0);'
                + '           transform: translate3d(0, -' + height + 'px, 0);'
                + ' }'
              ;
            }

           style += '</style>';

            $head.append(style);
            $style = $('style[title=' + namespace + ']');
            module.debug('Adding sizing css to head', $style);
          }
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $context  = $(settings.context);
          $sidebars = $context.children(selector.sidebar);
          $pusher   = $context.children(selector.pusher);
        },

        refreshSidebars: function() {
          module.verbose('Refreshing other sidebars');
          $sidebars = $context.children(selector.sidebar);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          element.style.display='none';
          element.offsetHeight;
          element.scrollTop = element.scrollTop;
          element.style.display='';
        },

        setup: {
          layout: function() {
            if( $context.children(selector.pusher).size() === 0 ) {
              module.debug('Adding wrapper element for sidebar');
              module.error(error.pusher);
              $pusher = $('<div class="pusher" />');
              $context
                .children()
                  .not(selector.omitted)
                  .not($sidebars)
                  .wrapAll($pusher)
              ;
              module.refresh();
            }
            if($module.nextAll(selector.pusher).size() === 0 || $module.nextAll(selector.pusher)[0] !== $pusher[0]) {
              module.debug('Moved sidebar to correct parent element');
              module.error(error.movedSidebar, element);
              $module.detach().prependTo($context);
              module.refresh();
            }
            module.set.pushable();
            module.set.direction();
          }
        },

        attachEvents: function(selector, event) {
          var
            $toggle = $(selector)
          ;
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if($toggle.size() > 0) {
            module.debug('Attaching sidebar events to element', selector, event);
            $toggle
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound, selector);
          }
        },

        show: function(callback) {
          var
            animateMethod = (settings.useLegacy)
              ? module.legacyPushPage
              : module.pushPage
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(module.is.hidden()) {
            module.refreshSidebars();
            if(settings.overlay)  {
              module.error(error.overlay);
              settings.transition = 'overlay';
            }
            module.refresh();
            if(module.othersVisible() && module.get.transition() != 'overlay') {
              module.debug('Other sidebars currently open');
              if(settings.exclusive) {
                module.hideOthers();
              }
            }
            animateMethod(function() {
              $.proxy(callback, element)();
              $.proxy(settings.onShow, element)();
            });
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onVisible, element)();
          }
          else {
            module.debug('Sidebar is already visible');
          }
        },

        hide: function(callback) {
          var
            animateMethod = (settings.useLegacy)
              ? module.legacyPullPage
              : module.pullPage
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(module.is.visible() || module.is.animating()) {
            module.debug('Hiding sidebar', callback);
            module.refreshSidebars();
            animateMethod(function() {
              $.proxy(callback, element)();
              $.proxy(settings.onHidden, element)();
            });
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onHide, element)();
          }
        },

        othersVisible: function() {
          return ($sidebars.not($module).filter('.' + className.visible).size() > 0);
        },

        hideOthers: function(callback) {
          var
            $otherSidebars = $sidebars.not($module).filter('.' + className.visible),
            callback       = callback || function(){},
            sidebarCount   = $otherSidebars.size(),
            callbackCount  = 0
          ;
          $otherSidebars
            .sidebar('hide', function() {
              callbackCount++;
              if(callbackCount == sidebarCount) {
                callback();
              }
            })
          ;
        },

        toggle: function() {
          module.verbose('Determining toggled direction');
          if(module.is.hidden()) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        pushPage: function(callback) {
          var
            transition = module.get.transition(),
            $transition = (transition == 'safe')
              ? $context
              : (transition == 'overlay' || module.othersVisible())
                ? $module
                : $pusher,
            animate,
            transitionEnd
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(settings.transition == 'scale down') {
            module.scrollToTop();
          }
          module.set.transition();
          module.repaint();
          animate = function() {
            module.bind.clickaway();
            module.add.bodyCSS();
            module.set.animating();
            module.set.visible();
            if(!module.othersVisible()) {
              if(settings.dimPage) {
                $pusher.addClass(className.dimmed);
              }
            }
          };
          transitionEnd = function(event) {
            if( event.target == $transition[0] ) {
              $transition.off(transitionEvent + elementNamespace, transitionEnd);
              module.remove.animating();
              module.bind.scrollLock();
              $.proxy(callback, element)();
            }
          };
          $transition.off(transitionEvent + elementNamespace);
          $transition.on(transitionEvent + elementNamespace, transitionEnd);
          requestAnimationFrame(animate);
        },

        pullPage: function(callback) {
          var
            transition = module.get.transition(),
            $transition = (transition == 'safe')
              ? $context
              : (transition == 'overlay' || module.othersVisible())
                ? $module
                : $pusher,
            animate,
            transitionEnd
          ;
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.verbose('Removing context push state', module.get.direction());

          module.unbind.clickaway();
          module.unbind.scrollLock();

          animate = function() {
            module.set.animating();
            module.remove.visible();
            if(settings.dimPage && !module.othersVisible()) {
              $pusher.removeClass(className.dimmed);
            }
          };
          transitionEnd = function(event) {
            if( event.target == $transition[0] ) {
              $transition.off(transitionEvent + elementNamespace, transitionEnd);
              module.remove.animating();
              module.remove.transition();
              module.remove.bodyCSS();
              if(transition == 'scale down' || (settings.returnScroll && module.is.mobile()) ) {
                module.scrollBack();
              }
              $.proxy(callback, element)();
            }
          };
          $transition.off(transitionEvent + elementNamespace);
          $transition.on(transitionEvent + elementNamespace, transitionEnd);
          requestAnimationFrame(animate);
        },

        legacyPushPage: function(callback) {
          var
            distance   = $module.width(),
            direction  = module.get.direction(),
            properties = {}
          ;
          distance  = distance || $module.width();
          callback  = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          properties[direction] = distance;
          module.debug('Using javascript to push context', properties);
          module.set.visible();
          module.set.transition();
          module.set.animating();
          if(settings.dimPage) {
            $pusher.addClass(className.dimmed);
          }
          $context
            .css('position', 'relative')
            .animate(properties, settings.duration, settings.easing, function() {
              module.remove.animating();
              module.bind.clickaway();
              $.proxy(callback, module)();
            })
          ;
        },
        legacyPullPage: function(callback) {
          var
            distance   = 0,
            direction  = module.get.direction(),
            properties = {}
          ;
          distance  = distance || $module.width();
          callback  = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          properties[direction] = '0px';
          module.debug('Using javascript to pull context', properties);
          module.unbind.clickaway();
          module.set.animating();
          module.remove.visible();
          if(settings.dimPage && !module.othersVisible()) {
            $pusher.removeClass(className.dimmed);
          }
          $context
            .css('position', 'relative')
            .animate(properties, settings.duration, settings.easing, function() {
              module.remove.animating();
              $.proxy(callback, module)();
            })
          ;
        },

        scrollToTop: function() {
          module.verbose('Scrolling to top of page to avoid animation issues');
          currentScroll = $(window).scrollTop();
          $module.scrollTop(0);
          window.scrollTo(0, 0);
        },

        scrollBack: function() {
          module.verbose('Scrolling back to original page position');
          window.scrollTo(0, currentScroll);
        },

        set: {
          // html
          ios: function() {
            $html.addClass(className.ios);
          },

          // container
          pushed: function() {
            $context.addClass(className.pushed);
          },
          pushable: function() {
            $context.addClass(className.pushable);
          },

          // sidebar
          active: function() {
            $module.addClass(className.active);
          },
          animating: function() {
            $module.addClass(className.animating);
          },
          transition: function(transition) {
            transition = transition || module.get.transition();
            $module.addClass(transition);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            $module.addClass(className[direction]);
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          overlay: function() {
            $module.addClass(className.overlay);
          }
        },
        remove: {

          bodyCSS: function() {
            module.debug('Removing body css styles', $style);
            if($style.size() > 0) {
              $style.remove();
            }
          },

          // context
          pushed: function() {
            $context.removeClass(className.pushed);
          },
          pushable: function() {
            $context.removeClass(className.pushable);
          },

          // sidebar
          active: function() {
            $module.removeClass(className.active);
          },
          animating: function() {
            $module.removeClass(className.animating);
          },
          transition: function(transition) {
            transition = transition || module.get.transition();
            $module.removeClass(transition);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            $module.removeClass(className[direction]);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          overlay: function() {
            $module.removeClass(className.overlay);
          }
        },

        get: {
          direction: function() {
            if($module.hasClass(className.top)) {
              return className.top;
            }
            else if($module.hasClass(className.right)) {
              return className.right;
            }
            else if($module.hasClass(className.bottom)) {
              return className.bottom;
            }
            return className.left;
          },
          transition: function() {
            var
              direction = module.get.direction(),
              transition
            ;
            return ( module.is.mobile() )
              ? (settings.mobileTransition == 'auto')
                ? settings.defaultTransition.mobile[direction]
                : settings.mobileTransition
              : (settings.transition == 'auto')
                ? settings.defaultTransition.computer[direction]
                : settings.transition
            ;
          },
          transitionEvent: function() {
            var
              element     = document.createElement('element'),
              transitions = {
                'transition'       :'transitionend',
                'OTransition'      :'oTransitionEnd',
                'MozTransition'    :'transitionend',
                'WebkitTransition' :'webkitTransitionEnd'
              },
              transition
            ;
            for(transition in transitions){
              if( element.style[transition] !== undefined ){
                return transitions[transition];
              }
            }
          },
          uniqueID: function() {
            return (Math.random().toString(16) + '000000000').substr(2,8);
          }
        },

        is: {

          ie: function() {
            var
              isIE11 = (!(window.ActiveXObject) && 'ActiveXObject' in window),
              isIE   = ('ActiveXObject' in window)
            ;
            return (isIE11 || isIE);
          },

          legacy: function() {
            var
              element    = document.createElement('div'),
              transforms = {
                'webkitTransform' :'-webkit-transform',
                'OTransform'      :'-o-transform',
                'msTransform'     :'-ms-transform',
                'MozTransform'    :'-moz-transform',
                'transform'       :'transform'
              },
              has3D
            ;

            // Add it to the body to get the computed style.
            document.body.insertBefore(element, null);
            for (var transform in transforms) {
              if (element.style[transform] !== undefined) {
                element.style[transform] = "translate3d(1px,1px,1px)";
                has3D = window.getComputedStyle(element).getPropertyValue(transforms[transform]);
              }
            }
            document.body.removeChild(element);
            return !(has3D !== undefined && has3D.length > 0 && has3D !== 'none');
          },
          ios: function() {
            var
              userAgent = navigator.userAgent,
              isIOS     = regExp.ios.test(userAgent)
            ;
            if(isIOS) {
              module.verbose('Browser was found to be iOS', userAgent);
              return true;
            }
            else {
              return false;
            }
          },
          mobile: function() {
            var
              userAgent    = navigator.userAgent,
              isMobile     = regExp.mobile.test(userAgent)
            ;
            if(isMobile) {
              module.verbose('Browser was found to be mobile', userAgent);
              return true;
            }
            else {
              module.verbose('Browser is not mobile, using regular transition', userAgent);
              return false;
            }
          },
          hidden: function() {
            return !module.is.visible();
          },
          visible: function() {
            return $module.hasClass(className.visible);
          },
          // alias
          open: function() {
            return module.is.visible();
          },
          closed: function() {
            return module.is.hidden();
          },
          vertical: function() {
            return $module.hasClass(className.top);
          },
          animating: function() {
            return $context.hasClass(className.animating);
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      }
    ;

    if(methodInvoked) {
      if(instance === undefined) {
        module.initialize();
      }
      module.invoke(query);
    }
    else {
      if(instance !== undefined) {
        module.invoke('destroy');
      }
      module.initialize();
    }
  });

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.sidebar.settings = {

  name              : 'Sidebar',
  namespace         : 'sidebar',

  debug             : false,
  verbose           : true,
  performance       : true,

  transition        : 'auto',
  mobileTransition  : 'auto',

  defaultTransition : {
    computer: {
      left   : 'uncover',
      right  : 'uncover',
      top    : 'overlay',
      bottom : 'overlay'
    },
    mobile: {
      left   : 'uncover',
      right  : 'uncover',
      top    : 'overlay',
      bottom : 'overlay'
    }
  },

  context           : 'body',
  exclusive         : false,
  closable          : true,
  dimPage           : true,
  scrollLock        : false,
  returnScroll      : false,

  useLegacy         : false,
  duration          : 500,
  easing            : 'easeInOutQuint',

  onChange          : function(){},
  onShow            : function(){},
  onHide            : function(){},

  onHidden          : function(){},
  onVisible         : function(){},

  className         : {
    active    : 'active',
    animating : 'animating',
    dimmed    : 'dimmed',
    ios       : 'ios',
    pushable  : 'pushable',
    pushed    : 'pushed',
    right     : 'right',
    top       : 'top',
    left      : 'left',
    bottom    : 'bottom',
    visible   : 'visible'
  },

  selector: {
    fixed   : '.fixed',
    omitted : 'script, link, style, .ui.modal, .ui.dimmer, .ui.nag, .ui.fixed',
    pusher  : '.pusher',
    sidebar : '.ui.sidebar'
  },

  regExp: {
    ios    : /(iPad|iPhone|iPod)/g,
    mobile : /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/g
  },

  error   : {
    method       : 'The method you called is not defined.',
    pusher       : 'Had to add pusher element. For optimal performance make sure body content is inside a pusher element',
    movedSidebar : 'Had to move sidebar. For optimal performance make sure sidebar and pusher are direct children of your body tag',
    overlay      : 'The overlay setting is no longer supported, use animation: overlay',
    notFound     : 'There were no elements that matched the specified selector'
  }

};

// Adds easing
$.extend( $.easing, {
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});


})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,i,t,n){"use strict";e.fn.sidebar=function(o){var r,s=e(this),a=e(i),l=e(t),c=e("html"),u=e("head"),d=s.selector||"",f=(new Date).getTime(),b=[],m=arguments[0],g="string"==typeof m,p=[].slice.call(arguments,1),v=i.requestAnimationFrame||i.mozRequestAnimationFrame||i.webkitRequestAnimationFrame||i.msRequestAnimationFrame||function(e){setTimeout(e,0)};return s.each(function(){var s,h,y,x,k,w,T=e.isPlainObject(o)?e.extend(!0,{},e.fn.sidebar.settings,o):e.extend({},e.fn.sidebar.settings),C=T.selector,S=T.className,P=T.namespace,A=T.regExp,F=T.error,O="."+P,z="module-"+P,E=e(this),H=e(T.context),D=E.children(C.sidebar),j=H.children(C.pusher),L=this,M=E.data(z);w={initialize:function(){w.debug("Initializing sidebar",o),w.create.id(),k=w.get.transitionEvent(),(w.is.legacy()||T.legacy)&&(T.transition="overlay",T.useLegacy=!0),w.is.ios()&&w.set.ios(),v(w.setup.layout),w.instantiate()},instantiate:function(){w.verbose("Storing instance of module",w),M=w,E.data(z,w)},create:{id:function(){w.verbose("Creating unique id for element"),y=w.get.uniqueID(),h="."+y}},destroy:function(){w.verbose("Destroying previous module for",E),w.remove.direction(),E.off(O).removeData(z),H.off(h),a.off(h),l.off(h)},event:{clickaway:function(i){0===e(i.target).closest(C.sidebar).size()&&(w.verbose("User clicked on dimmed page"),w.hide())},touch:function(){},containScroll:function(){L.scrollTop<=0&&(L.scrollTop=1),L.scrollTop+L.offsetHeight>=L.scrollHeight&&(L.scrollTop=L.scrollHeight-L.offsetHeight-1)},scroll:function(i){0===e(i.target).closest(C.sidebar).size()&&i.preventDefault()}},bind:{clickaway:function(){w.verbose("Adding clickaway events to context",H),T.closable&&H.on("click"+h,w.event.clickaway).on("touchend"+h,w.event.clickaway)},scrollLock:function(){T.scrollLock&&(w.debug("Disabling page scroll"),a.on("DOMMouseScroll"+h,w.event.scroll)),w.verbose("Adding events to contain sidebar scroll"),l.on("touchmove"+h,w.event.touch),E.on("scroll"+O,w.event.containScroll)}},unbind:{clickaway:function(){w.verbose("Removing clickaway events from context",H),H.off(h)},scrollLock:function(){w.verbose("Removing scroll lock from page"),l.off(h),a.off(h),E.off("scroll"+O)}},add:{bodyCSS:function(){var i,t=E.outerWidth(),n=E.outerHeight();i='<style title="'+P+'"> .ui.visible.left.sidebar ~ .fixed, .ui.visible.left.sidebar ~ .pusher {   -webkit-transform: translate3d('+t+"px, 0, 0);           transform: translate3d("+t+"px, 0, 0); } .ui.visible.right.sidebar ~ .fixed, .ui.visible.right.sidebar ~ .pusher {   -webkit-transform: translate3d(-"+t+"px, 0, 0);           transform: translate3d(-"+t+"px, 0, 0); } .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .fixed, .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher, .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .fixed, .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher {   -webkit-transform: translate3d(0px, 0, 0);           transform: translate3d(0px, 0, 0); } .ui.visible.top.sidebar ~ .fixed, .ui.visible.top.sidebar ~ .pusher {   -webkit-transform: translate3d(0, "+n+"px, 0);           transform: translate3d(0, "+n+"px, 0); } .ui.visible.bottom.sidebar ~ .fixed, .ui.visible.bottom.sidebar ~ .pusher {   -webkit-transform: translate3d(0, -"+n+"px, 0);           transform: translate3d(0, -"+n+"px, 0); }",w.is.ie()&&(i+=" .ui.visible.left.sidebar ~ .pusher:after {   -webkit-transform: translate3d("+t+"px, 0, 0);           transform: translate3d("+t+"px, 0, 0); } .ui.visible.right.sidebar ~ .pusher:after {   -webkit-transform: translate3d(-"+t+"px, 0, 0);           transform: translate3d(-"+t+"px, 0, 0); } .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher:after, .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher:after {   -webkit-transform: translate3d(0px, 0, 0);           transform: translate3d(0px, 0, 0); } .ui.visible.top.sidebar ~ .pusher:after {   -webkit-transform: translate3d(0, "+n+"px, 0);           transform: translate3d(0, "+n+"px, 0); } .ui.visible.bottom.sidebar ~ .pusher:after {   -webkit-transform: translate3d(0, -"+n+"px, 0);           transform: translate3d(0, -"+n+"px, 0); }"),i+="</style>",u.append(i),s=e("style[title="+P+"]"),w.debug("Adding sizing css to head",s)}},refresh:function(){w.verbose("Refreshing selector cache"),H=e(T.context),D=H.children(C.sidebar),j=H.children(C.pusher)},refreshSidebars:function(){w.verbose("Refreshing other sidebars"),D=H.children(C.sidebar)},repaint:function(){w.verbose("Forcing repaint event"),L.style.display="none",L.offsetHeight,L.scrollTop=L.scrollTop,L.style.display=""},setup:{layout:function(){0===H.children(C.pusher).size()&&(w.debug("Adding wrapper element for sidebar"),w.error(F.pusher),j=e('<div class="pusher" />'),H.children().not(C.omitted).not(D).wrapAll(j),w.refresh()),(0===E.nextAll(C.pusher).size()||E.nextAll(C.pusher)[0]!==j[0])&&(w.debug("Moved sidebar to correct parent element"),w.error(F.movedSidebar,L),E.detach().prependTo(H),w.refresh()),w.set.pushable(),w.set.direction()}},attachEvents:function(i,t){var n=e(i);t=e.isFunction(w[t])?w[t]:w.toggle,n.size()>0?(w.debug("Attaching sidebar events to element",i,t),n.on("click"+O,t)):w.error(F.notFound,i)},show:function(i){var t=T.useLegacy?w.legacyPushPage:w.pushPage;i=e.isFunction(i)?i:function(){},w.is.hidden()?(w.refreshSidebars(),T.overlay&&(w.error(F.overlay),T.transition="overlay"),w.refresh(),w.othersVisible()&&"overlay"!=w.get.transition()&&(w.debug("Other sidebars currently open"),T.exclusive&&w.hideOthers()),t(function(){e.proxy(i,L)(),e.proxy(T.onShow,L)()}),e.proxy(T.onChange,L)(),e.proxy(T.onVisible,L)()):w.debug("Sidebar is already visible")},hide:function(i){var t=T.useLegacy?w.legacyPullPage:w.pullPage;i=e.isFunction(i)?i:function(){},(w.is.visible()||w.is.animating())&&(w.debug("Hiding sidebar",i),w.refreshSidebars(),t(function(){e.proxy(i,L)(),e.proxy(T.onHidden,L)()}),e.proxy(T.onChange,L)(),e.proxy(T.onHide,L)())},othersVisible:function(){return D.not(E).filter("."+S.visible).size()>0},hideOthers:function(e){var i=D.not(E).filter("."+S.visible),e=e||function(){},t=i.size(),n=0;i.sidebar("hide",function(){n++,n==t&&e()})},toggle:function(){w.verbose("Determining toggled direction"),w.is.hidden()?w.show():w.hide()},pushPage:function(i){var t,n,o=w.get.transition(),r="safe"==o?H:"overlay"==o||w.othersVisible()?E:j;i=e.isFunction(i)?i:function(){},"scale down"==T.transition&&w.scrollToTop(),w.set.transition(),w.repaint(),t=function(){w.bind.clickaway(),w.add.bodyCSS(),w.set.animating(),w.set.visible(),w.othersVisible()||T.dimPage&&j.addClass(S.dimmed)},n=function(t){t.target==r[0]&&(r.off(k+h,n),w.remove.animating(),w.bind.scrollLock(),e.proxy(i,L)())},r.off(k+h),r.on(k+h,n),v(t)},pullPage:function(i){var t,n,o=w.get.transition(),r="safe"==o?H:"overlay"==o||w.othersVisible()?E:j;i=e.isFunction(i)?i:function(){},w.verbose("Removing context push state",w.get.direction()),w.unbind.clickaway(),w.unbind.scrollLock(),t=function(){w.set.animating(),w.remove.visible(),T.dimPage&&!w.othersVisible()&&j.removeClass(S.dimmed)},n=function(t){t.target==r[0]&&(r.off(k+h,n),w.remove.animating(),w.remove.transition(),w.remove.bodyCSS(),("scale down"==o||T.returnScroll&&w.is.mobile())&&w.scrollBack(),e.proxy(i,L)())},r.off(k+h),r.on(k+h,n),v(t)},legacyPushPage:function(i){var t=E.width(),n=w.get.direction(),o={};t=t||E.width(),i=e.isFunction(i)?i:function(){},o[n]=t,w.debug("Using javascript to push context",o),w.set.visible(),w.set.transition(),w.set.animating(),T.dimPage&&j.addClass(S.dimmed),H.css("position","relative").animate(o,T.duration,T.easing,function(){w.remove.animating(),w.bind.clickaway(),e.proxy(i,w)()})},legacyPullPage:function(i){var t=0,n=w.get.direction(),o={};t=t||E.width(),i=e.isFunction(i)?i:function(){},o[n]="0px",w.debug("Using javascript to pull context",o),w.unbind.clickaway(),w.set.animating(),w.remove.visible(),T.dimPage&&!w.othersVisible()&&j.removeClass(S.dimmed),H.css("position","relative").animate(o,T.duration,T.easing,function(){w.remove.animating(),e.proxy(i,w)()})},scrollToTop:function(){w.verbose("Scrolling to top of page to avoid animation issues"),x=e(i).scrollTop(),E.scrollTop(0),i.scrollTo(0,0)},scrollBack:function(){w.verbose("Scrolling back to original page position"),i.scrollTo(0,x)},set:{ios:function(){c.addClass(S.ios)},pushed:function(){H.addClass(S.pushed)},pushable:function(){H.addClass(S.pushable)},active:function(){E.addClass(S.active)},animating:function(){E.addClass(S.animating)},transition:function(e){e=e||w.get.transition(),E.addClass(e)},direction:function(e){e=e||w.get.direction(),E.addClass(S[e])},visible:function(){E.addClass(S.visible)},overlay:function(){E.addClass(S.overlay)}},remove:{bodyCSS:function(){w.debug("Removing body css styles",s),s.size()>0&&s.remove()},pushed:function(){H.removeClass(S.pushed)},pushable:function(){H.removeClass(S.pushable)},active:function(){E.removeClass(S.active)},animating:function(){E.removeClass(S.animating)},transition:function(e){e=e||w.get.transition(),E.removeClass(e)},direction:function(e){e=e||w.get.direction(),E.removeClass(S[e])},visible:function(){E.removeClass(S.visible)},overlay:function(){E.removeClass(S.overlay)}},get:{direction:function(){return E.hasClass(S.top)?S.top:E.hasClass(S.right)?S.right:E.hasClass(S.bottom)?S.bottom:S.left},transition:function(){var e=w.get.direction();return w.is.mobile()?"auto"==T.mobileTransition?T.defaultTransition.mobile[e]:T.mobileTransition:"auto"==T.transition?T.defaultTransition.computer[e]:T.transition},transitionEvent:function(){var e,i=t.createElement("element"),o={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(e in o)if(i.style[e]!==n)return o[e]},uniqueID:function(){return(Math.random().toString(16)+"000000000").substr(2,8)}},is:{ie:function(){var e=!i.ActiveXObject&&"ActiveXObject"in i,t="ActiveXObject"in i;return e||t},legacy:function(){var e,o=t.createElement("div"),r={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};t.body.insertBefore(o,null);for(var s in r)o.style[s]!==n&&(o.style[s]="translate3d(1px,1px,1px)",e=i.getComputedStyle(o).getPropertyValue(r[s]));return t.body.removeChild(o),!(e!==n&&e.length>0&&"none"!==e)},ios:function(){var e=navigator.userAgent,i=A.ios.test(e);return i?(w.verbose("Browser was found to be iOS",e),!0):!1},mobile:function(){var e=navigator.userAgent,i=A.mobile.test(e);return i?(w.verbose("Browser was found to be mobile",e),!0):(w.verbose("Browser is not mobile, using regular transition",e),!1)},hidden:function(){return!w.is.visible()},visible:function(){return E.hasClass(S.visible)},open:function(){return w.is.visible()},closed:function(){return w.is.hidden()},vertical:function(){return E.hasClass(S.top)},animating:function(){return H.hasClass(S.animating)}},setting:function(i,t){if(w.debug("Changing setting",i,t),e.isPlainObject(i))e.extend(!0,T,i);else{if(t===n)return T[i];T[i]=t}},internal:function(i,t){if(e.isPlainObject(i))e.extend(!0,w,i);else{if(t===n)return w[i];w[i]=t}},debug:function(){T.debug&&(T.performance?w.performance.log(arguments):(w.debug=Function.prototype.bind.call(console.info,console,T.name+":"),w.debug.apply(console,arguments)))},verbose:function(){T.verbose&&T.debug&&(T.performance?w.performance.log(arguments):(w.verbose=Function.prototype.bind.call(console.info,console,T.name+":"),w.verbose.apply(console,arguments)))},error:function(){w.error=Function.prototype.bind.call(console.error,console,T.name+":"),w.error.apply(console,arguments)},performance:{log:function(e){var i,t,n;T.performance&&(i=(new Date).getTime(),n=f||i,t=i-n,f=i,b.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:L,"Execution Time":t})),clearTimeout(w.performance.timer),w.performance.timer=setTimeout(w.performance.display,100)},display:function(){var i=T.name+":",t=0;f=!1,clearTimeout(w.performance.timer),e.each(b,function(e,i){t+=i["Execution Time"]}),i+=" "+t+"ms",d&&(i+=" '"+d+"'"),(console.group!==n||console.table!==n)&&b.length>0&&(console.groupCollapsed(i),console.table?console.table(b):e.each(b,function(e,i){console.log(i.Name+": "+i["Execution Time"]+"ms")}),console.groupEnd()),b=[]}},invoke:function(i,t,o){var s,a,l,c=M;return t=t||p,o=L||o,"string"==typeof i&&c!==n&&(i=i.split(/[\. ]/),s=i.length-1,e.each(i,function(t,o){var r=t!=s?o+i[t+1].charAt(0).toUpperCase()+i[t+1].slice(1):i;if(e.isPlainObject(c[r])&&t!=s)c=c[r];else{if(c[r]!==n)return a=c[r],!1;if(!e.isPlainObject(c[o])||t==s)return c[o]!==n?(a=c[o],!1):(w.error(F.method,i),!1);c=c[o]}})),e.isFunction(a)?l=a.apply(o,t):a!==n&&(l=a),e.isArray(r)?r.push(l):r!==n?r=[r,l]:l!==n&&(r=l),a}},g?(M===n&&w.initialize(),w.invoke(m)):(M!==n&&w.invoke("destroy"),w.initialize())}),r!==n?r:this},e.fn.sidebar.settings={name:"Sidebar",namespace:"sidebar",debug:!1,verbose:!0,performance:!0,transition:"auto",mobileTransition:"auto",defaultTransition:{computer:{left:"uncover",right:"uncover",top:"overlay",bottom:"overlay"},mobile:{left:"uncover",right:"uncover",top:"overlay",bottom:"overlay"}},context:"body",exclusive:!1,closable:!0,dimPage:!0,scrollLock:!1,returnScroll:!1,useLegacy:!1,duration:500,easing:"easeInOutQuint",onChange:function(){},onShow:function(){},onHide:function(){},onHidden:function(){},onVisible:function(){},className:{active:"active",animating:"animating",dimmed:"dimmed",ios:"ios",pushable:"pushable",pushed:"pushed",right:"right",top:"top",left:"left",bottom:"bottom",visible:"visible"},selector:{fixed:".fixed",omitted:"script, link, style, .ui.modal, .ui.dimmer, .ui.nag, .ui.fixed",pusher:".pusher",sidebar:".ui.sidebar"},regExp:{ios:/(iPad|iPhone|iPod)/g,mobile:/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/g},error:{method:"The method you called is not defined.",pusher:"Had to add pusher element. For optimal performance make sure body content is inside a pusher element",movedSidebar:"Had to move sidebar. For optimal performance make sure sidebar and pusher are direct children of your body tag",overlay:"The overlay setting is no longer supported, use animation: overlay",notFound:"There were no elements that matched the specified selector"}},e.extend(e.easing,{easeInOutQuint:function(e,i,t,n,o){return(i/=o/2)<1?n/2*i*i*i*i*i+t:n/2*((i-=2)*i*i*i*i+2)+t}})}(jQuery,window,document);
/*
 * # Semantic - Site
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
;(function ( $, window, document, undefined ) {

$.site = $.fn.site = function(parameters) {
  var
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.site.settings, parameters)
      : $.extend({}, $.site.settings),

    namespace       = settings.namespace,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

    $document       = $(document),
    $module         = $document,
    element         = this,
    instance        = $module.data(moduleNamespace),

    module,
    returnedValue
  ;
  module = {

    initialize: function() {
      module.instantiate();
    },

    instantiate: function() {
      module.verbose('Storing instance of site', module);
      instance = module;
      $module
        .data(moduleNamespace, module)
      ;
    },

    normalize: function() {
      module.fix.console();
      module.fix.requestAnimationFrame();
    },

    fix: {
      console: function() {
        module.debug('Normalizing window.console');
        if (console === undefined || console.log === undefined) {
          module.verbose('Console not available, normalizing events');
          module.disable.console();
        }
        if (typeof console.group == 'undefined' || typeof console.groupEnd == 'undefined' || typeof console.groupCollapsed == 'undefined') {
          module.verbose('Console group not available, normalizing events');
          window.console.group = function() {};
          window.console.groupEnd = function() {};
          window.console.groupCollapsed = function() {};
        }
        if (typeof console.markTimeline == 'undefined') {
          module.verbose('Mark timeline not available, normalizing events');
          window.console.markTimeline = function() {};
        }
      },
      consoleClear: function() {
        module.debug('Disabling programmatic console clearing');
        window.console.clear = function() {};
      },
      requestAnimationFrame: function() {
        module.debug('Normalizing requestAnimationFrame');
        if(window.requestAnimationFrame === undefined) {
          module.debug('RequestAnimationFrame not available, normailizing event');
          window.requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(callback) { setTimeout(callback, 0); }
          ;
        }
      }
    },

    moduleExists: function(name) {
      return ($.fn[name] !== undefined && $.fn[name].settings !== undefined);
    },

    enabled: {
      modules: function(modules) {
        var
          enabledModules = []
        ;
        modules = modules || settings.modules;
        $.each(modules, function(index, name) {
          if(module.moduleExists(name)) {
            enabledModules.push(name);
          }
        });
        return enabledModules;
      }
    },

    disabled: {
      modules: function(modules) {
        var
          disabledModules = []
        ;
        modules = modules || settings.modules;
        $.each(modules, function(index, name) {
          if(!module.moduleExists(name)) {
            disabledModules.push(name);
          }
        });
        return disabledModules;
      }
    },

    change: {
      setting: function(setting, value, modules, modifyExisting) {
        modules = (typeof modules === 'string')
          ? (modules === 'all')
            ? settings.modules
            : [modules]
          : modules || settings.modules
        ;
        modifyExisting = (modifyExisting !== undefined)
          ? modifyExisting
          : true
        ;
        $.each(modules, function(index, name) {
          var
            namespace = (module.moduleExists(name))
              ? $.fn[name].settings.namespace || false
              : true,
            $existingModules
          ;
          if(module.moduleExists(name)) {
            module.verbose('Changing default setting', setting, value, name);
            $.fn[name].settings[setting] = value;
            if(modifyExisting && namespace) {
              $existingModules = $(':data(module-' + namespace + ')');
              if($existingModules.size() > 0) {
                module.verbose('Modifying existing settings', $existingModules);
                $existingModules[name]('setting', setting, value);
              }
            }
          }
        });
      },
      settings: function(newSettings, modules, modifyExisting) {
        modules = (typeof modules === 'string')
          ? [modules]
          : modules || settings.modules
        ;
        modifyExisting = (modifyExisting !== undefined)
          ? modifyExisting
          : true
        ;
        $.each(modules, function(index, name) {
          var
            $existingModules
          ;
          if(module.moduleExists(name)) {
            module.verbose('Changing default setting', newSettings, name);
            $.extend(true, $.fn[name].settings, newSettings);
            if(modifyExisting && namespace) {
              $existingModules = $(':data(module-' + namespace + ')');
              if($existingModules.size() > 0) {
                module.verbose('Modifying existing settings', $existingModules);
                $existingModules[name]('setting', newSettings);
              }
            }
          }
        });
      }
    },

    enable: {
      console: function() {
        module.console(true);
      },
      debug: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Enabling debug for modules', modules);
        module.change.setting('debug', true, modules, modifyExisting);
      },
      verbose: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Enabling verbose debug for modules', modules);
        module.change.setting('verbose', true, modules, modifyExisting);
      }
    },
    disable: {
      console: function() {
        module.console(false);
      },
      debug: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Disabling debug for modules', modules);
        module.change.setting('debug', false, modules, modifyExisting);
      },
      verbose: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Disabling verbose debug for modules', modules);
        module.change.setting('verbose', false, modules, modifyExisting);
      }
    },

    console: function(enable) {
      if(enable) {
        if(instance.cache.console === undefined) {
          module.error(error.console);
          return;
        }
        module.debug('Restoring console function');
        window.console = instance.cache.console;
      }
      else {
        module.debug('Disabling console function');
        instance.cache.console = window.console;
        window.console = {
          clear          : function(){},
          error          : function(){},
          group          : function(){},
          groupCollapsed : function(){},
          groupEnd       : function(){},
          info           : function(){},
          log            : function(){},
          markTimeline   : function(){},
          warn           : function(){}
        };
      }
    },

    destroy: function() {
      module.verbose('Destroying previous site for', $module);
      $module
        .removeData(moduleNamespace)
      ;
    },

    cache: {},

    setting: function(name, value) {
      if( $.isPlainObject(name) ) {
        $.extend(true, settings, name);
      }
      else if(value !== undefined) {
        settings[name] = value;
      }
      else {
        return settings[name];
      }
    },
    internal: function(name, value) {
      if( $.isPlainObject(name) ) {
        $.extend(true, module, name);
      }
      else if(value !== undefined) {
        module[name] = value;
      }
      else {
        return module[name];
      }
    },
    debug: function() {
      if(settings.debug) {
        if(settings.performance) {
          module.performance.log(arguments);
        }
        else {
          module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
          module.debug.apply(console, arguments);
        }
      }
    },
    verbose: function() {
      if(settings.verbose && settings.debug) {
        if(settings.performance) {
          module.performance.log(arguments);
        }
        else {
          module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
          module.verbose.apply(console, arguments);
        }
      }
    },
    error: function() {
      module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
      module.error.apply(console, arguments);
    },
    performance: {
      log: function(message) {
        var
          currentTime,
          executionTime,
          previousTime
        ;
        if(settings.performance) {
          currentTime   = new Date().getTime();
          previousTime  = time || currentTime;
          executionTime = currentTime - previousTime;
          time          = currentTime;
          performance.push({
            'Element'        : element,
            'Name'           : message[0],
            'Arguments'      : [].slice.call(message, 1) || '',
            'Execution Time' : executionTime
          });
        }
        clearTimeout(module.performance.timer);
        module.performance.timer = setTimeout(module.performance.display, 100);
      },
      display: function() {
        var
          title = settings.name + ':',
          totalTime = 0
        ;
        time = false;
        clearTimeout(module.performance.timer);
        $.each(performance, function(index, data) {
          totalTime += data['Execution Time'];
        });
        title += ' ' + totalTime + 'ms';
        if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
          console.groupCollapsed(title);
          if(console.table) {
            console.table(performance);
          }
          else {
            $.each(performance, function(index, data) {
              console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
            });
          }
          console.groupEnd();
        }
        performance = [];
      }
    },
    invoke: function(query, passedArguments, context) {
      var
        object = instance,
        maxDepth,
        found,
        response
      ;
      passedArguments = passedArguments || queryArguments;
      context         = element         || context;
      if(typeof query == 'string' && object !== undefined) {
        query    = query.split(/[\. ]/);
        maxDepth = query.length - 1;
        $.each(query, function(depth, value) {
          var camelCaseValue = (depth != maxDepth)
            ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
            : query
          ;
          if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
            object = object[camelCaseValue];
          }
          else if( object[camelCaseValue] !== undefined ) {
            found = object[camelCaseValue];
            return false;
          }
          else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
            object = object[value];
          }
          else if( object[value] !== undefined ) {
            found = object[value];
            return false;
          }
          else {
            module.error(error.method, query);
            return false;
          }
        });
      }
      if ( $.isFunction( found ) ) {
        response = found.apply(context, passedArguments);
      }
      else if(found !== undefined) {
        response = found;
      }
      if($.isArray(returnedValue)) {
        returnedValue.push(response);
      }
      else if(returnedValue !== undefined) {
        returnedValue = [returnedValue, response];
      }
      else if(response !== undefined) {
        returnedValue = response;
      }
      return found;
    }
  };

  if(methodInvoked) {
    if(instance === undefined) {
      module.initialize();
    }
    module.invoke(query);
  }
  else {
    if(instance !== undefined) {
      module.destroy();
    }
    module.initialize();
  }
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.site.settings = {

  name        : 'Site',
  namespace   : 'site',

  error : {
    console : 'Console cannot be restored, most likely it was overwritten outside of module',
    method : 'The method you called is not defined.'
  },

  debug       : false,
  verbose     : true,
  performance : true,

  modules: [
    'accordion',
    'api',
    'checkbox',
    'dimmer',
    'dropdown',
    'form',
    'modal',
    'nag',
    'popup',
    'rating',
    'shape',
    'sidebar',
    'state',
    'sticky',
    'tab',
    'transition',
    'video',
    'visit',
    'visibility'
  ],

  siteNamespace   : 'site',
  namespaceStub   : {
    cache     : {},
    config    : {},
    sections  : {},
    section   : {},
    utilities : {}
  }

};

// allows for selection of elements with data attributes
$.extend($.expr[ ":" ], {
  data: ($.expr.createPseudo)
    ? $.expr.createPseudo(function(dataName) {
        return function(elem) {
          return !!$.data(elem, dataName);
        };
      })
    : function(elem, i, match) {
      // support: jQuery < 1.8
      return !!$.data(elem, match[ 3 ]);
    }
});


})( jQuery, window , document );
 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,n,o,i){e.site=e.fn.site=function(t){var s,r,a=(new Date).getTime(),c=[],u=arguments[0],l="string"==typeof u,m=[].slice.call(arguments,1),d=e.isPlainObject(t)?e.extend(!0,{},e.site.settings,t):e.extend({},e.site.settings),f=d.namespace,g=d.error,b="module-"+f,p=e(o),v=p,h=this,y=v.data(b);return s={initialize:function(){s.instantiate()},instantiate:function(){s.verbose("Storing instance of site",s),y=s,v.data(b,s)},normalize:function(){s.fix.console(),s.fix.requestAnimationFrame()},fix:{console:function(){s.debug("Normalizing window.console"),(console===i||console.log===i)&&(s.verbose("Console not available, normalizing events"),s.disable.console()),("undefined"==typeof console.group||"undefined"==typeof console.groupEnd||"undefined"==typeof console.groupCollapsed)&&(s.verbose("Console group not available, normalizing events"),n.console.group=function(){},n.console.groupEnd=function(){},n.console.groupCollapsed=function(){}),"undefined"==typeof console.markTimeline&&(s.verbose("Mark timeline not available, normalizing events"),n.console.markTimeline=function(){})},consoleClear:function(){s.debug("Disabling programmatic console clearing"),n.console.clear=function(){}},requestAnimationFrame:function(){s.debug("Normalizing requestAnimationFrame"),n.requestAnimationFrame===i&&(s.debug("RequestAnimationFrame not available, normailizing event"),n.requestAnimationFrame=n.requestAnimationFrame||n.mozRequestAnimationFrame||n.webkitRequestAnimationFrame||n.msRequestAnimationFrame||function(e){setTimeout(e,0)})}},moduleExists:function(n){return e.fn[n]!==i&&e.fn[n].settings!==i},enabled:{modules:function(n){var o=[];return n=n||d.modules,e.each(n,function(e,n){s.moduleExists(n)&&o.push(n)}),o}},disabled:{modules:function(n){var o=[];return n=n||d.modules,e.each(n,function(e,n){s.moduleExists(n)||o.push(n)}),o}},change:{setting:function(n,o,t,r){t="string"==typeof t?"all"===t?d.modules:[t]:t||d.modules,r=r!==i?r:!0,e.each(t,function(i,t){var a,c=s.moduleExists(t)?e.fn[t].settings.namespace||!1:!0;s.moduleExists(t)&&(s.verbose("Changing default setting",n,o,t),e.fn[t].settings[n]=o,r&&c&&(a=e(":data(module-"+c+")"),a.size()>0&&(s.verbose("Modifying existing settings",a),a[t]("setting",n,o))))})},settings:function(n,o,t){o="string"==typeof o?[o]:o||d.modules,t=t!==i?t:!0,e.each(o,function(o,i){var r;s.moduleExists(i)&&(s.verbose("Changing default setting",n,i),e.extend(!0,e.fn[i].settings,n),t&&f&&(r=e(":data(module-"+f+")"),r.size()>0&&(s.verbose("Modifying existing settings",r),r[i]("setting",n))))})}},enable:{console:function(){s.console(!0)},debug:function(e,n){e=e||d.modules,s.debug("Enabling debug for modules",e),s.change.setting("debug",!0,e,n)},verbose:function(e,n){e=e||d.modules,s.debug("Enabling verbose debug for modules",e),s.change.setting("verbose",!0,e,n)}},disable:{console:function(){s.console(!1)},debug:function(e,n){e=e||d.modules,s.debug("Disabling debug for modules",e),s.change.setting("debug",!1,e,n)},verbose:function(e,n){e=e||d.modules,s.debug("Disabling verbose debug for modules",e),s.change.setting("verbose",!1,e,n)}},console:function(e){if(e){if(y.cache.console===i)return void s.error(g.console);s.debug("Restoring console function"),n.console=y.cache.console}else s.debug("Disabling console function"),y.cache.console=n.console,n.console={clear:function(){},error:function(){},group:function(){},groupCollapsed:function(){},groupEnd:function(){},info:function(){},log:function(){},markTimeline:function(){},warn:function(){}}},destroy:function(){s.verbose("Destroying previous site for",v),v.removeData(b)},cache:{},setting:function(n,o){if(e.isPlainObject(n))e.extend(!0,d,n);else{if(o===i)return d[n];d[n]=o}},internal:function(n,o){if(e.isPlainObject(n))e.extend(!0,s,n);else{if(o===i)return s[n];s[n]=o}},debug:function(){d.debug&&(d.performance?s.performance.log(arguments):(s.debug=Function.prototype.bind.call(console.info,console,d.name+":"),s.debug.apply(console,arguments)))},verbose:function(){d.verbose&&d.debug&&(d.performance?s.performance.log(arguments):(s.verbose=Function.prototype.bind.call(console.info,console,d.name+":"),s.verbose.apply(console,arguments)))},error:function(){s.error=Function.prototype.bind.call(console.error,console,d.name+":"),s.error.apply(console,arguments)},performance:{log:function(e){var n,o,i;d.performance&&(n=(new Date).getTime(),i=a||n,o=n-i,a=n,c.push({Element:h,Name:e[0],Arguments:[].slice.call(e,1)||"","Execution Time":o})),clearTimeout(s.performance.timer),s.performance.timer=setTimeout(s.performance.display,100)},display:function(){var n=d.name+":",o=0;a=!1,clearTimeout(s.performance.timer),e.each(c,function(e,n){o+=n["Execution Time"]}),n+=" "+o+"ms",(console.group!==i||console.table!==i)&&c.length>0&&(console.groupCollapsed(n),console.table?console.table(c):e.each(c,function(e,n){console.log(n.Name+": "+n["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(n,o,t){var a,c,u,l=y;return o=o||m,t=h||t,"string"==typeof n&&l!==i&&(n=n.split(/[\. ]/),a=n.length-1,e.each(n,function(o,t){var r=o!=a?t+n[o+1].charAt(0).toUpperCase()+n[o+1].slice(1):n;if(e.isPlainObject(l[r])&&o!=a)l=l[r];else{if(l[r]!==i)return c=l[r],!1;if(!e.isPlainObject(l[t])||o==a)return l[t]!==i?(c=l[t],!1):(s.error(g.method,n),!1);l=l[t]}})),e.isFunction(c)?u=c.apply(t,o):c!==i&&(u=c),e.isArray(r)?r.push(u):r!==i?r=[r,u]:u!==i&&(r=u),c}},l?(y===i&&s.initialize(),s.invoke(u)):(y!==i&&s.destroy(),s.initialize()),r!==i?r:this},e.site.settings={name:"Site",namespace:"site",error:{console:"Console cannot be restored, most likely it was overwritten outside of module",method:"The method you called is not defined."},debug:!1,verbose:!0,performance:!0,modules:["accordion","api","checkbox","dimmer","dropdown","form","modal","nag","popup","rating","shape","sidebar","state","sticky","tab","transition","video","visit","visibility"],siteNamespace:"site",namespaceStub:{cache:{},config:{},sections:{},section:{},utilities:{}}},e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(n){return function(o){return!!e.data(o,n)}}):function(n,o,i){return!!e.data(n,i[3])}})}(jQuery,window,document);
/*
 * # Semantic - State
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.state = function(parameters) {
  var
    $allModules     = $(this),

    moduleSelector  = $allModules.selector || '',

    hasTouch        = ('ontouchstart' in document.documentElement),
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.state.settings, parameters)
          : $.extend({}, $.fn.state.settings),

        error           = settings.error,
        metadata        = settings.metadata,
        className       = settings.className,
        namespace       = settings.namespace,
        states          = settings.states,
        text            = settings.text,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),

        element         = this,
        instance        = $module.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');

          // allow module to guess desired state based on element
          if(settings.automatic) {
            module.add.defaults();
          }

          // bind events with delegated events
          if(settings.context && moduleSelector !== '') {
            $(settings.context)
              .on(moduleSelector, 'mouseenter' + eventNamespace, module.change.text)
              .on(moduleSelector, 'mouseleave' + eventNamespace, module.reset.text)
              .on(moduleSelector, 'click'      + eventNamespace, module.toggle.state)
            ;
          }
          else {
            $module
              .on('mouseenter' + eventNamespace, module.change.text)
              .on('mouseleave' + eventNamespace, module.reset.text)
              .on('click'      + eventNamespace, module.toggle.state)
            ;
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', instance);
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $module = $(element);
        },

        add: {
          defaults: function() {
            var
              userStates = parameters && $.isPlainObject(parameters.states)
                ? parameters.states
                : {}
            ;
            $.each(settings.defaults, function(type, typeStates) {
              if( module.is[type] !== undefined && module.is[type]() ) {
                module.verbose('Adding default states', type, element);
                $.extend(settings.states, typeStates, userStates);
              }
            });
          }
        },

        is: {

          active: function() {
            return $module.hasClass(className.active);
          },
          loading: function() {
            return $module.hasClass(className.loading);
          },
          inactive: function() {
            return !( $module.hasClass(className.active) );
          },
          state: function(state) {
            if(className[state] === undefined) {
              return false;
            }
            return $module.hasClass( className[state] );
          },

          enabled: function() {
            return !( $module.is(settings.filter.active) );
          },
          disabled: function() {
            return ( $module.is(settings.filter.active) );
          },
          textEnabled: function() {
            return !( $module.is(settings.filter.text) );
          },

          // definitions for automatic type detection
          button: function() {
            return $module.is('.button:not(a, .submit)');
          },
          input: function() {
            return $module.is('input');
          },
          progress: function() {
            return $module.is('.ui.progress');
          }
        },

        allow: function(state) {
          module.debug('Now allowing state', state);
          states[state] = true;
        },
        disallow: function(state) {
          module.debug('No longer allowing', state);
          states[state] = false;
        },

        allows: function(state) {
          return states[state] || false;
        },

        enable: function() {
          $module.removeClass(className.disabled);
        },

        disable: function() {
          $module.addClass(className.disabled);
        },

        setState: function(state) {
          if(module.allows(state)) {
            $module.addClass( className[state] );
          }
        },

        removeState: function(state) {
          if(module.allows(state)) {
            $module.removeClass( className[state] );
          }
        },

        toggle: {
          state: function() {
            var
              apiRequest
            ;
            if( module.allows('active') && module.is.enabled() ) {
              module.refresh();
              if($.fn.api !== undefined) {
                apiRequest = $module.api('get request');
                if(apiRequest) {
                  module.listenTo(apiRequest);
                  return;
                }
              }
              module.change.state();
            }
          }
        },

        listenTo: function(apiRequest) {
          module.debug('API request detected, waiting for state signal', apiRequest);
          if(apiRequest) {
            if(text.loading) {
              module.update.text(text.loading);
            }
            $.when(apiRequest)
              .then(function() {
                if(apiRequest.state() == 'resolved') {
                  module.debug('API request succeeded');
                  settings.activateTest   = function(){ return true; };
                  settings.deactivateTest = function(){ return true; };
                }
                else {
                  module.debug('API request failed');
                  settings.activateTest   = function(){ return false; };
                  settings.deactivateTest = function(){ return false; };
                }
                module.change.state();
              })
            ;
          }
          // xhr exists but set to false, beforeSend killed the xhr
          else {
            settings.activateTest   = function(){ return false; };
            settings.deactivateTest = function(){ return false; };
          }
        },

        // checks whether active/inactive state can be given
        change: {

          state: function() {
            module.debug('Determining state change direction');
            // inactive to active change
            if( module.is.inactive() ) {
              module.activate();
            }
            else {
              module.deactivate();
            }
            if(settings.sync) {
              module.sync();
            }
            $.proxy(settings.onChange, element)();
          },

          text: function() {
            if( module.is.textEnabled() ) {
              if(module.is.disabled() ) {
                module.verbose('Changing text to disabled text', text.hover);
                module.update.text(text.disabled);
              }
              else if( module.is.active() ) {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.update.text(text.hover);
                }
                else if(text.deactivate) {
                  module.verbose('Changing text to deactivating text', text.deactivate);
                  module.update.text(text.deactivate);
                }
              }
              else {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.update.text(text.hover);
                }
                else if(text.activate){
                  module.verbose('Changing text to activating text', text.activate);
                  module.update.text(text.activate);
                }
              }
            }
          }

        },

        activate: function() {
          if( $.proxy(settings.activateTest, element)() ) {
            module.debug('Setting state to active');
            $module
              .addClass(className.active)
            ;
            module.update.text(text.active);
            $.proxy(settings.onActivate, element)();
          }
        },

        deactivate: function() {
          if($.proxy(settings.deactivateTest, element)() ) {
            module.debug('Setting state to inactive');
            $module
              .removeClass(className.active)
            ;
            module.update.text(text.inactive);
            $.proxy(settings.onDeactivate, element)();
          }
        },

        sync: function() {
          module.verbose('Syncing other buttons to current state');
          if( module.is.active() ) {
            $allModules
              .not($module)
                .state('activate');
          }
          else {
            $allModules
              .not($module)
                .state('deactivate')
            ;
          }
        },

        get: {
          text: function() {
            return (settings.selector.text)
              ? $module.find(settings.selector.text).text()
              : $module.html()
            ;
          },
          textFor: function(state) {
            return text[state] || false;
          }
        },

        flash: {
          text: function(text, duration, callback) {
            var
              previousText = module.get.text()
            ;
            module.debug('Flashing text message', text, duration);
            text     = text     || settings.text.flash;
            duration = duration || settings.flashDuration;
            callback = callback || function() {};
            module.update.text(text);
            setTimeout(function(){
              module.update.text(previousText);
              $.proxy(callback, element)();
            }, duration);
          }
        },

        reset: {
          // on mouseout sets text to previous value
          text: function() {
            var
              activeText   = text.active   || $module.data(metadata.storedText),
              inactiveText = text.inactive || $module.data(metadata.storedText)
            ;
            if( module.is.textEnabled() ) {
              if( module.is.active() && activeText) {
                module.verbose('Resetting active text', activeText);
                module.update.text(activeText);
              }
              else if(inactiveText) {
                module.verbose('Resetting inactive text', activeText);
                module.update.text(inactiveText);
              }
            }
          }
        },

        update: {
          text: function(text) {
            var
              currentText = module.get.text()
            ;
            if(text && text !== currentText) {
              module.debug('Updating text', text);
              if(settings.selector.text) {
                $module
                  .data(metadata.storedText, text)
                  .find(settings.selector.text)
                    .text(text)
                ;
              }
              else {
                $module
                  .data(metadata.storedText, text)
                  .html(text)
                ;
              }
            }
            else {
              module.debug('Text is already sane, ignoring update', text);
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.state.settings = {

  // module info
  name : 'State',

  // debug output
  debug      : false,

  // verbose debug output
  verbose    : true,

  // namespace for events
  namespace  : 'state',

  // debug data includes performance
  performance: true,

  // callback occurs on state change
  onActivate   : function() {},
  onDeactivate : function() {},
  onChange     : function() {},

  // state test functions
  activateTest   : function() { return true; },
  deactivateTest : function() { return true; },

  // whether to automatically map default states
  automatic     : true,

  // activate / deactivate changes all elements instantiated at same time
  sync          : false,

  // default flash text duration, used for temporarily changing text of an element
  flashDuration : 1000,

  // selector filter
  filter     : {
    text   : '.loading, .disabled',
    active : '.disabled'
  },

  context    : false,

  // error
  error: {
    method : 'The method you called is not defined.'
  },

  // metadata
  metadata: {
    promise    : 'promise',
    storedText : 'stored-text'
  },

  // change class on state
  className: {
    active   : 'active',
    disabled : 'disabled',
    error    : 'error',
    loading  : 'loading',
    success  : 'success',
    warning  : 'warning'
  },

  selector: {
    // selector for text node
    text: false
  },

  defaults : {
    input: {
      disabled : true,
      loading  : true,
      active   : true
    },
    button: {
      disabled : true,
      loading  : true,
      active   : true,
    },
    progress: {
      active   : true,
      success  : true,
      warning  : true,
      error    : true
    }
  },

  states     : {
    active   : true,
    disabled : true,
    error    : true,
    loading  : true,
    success  : true,
    warning  : true
  },

  text     : {
    disabled   : false,
    flash      : false,
    hover      : false,
    active     : false,
    inactive   : false,
    activate   : false,
    deactivate : false
  }

};



})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,n,a){e.fn.state=function(t){var i,o=e(this),s=o.selector||"",r=("ontouchstart"in n.documentElement,(new Date).getTime()),c=[],u=arguments[0],l="string"==typeof u,d=[].slice.call(arguments,1);return o.each(function(){var n,f=e.isPlainObject(t)?e.extend(!0,{},e.fn.state.settings,t):e.extend({},e.fn.state.settings),g=f.error,v=f.metadata,x=f.className,m=f.namespace,b=f.states,p=f.text,h="."+m,y=m+"-module",T=e(this),C=this,w=T.data(y);n={initialize:function(){n.verbose("Initializing module"),f.automatic&&n.add.defaults(),f.context&&""!==s?e(f.context).on(s,"mouseenter"+h,n.change.text).on(s,"mouseleave"+h,n.reset.text).on(s,"click"+h,n.toggle.state):T.on("mouseenter"+h,n.change.text).on("mouseleave"+h,n.reset.text).on("click"+h,n.toggle.state),n.instantiate()},instantiate:function(){n.verbose("Storing instance of module",n),w=n,T.data(y,n)},destroy:function(){n.verbose("Destroying previous module",w),T.off(h).removeData(y)},refresh:function(){n.verbose("Refreshing selector cache"),T=e(C)},add:{defaults:function(){var i=t&&e.isPlainObject(t.states)?t.states:{};e.each(f.defaults,function(t,o){n.is[t]!==a&&n.is[t]()&&(n.verbose("Adding default states",t,C),e.extend(f.states,o,i))})}},is:{active:function(){return T.hasClass(x.active)},loading:function(){return T.hasClass(x.loading)},inactive:function(){return!T.hasClass(x.active)},state:function(e){return x[e]===a?!1:T.hasClass(x[e])},enabled:function(){return!T.is(f.filter.active)},disabled:function(){return T.is(f.filter.active)},textEnabled:function(){return!T.is(f.filter.text)},button:function(){return T.is(".button:not(a, .submit)")},input:function(){return T.is("input")},progress:function(){return T.is(".ui.progress")}},allow:function(e){n.debug("Now allowing state",e),b[e]=!0},disallow:function(e){n.debug("No longer allowing",e),b[e]=!1},allows:function(e){return b[e]||!1},enable:function(){T.removeClass(x.disabled)},disable:function(){T.addClass(x.disabled)},setState:function(e){n.allows(e)&&T.addClass(x[e])},removeState:function(e){n.allows(e)&&T.removeClass(x[e])},toggle:{state:function(){var t;if(n.allows("active")&&n.is.enabled()){if(n.refresh(),e.fn.api!==a&&(t=T.api("get request")))return void n.listenTo(t);n.change.state()}}},listenTo:function(t){n.debug("API request detected, waiting for state signal",t),t?(p.loading&&n.update.text(p.loading),e.when(t).then(function(){"resolved"==t.state()?(n.debug("API request succeeded"),f.activateTest=function(){return!0},f.deactivateTest=function(){return!0}):(n.debug("API request failed"),f.activateTest=function(){return!1},f.deactivateTest=function(){return!1}),n.change.state()})):(f.activateTest=function(){return!1},f.deactivateTest=function(){return!1})},change:{state:function(){n.debug("Determining state change direction"),n.is.inactive()?n.activate():n.deactivate(),f.sync&&n.sync(),e.proxy(f.onChange,C)()},text:function(){n.is.textEnabled()&&(n.is.disabled()?(n.verbose("Changing text to disabled text",p.hover),n.update.text(p.disabled)):n.is.active()?p.hover?(n.verbose("Changing text to hover text",p.hover),n.update.text(p.hover)):p.deactivate&&(n.verbose("Changing text to deactivating text",p.deactivate),n.update.text(p.deactivate)):p.hover?(n.verbose("Changing text to hover text",p.hover),n.update.text(p.hover)):p.activate&&(n.verbose("Changing text to activating text",p.activate),n.update.text(p.activate)))}},activate:function(){e.proxy(f.activateTest,C)()&&(n.debug("Setting state to active"),T.addClass(x.active),n.update.text(p.active),e.proxy(f.onActivate,C)())},deactivate:function(){e.proxy(f.deactivateTest,C)()&&(n.debug("Setting state to inactive"),T.removeClass(x.active),n.update.text(p.inactive),e.proxy(f.onDeactivate,C)())},sync:function(){n.verbose("Syncing other buttons to current state"),o.not(T).state(n.is.active()?"activate":"deactivate")},get:{text:function(){return f.selector.text?T.find(f.selector.text).text():T.html()},textFor:function(e){return p[e]||!1}},flash:{text:function(t,a,i){var o=n.get.text();n.debug("Flashing text message",t,a),t=t||f.text.flash,a=a||f.flashDuration,i=i||function(){},n.update.text(t),setTimeout(function(){n.update.text(o),e.proxy(i,C)()},a)}},reset:{text:function(){var e=p.active||T.data(v.storedText),t=p.inactive||T.data(v.storedText);n.is.textEnabled()&&(n.is.active()&&e?(n.verbose("Resetting active text",e),n.update.text(e)):t&&(n.verbose("Resetting inactive text",e),n.update.text(t)))}},update:{text:function(e){var t=n.get.text();e&&e!==t?(n.debug("Updating text",e),f.selector.text?T.data(v.storedText,e).find(f.selector.text).text(e):T.data(v.storedText,e).html(e)):n.debug("Text is already sane, ignoring update",e)}},setting:function(t,i){if(n.debug("Changing setting",t,i),e.isPlainObject(t))e.extend(!0,f,t);else{if(i===a)return f[t];f[t]=i}},internal:function(t,i){if(e.isPlainObject(t))e.extend(!0,n,t);else{if(i===a)return n[t];n[t]=i}},debug:function(){f.debug&&(f.performance?n.performance.log(arguments):(n.debug=Function.prototype.bind.call(console.info,console,f.name+":"),n.debug.apply(console,arguments)))},verbose:function(){f.verbose&&f.debug&&(f.performance?n.performance.log(arguments):(n.verbose=Function.prototype.bind.call(console.info,console,f.name+":"),n.verbose.apply(console,arguments)))},error:function(){n.error=Function.prototype.bind.call(console.error,console,f.name+":"),n.error.apply(console,arguments)},performance:{log:function(e){var t,a,i;f.performance&&(t=(new Date).getTime(),i=r||t,a=t-i,r=t,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:C,"Execution Time":a})),clearTimeout(n.performance.timer),n.performance.timer=setTimeout(n.performance.display,100)},display:function(){var t=f.name+":",i=0;r=!1,clearTimeout(n.performance.timer),e.each(c,function(e,t){i+=t["Execution Time"]}),t+=" "+i+"ms",s&&(t+=" '"+s+"'"),(console.group!==a||console.table!==a)&&c.length>0&&(console.groupCollapsed(t),console.table?console.table(c):e.each(c,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(t,o,s){var r,c,u,l=w;return o=o||d,s=C||s,"string"==typeof t&&l!==a&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(i,o){var s=i!=r?o+t[i+1].charAt(0).toUpperCase()+t[i+1].slice(1):t;if(e.isPlainObject(l[s])&&i!=r)l=l[s];else{if(l[s]!==a)return c=l[s],!1;if(!e.isPlainObject(l[o])||i==r)return l[o]!==a?(c=l[o],!1):(n.error(g.method,t),!1);l=l[o]}})),e.isFunction(c)?u=c.apply(s,o):c!==a&&(u=c),e.isArray(i)?i.push(u):i!==a?i=[i,u]:u!==a&&(i=u),c}},l?(w===a&&n.initialize(),n.invoke(u)):(w!==a&&n.destroy(),n.initialize())}),i!==a?i:this},e.fn.state.settings={name:"State",debug:!1,verbose:!0,namespace:"state",performance:!0,onActivate:function(){},onDeactivate:function(){},onChange:function(){},activateTest:function(){return!0},deactivateTest:function(){return!0},automatic:!0,sync:!1,flashDuration:1e3,filter:{text:".loading, .disabled",active:".disabled"},context:!1,error:{method:"The method you called is not defined."},metadata:{promise:"promise",storedText:"stored-text"},className:{active:"active",disabled:"disabled",error:"error",loading:"loading",success:"success",warning:"warning"},selector:{text:!1},defaults:{input:{disabled:!0,loading:!0,active:!0},button:{disabled:!0,loading:!0,active:!0},progress:{active:!0,success:!0,warning:!0,error:!0}},states:{active:!0,disabled:!0,error:!0,loading:!0,success:!0,warning:!0},text:{disabled:!1,flash:!1,hover:!1,active:!1,inactive:!1,activate:!1,deactivate:!1}}}(jQuery,window,document);
 /*
 * # Semantic - Sticky
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.sticky = function(parameters) {
  var
    $allModules    = $(this),
    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings              = $.extend(true, {}, $.fn.sticky.settings, parameters),

        className             = settings.className,
        namespace             = settings.namespace,
        error                 = settings.error,

        eventNamespace        = '.' + namespace,
        moduleNamespace       = 'module-' + namespace,

        $module               = $(this),
        $window               = $(window),
        $container            = $module.offsetParent(),
        $scroll               = $(settings.scrollContext),
        $context,

        selector              = $module.selector || '',
        instance              = $module.data(moduleNamespace),

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); },

        element         = this,
        observer,
        module
      ;

      module      = {

        initialize: function() {
          if(settings.context) {
            $context = $(settings.context);
          }
          else {
            $context = $container;
          }
          if($context.size() === 0) {
            module.error(error.invalidContext, settings.context, $module);
            return;
          }
          module.verbose('Initializing sticky', settings, $container);
          module.save.positions();

          // error conditions
          if( module.is.hidden() ) {
            module.error(error.visible, $module);
          }
          if(module.cache.element.height > module.cache.context.height) {
            module.reset();
            module.error(error.elementSize, $module);
            return;
          }

          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          $scroll
            .on('scroll' + eventNamespace, module.event.scroll)
          ;

          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          module.reset();
          $window
            .off('resize' + eventNamespace, module.event.resize)
          ;
          $scroll
            .off('scroll' + eventNamespace, module.event.scroll)
          ;
          $module
            .removeData(moduleNamespace)
          ;
        },

        observeChanges: function() {
          var
            context = $context[0]
          ;
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              clearTimeout(module.timer);
              module.timer = setTimeout(function() {
                module.verbose('DOM tree modified, updating sticky menu');
                module.refresh();
              }, 200);
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            observer.observe(context, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        event: {
          resize: function() {
            requestAnimationFrame(function() {
              module.refresh();
              module.stick();
            });
          },
          scroll: function() {
            requestAnimationFrame(function() {
              module.stick();
              $.proxy(settings.onScroll, element)();
            });
          }
        },

        refresh: function(hardRefresh) {
          module.reset();
          if(hardRefresh) {
            $container = $module.offsetParent();
          }
          module.save.positions();
          module.stick();
          $.proxy(settings.onReposition, element)();
        },

        supports: {
          sticky: function() {
            var
              $element = $('<div/>'),
              element = $element.get()
            ;
            $element
              .addClass(className.supported)
            ;
            return($element.css('position').match('sticky'));
          }
        },

        save: {
          scroll: function(scroll) {
            module.lastScroll = scroll;
          },
          positions: function() {
            var
              window = {
                height: $window.height()
              },
              element = {
                margin: {
                  top    : parseInt($module.css('margin-top'), 10),
                  bottom : parseInt($module.css('margin-bottom'), 10),
                },
                offset : $module.offset(),
                width  : $module.outerWidth(),
                height : $module.outerHeight()
              },
              context = {
                offset: $context.offset(),
                height: $context.outerHeight()
              }
            ;
            module.cache = {
              fits : ( element.height < window.height ),
              window: {
                height: window.height
              },
              element: {
                margin : element.margin,
                top    : element.offset.top - element.margin.top,
                left   : element.offset.left,
                width  : element.width,
                height : element.height,
                bottom : element.offset.top + element.height
              },
              context: {
                top    : context.offset.top,
                height : context.height,
                bottom : context.offset.top + context.height
              }
            };
            module.set.containerSize();
            module.set.size();
            module.stick();
            module.debug('Caching element positions', module.cache);
          }
        },

        get: {
          direction: function(scroll) {
            var
              direction = 'down'
            ;
            scroll = scroll || $scroll.scrollTop();
            if(module.lastScroll !== undefined) {
              if(module.lastScroll < scroll) {
                direction = 'down';
              }
              else if(module.lastScroll > scroll) {
                direction = 'up';
              }
            }
            return direction;
          },
          scrollChange: function(scroll) {
            scroll = scroll || $scroll.scrollTop();
            return (module.lastScroll)
              ? (scroll - module.lastScroll)
              : 0
            ;
          },
          currentElementScroll: function() {
            return ( module.is.top() )
              ? Math.abs(parseInt($module.css('top'), 10))    || 0
              : Math.abs(parseInt($module.css('bottom'), 10)) || 0
            ;
          },
          elementScroll: function(scroll) {
            scroll = scroll || $scroll.scrollTop();
            var
              element        = module.cache.element,
              window         = module.cache.window,
              delta          = module.get.scrollChange(scroll),
              maxScroll      = (element.height - window.height + settings.offset),
              currentScroll  = module.get.currentElementScroll(),
              possibleScroll = (currentScroll + delta),
              elementScroll
            ;
            if(module.cache.fits || possibleScroll < 0) {
              elementScroll = 0;
            }
            else if (possibleScroll > maxScroll ) {
              elementScroll = maxScroll;
            }
            else {
              elementScroll = possibleScroll;
            }
            return elementScroll;
          }
        },

        remove: {
          offset: function() {
            $module.css('margin-top', '');
          }
        },

        set: {
          offset: function() {
            module.verbose('Setting offset on element', settings.offset);
            $module.css('margin-top', settings.offset);
          },
          containerSize: function() {
            var
              tagName = $container.get(0).tagName
            ;
            if(tagName === 'HTML' || tagName == 'body') {
              // this can trigger for too many reasons
              //module.error(error.container, tagName, $module);
              $container = $module.offsetParent();
            }
            else {
              module.debug('Settings container size', module.cache.context.height);
              $container.height(module.cache.context.height);
            }
          },
          scroll: function(scroll) {
            module.debug('Setting scroll on element', scroll);
            if( module.is.top() ) {
              $module
                .css('bottom', '')
                .css('top', -scroll)
              ;
            }
            if( module.is.bottom() ) {
              $module
                .css('top', '')
                .css('bottom', scroll)
              ;
            }
          },
          size: function() {
            if(module.cache.element.height !== 0 && module.cache.element.width !== 0) {
              $module
                .css({
                  width  : module.cache.element.width,
                  height : module.cache.element.height
                })
              ;
            }
          }
        },

        is: {
          top: function() {
            return $module.hasClass(className.top);
          },
          bottom: function() {
            return $module.hasClass(className.bottom);
          },
          initialPosition: function() {
            return (!module.is.fixed() && !module.is.bound());
          },
          hidden: function() {
            return (!$module.is(':visible'));
          },
          bound: function() {
            return $module.hasClass(className.bound);
          },
          fixed: function() {
            return $module.hasClass(className.fixed);
          }
        },

        stick: function() {
          var
            cache          = module.cache,
            fits           = cache.fits,
            element        = cache.element,
            window         = cache.window,
            context        = cache.context,
            offset         = (module.is.bottom() && settings.pushing)
              ? settings.bottomOffset
              : settings.offset,
            scroll         = {
              top    : $scroll.scrollTop() + offset,
              bottom : $scroll.scrollTop() + offset + window.height
            },
            direction      = module.get.direction(scroll.top),
            elementScroll  = module.get.elementScroll(scroll.top),

            // shorthand
            doesntFit      = !fits,
            elementVisible = (element.height !== 0)
          ;

          // save current scroll for next run
          module.save.scroll(scroll.top);

          if(elementVisible) {

            if( module.is.initialPosition() ) {
              if(scroll.top >= element.top) {
                module.debug('Element passed, fixing element to page');
                module.fixTop();
              }
            }
            else if( module.is.fixed() ) {

              // currently fixed top
              if( module.is.top() ) {
                if( scroll.top < element.top ) {
                  module.debug('Fixed element reached top of container');
                  module.setInitialPosition();
                }
                else if( (element.height + scroll.top - elementScroll) > context.bottom ) {
                  module.debug('Fixed element reached bottom of container');
                  module.bindBottom();
                }
                // scroll element if larger than screen
                else if(doesntFit) {
                  module.set.scroll(elementScroll);
                }
              }

              // currently fixed bottom
              else if(module.is.bottom() ) {

                // top edge
                if( (scroll.bottom - element.height) < element.top) {
                  module.debug('Bottom fixed rail has reached top of container');
                  module.setInitialPosition();
                }
                // bottom edge
                else if(scroll.bottom > context.bottom) {
                  module.debug('Bottom fixed rail has reached bottom of container');
                  module.bindBottom();
                }
                // scroll element if larger than screen
                else if(doesntFit) {
                  module.set.scroll(elementScroll);
                }

              }
            }
            else if( module.is.bottom() ) {
              if(settings.pushing) {
                if(module.is.bound() && scroll.bottom < context.bottom ) {
                  module.debug('Fixing bottom attached element to bottom of browser.');
                  module.fixBottom();
                }
              }
              else {
                if(module.is.bound() && (scroll.top < context.bottom - element.height) ) {
                  module.debug('Fixing bottom attached element to top of browser.');
                  module.fixTop();
                }
              }
            }
          }
        },

        bindTop: function() {
          module.debug('Binding element to top of parent container');
          module.remove.offset();
          $module
            .css('left' , '')
            .css('top' , '')
            .css('bottom' , '')
            .removeClass(className.fixed)
            .removeClass(className.bottom)
            .addClass(className.bound)
            .addClass(className.top)
          ;
          $.proxy(settings.onTop, element)();
          $.proxy(settings.onUnstick, element)();
        },
        bindBottom: function() {
          module.debug('Binding element to bottom of parent container');
          module.remove.offset();
          $module
            .css('left' , '')
            .css('top' , '')
            .css('bottom' , '')
            .removeClass(className.fixed)
            .removeClass(className.top)
            .addClass(className.bound)
            .addClass(className.bottom)
          ;
          $.proxy(settings.onBottom, element)();
          $.proxy(settings.onUnstick, element)();
        },

        setInitialPosition: function() {
          module.unfix();
          module.unbind();
        },


        fixTop: function() {
          module.debug('Fixing element to top of page');
          module.set.offset();
          $module
            .css('left', module.cache.element.left)
            .removeClass(className.bound)
            .removeClass(className.bottom)
            .addClass(className.fixed)
            .addClass(className.top)
          ;
          $.proxy(settings.onStick, element)();
        },

        fixBottom: function() {
          module.debug('Sticking element to bottom of page');
          module.set.offset();
          $module
            .css('left', module.cache.element.left)
            .removeClass(className.bound)
            .removeClass(className.top)
            .addClass(className.fixed)
            .addClass(className.bottom)
          ;
          $.proxy(settings.onStick, element)();
        },

        unbind: function() {
          module.debug('Removing absolute position on element');
          module.remove.offset();
          $module
            .removeClass(className.bound)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
        },

        unfix: function() {
          module.debug('Removing fixed position on element');
          module.remove.offset();
          $module
            .removeClass(className.fixed)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
          $.proxy(settings.onUnstick, this)();
        },

        reset: function() {
          module.debug('Reseting elements position');
          module.unbind();
          module.unfix();
          module.resetCSS();
        },

        resetCSS: function() {
          $module
            .css({
              top    : '',
              bottom : '',
              width  : '',
              height : ''
            })
          ;
          $container
            .css({
              height: ''
            })
          ;
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 0);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.sticky.settings = {

  name          : 'Sticky',
  namespace     : 'sticky',

  debug         : false,
  verbose       : false,
  performance   : false,

  pushing       : false,
  context       : false,
  scrollContext : window,
  offset        : 0,
  bottomOffset  : 0,

  onReposition  : function(){},
  onScroll      : function(){},
  onStick       : function(){},
  onUnstick     : function(){},
  onTop         : function(){},
  onBottom      : function(){},

  error         : {
    container      : 'Sticky element must be inside a relative container',
    visible        : 'Element is hidden, you must call refresh after element becomes visible',
    method         : 'The method you called is not defined.',
    invalidContext : 'Context specified does not exist',
    elementSize    : 'Sticky element is larger than its container, cannot create sticky.'
  },

  className : {
    bound     : 'bound',
    fixed     : 'fixed',
    supported : 'native',
    top       : 'top',
    bottom    : 'bottom'
  }

};

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,o,n){"use strict";e.fn.sticky=function(o){var i,s=e(this),r=s.selector||"",c=(new Date).getTime(),a=[],l=arguments[0],f="string"==typeof l,m=[].slice.call(arguments,1);return s.each(function(){var s,u,d,p=e.extend(!0,{},e.fn.sticky.settings,o),h=p.className,g=p.namespace,b=p.error,v="."+g,x="module-"+g,C=e(this),y=e(t),S=C.offsetParent(),k=e(p.scrollContext),T=(C.selector||"",C.data(x)),w=t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame||function(e){setTimeout(e,0)},z=this;d={initialize:function(){return s=p.context?e(p.context):S,0===s.size()?void d.error(b.invalidContext,p.context,C):(d.verbose("Initializing sticky",p,S),d.save.positions(),d.is.hidden()&&d.error(b.visible,C),d.cache.element.height>d.cache.context.height?(d.reset(),void d.error(b.elementSize,C)):(y.on("resize"+v,d.event.resize),k.on("scroll"+v,d.event.scroll),d.observeChanges(),void d.instantiate()))},instantiate:function(){d.verbose("Storing instance of module",d),T=d,C.data(x,d)},destroy:function(){d.verbose("Destroying previous module"),d.reset(),y.off("resize"+v,d.event.resize),k.off("scroll"+v,d.event.scroll),C.removeData(x)},observeChanges:function(){var e=s[0];"MutationObserver"in t&&(u=new MutationObserver(function(){clearTimeout(d.timer),d.timer=setTimeout(function(){d.verbose("DOM tree modified, updating sticky menu"),d.refresh()},200)}),u.observe(z,{childList:!0,subtree:!0}),u.observe(e,{childList:!0,subtree:!0}),d.debug("Setting up mutation observer",u))},event:{resize:function(){w(function(){d.refresh(),d.stick()})},scroll:function(){w(function(){d.stick(),e.proxy(p.onScroll,z)()})}},refresh:function(t){d.reset(),t&&(S=C.offsetParent()),d.save.positions(),d.stick(),e.proxy(p.onReposition,z)()},supports:{sticky:function(){{var t=e("<div/>");t.get()}return t.addClass(h.supported),t.css("position").match("sticky")}},save:{scroll:function(e){d.lastScroll=e},positions:function(){var e={height:y.height()},t={margin:{top:parseInt(C.css("margin-top"),10),bottom:parseInt(C.css("margin-bottom"),10)},offset:C.offset(),width:C.outerWidth(),height:C.outerHeight()},o={offset:s.offset(),height:s.outerHeight()};d.cache={fits:t.height<e.height,window:{height:e.height},element:{margin:t.margin,top:t.offset.top-t.margin.top,left:t.offset.left,width:t.width,height:t.height,bottom:t.offset.top+t.height},context:{top:o.offset.top,height:o.height,bottom:o.offset.top+o.height}},d.set.containerSize(),d.set.size(),d.stick(),d.debug("Caching element positions",d.cache)}},get:{direction:function(e){var t="down";return e=e||k.scrollTop(),d.lastScroll!==n&&(d.lastScroll<e?t="down":d.lastScroll>e&&(t="up")),t},scrollChange:function(e){return e=e||k.scrollTop(),d.lastScroll?e-d.lastScroll:0},currentElementScroll:function(){return d.is.top()?Math.abs(parseInt(C.css("top"),10))||0:Math.abs(parseInt(C.css("bottom"),10))||0},elementScroll:function(e){e=e||k.scrollTop();var t,o=d.cache.element,n=d.cache.window,i=d.get.scrollChange(e),s=o.height-n.height+p.offset,r=d.get.currentElementScroll(),c=r+i;return t=d.cache.fits||0>c?0:c>s?s:c}},remove:{offset:function(){C.css("margin-top","")}},set:{offset:function(){d.verbose("Setting offset on element",p.offset),C.css("margin-top",p.offset)},containerSize:function(){var e=S.get(0).tagName;"HTML"===e||"body"==e?S=C.offsetParent():(d.debug("Settings container size",d.cache.context.height),S.height(d.cache.context.height))},scroll:function(e){d.debug("Setting scroll on element",e),d.is.top()&&C.css("bottom","").css("top",-e),d.is.bottom()&&C.css("top","").css("bottom",e)},size:function(){0!==d.cache.element.height&&0!==d.cache.element.width&&C.css({width:d.cache.element.width,height:d.cache.element.height})}},is:{top:function(){return C.hasClass(h.top)},bottom:function(){return C.hasClass(h.bottom)},initialPosition:function(){return!d.is.fixed()&&!d.is.bound()},hidden:function(){return!C.is(":visible")},bound:function(){return C.hasClass(h.bound)},fixed:function(){return C.hasClass(h.fixed)}},stick:function(){var e=d.cache,t=e.fits,o=e.element,n=e.window,i=e.context,s=d.is.bottom()&&p.pushing?p.bottomOffset:p.offset,r={top:k.scrollTop()+s,bottom:k.scrollTop()+s+n.height},c=(d.get.direction(r.top),d.get.elementScroll(r.top)),a=!t,l=0!==o.height;d.save.scroll(r.top),l&&(d.is.initialPosition()?r.top>=o.top&&(d.debug("Element passed, fixing element to page"),d.fixTop()):d.is.fixed()?d.is.top()?r.top<o.top?(d.debug("Fixed element reached top of container"),d.setInitialPosition()):o.height+r.top-c>i.bottom?(d.debug("Fixed element reached bottom of container"),d.bindBottom()):a&&d.set.scroll(c):d.is.bottom()&&(r.bottom-o.height<o.top?(d.debug("Bottom fixed rail has reached top of container"),d.setInitialPosition()):r.bottom>i.bottom?(d.debug("Bottom fixed rail has reached bottom of container"),d.bindBottom()):a&&d.set.scroll(c)):d.is.bottom()&&(p.pushing?d.is.bound()&&r.bottom<i.bottom&&(d.debug("Fixing bottom attached element to bottom of browser."),d.fixBottom()):d.is.bound()&&r.top<i.bottom-o.height&&(d.debug("Fixing bottom attached element to top of browser."),d.fixTop())))},bindTop:function(){d.debug("Binding element to top of parent container"),d.remove.offset(),C.css("left","").css("top","").css("bottom","").removeClass(h.fixed).removeClass(h.bottom).addClass(h.bound).addClass(h.top),e.proxy(p.onTop,z)(),e.proxy(p.onUnstick,z)()},bindBottom:function(){d.debug("Binding element to bottom of parent container"),d.remove.offset(),C.css("left","").css("top","").css("bottom","").removeClass(h.fixed).removeClass(h.top).addClass(h.bound).addClass(h.bottom),e.proxy(p.onBottom,z)(),e.proxy(p.onUnstick,z)()},setInitialPosition:function(){d.unfix(),d.unbind()},fixTop:function(){d.debug("Fixing element to top of page"),d.set.offset(),C.css("left",d.cache.element.left).removeClass(h.bound).removeClass(h.bottom).addClass(h.fixed).addClass(h.top),e.proxy(p.onStick,z)()},fixBottom:function(){d.debug("Sticking element to bottom of page"),d.set.offset(),C.css("left",d.cache.element.left).removeClass(h.bound).removeClass(h.top).addClass(h.fixed).addClass(h.bottom),e.proxy(p.onStick,z)()},unbind:function(){d.debug("Removing absolute position on element"),d.remove.offset(),C.removeClass(h.bound).removeClass(h.top).removeClass(h.bottom)},unfix:function(){d.debug("Removing fixed position on element"),d.remove.offset(),C.removeClass(h.fixed).removeClass(h.top).removeClass(h.bottom),e.proxy(p.onUnstick,this)()},reset:function(){d.debug("Reseting elements position"),d.unbind(),d.unfix(),d.resetCSS()},resetCSS:function(){C.css({top:"",bottom:"",width:"",height:""}),S.css({height:""})},setting:function(t,o){if(e.isPlainObject(t))e.extend(!0,p,t);else{if(o===n)return p[t];p[t]=o}},internal:function(t,o){if(e.isPlainObject(t))e.extend(!0,d,t);else{if(o===n)return d[t];d[t]=o}},debug:function(){p.debug&&(p.performance?d.performance.log(arguments):(d.debug=Function.prototype.bind.call(console.info,console,p.name+":"),d.debug.apply(console,arguments)))},verbose:function(){p.verbose&&p.debug&&(p.performance?d.performance.log(arguments):(d.verbose=Function.prototype.bind.call(console.info,console,p.name+":"),d.verbose.apply(console,arguments)))},error:function(){d.error=Function.prototype.bind.call(console.error,console,p.name+":"),d.error.apply(console,arguments)},performance:{log:function(e){var t,o,n;p.performance&&(t=(new Date).getTime(),n=c||t,o=t-n,c=t,a.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:z,"Execution Time":o})),clearTimeout(d.performance.timer),d.performance.timer=setTimeout(d.performance.display,0)},display:function(){var t=p.name+":",o=0;c=!1,clearTimeout(d.performance.timer),e.each(a,function(e,t){o+=t["Execution Time"]}),t+=" "+o+"ms",r&&(t+=" '"+r+"'"),(console.group!==n||console.table!==n)&&a.length>0&&(console.groupCollapsed(t),console.table?console.table(a):e.each(a,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),a=[]}},invoke:function(t,o,s){var r,c,a,l=T;return o=o||m,s=z||s,"string"==typeof t&&l!==n&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(o,i){var s=o!=r?i+t[o+1].charAt(0).toUpperCase()+t[o+1].slice(1):t;if(e.isPlainObject(l[s])&&o!=r)l=l[s];else{if(l[s]!==n)return c=l[s],!1;if(!e.isPlainObject(l[i])||o==r)return l[i]!==n?(c=l[i],!1):!1;l=l[i]}})),e.isFunction(c)?a=c.apply(s,o):c!==n&&(a=c),e.isArray(i)?i.push(a):i!==n?i=[i,a]:a!==n&&(i=a),c}},f?(T===n&&d.initialize(),d.invoke(l)):(T!==n&&d.destroy(),d.initialize())}),i!==n?i:this},e.fn.sticky.settings={name:"Sticky",namespace:"sticky",debug:!1,verbose:!1,performance:!1,pushing:!1,context:!1,scrollContext:t,offset:0,bottomOffset:0,onReposition:function(){},onScroll:function(){},onStick:function(){},onUnstick:function(){},onTop:function(){},onBottom:function(){},error:{container:"Sticky element must be inside a relative container",visible:"Element is hidden, you must call refresh after element becomes visible",method:"The method you called is not defined.",invalidContext:"Context specified does not exist",elementSize:"Sticky element is larger than its container, cannot create sticky."},className:{bound:"bound",fixed:"fixed",supported:"native",top:"top",bottom:"bottom"}}}(jQuery,window,document);
 /*
 * # Semantic - Tab
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.tab = $.fn.tab = function(parameters) {

  var
    // use window context if none specified
    $allModules     = $.isFunction(this)
        ? $(window)
        : $(this),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.tab.settings, parameters)
      : $.extend({}, $.fn.tab.settings),

    moduleSelector  = $allModules.selector || '',
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    module,
    returnedValue
  ;


  $allModules
    .each(function() {
      var

        className          = settings.className,
        metadata           = settings.metadata,
        selector           = settings.selector,
        error              = settings.error,

        eventNamespace     = '.' + settings.namespace,
        moduleNamespace    = 'module-' + settings.namespace,

        $module            = $(this),

        cache              = {},
        firstLoad          = true,
        recursionDepth     = 0,

        $context,
        $tabs,
        activeTabPath,
        parameterArray,
        historyEvent,

        element         = this,
        instance        = $module.data(moduleNamespace)
      ;

      module = {

        initialize: function() {
          module.debug('Initializing tab menu item', $module);

          module.determineTabs();
          module.debug('Determining tabs', settings.context, $tabs);

          // set up automatic routing
          if(settings.auto) {
            module.verbose('Setting up automatic tab retrieval from server');
            settings.apiSettings = {
              url: settings.path + '/{$tab}'
            };
          }

          // attach events if navigation wasn't set to window
          if( !$.isWindow( element ) ) {
            module.debug('Attaching tab activation events to element', $module);
            $module
              .on('click' + eventNamespace, module.event.click)
            ;
          }
          module.instantiate();
        },

        determineTabs: function() {
          var
            $reference
          ;

          // determine tab context
          if(settings.context === 'parent') {
            if($module.closest(selector.ui).size() > 0) {
              $reference = $module.closest(selector.ui);
              module.verbose('Using closest UI element for determining parent', $reference);
            }
            else {
              $reference = $module;
            }
            $context = $reference.parent();
            module.verbose('Determined parent element for creating context', $context);
          }
          else if(settings.context) {
            $context = $(settings.context);
            module.verbose('Using selector for tab context', settings.context, $context);
          }
          else {
            $context = $('body');
          }

          // find tabs
          if(settings.childrenOnly) {
            $tabs = $context.children(selector.tabs);
            module.debug('Searching tab context children for tabs', $context, $tabs);
          }
          else {
            $tabs = $context.find(selector.tabs);
            module.debug('Searching tab context for tabs', $context, $tabs);
          }
        },

        initializeHistory: function() {
          if(settings.history) {
            module.debug('Initializing page state');
            if( $.address === undefined ) {
              module.error(error.state);
              return false;
            }
            else {
              if(settings.historyType == 'state') {
                module.debug('Using HTML5 to manage state');
                if(settings.path !== false) {
                  $.address
                    .history(true)
                    .state(settings.path)
                  ;
                }
                else {
                  module.error(error.path);
                  return false;
                }
              }
              $.address
                .bind('change', module.event.history.change)
              ;
            }
          }
        },

        instantiate: function () {
          module.verbose('Storing instance of module', module);
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.debug('Destroying tabs', $module);
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        event: {
          click: function(event) {
            var
              tabPath = $(this).data(metadata.tab)
            ;
            if(tabPath !== undefined) {
              if(settings.history) {
                module.verbose('Updating page state', event);
                $.address.value(tabPath);
              }
              else {
                module.verbose('Changing tab', event);
                module.changeTab(tabPath);
              }
              event.preventDefault();
            }
            else {
              module.debug('No tab specified');
            }
          },
          history: {
            change: function(event) {
              var
                tabPath   = event.pathNames.join('/') || module.get.initialPath(),
                pageTitle = settings.templates.determineTitle(tabPath) || false
              ;
              module.performance.display();
              module.debug('History change event', tabPath, event);
              historyEvent = event;
              if(tabPath !== undefined) {
                module.changeTab(tabPath);
              }
              if(pageTitle) {
                $.address.title(pageTitle);
              }
            }
          }
        },

        refresh: function() {
          if(activeTabPath) {
            module.debug('Refreshing tab', activeTabPath);
            module.changeTab(activeTabPath);
          }
        },

        cache: {

          read: function(cacheKey) {
            return (cacheKey !== undefined)
              ? cache[cacheKey]
              : false
            ;
          },
          add: function(cacheKey, content) {
            cacheKey = cacheKey || activeTabPath;
            module.debug('Adding cached content for', cacheKey);
            cache[cacheKey] = content;
          },
          remove: function(cacheKey) {
            cacheKey = cacheKey || activeTabPath;
            module.debug('Removing cached content for', cacheKey);
            delete cache[cacheKey];
          }
        },

        set: {
          state: function(state) {
            $.address.value(state);
          }
        },

        changeTab: function(tabPath) {
          var
            pushStateAvailable = (window.history && window.history.pushState),
            shouldIgnoreLoad   = (pushStateAvailable && settings.ignoreFirstLoad && firstLoad),
            remoteContent      = (settings.auto || $.isPlainObject(settings.apiSettings) ),
            // only get default path if not remote content
            pathArray = (remoteContent && !shouldIgnoreLoad)
              ? module.utilities.pathToArray(tabPath)
              : module.get.defaultPathArray(tabPath)
          ;
          tabPath = module.utilities.arrayToPath(pathArray);
          $.each(pathArray, function(index, tab) {
            var
              currentPathArray   = pathArray.slice(0, index + 1),
              currentPath        = module.utilities.arrayToPath(currentPathArray),

              isTab              = module.is.tab(currentPath),
              isLastIndex        = (index + 1 == pathArray.length),

              $tab               = module.get.tabElement(currentPath),
              $anchor,
              nextPathArray,
              nextPath,
              isLastTab
            ;
            module.verbose('Looking for tab', tab);
            if(isTab) {
              module.verbose('Tab was found', tab);

              // scope up
              activeTabPath = currentPath;
              parameterArray = module.utilities.filterArray(pathArray, currentPathArray);

              if(isLastIndex) {
                isLastTab = true;
              }
              else {
                nextPathArray = pathArray.slice(0, index + 2);
                nextPath      = module.utilities.arrayToPath(nextPathArray);
                isLastTab     = ( !module.is.tab(nextPath) );
                if(isLastTab) {
                  module.verbose('Tab parameters found', nextPathArray);
                }
              }
              if(isLastTab && remoteContent) {
                if(!shouldIgnoreLoad) {
                  module.activate.navigation(currentPath);
                  module.content.fetch(currentPath, tabPath);
                }
                else {
                  module.debug('Ignoring remote content on first tab load', currentPath);
                  firstLoad = false;
                  module.cache.add(tabPath, $tab.html());
                  module.activate.all(currentPath);
                  $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
                  $.proxy(settings.onTabLoad, $tab)(currentPath, parameterArray, historyEvent);
                }
                return false;
              }
              else {
                module.debug('Opened local tab', currentPath);
                module.activate.all(currentPath);
                if( !module.cache.read(currentPath) ) {
                  module.cache.add(currentPath, true);
                  module.debug('First time tab loaded calling tab init');
                  $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
                }
                $.proxy(settings.onTabLoad, $tab)(currentPath, parameterArray, historyEvent);
              }
            }
            else if(tabPath.search('/') == -1) {
              // look for in page anchor
              $anchor     = $('#' + tabPath + ', a[name="' + tabPath + '"]'),
              currentPath = $anchor.closest('[data-tab]').data('tab');
              $tab        = module.get.tabElement(currentPath);
              // if anchor exists use parent tab
              if($anchor && $anchor.size() > 0 && currentPath) {
                module.debug('No tab found, but deep anchor link present, opening parent tab');
                module.activate.all(currentPath);
                if( !module.cache.read(currentPath) ) {
                  module.cache.add(currentPath, true);
                  module.debug('First time tab loaded calling tab init');
                  $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
                }
                return false;
              }
            }
            else {
              module.error(error.missingTab, $module, $context, currentPath);
              return false;
            }
          });
        },

        content: {

          fetch: function(tabPath, fullTabPath) {
            var
              $tab             = module.get.tabElement(tabPath),
              apiSettings      = {
                dataType     : 'html',
                stateContext : $tab,
                onSuccess      : function(response) {
                  module.cache.add(fullTabPath, response);
                  module.content.update(tabPath, response);
                  if(tabPath == activeTabPath) {
                    module.debug('Content loaded', tabPath);
                    module.activate.tab(tabPath);
                  }
                  else {
                    module.debug('Content loaded in background', tabPath);
                  }
                  $.proxy(settings.onTabInit, $tab)(tabPath, parameterArray, historyEvent);
                  $.proxy(settings.onTabLoad, $tab)(tabPath, parameterArray, historyEvent);
                },
                urlData: { tab: fullTabPath }
              },
              request         = $tab.data(metadata.promise) || false,
              existingRequest = ( request && request.state() === 'pending' ),
              requestSettings,
              cachedContent
            ;

            fullTabPath   = fullTabPath || tabPath;
            cachedContent = module.cache.read(fullTabPath);

            if(settings.cache && cachedContent) {
              module.debug('Showing existing content', fullTabPath);
              module.content.update(tabPath, cachedContent);
              module.activate.tab(tabPath);
              $.proxy(settings.onTabLoad, $tab)(tabPath, parameterArray, historyEvent);
            }
            else if(existingRequest) {
              module.debug('Content is already loading', fullTabPath);
              $tab
                .addClass(className.loading)
              ;
            }
            else if($.api !== undefined) {
              requestSettings = $.extend(true, { headers: { 'X-Remote': true } }, settings.apiSettings, apiSettings);
              module.debug('Retrieving remote content', fullTabPath, requestSettings);
              $.api( requestSettings );
            }
            else {
              module.error(error.api);
            }
          },

          update: function(tabPath, html) {
            module.debug('Updating html for', tabPath);
            var
              $tab = module.get.tabElement(tabPath)
            ;
            $tab
              .html(html)
            ;
          }
        },

        activate: {
          all: function(tabPath) {
            module.activate.tab(tabPath);
            module.activate.navigation(tabPath);
          },
          tab: function(tabPath) {
            var
              $tab = module.get.tabElement(tabPath)
            ;
            module.verbose('Showing tab content for', $tab);
            $tab
              .addClass(className.active)
              .siblings($tabs)
                .removeClass(className.active + ' ' + className.loading)
            ;
          },
          navigation: function(tabPath) {
            var
              $navigation = module.get.navElement(tabPath)
            ;
            module.verbose('Activating tab navigation for', $navigation, tabPath);
            $navigation
              .addClass(className.active)
              .siblings($allModules)
                .removeClass(className.active + ' ' + className.loading)
            ;
          }
        },

        deactivate: {
          all: function() {
            module.deactivate.navigation();
            module.deactivate.tabs();
          },
          navigation: function() {
            $allModules
              .removeClass(className.active)
            ;
          },
          tabs: function() {
            $tabs
              .removeClass(className.active + ' ' + className.loading)
            ;
          }
        },

        is: {
          tab: function(tabName) {
            return (tabName !== undefined)
              ? ( module.get.tabElement(tabName).size() > 0 )
              : false
            ;
          }
        },

        get: {
          initialPath: function() {
            return $allModules.eq(0).data(metadata.tab) || $tabs.eq(0).data(metadata.tab);
          },
          path: function() {
            return $.address.value();
          },
          // adds default tabs to tab path
          defaultPathArray: function(tabPath) {
            return module.utilities.pathToArray( module.get.defaultPath(tabPath) );
          },
          defaultPath: function(tabPath) {
            var
              $defaultNav = $allModules.filter('[data-' + metadata.tab + '^="' + tabPath + '/"]').eq(0),
              defaultTab  = $defaultNav.data(metadata.tab) || false
            ;
            if( defaultTab ) {
              module.debug('Found default tab', defaultTab);
              if(recursionDepth < settings.maxDepth) {
                recursionDepth++;
                return module.get.defaultPath(defaultTab);
              }
              module.error(error.recursion);
            }
            else {
              module.debug('No default tabs found for', tabPath, $tabs);
            }
            recursionDepth = 0;
            return tabPath;
          },
          navElement: function(tabPath) {
            tabPath = tabPath || activeTabPath;
            return $allModules.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
          },
          tabElement: function(tabPath) {
            var
              $fullPathTab,
              $simplePathTab,
              tabPathArray,
              lastTab
            ;
            tabPath        = tabPath || activeTabPath;
            tabPathArray   = module.utilities.pathToArray(tabPath);
            lastTab        = module.utilities.last(tabPathArray);
            $fullPathTab   = $tabs.filter('[data-' + metadata.tab + '="' + lastTab + '"]');
            $simplePathTab = $tabs.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
            return ($fullPathTab.size() > 0)
              ? $fullPathTab
              : $simplePathTab
            ;
          },
          tab: function() {
            return activeTabPath;
          }
        },

        utilities: {
          filterArray: function(keepArray, removeArray) {
            return $.grep(keepArray, function(keepValue) {
              return ( $.inArray(keepValue, removeArray) == -1);
            });
          },
          last: function(array) {
            return $.isArray(array)
              ? array[ array.length - 1]
              : false
            ;
          },
          pathToArray: function(pathName) {
            if(pathName === undefined) {
              pathName = activeTabPath;
            }
            return typeof pathName == 'string'
              ? pathName.split('/')
              : [pathName]
            ;
          },
          arrayToPath: function(pathArray) {
            return $.isArray(pathArray)
              ? pathArray.join('/')
              : false
            ;
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  if(module && !methodInvoked) {
    module.initializeHistory();
  }
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;

};

// shortcut for tabbed content with no defined navigation
$.tab = function(settings) {
  $(window).tab(settings);
};

$.fn.tab.settings = {

  name         : 'Tab',
  namespace    : 'tab',

  debug        : false,
  verbose      : true,
  performance  : true,

  // uses pjax style endpoints fetching content from same url with remote-content headers
  auto         : false,
  history      : false,
  historyType  : 'hash',
  path         : false,

  context      : false,
  childrenOnly : false,

  // max depth a tab can be nested
  maxDepth        : 25,

  // dont load content on first load
  ignoreFirstLoad : false,

  // load tab content new every tab click
  alwaysRefresh   : false,

  // cache the content requests to pull locally
  cache           : true,

  // settings for api call
  apiSettings     : false,

  // only called first time a tab's content is loaded (when remote source)
  onTabInit    : function(tabPath, parameterArray, historyEvent) {},

  // called on every load
  onTabLoad    : function(tabPath, parameterArray, historyEvent) {},

  templates    : {
    determineTitle: function(tabArray) {}
  },

  error: {
    api        : 'You attempted to load content without API module',
    method     : 'The method you called is not defined',
    missingTab : 'Activated tab cannot be found for this context.',
    noContent  : 'The tab you specified is missing a content url.',
    path       : 'History enabled, but no path was specified',
    recursion  : 'Max recursive depth reached',
    state      : 'History requires Asual\'s Address library <https://github.com/asual/jquery-address>'
  },

  metadata : {
    tab    : 'tab',
    loaded : 'loaded',
    promise: 'promise'
  },

  className   : {
    loading : 'loading',
    active  : 'active'
  },

  selector    : {
    tabs : '.ui.tab',
    ui   : '.ui'
  }

};

})( jQuery, window , document );
 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,a,n){"use strict";e.tab=e.fn.tab=function(a){var i,o,r=e(e.isFunction(this)?t:this),s=e.isPlainObject(a)?e.extend(!0,{},e.fn.tab.settings,a):e.extend({},e.fn.tab.settings),c=r.selector||"",u=(new Date).getTime(),l=[],d=arguments[0],b="string"==typeof d,g=[].slice.call(arguments,1);return r.each(function(){var a,f,p,h,m,v=s.className,y=s.metadata,T=s.selector,x=s.error,A="."+s.namespace,P="module-"+s.namespace,C=e(this),E={},S=!0,w=0,z=this,j=C.data(P);i={initialize:function(){i.debug("Initializing tab menu item",C),i.determineTabs(),i.debug("Determining tabs",s.context,f),s.auto&&(i.verbose("Setting up automatic tab retrieval from server"),s.apiSettings={url:s.path+"/{$tab}"}),e.isWindow(z)||(i.debug("Attaching tab activation events to element",C),C.on("click"+A,i.event.click)),i.instantiate()},determineTabs:function(){var t;"parent"===s.context?(C.closest(T.ui).size()>0?(t=C.closest(T.ui),i.verbose("Using closest UI element for determining parent",t)):t=C,a=t.parent(),i.verbose("Determined parent element for creating context",a)):s.context?(a=e(s.context),i.verbose("Using selector for tab context",s.context,a)):a=e("body"),s.childrenOnly?(f=a.children(T.tabs),i.debug("Searching tab context children for tabs",a,f)):(f=a.find(T.tabs),i.debug("Searching tab context for tabs",a,f))},initializeHistory:function(){if(s.history){if(i.debug("Initializing page state"),e.address===n)return i.error(x.state),!1;if("state"==s.historyType){if(i.debug("Using HTML5 to manage state"),s.path===!1)return i.error(x.path),!1;e.address.history(!0).state(s.path)}e.address.bind("change",i.event.history.change)}},instantiate:function(){i.verbose("Storing instance of module",i),C.data(P,i)},destroy:function(){i.debug("Destroying tabs",C),C.removeData(P).off(A)},event:{click:function(t){var a=e(this).data(y.tab);a!==n?(s.history?(i.verbose("Updating page state",t),e.address.value(a)):(i.verbose("Changing tab",t),i.changeTab(a)),t.preventDefault()):i.debug("No tab specified")},history:{change:function(t){var a=t.pathNames.join("/")||i.get.initialPath(),o=s.templates.determineTitle(a)||!1;i.performance.display(),i.debug("History change event",a,t),m=t,a!==n&&i.changeTab(a),o&&e.address.title(o)}}},refresh:function(){p&&(i.debug("Refreshing tab",p),i.changeTab(p))},cache:{read:function(e){return e!==n?E[e]:!1},add:function(e,t){e=e||p,i.debug("Adding cached content for",e),E[e]=t},remove:function(e){e=e||p,i.debug("Removing cached content for",e),delete E[e]}},set:{state:function(t){e.address.value(t)}},changeTab:function(n){var o=t.history&&t.history.pushState,r=o&&s.ignoreFirstLoad&&S,c=s.auto||e.isPlainObject(s.apiSettings),u=c&&!r?i.utilities.pathToArray(n):i.get.defaultPathArray(n);n=i.utilities.arrayToPath(u),e.each(u,function(t,o){var l,d,b,g,f=u.slice(0,t+1),v=i.utilities.arrayToPath(f),y=i.is.tab(v),T=t+1==u.length,A=i.get.tabElement(v);if(i.verbose("Looking for tab",o),y){if(i.verbose("Tab was found",o),p=v,h=i.utilities.filterArray(u,f),T?g=!0:(d=u.slice(0,t+2),b=i.utilities.arrayToPath(d),g=!i.is.tab(b),g&&i.verbose("Tab parameters found",d)),g&&c)return r?(i.debug("Ignoring remote content on first tab load",v),S=!1,i.cache.add(n,A.html()),i.activate.all(v),e.proxy(s.onTabInit,A)(v,h,m),e.proxy(s.onTabLoad,A)(v,h,m)):(i.activate.navigation(v),i.content.fetch(v,n)),!1;i.debug("Opened local tab",v),i.activate.all(v),i.cache.read(v)||(i.cache.add(v,!0),i.debug("First time tab loaded calling tab init"),e.proxy(s.onTabInit,A)(v,h,m)),e.proxy(s.onTabLoad,A)(v,h,m)}else{if(-1!=n.search("/"))return i.error(x.missingTab,C,a,v),!1;if(l=e("#"+n+', a[name="'+n+'"]'),v=l.closest("[data-tab]").data("tab"),A=i.get.tabElement(v),l&&l.size()>0&&v)return i.debug("No tab found, but deep anchor link present, opening parent tab"),i.activate.all(v),i.cache.read(v)||(i.cache.add(v,!0),i.debug("First time tab loaded calling tab init"),e.proxy(s.onTabInit,A)(v,h,m)),!1}})},content:{fetch:function(t,a){var o,r,c=i.get.tabElement(t),u={dataType:"html",stateContext:c,onSuccess:function(n){i.cache.add(a,n),i.content.update(t,n),t==p?(i.debug("Content loaded",t),i.activate.tab(t)):i.debug("Content loaded in background",t),e.proxy(s.onTabInit,c)(t,h,m),e.proxy(s.onTabLoad,c)(t,h,m)},urlData:{tab:a}},l=c.data(y.promise)||!1,d=l&&"pending"===l.state();a=a||t,r=i.cache.read(a),s.cache&&r?(i.debug("Showing existing content",a),i.content.update(t,r),i.activate.tab(t),e.proxy(s.onTabLoad,c)(t,h,m)):d?(i.debug("Content is already loading",a),c.addClass(v.loading)):e.api!==n?(o=e.extend(!0,{headers:{"X-Remote":!0}},s.apiSettings,u),i.debug("Retrieving remote content",a,o),e.api(o)):i.error(x.api)},update:function(e,t){i.debug("Updating html for",e);var a=i.get.tabElement(e);a.html(t)}},activate:{all:function(e){i.activate.tab(e),i.activate.navigation(e)},tab:function(e){var t=i.get.tabElement(e);i.verbose("Showing tab content for",t),t.addClass(v.active).siblings(f).removeClass(v.active+" "+v.loading)},navigation:function(e){var t=i.get.navElement(e);i.verbose("Activating tab navigation for",t,e),t.addClass(v.active).siblings(r).removeClass(v.active+" "+v.loading)}},deactivate:{all:function(){i.deactivate.navigation(),i.deactivate.tabs()},navigation:function(){r.removeClass(v.active)},tabs:function(){f.removeClass(v.active+" "+v.loading)}},is:{tab:function(e){return e!==n?i.get.tabElement(e).size()>0:!1}},get:{initialPath:function(){return r.eq(0).data(y.tab)||f.eq(0).data(y.tab)},path:function(){return e.address.value()},defaultPathArray:function(e){return i.utilities.pathToArray(i.get.defaultPath(e))},defaultPath:function(e){var t=r.filter("[data-"+y.tab+'^="'+e+'/"]').eq(0),a=t.data(y.tab)||!1;if(a){if(i.debug("Found default tab",a),w<s.maxDepth)return w++,i.get.defaultPath(a);i.error(x.recursion)}else i.debug("No default tabs found for",e,f);return w=0,e},navElement:function(e){return e=e||p,r.filter("[data-"+y.tab+'="'+e+'"]')},tabElement:function(e){var t,a,n,o;return e=e||p,n=i.utilities.pathToArray(e),o=i.utilities.last(n),t=f.filter("[data-"+y.tab+'="'+o+'"]'),a=f.filter("[data-"+y.tab+'="'+e+'"]'),t.size()>0?t:a},tab:function(){return p}},utilities:{filterArray:function(t,a){return e.grep(t,function(t){return-1==e.inArray(t,a)})},last:function(t){return e.isArray(t)?t[t.length-1]:!1},pathToArray:function(e){return e===n&&(e=p),"string"==typeof e?e.split("/"):[e]},arrayToPath:function(t){return e.isArray(t)?t.join("/"):!1}},setting:function(t,a){if(i.debug("Changing setting",t,a),e.isPlainObject(t))e.extend(!0,s,t);else{if(a===n)return s[t];s[t]=a}},internal:function(t,a){if(e.isPlainObject(t))e.extend(!0,i,t);else{if(a===n)return i[t];i[t]=a}},debug:function(){s.debug&&(s.performance?i.performance.log(arguments):(i.debug=Function.prototype.bind.call(console.info,console,s.name+":"),i.debug.apply(console,arguments)))},verbose:function(){s.verbose&&s.debug&&(s.performance?i.performance.log(arguments):(i.verbose=Function.prototype.bind.call(console.info,console,s.name+":"),i.verbose.apply(console,arguments)))},error:function(){i.error=Function.prototype.bind.call(console.error,console,s.name+":"),i.error.apply(console,arguments)},performance:{log:function(e){var t,a,n;s.performance&&(t=(new Date).getTime(),n=u||t,a=t-n,u=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:z,"Execution Time":a})),clearTimeout(i.performance.timer),i.performance.timer=setTimeout(i.performance.display,100)},display:function(){var t=s.name+":",a=0;u=!1,clearTimeout(i.performance.timer),e.each(l,function(e,t){a+=t["Execution Time"]}),t+=" "+a+"ms",c&&(t+=" '"+c+"'"),(console.group!==n||console.table!==n)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,a,r){var s,c,u,l=j;return a=a||g,r=z||r,"string"==typeof t&&l!==n&&(t=t.split(/[\. ]/),s=t.length-1,e.each(t,function(a,o){var r=a!=s?o+t[a+1].charAt(0).toUpperCase()+t[a+1].slice(1):t;if(e.isPlainObject(l[r])&&a!=s)l=l[r];else{if(l[r]!==n)return c=l[r],!1;if(!e.isPlainObject(l[o])||a==s)return l[o]!==n?(c=l[o],!1):(i.error(x.method,t),!1);l=l[o]}})),e.isFunction(c)?u=c.apply(r,a):c!==n&&(u=c),e.isArray(o)?o.push(u):o!==n?o=[o,u]:u!==n&&(o=u),c}},b?(j===n&&i.initialize(),i.invoke(d)):(j!==n&&i.destroy(),i.initialize())}),i&&!b&&i.initializeHistory(),o!==n?o:this},e.tab=function(a){e(t).tab(a)},e.fn.tab.settings={name:"Tab",namespace:"tab",debug:!1,verbose:!0,performance:!0,auto:!1,history:!1,historyType:"hash",path:!1,context:!1,childrenOnly:!1,maxDepth:25,ignoreFirstLoad:!1,alwaysRefresh:!1,cache:!0,apiSettings:!1,onTabInit:function(){},onTabLoad:function(){},templates:{determineTitle:function(){}},error:{api:"You attempted to load content without API module",method:"The method you called is not defined",missingTab:"Activated tab cannot be found for this context.",noContent:"The tab you specified is missing a content url.",path:"History enabled, but no path was specified",recursion:"Max recursive depth reached",state:"History requires Asual's Address library <https://github.com/asual/jquery-address>"},metadata:{tab:"tab",loaded:"loaded",promise:"promise"},className:{loading:"loading",active:"active"},selector:{tabs:".ui.tab",ui:".ui"}}}(jQuery,window,document);
/*
 * # Semantic - Transition
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.transition = function() {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    moduleArguments = arguments,
    query           = moduleArguments[0],
    queryArguments  = [].slice.call(arguments, 1),
    methodInvoked   = (typeof query === 'string'),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        $module  = $(this),
        element  = this,

        // set at run time
        settings,
        instance,

        error,
        className,
        metadata,
        animationStart,
        animationEnd,
        animationName,

        namespace,
        moduleNamespace,
        eventNamespace,
        module
      ;

      module = {

        initialize: function() {

          // get full settings
          moduleNamespace = 'module-' + namespace;
          settings        = module.get.settings.apply(element, moduleArguments);
          className       = settings.className;
          metadata        = settings.metadata;

          animationStart  = module.get.animationStartEvent();
          animationEnd    = module.get.animationEndEvent();
          animationName   = module.get.animationName();
          error           = settings.error;
          namespace       = settings.namespace;
          eventNamespace  = '.' + settings.namespace;
          instance        = $module.data(moduleNamespace) || module;

          if(methodInvoked) {
            methodInvoked = module.invoke(query);
          }
          // no internal method was found matching query or query not made
          if(methodInvoked === false) {
            module.verbose('Converted arguments into settings object', settings);
            module.animate();
            module.instantiate();
          }
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing display type on next animation');
          delete module.displayType;
        },

        forceRepaint: function() {
          module.verbose('Forcing element repaint');
          var
            $parentElement = $module.parent(),
            $nextElement = $module.next()
          ;
          if($nextElement.size() === 0) {
            $module.detach().appendTo($parentElement);
          }
          else {
            $module.detach().insertBefore($nextElement);
          }
        },

        repaint: function() {
          module.verbose('Repainting element');
          var
            fakeAssignment = element.offsetWidth
          ;
        },

        animate: function(overrideSettings) {
          settings = overrideSettings || settings;
          if(!module.is.supported()) {
            module.error(error.support);
            return false;
          }
          module.debug('Preparing animation', settings.animation);
          if(module.is.animating()) {
            if(settings.queue) {
              if(!settings.allowRepeats && module.has.direction() && module.is.occuring() && module.queuing !== true) {
                module.error(error.repeated, settings.animation, $module);
              }
              else {
                module.queue(settings.animation);
              }
              return false;
            }
            else {

            }
          }
          if( module.can.animate() ) {
            module.set.animating(settings.animation);
          }
          else {
            module.error(error.noAnimation, settings.animation, element);
          }
        },

        reset: function() {
          module.debug('Resetting animation to beginning conditions');
          module.remove.animationEndCallback();
          module.restore.conditions();
          module.remove.animating();
        },

        queue: function(animation) {
          module.debug('Queueing animation of', animation);
          module.queuing = true;
          $module
            .one(animationEnd + eventNamespace, function() {
              module.queuing = false;
              module.repaint();
              module.animate.apply(this, settings);
            })
          ;
        },

        complete: function () {
          module.verbose('CSS animation complete', settings.animation);
          module.remove.animationEndCallback();
          module.remove.failSafe();
          if(!module.is.looping()) {
            if( module.is.outward() ) {
              module.verbose('Animation is outward, hiding element');
              module.restore.conditions();
              module.hide();
              $.proxy(settings.onHide, this)();
            }
            else if( module.is.inward() ) {
              module.verbose('Animation is outward, showing element');
              module.restore.conditions();
              module.show();
              module.set.display();
              $.proxy(settings.onShow, this)();
            }
            else {
              module.restore.conditions();
            }
            module.remove.animation();
            module.remove.animating();
          }
          $.proxy(settings.onComplete, this)();
        },

        has: {
          direction: function(animation) {
            animation = animation || settings.animation;
            if( animation.search(className.inward) !== -1 || animation.search(className.outward) !== -1) {
              module.debug('Direction already set in animation');
              return true;
            }
            return false;
          },
          inlineDisplay: function() {
            var
              style = $module.attr('style') || ''
            ;
            return $.isArray(style.match(/display.*?;/, ''));
          }
        },

        set: {
          animating: function(animation) {
            animation = animation || settings.animation;
            if(!module.is.animating()) {
              module.save.conditions();
            }
            module.remove.direction();
            module.remove.animationEndCallback();
            if(module.can.transition() && !module.has.direction()) {
              module.set.direction();
            }
            module.remove.hidden();
            module.set.display();
            $module
              .addClass(className.animating)
              .addClass(className.transition)
              .addClass(animation)
              .one(animationEnd + '.complete' + eventNamespace, module.complete)
            ;
            if(settings.useFailSafe) {
              module.add.failSafe();
            }
            module.set.duration(settings.duration);
            $.proxy(settings.onStart, this)();
            module.debug('Starting tween', animation, $module.attr('class'));
          },
          duration: function(animationName, duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number')
              ? duration + 'ms'
              : duration
            ;
            module.verbose('Setting animation duration', duration);
            $module
              .css({
                '-webkit-animation-duration': duration,
                '-moz-animation-duration': duration,
                '-ms-animation-duration': duration,
                '-o-animation-duration': duration,
                'animation-duration':  duration
              })
            ;
          },
          display: function() {
            var
              style              = module.get.style(),
              displayType        = module.get.displayType(),
              overrideStyle      = style + 'display: ' + displayType + ' !important;'
            ;
            $module.css('display', '');
            module.refresh();
            if( $module.css('display') !== displayType ) {
              module.verbose('Setting inline visibility to', displayType);
              $module
                .attr('style', overrideStyle)
              ;
            }
          },
          direction: function() {
            if($module.is(':visible') && !module.is.hidden()) {
              module.debug('Automatically determining the direction of animation', 'Outward');
              $module
                .removeClass(className.inward)
                .addClass(className.outward)
              ;
            }
            else {
              module.debug('Automatically determining the direction of animation', 'Inward');
              $module
                .removeClass(className.outward)
                .addClass(className.inward)
              ;
            }
          },
          looping: function() {
            module.debug('Transition set to loop');
            $module
              .addClass(className.looping)
            ;
          },
          hidden: function() {
            if(!module.is.hidden()) {
              $module
                .addClass(className.transition)
                .addClass(className.hidden)
              ;
              if($module.css('display') !== 'none') {
                module.verbose('Overriding default display to hide element');
                $module
                  .css('display', 'none')
                ;
              }
            }
          },
          visible: function() {
            $module
              .addClass(className.transition)
              .addClass(className.visible)
            ;
          }
        },

        save: {
          displayType: function(displayType) {
            $module.data(metadata.displayType, displayType);
          },
          transitionExists: function(animation, exists) {
            $.fn.transition.exists[animation] = exists;
            module.verbose('Saving existence of transition', animation, exists);
          },
          conditions: function() {
            var
              clasName = $module.attr('class') || false,
              style = $module.attr('style') || ''
            ;
            $module.removeClass(settings.animation);
            module.remove.direction();
            module.cache = {
              className : $module.attr('class'),
              style     : module.get.style()
            };
            module.verbose('Saving original attributes', module.cache);
          }
        },

        restore: {
          conditions: function() {
            if(module.cache === undefined) {
              return false;
            }
            if(module.cache.className) {
              $module.attr('class', module.cache.className);
            }
            else {
              $module.removeAttr('class');
            }
            if(module.cache.style) {
              module.verbose('Restoring original style attribute', module.cache.style);
              $module.attr('style', module.cache.style);
            }
            if(module.is.looping()) {
              module.remove.looping();
            }
            module.verbose('Restoring original attributes', module.cache);
          }
        },

        add: {
          failSafe: function() {
            var
              duration = module.get.duration()
            ;
            module.timer = setTimeout(module.complete, duration + 100);
            module.verbose('Adding fail safe timer', module.timer);
          }
        },

        remove: {
          animating: function() {
            $module.removeClass(className.animating);
          },
          animation: function() {
            $module
              .css({
                '-webkit-animation' : '',
                '-moz-animation'    : '',
                '-ms-animation'     : '',
                '-o-animation'      : '',
                'animation'         : ''
              })
            ;
          },
          animationEndCallback: function() {
            $module.off('.complete');
          },
          display: function() {
            $module.css('display', '');
          },
          direction: function() {
            $module
              .removeClass(className.inward)
              .removeClass(className.outward)
            ;
          },
          failSafe: function() {
            module.verbose('Removing fail safe timer', module.timer);
            if(module.timer) {
              clearTimeout(module.timer);
            }
          },
          hidden: function() {
            $module.removeClass(className.hidden);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          looping: function() {
            module.debug('Transitions are no longer looping');
            $module
              .removeClass(className.looping)
            ;
            module.forceRepaint();
          },
          transition: function() {
            $module
              .removeClass(className.visible)
              .removeClass(className.hidden)
            ;
          }
        },
        get: {
          settings: function(animation, duration, onComplete) {
            // single settings object
            if(typeof animation == 'object') {
              return $.extend(true, {}, $.fn.transition.settings, animation);
            }
            // all arguments provided
            else if(typeof onComplete == 'function') {
              return $.extend({}, $.fn.transition.settings, {
                animation  : animation,
                onComplete : onComplete,
                duration   : duration
              });
            }
            // only duration provided
            else if(typeof duration == 'string' || typeof duration == 'number') {
              return $.extend({}, $.fn.transition.settings, {
                animation : animation,
                duration  : duration
              });
            }
            // duration is actually settings object
            else if(typeof duration == 'object') {
              return $.extend({}, $.fn.transition.settings, duration, {
                animation : animation
              });
            }
            // duration is actually callback
            else if(typeof duration == 'function') {
              return $.extend({}, $.fn.transition.settings, {
                animation  : animation,
                onComplete : duration
              });
            }
            // only animation provided
            else {
              return $.extend({}, $.fn.transition.settings, {
                animation : animation
              });
            }
            return $.fn.transition.settings;
          },
          duration: function(duration) {
            duration = duration || settings.duration;
            return (typeof settings.duration === 'string')
              ? (duration.indexOf('ms') > -1)
                ? parseFloat(duration)
                : parseFloat(duration) * 1000
              : duration
            ;
          },
          displayType: function() {
            if(settings.displayType) {
              return settings.displayType;
            }
            if($module.data(metadata.displayType) === undefined) {
              // create fake element to determine display state
              module.can.transition(true);
            }
            return $module.data(metadata.displayType);
          },
          style: function() {
            var
              style = $module.attr('style') || ''
            ;
            return style.replace(/display.*?;/, '');
          },
          transitionExists: function(animation) {
            return $.fn.transition.exists[animation];
          },
          animationName: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationName',
                'OAnimation'      :'oAnimationName',
                'MozAnimation'    :'mozAnimationName',
                'WebkitAnimation' :'webkitAnimationName'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          },
          animationStartEvent: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationstart',
                'OAnimation'      :'oAnimationStart',
                'MozAnimation'    :'mozAnimationStart',
                'WebkitAnimation' :'webkitAnimationStart'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          },
          animationEndEvent: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationend',
                'OAnimation'      :'oAnimationEnd',
                'MozAnimation'    :'mozAnimationEnd',
                'WebkitAnimation' :'webkitAnimationEnd'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          }

        },

        can: {
          transition: function(forced) {
            var
              elementClass      = $module.attr('class'),
              tagName           = $module.prop('tagName'),
              animation         = settings.animation,
              transitionExists  = module.get.transitionExists(animation),
              $clone,
              currentAnimation,
              inAnimation,
              directionExists,
              displayType
            ;
            if( transitionExists === undefined || forced) {
              module.verbose('Determining whether animation exists');
              $clone = $('<' + tagName + ' />').addClass( elementClass ).insertAfter($module);
              currentAnimation = $clone
                .addClass(animation)
                .removeClass(className.inward)
                .removeClass(className.outward)
                .addClass(className.animating)
                .addClass(className.transition)
                .css(animationName)
              ;
              inAnimation = $clone
                .addClass(className.inward)
                .css(animationName)
              ;
              displayType = $clone
                .attr('class', elementClass)
                .removeAttr('style')
                .removeClass(className.hidden)
                .removeClass(className.visible)
                .show()
                .css('display')
              ;
              module.verbose('Determining final display state', displayType);
              $clone.remove();
              if(currentAnimation != inAnimation) {
                module.debug('Direction exists for animation', animation);
                directionExists = true;
              }
              else if(currentAnimation == 'none' || !currentAnimation) {
                module.debug('No animation defined in css', animation);
                return;
              }
              else {
                module.debug('Static animation found', animation, displayType);
                directionExists = false;
              }
              module.save.displayType(displayType);
              module.save.transitionExists(animation, directionExists);
            }
            return (transitionExists !== undefined)
              ? transitionExists
              : directionExists
            ;
          },
          animate: function() {
            // can transition does not return a value if animation does not exist
            return (module.can.transition() !== undefined);
          }
        },

        is: {
          animating: function() {
            return $module.hasClass(className.animating);
          },
          inward: function() {
            return $module.hasClass(className.inward);
          },
          outward: function() {
            return $module.hasClass(className.outward);
          },
          looping: function() {
            return $module.hasClass(className.looping);
          },
          occuring: function(animation) {
            animation = animation || settings.animation;
            animation = animation.replace(' ', '.');
            return ( $module.filter(animation).size() > 0 );
          },
          visible: function() {
            return $module.is(':visible');
          },
          hidden: function() {
            return $module.css('visibility') === 'hidden';
          },
          supported: function() {
            return(animationName !== false && animationEnd !== false);
          }
        },

        hide: function() {
          module.verbose('Hiding element');
          if( module.is.animating() ) {
            module.reset();
          }
          module.remove.display();
          module.remove.visible();
          module.set.hidden();
          module.repaint();
        },

        show: function(display) {
          module.verbose('Showing element', display);
          module.remove.hidden();
          module.set.visible();
          module.repaint();
        },

        start: function() {
          module.verbose('Starting animation');
          $module.removeClass(className.disabled);
        },

        stop: function() {
          module.debug('Stopping animation');
          $module.addClass(className.disabled);
        },

        toggle: function() {
          module.debug('Toggling play status');
          $module.toggleClass(className.disabled);
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 600);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        // modified for transition to return invoke success
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }

          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return (found !== undefined)
            ? found
            : false
          ;
        }
      };
      module.initialize();
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

// Records if CSS transition is available
$.fn.transition.exists = {};

$.fn.transition.settings = {

  // module info
  name         : 'Transition',

  // debug content outputted to console
  debug        : false,

  // verbose debug output
  verbose      : true,

  // performance data output
  performance  : true,

  // event namespace
  namespace    : 'transition',

  // animation complete event
  onStart      : function() {},
  onComplete   : function() {},
  onShow       : function() {},
  onHide       : function() {},

  // whether timeout should be used to ensure callback fires in cases animationend does not
  useFailSafe  : false,

  // whether EXACT animation can occur twice in a row
  allowRepeats : false,

  // Override final display type on visible
  displayType  : false,

  // animation duration
  animation    : 'fade',
  duration     : '500ms',

  // new animations will occur after previous ones
  queue       : true,

  metadata : {
    displayType: 'display'
  },

  className   : {
    animating  : 'animating',
    disabled   : 'disabled',
    hidden     : 'hidden',
    inward     : 'in',
    loading    : 'loading',
    looping    : 'looping',
    outward    : 'out',
    transition : 'transition',
    visible    : 'visible'
  },

  // possible errors
  error: {
    noAnimation : 'There is no css animation matching the one you specified.',
    repeated    : 'That animation is already occurring, cancelling repeated animation',
    method      : 'The method you called is not defined',
    support     : 'This browser does not support CSS animations'
  }

};


})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(n,i,e,t){"use strict";n.fn.transition=function(){{var a,o=n(this),s=o.selector||"",r=(new Date).getTime(),d=[],l=arguments,m=l[0],c=[].slice.call(arguments,1),u="string"==typeof m;i.requestAnimationFrame||i.mozRequestAnimationFrame||i.webkitRequestAnimationFrame||i.msRequestAnimationFrame||function(n){setTimeout(n,0)}}return o.each(function(){var i,f,p,g,v,b,y,h,C,w,A,T,S=n(this),x=this;T={initialize:function(){w="module-"+C,i=T.get.settings.apply(x,l),g=i.className,v=i.metadata,b=T.get.animationStartEvent(),y=T.get.animationEndEvent(),h=T.get.animationName(),p=i.error,C=i.namespace,A="."+i.namespace,f=S.data(w)||T,u&&(u=T.invoke(m)),u===!1&&(T.verbose("Converted arguments into settings object",i),T.animate(),T.instantiate())},instantiate:function(){T.verbose("Storing instance of module",T),S.data(w,f)},destroy:function(){T.verbose("Destroying previous module for",x),S.removeData(w)},refresh:function(){T.verbose("Refreshing display type on next animation"),delete T.displayType},forceRepaint:function(){T.verbose("Forcing element repaint");var n=S.parent(),i=S.next();0===i.size()?S.detach().appendTo(n):S.detach().insertBefore(i)},repaint:function(){T.verbose("Repainting element");x.offsetWidth},animate:function(n){return i=n||i,T.is.supported()?(T.debug("Preparing animation",i.animation),T.is.animating()&&i.queue?(!i.allowRepeats&&T.has.direction()&&T.is.occuring()&&T.queuing!==!0?T.error(p.repeated,i.animation,S):T.queue(i.animation),!1):void(T.can.animate()?T.set.animating(i.animation):T.error(p.noAnimation,i.animation,x))):(T.error(p.support),!1)},reset:function(){T.debug("Resetting animation to beginning conditions"),T.remove.animationEndCallback(),T.restore.conditions(),T.remove.animating()},queue:function(n){T.debug("Queueing animation of",n),T.queuing=!0,S.one(y+A,function(){T.queuing=!1,T.repaint(),T.animate.apply(this,i)})},complete:function(){T.verbose("CSS animation complete",i.animation),T.remove.animationEndCallback(),T.remove.failSafe(),T.is.looping()||(T.is.outward()?(T.verbose("Animation is outward, hiding element"),T.restore.conditions(),T.hide(),n.proxy(i.onHide,this)()):T.is.inward()?(T.verbose("Animation is outward, showing element"),T.restore.conditions(),T.show(),T.set.display(),n.proxy(i.onShow,this)()):T.restore.conditions(),T.remove.animation(),T.remove.animating()),n.proxy(i.onComplete,this)()},has:{direction:function(n){return n=n||i.animation,-1!==n.search(g.inward)||-1!==n.search(g.outward)?(T.debug("Direction already set in animation"),!0):!1},inlineDisplay:function(){var i=S.attr("style")||"";return n.isArray(i.match(/display.*?;/,""))}},set:{animating:function(e){e=e||i.animation,T.is.animating()||T.save.conditions(),T.remove.direction(),T.remove.animationEndCallback(),T.can.transition()&&!T.has.direction()&&T.set.direction(),T.remove.hidden(),T.set.display(),S.addClass(g.animating).addClass(g.transition).addClass(e).one(y+".complete"+A,T.complete),i.useFailSafe&&T.add.failSafe(),T.set.duration(i.duration),n.proxy(i.onStart,this)(),T.debug("Starting tween",e,S.attr("class"))},duration:function(n,e){e=e||i.duration,e="number"==typeof e?e+"ms":e,T.verbose("Setting animation duration",e),S.css({"-webkit-animation-duration":e,"-moz-animation-duration":e,"-ms-animation-duration":e,"-o-animation-duration":e,"animation-duration":e})},display:function(){var n=T.get.style(),i=T.get.displayType(),e=n+"display: "+i+" !important;";S.css("display",""),T.refresh(),S.css("display")!==i&&(T.verbose("Setting inline visibility to",i),S.attr("style",e))},direction:function(){S.is(":visible")&&!T.is.hidden()?(T.debug("Automatically determining the direction of animation","Outward"),S.removeClass(g.inward).addClass(g.outward)):(T.debug("Automatically determining the direction of animation","Inward"),S.removeClass(g.outward).addClass(g.inward))},looping:function(){T.debug("Transition set to loop"),S.addClass(g.looping)},hidden:function(){T.is.hidden()||(S.addClass(g.transition).addClass(g.hidden),"none"!==S.css("display")&&(T.verbose("Overriding default display to hide element"),S.css("display","none")))},visible:function(){S.addClass(g.transition).addClass(g.visible)}},save:{displayType:function(n){S.data(v.displayType,n)},transitionExists:function(i,e){n.fn.transition.exists[i]=e,T.verbose("Saving existence of transition",i,e)},conditions:function(){S.attr("class")||!1,S.attr("style")||"";S.removeClass(i.animation),T.remove.direction(),T.cache={className:S.attr("class"),style:T.get.style()},T.verbose("Saving original attributes",T.cache)}},restore:{conditions:function(){return T.cache===t?!1:(T.cache.className?S.attr("class",T.cache.className):S.removeAttr("class"),T.cache.style&&(T.verbose("Restoring original style attribute",T.cache.style),S.attr("style",T.cache.style)),T.is.looping()&&T.remove.looping(),void T.verbose("Restoring original attributes",T.cache))}},add:{failSafe:function(){var n=T.get.duration();T.timer=setTimeout(T.complete,n+100),T.verbose("Adding fail safe timer",T.timer)}},remove:{animating:function(){S.removeClass(g.animating)},animation:function(){S.css({"-webkit-animation":"","-moz-animation":"","-ms-animation":"","-o-animation":"",animation:""})},animationEndCallback:function(){S.off(".complete")},display:function(){S.css("display","")},direction:function(){S.removeClass(g.inward).removeClass(g.outward)},failSafe:function(){T.verbose("Removing fail safe timer",T.timer),T.timer&&clearTimeout(T.timer)},hidden:function(){S.removeClass(g.hidden)},visible:function(){S.removeClass(g.visible)},looping:function(){T.debug("Transitions are no longer looping"),S.removeClass(g.looping),T.forceRepaint()},transition:function(){S.removeClass(g.visible).removeClass(g.hidden)}},get:{settings:function(i,e,t){return"object"==typeof i?n.extend(!0,{},n.fn.transition.settings,i):"function"==typeof t?n.extend({},n.fn.transition.settings,{animation:i,onComplete:t,duration:e}):"string"==typeof e||"number"==typeof e?n.extend({},n.fn.transition.settings,{animation:i,duration:e}):"object"==typeof e?n.extend({},n.fn.transition.settings,e,{animation:i}):"function"==typeof e?n.extend({},n.fn.transition.settings,{animation:i,onComplete:e}):n.extend({},n.fn.transition.settings,{animation:i})},duration:function(n){return n=n||i.duration,"string"==typeof i.duration?n.indexOf("ms")>-1?parseFloat(n):1e3*parseFloat(n):n},displayType:function(){return i.displayType?i.displayType:(S.data(v.displayType)===t&&T.can.transition(!0),S.data(v.displayType))},style:function(){var n=S.attr("style")||"";return n.replace(/display.*?;/,"")},transitionExists:function(i){return n.fn.transition.exists[i]},animationName:function(){var n,i=e.createElement("div"),a={animation:"animationName",OAnimation:"oAnimationName",MozAnimation:"mozAnimationName",WebkitAnimation:"webkitAnimationName"};for(n in a)if(i.style[n]!==t)return a[n];return!1},animationStartEvent:function(){var n,i=e.createElement("div"),a={animation:"animationstart",OAnimation:"oAnimationStart",MozAnimation:"mozAnimationStart",WebkitAnimation:"webkitAnimationStart"};for(n in a)if(i.style[n]!==t)return a[n];return!1},animationEndEvent:function(){var n,i=e.createElement("div"),a={animation:"animationend",OAnimation:"oAnimationEnd",MozAnimation:"mozAnimationEnd",WebkitAnimation:"webkitAnimationEnd"};for(n in a)if(i.style[n]!==t)return a[n];return!1}},can:{transition:function(e){var a,o,s,r,d,l=S.attr("class"),m=S.prop("tagName"),c=i.animation,u=T.get.transitionExists(c);if(u===t||e){if(T.verbose("Determining whether animation exists"),a=n("<"+m+" />").addClass(l).insertAfter(S),o=a.addClass(c).removeClass(g.inward).removeClass(g.outward).addClass(g.animating).addClass(g.transition).css(h),s=a.addClass(g.inward).css(h),d=a.attr("class",l).removeAttr("style").removeClass(g.hidden).removeClass(g.visible).show().css("display"),T.verbose("Determining final display state",d),a.remove(),o!=s)T.debug("Direction exists for animation",c),r=!0;else{if("none"==o||!o)return void T.debug("No animation defined in css",c);T.debug("Static animation found",c,d),r=!1}T.save.displayType(d),T.save.transitionExists(c,r)}return u!==t?u:r},animate:function(){return T.can.transition()!==t}},is:{animating:function(){return S.hasClass(g.animating)},inward:function(){return S.hasClass(g.inward)},outward:function(){return S.hasClass(g.outward)},looping:function(){return S.hasClass(g.looping)},occuring:function(n){return n=n||i.animation,n=n.replace(" ","."),S.filter(n).size()>0},visible:function(){return S.is(":visible")},hidden:function(){return"hidden"===S.css("visibility")},supported:function(){return h!==!1&&y!==!1}},hide:function(){T.verbose("Hiding element"),T.is.animating()&&T.reset(),T.remove.display(),T.remove.visible(),T.set.hidden(),T.repaint()},show:function(n){T.verbose("Showing element",n),T.remove.hidden(),T.set.visible(),T.repaint()},start:function(){T.verbose("Starting animation"),S.removeClass(g.disabled)},stop:function(){T.debug("Stopping animation"),S.addClass(g.disabled)},toggle:function(){T.debug("Toggling play status"),S.toggleClass(g.disabled)},setting:function(e,a){if(T.debug("Changing setting",e,a),n.isPlainObject(e))n.extend(!0,i,e);else{if(a===t)return i[e];i[e]=a}},internal:function(i,e){if(n.isPlainObject(i))n.extend(!0,T,i);else{if(e===t)return T[i];T[i]=e}},debug:function(){i.debug&&(i.performance?T.performance.log(arguments):(T.debug=Function.prototype.bind.call(console.info,console,i.name+":"),T.debug.apply(console,arguments)))},verbose:function(){i.verbose&&i.debug&&(i.performance?T.performance.log(arguments):(T.verbose=Function.prototype.bind.call(console.info,console,i.name+":"),T.verbose.apply(console,arguments)))},error:function(){T.error=Function.prototype.bind.call(console.error,console,i.name+":"),T.error.apply(console,arguments)},performance:{log:function(n){var e,t,a;i.performance&&(e=(new Date).getTime(),a=r||e,t=e-a,r=e,d.push({Name:n[0],Arguments:[].slice.call(n,1)||"",Element:x,"Execution Time":t})),clearTimeout(T.performance.timer),T.performance.timer=setTimeout(T.performance.display,600)},display:function(){var e=i.name+":",a=0;r=!1,clearTimeout(T.performance.timer),n.each(d,function(n,i){a+=i["Execution Time"]}),e+=" "+a+"ms",s&&(e+=" '"+s+"'"),o.size()>1&&(e+=" ("+o.size()+")"),(console.group!==t||console.table!==t)&&d.length>0&&(console.groupCollapsed(e),console.table?console.table(d):n.each(d,function(n,i){console.log(i.Name+": "+i["Execution Time"]+"ms")}),console.groupEnd()),d=[]}},invoke:function(i,e,o){var s,r,d,l=f;return e=e||c,o=x||o,"string"==typeof i&&l!==t&&(i=i.split(/[\. ]/),s=i.length-1,n.each(i,function(e,a){var o=e!=s?a+i[e+1].charAt(0).toUpperCase()+i[e+1].slice(1):i;if(n.isPlainObject(l[o])&&e!=s)l=l[o];else{if(l[o]!==t)return r=l[o],!1;if(!n.isPlainObject(l[a])||e==s)return l[a]!==t?(r=l[a],!1):!1;l=l[a]}})),n.isFunction(r)?d=r.apply(o,e):r!==t&&(d=r),n.isArray(a)?a.push(d):a!==t?a=[a,d]:d!==t&&(a=d),r!==t?r:!1}},T.initialize()}),a!==t?a:this},n.fn.transition.exists={},n.fn.transition.settings={name:"Transition",debug:!1,verbose:!0,performance:!0,namespace:"transition",onStart:function(){},onComplete:function(){},onShow:function(){},onHide:function(){},useFailSafe:!1,allowRepeats:!1,displayType:!1,animation:"fade",duration:"500ms",queue:!0,metadata:{displayType:"display"},className:{animating:"animating",disabled:"disabled",hidden:"hidden",inward:"in",loading:"loading",looping:"looping",outward:"out",transition:"transition",visible:"visible"},error:{noAnimation:"There is no css animation matching the one you specified.",repeated:"That animation is already occurring, cancelling repeated animation",method:"The method you called is not defined",support:"This browser does not support CSS animations"}}}(jQuery,window,document);
 /*
 * # Semantic - Video
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

"use strict";

$.fn.video = function(parameters) {

  var
    $allModules     = $(this),

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.video.settings, parameters)
          : $.extend({}, $.fn.video.settings),

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        templates       = settings.templates,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $window         = $(window),
        $module         = $(this),
        $placeholder    = $module.find(selector.placeholder),
        $playButton     = $module.find(selector.playButton),
        $embed          = $module.find(selector.embed),

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing video');
          module.create();
          $placeholder
            .on('click' + eventNamespace, module.play)
          ;
          $playButton
            .on('click' + eventNamespace, module.play)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        create: function() {
          var
            image = $module.data(metadata.image),
            html = templates.video(image)
          ;
          $module.html(html);
          module.refresh();
          if(!image) {
            module.play();
          }
          module.debug('Creating html for video element', html);
        },

        destroy: function() {
          module.verbose('Destroying previous instance of video');
          module.reset();
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          $placeholder
            .off(eventNamespace)
          ;
          $playButton
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $placeholder    = $module.find(selector.placeholder);
          $playButton     = $module.find(selector.playButton);
          $embed          = $module.find(selector.embed);
        },

        // sets new video
        change: function(source, id, url) {
          module.debug('Changing video to ', source, id, url);
          $module
            .data(metadata.source, source)
            .data(metadata.id, id)
            .data(metadata.url, url)
          ;
          settings.onChange();
        },

        // clears video embed
        reset: function() {
          module.debug('Clearing video embed and showing placeholder');
          $module
            .removeClass(className.active)
          ;
          $embed
            .html(' ')
          ;
          $placeholder
            .show()
          ;
          settings.onReset();
        },

        // plays current video
        play: function() {
          module.debug('Playing video');
          var
            source = $module.data(metadata.source) || false,
            url    = $module.data(metadata.url)    || false,
            id     = $module.data(metadata.id)     || false
          ;
          $embed
            .html( module.generate.html(source, id, url) )
          ;
          $module
            .addClass(className.active)
          ;
          settings.onPlay();
        },

        get: {
          source: function(url) {
            if(typeof url !== 'string') {
              return false;
            }
            if(url.search('youtube.com') !== -1) {
              return 'youtube';
            }
            else if(url.search('vimeo.com') !== -1) {
              return 'vimeo';
            }
            return false;
          },
          id: function(url) {
            if(settings.regExp.youtube.test(url)) {
              return url.match(settings.regExp.youtube)[1];
            }
            else if(settings.regExp.vimeo.test(url)) {
              return url.match(settings.regExp.vimeo)[2];
            }
            return false;
          }
        },

        generate: {
          // generates iframe html
          html: function(source, id, url) {
            module.debug('Generating embed html');
            var
              html
            ;
            // allow override of settings
            source = source || settings.source;
            id     = id     || settings.id;
            if((source && id) || url) {
              if(!source || !id) {
                source = module.get.source(url);
                id     = module.get.id(url);
              }
              if(source == 'vimeo') {
                html = ''
                  + '<iframe src="http://player.vimeo.com/video/' + id + '?=' + module.generate.url(source) + '"'
                  + ' width="100%" height="100%"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
              else if(source == 'youtube') {
                html = ''
                  + '<iframe src="http://www.youtube.com/embed/' + id + '?=' + module.generate.url(source) + '"'
                  + ' width="100%" height="100%"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
            }
            else {
              module.error(error.noVideo);
            }
            return html;
          },

          // generate url parameters
          url: function(source) {
            var
              api      = (settings.api)
                ? 1
                : 0,
              autoplay = (settings.autoplay === 'auto')
                ? ($module.data('image') !== undefined)
                : settings.autoplay,
              hd       = (settings.hd)
                ? 1
                : 0,
              showUI   = (settings.showUI)
                ? 1
                : 0,
              // opposite used for some params
              hideUI   = !(settings.showUI)
                ? 1
                : 0,
              url = ''
            ;
            if(source == 'vimeo') {
              url = ''
                +      'api='      + api
                + '&amp;title='    + showUI
                + '&amp;byline='   + showUI
                + '&amp;portrait=' + showUI
                + '&amp;autoplay=' + autoplay
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            if(source == 'ustream') {
              url = ''
                + 'autoplay=' + autoplay
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            else if(source == 'youtube') {
              url = ''
                + 'enablejsapi='      + api
                + '&amp;autoplay='    + autoplay
                + '&amp;autohide='    + hideUI
                + '&amp;hq='          + hd
                + '&amp;modestbranding=1'
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            return url;
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.video.settings = {

  name        : 'Video',
  namespace   : 'video',

  debug       : false,
  verbose     : true,
  performance : true,

  metadata    : {
    id     : 'id',
    image  : 'image',
    source : 'source',
    url    : 'url'
  },

  source      : false,
  url         : false,
  id          : false,

  aspectRatio : (16/9),

  onPlay   : function(){},
  onReset  : function(){},
  onChange : function(){},

  // callbacks not coded yet (needs to use jsapi)
  onPause  : function() {},
  onStop   : function() {},

  width    : 'auto',
  height   : 'auto',

  autoplay : 'auto',
  color    : '#442359',
  hd       : true,
  showUI   : false,
  api      : true,

  regExp : {
    youtube : /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,
    vimeo   : /http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/
  },

  error      : {
    noVideo     : 'No video specified',
    method      : 'The method you called is not defined'
  },

  className   : {
    active      : 'active'
  },

  selector    : {
    embed       : '.embed',
    placeholder : '.placeholder',
    playButton  : '.play'
  }
};

$.fn.video.settings.templates = {
  video: function(image) {
    var
      html = ''
    ;
    if(image) {
      html += ''
        + '<i class="video play icon"></i>'
        + '<img class="placeholder" src="' + image + '">'
      ;
    }
    html += '<div class="embed"></div>';
    return html;
  }
};


})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,o,t,n){"use strict";e.fn.video=function(t){{var a,i=e(this),r=i.selector||"",l=(new Date).getTime(),c=[],u=arguments[0],s="string"==typeof u,m=[].slice.call(arguments,1);o.requestAnimationFrame||o.mozRequestAnimationFrame||o.webkitRequestAnimationFrame||o.msRequestAnimationFrame||function(e){setTimeout(e,0)}}return i.each(function(){var d,p=e.isPlainObject(t)?e.extend(!0,{},e.fn.video.settings,t):e.extend({},e.fn.video.settings),f=p.selector,g=p.className,h=p.error,b=p.metadata,v=p.namespace,y=p.templates,w="."+v,x="module-"+v,F=(e(o),e(this)),C=F.find(f.placeholder),E=F.find(f.playButton),T=F.find(f.embed),z=this,A=F.data(x);d={initialize:function(){d.debug("Initializing video"),d.create(),C.on("click"+w,d.play),E.on("click"+w,d.play),d.instantiate()},instantiate:function(){d.verbose("Storing instance of module",d),A=d,F.data(x,d)},create:function(){var e=F.data(b.image),o=y.video(e);F.html(o),d.refresh(),e||d.play(),d.debug("Creating html for video element",o)},destroy:function(){d.verbose("Destroying previous instance of video"),d.reset(),F.removeData(x).off(w),C.off(w),E.off(w)},refresh:function(){d.verbose("Refreshing selector cache"),C=F.find(f.placeholder),E=F.find(f.playButton),T=F.find(f.embed)},change:function(e,o,t){d.debug("Changing video to ",e,o,t),F.data(b.source,e).data(b.id,o).data(b.url,t),p.onChange()},reset:function(){d.debug("Clearing video embed and showing placeholder"),F.removeClass(g.active),T.html(" "),C.show(),p.onReset()},play:function(){d.debug("Playing video");var e=F.data(b.source)||!1,o=F.data(b.url)||!1,t=F.data(b.id)||!1;T.html(d.generate.html(e,t,o)),F.addClass(g.active),p.onPlay()},get:{source:function(e){return"string"!=typeof e?!1:-1!==e.search("youtube.com")?"youtube":-1!==e.search("vimeo.com")?"vimeo":!1},id:function(e){return p.regExp.youtube.test(e)?e.match(p.regExp.youtube)[1]:p.regExp.vimeo.test(e)?e.match(p.regExp.vimeo)[2]:!1}},generate:{html:function(e,o,t){d.debug("Generating embed html");var n;return e=e||p.source,o=o||p.id,e&&o||t?(e&&o||(e=d.get.source(t),o=d.get.id(t)),"vimeo"==e?n='<iframe src="http://player.vimeo.com/video/'+o+"?="+d.generate.url(e)+'" width="100%" height="100%" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>':"youtube"==e&&(n='<iframe src="http://www.youtube.com/embed/'+o+"?="+d.generate.url(e)+'" width="100%" height="100%" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>')):d.error(h.noVideo),n},url:function(e){var o=p.api?1:0,t="auto"===p.autoplay?F.data("image")!==n:p.autoplay,a=p.hd?1:0,i=p.showUI?1:0,r=p.showUI?0:1,l="";return"vimeo"==e&&(l="api="+o+"&amp;title="+i+"&amp;byline="+i+"&amp;portrait="+i+"&amp;autoplay="+t,p.color&&(l+="&amp;color="+p.color)),"ustream"==e?(l="autoplay="+t,p.color&&(l+="&amp;color="+p.color)):"youtube"==e&&(l="enablejsapi="+o+"&amp;autoplay="+t+"&amp;autohide="+r+"&amp;hq="+a+"&amp;modestbranding=1",p.color&&(l+="&amp;color="+p.color)),l}},setting:function(o,t){if(d.debug("Changing setting",o,t),e.isPlainObject(o))e.extend(!0,p,o);else{if(t===n)return p[o];p[o]=t}},internal:function(o,t){if(e.isPlainObject(o))e.extend(!0,d,o);else{if(t===n)return d[o];d[o]=t}},debug:function(){p.debug&&(p.performance?d.performance.log(arguments):(d.debug=Function.prototype.bind.call(console.info,console,p.name+":"),d.debug.apply(console,arguments)))},verbose:function(){p.verbose&&p.debug&&(p.performance?d.performance.log(arguments):(d.verbose=Function.prototype.bind.call(console.info,console,p.name+":"),d.verbose.apply(console,arguments)))},error:function(){d.error=Function.prototype.bind.call(console.error,console,p.name+":"),d.error.apply(console,arguments)},performance:{log:function(e){var o,t,n;p.performance&&(o=(new Date).getTime(),n=l||o,t=o-n,l=o,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:z,"Execution Time":t})),clearTimeout(d.performance.timer),d.performance.timer=setTimeout(d.performance.display,100)},display:function(){var o=p.name+":",t=0;l=!1,clearTimeout(d.performance.timer),e.each(c,function(e,o){t+=o["Execution Time"]}),o+=" "+t+"ms",r&&(o+=" '"+r+"'"),i.size()>1&&(o+=" ("+i.size()+")"),(console.group!==n||console.table!==n)&&c.length>0&&(console.groupCollapsed(o),console.table?console.table(c):e.each(c,function(e,o){console.log(o.Name+": "+o["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(o,t,i){var r,l,c,u=A;return t=t||m,i=z||i,"string"==typeof o&&u!==n&&(o=o.split(/[\. ]/),r=o.length-1,e.each(o,function(t,a){var i=t!=r?a+o[t+1].charAt(0).toUpperCase()+o[t+1].slice(1):o;if(e.isPlainObject(u[i])&&t!=r)u=u[i];else{if(u[i]!==n)return l=u[i],!1;if(!e.isPlainObject(u[a])||t==r)return u[a]!==n?(l=u[a],!1):(d.error(h.method,o),!1);u=u[a]}})),e.isFunction(l)?c=l.apply(i,t):l!==n&&(c=l),e.isArray(a)?a.push(c):a!==n?a=[a,c]:c!==n&&(a=c),l}},s?(A===n&&d.initialize(),d.invoke(u)):(A!==n&&d.destroy(),d.initialize())}),a!==n?a:this},e.fn.video.settings={name:"Video",namespace:"video",debug:!1,verbose:!0,performance:!0,metadata:{id:"id",image:"image",source:"source",url:"url"},source:!1,url:!1,id:!1,aspectRatio:16/9,onPlay:function(){},onReset:function(){},onChange:function(){},onPause:function(){},onStop:function(){},width:"auto",height:"auto",autoplay:"auto",color:"#442359",hd:!0,showUI:!1,api:!0,regExp:{youtube:/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,vimeo:/http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/},error:{noVideo:"No video specified",method:"The method you called is not defined"},className:{active:"active"},selector:{embed:".embed",placeholder:".placeholder",playButton:".play"}},e.fn.video.settings.templates={video:function(e){var o="";return e&&(o+='<i class="video play icon"></i><img class="placeholder" src="'+e+'">'),o+='<div class="embed"></div>'}}}(jQuery,window,document);
/*
 * # Semantic - Visibility
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.visibility = function(parameters) {
  var
    $allModules    = $(this),
    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.visibility.settings, parameters),

        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $window         = $(window),
        $module         = $(this),
        $context        = $(settings.context),
        $container      = $module.offsetParent(),

        selector        = $module.selector || '',
        instance        = $module.data(moduleNamespace),

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); },

        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing visibility', settings);

          module.setup.cache();
          module.save.position();

          if( module.should.trackChanges() ) {
            module.bindEvents();
            if(settings.type == 'image') {
              module.setup.image();
            }
            if(settings.type == 'fixed') {
              module.setup.fixed();
            }
          }
          module.checkVisibility();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        bindEvents: function() {
          module.verbose('Binding visibility events to scroll and resize');
          $window
            .on('resize' + eventNamespace, module.event.refresh)
          ;
          $context
            .on('scroll' + eventNamespace, module.event.scroll)
          ;
        },

        event: {
          refresh: function() {
            requestAnimationFrame(module.refresh);
          },
          scroll: function() {
            module.verbose('Scroll position changed');
            if(settings.throttle) {
              clearTimeout(module.timer);
              module.timer = setTimeout(module.checkVisibility, settings.throttle);
            }
            else {
              requestAnimationFrame(module.checkVisibility);
            }
          }
        },

        precache: function(images, callback) {
          if (!(images instanceof Array)) {
            images = [images];
          }
          var
            imagesLength  = images.length,
            loadedCounter = 0,
            cache         = [],
            cacheImage    = document.createElement('img'),
            handleLoad    = function() {
              loadedCounter++;
              if (loadedCounter >= images.length) {
                if ($.isFunction(callback)) {
                  callback();
                }
              }
            }
          ;
          while (imagesLength--) {
            cacheImage         = document.createElement('img');
            cacheImage.onload  = handleLoad;
            cacheImage.onerror = handleLoad;
            cacheImage.src     = images[imagesLength];
            cache.push(cacheImage);
          }
        },

        should: {

          trackChanges: function() {
            if(methodInvoked && queryArguments.length > 0) {
              module.debug('One time query, no need to bind events');
              return false;
            }
            module.debug('Query is attaching callbacks, watching for changes with scroll');
            return true;
          }

        },

        setup: {
          cache: function() {
            module.cache = {
              occurred : {},
              screen   : {},
              element  : {},
            };
          },
          image: function() {
            var
              src = $module.data('src')
            ;
            if(src) {
              module.verbose('Lazy loading image', src);
              // show when top visible
              module.topVisible(function() {
                module.precache(src, function() {
                  module.set.image(src);
                  settings.onTopVisible = false;
                });
              });
            }
          },
          fixed: function() {
            module.verbose('Setting up fixed on element pass');
            $module
              .visibility({
                once: false,
                continuous: false,
                onTopPassed: function() {
                  $module
                    .addClass(className.fixed)
                    .css({
                      position: 'fixed',
                      top: settings.offset + 'px'
                    })
                  ;
                  if(settings.animation && $.fn.transition !== undefined) {
                    $module.transition(settings.transition, settings.duration);
                  }
                },
                onTopPassedReverse: function() {
                  $module
                    .removeClass(className.fixed)
                    .css({
                      position: '',
                      top: ''
                    })
                  ;
                }
              })
            ;
          }
        },

        set: {
          image: function(src) {
            var
              offScreen = (module.cache.screen.bottom < module.cache.element.top)
            ;
            $module
              .attr('src', src)
            ;
            if(offScreen) {
              module.verbose('Image outside browser, no show animation');
              $module.show();
            }
            else {
              if(settings.transition && $.fn.transition !== undefined) {
                $module.transition(settings.transition, settings.duration);
              }
              else {
                $module.fadeIn(settings.duration);
              }
            }
          }
        },

        refresh: function() {
          module.debug('Refreshing constants (element width/height)');
          module.reset();
          module.save.position();
          module.checkVisibility();
          $.proxy(settings.onRefresh, element)();
        },

        reset: function() {
          module.verbose('Reseting all cached values');
          if( $.isPlainObject(module.cache) ) {
            module.cache.screen = {};
            module.cache.element = {};
          }
        },

        checkVisibility: function() {
          module.verbose('Checking visibility of element', module.cache.element);
          module.save.calculations();

          // percentage
          module.passed();

          // reverse (must be first)
          module.passingReverse();
          module.topVisibleReverse();
          module.bottomVisibleReverse();
          module.topPassedReverse();
          module.bottomPassedReverse();

          // one time
          module.passing();
          module.topVisible();
          module.bottomVisible();
          module.topPassed();
          module.bottomPassed();
        },

        passed: function(amount, newCallback) {
          var
            calculations   = module.get.elementCalculations(),
            amountInPixels
          ;
          // assign callback
          if(amount !== undefined && newCallback !== undefined) {
            settings.onPassed[amount] = newCallback;
          }
          else if(amount !== undefined) {
            return (module.get.pixelsPassed(amount) > calculations.pixelsPassed);
          }
          else if(calculations.passing) {
            $.each(settings.onPassed, function(amount, callback) {
              if(calculations.bottomVisible || calculations.pixelsPassed > module.get.pixelsPassed(amount)) {
                module.execute(callback, amount);
              }
              else if(!settings.once) {
                module.remove.occurred(callback);
              }
            });
          }
        },

        passing: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onPassing,
            callbackName = 'passing'
          ;
          if(newCallback) {
            module.debug('Adding callback for passing', newCallback);
            settings.onPassing = newCallback;
          }
          if(calculations.passing) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback !== undefined) {
            return calculations.passing;
          }
        },


        topVisible: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopVisible,
            callbackName = 'topVisible'
          ;
          if(newCallback) {
            module.debug('Adding callback for top visible', newCallback);
            settings.onTopVisible = newCallback;
          }
          if(calculations.topVisible) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.topVisible;
          }
        },

        bottomVisible: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomVisible,
            callbackName = 'bottomVisible'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom visible', newCallback);
            settings.onBottomVisible = newCallback;
          }
          if(calculations.bottomVisible) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.bottomVisible;
          }
        },

        topPassed: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopPassed,
            callbackName = 'topPassed'
          ;
          if(newCallback) {
            module.debug('Adding callback for top passed', newCallback);
            settings.onTopPassed = newCallback;
          }
          if(calculations.topPassed) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.topPassed;
          }
        },

        bottomPassed: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomPassed,
            callbackName = 'bottomPassed'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom passed', newCallback);
            settings.onBottomPassed = newCallback;
          }
          if(calculations.bottomPassed) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.bottomPassed;
          }
        },

        passingReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onPassingReverse,
            callbackName = 'passingReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for passing reverse', newCallback);
            settings.onPassingReverse = newCallback;
          }
          if(!calculations.passing) {
            if(module.get.occurred('passing')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback !== undefined) {
            return !calculations.passing;
          }
        },


        topVisibleReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopVisibleReverse,
            callbackName = 'topVisibleReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for top visible reverse', newCallback);
            settings.onTopVisibleReverse = newCallback;
          }
          if(!calculations.topVisible) {
            if(module.get.occurred('topVisible')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.topVisible;
          }
        },

        bottomVisibleReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomVisibleReverse,
            callbackName = 'bottomVisibleReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom visible reverse', newCallback);
            settings.onBottomVisibleReverse = newCallback;
          }
          if(!calculations.bottomVisible) {
            if(module.get.occurred('bottomVisible')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.bottomVisible;
          }
        },

        topPassedReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopPassedReverse,
            callbackName = 'topPassedReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for top passed reverse', newCallback);
            settings.onTopPassedReverse = newCallback;
          }
          if(!calculations.topPassed) {
            if(module.get.occurred('topPassed')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.onTopPassed;
          }
        },

        bottomPassedReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomPassedReverse,
            callbackName = 'bottomPassedReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom passed reverse', newCallback);
            settings.onBottomPassedReverse = newCallback;
          }
          if(!calculations.bottomPassed) {
            if(module.get.occurred('bottomPassed')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.bottomPassed;
          }
        },

        execute: function(callback, callbackName) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations()
          ;
          callback     = callback || false;
          if(callback) {
            if(settings.continuous) {
              module.debug('Callback being called continuously', callbackName, calculations);
              $.proxy(callback, element)(calculations, screen);
            }
            else if(!module.get.occurred(callbackName)) {
              module.debug('Conditions met', callbackName, calculations);
              $.proxy(callback, element)(calculations, screen);
            }
          }
          module.save.occurred(callbackName);
        },

        remove: {
          occurred: function(callback) {
            if(callback) {
              if(module.cache.occurred[callback] !== undefined && module.cache.occurred[callback] === true) {
                module.debug('Callback can now be called again', callback);
                module.cache.occurred[callback] = false;
              }
            }
            else {
              module.cache.occurred = {};
            }
          }
        },

        save: {
          calculations: function() {
            module.verbose('Saving all calculations necessary to determine positioning');
            module.save.scroll();
            module.save.direction();
            module.save.screenCalculations();
            module.save.elementCalculations();
          },
          occurred: function(callback) {
            if(callback) {
              if(module.cache.occurred[callback] === undefined || (module.cache.occurred[callback] !== true)) {
                module.verbose('Saving callback occurred', callback);
                module.cache.occurred[callback] = true;
              }
            }
          },
          scroll: function() {
            module.cache.scroll = $context.scrollTop() + settings.offset;
          },
          direction: function() {
            var
              scroll     = module.get.scroll(),
              lastScroll = module.get.lastScroll(),
              direction
            ;
            if(scroll > lastScroll && lastScroll) {
              direction = 'down';
            }
            else if(scroll < lastScroll && lastScroll) {
              direction = 'up';
            }
            else {
              direction = 'static';
            }
            module.cache.direction = direction;
            return module.cache.direction;
          },
          elementPosition: function() {
            var
              screen = module.get.screenSize()
            ;
            module.verbose('Saving element position');
            $.extend(module.cache.element, {
              margin : {
                top    : parseInt($module.css('margin-top'), 10),
                bottom : parseInt($module.css('margin-bottom'), 10)
              },
              fits   : (element.height < screen.height),
              offset : $module.offset(),
              width  : $module.outerWidth(),
              height : $module.outerHeight()
            });
            return module.cache.element;
          },
          elementCalculations: function() {
            var
              screen  = module.get.screenCalculations(),
              element = module.get.elementPosition()
            ;
            // offset
            if(settings.includeMargin) {
              $.extend(module.cache.element, {
                top    : element.offset.top - element.margin.top,
                bottom : element.offset.top + element.height + element.margin.bottom
              });
            }
            else {
              $.extend(module.cache.element, {
                top    : element.offset.top,
                bottom : element.offset.top + element.height
              });
            }
            // visibility
            $.extend(module.cache.element, {
              topVisible       : (screen.bottom >= element.top),
              topPassed        : (screen.top >= element.top),
              bottomVisible    : (screen.bottom >= element.bottom),
              bottomPassed     : (screen.top >= element.bottom),
              pixelsPassed     : 0,
              percentagePassed : 0
            });
            // meta calculations
            $.extend(module.cache.element, {
              visible : (module.cache.element.topVisible || module.cache.element.bottomVisible),
              passing : (module.cache.element.topPassed && !module.cache.element.bottomPassed),
              hidden  : (!module.cache.element.topVisible && !module.cache.element.bottomVisible)
            });
            if(module.cache.element.passing) {
              module.cache.element.pixelsPassed = (screen.top - element.top);
              module.cache.element.percentagePassed = (screen.top - element.top) / element.height;
            }
            module.verbose('Updated element calculations', module.cache.element);
          },
          screenCalculations: function() {
            var
              scroll = $context.scrollTop() + settings.offset
            ;
            if(module.cache.scroll === undefined) {
              module.cache.scroll = $context.scrollTop() + settings.offset;
            }
            module.save.direction();
            $.extend(module.cache.screen, {
              top    : scroll,
              bottom : scroll + module.cache.screen.height
            });
            return module.cache.screen;
          },
          screenSize: function() {
            module.verbose('Saving window position');
            module.cache.screen = {
              height: $context.height()
            };
          },
          position: function() {
            module.save.screenSize();
            module.save.elementPosition();
          }
        },

        get: {
          pixelsPassed: function(amount) {
            var
              element = module.get.elementCalculations()
            ;
            if(amount.search('%') > -1) {
              return ( element.height * (parseInt(amount, 10) / 100) );
            }
            return parseInt(amount, 10);
          },
          occurred: function(callback) {
            return (module.cache.occurred !== undefined)
              ? module.cache.occurred[callback] || false
              : false
            ;
          },
          direction: function() {
            if(module.cache.direction === undefined) {
              module.save.direction();
            }
            return module.cache.direction;
          },
          elementPosition: function() {
            if(module.cache.element === undefined) {
              module.save.elementPosition();
            }
            return module.cache.element;
          },
          elementCalculations: function() {
            if(module.cache.element === undefined) {
              module.save.elementCalculations();
            }
            return module.cache.element;
          },
          screenCalculations: function() {
            if(module.cache.screen === undefined) {
              module.save.screenCalculations();
            }
            return module.cache.screen;
          },
          screenSize: function() {
            if(module.cache.screen === undefined) {
              module.save.screenSize();
            }
            return module.cache.screen;
          },
          scroll: function() {
            if(module.cache.scroll === undefined) {
              module.save.scroll();
            }
            return module.cache.scroll;
          },
          lastScroll: function() {
            if(module.cache.screen === undefined) {
              module.debug('First scroll event, no last scroll could be found');
              return false;
            }
            return module.cache.screen.top;
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.visibility.settings = {

  name                   : 'Visibility',
  namespace              : 'visibility',

  className: {
    fixed: 'fixed'
  },

  debug                  : false,
  verbose                : false,
  performance            : true,

  offset                 : 0,
  includeMargin          : false,

  context                : window,

  // visibility check delay in ms (defaults to animationFrame)
  throttle               : false,

  // special visibility type (image, fixed)
  type                   : false,

  // image only animation settings
  transition             : false,
  duration               : 500,

  // array of callbacks for percentage
  onPassed               : {},

  // standard callbacks
  onPassing              : false,
  onTopVisible           : false,
  onBottomVisible        : false,
  onTopPassed            : false,
  onBottomPassed         : false,

  // reverse callbacks
  onPassingReverse       : false,
  onTopVisibleReverse    : false,
  onBottomVisibleReverse : false,
  onTopPassedReverse     : false,
  onBottomPassedReverse  : false,

  once                   : true,
  continuous             : false,

  // utility callbacks
  onRefresh              : function(){},
  onScroll               : function(){},

  error : {
    method : 'The method you called is not defined.'
  }

};

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,o,t,n){e.fn.visibility=function(s){var i,c=e(this),r=c.selector||"",a=(new Date).getTime(),l=[],u=arguments[0],d="string"==typeof u,m=[].slice.call(arguments,1);return c.each(function(){var c,b=e.extend(!0,{},e.fn.visibility.settings,s),p=b.className,g=b.namespace,f=b.error,v="."+g,h="module-"+g,P=e(o),V=e(this),x=e(b.context),y=(V.offsetParent(),V.selector||"",V.data(h)),R=o.requestAnimationFrame||o.mozRequestAnimationFrame||o.webkitRequestAnimationFrame||o.msRequestAnimationFrame||function(e){setTimeout(e,0)},C=this;c={initialize:function(){c.verbose("Initializing visibility",b),c.setup.cache(),c.save.position(),c.should.trackChanges()&&(c.bindEvents(),"image"==b.type&&c.setup.image(),"fixed"==b.type&&c.setup.fixed()),c.checkVisibility(),c.instantiate()},instantiate:function(){c.verbose("Storing instance of module",c),y=c,V.data(h,c)},destroy:function(){c.verbose("Destroying previous module"),V.off(v).removeData(h)},bindEvents:function(){c.verbose("Binding visibility events to scroll and resize"),P.on("resize"+v,c.event.refresh),x.on("scroll"+v,c.event.scroll)},event:{refresh:function(){R(c.refresh)},scroll:function(){c.verbose("Scroll position changed"),b.throttle?(clearTimeout(c.timer),c.timer=setTimeout(c.checkVisibility,b.throttle)):R(c.checkVisibility)}},precache:function(o,n){o instanceof Array||(o=[o]);for(var s=o.length,i=0,c=[],r=t.createElement("img"),a=function(){i++,i>=o.length&&e.isFunction(n)&&n()};s--;)r=t.createElement("img"),r.onload=a,r.onerror=a,r.src=o[s],c.push(r)},should:{trackChanges:function(){return d&&m.length>0?(c.debug("One time query, no need to bind events"),!1):(c.debug("Query is attaching callbacks, watching for changes with scroll"),!0)}},setup:{cache:function(){c.cache={occurred:{},screen:{},element:{}}},image:function(){var e=V.data("src");e&&(c.verbose("Lazy loading image",e),c.topVisible(function(){c.precache(e,function(){c.set.image(e),b.onTopVisible=!1})}))},fixed:function(){c.verbose("Setting up fixed on element pass"),V.visibility({once:!1,continuous:!1,onTopPassed:function(){V.addClass(p.fixed).css({position:"fixed",top:b.offset+"px"}),b.animation&&e.fn.transition!==n&&V.transition(b.transition,b.duration)},onTopPassedReverse:function(){V.removeClass(p.fixed).css({position:"",top:""})}})}},set:{image:function(o){var t=c.cache.screen.bottom<c.cache.element.top;V.attr("src",o),t?(c.verbose("Image outside browser, no show animation"),V.show()):b.transition&&e.fn.transition!==n?V.transition(b.transition,b.duration):V.fadeIn(b.duration)}},refresh:function(){c.debug("Refreshing constants (element width/height)"),c.reset(),c.save.position(),c.checkVisibility(),e.proxy(b.onRefresh,C)()},reset:function(){c.verbose("Reseting all cached values"),e.isPlainObject(c.cache)&&(c.cache.screen={},c.cache.element={})},checkVisibility:function(){c.verbose("Checking visibility of element",c.cache.element),c.save.calculations(),c.passed(),c.passingReverse(),c.topVisibleReverse(),c.bottomVisibleReverse(),c.topPassedReverse(),c.bottomPassedReverse(),c.passing(),c.topVisible(),c.bottomVisible(),c.topPassed(),c.bottomPassed()},passed:function(o,t){var s=c.get.elementCalculations();if(o!==n&&t!==n)b.onPassed[o]=t;else{if(o!==n)return c.get.pixelsPassed(o)>s.pixelsPassed;s.passing&&e.each(b.onPassed,function(e,o){s.bottomVisible||s.pixelsPassed>c.get.pixelsPassed(e)?c.execute(o,e):b.once||c.remove.occurred(o)})}},passing:function(e){var o=c.get.elementCalculations(),t=e||b.onPassing,s="passing";return e&&(c.debug("Adding callback for passing",e),b.onPassing=e),o.passing?c.execute(t,s):b.once||c.remove.occurred(s),e!==n?o.passing:void 0},topVisible:function(e){var o=c.get.elementCalculations(),t=e||b.onTopVisible,s="topVisible";return e&&(c.debug("Adding callback for top visible",e),b.onTopVisible=e),o.topVisible?c.execute(t,s):b.once||c.remove.occurred(s),e===n?o.topVisible:void 0},bottomVisible:function(e){var o=c.get.elementCalculations(),t=e||b.onBottomVisible,s="bottomVisible";return e&&(c.debug("Adding callback for bottom visible",e),b.onBottomVisible=e),o.bottomVisible?c.execute(t,s):b.once||c.remove.occurred(s),e===n?o.bottomVisible:void 0},topPassed:function(e){var o=c.get.elementCalculations(),t=e||b.onTopPassed,s="topPassed";return e&&(c.debug("Adding callback for top passed",e),b.onTopPassed=e),o.topPassed?c.execute(t,s):b.once||c.remove.occurred(s),e===n?o.topPassed:void 0},bottomPassed:function(e){var o=c.get.elementCalculations(),t=e||b.onBottomPassed,s="bottomPassed";return e&&(c.debug("Adding callback for bottom passed",e),b.onBottomPassed=e),o.bottomPassed?c.execute(t,s):b.once||c.remove.occurred(s),e===n?o.bottomPassed:void 0},passingReverse:function(e){var o=c.get.elementCalculations(),t=e||b.onPassingReverse,s="passingReverse";return e&&(c.debug("Adding callback for passing reverse",e),b.onPassingReverse=e),o.passing?b.once||c.remove.occurred(s):c.get.occurred("passing")&&c.execute(t,s),e!==n?!o.passing:void 0},topVisibleReverse:function(e){var o=c.get.elementCalculations(),t=e||b.onTopVisibleReverse,s="topVisibleReverse";return e&&(c.debug("Adding callback for top visible reverse",e),b.onTopVisibleReverse=e),o.topVisible?b.once||c.remove.occurred(s):c.get.occurred("topVisible")&&c.execute(t,s),e===n?!o.topVisible:void 0},bottomVisibleReverse:function(e){var o=c.get.elementCalculations(),t=e||b.onBottomVisibleReverse,s="bottomVisibleReverse";return e&&(c.debug("Adding callback for bottom visible reverse",e),b.onBottomVisibleReverse=e),o.bottomVisible?b.once||c.remove.occurred(s):c.get.occurred("bottomVisible")&&c.execute(t,s),e===n?!o.bottomVisible:void 0},topPassedReverse:function(e){var o=c.get.elementCalculations(),t=e||b.onTopPassedReverse,s="topPassedReverse";return e&&(c.debug("Adding callback for top passed reverse",e),b.onTopPassedReverse=e),o.topPassed?b.once||c.remove.occurred(s):c.get.occurred("topPassed")&&c.execute(t,s),e===n?!o.onTopPassed:void 0},bottomPassedReverse:function(e){var o=c.get.elementCalculations(),t=e||b.onBottomPassedReverse,s="bottomPassedReverse";return e&&(c.debug("Adding callback for bottom passed reverse",e),b.onBottomPassedReverse=e),o.bottomPassed?b.once||c.remove.occurred(s):c.get.occurred("bottomPassed")&&c.execute(t,s),e===n?!o.bottomPassed:void 0},execute:function(o,t){var n=c.get.elementCalculations(),s=c.get.screenCalculations();o=o||!1,o&&(b.continuous?(c.debug("Callback being called continuously",t,n),e.proxy(o,C)(n,s)):c.get.occurred(t)||(c.debug("Conditions met",t,n),e.proxy(o,C)(n,s))),c.save.occurred(t)},remove:{occurred:function(e){e?c.cache.occurred[e]!==n&&c.cache.occurred[e]===!0&&(c.debug("Callback can now be called again",e),c.cache.occurred[e]=!1):c.cache.occurred={}}},save:{calculations:function(){c.verbose("Saving all calculations necessary to determine positioning"),c.save.scroll(),c.save.direction(),c.save.screenCalculations(),c.save.elementCalculations()},occurred:function(e){e&&(c.cache.occurred[e]===n||c.cache.occurred[e]!==!0)&&(c.verbose("Saving callback occurred",e),c.cache.occurred[e]=!0)},scroll:function(){c.cache.scroll=x.scrollTop()+b.offset},direction:function(){var e,o=c.get.scroll(),t=c.get.lastScroll();return e=o>t&&t?"down":t>o&&t?"up":"static",c.cache.direction=e,c.cache.direction},elementPosition:function(){var o=c.get.screenSize();return c.verbose("Saving element position"),e.extend(c.cache.element,{margin:{top:parseInt(V.css("margin-top"),10),bottom:parseInt(V.css("margin-bottom"),10)},fits:C.height<o.height,offset:V.offset(),width:V.outerWidth(),height:V.outerHeight()}),c.cache.element},elementCalculations:function(){var o=c.get.screenCalculations(),t=c.get.elementPosition();b.includeMargin?e.extend(c.cache.element,{top:t.offset.top-t.margin.top,bottom:t.offset.top+t.height+t.margin.bottom}):e.extend(c.cache.element,{top:t.offset.top,bottom:t.offset.top+t.height}),e.extend(c.cache.element,{topVisible:o.bottom>=t.top,topPassed:o.top>=t.top,bottomVisible:o.bottom>=t.bottom,bottomPassed:o.top>=t.bottom,pixelsPassed:0,percentagePassed:0}),e.extend(c.cache.element,{visible:c.cache.element.topVisible||c.cache.element.bottomVisible,passing:c.cache.element.topPassed&&!c.cache.element.bottomPassed,hidden:!c.cache.element.topVisible&&!c.cache.element.bottomVisible}),c.cache.element.passing&&(c.cache.element.pixelsPassed=o.top-t.top,c.cache.element.percentagePassed=(o.top-t.top)/t.height),c.verbose("Updated element calculations",c.cache.element)},screenCalculations:function(){var o=x.scrollTop()+b.offset;return c.cache.scroll===n&&(c.cache.scroll=x.scrollTop()+b.offset),c.save.direction(),e.extend(c.cache.screen,{top:o,bottom:o+c.cache.screen.height}),c.cache.screen},screenSize:function(){c.verbose("Saving window position"),c.cache.screen={height:x.height()}},position:function(){c.save.screenSize(),c.save.elementPosition()}},get:{pixelsPassed:function(e){var o=c.get.elementCalculations();return e.search("%")>-1?o.height*(parseInt(e,10)/100):parseInt(e,10)},occurred:function(e){return c.cache.occurred!==n?c.cache.occurred[e]||!1:!1},direction:function(){return c.cache.direction===n&&c.save.direction(),c.cache.direction},elementPosition:function(){return c.cache.element===n&&c.save.elementPosition(),c.cache.element},elementCalculations:function(){return c.cache.element===n&&c.save.elementCalculations(),c.cache.element},screenCalculations:function(){return c.cache.screen===n&&c.save.screenCalculations(),c.cache.screen},screenSize:function(){return c.cache.screen===n&&c.save.screenSize(),c.cache.screen},scroll:function(){return c.cache.scroll===n&&c.save.scroll(),c.cache.scroll},lastScroll:function(){return c.cache.screen===n?(c.debug("First scroll event, no last scroll could be found"),!1):c.cache.screen.top}},setting:function(o,t){if(e.isPlainObject(o))e.extend(!0,b,o);else{if(t===n)return b[o];b[o]=t}},internal:function(o,t){if(e.isPlainObject(o))e.extend(!0,c,o);else{if(t===n)return c[o];c[o]=t}},debug:function(){b.debug&&(b.performance?c.performance.log(arguments):(c.debug=Function.prototype.bind.call(console.info,console,b.name+":"),c.debug.apply(console,arguments)))},verbose:function(){b.verbose&&b.debug&&(b.performance?c.performance.log(arguments):(c.verbose=Function.prototype.bind.call(console.info,console,b.name+":"),c.verbose.apply(console,arguments)))},error:function(){c.error=Function.prototype.bind.call(console.error,console,b.name+":"),c.error.apply(console,arguments)},performance:{log:function(e){var o,t,n;b.performance&&(o=(new Date).getTime(),n=a||o,t=o-n,a=o,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:C,"Execution Time":t})),clearTimeout(c.performance.timer),c.performance.timer=setTimeout(c.performance.display,100)},display:function(){var o=b.name+":",t=0;a=!1,clearTimeout(c.performance.timer),e.each(l,function(e,o){t+=o["Execution Time"]}),o+=" "+t+"ms",r&&(o+=" '"+r+"'"),(console.group!==n||console.table!==n)&&l.length>0&&(console.groupCollapsed(o),console.table?console.table(l):e.each(l,function(e,o){console.log(o.Name+": "+o["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(o,t,s){var r,a,l,u=y;return t=t||m,s=C||s,"string"==typeof o&&u!==n&&(o=o.split(/[\. ]/),r=o.length-1,e.each(o,function(t,s){var i=t!=r?s+o[t+1].charAt(0).toUpperCase()+o[t+1].slice(1):o;if(e.isPlainObject(u[i])&&t!=r)u=u[i];else{if(u[i]!==n)return a=u[i],!1;if(!e.isPlainObject(u[s])||t==r)return u[s]!==n?(a=u[s],!1):(c.error(f.method,o),!1);u=u[s]}})),e.isFunction(a)?l=a.apply(s,t):a!==n&&(l=a),e.isArray(i)?i.push(l):i!==n?i=[i,l]:l!==n&&(i=l),a}},d?(y===n&&c.initialize(),c.invoke(u)):(y!==n&&c.destroy(),c.initialize())}),i!==n?i:this},e.fn.visibility.settings={name:"Visibility",namespace:"visibility",className:{fixed:"fixed"},debug:!1,verbose:!1,performance:!0,offset:0,includeMargin:!1,context:o,throttle:!1,type:!1,transition:!1,duration:500,onPassed:{},onPassing:!1,onTopVisible:!1,onBottomVisible:!1,onTopPassed:!1,onBottomPassed:!1,onPassingReverse:!1,onTopVisibleReverse:!1,onBottomVisibleReverse:!1,onTopPassedReverse:!1,onBottomPassedReverse:!1,once:!0,continuous:!1,onRefresh:function(){},onScroll:function(){},error:{method:"The method you called is not defined."}}}(jQuery,window,document);
/*
 * # Semantic - Visit
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.visit = $.fn.visit = function(parameters) {
  var
    $allModules     = $.isFunction(this)
        ? $(window)
        : $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.visit.settings, parameters),

        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),
        $displays       = $(),

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;
      module = {

        initialize: function() {
          if(settings.count) {
            module.store(settings.key.count, settings.count);
          }
          else if(settings.id) {
            module.add.id(settings.id);
          }
          else if(settings.increment && methodInvoked !== 'increment') {
            module.increment();
          }
          module.add.display($module);
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of visit module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying instance');
          $module
            .removeData(moduleNamespace)
          ;
        },

        increment: function(id) {
          var
            currentValue = module.get.count(),
            newValue     = +(currentValue) + 1
          ;
          if(id) {
            module.add.id(id);
          }
          else {
            if(newValue > settings.limit && !settings.surpass) {
              newValue = settings.limit;
            }
            module.debug('Incrementing visits', newValue);
            module.store(settings.key.count, newValue);
          }
        },

        decrement: function(id) {
          var
            currentValue = module.get.count(),
            newValue     = +(currentValue) - 1
          ;
          if(id) {
            module.remove.id(id);
          }
          else {
            module.debug('Removing visit');
            module.store(settings.key.count, newValue);
          }
        },

        get: {
          count: function() {
            return +(module.retrieve(settings.key.count)) || 0;
          },
          idCount: function(ids) {
            ids = ids || module.get.ids();
            return ids.length;
          },
          ids: function(delimitedIDs) {
            var
              idArray = []
            ;
            delimitedIDs = delimitedIDs || module.retrieve(settings.key.ids);
            if(typeof delimitedIDs === 'string') {
              idArray = delimitedIDs.split(settings.delimiter);
            }
            module.verbose('Found visited ID list', idArray);
            return idArray;
          },
          storageOptions: function(data) {
            var
              options = {}
            ;
            if(settings.expires) {
              options.expires = settings.expires;
            }
            if(settings.domain) {
              options.domain = settings.domain;
            }
            if(settings.path) {
              options.path = settings.path;
            }
            return options;
          }
        },

        has: {
          visited: function(id, ids) {
            var
              visited = false
            ;
            ids = ids || module.get.ids();
            if(id !== undefined && ids) {
              $.each(ids, function(index, value){
                if(value == id) {
                  visited = true;
                }
              });
            }
            return visited;
          }
        },

        set: {
          count: function(value) {
            module.store(settings.key.count, value);
          },
          ids: function(value) {
            module.store(settings.key.ids, value);
          }
        },

        reset: function() {
          module.store(settings.key.count, 0);
          module.store(settings.key.ids, null);
        },

        add: {
          id: function(id) {
            var
              currentIDs = module.retrieve(settings.key.ids),
              newIDs = (currentIDs === undefined || currentIDs === '')
                ? id
                : currentIDs + settings.delimiter + id
            ;
            if( module.has.visited(id) ) {
              module.debug('Unique content already visited, not adding visit', id, currentIDs);
            }
            else if(id === undefined) {
              module.debug('ID is not defined');
            }
            else {
              module.debug('Adding visit to unique content', id);
              module.store(settings.key.ids, newIDs);
            }
            module.set.count( module.get.idCount() );
          },
          display: function(selector) {
            var
              $element = $(selector)
            ;
            if($element.size() > 0 && !$.isWindow($element[0])) {
              module.debug('Updating visit count for element', $element);
              $displays = ($displays.size() > 0)
                ? $displays.add($element)
                : $element
              ;
            }
          }
        },

        remove: {
          id: function(id) {
            var
              currentIDs = module.get.ids(),
              newIDs     = []
            ;
            if(id !== undefined && currentIDs !== undefined) {
              module.debug('Removing visit to unique content', id, currentIDs);
              $.each(currentIDs, function(index, value){
                if(value !== id) {
                  newIDs.push(value);
                }
              });
              newIDs = newIDs.join(settings.delimiter);
              module.store(settings.key.ids, newIDs );
            }
            module.set.count( module.get.idCount() );
          }
        },

        check: {
          limit: function(value) {
            value = value || module.get.count();
            if(settings.limit) {
              if(value >= settings.limit) {
                module.debug('Pages viewed exceeded limit, firing callback', value, settings.limit);
                $.proxy(settings.onLimit, element)(value);
              }
              module.debug('Limit not reached', value, settings.limit);
              $.proxy(settings.onChange, element)(value);
            }
            module.update.display(value);
          }
        },

        update: {
          display: function(value) {
            value = value || module.get.count();
            if($displays.size() > 0) {
              module.debug('Updating displayed view count', $displays);
              $displays.html(value);
            }
          }
        },

        store: function(key, value) {
          var
            options = module.get.storageOptions(value)
          ;
          if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
            window.localStorage.setItem(key, value);
            module.debug('Value stored using local storage', key, value);
          }
          else if($.cookie !== undefined) {
            $.cookie(key, value, options);
            module.debug('Value stored using cookie', key, value, options);
          }
          else {
            module.error(error.noCookieStorage);
            return;
          }
          if(key == settings.key.count) {
            module.check.limit(value);
          }
        },
        retrieve: function(key, value) {
          var
            storedValue
          ;
          if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
            storedValue = window.localStorage.getItem(key);
          }
          // get by cookie
          else if($.cookie !== undefined) {
            storedValue = $.cookie(key);
          }
          else {
            module.error(error.noCookieStorage);
          }
          if(storedValue == 'undefined' || storedValue == 'null' || storedValue === undefined || storedValue === null) {
            storedValue = undefined;
          }
          return storedValue;
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          module.debug('Changing internal', name, value);
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.visit.settings = {

  name          : 'Visit',

  debug         : false,
  verbose       : true,
  performance   : true,

  namespace     : 'visit',

  increment     : false,
  surpass       : false,
  count         : false,
  limit         : false,

  delimiter     : '&',
  storageMethod : 'localstorage',

  key           : {
    count : 'visit-count',
    ids   : 'visit-ids'
  },

  expires       : 30,
  domain        : false,
  path          : '/',

  onLimit       : function() {},
  onChange      : function() {},

  error         : {
    method          : 'The method you called is not defined',
    missingPersist  : 'Using the persist setting requires the inclusion of PersistJS',
    noCookieStorage : 'The default storage cookie requires $.cookie to be included.'
  }

};

})( jQuery, window , document );

 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
!function(e,t,i,n){e.visit=e.fn.visit=function(i){var o,r=e(e.isFunction(this)?t:this),s=r.selector||"",a=(new Date).getTime(),c=[],u=arguments[0],d="string"==typeof u,l=[].slice.call(arguments,1);return r.each(function(){var g,m=e.extend(!0,{},e.fn.visit.settings,i),f=m.error,p=m.namespace,v=p+"-module",h=e(this),y=e(),b=this,k=h.data(v);g={initialize:function(){m.count?g.store(m.key.count,m.count):m.id?g.add.id(m.id):m.increment&&"increment"!==d&&g.increment(),g.add.display(h),g.instantiate()},instantiate:function(){g.verbose("Storing instance of visit module",g),k=g,h.data(v,g)},destroy:function(){g.verbose("Destroying instance"),h.removeData(v)},increment:function(e){var t=g.get.count(),i=+t+1;e?g.add.id(e):(i>m.limit&&!m.surpass&&(i=m.limit),g.debug("Incrementing visits",i),g.store(m.key.count,i))},decrement:function(e){var t=g.get.count(),i=+t-1;e?g.remove.id(e):(g.debug("Removing visit"),g.store(m.key.count,i))},get:{count:function(){return+g.retrieve(m.key.count)||0},idCount:function(e){return e=e||g.get.ids(),e.length},ids:function(e){var t=[];return e=e||g.retrieve(m.key.ids),"string"==typeof e&&(t=e.split(m.delimiter)),g.verbose("Found visited ID list",t),t},storageOptions:function(){var e={};return m.expires&&(e.expires=m.expires),m.domain&&(e.domain=m.domain),m.path&&(e.path=m.path),e}},has:{visited:function(t,i){var o=!1;return i=i||g.get.ids(),t!==n&&i&&e.each(i,function(e,i){i==t&&(o=!0)}),o}},set:{count:function(e){g.store(m.key.count,e)},ids:function(e){g.store(m.key.ids,e)}},reset:function(){g.store(m.key.count,0),g.store(m.key.ids,null)},add:{id:function(e){var t=g.retrieve(m.key.ids),i=t===n||""===t?e:t+m.delimiter+e;g.has.visited(e)?g.debug("Unique content already visited, not adding visit",e,t):e===n?g.debug("ID is not defined"):(g.debug("Adding visit to unique content",e),g.store(m.key.ids,i)),g.set.count(g.get.idCount())},display:function(t){var i=e(t);i.size()>0&&!e.isWindow(i[0])&&(g.debug("Updating visit count for element",i),y=y.size()>0?y.add(i):i)}},remove:{id:function(t){var i=g.get.ids(),o=[];t!==n&&i!==n&&(g.debug("Removing visit to unique content",t,i),e.each(i,function(e,i){i!==t&&o.push(i)}),o=o.join(m.delimiter),g.store(m.key.ids,o)),g.set.count(g.get.idCount())}},check:{limit:function(t){t=t||g.get.count(),m.limit&&(t>=m.limit&&(g.debug("Pages viewed exceeded limit, firing callback",t,m.limit),e.proxy(m.onLimit,b)(t)),g.debug("Limit not reached",t,m.limit),e.proxy(m.onChange,b)(t)),g.update.display(t)}},update:{display:function(e){e=e||g.get.count(),y.size()>0&&(g.debug("Updating displayed view count",y),y.html(e))}},store:function(i,o){var r=g.get.storageOptions(o);if("localstorage"==m.storageMethod&&t.localStorage!==n)t.localStorage.setItem(i,o),g.debug("Value stored using local storage",i,o);else{if(e.cookie===n)return void g.error(f.noCookieStorage);e.cookie(i,o,r),g.debug("Value stored using cookie",i,o,r)}i==m.key.count&&g.check.limit(o)},retrieve:function(i){var o;return"localstorage"==m.storageMethod&&t.localStorage!==n?o=t.localStorage.getItem(i):e.cookie!==n?o=e.cookie(i):g.error(f.noCookieStorage),("undefined"==o||"null"==o||o===n||null===o)&&(o=n),o},setting:function(t,i){if(e.isPlainObject(t))e.extend(!0,m,t);else{if(i===n)return m[t];m[t]=i}},internal:function(t,i){return g.debug("Changing internal",t,i),i===n?g[t]:void(e.isPlainObject(t)?e.extend(!0,g,t):g[t]=i)},debug:function(){m.debug&&(m.performance?g.performance.log(arguments):(g.debug=Function.prototype.bind.call(console.info,console,m.name+":"),g.debug.apply(console,arguments)))},verbose:function(){m.verbose&&m.debug&&(m.performance?g.performance.log(arguments):(g.verbose=Function.prototype.bind.call(console.info,console,m.name+":"),g.verbose.apply(console,arguments)))},error:function(){g.error=Function.prototype.bind.call(console.error,console,m.name+":"),g.error.apply(console,arguments)},performance:{log:function(e){var t,i,n;m.performance&&(t=(new Date).getTime(),n=a||t,i=t-n,a=t,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:b,"Execution Time":i})),clearTimeout(g.performance.timer),g.performance.timer=setTimeout(g.performance.display,100)},display:function(){var t=m.name+":",i=0;a=!1,clearTimeout(g.performance.timer),e.each(c,function(e,t){i+=t["Execution Time"]}),t+=" "+i+"ms",s&&(t+=" '"+s+"'"),r.size()>1&&(t+=" ("+r.size()+")"),(console.group!==n||console.table!==n)&&c.length>0&&(console.groupCollapsed(t),console.table?console.table(c):e.each(c,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(t,i,r){var s,a,c,u=k;return i=i||l,r=b||r,"string"==typeof t&&u!==n&&(t=t.split(/[\. ]/),s=t.length-1,e.each(t,function(i,o){var r=i!=s?o+t[i+1].charAt(0).toUpperCase()+t[i+1].slice(1):t;if(e.isPlainObject(u[r])&&i!=s)u=u[r];else{if(u[r]!==n)return a=u[r],!1;if(!e.isPlainObject(u[o])||i==s)return u[o]!==n?(a=u[o],!1):!1;u=u[o]}})),e.isFunction(a)?c=a.apply(r,i):a!==n&&(c=a),e.isArray(o)?o.push(c):o!==n?o=[o,c]:c!==n&&(o=c),a}},d?(k===n&&g.initialize(),g.invoke(u)):(k!==n&&g.destroy(),g.initialize())}),o!==n?o:this},e.fn.visit.settings={name:"Visit",debug:!1,verbose:!0,performance:!0,namespace:"visit",increment:!1,surpass:!1,count:!1,limit:!1,delimiter:"&",storageMethod:"localstorage",key:{count:"visit-count",ids:"visit-ids"},expires:30,domain:!1,path:"/",onLimit:function(){},onChange:function(){},error:{method:"The method you called is not defined",missingPersist:"Using the persist setting requires the inclusion of PersistJS",noCookieStorage:"The default storage cookie requires $.cookie to be included."}}}(jQuery,window,document);