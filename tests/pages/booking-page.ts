import { Locator, Page, test, expect } from "@playwright/test";

export class BookingPage {

    protected logo: Locator;
    protected searchInput: Locator;
    protected firstResultOption: Locator;
    protected submitBtn: Locator;
    protected displayDate: Locator;
    protected propertyCounter: Locator;
    public flightsBtn: Locator;
    protected firstHotelTitle: Locator;
    protected page: Page;

    static readonly TIMEOUT_20: number = 20000;
    static readonly TIMEOUT_30: number = 30000;
    static readonly TIMEOUT_10: number = 10000;
    static readonly TIMEOUT_5: number = 5000;

    // Resilient locator strategy using multiple fallback selectors
    constructor(page: Page) {
        this.page = page;
        this.logo = page.getByTestId('header-booking-logo')
            .or(page.getByRole('link', { name: 'Booking.com' }).first());
        this.searchInput = page.locator('[name="ss"]')
            .or(page.getByRole('combobox', { name: 'Where are you going?' }));
        this.firstResultOption = page.locator('[data-testid="autocomplete-results-options"] li').first();
        this.submitBtn = page.locator('[type="submit"]')
            .or(page.getByRole('button', { name: 'Search' }));
        this.displayDate = page.getByTestId('date-display-field-start');
        this.propertyCounter = page.getByText(/.+?: \d{1,3}(?:,\d{3})* (property|properties)? found/)
            .or(page.getByText(/.+?: no properties found/));
        this.flightsBtn = page.getByRole('link', { name: 'Flights' });
    }

    // Hotel functions
    public async searchPlace(city: string, hideDisplayDate?: boolean): Promise<void> {
        await this.searchInput.clear();
        await this.searchInput.focus();
        await this.searchInput.fill(city);
        await expect(this.firstResultOption).toHaveText(new RegExp(city, 'i'), { timeout: BookingPage.TIMEOUT_10 });
        await this.submitBtn.click();
        await this.popupHandler();
        if (hideDisplayDate) {
            await expect(this.displayDate, "Display date visibility").toBeVisible({ timeout: BookingPage.TIMEOUT_10 });
            await this.displayDate.click();
        }
    }

    public async selectDates(option: "weekend" | "week" | "month"): Promise<void> {
        const flexibleTab = this.page.getByRole('tab', { name: 'I\'m flexible' });
        await this.popupHandler();
        await expect(flexibleTab, "Flexible tab visibility").toBeVisible();
        await flexibleTab.click();
        const radioOptions = this.page.locator('[data-testid="flexible-dates-day"]');
        await radioOptions.filter({ hasText: new RegExp(`^A ${option}$`, 'i') }).click();
        const thirdMonth = await this.page.locator('[data-testid="flexible-dates-months"] [role="group"]').all();
        await thirdMonth[2].click();
        await this.page.getByRole('button', { name: `Select dates` }).click();
        await this.submitBtn.click();
    }

    public async filterByReview(option: "Very Good: 8+" | "Wonderful: 9+"): Promise<void> {
        const reviewFilter = this.page.getByRole('group', { name: 'Review score' });
        await this.popupHandler();
        await expect(reviewFilter, `Check filter is visible`).toBeVisible({ timeout: BookingPage.TIMEOUT_10 });
        await reviewFilter.scrollIntoViewIfNeeded({ timeout: BookingPage.TIMEOUT_5 });
        const filterItem = reviewFilter.getByTestId("filters-group-label-content").filter({ hasText: option });
        await filterItem.click();
        await expect(this.propertyCounter, "City counter visibility").toBeVisible();
        await this.propertyCounter.scrollIntoViewIfNeeded({ timeout: BookingPage.TIMEOUT_5 });
        const review_score = option === "Very Good: 8+" ? "80" : "90";
        await expect(this.page.getByTestId(`filter:review_score=${review_score}`), "Filter Review added visibility").toBeVisible();
    }

    public async orderByLowerPrice(): Promise<void> {
        const sorter = this.page.getByTestId('sorters-dropdown-trigger');
        await this.popupHandler();
        await expect(sorter, "Sorter visibility").toBeVisible();
        await sorter.click();
        const sorterOption = this.page.getByRole('option', { name: 'Property rating (low to high)' });
        await sorterOption.click();
        await expect(this.propertyCounter, "City counter visibility").toBeVisible();
        await this.propertyCounter.scrollIntoViewIfNeeded({ timeout: BookingPage.TIMEOUT_5 });
        await expect(this.page.getByTestId(`sorters-dropdown-trigger`), "Sorter added visibility").toBeVisible();
    }

