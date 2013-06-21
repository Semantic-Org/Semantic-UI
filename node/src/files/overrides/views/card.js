/*  ******************************
  Card
  Author: Jack Lukic
  Notes: First Commit June 13, 2013

  Quirky Cards
******************************  */

;(function ($, window, document, undefined) {

$.fn.card = function(parameters) {
  var
    $allModules     = $(this),
    
    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.fn.card.settings, parameters)
      : $.fn.card.settings,

    eventNamespace  = '.' + settings.namespace,
    moduleNamespace = 'module-' + settings.namespace,
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    invokedResponse,
    allModules
  ;
  $allModules
    .each(function(moduleIndex) {
      var
        $module      = $(this),
        $dimmer      = $module.find(settings.selector.dimmer),
        $vote        = $module.find(settings.selector.vote),
        $voteCount   = $module.find(settings.selector.voteCount),
        $progressBar = $module.find(settings.selector.progressBar),
        $project     = $module.find(settings.selector.project),
        $follow      = $module.find(settings.selector.follow),
        $close       = $module.find(settings.selector.close),
        
        initialVotes = $module.data('votes') || false,
        
        selector     = $module.selector || '',
        element      = this,
        instance     = $module.data('module-' + settings.namespace),
        
        className    = settings.className,
        metadata     = settings.metadata,
        namespace    = settings.namespace,
        animation    = settings.animation,
        
        errors       = settings.errors,
        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing card', $module);
          if( initialVotes ) {
            module.verbose('Setting initial votes to', initialVotes);
            setTimeout(function() {
              module.set.votes( initialVotes );
            }, moduleIndex * settings.animationDelay);
          }
          console.log($dimmer.size());
          if($dimmer.size() > 0) {
            module.verbose('Adding dimmer events');
            $module
              .dimmer({
                on        : 'hover',
                closable  : false,
                className : {
                  dimmable: 'card'
                }
              })
            ;
            $close
              .on('click', module.undim)
            ;
          }
          if($vote.size() > 0) {
            module.verbose('Adding vote button');
            $vote
              .apiButton( $.extend(true, {}, settings.api.vote, module.api.vote) )
              .state($.extend(true, {}, settings.state.vote, { 
                onChange: module.toggle.vote
              }))
            ;
          }
          if($project.size() > 0) {
            module.verbose('Adding project popups');
            $project
              .popup(settings.popup.project)
            ;
          }
          if($follow.size() > 0) {
            module.verbose('Adding follow button');
            $follow
              .popup(settings.popup.follow)
              .apiButton( $.extend(true, {}, settings.api.follow, module.api.follow) )
              .state(settings.state.follow)
            ;
          }
          $module
            .data('module', module)
          ;
        },

        destroy: function() {
          module.debug('Destroying previous card for', $module);
          $module
            .off(namespace)
          ;
        },

        api: {

          vote: {
            beforeSend: function(settings) {
              if( $(this).hasClass(className.active) ) {
                settings.method = 'DELETE';
              }
              return settings;
            }
          },
          follow: {
            beforeSend: function(settings) {
              if( $(this).hasClass(className.active) ) {
                settings.method = 'DELETE';
              }
              return settings;
            }
          }

        },

        enable: {
          allVotes: function() {
            $allModules.find(settings.selector.vote).state('allow', 'active');
          },
          votes: function() {
            $vote.state('allow', 'active');
          }
        },
        disable: {
          allVotes: function() {
            $allModules.find(settings.selector.vote).state('disallow', 'active');
          },
          votes: function() {
            $vote.state('disallow', 'active');
          }
        },

        get: {
          request: function(type) {
            if( type == 'vote' ) {
              return $vote.data('promise') || false;
            }
            else if( type == 'follow' ) {
              return $follow.data('promise') || false;
            }
          },
          progress: function() {
            return ( module.get.votes() / settings.maxVotes * 100);
          },
          votes: function() {
            return ( settings.maxVotes - module.get.votesLeft() ) || 0;
          },
          votesLeft: function() {
            return parseInt($voteCount.html(), 10) || 0;
          }
        },

        set: {
          votes: function(count) {
            module.debug('Setting votes to', count);
            if(count <= settings.maxVotes) {
              $voteCount
                .html( settings.maxVotes - count )
              ;
              $progressBar
                .css('width', module.get.progress() + '%')
              ;
              if(count == settings.maxVotes) {
                module.debug('Reached maximum votes');
                settings.onVoteMax();
              }
            }
            else {
              module.error(settings.votesExceeded);
            }
          }
        },

        toggle: {
          vote: function() {
            module.debug('Toggling user vote');
            if( $vote.hasClass(className.active) ) {
              module.add.vote();
            }
            else {
              module.remove.vote();
            }
          }
        },
        add: {
          vote: function() {
            module.debug('Adding vote');
            module.set.votes( module.get.votes() + 1 );
            $module
              .addClass(className.voted)
            ;
          }
        },
        remove: {
          vote: function() {
            module.debug('Removing vote');
            module.set.votes( module.get.votes() - 1 );
            $module
              .removeClass(className.voted)
            ;
          }
        },

        dim: function() {
          $module.dimmer('show');
        },
        undim: function() {
          $module.dimmer('hide');
        },

        
        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, settings, name);
            }
            else {
              settings[name] = value;
            }
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
              module.debug = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
            }
          }
        },
        error: function() {
          if(console.log !== undefined) {
            module.error = Function.prototype.bind.call(console.error, console, settings.moduleName + ':');
          }
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
              previousTime  = time || currentTime,
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : message[1] || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.moduleName + ':',
              totalTime = 0
            ;
            time        = false;
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
            maxDepth,
            found
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split('.');
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
                return true;
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return true;
              }
              module.error(errors.method);
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            instance.verbose('Executing invoked function', found);
            return found.apply(context, passedArguments);
          }
          return found || false;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        invokedResponse = module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.card.settings = {
  
  moduleName  : 'Card',

  debug       : true,
  verbose     : true,
  performance : true,

  selector    : {
    close       : '.close.icon',
    dimmer      : '.dimmer',
    follow      : '.follow.button',
    progressBar : '.progress .bar',
    project     : '.projects .project',
    vote        : '.vote.button',
    voteCount   : '.meta .votes .count'
  },
  
  onVote      : function(){},
  onVoteMax   : function(){},

  errors: {
    method        : 'The method you called is not defined',
    votesExceeded : 'This idea has already reached its maximum vote count'
  },

  className   : {
    active    : 'active',
    hover     : 'hover',
    voted     : 'voted'
  },

  api: {
    vote: {
      action: 'vote',
      success: function(){}
    },
    follow: {
      action: 'follow',
      success: function(){}
    }
  },

  maxVotes       : 200,
  animationDelay : 50,

  state: {
    vote: {
      states: {
        active: true
      },
      className: {
        active: 'active positive'
      },
      text: {
        inactive : 'Vote',
        active   : 'Voted!',
        disable  : 'Undo'
      }
    },
    follow: {
      states: {
        active: true
      },
      text: {
        inactive : 'Follow',
        active   : 'Following',
        disable  : 'Undo'
      }
    }
  },

  popup: {
    project: {
      delay   : 200,
      position: 'right center',
      inline: false
    },
    follow: {
      delay   : 500,
      content : 'You used up all of your votes for today. Follow this idea and vote on it tomorrow.'
    }
  }

};

})( jQuery, window , document );
