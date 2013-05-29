window.ui.button = {
  name     : 'Button',
  group    : 'UI Element',
  class    : 'ui button',
  
  singular : {
    'standard'    : '<div class="ui button">{$text}</div>',
    'icon'        : '<div class="ui button"><i class="icon {$icon}"></i></div>',
    'labeledIcon' : '<div class="ui button"><i class="icon {$icon}"></i>{$text}</div>',
    'dropdown'    : '<div class="ui button"><i class="icon dropdown"></i></div>'
  },
  plural: {
    standard : '<div class="button">Save</div><div class="button">Cancel</div>',
    icon : '<div class="button">Save</div><div class="button">Cancel</div>',
    choice   : '<div class="button">Save</div><div class="or"></div><div class="button">Cancel</div'
  },
  states: [
    'active',
    'disabled',
    'toggled',
    'success',
    'error',
    'loading'
  ],
  variations: [
  
  ] 
};