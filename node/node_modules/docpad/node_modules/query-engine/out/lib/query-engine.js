(function() {
  var Backbone, Criteria, Hash, Pill, Query, QueryCollection, err, queryEngine, util, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  try {
    Backbone = (_ref = (typeof module !== "undefined" && module !== null ? require('backbone') : this.Backbone)) != null ? _ref : null;
  } catch (_error) {
    err = _error;
    Backbone = null;
  }

  util = {
    toString: function(value) {
      return Object.prototype.toString.call(value);
    },
    isPlainObject: function(value) {
      return util.isObject(value) && value.__proto__ === Object.prototype;
    },
    isObject: function(value) {
      return value && typeof value === 'object';
    },
    isError: function(value) {
      return value instanceof Error;
    },
    isDate: function(value) {
      return util.toString(value) === '[object Date]';
    },
    isArguments: function(value) {
      return util.toString(value) === '[object Arguments]';
    },
    isFunction: function(value) {
      return util.toString(value) === '[object Function]';
    },
    isRegExp: function(value) {
      return util.toString(value) === '[object RegExp]';
    },
    isArray: function(value) {
      if (Array.isArray != null) {
        return Array.isArray(value);
      } else {
        return util.toString(value) === '[object Array]';
      }
    },
    isNumber: function(value) {
      return typeof value === 'number' || util.toString(value) === '[object Number]';
    },
    isString: function(value) {
      return typeof value === 'string' || util.toString(value) === '[object String]';
    },
    isBoolean: function(value) {
      return value === true || value === false || util.toString(value) === '[object Boolean]';
    },
    isNull: function(value) {
      return value === null;
    },
    isUndefined: function(value) {
      return typeof value === 'undefined';
    },
    isDefined: function(value) {
      return typeof value !== 'undefined';
    },
    isEmpty: function(value) {
      return value != null;
    },
    isObjectEmpty: function(object) {
      var empty, key, value;

      empty = true;
      for (key in object) {
        if (!__hasProp.call(object, key)) continue;
        value = object[key];
        empty = false;
        break;
      }
      return empty;
    },
    isComparable: function(value) {
      return util.isNumber(value) || util.isDate(value);
    },
    isEqual: function(value1, value2) {
      return JSON.stringify(value1) === JSON.stringify(value2);
    },
    clone: function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return util.shallowExtendPlainObjects.apply(util, [{}].concat(__slice.call(args)));
    },
    extend: function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return util.shallowExtendPlainObjects.apply(util, args);
    },
    shallowExtendPlainObjects: function() {
      var key, obj, objs, target, value, _i, _len;

      target = arguments[0], objs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      for (_i = 0, _len = objs.length; _i < _len; _i++) {
        obj = objs[_i];
        obj || (obj = {});
        for (key in obj) {
          if (!__hasProp.call(obj, key)) continue;
          value = obj[key];
          target[key] = value;
        }
      }
      return target;
    },
    get: function(obj, key) {
      var result;

      if (obj.get != null) {
        result = obj.get(key);
      } else {
        result = obj[key];
      }
      return result;
    },
    safeRegex: function(str) {
      if (str === false) {
        return 'false';
      } else if (str === true) {
        return 'true';
      } else if (str === null) {
        return 'null';
      } else {
        return (str || '').replace('(.)', '\\$1');
      }
    },
    createRegex: function(str) {
      return new RegExp(str, 'ig');
    },
    createSafeRegex: function(str) {
      return util.createRegex(util.safeRegex(str));
    },
    toArray: function(value) {
      var item, key, result, valueExists;

      result = [];
      valueExists = typeof value !== 'undefined';
      if (valueExists) {
        if (util.isArray(value)) {
          result = value.slice();
        } else if (util.isObject(value)) {
          for (key in value) {
            if (!__hasProp.call(value, key)) continue;
            item = value[key];
            result.push(item);
          }
        } else {
          result.push(value);
        }
      }
      return result;
    },
    toArrayGroup: function(value) {
      var item, key, obj, result, valueExists;

      result = [];
      valueExists = typeof value !== 'undefined';
      if (valueExists) {
        if (util.isArray(value)) {
          result = value.slice();
        } else if (util.isObject(value)) {
          for (key in value) {
            if (!__hasProp.call(value, key)) continue;
            item = value[key];
            obj = {};
            obj[key] = item;
            result.push(obj);
          }
        } else {
          result.push(value);
        }
      }
      return result;
    },
    generateComparator: function(input) {
      var generateFunction;

      generateFunction = function(comparator) {
        if (!comparator) {
          throw new Error('Cannot sort without a comparator');
        } else if (util.isFunction(comparator)) {
          return comparator;
        } else if (util.isArray(comparator)) {
          return function(a, b) {
            var comparison, key, value, _i, _len;

            comparison = 0;
            for (key = _i = 0, _len = comparator.length; _i < _len; key = ++_i) {
              value = comparator[key];
              comparison = generateFunction(value)(a, b);
              if (comparison) {
                return comparison;
              }
            }
            return comparison;
          };
        } else if (util.isObject(comparator)) {
          return function(a, b) {
            var aValue, bValue, comparison, key, value;

            comparison = 0;
            for (key in comparator) {
              if (!__hasProp.call(comparator, key)) continue;
              value = comparator[key];
              aValue = util.get(a, key);
              bValue = util.get(b, key);
              if (aValue === bValue) {
                comparison = 0;
              } else if (aValue < bValue) {
                comparison = -1;
              } else if (aValue > bValue) {
                comparison = 1;
              }
              if (value === -1) {
                comparison *= -1;
              }
              if (comparison) {
                return comparison;
              }
            }
            return comparison;
          };
        } else {
          throw new Error('Unknown comparator type');
        }
      };
      return generateFunction(input);
    }
  };

  Hash = (function(_super) {
    __extends(Hash, _super);

    function Hash(value) {
      var item, key, _i, _len;

      value = util.toArray(value);
      for (key = _i = 0, _len = value.length; _i < _len; key = ++_i) {
        item = value[key];
        this.push(item);
      }
    }

    Hash.prototype.hasIn = function(options) {
      var value, _i, _len;

      options = util.toArray(options);
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        value = this[_i];
        if (__indexOf.call(options, value) >= 0) {
          return true;
        }
      }
      return false;
    };

    Hash.prototype.hasAll = function(options) {
      var empty, pass, value, _i, _len;

      options = util.toArray(options);
      empty = true;
      pass = true;
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        value = this[_i];
        empty = false;
        if (__indexOf.call(options, value) < 0) {
          pass = false;
        }
      }
      if (empty) {
        pass = false;
      }
      return pass;
    };

    Hash.prototype.isSame = function(options) {
      var pass;

      options = util.toArray(options);
      pass = this.sort().join() === options.sort().join();
      return pass;
    };

    return Hash;

  })(Array);

  if (Backbone == null) {
    QueryCollection = null;
  } else {
    QueryCollection = (function(_super) {
      __extends(QueryCollection, _super);

      function QueryCollection() {
        this.onParentReset = __bind(this.onParentReset, this);
        this.onParentAdd = __bind(this.onParentAdd, this);
        this.onParentRemove = __bind(this.onParentRemove, this);
        this.onParentChange = __bind(this.onParentChange, this);
        this.onChange = __bind(this.onChange, this);        _ref1 = QueryCollection.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      QueryCollection.prototype.model = Backbone.Model;

      QueryCollection.prototype.initialize = function(models, options) {
        var key, me, value, _ref2, _ref3, _ref4;

        me = this;
        if ((_ref2 = this.options) == null) {
          this.options = {};
        }
        _ref3 = Criteria.prototype;
        for (key in _ref3) {
          if (!__hasProp.call(_ref3, key)) continue;
          value = _ref3[key];
          if ((_ref4 = this[key]) == null) {
            this[key] = value;
          }
        }
        if (this.comparator != null) {
          this.setComparator(this.comparator);
        }
        this.applyCriteriaOptions(options);
        if (options != null) {
          if (options.parentCollection != null) {
            this.options.parentCollection = options.parentCollection;
          }
          if (options.live != null) {
            this.options.live = options.live;
          }
          this.live();
        }
        return this;
      };

      QueryCollection.prototype.getComparator = function() {
        return this.comparator;
      };

      QueryCollection.prototype.setComparator = function(comparator) {
        comparator = util.generateComparator(comparator);
        this.comparator = comparator;
        return this;
      };

      QueryCollection.prototype.createChildCollection = function(models, options) {
        var collection, _ref2, _ref3;

        options || (options = {});
        options.parentCollection = this;
        if ((_ref2 = options.collection) == null) {
          options.collection = this.collection || QueryCollection;
        }
        if ((_ref3 = options.comparator) == null) {
          options.comparator = options.collection.prototype.comparator || this.comparator;
        }
        collection = new options.collection(models, options);
        return collection;
      };

      QueryCollection.prototype.createLiveChildCollection = function(models, options) {
        var collection;

        options || (options = {});
        options.live = true;
        collection = this.createChildCollection(models, options);
        return collection;
      };

      QueryCollection.prototype.hasParentCollection = function() {
        return this.options.parentCollection != null;
      };

      QueryCollection.prototype.getParentCollection = function() {
        return this.options.parentCollection;
      };

      QueryCollection.prototype.setParentCollection = function(parentCollection, skipCheck) {
        if (!skipCheck && this.options.parentCollection === parentCollection) {
          return this;
        }
        this.options.parentCollection = parentCollection;
        this.live();
        return this;
      };

      QueryCollection.prototype.hasModel = function(model) {
        var exists, _ref2, _ref3;

        model || (model = {});
        if ((model.id != null) && this.get(model.id)) {
          exists = true;
        } else if ((model.cid != null) && ((_ref2 = (_ref3 = this._byCid) != null ? _ref3[model.cid] : void 0) != null ? _ref2 : this.get(model.cid))) {
          exists = true;
        } else {
          exists = false;
        }
        return exists;
      };

      QueryCollection.prototype.safeRemove = function(model) {
        var exists;

        exists = this.hasModel(model);
        if (exists) {
          this.remove(model);
        }
        return this;
      };

      QueryCollection.prototype.safeAdd = function(model) {
        var exists;

        exists = this.hasModel(model);
        if (!exists) {
          this.add(model);
        }
        return this;
      };

      QueryCollection.prototype.sortCollection = function(comparator) {
        if (comparator) {
          comparator = util.generateComparator(comparator);
          this.models.sort(comparator);
        } else {
          comparator = this.getComparator();
          if (comparator) {
            this.models.sort(comparator);
          } else {
            throw new Error('You need a comparator to sort');
          }
        }
        return this;
      };

      QueryCollection.prototype.sortArray = function(comparator) {
        var arr;

        arr = this.toJSON();
        if (comparator) {
          comparator = util.generateComparator(comparator);
          arr.sort(comparator);
        } else {
          comparator = this.getComparator();
          if (comparator) {
            arr.sort(comparator);
          } else {
            throw new Error('You need a comparator to sort');
          }
        }
        return arr;
      };

      QueryCollection.prototype.findAll = function() {
        var args, collection, comparator, criteriaOptions, paging, query;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length) {
          if (args.length === 1 && args[0] instanceof Criteria) {
            criteriaOptions = args[0].options;
          } else {
            query = args[0], comparator = args[1], paging = args[2];
            criteriaOptions = {
              comparator: comparator,
              paging: paging,
              queries: {
                find: query
              }
            };
          }
        } else {
          criteriaOptions = null;
        }
        collection = this.createChildCollection([], criteriaOptions).query();
        return collection;
      };

      QueryCollection.prototype.findAllLive = function() {
        var args, collection, comparator, criteriaOptions, paging, query;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length) {
          if (args.length === 1 && args[0] instanceof Criteria) {
            criteriaOptions = args[0].options;
          } else {
            query = args[0], comparator = args[1], paging = args[2];
            criteriaOptions = {
              comparator: comparator,
              paging: paging,
              queries: {
                find: query
              }
            };
          }
        } else {
          criteriaOptions = null;
        }
        collection = this.createLiveChildCollection([], criteriaOptions).query();
        return collection;
      };

      QueryCollection.prototype.findOne = function() {
        var args, comparator, criteriaOptions, paging, passed, query;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length) {
          if (args.length === 1 && args[0] instanceof Criteria) {
            criteriaOptions = args[0].options;
          } else {
            query = args[0], comparator = args[1], paging = args[2];
            criteriaOptions = {
              comparator: comparator,
              paging: paging,
              queries: {
                find: query
              }
            };
          }
        } else {
          criteriaOptions = null;
        }
        passed = this.testModels(this.models, criteriaOptions);
        if ((passed != null ? passed.length : void 0) !== 0) {
          return passed[0];
        } else {
          return null;
        }
      };

      QueryCollection.prototype.query = function() {
        var args, criteria, passed;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length === 1) {
          if (args[0] instanceof Criteria) {
            criteria = args[0].options;
          } else {
            criteria = {
              paging: args[0]
            };
          }
        }
        passed = this.queryModels(criteria);
        this.reset(passed);
        return this;
      };

      QueryCollection.prototype.queryModels = function() {
        var args, collection, criteriaOptions, models, passed;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        criteriaOptions = this.extractCriteriaOptions.apply(this, args);
        collection = this.getParentCollection() || this;
        models = collection.models;
        passed = this.testModels(models, criteriaOptions);
        return passed;
      };

      QueryCollection.prototype.queryArray = function() {
        var args, model, passed, result, _i, _len;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        result = [];
        passed = this.queryModels.apply(this, args);
        for (_i = 0, _len = passed.length; _i < _len; _i++) {
          model = passed[_i];
          result.push(model.toJSON());
        }
        return result;
      };

      QueryCollection.prototype.live = function(enabled) {
        var parentCollection;

        if (enabled == null) {
          enabled = this.options.live;
        }
        this.options.live = enabled;
        if (enabled) {
          this.on('change', this.onChange);
        } else {
          this.off('change', this.onChange);
        }
        parentCollection = this.getParentCollection();
        if (parentCollection != null) {
          if (enabled) {
            parentCollection.on('change', this.onParentChange);
            parentCollection.on('remove', this.onParentRemove);
            parentCollection.on('add', this.onParentAdd);
            parentCollection.on('reset', this.onParentReset);
          } else {
            parentCollection.off('change', this.onParentChange);
            parentCollection.off('remove', this.onParentRemove);
            parentCollection.off('add', this.onParentAdd);
            parentCollection.off('reset', this.onParentReset);
          }
        }
        return this;
      };

      QueryCollection.prototype.add = function(models, options) {
        var model, passedModels, _i, _len;

        options = options ? util.clone(options) : {};
        models = util.isArray(models) ? models.slice() : [models];
        passedModels = [];
        for (_i = 0, _len = models.length; _i < _len; _i++) {
          model = models[_i];
          model = this._prepareModel(model, options);
          if (model && this.test(model)) {
            passedModels.push(model);
          }
        }
        Backbone.Collection.prototype.add.apply(this, [passedModels, options]);
        return this;
      };

      QueryCollection.prototype.create = function(model, options) {
        options = options ? util.clone(options) : {};
        model = this._prepareModel(model, options);
        if (model && this.test(model)) {
          Backbone.Collection.prototype.create.apply(this, [model, options]);
        }
        return this;
      };

      QueryCollection.prototype.onChange = function(model) {
        var pass;

        pass = this.test(model);
        if (!pass) {
          this.safeRemove(model);
        } else {
          if (this.comparator) {
            this.sortCollection();
          }
        }
        return this;
      };

      QueryCollection.prototype.onParentChange = function(model) {
        var pass;

        pass = this.test(model) && this.getParentCollection().hasModel(model);
        if (pass) {
          this.safeAdd(model);
        } else {
          this.safeRemove(model);
        }
        return this;
      };

      QueryCollection.prototype.onParentRemove = function(model) {
        this.safeRemove(model);
        return this;
      };

      QueryCollection.prototype.onParentAdd = function(model) {
        this.safeAdd(model);
        return this;
      };

      QueryCollection.prototype.onParentReset = function(model) {
        this.reset(this.getParentCollection().models);
        return this;
      };

      return QueryCollection;

    })(Backbone.Collection);
  }

  Criteria = (function() {
    function Criteria() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.applyCriteriaOptions = __bind(this.applyCriteriaOptions, this);
      this.applyCriteriaOptions.apply(this, args);
      this;
    }

    Criteria.prototype.extractCriteriaOptions = function() {
      var args, comparator, criteriaOptions, paging, query;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) {
        if (args[0] instanceof Criteria) {
          criteriaOptions = args[0].options;
        } else if (args[0]) {
          criteriaOptions = args[0];
        } else {
          criteriaOptions = null;
        }
      } else if (args.length > 1) {
        query = args[0], comparator = args[1], paging = args[2];
        criteriaOptions = {
          queries: {
            find: query || null
          },
          comparator: comparator,
          paging: paging
        };
      } else {
        criteriaOptions = null;
      }
      return criteriaOptions;
    };

    Criteria.prototype.applyCriteriaOptions = function() {
      var args, criteriaOptions, _base, _base1, _base2, _base3, _base4, _base5, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if ((_ref2 = this.options) == null) {
        this.options = {};
      }
      if ((_ref3 = (_base = this.options).filters) == null) {
        _base.filters = {};
      }
      if ((_ref4 = (_base1 = this.options).queries) == null) {
        _base1.queries = {};
      }
      if ((_ref5 = (_base2 = this.options).pills) == null) {
        _base2.pills = {};
      }
      if ((_ref6 = (_base3 = this.options).paging) == null) {
        _base3.paging = {};
      }
      if ((_ref7 = (_base4 = this.options).searchString) == null) {
        _base4.searchString = null;
      }
      if ((_ref8 = (_base5 = this.options).comparator) == null) {
        _base5.comparator = null;
      }
      criteriaOptions = this.extractCriteriaOptions.apply(this, args);
      if (criteriaOptions) {
        if (criteriaOptions.filters != null) {
          this.setFilters(criteriaOptions.filters);
        }
        if (criteriaOptions.queries != null) {
          this.setQueries(criteriaOptions.queries);
        }
        if (criteriaOptions.pills != null) {
          this.setPills(criteriaOptions.pills);
        }
        if (criteriaOptions.paging != null) {
          this.setPaging(criteriaOptions.paging);
        }
        if (criteriaOptions.searchString != null) {
          this.setSearchString(criteriaOptions.searchString);
        }
        if (criteriaOptions.comparator != null) {
          this.setComparator(criteriaOptions.comparator);
        }
      }
      return this;
    };

    Criteria.prototype.getPaging = function() {
      return this.options.paging;
    };

    Criteria.prototype.setPaging = function(paging) {
      paging = util.extend(this.getPaging(), paging || {});
      paging.page || (paging.page = null);
      paging.limit || (paging.limit = null);
      paging.offset || (paging.offset = null);
      this.options.paging = paging;
      return this;
    };

    Criteria.prototype.getComparator = function() {
      return this.options.comparator;
    };

    Criteria.prototype.setComparator = function(comparator) {
      comparator = util.generateComparator(comparator);
      this.options.comparator = comparator;
      return this;
    };

    Criteria.prototype.getFilter = function(key) {
      return this.options.filters[key];
    };

    Criteria.prototype.getFilters = function() {
      return this.options.filters;
    };

    Criteria.prototype.setFilters = function(filters) {
      var key, value;

      filters || (filters = {});
      for (key in filters) {
        if (!__hasProp.call(filters, key)) continue;
        value = filters[key];
        this.setFilter(key, value);
      }
      return this;
    };

    Criteria.prototype.setFilter = function(name, value) {
      var filters;

      if (typeof value === 'undefined') {
        throw new Error('QueryCollection::setFilter was called without both arguments');
      }
      filters = this.options.filters;
      if (value != null) {
        filters[name] = value;
      } else if (filters[name] != null) {
        delete filters[name];
      }
      return this;
    };

    Criteria.prototype.getQuery = function(key) {
      return this.options.queries[key];
    };

    Criteria.prototype.getQueries = function() {
      return this.options.queries;
    };

    Criteria.prototype.setQueries = function(queries) {
      var key, value;

      queries || (queries = {});
      for (key in queries) {
        if (!__hasProp.call(queries, key)) continue;
        value = queries[key];
        this.setQuery(key, value);
      }
      return this;
    };

    Criteria.prototype.setQuery = function(name, value) {
      var queries;

      if (typeof value === 'undefined') {
        throw new Error('QueryCollection::setQuery was called without both arguments');
      }
      queries = this.options.queries;
      if (value != null) {
        if (!(value instanceof Query)) {
          value = new Query(value);
        }
        queries[name] = value;
      } else if (queries[name] != null) {
        delete queries[name];
      }
      return this;
    };

    Criteria.prototype.getPill = function(key) {
      return this.options.pills[key];
    };

    Criteria.prototype.getPills = function() {
      return this.options.pills;
    };

    Criteria.prototype.setPills = function(pills) {
      var key, value;

      pills || (pills = {});
      for (key in pills) {
        if (!__hasProp.call(pills, key)) continue;
        value = pills[key];
        this.setPill(key, value);
      }
      return this;
    };

    Criteria.prototype.setPill = function(name, value) {
      var pills, searchString;

      if (typeof value === 'undefined') {
        throw new Error('QueryCollection::setPill was called without both arguments');
      }
      pills = this.getPills();
      searchString = this.getSearchString();
      if (value != null) {
        if (!(value instanceof Pill)) {
          value = new Pill(value);
        }
        if (searchString) {
          value.setSearchString(searchString);
        }
        pills[name] = value;
      } else if (pills[name] != null) {
        delete pills[name];
      }
      return this;
    };

    Criteria.prototype.getCleanedSearchString = function() {
      return this.options.cleanedSearchString;
    };

    Criteria.prototype.getSearchString = function() {
      return this.options.searchString;
    };

    Criteria.prototype.setSearchString = function(searchString) {
      var cleanedSearchString, pill, pillName, pills;

      pills = this.options.pills;
      cleanedSearchString = searchString;
      for (pillName in pills) {
        if (!__hasProp.call(pills, pillName)) continue;
        pill = pills[pillName];
        cleanedSearchString = pill.setSearchString(cleanedSearchString);
      }
      this.options.searchString = searchString;
      this.options.cleanedSearchString = cleanedSearchString;
      return this;
    };

    Criteria.prototype.test = function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.testModel.apply(this, args);
    };

    Criteria.prototype.testModel = function(model, criteriaOptions) {
      var passed;

      passed = this.testQueries(model, criteriaOptions != null ? criteriaOptions.queries : void 0) && this.testFilters(model, criteriaOptions != null ? criteriaOptions.filters : void 0) && this.testPills(model, criteriaOptions != null ? criteriaOptions.pills : void 0);
      return passed;
    };

    Criteria.prototype.testModels = function(models, criteriaOptions) {
      var comparator, finish, me, model, paging, pass, passed, start, _i, _len, _ref2;

      me = this;
      passed = [];
      paging = (_ref2 = criteriaOptions != null ? criteriaOptions.paging : void 0) != null ? _ref2 : this.getPaging();
      comparator = (criteriaOptions != null ? criteriaOptions.comparator : void 0) != null ? util.generateComparator(criteriaOptions != null ? criteriaOptions.comparator : void 0) : this.getComparator();
      for (_i = 0, _len = models.length; _i < _len; _i++) {
        model = models[_i];
        pass = me.testModel(model, criteriaOptions);
        if (pass) {
          passed.push(model);
        }
      }
      if (comparator) {
        passed.sort(comparator);
      }
      if (paging) {
        start = paging.offset || 0;
        if ((paging.limit != null) && paging.limit > 0) {
          start = start + paging.limit * ((paging.page || 1) - 1);
          finish = start + paging.limit;
          passed = passed.slice(start, finish);
        } else {
          passed = passed.slice(start);
        }
      }
      return passed;
    };

    Criteria.prototype.testQueries = function(model, queries) {
      var passed, query, queryName;

      passed = true;
      if (queries == null) {
        queries = this.getQueries();
      }
      for (queryName in queries) {
        if (!__hasProp.call(queries, queryName)) continue;
        query = queries[queryName];
        if (!(query instanceof Query)) {
          query = new Query(query);
          queries[queryName] = query;
        }
        if (query.test(model) === false) {
          passed = false;
          return false;
        }
      }
      return passed;
    };

    Criteria.prototype.testFilters = function(model, filters) {
      var cleanedSearchString, filter, filterName, passed;

      passed = true;
      cleanedSearchString = this.getCleanedSearchString();
      if (filters == null) {
        filters = this.getFilters();
      }
      for (filterName in filters) {
        if (!__hasProp.call(filters, filterName)) continue;
        filter = filters[filterName];
        if (filter(model, cleanedSearchString) === false) {
          passed = false;
          return false;
        }
      }
      return passed;
    };

    Criteria.prototype.testPills = function(model, pills) {
      var passed, pill, pillName, searchString;

      passed = true;
      searchString = this.getSearchString();
      if (pills == null) {
        pills = this.getPills();
      }
      if (searchString != null) {
        for (pillName in pills) {
          if (!__hasProp.call(pills, pillName)) continue;
          pill = pills[pillName];
          if (!(pill instanceof Pill)) {
            pill = new Pill(query);
            pill.setSearchString(searchString);
            pills[pillName] = pill;
          }
          if (pill.test(model) === false) {
            passed = false;
            return false;
          }
        }
      }
      return passed;
    };

    return Criteria;

  })();

  Pill = (function() {
    Pill.prototype.callback = null;

    Pill.prototype.regex = null;

    Pill.prototype.prefixes = null;

    Pill.prototype.searchString = null;

    Pill.prototype.values = null;

    Pill.prototype.logicalOperator = 'OR';

    function Pill(pill) {
      var prefix, regexString, safePrefixes, safePrefixesStr, _i, _len, _ref2;

      pill || (pill = {});
      this.callback = pill.callback;
      this.prefixes = pill.prefixes;
      if (pill.logicalOperator != null) {
        this.logicalOperator = pill.logicalOperator;
      }
      safePrefixes = [];
      _ref2 = this.prefixes;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        prefix = _ref2[_i];
        safePrefixes.push(util.safeRegex(prefix));
      }
      safePrefixesStr = safePrefixes.join('|');
      regexString = "(" + safePrefixesStr + ")\\s*('[^']+'|\\\"[^\\\"]+\\\"|[^'\\\"\\s]\\S*)";
      this.regex = util.createRegex(regexString);
      this;
    }

    Pill.prototype.setSearchString = function(searchString) {
      var cleanedSearchString, match, value, values;

      cleanedSearchString = searchString;
      values = [];
      while (match = this.regex.exec(searchString)) {
        value = match[2].trim().replace(/(^['"]\s*|\s*['"]$)/g, '');
        switch (value) {
          case 'true':
          case 'TRUE':
            value = true;
            break;
          case 'false':
          case 'FALSE':
            value = false;
            break;
          case 'null':
          case 'NULL':
            value = null;
        }
        values.push(value);
        cleanedSearchString = cleanedSearchString.replace(match[0], '').trim();
      }
      this.searchString = searchString;
      this.values = values;
      return cleanedSearchString;
    };

    Pill.prototype.test = function(model) {
      var pass, value, _i, _j, _len, _len1, _ref2, _ref3, _ref4;

      if ((_ref2 = this.values) != null ? _ref2.length : void 0) {
        if (this.logicalOperator === 'OR') {
          pass = false;
          _ref3 = this.values;
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            value = _ref3[_i];
            pass = this.callback(model, value);
            if (pass) {
              break;
            }
          }
        } else if (this.logicalOperator === 'AND') {
          pass = false;
          _ref4 = this.values;
          for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
            value = _ref4[_j];
            pass = this.callback(model, value);
            if (!pass) {
              break;
            }
          }
        } else {
          throw new Error('Unkown logical operator type');
        }
      } else {
        pass = null;
      }
      return pass;
    };

    return Pill;

  })();

  Query = (function() {
    Query.prototype.source = null;

    Query.prototype.compiledSelectors = null;

    Query.prototype.selectors = {
      '$or': {
        compile: function(opts) {
          var queries, query, queryGroup, querySource, _i, _len;

          queries = [];
          queryGroup = util.toArrayGroup(opts.selectorValue);
          if (!queryGroup.length) {
            throw new Error("Query called with an empty " + selectorName + " statement");
          }
          for (_i = 0, _len = queryGroup.length; _i < _len; _i++) {
            querySource = queryGroup[_i];
            query = new Query(querySource);
            queries.push(query);
          }
          return {
            queries: queries
          };
        },
        test: function(opts) {
          var query, _i, _len, _ref2;

          _ref2 = opts.queries;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            query = _ref2[_i];
            if (query.test(opts.model)) {
              return true;
            }
          }
          return false;
        }
      },
      '$nor': {
        compile: function(opts) {
          return opts.selector('$or', opts);
        },
        test: function(opts) {
          return !opts.selector('$or', opts);
        }
      },
      '$and': {
        compile: function(opts) {
          return opts.selector('$or', opts);
        },
        test: function(opts) {
          var query, _i, _len, _ref2;

          _ref2 = opts.queries;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            query = _ref2[_i];
            if (query.test(opts.model) === false) {
              return false;
            }
          }
          return true;
        }
      },
      '$not': {
        compile: function(opts) {
          return opts.selector('$and', opts);
        },
        test: function(opts) {
          return !opts.selector('$and', opts);
        }
      },
      'string': {
        test: function(opts) {
          return opts.modelValueExists && opts.modelValue === opts.selectorValue;
        }
      },
      'number': {
        test: function(opts) {
          return opts.selector('string', opts);
        }
      },
      'boolean': {
        test: function(opts) {
          return opts.selector('string', opts);
        }
      },
      'array': {
        test: function(opts) {
          return opts.modelValueExists && (new Hash(opts.modelValue)).isSame(opts.selectorValue);
        }
      },
      'date': {
        test: function(opts) {
          return opts.modelValueExists && opts.modelValue.toString() === opts.selectorValue.toString();
        }
      },
      'regexp': {
        test: function(opts) {
          return opts.modelValueExists && opts.selectorValue.test(opts.modelValue);
        }
      },
      'null': {
        test: function(opts) {
          return opts.modelValue === opts.selectorValue;
        }
      },
      '$beginsWith': {
        test: function(opts) {
          var beginsWithParts, beginsWithValue, _i, _len;

          if (opts.selectorValue && opts.modelValueExists && util.isString(opts.modelValue)) {
            beginsWithParts = util.toArray(opts.selectorValue);
            for (_i = 0, _len = beginsWithParts.length; _i < _len; _i++) {
              beginsWithValue = beginsWithParts[_i];
              if (opts.modelValue.substr(0, beginsWithValue.length) === beginsWithValue) {
                return true;
                break;
              }
            }
          }
          return false;
        }
      },
      '$startsWith': {
        test: function(opts) {
          return opts.selector('$beginsWith', opts);
        }
      },
      '$endsWith': {
        test: function(opts) {
          var endsWithParts, endsWithValue, _i, _len;

          if (opts.selectorValue && opts.modelValueExists && util.isString(opts.modelValue)) {
            endsWithParts = util.toArray(opts.selectorValue);
            for (_i = 0, _len = endsWithParts.length; _i < _len; _i++) {
              endsWithValue = endsWithParts[_i];
              if (opts.modelValue.substr(endsWithValue.length * -1) === endsWithValue) {
                return true;
                break;
              }
            }
          }
          return false;
        }
      },
      '$finishesWith': {
        test: function(opts) {
          return opts.selector('$endsWith', opts);
        }
      },
      '$all': {
        test: function(opts) {
          if ((opts.selectorValue != null) && opts.modelValueExists) {
            if ((new Hash(opts.modelValue)).hasAll(opts.selectorValue)) {
              return true;
            }
          }
          return false;
        }
      },
      '$in': {
        test: function(opts) {
          if ((opts.selectorValue != null) && opts.modelValueExists) {
            if ((new Hash(opts.modelValue)).hasIn(opts.selectorValue) || (new Hash(opts.selectorValue)).hasIn(opts.modelValue)) {
              return true;
            }
          }
          return false;
        }
      },
      '$nin': {
        test: function(opts) {
          if ((opts.selectorValue != null) && opts.modelValueExists) {
            if ((new Hash(opts.modelValue)).hasIn(opts.selectorValue) === false && (new Hash(opts.selectorValue)).hasIn(opts.modelValue) === false) {
              return true;
            }
          }
          return false;
        }
      },
      '$has': {
        test: function(opts) {
          if (opts.modelValueExists) {
            if ((new Hash(opts.modelValue)).hasIn(opts.selectorValue)) {
              return true;
            }
          }
          return false;
        }
      },
      '$hasAll': {
        test: function(opts) {
          if (opts.modelValueExists) {
            if ((new Hash(opts.modelValue)).hasIn(opts.selectorValue)) {
              return true;
            }
          }
          return false;
        }
      },
      '$size': {
        test: function(opts) {
          if (opts.modelValue.length != null) {
            if (opts.modelValue.length === opts.selectorValue) {
              return true;
            }
          }
          return false;
        }
      },
      '$length': {
        test: function(opts) {
          return opts.selector('$size', opts);
        }
      },
      '$type': {
        test: function(opts) {
          if (typeof opts.modelValue === opts.selectorValue) {
            return true;
          }
          return false;
        }
      },
      '$like': {
        test: function(opts) {
          if (util.isString(opts.modelValue) && opts.modelValue.toLowerCase().indexOf(opts.selectorValue.toLowerCase()) !== -1) {
            return true;
          }
          return false;
        }
      },
      '$likeSensitive': {
        test: function(opts) {
          if (util.isString(opts.modelValue) && opts.modelValue.indexOf(opts.selectorValue) !== -1) {
            return true;
          }
          return false;
        }
      },
      '$exists': {
        test: function(opts) {
          if (opts.selectorValue === opts.modelValueExists) {
            return true;
          }
          return false;
        }
      },
      '$mod': {
        test: function(opts) {
          var $mod;

          if (opts.modelValueExists) {
            $mod = opts.selectorValue;
            if (!util.isArray($mod)) {
              $mod = [$mod];
            }
            if ($mod.length === 1) {
              $mod.push(0);
            }
            if ((opts.modelValue % $mod[0]) === $mod[1]) {
              return true;
            }
          }
          return false;
        }
      },
      '$eq': {
        test: function(opts) {
          if (util.isEqual(opts.modelValue, opts.selectorValue)) {
            return true;
          }
          return false;
        }
      },
      '$equal': {
        test: function(opts) {
          return opts.selector('$eq', opts);
        }
      },
      '$ne': {
        test: function(opts) {
          if (opts.modelValue !== opts.selectorValue) {
            return true;
          }
          return false;
        }
      },
      '$lt': {
        test: function(opts) {
          if ((opts.selectorValue != null) && util.isComparable(opts.modelValue) && opts.modelValue < opts.selectorValue) {
            return true;
          }
          return false;
        }
      },
      '$gt': {
        test: function(opts) {
          if ((opts.selectorValue != null) && util.isComparable(opts.modelValue) && opts.modelValue > opts.selectorValue) {
            return true;
          }
          return false;
        }
      },
      '$bt': {
        test: function(opts) {
          if ((opts.selectorValue != null) && util.isComparable(opts.modelValue) && opts.selectorValue[0] < opts.modelValue && opts.modelValue < opts.selectorValue[1]) {
            return true;
          }
          return false;
        }
      },
      '$lte': {
        test: function(opts) {
          if ((opts.selectorValue != null) && util.isComparable(opts.modelValue) && opts.modelValue <= opts.selectorValue) {
            return true;
          }
          return false;
        }
      },
      '$gte': {
        test: function(opts) {
          if ((opts.selectorValue != null) && util.isComparable(opts.modelValue) && opts.modelValue >= opts.selectorValue) {
            return true;
          }
          return false;
        }
      },
      '$bte': {
        test: function(opts) {
          if ((opts.selectorValue != null) && util.isComparable(opts.modelValue) && opts.selectorValue[0] <= opts.modelValue && opts.modelValue <= opts.selectorValue[1]) {
            return true;
          }
          return false;
        }
      }
    };

    function Query(source) {
      if (source == null) {
        source = {};
      }
      this.source = source;
      this.compileQuery();
    }

    Query.prototype.compileSelector = function(selectorName, selectorOpts) {
      var compileOpts, compiledSelector, key, opts, query, selector, selectors, value;

      if (selectorOpts == null) {
        selectorOpts = {};
      }
      query = this;
      selectors = this.selectors;
      opts = {
        selectorName: selectorName
      };
      selector = selectors[selectorName];
      if (!selector) {
        throw new Error("Couldn't find the selector " + selectorName);
      }
      for (key in selectorOpts) {
        if (!__hasProp.call(selectorOpts, key)) continue;
        value = selectorOpts[key];
        opts[key] = value;
      }
      if (selector.compile != null) {
        opts.selector = function(selectorName, opts) {
          return selectors[selectorName].compile(opts);
        };
        compileOpts = selector.compile(opts);
        for (key in compileOpts) {
          if (!__hasProp.call(compileOpts, key)) continue;
          value = compileOpts[key];
          opts[key] = value;
        }
      }
      opts.selector = function(selectorName, opts) {
        return selectors[selectorName].test(opts);
      };
      compiledSelector = {
        opts: opts,
        test: selector.test
      };
      return compiledSelector;
    };

    Query.prototype.testCompiledSelector = function(compiledSelector, model) {
      var match, opts, test;

      opts = compiledSelector.opts;
      test = compiledSelector.test;
      opts.model = model;
      opts.modelValue = util.get(opts.model, opts.fieldName);
      opts.modelId = util.get(opts.model, 'id');
      opts.modelValueExists = typeof opts.modelValue !== 'undefined';
      if (!opts.modelValueExists) {
        opts.modelValue = false;
      }
      match = test(opts);
      return match;
    };

    Query.prototype.compileQuery = function() {
      var advancedSelectorName, advancedSelectorValue, compiledSelector, compiledSelectors, fieldName, query, selectorValue, _ref2;

      query = this;
      compiledSelectors = [];
      _ref2 = this.source;
      for (fieldName in _ref2) {
        if (!__hasProp.call(_ref2, fieldName)) continue;
        selectorValue = _ref2[fieldName];
        if (fieldName === '$or' || fieldName === '$nor' || fieldName === '$and' || fieldName === '$not') {
          compiledSelector = this.compileSelector(fieldName, {
            fieldName: fieldName,
            selectorValue: selectorValue
          });
          compiledSelectors.push(compiledSelector);
        } else if (util.isString(selectorValue)) {
          compiledSelector = this.compileSelector('string', {
            fieldName: fieldName,
            selectorValue: selectorValue
          });
          compiledSelectors.push(compiledSelector);
        } else if (util.isNumber(selectorValue)) {
          compiledSelector = this.compileSelector('number', {
            fieldName: fieldName,
            selectorValue: selectorValue
          });
          compiledSelectors.push(compiledSelector);
        } else if (util.isBoolean(selectorValue)) {
          compiledSelector = this.compileSelector('boolean', {
            fieldName: fieldName,
            selectorValue: selectorValue
          });
          compiledSelectors.push(compiledSelector);
        } else if (util.isArray(selectorValue)) {
          compiledSelector = this.compileSelector('array', {
            fieldName: fieldName,
            selectorValue: selectorValue
          });
          compiledSelectors.push(compiledSelector);
        } else if (util.isDate(selectorValue)) {
          compiledSelector = this.compileSelector('date', {
            fieldName: fieldName,
            selectorValue: selectorValue
          });
          compiledSelectors.push(compiledSelector);
        } else if (util.isRegExp(selectorValue)) {
          compiledSelector = this.compileSelector('regexp', {
            fieldName: fieldName,
            selectorValue: selectorValue
          });
          compiledSelectors.push(compiledSelector);
        } else if (util.isNull(selectorValue)) {
          compiledSelector = this.compileSelector('null', {
            fieldName: fieldName,
            selectorValue: selectorValue
          });
          compiledSelectors.push(compiledSelector);
        } else if (util.isObject(selectorValue)) {
          for (advancedSelectorName in selectorValue) {
            if (!__hasProp.call(selectorValue, advancedSelectorName)) continue;
            advancedSelectorValue = selectorValue[advancedSelectorName];
            compiledSelector = this.compileSelector(advancedSelectorName, {
              fieldName: fieldName,
              selectorValue: advancedSelectorValue
            });
            compiledSelectors.push(compiledSelector);
          }
        }
      }
      this.compiledSelectors = compiledSelectors;
      return this;
    };

    Query.prototype.test = function(model) {
      var compiledSelector, match, _i, _len, _ref2;

      match = true;
      _ref2 = this.compiledSelectors;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        compiledSelector = _ref2[_i];
        match = this.testCompiledSelector(compiledSelector, model);
        if (match === false) {
          break;
        }
      }
      return match;
    };

    return Query;

  })();

  queryEngine = {
    safeRegex: util.safeRegex,
    createRegex: util.createRegex,
    createSafeRegex: util.createSafeRegex,
    generateComparator: util.generateComparator,
    toArray: util.toArray,
    util: util,
    Backbone: Backbone,
    Hash: Hash,
    QueryCollection: QueryCollection,
    Criteria: Criteria,
    Query: Query,
    Pill: Pill,
    setQuerySelector: function(selectorHandle, selectorObject) {
      if (selectorObject != null) {
        Query.prototype.selectors[selectorHandle] = selectorObject;
      } else {
        delete Query.prototype.selectors[selectorHandle];
      }
      return this;
    },
    testModels: function() {
      var args, criteria, models, result;

      models = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      models = util.toArray(models);
      criteria = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Criteria, args, function(){});
      result = criteria.testModels(models);
      return result;
    },
    createCollection: function(models, options) {
      var collection;

      models = util.toArray(models);
      collection = new QueryCollection(models, options);
      return collection;
    },
    createLiveCollection: function(models, options) {
      var collection;

      models = util.toArray(models);
      collection = new QueryCollection(models, options).live(true);
      return collection;
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = queryEngine;
  } else {
    this.queryEngine = queryEngine;
  }

}).call(this);
