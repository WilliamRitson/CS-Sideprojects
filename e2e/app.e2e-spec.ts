import { Cs110Page } from './app.po';

describe('cs110 App', function() {
  let page: Cs110Page;

  beforeEach(() => {
    page = new Cs110Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
