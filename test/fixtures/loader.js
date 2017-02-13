__FIXTURES__ = {};

defineFixture = function(name, data) {
  __FIXTURES__[name] = data;
};

loadFixture = function(name) {
  if (_.has(__FIXTURES__, name)) {
    return _.clone(__FIXTURES__[name], true);
  } else {
    throw new Error('Fixture ' + name + ' is not defined');
  }
};