    public async checkRelevantResults(city: string, noProperty?: boolean): Promise<void> {
        await expect(this.propertyCounter, "City counter visibility").toBeVisible();
        expect(await this.propertyCounter.textContent()).toContain(city);
        if (!noProperty) {
            const results = this.page.getByRole('list').filter({ hasText: `Browse the results for ${city}` });
            const resultList = await results.getByRole('listitem').all();
            await expect(resultList[0], "First Result visibility").toBeVisible({ timeout: BookingPage.TIMEOUT_20 });
            expect(resultList.length, "Result List greater than 0").toBeGreaterThan(0);
            test.info().annotations.push({ type: `Properties found`, description: (await this.propertyCounter.textContent())?.toString() });
            this.firstHotelTitle = resultList[0].getByTestId('title');
            test.info().annotations.push({ type: `First Result - Title`, description: `${await this.firstHotelTitle.textContent()}` });
            test.info().annotations.push({ type: `First Result - Score`, description: `${await resultList[0].getByTestId('review-score').textContent()}` });
        } else {
            await expect(this.page.getByText('These properties match your search but are outside'), "Error message visibility").toBeVisible();
            test.info().annotations.push({ type: `Properties found`, description: 'NOT FOUND' });
        }
    }

    public async checkHotelDetails(): Promise<void> {
        await expect(this.firstHotelTitle, "First Hotel Visibility").toBeVisible();
        const tabPagePromise = this.page.context().waitForEvent('page');
        await this.firstHotelTitle.click();
        const newPageTab = await tabPagePromise;
        this.page = newPageTab;
        await this.checkLogo();
        const hotelName = this.page.locator('#hp_hotel_name');
        const hotelAddress = this.page.getByTestId('PropertyHeaderAddressDesktop-wrapper').locator('div').nth(1);
        const hotelRating = this.page.getByTestId('quality-rating').getByTestId('rating-stars').locator('span');
        const hotelPhotosQty = this.page.locator('[id="photo_wrapper"] span');
        const hotelAmenities = this.page.locator('[data-testid="property-most-popular-facilities-wrapper"]').first().locator('ul li');
        const hotelAmenitiesList = await hotelAmenities.all();

        await expect(hotelName, "Hotel Name Visibility").toBeVisible({ timeout: BookingPage.TIMEOUT_10 });
        await expect(hotelAddress, "Hotel Address Visibility").toBeVisible({ timeout: BookingPage.TIMEOUT_10 });
        await expect(hotelAmenitiesList[0], "Hotel Amenities Visibility").toBeVisible({ timeout: BookingPage.TIMEOUT_10 });
        test.info().annotations.push({ type: `Selected Hotel - Name`, description: (await hotelName.getByRole('heading').textContent())?.toString() });
        test.info().annotations.push({ type: `Selected Hotel - Rating Starts`, description: (await hotelRating.count())?.toString() });
        test.info().annotations.push({ type: `Selected Hotel - Photos Qty`, description: (await hotelPhotosQty.innerText()) });
        let hotelAmenitiesListStr: string = '';
        for (let i = 0; i < hotelAmenitiesList.length; i++) {
            hotelAmenitiesListStr += await hotelAmenitiesList[i].innerText() + " | ";
        }
        test.info().annotations.push({ type: `Selected Hotel - Amenities`, description: hotelAmenitiesListStr.trim() });
    }

