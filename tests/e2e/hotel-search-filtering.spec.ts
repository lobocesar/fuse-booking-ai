import { test } from '@playwright/test';
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

  test('TC_003 - Applying a "Guest Rating: 8+" filter should update results correctly', async () => {
    const city = 'New York';
    await bookingPage.searchPlace(city, true);
    await bookingPage.filterByReview('Wonderful: 9+');
    await bookingPage.checkRelevantResults(city);
  });

  test('TC_004 - Sorting by "Lowest Price" should reorder results as expected', async () => {
    const city = 'New York';
    await bookingPage.searchPlace(city, true);
    await bookingPage.orderByLowerPrice();
    await bookingPage.checkRelevantResults(city);
  });

  test('TC_005 - Searching for an invalid location should show an error or no results', async ({ page }) => {
    const city = 'Chikāra';
    await bookingPage.searchPlace(city, true);
    await bookingPage.checkRelevantResults(city, true);
  });

});
