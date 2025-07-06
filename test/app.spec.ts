import { App } from '../src/app'; // Updated import


describe('app', () => { // Updated description
  it('should render message', async () => {
    const { assertText } = await createFixture(
      '<app></app>', // Updated HTML tag
      {},
      [App], // Updated reference
    ).started;

    assertText('Hello World!', { compact: true });
  });
});