    // Flight functions
    public async setNextMonthFlightDates(fromCity: string, toCity: string, nextMonthQty: number, fromDay: number, toDay: number): Promise<void> {
        await this.popupHandler();
        // Clean all current cities
        const closeButtons = await this.page.locator('[role="list"] [role="button"]').all();
        for (let i = 0; i < closeButtons.length; i++) {
            await expect(closeButtons[i], "Close button visibility").toBeVisible({ timeout: BookingPage.TIMEOUT_10 });
            await closeButtons[i].click();
        }

        // Setting from city
        const fromInput = this.page.locator('input[aria-label="Flight origin input"]');
        await expect(fromInput, "From input visibility").toBeVisible();
        await fromInput.fill(fromCity);
        const firstSmartyOrigin = this.page.locator('#flight-origin-smarty-input-list').first();
        await expect(firstSmartyOrigin, "Origin Smarty List visibility").toBeVisible();
        await firstSmartyOrigin.click();

        // Setting to city
        const toInput = this.page.getByRole('textbox', { name: 'Flight destination input' });
        await expect(toInput, "To input visibility").toBeVisible();
        await toInput.fill(toCity);
        const firstSmartyDestination = this.page.locator('#flight-destination-smarty-input-list').first();
        await expect(firstSmartyDestination, "Destination Smarty List visibility").toBeVisible();
        await firstSmartyDestination.click();

        const fromDateButton = this.page.getByRole('button', { name: 'Departure', exact: true })
            .or(this.page.getByRole('button', { name: 'Start date' }));
        await expect(fromDateButton, "From date button visibility").toBeVisible();
        await fromDateButton.click();
        // Check dates are visible after click
        await expect(this.page.getByRole('radio', { name: 'Dates' }), "Dates visibility").toBeVisible();

        // Reset the calendar
        const prevButton = this.page.locator('[role="button"][aria-label="Previous month"]');
        await this.clickUntilDisabled(prevButton);

        // Go to the next Month
        const nextMonth = this.page.getByRole('button', { name: 'Next Month' });
        await nextMonth.click();
        await expect(this.page.getByText(this.getMonthName(1)), "Next Month visibility").toBeVisible();

        // Select first days of the month
        const nextMonthName = this.getMonthName(nextMonthQty);
        await this.page.getByRole('button', { name: `${nextMonthName} ${fromDay},` }).click();

        const next2MonthName = this.getMonthName(nextMonthQty + 1);
        await this.page.getByRole('button', { name: `${next2MonthName} ${toDay},` }).click();

        // Check dates are not visible
        await expect(this.page.getByRole('radio', { name: 'Dates' }), "Dates visibility").not.toBeVisible();

        // Click on search button
        await this.page.getByRole('button', { name: 'Search' }).click();

        // Wait until results are visible
        await expect(this.page.getByRole('button', { name: 'View Deal' }).first(), "First deal button visibility").toBeVisible({ timeout: BookingPage.TIMEOUT_10 });
    }

    public async checkFirstFlight(): Promise<void> {
        const priceLocator = this.page.locator('[class*="price-text"]').first();
        await expect(priceLocator, "Price visibility").toBeVisible();
        test.info().annotations.push({ type: `First Deal - Price`, description: `${await priceLocator.textContent({ timeout: BookingPage.TIMEOUT_10 })}` });

        const airlineLocator = this.page.locator('[class*="provider-name"]').first();
        await expect(airlineLocator, "Airline visibility").toBeVisible()
        test.info().annotations.push({ type: `First Deal - Airline`, description: `${await airlineLocator.textContent({ timeout: BookingPage.TIMEOUT_10 })}` });

    }

    public async gotoFlights(): Promise<void> {
        await this.flightsBtn.click();
        await this.checkPageURL('booking.kayak.com');
        await this.checkLogo();
    }

    // Common functions
    public async checkLogo(): Promise<void> {
        await expect(this.logo, "Check logo visibility").toBeVisible();
        await this.page.reload();
    }

    public async checkPageURL(url: string): Promise<void> {
        const urlRegex = new RegExp(`.*${url}`);
        await expect(this.page, "Check Page url").toHaveURL(urlRegex);
    }

    public async popupHandler(): Promise<void> {
        return await this.page.addLocatorHandler(this.page.getByText('Sign in, save money'), async () => {
            const dismissButton = this.page.getByRole('button', { name: 'Dismiss sign-in info.' });
            await expect(dismissButton).toBeVisible({ timeout: BookingPage.TIMEOUT_10 });
            await dismissButton.click();
            await expect(this.page.getByAltText('Sign in, save money')).not.toBeAttached({ timeout: BookingPage.TIMEOUT_10 });
            await this.page.keyboard.press('Escape');
            console.log('Popup was closed.');
        });
    }

    private getMonthName(nextQty: number): string {
        const currentDate = new Date();
        const nextMonthIndex = (currentDate.getMonth() + nextQty) % 12;
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[nextMonthIndex];
    }

    public async clickUntilDisabled(element: Locator): Promise<void> {
        // Continue clicking until it's disabled
        while (await element.isEnabled()) {
            await element.click();
            await this.page.waitForTimeout(500);
        }
    }

}

export default BookingPage;