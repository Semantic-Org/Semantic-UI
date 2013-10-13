semantic.playground = {};

window.ui = {};

$.api.settings.api = {
  'getSpecification': 'spec/{$type}.json'
};

$.fn.dropdown.settings.animation.hide = 'none';

$.fn.dropdown.debug = false;
$.fn.checkbox.debug = false;
$.fn.api.debug = false;
$.fn.popup.debug = false;

// ready event
semantic.playground.ready = function() {

  // selector cache
  var
    $uiMenu          = $('.ui.menu'),
    $elements        = $('.element.menu'),
    $elementChoice   = $elements.find('.selection.dropdown'),

    $variations      = $('.variation.menu'),
    $variationForm   = $variations.find('.form'),
    $variationChoice = $variations.find('.selection'),

    $types           = $('.type.menu'),
    $typeForm        = $types.find('.form'),
    $typeChoice      = $types.find('.selection'),

    $preview         = $('.preview.segment'),
    $text            = $('.text'),

    $page            = $('.page.column'),

    $view            = $('.view.buttons .button'),
    $previewView     = $view.filter('.preview'),
    $htmlView        = $view.filter('.html'),

    $download        = $('.download.button'),

    $addElement      = $('.add.button'),

    template = {},


    // alias
    handler = {

      initialize: function() {

        template.select   = handler.template.compile('select'),
        template.checkbox = handler.template.compile('checkbox'),

        handler.interface.get('button');
        handler.attachEvents();
      },

      attachEvents: function() {
        $elementChoice
          .dropdown({
            action   : 'form',
            onChange : function(type) {
              $.proxy(handler.interface.setExclusive, this)();
              handler.interface.get(type);
            }
          })
        ;
        $addElement
          .on('click', handler.preview.add)
        ;
        $previewView
          .on('click', handler.view.preview)
        ;
        $htmlView
          .on('click', handler.view.html)
        ;
      },

      preview: {

        add: function() {
          handler.item.insert( $preview.html() );
        },

        get: function() {
          console.log('Making preview');
          var
            koan =$typeForm.find('.dropdown:not(.default) input').val() || false,
            classNames,
            $element,
            dummyText = ['Submit', 'Add', 'Create']
          ;
          classNames = handler.interface.getValues($variationForm);
          if(koan) {
            $element = $
              .zc(koan)
              .addClass(classNames.join(' '))
            ;
            handler.preview.addText($element);
            $preview
              .empty()
              .append($element)
            ;
          }

          // add class names
        },

        addText: function($element) {
          var
            $parts = $element.children()
          ;
          if($parts.size() === 0) {
            $element.text('Example');
          }
          else {
            $parts
              .each(function() {
                handler.preview.preview.addText($(this));
              })
            ;
          }
        },

        update: function() {
          $preview.html( handler.preview.get() );
        }

      },

      types: {
        create: function(type) {
          var
            html = '',
            ui = window.ui[type] || false,
            format = (ui)
              ? ui['Types']
              : {}
          ;
          handler.interface.addForm($typeForm, format);
          $typeForm
            .find('.dropdown')
              .dropdown('setting', 'onChange', handler.interface.setExclusive)
          ;
        },
        toggle: function() {

        }
      },

      variations: {

        create: function(type) {
          var
            html = '',
            ui = window.ui[type] || false,
            format = (ui)
              ? ui['Variations']
              : {}
          ;
          handler.interface.addForm($variationForm, format);
        },

        toggle: function() {

        }

      },

      interface: {
        addForm: function($element, list) {
          var
            html = ''
          ;
          $.each(list, function(name, variation) {
            // complex variation
            if( $.isPlainObject(variation) && variation.selector !== undefined) {

            }
            // select box
            else if( $.isArray(variation) || $.isPlainObject(variation) ) {
              html += template.select({
                name   : name,
                values : variation
              });
            }
            // checkbox
            else if( typeof variation == 'string') {
              html += template.checkbox({
                value: variation
              });
            }
          });
          $(html)
            .appendTo($element)
          ;
          $element
            .find('.dropdown')
              .dropdown({
                action   : 'form',
                onChange : handler.preview.update
              })
              .end()
            .find('.checkbox')
              .checkbox({
                onChange: handler.preview.update
              })
          ;
          return $element;
        },
        getValues: function($form) {
          var
            $inputs    = $form.find('input'),
            classNames = []
          ;
          $inputs
            .each(function() {
              var 
                type  = $(this).attr('type'),
                value = $(this).val()
              ;
              if( type == 'hidden' && value != 'none') {
                classNames.push(value);
              }
              else if( type == 'checkbox' && $(this).is(':checked') ) {
                classNames.push(value);
              }
            })
          ;
          console.log(classNames);
          return classNames;
        },
        setExclusive: function() {
          $(this)
            .removeClass('default')
            .closest('.item').find('.dropdown')
              .not( $(this) )
              .addClass('default')
              .find('.text')
                .html('---')
                .end()
              .find('input')
                .val('')
          ;
        },
        clear: function() {
          $typeForm.empty();
          $variationForm.empty();
        },
        update: function(type) {
          handler.types.create(type);
          handler.variations.create(type);
        },
        get: function(type) {
          if(type !== undefined) {
            if(window.ui[type] === undefined) {
              $.api({
                action: 'getSpecification',
                urlData: {
                  type: type
                },
                success: function(json) {
                  window.ui[type] = json;
                  handler.interface.update(type);
                },
                failure: function() {
                  window.ui[type] = {};
                  handler.interface.clear();
                }
              });
            }
            else {
              handler.interface.update(type);
            }
          }
        }
      },

      item: {
        update: function(type) {
        },
        change: function(type) {
        },
        highlight: function() {

        },
        insert: function(html) {
          if( $page.hasClass('default') ) {
            $page
              .removeClass('default')
              .empty()
            ;
          }
          $(html)
            .appendTo($page)
          ;
        },
        remove: function() {

        }

      },

      template: {
        compile: function(name) {
          var template = Handlebars.compile($('script.'+name).html());
          return ($.isFunction(template))
            ? template
            : false
          ;
        }
      },

      view: {
        preview: function() {
          $(this)
            .addClass('active')
            .siblings()
              .removeClass('active')
          ;
        },
        html: function() {
          $(this)
            .addClass('active')
            .siblings()
              .removeClass('active')
          ;
        }
      },

      components: {

        add: function() {

        },
        remove: function() {

        }
      },

      activate: function(value) {
        if(!$(this).hasClass('dropdown')) {
          $(this)
            .addClass('active')
            .closest('.ui.playground')
            .find('.item')
              .not($(this))
              .removeClass('active')
          ;
        }
      }

    }
  ;

  handler.initialize();

};


// attach ready event
$(document)
  .ready(semantic.playground.ready)
;