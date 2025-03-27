import { test } from '@playwright/test';
import BookingPage from '../pages/booking-page';

const baseURL = `https://www.booking.com`;
let bookingPage: BookingPage;

test.describe('@flights - Flight Booking Process', () => {

  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await page.context().clearCookies();
    bookingPage = new BookingPage(page);
    await page.goto(baseURL);
    await bookingPage.checkLogo();
    await bookingPage.gotoFlights();
  });

  test('[TC_006, TC_007, TC_009] - Searching "New York" round-trip and destination should display available flights with summary', async () => {
    const fromCity = 'New York';
    const toCity = 'Los Angeles';
    await bookingPage.setNextMonthFlightDates(fromCity, toCity, 1, 1, 15);
    await bookingPage.checkFirstFlight();
  });

  test('[TC_006, TC_007, TC_009] - Searching "Chicago" round-trip and destination should display available flights with summary', async () => {
    const fromCity = 'Chicago';
    const toCity = 'New York';
    await bookingPage.setNextMonthFlightDates(fromCity, toCity, 1, 1, 8);
    await bookingPage.checkFirstFlight();
  });

});
