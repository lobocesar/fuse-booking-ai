import { expect, test } from '@playwright/test';
import BookingPage from '../pages/booking-page';

const URL = `https://www.booking.com/`;
let bookingPage: BookingPage;

test.describe('Hotel Search & Filtering', () => {

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page);
    await page.goto(URL);
    await bookingPage.checkLogo();
  });

  test.only('TC_001 - Searching for hotels in "New York" should display relevant results', async ({ page }) => {
    const city = 'New York';
    await bookingPage.searchPlace(city, true);
    await bookingPage.checkRelevantResults(city);
  });

  test('TC_002 - Selecting check-in and check-out dates should update availability', async () => {
    const city = 'New York';
    await bookingPage.searchPlace(city);
    await bookingPage.selectDates('week');
    await bookingPage.checkRelevantResults(city);
  });
  /*
    test('TC_003 - Applying a "Guest Rating: 8+" filter should update results correctly', async ({ page }) => {
      await page.fill('[name="ss"]', 'New York');
      await page.click('[type="submit"]');
      
      await page.check('input[name="review_score"][value="8"]'); 
      await page.waitForTimeout(2000); // Espera la actualización de la página
      
      const filteredResults = await page.locator('.sr_property_block');
      await expect(filteredResults).toHaveCountGreaterThan(0);
    });
  
    test('TC_004 - Sorting by "Lowest Price" should reorder results as expected', async ({ page }) => {
      await page.fill('[name="ss"]', 'New York');
      await page.click('[type="submit"]');
      
      await page.selectOption('#sort_by', 'price');
      await page.waitForTimeout(2000);
      
      const firstPrice = await page.locator('.price').first().innerText();
      const secondPrice = await page.locator('.price').nth(1).innerText();
      
      expect(Number(firstPrice.replace(/\D/g, ''))).toBeLessThanOrEqual(Number(secondPrice.replace(/\D/g, '')));
    });
  
    test('TC_005 - Searching for an invalid location should show an error or no results', async ({ page }) => {
      await page.fill('[name="ss"]', 'asdasd12345');
      await page.click('[type="submit"]');
  
      const noResults = await page.locator('.no_results_message');
      await expect(noResults).toBeVisible();
    });
  */
});
