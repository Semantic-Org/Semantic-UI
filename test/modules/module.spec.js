
function moduleTests(ui) {
  var
    module    = ui.module,
    element   = ui.element,
    singleton = ui.singleton,
    name      = $.fn[module].settings.name,

    testValue = 'Test',
    fixtures  = jasmine.getFixtures(),

    originalSettings,
    $modules,
    $oneModule,
    $module,
    $clone
  ;

  // set fixture path
  fixtures.fixturesPath = 'base/test/fixtures/';

  // disable debug
  $.fn[module].settings.debug       = false;
  $.fn[module].settings.performance = false;
  $.fn[module].settings.verbose     = false;


  beforeEach(function() {
    // load fixtures
    fixtures.load(module + '.html');
    // save settings
    originalSettings = $.fn[module].settings;

    // module available in scope
    $module       = $(element);

    // one module available in fixture
    if($module.size() == 1) {
      $oneModule = $module;
      $clone     = $module.clone().appendTo( $(sandbox()) );
      $modules   = $clone.add($module);
    }
    // multiple modules available in fixture
    else {
      $modules   = $(element);
      $clone     = $module.eq(1);
      $oneModule = $modules.first();
    }

  });

  afterEach(function() {
    // restore settings
    $.fn[module].settings = originalSettings;
    // remove element
    $(element).remove();
  });

  /*******************************
              Module
  *******************************/

  /*-------------------
      Instantiation
  --------------------*/
  describe('Module', function() {

    it("allows chaining when no settings returned", function() {
      var $chain = $modules[module]();
      expect($chain).toExist();
      expect($chain.size()).toBe($modules.size());
    });

    it("returns a string when one setting returned", function() {
      var result = $oneModule[module]('setting', 'name');
      expect(typeof result).toBe('string');
    });

    it("returns an array when multiple settings returned", function() {
      var result = $modules[module]('setting', 'name');
      expect( $.isArray(result) ).toBeTruthy();
    });

    it("has an instance in metadata after init", function() {
      $oneModule[module]();
      expect($module).toHaveData('module-' + module);
    });

  });

  /*-------------------
         Settings
  --------------------*/

  describe('Settings', function() {

    it("clears settings on re-init", function() {
      $oneModule[module]({
        name: testValue
      });

      var retrievedValue = $oneModule[module]('setting', 'name');
      expect(retrievedValue).toBe(testValue);

      // reinit
      $oneModule[module]();
      retrievedValue = $oneModule[module]('setting', 'name');
      expect(retrievedValue).toBe(name);
    });

    it("allows default settings to be changed", function() {
      $.fn[module].settings.name = testValue;
      $oneModule[module]();

      var retrievedValue = $oneModule[module]('setting', 'name');
      $.fn[module].settings.name = name;

      expect(retrievedValue).toBe(testValue);
    });

    it("allows settings to be changed during init", function() {
      $oneModule[module]({
        name: testValue
      });

      var retrievedValue = $oneModule[module]('setting', 'name');

      expect(retrievedValue).toBe(testValue);
    });

    it("allows settings to be changed during runtime", function() {
      $oneModule[module]();

      var retrievedValue = $oneModule[module]('setting', 'name');

      expect(retrievedValue).toBe(name);
    });

  });

  /*-------------------
          Groups
  --------------------*/

  if(!singleton) {

    describe('Group Contamination', function() {

      it("creates settings for all instances", function() {
        $modules[module]('setting', 'name', testValue);

        var retrievedValue = $oneModule[module]('setting', 'name');
        var clonedSetting  = $clone[module]('setting', 'name');

        expect(retrievedValue).toBe(testValue);
        expect(clonedSetting).toBe(testValue);

        $oneModule[module]({
          'name': testValue
        });

        expect(retrievedValue).toBe(testValue);
        expect(clonedSetting).toBe(testValue);

      });

      it("does not change other elements settings when changing one element", function() {
        $modules[module]();
        $oneModule[module]('setting', 'name', testValue);

        var retrievedValue = $oneModule[module]('setting', 'name');
        var clonedSetting  = $clone[module]('setting', 'name');

        expect(retrievedValue).toBe(testValue);
        expect(clonedSetting).toBe(name);

      });

      it("does not change other elements when re-initialized", function() {
        $modules[module]();

        $oneModule[module]({
          'name': testValue
        });

        var retrievedValue = $oneModule[module]('setting', 'name');
        var clonedSetting  = $clone[module]('setting', 'name');

        expect(retrievedValue).toBe(testValue);
        expect(clonedSetting).toBe(name);

      });

    });

  }

  /*-------------------
         Destroy
  --------------------*/
  describe('Destroy', function() {

    it("removes all events from page", function() {
      $module[module]('destroy');
      if($.events().length > 0) {
        dump($.events());
      }
      expect($.events().length).toBe(0);
    });

    it("removes instance metadata", function() {
      $module[module]('destroy');
      expect( $module.data('module-'+ module) ).toBe(undefined);
    });

  });

}