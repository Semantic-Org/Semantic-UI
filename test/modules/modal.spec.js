describe("UI Modal", function() {
  var
    module    = 'modal',
    testValue = 'Test',
    name      = module.charAt(0).toUpperCase() + module.slice(1),
    fixtures  = jasmine.getFixtures(),

    $module
  ;

  fixtures.fixturesPath = 'base/test/fixtures/';

  beforeEach(function() {
    // load fixtures
    fixtures.load(module + '.html');
    // disable debug
    $.fn[module].debug = false;
    // module available in scope
    $module = $('.ui.'+ module);
  });

  afterEach(function() {
    $('.ui.'+ module).remove();
  });

  /*******************************
              Module
  *******************************/

  /*-------------------
      Instantiation
  --------------------*/

  it("should have an instance in metadata after init", function() {
    $module[module]();
    expect($module).toHaveData('module-' + module);
  });

  /*-------------------
         Settings
  --------------------*/
  describe('Settings', function() {

    it("should allow default settings to be changed", function() {
      $.fn[module].settings.name = testValue;
      $module[module]();

      var retrievedValue = $module[module]('setting', 'name');
      $.fn[module].settings.name = name;

      expect(retrievedValue).toBe(testValue);
    });

    it("should allow settings to be changed during init", function() {
      $module[module]({
        name: testValue
      });

      var retrievedValue = $module[module]('setting', 'name');

      expect(retrievedValue).toBe(testValue);
    });

    it("should allow settings to be changed during runtime", function() {
      $module[module]();

      var retrievedValue = $module[module]('setting', 'name');

      expect(retrievedValue).toBe(name);
    });

  });

  /*-------------------
          Groups
  --------------------*/

  describe('Group Contamination', function() {

    it("should create settings for all instances", function() {
      $moduleClone = $module.clone().appendTo( $(sandbox() ));
      $modules     = $moduleClone.add($module);

      $modules[module]('setting', 'name', testValue);

      var retrievedValue = $module[module]('setting', 'name');
      var clonedSetting = $moduleClone[module]('setting', 'name');

      expect(retrievedValue).toBe(testValue);
      expect(clonedSetting).toBe(testValue);

      $modules[module]({
        'name': testValue
      });

      expect(retrievedValue).toBe(testValue);
      expect(clonedSetting).toBe(testValue);

    });

    it("should not change other elements settings when changing one element", function() {
      $moduleClone = $module.clone().appendTo( $(sandbox() ));
      $modules     = $moduleClone.add($module);

      $modules[module]();
      $module[module]('setting', 'name', testValue);

      var retrievedValue = $module[module]('setting', 'name');
      var clonedSetting  = $moduleClone[module]('setting', 'name');

      expect(retrievedValue).toBe(testValue);
      expect(clonedSetting).toBe(name);

    });

    it("should not change other elements when re-initalized", function() {
      $moduleClone = $module.clone().appendTo( $(sandbox() ));
      $modules     = $moduleClone.add($module);

      $modules[module]();
      $module[module]({
        'name': testValue
      });

      var retrievedValue = $module[module]('setting', 'name');
      var clonedSetting  = $moduleClone[module]('setting', 'name');

      expect(retrievedValue).toBe(testValue);
      expect(clonedSetting).toBe(name);

    });

  });

  /*-------------------
         Destroy
  --------------------*/
  describe('Destroy', function() {

    it("destroy should remove all events from page", function() {
      $module[module]('destroy');
      expect($.events().length).toBe(0);
    });

    it("destroy should remove instance metadata", function() {
      $module[module]('destroy');
      expect( $module.data('module-'+ module) ).toBe(undefined);
    });

  });

});