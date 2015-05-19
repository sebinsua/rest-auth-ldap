var chai = require('chai');

global.should = chai.should();

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
