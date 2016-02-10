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
          isTouchDown = false,
          focusDateUsedForRange = false,
          module
          ;

        module = {

          initialize: function () {
            module.debug('Initializing calendar for', element);

            isTouch = module.get.isTouch();
            module.setup.popup();
            module.setup.inline();
            module.setup.input();
            module.setup.date();
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
            module.unbind.events();
          },

          setup: {
            popup: function () {
              if (settings.inline) {
                return;
              }
              if (!$activator.length) {
                $activator = $module.children().first();
                if (!$activator.length) {
                  return;
                }
              }
              if ($.fn.popup === undefined) {
                module.error(error.popup);
                return;
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
                  module.focus();
                  return settings.onVisible.apply($container, arguments);
                };
                onHidden = function () {
                  module.blur();
                  return settings.onHidden.apply($container, arguments);
                };
              }
              var onShow = function () {
                //reset the focus date onShow
                module.set.focusDate(module.get.date());
                module.set.mode(settings.startMode);
                return settings.onShow.apply($container, arguments);
              };
              var on = settings.on || ($input.length ? 'focus' : 'click');
              var options = $.extend({}, settings.popupOptions, {
                popup: $container,
                on: on,
                hoverable: on === 'hover',
                onShow: onShow,
                onVisible: onVisible,
                onHide: settings.onHide,
                onHidden: onHidden
              });
              module.popup(options);
            },
            inline: function () {
              if ($activator.length && !settings.inline) {
                return;
              }
              $container = $('<div/>').addClass(className.calendar).appendTo($module);
              if (!$input.length) {
                $container.attr('tabindex', '0');
              }
            },
            input: function () {
              if (settings.touchReadonly && $input.length && isTouch) {
                $input.prop('readonly', true);
              }
            },
            date: function () {
              if ($input.length) {
                var val = $input.val();
                var date = parser.date(val, settings);
                module.set.date(date, settings.formatInput, false);
              }
            }
          },

          create: {
            calendar: function () {
              var i, r, c, row, cell;

              var mode = module.get.mode();
              var today = new Date();
              var date = module.get.date();
              var focusDate = module.get.focusDate();
              var display = focusDate || date || settings.initialDate || today;
              display = module.helper.dateInRange(display);

              if (!focusDate) {
                focusDate = display;
                module.set.focusDate(focusDate, false, false);
              }

              var minute = display.getMinutes();
              var hour = display.getHours();
              var day = display.getDate();
              var month = display.getMonth();
              var year = display.getFullYear();

              var isYear = mode === 'year';
              var isMonth = mode === 'month';
              var isDay = mode === 'day';
              var isHour = mode === 'hour';
              var isMinute = mode === 'minute';
              var isTimeOnly = settings.type === 'time';

              var columns = isDay ? 7 : isHour ? 4 : 3;
              var columnsString = columns === 7 ? 'seven' : columns === 4 ? 'four' : 'three';
              var rows = isDay || isHour ? 6 : 4;

              var firstMonthDayColumn = (new Date(year, month, 1).getDay() - settings.firstDayOfWeek % 7 + 7) % 7;
              if (!settings.constantHeight && isDay) {
                var requiredCells = new Date(year, month + 1, 0).getDate() + firstMonthDayColumn;
                rows = Math.ceil(requiredCells / 7);
              }

              var yearChange = isYear ? 10 : isMonth ? 1 : 0;
              var monthChange = isDay ? 1 : 0;
              var dayChange = isHour || isMinute ? 1 : 0;
              var prevNextDay = isHour || isMinute ? day : 1;
              var prevDate = new Date(year - yearChange, month - monthChange, prevNextDay - dayChange, hour);
              var nextDate = new Date(year + yearChange, month + monthChange, prevNextDay + dayChange, hour);

              var prevLast = isYear ? new Date(Math.ceil(year / 10) * 10 - 9, 0, 0) :
                isMonth ? new Date(year, 0, 0) : isDay ? new Date(year, month, 0) : new Date(year, month, day, -1);
              var nextFirst = isYear ? new Date(Math.ceil(year / 10) * 10 + 1, 0, 1) :
                isMonth ? new Date(year + 1, 0, 1) : isDay ? new Date(year, month + 1, 1) : new Date(year, month, day + 1);

              var table = $('<table/>').addClass(className.table).addClass(columnsString + ' column').addClass(mode);

              //no header for time-only mode
              if (!isTimeOnly) {
                var thead = $('<thead/>').appendTo(table);

                row = $('<tr/>').appendTo(thead);
                cell = $('<th/>').attr('colspan', '' + columns).appendTo(row);

                var headerText = $('<span/>').addClass(className.link).appendTo(cell);
                headerText.text(formatter.header(display, mode, settings));
                var newMode = isMonth ? (settings.disableYear ? 'day' : 'year') :
                  isDay ? (settings.disableMonth ? 'year' : 'month') : 'day';
                headerText.data(metadata.mode, newMode);

                var prev = $('<span/>').addClass(className.prev).appendTo(cell);
                prev.data(metadata.focusDate, prevDate);
                prev.toggleClass(className.disabledCell, !module.helper.isDateInRange(prevLast, mode));
                $('<i/>').addClass(className.prevIcon).appendTo(prev);

                var next = $('<span/>').addClass(className.next).appendTo(cell);
                next.data(metadata.focusDate, nextDate);
                next.toggleClass(className.disabledCell, !module.helper.isDateInRange(nextFirst, mode));
                $('<i/>').addClass(className.nextIcon).appendTo(next);

                if (isDay) {
                  row = $('<tr/>').appendTo(thead);
                  for (i = 0; i < columns; i++) {
                    cell = $('<th/>').appendTo(row);
                    cell.text(formatter.dayColumnHeader((i + settings.firstDayOfWeek) % 7, settings));
                  }
                }
              }

              var tbody = $('<tbody/>').appendTo(table);
              i = isYear ? Math.ceil(year / 10) * 10 - 9 : isDay ? 1 - firstMonthDayColumn : 0;
              for (r = 0; r < rows; r++) {
                row = $('<tr/>').appendTo(tbody);
                for (c = 0; c < columns; c++, i++) {
                  var cellDate = isYear ? new Date(i, month, 1, hour, minute) :
                    isMonth ? new Date(year, i, 1, hour, minute) : isDay ? new Date(year, month, i, hour, minute) :
                      isHour ? new Date(year, month, day, i) : new Date(year, month, day, hour, i * 5);
                  var cellText = isYear ? i :
                    isMonth ? settings.text.monthsShort[i] : isDay ? cellDate.getDate() :
                      formatter.time(cellDate, settings, true);
                  cell = $('<td/>').addClass(className.cell).appendTo(row);
                  cell.text(cellText);
                  cell.data(metadata.date, cellDate);
                  var disabled = (isDay && cellDate.getMonth() !== month) || !module.helper.isDateInRange(cellDate, mode);
                  var active = module.helper.dateEqual(cellDate, date, mode);
                  cell.toggleClass(className.disabledCell, disabled);
                  cell.toggleClass(className.activeCell, active);
                  if (!isHour && !isMinute) {
                    cell.toggleClass(className.todayCell, module.helper.dateEqual(cellDate, today, mode));
                  }
                  if (module.helper.dateEqual(cellDate, focusDate, mode)) {
                    //ensure that the focus date is exactly equal to the cell date
                    //so that, if selected, the correct value is set
                    module.set.focusDate(cellDate, false, false);
                  }
                }
              }

              if (settings.today) {
                var todayRow = $('<tr/>').appendTo(tbody);
                var todayButton = $('<td/>').attr('colspan', '' + columns).addClass(className.today).appendTo(todayRow);
                todayButton.text(formatter.today(settings));
                todayButton.data(metadata.date, today);
              }

              module.update.focus(false, table);

              $container.empty();
              table.appendTo($container);
            }
          },

          update: {
            focus: function (updateRange, container) {
              container = container || $container;
              var mode = module.get.mode();
              var date = module.get.date();
              var focusDate = module.get.focusDate();
              var startDate = module.get.startDate();
              var endDate = module.get.endDate();
              var rangeDate = (updateRange ? focusDate : null) || date || (!isTouch ? focusDate : null);

              container.find('td').each(function () {
                var cell = $(this);
                var cellDate = cell.data(metadata.date);
                if (!cellDate) {
                  return;
                }
                var disabled = cell.hasClass(className.disabledCell);
                var active = cell.hasClass(className.activeCell);
                var focused = module.helper.dateEqual(cellDate, focusDate, mode);
                var inRange = !rangeDate ? false :
                  ((!!startDate && module.helper.isDateInRange(cellDate, mode, startDate, rangeDate)) ||
                  (!!endDate && module.helper.isDateInRange(cellDate, mode, rangeDate, endDate)));
                cell.toggleClass(className.focusCell, focused && (!isTouch || isTouchDown));
                cell.toggleClass(className.rangeCell, inRange && !active && !disabled);
              });
            }
          },

          refresh: function () {
            module.create.calendar();
          },

          bind: {
            events: function () {
              $container.on('mousedown' + eventNamespace, module.event.mousedown);
              $container.on('touchstart' + eventNamespace, module.event.mousedown);
              $container.on('mouseup' + eventNamespace, module.event.mouseup);
              $container.on('touchend' + eventNamespace, module.event.mouseup);
              $container.on('mouseover' + eventNamespace, module.event.mouseover);
              if ($input.length) {
                $input.on('input' + eventNamespace, module.event.inputChange);
                $input.on('focus' + eventNamespace, module.event.inputFocus);
                $input.on('blur' + eventNamespace, module.event.inputBlur);
                $input.on('click' + eventNamespace, module.event.inputClick);
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
            mouseover: function (event) {
              var target = $(event.target);
              var date = target.data(metadata.date);
              var mousedown = event.buttons === 1;
              if (date) {
                module.set.focusDate(date, false, true, mousedown);
              }
            },
            mousedown: function (event) {
              if ($input.length) {
                //prevent the mousedown on the calendar causing the input to lose focus
                event.preventDefault();
              }
              isTouchDown = event.type.indexOf('touch') >= 0;
              var target = $(event.target);
              var date = target.data(metadata.date);
              if (date) {
                module.set.focusDate(date, false, true, true);
              }
            },
            mouseup: function (event) {
              //ensure input has focus so that it receives keydown events for calendar navigation
              module.focus();
              event.preventDefault();
              event.stopPropagation();
              isTouchDown = false;
              var target = $(event.target);
              var parent = target.parent();
              if (parent.data(metadata.date) || parent.data(metadata.focusDate) || parent.data(metadata.mode)) {
                //clicked on a child element, switch to parent (used when clicking directly on prev/next <i> icon element)
                target = parent;
              }
              var date = target.data(metadata.date);
              var focusDate = target.data(metadata.focusDate);
              var mode = target.data(metadata.mode);
              if (date) {
                var forceSet = target.hasClass(className.today);
                module.selectDate(date, forceSet);
              }
              else if (focusDate) {
                module.set.focusDate(focusDate);
              }
              else if (mode) {
                module.set.mode(mode);
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
                  var mode = module.get.mode();
                  var bigIncrement = mode === 'day' ? 7 : mode === 'hour' ? 4 : 3;
                  var increment = event.keyCode === 37 ? -1 : event.keyCode === 38 ? -bigIncrement : event.keyCode == 39 ? 1 : bigIncrement;
                  increment *= mode === 'minute' ? 5 : 1;
                  var focusDate = module.get.focusDate() || module.get.date() || new Date();
                  var year = focusDate.getFullYear() + (mode === 'year' ? increment : 0);
                  var month = focusDate.getMonth() + (mode === 'month' ? increment : 0);
                  var day = focusDate.getDate() + (mode === 'day' ? increment : 0);
                  var hour = focusDate.getHours() + (mode === 'hour' ? increment : 0);
                  var minute = focusDate.getMinutes() + (mode === 'minute' ? increment : 0);
                  var newFocusDate = new Date(year, month, day, hour, minute);
                  if (settings.type === 'time') {
                    newFocusDate = module.helper.mergeDateTime(focusDate, newFocusDate);
                  }
                  if (module.helper.isDateInRange(newFocusDate, mode)) {
                    module.set.focusDate(newFocusDate);
                  }
                } else if (event.keyCode === 13) {
                  //enter
                  var date = module.get.focusDate();
                  if (date) {
                    module.selectDate(date);
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
              module.set.date(date, false);
            },
            inputFocus: function () {
              $container.addClass(className.active);
            },
            inputBlur: function () {
              $container.removeClass(className.active);
              if (settings.formatInput) {
                var date = module.get.date();
                var text = formatter.datetime(date, settings);
                $input.val(text);
              }
            },
            inputClick: function () {
              module.popup('show');
            }
          },

          get: {
            date: function () {
              return $module.data(metadata.date) || null;
            },
            focusDate: function () {
              return $module.data(metadata.focusDate) || null;
            },
            startDate: function () {
              var startModule = module.get.calendarModule(settings.startCalendar);
              return (startModule ? startModule.get.date() : $module.data(metadata.startDate)) || null;
            },
            endDate: function () {
              var endModule = module.get.calendarModule(settings.endCalendar);
              return (endModule ? endModule.get.date() : $module.data(metadata.endDate)) || null;
            },
            mode: function () {
              //only returns valid modes for the current settings
              var mode = $module.data(metadata.mode) || settings.startMode;
              var validModes = module.get.validModes();
              if ($.inArray(mode, validModes) >= 0) {
                return mode;
              }
              return settings.type === 'time' ? 'hour' :
                settings.type === 'month' ? 'month' :
                  settings.type === 'year' ? 'year' : 'day';
            },
            validModes: function () {
              var validModes = [];
              if (settings.type !== 'time') {
                if (!settings.disableYear || settings.type === 'year') {
                  validModes.push('year');
                }
                if (!(settings.disableMonth || settings.type === 'year') || settings.type === 'month') {
                  validModes.push('month');
                }
                if (settings.type.indexOf('date') >= 0) {
                  validModes.push('day');
                }
              }
              if (settings.type.indexOf('time') >= 0) {
                validModes.push('hour');
                if (!settings.disableMinute) {
                  validModes.push('minute');
                }
              }
              return validModes;
            },
            isTouch: function () {
              try {
                document.createEvent('TouchEvent');
                return true;
              }
              catch (e) {
                return false;
              }
            },
            calendarModule: function (selector) {
              if (!selector) {
                return null;
              }
              if (!(selector instanceof $)) {
                selector = $module.parent().children(selector).first();
              }
              //assume range related calendars are using the same namespace
              return selector.data(moduleNamespace);
            }
          },

          set: {
            date: function (date, updateInput, fireChange) {
              updateInput = updateInput !== false;
              fireChange = fireChange !== false;
              date = module.helper.sanitiseDate(date);
              date = module.helper.dateInRange(date);

              var text = formatter.datetime(date, settings);
              if (fireChange && settings.onChange.call(element, date, text) === false) {
                return false;
              }

              var endDate = module.get.endDate();
              if (!!endDate && !!date && date > endDate) {
                //selected date is greater than end date in range, so clear end date
                module.set.endDate(undefined);
              }
              module.set.dataKeyValue(metadata.date, date);
              module.set.focusDate(date);

              if (updateInput && $input.length) {
                $input.val(text);
              }
            },
            startDate: function (date, refreshCalendar) {
              date = module.helper.sanitiseDate(date);
              var startModule = module.get.calendarModule(settings.startCalendar);
              if (startModule) {
                startModule.set.date(date);
              }
              module.set.dataKeyValue(metadata.startDate, date, refreshCalendar);
            },
            endDate: function (date, refreshCalendar) {
              date = module.helper.sanitiseDate(date);
              var endModule = module.get.calendarModule(settings.endCalendar);
              if (endModule) {
                endModule.set.date(date);
              }
              module.set.dataKeyValue(metadata.endDate, date, refreshCalendar);
            },
            focusDate: function (date, refreshCalendar, updateFocus, updateRange) {
              date = module.helper.sanitiseDate(date);
              date = module.helper.dateInRange(date);
              var changed = module.set.dataKeyValue(metadata.focusDate, date, refreshCalendar);
              updateFocus = (updateFocus !== false && changed && refreshCalendar === false) || focusDateUsedForRange != updateRange;
              focusDateUsedForRange = updateRange;
              if (updateFocus) {
                module.update.focus(updateRange);
              }
            },
            mode: function (mode, refreshCalendar) {
              module.set.dataKeyValue(metadata.mode, mode, refreshCalendar);
            },
            dataKeyValue: function (key, value, refreshCalendar) {
              var oldValue = $module.data(key);
              var equal = oldValue === value || (oldValue <= value && oldValue >= value); //equality test for dates and string objects
              if (value) {
                $module.data(key, value);
              } else {
                $module.removeData(key);
              }
              refreshCalendar = refreshCalendar !== false && !equal;
              if (refreshCalendar) {
                module.create.calendar();
              }
              return !equal;
            }
          },

          selectDate: function (date, forceSet) {
            var mode = module.get.mode();
            var complete = forceSet || mode === 'minute' ||
              (settings.disableMinute && mode === 'hour') ||
              (settings.type === 'date' && mode === 'day') ||
              (settings.type === 'month' && mode === 'month') ||
              (settings.type === 'year' && mode === 'year');
            if (complete) {
              var canceled = module.set.date(date) === false;
              if (!canceled && settings.closable) {
                module.popup('hide');
                //if this is a range calendar, show the end date calendar popup and focus the input
                var endModule = module.get.calendarModule(settings.endCalendar);
                if (endModule) {
                  endModule.popup('show');
                  endModule.focus();
                }
              }
            } else {
              var newMode = mode === 'year' ? (!settings.disableMonth ? 'month' : 'day') :
                mode === 'month' ? 'day' : mode === 'day' ? 'hour' : 'minute';
              module.set.mode(newMode);
              if (mode === 'hour' || (mode === 'day' && module.get.date())) {
                //the user has chosen enough to consider a valid date/time has been chosen
                module.set.date(date);
              } else {
                module.set.focusDate(date);
              }
            }
          },

          changeDate: function (date) {
            module.set.date(date);
          },

          clear: function () {
            module.set.date(undefined);
          },

          popup: function () {
            return $activator.popup.apply($activator, arguments);
          },

          focus: function () {
            if ($input.length) {
              $input.focus();
            } else {
              $container.focus();
            }
          },
          blur: function () {
            if ($input.length) {
              $input.blur();
            } else {
              $container.blur();
            }
          },

          helper: {
            sanitiseDate: function (date) {
              if (!date) {
                return undefined;
              }
              if (!(date instanceof Date)) {
                date = parser.date('' + date);
              }
              if (isNaN(date.getTime())) {
                return undefined;
              }
              return date;
            },
            dateDiff: function (date1, date2, mode) {
              mode = mode || 'day';
              var isTimeOnly = settings.type === 'time';
              var isYear = mode === 'year';
              var isYearOrMonth = isYear || mode === 'month';
              var isMinute = mode === 'minute';
              var isHourOrMinute = isMinute || mode === 'hour';
              //only care about a minute accuracy of 5
              date1 = new Date(
                isTimeOnly ? 2000 : date1.getFullYear(),
                isTimeOnly ? 0 : isYear ? 0 : date1.getMonth(),
                isTimeOnly ? 1 : isYearOrMonth ? 1 : date1.getDate(),
                !isHourOrMinute ? 0 : date1.getHours(),
                !isMinute ? 0 : Math.floor(date1.getMinutes() / 5));
              date2 = new Date(
                isTimeOnly ? 2000 : date2.getFullYear(),
                isTimeOnly ? 0 : isYear ? 0 : date2.getMonth(),
                isTimeOnly ? 1 : isYearOrMonth ? 1 : date2.getDate(),
                !isHourOrMinute ? 0 : date2.getHours(),
                !isMinute ? 0 : Math.floor(date2.getMinutes() / 5));
              return date2.getTime() - date1.getTime();
            },
            dateEqual: function (date1, date2, mode) {
              return !!date1 && !!date2 && module.helper.dateDiff(date1, date2, mode) === 0;
            },
            isDateInRange: function (date, mode, minDate, maxDate) {
              if (!minDate && !maxDate) {
                var startDate = module.get.startDate();
                minDate = startDate && settings.minDate ? Math.max(startDate, settings.minDate) : startDate || settings.minDate;
                maxDate = settings.maxDate;
              }
              return !(!date ||
              (minDate && module.helper.dateDiff(date, minDate, mode) > 0) ||
              (maxDate && module.helper.dateDiff(maxDate, date, mode) > 0));
            },
            dateInRange: function (date, minDate, maxDate) {
              if (!minDate && !maxDate) {
                var startDate = module.get.startDate();
                minDate = startDate && settings.minDate ? Math.max(startDate, settings.minDate) : startDate || settings.minDate;
                maxDate = settings.maxDate;
              }
              var isTimeOnly = settings.type === 'time';
              return !date ? date :
                (minDate && module.helper.dateDiff(date, minDate, 'minute') > 0) ?
                  (isTimeOnly ? module.helper.mergeDateTime(date, minDate) : minDate) :
                  (maxDate && module.helper.dateDiff(maxDate, date, 'minute') > 0) ?
                    (isTimeOnly ? module.helper.mergeDateTime(date, maxDate) : maxDate) :
                    date;
            },
            mergeDateTime: function (date, time) {
              return (!date || !time) ? time :
                new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
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

    type: 'datetime',     // picker type, can be 'datetime', 'date', 'time', 'month', or 'year'
    firstDayOfWeek: 0,    // day for first day column (0 = Sunday)
    constantHeight: true, // add rows to shorter months to keep day calendar height consistent (6 rows)
    today: false,         // show a 'today/now' button at the bottom of the calendar
    closable: true,       // close the popup after selecting a date/time
    monthFirst: true,     // month before day when parsing/converting date from/to text
    touchReadonly: true,  // set input to readonly on touch devices
    inline: false,        // create the calendar inline instead of inside a popup
    on: null,             // when to show the popup (defaults to 'focus' for input, 'click' for others)
    initialDate: null,    // date to display initially when no date is selected (null = now)
    startMode: false,     // display mode to start in, can be 'year', 'month', 'day', 'hour', 'minute' (false = 'day')
    minDate: null,        // minimum date/time that can be selected, dates/times before are disabled
    maxDate: null,        // maximum date/time that can be selected, dates/times after are disabled
    ampm: true,           // show am/pm in time mode
    disableYear: false,   // disable year selection mode
    disableMonth: false,  // disable month selection mode
    disableMinute: false, // disable minute selection mode
    formatInput: true,    // format the input text upon input blur and module creation
    startCalendar: null,  // jquery object or selector for another calendar that represents the start date of a date range
    endCalendar: null,    // jquery object or selector for another calendar that represents the end date of a date range

    // popup options ('popup', 'on', 'hoverable', and show/hide callbacks are overridden)
    popupOptions: {
      position: 'bottom left',
      lastResort: 'bottom left',
      prefer: 'opposite',
      hideOnScroll: false
    },

    text: {
      days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      today: 'Today',
      now: 'Now',
      am: 'AM',
      pm: 'PM'
    },

    formatter: {
      header: function (date, mode, settings) {
        return mode === 'year' ? settings.formatter.yearHeader(date, settings) :
          mode === 'month' ? settings.formatter.monthHeader(date, settings) :
            mode === 'day' ? settings.formatter.dayHeader(date, settings) :
              mode === 'hour' ? settings.formatter.hourHeader(date, settings) :
                settings.formatter.minuteHeader(date, settings);
      },
      yearHeader: function (date, settings) {
        var decadeYear = Math.ceil(date.getFullYear() / 10) * 10;
        return (decadeYear - 9) + ' - ' + (decadeYear + 2);
      },
      monthHeader: function (date, settings) {
        return date.getFullYear();
      },
      dayHeader: function (date, settings) {
        var month = settings.text.months[date.getMonth()];
        var year = date.getFullYear();
        return month + ' ' + year;
      },
      hourHeader: function (date, settings) {
        return settings.formatter.date(date, settings);
      },
      minuteHeader: function (date, settings) {
        return settings.formatter.date(date, settings);
      },
      dayColumnHeader: function (day, settings) {
        return settings.text.days[day];
      },
      datetime: function (date, settings) {
        if (!date) {
          return '';
        }
        var day = settings.type === 'time' ? '' : settings.formatter.date(date, settings);
        var time = settings.type.indexOf('time') < 0 ? '' : settings.formatter.time(date, settings, false);
        var separator = settings.type === 'datetime' ? ' ' : '';
        return day + separator + time;
      },
      date: function (date, settings) {
        if (!date) {
          return '';
        }
        var day = date.getDate();
        var month = settings.text.months[date.getMonth()];
        var year = date.getFullYear();
        return settings.type === 'year' ? year :
          settings.type === 'month' ? month + ' ' + year :
          (settings.monthFirst ? month + ' ' + day : day + ' ' + month) + ', ' + year;
      },
      time: function (date, settings, forCalendar) {
        if (!date) {
          return '';
        }
        var hour = date.getHours();
        var minute = date.getMinutes();
        var ampm = '';
        if (settings.ampm) {
          ampm = ' ' + (hour < 12 ? settings.text.am : settings.text.pm);
          hour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        }
        return hour + ':' + (minute < 10 ? '0' : '') + minute + ampm;
      },
      today: function (settings) {
        return settings.type === 'date' ? settings.text.today : settings.text.now;
      }
    },

    parser: {
      date: function (text, settings) {
        if (!text) {
          return null;
        }
        text = ('' + text).trim().toLowerCase();
        if (text.length === 0) {
          return null;
        }

        var i, j, k;
        var minute = -1, hour = -1, day = -1, month = -1, year = -1;
        var isAm = undefined;

        var isTimeOnly = settings.type === 'time';
        var isDateOnly = settings.type.indexOf('time') < 0;

        var words = text.split(settings.regExp.dateWords);
        var numbers = text.split(settings.regExp.dateNumbers);

        if (!isDateOnly) {
          //am/pm
          isAm = $.inArray(settings.text.am.toLowerCase(), words) >= 0 ? true :
            $.inArray(settings.text.pm.toLowerCase(), words) >= 0 ? false : undefined;

          //time with ':'
          for (i = 0; i < numbers.length; i++) {
            var number = numbers[i];
            if (number.indexOf(':') >= 0) {
              if (hour < 0 || minute < 0) {
                var parts = number.split(':');
                for (k = 0; k < Math.min(2, parts.length); k++) {
                  j = parseInt(parts[k]);
                  if (isNaN(j)) {
                    j = 0;
                  }
                  if (k === 0) {
                    hour = j % 24;
                  } else {
                    minute = j % 60;
                  }
                }
              }
              numbers.splice(i, 1);
            }
          }
        }

        if (!isTimeOnly) {
          //textual month
          for (i = 0; i < words.length; i++) {
            var word = words[i];
            if (word.length <= 0) {
              continue;
            }
            word = word.substring(0, Math.min(word.length, 3));
            for (j = 0; j < settings.text.months.length; j++) {
              var monthString = settings.text.months[j];
              monthString = monthString.substring(0, Math.min(word.length, Math.min(monthString.length, 3))).toLowerCase();
              if (monthString === word) {
                month = j + 1;
                break;
              }
            }
            if (month >= 0) {
              break;
            }
          }

          //year > 59
          for (i = 0; i < numbers.length; i++) {
            j = parseInt(numbers[i]);
            if (isNaN(j)) {
              continue;
            }
            if (j > 59) {
              year = j;
              numbers.splice(i, 1);
              break;
            }
          }

          //numeric month
          if (month < 0) {
            for (i = 0; i < numbers.length; i++) {
              k = i > 1 || settings.monthFirst ? i : i === 1 ? 0 : 1;
              j = parseInt(numbers[k]);
              if (isNaN(j)) {
                continue;
              }
              if (1 <= j && j <= 12) {
                month = j;
                numbers.splice(k, 1);
                break;
              }
            }
          }

          //day
          for (i = 0; i < numbers.length; i++) {
            j = parseInt(numbers[i]);
            if (isNaN(j)) {
              continue;
            }
            if (1 <= j && j <= 31) {
              day = j;
              numbers.splice(i, 1);
              break;
            }
          }

          //year <= 59
          if (year < 0) {
            for (i = numbers.length - 1; i >= 0; i--) {
              j = parseInt(numbers[i]);
              if (isNaN(j)) {
                continue;
              }
              if (j < 99) {
                j += 2000;
              }
              year = j;
              numbers.splice(i, 1);
              break;
            }
          }
        }

        if (!isDateOnly) {
          //hour
          if (hour < 0) {
            for (i = 0; i < numbers.length; i++) {
              j = parseInt(numbers[i]);
              if (isNaN(j)) {
                continue;
              }
              if (0 <= j && j <= 23) {
                hour = j;
                numbers.splice(i, 1);
                break;
              }
            }
          }

          //minute
          if (minute < 0) {
            for (i = 0; i < numbers.length; i++) {
              j = parseInt(numbers[i]);
              if (isNaN(j)) {
                continue;
              }
              if (0 <= j && j <= 59) {
                minute = j;
                numbers.splice(i, 1);
                break;
              }
            }
          }
        }

        if (minute < 0 && hour < 0 && day < 0 && month < 0 && year < 0) {
          return null;
        }

        if (minute < 0) {
          minute = 0;
        }
        if (hour < 0) {
          hour = 0;
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

        if (isAm !== undefined) {
          if (isAm) {
            if (hour === 12) {
              hour = 0;
            }
          } else if (hour < 12) {
            hour += 12;
          }
        }

        var date = new Date(year, month - 1, day, hour, minute);
        if (date.getMonth() !== month - 1 || date.getFullYear() !== year) {
          //month or year don't match up, switch to last day of the month
          date = new Date(year, month, 0, hour, minute);
        }
        return isNaN(date.getTime()) ? null : date;
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
      dateWords: /[^A-Za-z\u00C0-\u024F]+/g,
      dateNumbers: /[^\d:]+/g
    },

    error: {
      popup: 'UI Popup, a required component is not included in this page',
      method: 'The method you called is not defined.'
    },

    className: {
      calendar: 'calendar',
      active: 'active',
      popup: 'ui popup',
      table: 'ui celled center aligned unstackable table',
      prev: 'prev link',
      next: 'next link',
      prevIcon: 'chevron left icon',
      nextIcon: 'chevron right icon',
      link: 'link',
      cell: 'link',
      disabledCell: 'disabled',
      activeCell: 'active',
      rangeCell: 'range',
      focusCell: 'focus',
      todayCell: 'today',
      today: 'today link'
    },

    metadata: {
      date: 'date',
      focusDate: 'focusDate',
      startDate: 'startDate',
      endDate: 'endDate',
      mode: 'mode'
    }
  };

})(jQuery, window, document);
