/*
 * # Semantic UI - Calendar
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2015 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 */

;
(function ($, window, document, undefined) {

  $.fn.calendar = function (parameters) {

    var
      $allModules = $(this),

      moduleSelector = $allModules.selector || '',

      time = new Date().getTime(),
      performance = [],

      query = arguments[0],
      methodInvoked = (typeof query == 'string'),
      queryArguments = [].slice.call(arguments, 1),
      returnedValue
      ;

    $allModules
      .each(function () {
        var
          settings = ( $.isPlainObject(parameters) )
            ? $.extend(true, {}, $.fn.calendar.settings, parameters)
            : $.extend({}, $.fn.calendar.settings),

          className = settings.className,
          namespace = settings.namespace,
          selector = settings.selector,
          formatter = settings.formatter,
          parser = settings.parser,
          metadata = settings.metadata,
          error = settings.error,

          eventNamespace = '.' + namespace,
          moduleNamespace = 'module-' + namespace,

          $module = $(this),
          $input = $module.find(selector.input),
          $container = $module.find(selector.popup),
          $activator = $module.find(selector.activator),

          element = this,
          instance = $module.data(moduleNamespace),

          isTouch,
          module
          ;

        module = {

          initialize: function () {
            module.debug('Initializing calendar for', element);

            isTouch = module.get.isTouch();
            if (settings.inline) {
              module.setup.inline();
            } else {
              module.setup.popup();
            }
            module.setup.input();
            module.create.calendar();

            module.bind.events();
            module.instantiate();
          },

          instantiate: function () {
            module.verbose('Storing instance of calendar');
            instance = module;
            $module.data(moduleNamespace, instance);
          },

          destroy: function () {
            module.verbose('Destroying previous calendar for', element);
            $module.removeData(moduleNamespace);
            $module.unbind.events();
          },

          setup: {
            popup: function () {
              if ($.fn.popup === undefined) {
                module.error(error.popup);
                return;
              }
              if (!$activator.length) {
                $activator = $module.children().first();
                if (!$activator.length) {
                  module.error(error.activator);
                  return;
                }
              }
              if (!$container.length) {
                //prepend the popup element to the activator's parent so that it has less chance of messing with
                //the styling (eg input action button needs to be the last child to have correct border radius)
                $container = $('<div/>').addClass(className.popup).prependTo($activator.parent());
              }
              $container.addClass(className.calendar);
              var onVisible = settings.onVisible;
              var onHidden = settings.onHidden;
              if (!$input.length) {
                //no input, $container has to handle focus/blur
                $container.attr('tabindex', '0');
                onVisible = function () {
                  $container.focus();
                  return settings.onVisible.apply($container, arguments);
                };
                onHidden = function () {
                  $container.blur();
                  return settings.onHidden.apply($container, arguments);
                };
              }
              var onShow = function () {
                //reset the focus date onShow
                module.set.focusDate(module.get.date());
                return settings.onShow.apply($container, arguments);
              };
              var options = $.extend({}, settings.popupOptions, {
                popup: $container,
                on: settings.on,
                hoverable: settings.on === 'hover',
                onShow: onShow,
                onVisible: onVisible,
                onHide: settings.onHide,
                onHidden: onHidden
              });
              module.popup(options);
            },
            inline: function () {
              $container = $('<div/>').addClass(className.calendar).appendTo($module);
              if (!$input.length) {
                $container.attr('tabindex', '0');
              }
            },
            input: function () {
              if (settings.touchReadonly && $input.length && isTouch) {
                $input.prop('readonly', true);
              }
            }
          },

          create: {
            calendar: function () {
              var today = new Date();
              var date = module.get.date();
              var focusDate = module.get.focusDate();
              var display = focusDate || date || settings.startDate || today;
              if (!focusDate) {
                focusDate = display;
              }

              var month = display.getMonth();
              var year = display.getFullYear();
              var first = new Date(year, month, 1);
              var last = new Date(year, month + 1, 0);
              var previousFirst = new Date(year, month - 1, 1);
              var previousLast = new Date(year, month, 0);
              var nextFirst = new Date(year, month + 1, 1);
              var columnOfFirst = (first.getDay() - settings.firstDayOfWeek % 7 + 7) % 7;
              var requiredCells = settings.constantHeight ? 7 * 6 : last.getDate() + columnOfFirst;
              var requiredRows = Math.ceil(requiredCells / 7);

              $container.empty();

              var table = $('<table/>').addClass(className.table).appendTo($container);
              var thead = $('<thead/>').appendTo(table);

              var monthHeaderRow = $('<tr/>').appendTo(thead);
              var prevMonth = $('<th/>').addClass(className.prev).appendTo(monthHeaderRow);
              prevMonth.data('date', previousFirst);
              prevMonth.toggleClass(className.disabledCell, !module.helper.isDateInRange(previousLast));
              $('<i/>').addClass(className.prevIcon).appendTo(prevMonth);
              var monthHeader = $('<th/>').attr('colspan', '5').appendTo(monthHeaderRow);
              monthHeader.text(formatter.header(display, settings));
              var nextMonth = $('<th/>').addClass(className.next).appendTo(monthHeaderRow);
              nextMonth.data('date', nextFirst);
              nextMonth.toggleClass(className.disabledCell, !module.helper.isDateInRange(nextFirst));
              $('<i/>').addClass(className.nextIcon).appendTo(nextMonth);

              var dayHeaderRow = $('<tr/>').appendTo(thead);
              for (var i = 0; i < 7; i++) {
                var dayHeader = $('<th/>').appendTo(dayHeaderRow);
                dayHeader.text(formatter.columnHeader((i + settings.firstDayOfWeek) % 7, settings));
              }

              var day = 1 - columnOfFirst;
              var tbody = $('<tbody/>').appendTo(table);
              for (var r = 0; r < requiredRows; r++) {
                var row = $('<tr/>').appendTo(tbody);
                for (var c = 0; c < 7; c++, day++) {
                  var cell = $('<td/>').addClass(className.cell).appendTo(row);
                  var cellDate = new Date(year, month, day);
                  cell.text(cellDate.getDate());
                  var disabled = cellDate.getMonth() !== month || !module.helper.isDateInRange(cellDate);
                  cell.toggleClass(className.disabledCell, disabled);
                  cell.toggleClass(className.todayCell, module.helper.dateEqual(cellDate, today));
                  cell.toggleClass(className.activeCell, module.helper.dateEqual(cellDate, date));
                  cell.toggleClass(className.focusCell, !isTouch && module.helper.dateEqual(cellDate, focusDate));
                  cell.data('date', cellDate);
                }
              }

              if (settings.today) {
                var todayRow = $('<tr/>').appendTo(tbody);
                var todayButton = $('<td/>').attr('colspan', '7').addClass(className.today).appendTo(todayRow);
                todayButton.text(formatter.today(settings));
                todayButton.data('date', today);
              }
            }
          },

          refresh: function () {
            module.create.calendar();
          },

          bind: {
            events: function () {
              $container.on('click' + eventNamespace, module.event.click);
              $container.on('mousedown' + eventNamespace, module.event.mousedown);
              if ($input.length) {
                $input.on('input' + eventNamespace, module.event.inputChange);
                $input.on('focus' + eventNamespace, module.event.inputFocus);
                $input.on('blur' + eventNamespace, module.event.inputBlur);
                $input.on('keydown' + eventNamespace, module.event.keydown);
              } else {
                $container.on('keydown' + eventNamespace, module.event.keydown);
              }
            }
          },

          unbind: {
            events: function () {
              $container.off(eventNamespace);
              if ($input.length) {
                $input.off(eventNamespace);
              }
            }
          },

          event: {
            click: function (event) {
              if ($input.length) {
                //ensure input has focus so that it receives keydown events for calendar navigation
                $input.focus();
              }
              event.preventDefault();
              event.stopPropagation();
              var target = $(event.target);
              if (target.parent().data('date')) {
                target = target.parent();
              }
              var date = target.data('date');
              if (!date) {
                return;
              }
              if (target.hasClass(className.prev) || target.hasClass(className.next)) {
                module.set.focusDate(date);
              } else {
                module.set.date(date);
                if (settings.closable) {
                  module.popup('hide');
                }
              }
            },
            mousedown: function (event) {
              if ($input.length) {
                //prevent the mousedown on the calendar causing the input to lose focus
                event.preventDefault();
              }
            },
            keydown: function (event) {
              if (event.keyCode === 27 || event.keyCode === 9) {
                //esc || tab
                module.popup('hide');
              }

              if (module.popup('is visible')) {
                if (event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40) {
                  //arrow keys
                  var increment = event.keyCode === 37 ? -1 : event.keyCode === 38 ? -7 : event.keyCode == 39 ? 1 : 7;
                  var focusDate = module.get.focusDate();
                  if (!focusDate) {
                    focusDate = module.get.date() || new Date();
                  }
                  focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth(), focusDate.getDate() + increment);
                  module.set.focusDate(focusDate);
                } else if (event.keyCode === 13) {
                  //enter
                  var date = module.get.focusDate();
                  if (date) {
                    module.set.date(date);
                    if (settings.closable) {
                      module.popup('hide');
                    }
                  }
                }
              }

              if (event.keyCode === 38 || event.keyCode === 40) {
                //arrow-up || arrow-down
                event.preventDefault(); //don't scroll
                module.popup('show');
              }
            },
            inputChange: function () {
              var val = $input.val();
              var date = parser.date(val, settings);
              if (date) {
                module.set.date(date, false);
              }
            },
            inputFocus: function () {
              module.popup('show');
              $container.addClass(className.active);
            },
            inputBlur: function () {
              var date = module.get.date();
              var text = formatter.date(date, settings);
              $input.val(text);
              $container.removeClass(className.active);
            }
          },

          get: {
            date: function () {
              return $module.data(metadata.date);
            },
            focusDate: function () {
              return $module.data(metadata.focusDate);
            },
            isTouch: function () {
              try {
                document.createEvent("TouchEvent");
                return true;
              }
              catch (e) {
                return false;
              }
            }
          },

          set: {
            date: function (date, updateInput) {
              date = module.helper.sanitiseDate(date);
              date = module.helper.dateInRange(date);
              updateInput = updateInput !== false;

              var text = formatter.date(date, settings);
              if (settings.onChange.call(element, date, text) === false) {
                return;
              }

              $module.data(metadata.date, date);
              module.set.focusDate(date); //also updates calendar

              if (updateInput && $input.length) {
                $input.val(text);
              }
            },
            focusDate: function (date) {
              date = module.helper.sanitiseDate(date);
              date = module.helper.dateInRange(date);
              $module.data(metadata.focusDate, date);
              module.create.calendar();
            }
          },

          changeDate: function (date) {
            module.set.date(date);
          },

          popup: function () {
            return $activator.popup.apply($activator, arguments);
          },

          helper: {
            sanitiseDate: function (date) {
              if (!date) {
                return undefined;
              }
              if (!(date instanceof Date)) {
                date = parser.date('' + date);
              }
              if (isNaN(date)) {
                return undefined;
              }
              return date;
            },
            dateEqual: function (date1, date2) {
              //ignore time component of dates
              return !!date1 && !!date2 &&
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate();
            },
            dateDiff: function (date1, date2) {
              //create new dates so that times aren't considered
              return new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime() -
                new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime();
            },
            dateInRange: function (date) {
              return !date ? date :
                (settings.minDate && module.helper.dateDiff(date, settings.minDate) > 0) ? settings.minDate :
                  (settings.maxDate && module.helper.dateDiff(settings.maxDate, date) > 0) ? settings.maxDate :
                    date;
            },
            isDateInRange: function (date) {
              return !(!date ||
              (settings.minDate && module.helper.dateDiff(date, settings.minDate) > 0) ||
              (settings.maxDate && module.helper.dateDiff(settings.maxDate, date) > 0));
            }
          },

          setting: function (name, value) {
            module.debug('Changing setting', name, value);
            if ($.isPlainObject(name)) {
              $.extend(true, settings, name);
            }
            else if (value !== undefined) {
              settings[name] = value;
            }
            else {
              return settings[name];
            }
          },
          internal: function (name, value) {
            if ($.isPlainObject(name)) {
              $.extend(true, module, name);
            }
            else if (value !== undefined) {
              module[name] = value;
            }
            else {
              return module[name];
            }
          },
          debug: function () {
            if (settings.debug) {
              if (settings.performance) {
                module.performance.log(arguments);
              }
              else {
                module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
                module.debug.apply(console, arguments);
              }
            }
          },
          verbose: function () {
            if (settings.verbose && settings.debug) {
              if (settings.performance) {
                module.performance.log(arguments);
              }
              else {
                module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
                module.verbose.apply(console, arguments);
              }
            }
          },
          error: function () {
            module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
            module.error.apply(console, arguments);
          },
          performance: {
            log: function (message) {
              var
                currentTime,
                executionTime,
                previousTime
                ;
              if (settings.performance) {
                currentTime = new Date().getTime();
                previousTime = time || currentTime;
                executionTime = currentTime - previousTime;
                time = currentTime;
                performance.push({
                  'Name': message[0],
                  'Arguments': [].slice.call(message, 1) || '',
                  'Element': element,
                  'Execution Time': executionTime
                });
              }
              clearTimeout(module.performance.timer);
              module.performance.timer = setTimeout(module.performance.display, 500);
            },
            display: function () {
              var
                title = settings.name + ':',
                totalTime = 0
                ;
              time = false;
              clearTimeout(module.performance.timer);
              $.each(performance, function (index, data) {
                totalTime += data['Execution Time'];
              });
              title += ' ' + totalTime + 'ms';
              if (moduleSelector) {
                title += ' \'' + moduleSelector + '\'';
              }
              if ((console.group !== undefined || console.table !== undefined) && performance.length > 0) {
                console.groupCollapsed(title);
                if (console.table) {
                  console.table(performance);
                }
                else {
                  $.each(performance, function (index, data) {
                    console.log(data['Name'] + ': ' + data['Execution Time'] + 'ms');
                  });
                }
                console.groupEnd();
              }
              performance = [];
            }
          },
          invoke: function (query, passedArguments, context) {
            var
              object = instance,
              maxDepth,
              found,
              response
              ;
            passedArguments = passedArguments || queryArguments;
            context = element || context;
            if (typeof query == 'string' && object !== undefined) {
              query = query.split(/[\. ]/);
              maxDepth = query.length - 1;
              $.each(query, function (depth, value) {
                var camelCaseValue = (depth != maxDepth)
                    ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                    : query
                  ;
                if ($.isPlainObject(object[camelCaseValue]) && (depth != maxDepth)) {
                  object = object[camelCaseValue];
                }
                else if (object[camelCaseValue] !== undefined) {
                  found = object[camelCaseValue];
                  return false;
                }
                else if ($.isPlainObject(object[value]) && (depth != maxDepth)) {
                  object = object[value];
                }
                else if (object[value] !== undefined) {
                  found = object[value];
                  return false;
                }
                else {
                  module.error(error.method, query);
                  return false;
                }
              });
            }
            if ($.isFunction(found)) {
              response = found.apply(context, passedArguments);
            }
            else if (found !== undefined) {
              response = found;
            }
            if ($.isArray(returnedValue)) {
              returnedValue.push(response);
            }
            else if (returnedValue !== undefined) {
              returnedValue = [returnedValue, response];
            }
            else if (response !== undefined) {
              returnedValue = response;
            }
            return found;
          }
        };

        if (methodInvoked) {
          if (instance === undefined) {
            module.initialize();
          }
          module.invoke(query);
        }
        else {
          if (instance !== undefined) {
            instance.invoke('destroy');
          }
          module.initialize();
        }
      })
    ;
    return (returnedValue !== undefined)
      ? returnedValue
      : $allModules
      ;
  };

  $.fn.calendar.settings = {

    name: 'Calendar',
    namespace: 'calendar',

    debug: false,
    verbose: false,
    performance: false,

    firstDayOfWeek: 0,    // day for first column (0 = Sunday)
    constantHeight: true, // add rows to shorter months to keep calendar height consistent (6 rows)
    today: false,         // show a 'today' button at the bottom of the calendar
    closable: true,       // close the popup after selecting a date
    monthFirst: true,     // month before day when parsing/converting date from/to text
    touchReadonly: true,  // set input to readonly on touch devices
    inline: false,        // create the calendar inline instead of inside a popup
    on: 'click',          // when to show the popup
    startDate: false,     // date/month to display initially when no date is selected (defaults to today)
    minDate: false,       // minimum date that can be selected, dates before are disabled
    maxDate: false,       // maximum date that can be selected, dates after are disabled

    // popup options ('popup', 'on', 'hoverable', and show/hide callbacks are overridden)
    popupOptions: {
      position: 'bottom left',
      lastResort: 'bottom left',
      prefer: 'opposite'
    },

    text: {
      days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      months: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
      today: 'Today'
    },

    formatter: {
      header: function (date, settings) {
        return settings.text.months[date.getMonth()] + ' ' + date.getFullYear();
      },
      columnHeader: function (day, settings) {
        return settings.text.days[day];
      },
      date: function (date, settings) {
        if (!date) {
          return '';
        }
        var day = date.getDate();
        var month = settings.text.months[date.getMonth()];
        var year = date.getFullYear();
        return (settings.monthFirst ? month + ' ' + day : day + ' ' + month) + ', ' + year;
      },
      today: function (settings) {
        return settings.text.today;
      }
    },

    parser: {
      date: function (text, settings) {
        if (!text) {
          return null;
        }
        text = ('' + text).trim();
        if (text.length === 0) {
          return null;
        }

        var day = -1, month = -1, year = -1;
        var parts = text.split(settings.regExp.dateDelimiter).slice(0, 3);
        var i, j, k;

        //textual month
        for (i = 0; i < parts.length; i++) {
          var part = parts[i];
          part = part.substring(0, Math.min(part.length, 3)).toLowerCase();
          for (j = 0; j < settings.text.months.length; j++) {
            var monthString = settings.text.months[j];
            monthString = monthString.substring(0, Math.min(part.length, Math.min(monthString.length, 3))).toLowerCase();
            if (monthString === part) {
              month = j + 1;
              break;
            }
          }
          if (month >= 0) {
            parts.splice(i, 1);
            break;
          }
        }

        //year > 31
        for (i = parts.length - 1; i >= 0; i--) {
          j = parseInt(parts[i]);
          if (isNaN(j)) {
            continue;
          }
          if (j > 31) {
            year = j;
            parts.splice(i, 1);
            break;
          }
        }

        //numeric month
        if (month < 0) {
          for (i = 0; i < parts.length; i++) {
            k = i > 1 || settings.monthFirst ? i : i === 1 ? 0 : 1;
            j = parseInt(parts[k]);
            if (isNaN(j)) {
              continue;
            }
            if (1 <= j && j <= 12) {
              month = j;
              parts.splice(k, 1);
              break;
            }
          }
        }

        //day
        for (i = 0; i < parts.length; i++) {
          j = parseInt(parts[i]);
          if (isNaN(j)) {
            continue;
          }
          if (1 <= j && j <= 31) {
            day = j;
            parts.splice(i, 1);
            break;
          }
        }

        //year <= 31
        if (year < 0) {
          for (i = parts.length - 1; i >= 0; i--) {
            j = parseInt(parts[i]);
            if (isNaN(j)) {
              continue;
            }
            if (j < 99) {
              j += 2000;
            }
            year = j;
            parts.splice(i, 1);
            break;
          }
        }

        if (day < 0 && month < 0 && year < 0) {
          return null;
        }

        if (day < 0) {
          day = 1;
        }
        if (month < 0) {
          month = 1;
        }
        if (year < 0) {
          year = new Date().getFullYear();
        }

        return new Date(year, month - 1, day);
      }
    },

    // callback when date changes, return false to cancel the change
    onChange: function (date, text) {
      return true;
    },

    // callback before show animation, return false to prevent show
    onShow: function () {
    },

    // callback after show animation
    onVisible: function () {
    },

    // callback before hide animation, return false to prevent hide
    onHide: function () {
    },

    // callback after hide animation
    onHidden: function () {
    },

    selector: {
      popup: '.ui.popup',
      input: 'input',
      activator: 'input'
    },

    regExp: {
      dateDelimiter: /[^\w\d]+/g
    },

    error: {
      popup: 'UI Popup, a required component is not included in this page',
      activator: 'No activator found for the calendar popup',
      method: 'The method you called is not defined.'
    },

    className: {
      calendar: 'calendar',
      active: 'active',
      popup: 'ui popup',
      table: 'ui seven column celled center aligned unstackable table',
      prev: 'prev link',
      next: 'next link',
      prevIcon: 'chevron left icon',
      nextIcon: 'chevron right icon',
      cell: 'link',
      disabledCell: 'disabled',
      activeCell: 'active',
      focusCell: 'focus',
      todayCell: 'today',
      today: 'link'
    },

    metadata: {
      date: 'date',
      focusDate: 'focusDate'
    }
  };

})(jQuery, window, document);
