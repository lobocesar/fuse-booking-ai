import { test } from '@playwright/test';
import BookingPage from '../pages/booking-page';

const baseURL = `https://www.booking.com`;
let bookingPage: BookingPage;


test.describe('@hotel Hotel Details & Amenities Verification', () => {

    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await page.context().clearCookies();
        bookingPage = new BookingPage(page);
        await page.goto(baseURL);
        await bookingPage.checkLogo();
    });

    test('[TC_011, TC_012, TC_013, TC_014, TC_015] - Selecting a hotel should navigate to the details, hotel name, location, star rating, amenities', async () => {
        const city = 'Santa Carolina';
        await bookingPage.searchPlace(city, true);
        await bookingPage.checkRelevantResults(city);
        await bookingPage.checkHotelDetails();
    });

});
