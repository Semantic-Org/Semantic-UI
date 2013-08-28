/*  ******************************
  Module -  Chat Room
  Author: Jack Lukic
  Notes: First Commit Aug 8, 2012

  Designed as a simple modular chat component
******************************  */

;(function ($, window, document, undefined) {

  $.fn.chat = function(key, channelName, parameters) {
    var
      settings  = $.extend(true, {}, $.fn.chat.settings, parameters),

      className = settings.className,
      namespace = settings.namespace,
      selector  = settings.selector,
      error     = settings.error,

      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function() {
        var
          $module         = $(this),

          $expandButton   = $module.find(selector.expandButton),
          $userListButton = $module.find(selector.userListButton),

          $userList       = $module.find(selector.userList),
          $room           = $module.find(selector.room),
          $userCount      = $module.find(selector.userCount),

          $log            = $module.find(selector.log),
          $message        = $module.find(selector.message),

          $messageInput   = $module.find(selector.messageInput),
          $messageButton  = $module.find(selector.messageButton),

          instance        = $module.data('module'),

          html            = '',
          users           = {},

          channel,
          loggedInUser,

          message,
          count,

          height,

          pusher,
          module
        ;

        module = {

          width: {
            log      : $log.width(),
            userList : $userList.outerWidth()
          },

          initialize: function() {

            // check error conditions
            if(Pusher === undefined) {
              module.error(error.pusher);
            }
            if(key === undefined || channelName === undefined) {
              module.error(error.key);
              return false;
            }
            else if( !(settings.endpoint.message || settings.endpoint.authentication) ) {
              module.error(error.endpoint);
              return false;
            }

            // define pusher
            pusher                       = new Pusher(key);
            Pusher.channel_auth_endpoint = settings.endpoint.authentication;

            channel = pusher.subscribe(channelName);

            channel.bind('pusher:subscription_succeeded', module.user.list.create);
            channel.bind('pusher:subscription_error', module.error);
            channel.bind('pusher:member_added', module.user.joined);
            channel.bind('pusher:member_removed', module.user.left);
            channel.bind('update_messages', module.message.receive);

            $.each(settings.customEvents, function(label, value) {
              channel.bind(label, value);
            });

            // bind module events
            $userListButton
              .on('click.' +  namespace, module.event.toggleUserList)
            ;
            $expandButton
              .on('click.'   +  namespace, module.event.toggleExpand)
            ;
            $messageInput
              .on('keydown.' +  namespace, module.event.input.keydown)
              .on('keyup.'   +  namespace, module.event.input.keyup)
            ;
            $messageButton
              .on('mouseenter.' +  namespace, module.event.hover)
              .on('mouseleave.' +  namespace, module.event.hover)
              .on('click.' +  namespace, module.event.submit)
            ;
            // scroll to bottom of chat log
            $log
              .animate({
                scrollTop: $log.prop('scrollHeight')
              }, 400)
            ;
            $module
              .data('module', module)
              .addClass(className.loading)
            ;

          },

          // refresh module
          refresh: function() {
            // reset width calculations
            $userListButton
              .removeClass(className.active)
            ;
            module.width = {
              log      : $log.width(),
              userList : $userList.outerWidth()
            };
            if( $userListButton.hasClass(className.active) ) {
              module.user.list.hide();
            }
            $module.data('module', module);
          },

          user: {

            updateCount: function() {
              if(settings.userCount) {
                users = $module.data('users');
                count = 0;
                $.each(users, function() {
                  count++;
                });
                $userCount
                  .html( settings.templates.userCount(count) )
                ;
              }
            },

            // add user to user list
            joined: function(member) {
              users = $module.data('users');
              if(member.id != 'anonymous' && users[ member.id ] === undefined ) {
                users[ member.id ] = member.info;
                if(settings.randomColor && member.info.color === undefined) {
                  member.info.color = settings.templates.color(member.id);
                }
                html = settings.templates.userList(member.info);
                if(member.info.isAdmin) {
                  $(html)
                    .prependTo($userList)
                  ;
                }
                else {
                  $(html)
                    .appendTo($userList)
                  ;
                }
                if(settings.partingMessages) {
                  $log
                    .append( settings.templates.joined(member.info) )
                  ;
                  module.message.scroll.test();
                }
                module.user.updateCount();
              }
            },

            // remove user from user list
            left: function(member) {
              users = $module.data('users');
              if(member !== undefined && member.id !== 'anonymous') {
                delete users[ member.id ];
                $module
                  .data('users', users)
                ;
                $userList
                  .find('[data-id='+ member.id + ']')
                    .remove()
                ;
                if(settings.partingMessages) {
                  $log
                    .append( settings.templates.left(member.info) )
                  ;
                  module.message.scroll.test();
                }
                module.user.updateCount();
              }
            },

            list: {

              // receives list of members and generates user list
              create: function(members) {
                users = {};
                members.each(function(member) {
                  if(member.id !== 'anonymous' && member.id !== 'undefined') {
                    if(settings.randomColor && member.info.color === undefined) {
                      member.info.color = settings.templates.color(member.id);
                    }
                    // sort list with admin first
                    html = (member.info.isAdmin)
                      ? settings.templates.userList(member.info) + html
                      : html + settings.templates.userList(member.info)
                    ;
                    users[ member.id ] = member.info;
                  }
                });
                $module
                  .data('users', users)
                  .data('user', users[members.me.id] )
                  .removeClass(className.loading)
                ;
                $userList
                  .html(html)
                ;
                module.user.updateCount();
                $.proxy(settings.onJoin, $userList.children())();
              },

              // shows user list
              show: function() {
                $log
                  .animate({
                    width: (module.width.log - module.width.userList)
                  }, {
                    duration : settings.speed,
                    easing   : settings.easing,
                    complete : module.message.scroll.move
                  })
                ;
              },

              // hides user list
              hide: function() {
                $log
                  .stop()
                  .animate({
                    width: (module.width.log)
                  }, {
                    duration : settings.speed,
                    easing   : settings.easing,
                    complete : module.message.scroll.move
                  })
                ;
              }

            }

          },

          message: {

            // handles scrolling of chat log
            scroll: {
              test: function() {
                height = $log.prop('scrollHeight') - $log.height();
                if( Math.abs($log.scrollTop() - height) < settings.scrollArea) {
                  module.message.scroll.move();
                }
              },

              move: function() {
                height = $log.prop('scrollHeight') - $log.height();
                $log
                  .scrollTop(height)
                ;
              }
            },

            // sends chat message
            send: function(message) {
              if( !module.utils.emptyString(message) ) {
                $.api({
                  url    : settings.endpoint.message,
                  method : 'POST',
                  data   : {
                    'chat_message': {
                      content   : message,
                      timestamp : new Date().getTime()
                    }
                  }
                });
              }
            },

            // receives chat response and processes
            receive: function(response) {
              message      = response.data;
              users        = $module.data('users');
              loggedInUser = $module.data('user');
              if(users[ message.userID] !== undefined) {
                // logged in user's messages already pushed instantly
                if(loggedInUser === undefined || loggedInUser.id != message.userID) {
                  message.user = users[ message.userID ];
                  module.message.display(message);
                }
              }
            },

            // displays message in chat log
            display: function(message) {
              $log
                .append( settings.templates.message(message) )
              ;
              module.message.scroll.test();
              $.proxy(settings.onMessage, $log.children().last() )();
            }

          },

          expand: function() {
            $module
              .addClass(className.expand)
            ;
            $.proxy(settings.onExpand, $module )();
            module.refresh();
          },

          contract: function() {
            $module
              .removeClass(className.expand)
            ;
            $.proxy(settings.onContract, $module )();
            module.refresh();
          },

          event: {

            input: {

              keydown: function(event) {
                if(event.which == 13) {
                  $messageButton
                    .addClass(className.down)
                  ;
                }
              },

              keyup: function(event) {
                if(event.which == 13) {
                  $messageButton
                    .removeClass(className.down)
                  ;
                  module.event.submit();
                }
              }

            },

            // handles message form submit
            submit: function() {
              var
                message      = $messageInput.val(),
                loggedInUser = $module.data('user')
              ;
              if(loggedInUser !== undefined && !module.utils.emptyString(message)) {
                module.message.send(message);
                // display immediately
                module.message.display({
                  user: loggedInUser,
                  text: message
                });
                module.message.scroll.move();
                $messageInput
                  .val('')
                ;

              }
            },

            // handles button click on expand button
            toggleExpand: function() {
              if( !$module.hasClass(className.expand) ) {
                $expandButton
                  .addClass(className.active)
                ;
                module.expand();
              }
              else {
                $expandButton
                  .removeClass(className.active)
                ;
                module.contract();
              }
            },

            // handles button click on user list button
            toggleUserList: function() {
              if( !$log.is(':animated') ) {
                if( !$userListButton.hasClass(className.active) ) {
                  $userListButton
                    .addClass(className.active)
                  ;
                  module.user.list.show();
                }
                else {
                  $userListButton
                    .removeClass('active')
                  ;
                  module.user.list.hide();
                }
              }

            }
          },

          utils: {

            emptyString: function(string) {
              if(typeof string == 'string') {
                return (string.search(/\S/) == -1);
              }
              return false;
            }

          },

          // standard methods
          debug: function(message) {
            if(settings.debug) {
              console.info(settings.moduleName + ': ' + message);
            }
          },
          error: function(errorMessage) {
            console.warn(settings.moduleName + ': ' + errorMessage);
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
                module.error(error.method);
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

  $.fn.chat.settings = {

    name      : 'Chat',
    debug           : false,
    namespace       : 'chat',

    onJoin          : function(){},
    onMessage       : function(){},
    onExpand        : function(){},
    onContract      : function(){},

    customEvents    : {},

    partingMessages : false,
    userCount       : true,

    randomColor     : true,

    speed           : 300,
    easing          : 'easeOutQuint',

    // pixels from bottom of chat log that should trigger auto scroll to bottom
    scrollArea      : 9999,

    endpoint        : {
      message        : false,
      authentication : false
    },

    errors: {
      method   : 'The method you called is not defined',
      endpoint : 'Please define a message and authentication endpoint.',
      key      : 'You must specify a pusher key and channel.',
      pusher   : 'You must include the Pusher library.'
    },

    className   : {
      expand  : 'expand',
      active  : 'active',
      hover   : 'hover',
      down    : 'down',
      loading : 'loading'
    },

    selector    : {
      userCount    : '.actions .message',
      userListButton : '.actions .button.user-list',
      expandButton   : '.actions .button.expand',
      room           : '.room',
      userList       : '.room .user-list',
      log            : '.room .log',
      message        : '.room .log .message',
      author         : '.room log .message .author',
      messageInput   : '.talk input',
      messageButton  : '.talk .send.button'
    },

    templates: {

      userCount: function(number) {
        return number + ' users in chat';
      },

      color: function(userID) {
        var
          colors = [
            '#000000',
            '#333333',
            '#666666',
            '#999999',
            '#CC9999',
            '#CC6666',
            '#CC3333',
            '#993333',
            '#663333',
            '#CC6633',
            '#CC9966',
            '#CC9933',
            '#999966',
            '#CCCC66',
            '#99CC66',
            '#669933',
            '#669966',
            '#33A3CC',
            '#336633',
            '#33CCCC',
            '#339999',
            '#336666',
            '#336699',
            '#6666CC',
            '#9966CC',
            '#333399',
            '#663366',
            '#996699',
            '#993366',
            '#CC6699'
          ]
        ;
        return colors[ Math.floor( Math.random() * colors.length) ];
      },

      message: function(message) {
        var
          html = ''
        ;
        if(message.user.isAdmin) {
          message.user.color = '#55356A';
          html += '<div class="admin message">';
          html += '<span class="quirky ui flag team"></span>';
        }
        /*
        else if(message.user.isPro) {
          html += '<div class="indent message">';
          html += '<span class="quirky ui flag pro"></span>';
        }
        */
        else {
          html += '<div class="message">';
        }
        html += '<p>';
        if(message.user.color !== undefined) {
          html += '<span class="author" style="color: ' + message.user.color + ';">' + message.user.name + '</span>: ';
        }
        else {
          html += '<span class="author">' + message.user.name + '</span>: ';
        }
        html += ''
          +   message.text
          + ' </p>'
          + '</div>'
        ;
        return html;
      },

      joined: function(member) {
        return (typeof member.name !== undefined)
          ? '<div class="status">' + member.name + ' has joined the chat.</div>'
          : false
        ;
      },
      left: function(member) {
        return (typeof member.name !== undefined)
          ? '<div class="status">' + member.name + ' has left the chat.</div>'
          : false
        ;
      },

      userList: function(member) {
        var
          html = ''
        ;
        if(member.isAdmin) {
          member.color = '#55356A';
        }
        html +=  ''
          + '<div class="user" data-id="' + member.id + '">'
          + ' <div class="image">'
          + '   <img src="' + member.avatarURL + '">'
          + ' </div>'
        ;
        if(member.color !== undefined) {
          html += ' <p><a href="/users/' + member.id + '" target="_blank" style="color: ' + member.color + ';">' + member.name + '</a></p>';
        }
        else {
          html += ' <p><a href="/users/' + member.id + '" target="_blank">' + member.name + '</a></p>';
        }
        html += '</div>';
        return html;
      }

    }

  };

})( jQuery, window , document );
