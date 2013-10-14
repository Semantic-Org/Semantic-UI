describe("UI Modal", function() {

  beforeEach(function() {
    module      = 'modal';
    testSetting = 'Test';
    name        = module.charAt(0).toUpperCase() + module.slice(1);

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures/';
    loadFixtures(module + '.html');
  });

  afterEach(function() {
    $('.ui.'+ module).remove();
  });

  /*******************************
              Module
  *******************************/

  it("should have an instance in metadata after init", function() {
    var $module = $('.ui.'+ module)[module]();
    expect($module).toHaveData('module-' + module);
  });

  it("should allow default settings to be changed", function() {
    $.fn[module].settings.name = testSetting;
    $module = $('.ui.'+ module)[module]();
    retrievedSetting = $module[module]('setting', 'name');
    $.fn[module].settings.name = name;
    expect(retrievedSetting).toBe(testSetting);
  });

  it("should allow settings to be changed during init", function() {
    $module = $('.ui.'+ module)[module]({
      name: testSetting
    });
    retrievedSetting = $module[module]('setting', 'name');
    expect(retrievedSetting).toBe(testSetting);
  });

  it("should allow settings to be changed during runtime", function() {
    $module = $('.ui.'+ module)[module]();
    retrievedSetting = $module[module]('setting', 'name');
    expect(retrievedSetting).toBe(name);
  });

  it("should only change the settings for specified element", function() {
    $module = $('.ui.' + module);
    $moduleClone = $module.clone().appendTo( $(sandbox() ));
    $modules = $moduleClone.add($module);

    $modules[module]();

    $module[module]('setting', 'name', testSetting);

    retrievedSetting = $module[module]('setting', 'name');
    clonedSetting = $moduleClone[module]('setting', 'name');

    expect(retrievedSetting).toBe(testSetting);
    expect(clonedSetting).toBe(name);
  });

  /*-------------------
        Groups
  --------------------*/


});