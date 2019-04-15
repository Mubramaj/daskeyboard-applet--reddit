const assert = require('assert');
const {
  Basecamp
} = require('../index');
const auth = require('./auth.json');

console.log("My auth is: " + JSON.stringify(auth));

describe('Basecamp', () => {
  async function makeApp() {
    let app = new Basecamp();

    await app.processConfig({
      extensionId: 777,
      geometry: {
        width: 1,
        height: 1,
      },
      authorization: auth,
      applet: {}
    });

    return app;
  }

  describe('#run()', function () {
    it('runs', async () => {
      const app = await makeApp();
      return app.run().then((signal) => {
        console.log(signal);
        assert.ok(signal === null || signal);
      }).catch((error) => {
        assert.fail(error)
      });
    });

  });
})