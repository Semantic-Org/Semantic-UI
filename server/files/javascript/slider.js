semantic.slider = {};

// ready event
semantic.slider.ready = function() {

  /******************************
          Script to run
  ******************************/
  /*
  The script below works well only when possibleSolution.js
  is used. To see the issue for slyder, please include slyder.js
  instead of possibleSolution.js.
  For details of the issue, please refer to the comments below.
  */

  $('.ui.dropdown')
    .dropdown()
  ;

  $('.ui.slider')
    .slider()
    .slider('bind input', '.abc')
  ;

  $('#popupSlyder .thumb')
    .popup({
      content: 'In conjunction with Popup module',
      position: 'bottom center',
      preserve: true,
      delay: 20,
      duration: 0
    })
  ;

  /*
     Though the code below seemes to change the content of the popup, it actually does not.
     The popup of #popupSlyder does not change its content as the thumb of the slyder is moved.
   This is because I did NOT implement this change behavior. The reason is that I can not
   figure out an easy way to change the content of popup dynamically using the API provided.
   I think if I try to implement this behavior, the code is likely to be quite hackish.
   Thus, I would like to leave it as such until there is some "easy" way to set the content
   of popup dynamically. If this behavior is required, I would not recommend combining Slyder
   with Popup for now. If there is actually an easy way to do this, please inform me of that.
   I will really appreciate it. Thank you.
  */

  $('#popupSlyder')
    .slider('setting', 'onChange',  function(value, previousValue) {
        var displacement = this.get.offset(value, previousValue);
        $('#popupSlyder .thumb')
          .popup('setting', 'content', value)
          .popup('set position', 'bottom center', displacement)
        ;
      }
    )
  ;

  /************************************************************
   Code about the issue:

   Re-initialzation causes some undesired effect on event handling.
  ************************************************************/

    /*
    Issue overview:
      Re-initialization removes event handlers for a specific
      eventNamespace. However, eventNamespace is unique for
      a type of UI Module, not for a instance of a UI Module.
      This sometimes leads to undesired behaviors of UI.
    */

    /*
      The second initialization will first call
      destroy function on the module of #popupSlyder.
      This removes other event handlers of other slyders'
      from the window. Thus, only #popupSlyder functions
      well; other slyders will seem as if they were disabled.

    $('.ui.slider')
      .slider()
      .slider('bind input', '.abc')
    ;

    $('#popupSlyder')
      .slider()
    ;
    */

    /*
      I have NOT solved the problem above, or, more specifically,
      I cannot claim that since I have not tested a possible solution
      on all UI modules.
      The reason I didn't just go on to solve it is that
      I happened to observe that some code of similar pattern exists in the Popup module;
      I think it's better to consult you about this first.

      You can observe a similar issue by running the code below.
      The popup of home icon will not be repositioned correctly if the window
      is resized. If only PartA is executed, everything goes well.
      However, since PartB will remove the resize event handler
      of home icon popup from window, (that is, the window will not notify
      home icon popup of the resize event), home icon popup will not be
      repositioned well. The star icon popup still does a good job since
      the second initialization set up everything for it again. This is
      exactly the nice re-initialization feature of Semantic you mentioned
      in the document.

    // PartA //
    $('.ui.icon')
        .popup({
          content: 'icon',
          on: 'click'
        })
      ;
    // PartA //

    // PartB //
      $('.ui.star.icon')
      .popup({
          content: 'icon',
          on: 'click'
        })
      ;
      // PartB //

    This is issue will not be really a big problem if initilaztions
    are taken good care of. For example, we can make the targets of
    every initialzation mutually exclusive. However, this might not
    be that easy if elements scatter in the document and there are
    quite many elements.

    I think that it might be a solution to change the default value
    of eventNamespace. In current implementation, the default value
    is given by

    eventNamespace  = '.' + settings.namespace;

    for every module instance. Since all modules of the same UI
    have the same default values of settings.namespace, i.e., their
    module name, the resulting eventNamespace's would be the same.

    If we put some uniqueness for individual modules onto the
    eventNamespace, such as,

    eventNamespace  = '.' + settings.namespace + parseInt(Math.random() * 999999);

    this problem may be solved. There are some additional tasks to fulfill.

    1. In the "instantiate" function, change the statment

      $module
        .data(moduleNamespace, instance)
      ;

       to

      $module
        .data(moduleNamespace, instance)
        .data("eventNamespace", eventNamespace)
      ;

    2. In the "destroy" function, add the following line

        var originalEventNamespace = $module.data("eventNamespace");

       and change all occurences "eventNamespace" to "originalEventNamespace".

       For example, change

        $module
        .removeData(moduleNamespace)
        .off(eventNamespace)
      ;

      to

      $module
        .removeData(moduleNamespace)
        .off(originalEventNamespace)
      ;

    This keeps every eventNamespace unique (or small chance to collide) over
    each initialization. In addition, since we store this unique eventNamespace,
    we can retrieve it if we need it for destroy process.

    I use this implementation in the possibleSolution.js and test on demo.html
    only for slyder. It seems to work well. I didn't test it on other
    UI Modules since I think that it's better to inform you of this issue before
    any code modification of this kind.

    If you feel that this solution is not good enough, or it doesn't conform to
    the philosophy of Semantic, please feel free to modify it or use a totally
    different solution.

    Thank you!

    "By the way, the "bind input" behavior of Slyder also has to do with this issue.
    That is, if one binds inputs to some slyder and re-initialize it, the binding will
    be destroyed automatically. This seems to make sense, so I do no extra work on the
    binding related to re-initialization."

      */


};


// attach ready event
$(document)
  .ready(semantic.slider.ready)
;