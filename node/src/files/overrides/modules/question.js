/*  ******************************
  Module - Question Game Component
  Author: Jack Lukic
  Notes: First Commit June 20, 2012

  This was designed originally to be a refactoring of pricing game
  But abstracted to deal with any series of questions for a product
******************************  */

;(function ($, window, document, undefined) {

  $.fn.questionGame = function(parameters) {

    var
      settings = $.extend(true, {}, $.fn.questionGame.settings, parameters)
    ;

    $(this)
      .each(function() {
        var
          $module          = $(this),
          $throbber        = $module.find(settings.selector.throbber),

          $imageHolder     = $module.find(settings.selector.imageHolder),
          $image           = $module.find(settings.selector.image),

          $questionGroup   = $module.find(settings.selector.questionGroup),
          $title           = $module.find(settings.selector.title),
          $tagline         = $module.find(settings.selector.tagline),
          $influence       = $module.find(settings.selector.influence),

          $question        = $module.find(settings.selector.question),
          $questionText    = $module.find(settings.selector.questionText),
          $questionInput   = $module.find(settings.selector.questionInput),

          $yesButton       = $module.find(settings.selector.yesButton),
          $skipButton      = $module.find(settings.selector.skipButton),

          $skip            = $module.find(settings.selector.skip),
          $skipOptions     = $module.find(settings.selector.skipOptions),
          $skipInput       = $module.find(settings.selector.skipInput),
          $skipLabel       = $module.find(settings.selector.skipLabel),
          $noButton        = $module.find(settings.selector.noButton),
          $backButton      = $module.find(settings.selector.backButton),

          $message         = $module.find(settings.selector.message),
          $messageTitle    = $module.find(settings.selector.messageTitle),
          $messageContent  = $module.find(settings.selector.messageContent),
          $messageButton   = $module.find(settings.selector.messageButton),

          $currentQuestion = $module.find(settings.selector.currentQuestion),
          $totalQuestions  = $module.find(settings.selector.totalQuestions),

          module  = {

            initialize: function() {
              $module
                .addClass(settings.className.initialize)
              ;
              $.api({
                beforeSend   : module.beforeSend.initialize,
                method       : settings.method,
                url          : settings.endPoint,
                stateContext : $module,
                success      : function(response) {
                  $module
                    .removeClass(settings.className.initialize)
                  ;
                  module.refresh(response);
                },
                failure      : module.error
              });
            },

            // recieves api response and parses out what to do
            refresh: function(response) {
              if(response.message !== undefined) {
                module.change.message(response.message);
              }
              else if(response.question !== undefined) {
                if(response.question.product !== undefined) {
                  module.change.product(response.question.product);
                }
                module.change.question(response.question);
              }
              else {
                module.error(settings.errors.noQuestion);
              }
            },

            // update view with error message
            error: function(errorMessage) {
              console.warn('Question Module: ' + errorMessage);
              module.change.message({
                icon    : 'warning',
                title   : settings.defaultText.error,
                content : errorMessage,
                action: {
                  type: 'method',
                  value: 'init',
                  text: settings.defaultText.restart
                }
              });
            },

            // updates view
            change: {
              // updates view with new question
              question: function(question) {
                if(settings.questions[question.type] !== undefined) {
                  $module
                    .data('question', question.id)
                  ;
                  $currentQuestion
                    .html(question.current)
                  ;
                  $totalQuestions
                    .html(question.total)
                  ;
                  $questionText
                    .html(settings.questions[question.type])
                  ;
                  if(question.influenceAvailable) {
                    $influence
                      .show()
                    ;
                  }
                  else {
                    $influence
                      .hide()
                    ;
                  }
                  $skipInput
                    .val(settings.defaultText.skip)
                  ;
                  $skipOptions
                    .removeAttr('checked')
                  ;
                  if($questionInput.val() !== '') {
                    $questionInput
                      .val('')
                      .focus()
                    ;
                  }

                  module.show.question();
                }
                else {
                  module.error(settings.errors.unknownQuestion);
                }
              },
              // updates view with new product
              product: function(product) {
                $module
                  .data('product', product.id)
                ;
                $imageHolder
                  .attr('class', 'image loading')
                ;
                $title
                  .html('<a href="'+ product.url + '" target="_blank">' + product.title + '</a>')
                  .removeData('content xhr')
                  .data('id', product.id)
                  .preview({
                    action : 'product',
                    type   : 'productSummary'
                  })
                ;
                $tagline
                  .html(product.tagline)
                ;
                module.precache(product.image, function() {
                  $imageHolder
                    .removeClass('loading')
                  ;
                  $image
                    .css('opacity', 1)
                    .attr('src', product.image)
                    .removeAttr('style')
                  ;
                });
              },
              message: function(passedMessage) {
                var
                  message = (typeof passedMessage == 'string')
                    ? $.extend({}, settings.message, { message: passedMessage })
                    : $.extend({}, settings.message, passedMessage)
                ;

                $imageHolder
                  .attr('class', 'image')
                  .addClass(message.icon)
                ;
                $messageTitle
                  .html(message.title)
                ;
                $messageContent
                  .html(message.content)
                ;
                $messageButton
                  .hide()
                ;
                // determine action to attach to button (if any)
                if(message.action) {
                  try {
                    if(message.action.type == 'link') {
                      $messageButton
                        .html('<a href="'+ message.action.value + '">' + message.action.text + '</a>')
                        .followLink()
                        .show()
                      ;
                    }
                    else if(message.action.type == 'method') {
                      $messageButton
                        .html(message.action.text)
                        .off('click')
                        .show()
                      ;
                      if(message.action.value == 'refresh') {
                        $messageButton
                          .on('click', module.refresh)
                        ;
                      }
                      if(message.action.value == 'init') {
                        $messageButton
                          .on('click', module.initialize)
                        ;
                      }
                    }
                  }
                  catch(error) {
                    console.warn(error);
                    console.warn(settings.errors.logging);
                  }
                }
                module.show.message();
              }
            },

            show: {
              question: function() {
                $message
                  .hide()
                ;
                $skip
                  .hide()
                ;
                $questionGroup
                  .show()
                ;
                $question
                  .show()
                ;
              },
              skip: function() {
                $question
                  .hide()
                ;
                $message
                  .hide()
                ;
                $questionGroup
                  .show()
                ;
                $skip
                  .show()
                ;
              },
              message: function() {
                $skip
                  .hide()
                ;
                $influence
                  .hide()
                ;
                $question
                  .hide()
                ;
                $questionGroup
                  .hide()
                ;
                $message
                  .show()
                ;
              }
            },

            // skip a question for a reason
            skip: {
              selectLabelChoice: function() {
                var
                  $label      = $(this),
                  labelIndex  = $skipLabel.index($label),
                  $skipChoice = $skipOptions.eq(labelIndex)
                ;
                $skipOptions
                  .removeAttr('checked')
                  .eq(labelIndex)
                    .attr('checked', 'checked')
                ;
              },
              clearChoices: function() {
                $skipOptions.removeAttr('checked');
              }
            },

            // filter form before api request
            beforeSend: {
              initialize: function(requestSettings) {
                $throbber
                  .text(settings.defaultText.initialize)
                ;
                return settings.beforeSend(requestSettings);
              },
              yes: function(requestSettings) {
                var
                  userResponse = $.trim( $questionInput.val() ),
                  requestData  = module.createRequestData()
                ;
                // form validation
                switch(settings.type) {
                  case 'numeric':
                    if(!$.isNumeric(userResponse)) {
                      return false;
                    }
                  break;
                  case 'string':
                    if(userResponse === '') {
                      return false;
                    }
                  break;
                }
                $throbber
                  .text(settings.defaultText.yes)
                ;
                requestData.userResponse = userResponse;
                requestSettings.data = module.mapData(requestData);
                return settings.beforeSend(requestSettings);
              },
              no: function(requestSettings) {
                var
                  $skipOptions   = $(settings.selector.skipOptions),
                  skippedReason  = ($skipOptions.filter(':checked').val() !== undefined)
                    ? $skipOptions.filter(':checked').val()
                    : 'custom',
                  skippedMessage = (skippedReason == 'custom')
                    ? $.trim( $skipInput.val() )
                    : false,
                  requestData  = module.createRequestData()
                ;
                $throbber
                  .text(settings.defaultText.no)
                ;
                requestData.skippedReason = skippedReason;
                if(skippedMessage) {
                  if(skippedMessage == settings.defaultText.skip) {
                    return false;
                  }
                  requestData.skippedMessage = skippedMessage;
                }
                requestSettings.data = module.mapData(requestData);
                return settings.beforeSend(requestSettings);
              }
            },

            // creates standard request data
            createRequestData: function() {
              var
                requestData  = {},
                questionID   = ($module.data('question') !== undefined)
                  ? $module.data('question')
                  : false,
                productID    = ($module.data('product') !== undefined)
                  ? $module.data('product')
                  : false
              ;
              if(questionID) {
                requestData.questionID = questionID;
              }
              if(productID) {
                requestData.productID = productID;
              }
              return requestData;
            },

            // maps from json style to server style naming conventions (allow arbitrary renaming)
            mapData: function(requestData) {
              var
                serverData = {},
                propertyName
              ;
              // map to post params
              $.each(requestData, function(name, value) {
                propertyName = (typeof settings.dataMapping[name] !== undefined )
                  ? settings.dataMapping[name]
                  : name
                ;
                serverData[propertyName] = value;
              });
              return serverData;
            },

            // handle keyboard on form fields
            handleKeyboard: function(event) {
              var
                pressedKey    = event.which,
                keyCode       = {
                  enter  : 13,
                  escape : 27
                },
                isSkipSection = $skip.visible()
                  ? true
                  : false
              ;
              // enter
              if(pressedKey == keyCode.enter) {
                if(!isSkipSection) {
                  $yesButton.trigger('click');
                }
                else {
                  $noButton.trigger('click');
                }
              }
              // escape
              else if(pressedKey == keyCode.escape) {
                if(isSkipSection) {
                  module.question.show();
                }
              }
            },

            // precache image
            precache: function(images, callback) {
              if (!(images instanceof Array)) {
                  images = [images];
              }
              var
                imagesLength  = images.length,
                loadedCounter = 0,
                cache         = [],
                cacheImage    = document.createElement('img'),
                handleLoad = function(){
                    loadedCounter++;
                    if (loadedCounter >= imagesLength) {
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
            }
          }
        ;

        // attach events
        $yesButton
          .apiButton({
            beforeSend   : module.beforeSend.yes,
            method       : settings.method,
            url          : settings.endPoint,
            stateContext : $module,
            success      : module.refresh,
            failure      : module.error
          })
        ;
        $noButton
          .apiButton({
            beforeSend   : module.beforeSend.no,
            method       : settings.method,
            url          : settings.endPoint,
            stateContext : $module,
            success      : module.refresh,
            failure      : module.error
          })
        ;

        $questionInput
          .bind('keydown', module.handleKeyboard)
        ;
        $skipInput
          .defaultText(settings.defaultText.skip)
          .bind('focus', module.skip.clearChoices)
          .bind('keydown', module.handleKeyboard)
        ;
        $skipButton
          .on('click', module.show.skip)
        ;
        $skipLabel
          .on('click', module.skip.selectLabelChoice)
        ;
        $backButton
          .on('click', module.show.question)
        ;
        // do first load of content
        if(settings.initialize) {
          module.initialize();
        }
      })
    ;
    return this;
  };

  $.fn.questionGame.settings = {
      initialize   : false,

      beforeSend   : function(settings) { return settings; },
      type         : 'numeric',
      method       : 'POST',

      className: {
        initialize: 'init'
      },

      defaultText: {
        skip       : "There's another reason...",
        initialize : 'Initializing',
        yes        : 'Leaving feedback',
        no         : 'Skipping to next question',
        error      : 'Houston, we have a problem.',
        restart    : 'Restart Questions'
      },

      dataMapping: {
        questionID     : 'question_id',
        productID      : 'product_id',
        userResponse   : 'user_response',
        skipped        : 'skipped',
        skippedReason  : 'skipped_reason',
        skippedMessage : 'skipped_message'
      },

      errors : {
        logging         : 'Error in error logging, exiting.',
        unknownQuestion : 'Unknown question received',
        noQuestion      : 'No question received in response',
        unknownAction   : 'Unknown message action'
      },

      message          : {
        icon    : 'success',
        title   : 'Success',
        content : 'You answered all the questions we have. Thanks!',
        action  : false
      },

      selector : {
        questionGroup   : '.content hgroup, .content .position',
        title           : '.content .title',
        influence       : '.content .influence',
        tagline         : '.content .tagline',

        imageHolder     : '.image',
        image           : '.image img',
        throbber        : '> .throbber',

        question        : '.question',
        questionText    : '.question > p',
        questionInput   : '.suggestion input',

        yesButton       : '.yes.button',
        skipButton      : '.suggestion .skip.button',

        skip            : '.content > .skip',
        skipOptions     : '.skip input[type=radio]',
        skipLabel       : '.skip label',
        skipInput       : '.skip input.custom',
        noButton        : '.no.button',
        backButton      : '.back.button',

        currentQuestion : '.position .current',
        totalQuestions  : '.position .total',

        message         : '.message',
        messageTitle    : '.message > h2',
        messageContent  : '.message > p',
        messageButton   : '.message .button'
      }
  };

})( jQuery, window , document );
