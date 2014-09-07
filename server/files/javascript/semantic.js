// namespace
window.semantic = {
  handler: {}
};

// Allow for console.log to not break IE
if (typeof window.console == "undefined" || typeof window.console.log == "undefined") {
  window.console = {
    log  : function() {},
    info : function(){},
    warn : function(){}
  };
}
if(typeof window.console.group == 'undefined' || typeof window.console.groupEnd == 'undefined' || typeof window.console.groupCollapsed == 'undefined') {
  window.console.group = function(){};
  window.console.groupEnd = function(){};
  window.console.groupCollapsed = function(){};
}
if(typeof window.console.markTimeline == 'undefined') {
  window.console.markTimeline = function(){};
}
window.console.clear = function(){};

// ready event
semantic.ready = function() {

  // selector cache
  var

    $sortableTables   = $('.sortable.table'),
    $sticky           = $('.ui.sticky'),

    $themeDropdown    = $('.theme.dropdown'),

    $ui               = $('.ui').not('.hover, .down'),
    $swap             = $('.theme.menu .item'),
    $menu             = $('#menu'),
    $hideMenu         = $('#menu .hide.item'),
    $sortTable        = $('.sortable.table'),
    $demo             = $('.demo'),

    $menuPopup        = $('.ui.main.menu .popup.item'),
    $menuDropdown     = $('.ui.main.menu .dropdown'),
    $pageTabMenu      = $('.tab.header.segment .tabular.menu'),
    $pageTabs         = $('.tab.header.segment .menu .item'),

    $downloadDropdown = $('.download.buttons .dropdown'),

    $helpPopup        = $('.header .help.icon'),

    $example          = $('.example'),
    $shownExample     = $example.filter('.shown'),

    $developer        = $('.developer.item'),
    $overview         = $('.overview.item, .overview.button'),
    $designer         = $('.designer.item'),

    $sidebarButton    = $('.fixed.launch.button'),
    $code             = $('div.code').not('.existing'),
    $existingCode     = $('.existing.code'),

    // alias
    handler
  ;


  // event handlers
  handler = {

    createIcon: function() {
      $example
        .each(function(){
          $('<i/>')
            .addClass('icon code')
            .prependTo( $(this) )
          ;
        })
      ;
    },

    getSpecification: function(callback) {
      var
        url = $(this).data('url') || false
      ;
      callback = callback || function(){};
      if(url) {
        $.ajax({
          method: 'get',
          url: url,
          type: 'json',
          complete: callback
        });
      }
    },

    less: {

      parseFile: function(content) {
        var
          variables = {},
          lines = content.match(/^(@[\s|\S]+?;)/gm),
          name,
          value
        ;
        $.each(lines, function(index, line) {
          // clear whitespace
          line = $.trim(line);
          // match variables only
          if(line[0] == '@') {
            name = line.match(/^@(.+):/);
            value = line.match(/:\s*([\s|\S]+?;)/);
            if( ($.isArray(name) && name.length >= 2) && ($.isArray(value) && value.length >= 2) ) {
              name = name[1];
              value = value[1];
              variables[name] = value;
            }
          }
        });
        console.log(variables);
        return variables;
      },

      changeTheme: function(theme) {
        var
          variableURL = '/build/less/themes/packages/{$theme}/{$type}s/{$element}.variables',
          overrideURL = '/build/less/themes/packages/{$theme}/{$type}s/{$element}.overrides',
          urlData     = {
            theme   : typeof(theme === 'string')
              ? theme.toLowerCase()
              : theme,
            type    : $themeDropdown.data('type'),
            element : $themeDropdown.data('element')
          }
        ;
        $themeDropdown
          .api({
            on       : 'now',
            url      : variableURL,
            dataType : 'text',
            urlData  : urlData,
            success: function(content) {
              less.modifyVars( handler.less.parseFile(content) );
              $themeDropdown
                .api({
                  on       : 'now',
                  url      : overrideURL,
                  dataType : 'text',
                  urlData  : urlData,
                  success: function(content) {
                    if( $('style.override').size() > 0 ) {
                      $('style.override').remove();
                    }
                    console.log(content);
                    $('<style>' + content + '</style>')
                      .addClass('override')
                      .appendTo('body')
                    ;
                  }
                })
              ;
            }
          })
        ;
      }

    },

    create: {
      examples: function(json) {
        var
          types      = json['Types'],
          text       = json['Text'],
          states     = json['States'],
          variations = json['Variations'],

          $element,
          html
        ;
        $.each(types, function(name, type){
          html += '<h2 class="ui dividing header">' + name + '</h2';
          if($.isPlainObject(type)) {
            $.each(type, function(name, subType) {
              $element = $.zc(subType);
              $element = handler.create.text($element, text);
              html += '<h3 class="ui header">' + name + '</h3';
              html += handler.create.variations($element, variations);
            });
          }
          else {
            $element = $.zc(type);
            $element = handler.create.text($element);
            html += handler.create.variations($element, variations);
          }
        });
        // Each TYPE
        //   show type name
        //   html = koan (html)
        //   each text
        //     find label
        //     if(obj)
        //       replace random text
        //     else
        //       replace text
        //   end
        //   Each variation
        //     (if obj)
        //       each
        //         add class
        //     (else)
        //       add class
        //     label = property
        //     class = class
        //     show html
        //   end
        // end
      },
      element: function(koan, type, text, variation) {

      },
      variations: function($element, variations) {
        $.each(variations, function(name, variation){

        });
      },
      text: function($element, text) {
        $.each(text, function(selector, text) {
          $element.find(selector).text(text);
        });
        return $element;
      }
    },
    overviewMode: function() {
      var
        $button  = $(this),
        $body    = $('body'),
        $example = $('.example')
      ;
      $body.toggleClass('overview');
      $button.toggleClass('active');
      if($body.hasClass('overview')) {
        $developer.addClass('disabled').popup('destroy');
        $designer.addClass('disabled').popup('destroy');
        $example.each(function() {
          $(this).children().not('.ui.header:eq(0), .example p:eq(0), .annotation').hide();
        });
        $example.filter('.another').hide();
      }
      else {
        $developer.removeClass('disabled').popup();
        $designer.removeClass('disabled').popup();
        $example.each(function() {
          $(this).children().not('.ui.header:eq(0), .example p:eq(0), .annotation').show();
        });
        $example.filter('.another').show();
      }
    },
    developerMode: function() {
      var
        $example = $('.example').not('.no')
      ;
      $developer.addClass('active');
      $designer.removeClass('active');
      $example
        .each(function() {
          $.proxy(handler.createCode, $(this))('developer');
        })
      ;
    },
    designerMode: function() {
      var
        $example = $('.example').not('.no')
      ;
      $designer.addClass('active');
      $developer.removeClass('active');
      $example
        .each(function() {
          $.proxy(handler.createCode, $(this))('designer');
        })
      ;
    },

    getIndent: function(text) {
      var
        lines           = text.split("\n"),
        firstLine       = (lines[0] === '')
          ? lines[1]
          : lines[0],
        spacesPerIndent = 2,
        leadingSpaces   = firstLine.length - firstLine.replace(/^\s*/g, '').length,
        indent
      ;
      if(leadingSpaces !== 0) {
        indent = leadingSpaces;
      }
      else {
        // string has already been trimmed, get first indented line and subtract 2
        $.each(lines, function(index, line) {
          leadingSpaces = line.length - line.replace(/^\s*/g, '').length;
          if(leadingSpaces !== 0) {
            indent = leadingSpaces - spacesPerIndent;
            return false;
          }
        });
      }
      return indent || 4;
    },

    generateCode: function() {
      var
        $example    = $(this).closest('.example'),
        $annotation = $example.find('.annotation'),
        $code       = $annotation.find('.code'),
        $header     = $example.not('.another').children('.ui.header:first-of-type').eq(0).add('p:first-of-type'),
        $ignored    = $('i.code:first-child, .code, .existing, .instructive, .language.label, .annotation, br, .ignore, .ignored'),
        $demo       = $example.children().not($header).not($ignored),
        code        = ''
      ;
      if( $code.size() === 0) {
        $demo
          .each(function(){
            var $this = $(this).clone(false);
            if($this.not('br')) {
              code += $this.removeAttr('style').get(0).outerHTML + "\n";
            }
          })
        ;
      }
      $example.data('code', code);
      return code;
    },
    createCode: function(type) {
      var
        $example        = $(this).closest('.example'),
        $header         = $example.children('.ui.header:first-of-type').eq(0).add('p:first-of-type'),
        $annotation     = $example.find('.annotation'),
        $code           = $annotation.find('.code'),
        $ignoredContent = $('.ui.popup, i.code:first-child, .code, .existing.segment, .instructive, .language.label, .annotation, br, .ignore, .ignored'),
        $demo           = $example.children().not($header).not($ignoredContent),
        code            = $example.data('code') || $.proxy(handler.generateCode, this)()
      ;
      if( $code.hasClass('existing') ) {
        $annotation.show();
        $code.removeClass('existing');
        $.proxy(handler.initializeCode, $code)();
      }

      if($annotation.size() === 0) {
        $annotation = $('<div/>')
          .addClass('annotation')
          .appendTo($example)
        ;
      }

      if( $example.find('.instructive').size() === 0) {
        $code = $('<div/>')
          .data('type', 'html')
          .addClass('code')
          .html(code)
          .hide()
            .appendTo($annotation)
        ;
        $.proxy(handler.initializeCode, $code)();
      }

      if( ($demo.first().is(':visible') || type == 'developer') && type != 'designer' ) {
        $demo.hide();
        $header.show();
        $annotation.fadeIn(500);
      }
      else {
        $annotation.hide();
        if($demo.size() > 1) {
          $demo.show();
        }
        else {
          $demo.fadeIn(500);
        }
      }
    },

    createAnnotation: function() {
      if(!$(this).data('type')) {
        $(this).data('type', 'html');
      }
      $(this)
        .wrap('<div class="annotation">')
        .parent()
        .hide()
      ;
    },

    resizeCode: function() {
      $('.ace_editor')
        .each(function() {
          var
            $code = $(this),
            padding     = 50,
            editor,
            editorSession,
            codeHeight
          ;
          $code.css('height', 'auto');
          editor        = ace.edit($code[0]);
          editorSession = editor.getSession();

          codeHeight = editorSession.getScreenLength() * editor.renderer.lineHeight + padding;
          $code.css('height', codeHeight);
          editor.resize();
        })
      ;
    },

    makeCode: function() {
      if(window.ace !== undefined) {
        $code
          .filter(':visible')
          .each(handler.initializeCode)
        ;
        $existingCode
          .each(handler.createAnnotation)
        ;
      }
    },


    initializeCode: function() {
      var
        $code        = $(this).show(),
        code         = $code.html(),
        existingCode = $code.hasClass('existing'),
        evaluatedCode = $code.hasClass('evaluated'),
        contentType  = $code.data('type')    || 'javascript',
        title        = $code.data('title')   || false,
        demo         = $code.data('demo')    || false,
        preview      = $code.data('preview') || false,
        label        = $code.data('label')   || false,
        displayType  = {
          html       : 'HTML',
          javascript : 'Javascript',
          css        : 'CSS',
          text       : 'Command Line',
          sh         : 'Command Line'
        },
        indent     = handler.getIndent(code) || 2,
        padding    = 20,
        name = (evaluatedCode)
          ? 'existing'
          : 'instructive',
        whiteSpace,
        $label,
        editor,
        editorSession,
        codeHeight
      ;

      // trim whitespace
      whiteSpace = new RegExp('\\n\\s{' + indent + '}', 'g');
      code = $.trim(code).replace(whiteSpace, '\n');

      if(contentType == 'html') {
        $code.text(code);
      }
      else {
        $code.html(code);
      }

      // evaluate if specified
      if(evaluatedCode) {
        eval(code);
      }

      // initialize
      editor        = ace.edit($code[0]);
      editorSession = editor.getSession();

      //editor.setTheme('ace/theme/tomorrow');
      editor.setTheme('ace/theme/github');
      editor.setShowPrintMargin(false);
      editor.setReadOnly(true);
      editor.renderer.setShowGutter(false);
      editor.setHighlightActiveLine(false);
      editorSession.setMode('ace/mode/'+ contentType);
      editorSession.setUseWrapMode(true);
      editorSession.setTabSize(2);
      editorSession.setUseSoftTabs(true);
      codeHeight = editorSession.getScreenLength() * editor.renderer.lineHeight + padding;
      $(this)
        .height(codeHeight + 'px')
        .wrap('<div class="ui ' + name + ' segment">')
      ;
      // add label
      if(title) {
        $('<div>')
          .addClass('ui attached top label')
          .html('<span class="title">' + title + '</span>' + '<em>' + (displayType[contentType] || contentType) + '</em>')
          .prependTo( $(this).parent() )
        ;
      }
      if(label) {
        $('<div>')
          .addClass('ui pointing below label')
          .html(displayType[contentType] || contentType)
          .insertBefore ( $(this).parent() )
        ;
      }
      // add run code button
      if(demo) {
        $('<a>')
          .addClass('ui pointing below label')
          .html('Run Code')
          .on('click', function() {
            eval(code);
          })
          .insertBefore ( $(this).parent() )
        ;
      }
      // add preview if specified
      if(preview) {
        $(code)
          .insertAfter( $(this).parent() )
        ;
      }
      editor.resize();
    },

    swapStyle: function() {
      var
        theme = $(this).data('theme')
      ;
      $(this)
        .addClass('active')
        .siblings()
          .removeClass('active')
      ;
      $('head link.ui')
        .each(function() {
          var
            href         = $(this).attr('href'),
            subDirectory = href.split('/')[3],
            newLink      = href.replace(subDirectory, theme)
          ;
          $(this)
            .attr('href', newLink)
          ;
        })
      ;
    }
  };

  $('.masthead')
    .visibility({
      once: false
    })
    .visibility('bottom visible', function(){
      $('.main.menu').removeClass('filled');
    })
    .visibility('bottom passed', function(){
      $('.main.menu').addClass('filled');
    })
    .find('.button')
      .popup({
        position  : 'top center',
        variation : 'inverted'
      })
  ;

  $(window)
    .on('resize', function() {
      clearTimeout(handler.timer);
      handler.timer = setTimeout(handler.resizeCode, 500);
    })
  ;

  $downloadDropdown
    .dropdown({
      on         : 'click',
      transition : 'scale'
    })
  ;

  // attach events
  if($.fn.tablesort !== undefined) {
    $sortTable
      .tablesort()
    ;
  }


  if( $pageTabs.size() > 0 ) {
    $pageTabs
      .tab({
        context      : '.main.container',
        childrenOnly : true,
        history      : true,
        onTabInit    : function() {
          handler.makeCode();
        },
        onTabLoad    : function() {
          $sticky.filter(':visible').sticky('refresh');
        }
      })
    ;
  }
  else {
    handler.makeCode();
  }

  $menu
    .sidebar({
      transition: 'reveal'
    })
    .sidebar('attach events', '.launch.button, .view-ui.button, .launch.item')
    .sidebar('attach events', $hideMenu, 'hide')
  ;


  handler.createIcon();

  $example
    .one('mousemove', handler.generateCode)
    .find('i.code')
      .on('click', handler.createCode)
  ;

  $themeDropdown
    .dropdown({
      action: 'select',
      onChange: handler.less.changeTheme
    })
  ;

  $shownExample
    .each(handler.createCode)
  ;

  $helpPopup
    .popup()
  ;

  $swap
    .on('click', handler.swapStyle)
  ;

  $developer
    .on('click', handler.developerMode)
  ;
  $designer
    .on('click', handler.designerMode)
  ;
  $overview
    .on('click', handler.overviewMode)
  ;

  $menuPopup
    .popup({
      position   : 'bottom center',
      className: {
        popup: 'ui popup'
      }
    })
  ;
  $sortableTables
    .tablesort()
  ;

  $menuDropdown
    .dropdown({
      on         : 'hover',
      action     : 'nothing'
    })
  ;

  $sticky
    .sticky({
      context : '.main.container',
      pushing : true
    })
  ;


};


// attach ready event
$(document)
  .ready(semantic.ready)
;
