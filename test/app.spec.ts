import { describe, it } from 'vitest';
import { createFixture } from '@aurelia/testing';
import { App } from '../src/pages/app/app.js';

describe('app', () => {
  it('should create app component', async () => {
    const { startPromise } = createFixture(
      '<template><div>Test App</div></template>',
      {},
      [App]
    );

    await startPromise;
    // If we get here without throwing, the test passes
  });
});