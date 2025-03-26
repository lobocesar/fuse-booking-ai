import { Locator, Page, test, expect } from "@playwright/test";

// Resilient locator strategy using multiple fallback selectors
export class BookingPage {

    public logo: Locator;
    public searchInput: Locator;
    public firstResultOption: Locator;
    public submitBtn: Locator;
    public displayDate: Locator;
    public propertyCounter: Locator;

    protected page: Page;

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
    }

    public async checkLogo(): Promise<void> {
        await expect(this.logo, "Check logo visibility").toBeVisible();
    }

    public async searchPlace(city: string, hideDisplayDate?: boolean): Promise<void> {
        await this.searchInput.clear();
        await this.searchInput.focus();
        await this.searchInput.fill(city);
        await expect(this.firstResultOption).toHaveText(new RegExp(city, 'i'), { timeout: 10000 });
        await this.submitBtn.click();
        await this.popupHandler();
        if (hideDisplayDate) {
            await this.displayDate.click();
        }
    }

    public async selectDates(option: "weekend" | "week" | "month"): Promise<void> {
        const flexibleTab = this.page.getByRole('tab', { name: 'I\'m flexible' });
        await this.popupHandler();
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
        await expect(reviewFilter, `Check filter is visible`).toBeVisible({ timeout: 10000 });
        await reviewFilter.scrollIntoViewIfNeeded({ timeout: 5000 });
        const filterItem = reviewFilter.getByTestId("filters-group-label-content").filter({ hasText: option });
        await filterItem.click();
        await expect(this.propertyCounter, "City counter visibility").toBeVisible();
        await this.propertyCounter.scrollIntoViewIfNeeded({ timeout: 5000 });
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
        await this.propertyCounter.scrollIntoViewIfNeeded({ timeout: 5000 });
        await expect(this.page.getByTestId(`sorters-dropdown-trigger`), "Sorter added visibility").toBeVisible();
    }

    public async checkRelevantResults(city: string, noProperty?: boolean): Promise<void> {
        await expect(this.propertyCounter, "City counter visibility").toBeVisible();
        expect(await this.propertyCounter.textContent()).toContain(city);
        if (!noProperty) {
            const results = this.page.getByRole('list').filter({ hasText: `Browse the results for ${city}` });
            const resultList = await results.getByRole('listitem').all();
            await expect(resultList[0], "First Result visibility").toBeVisible({ timeout: 10000 });
            expect(resultList.length, "Result List greater than 0").toBeGreaterThan(0);
            test.info().annotations.push({ type: `Properties`, description: (await this.propertyCounter.textContent())?.toString() });
            test.info().annotations.push({ type: `First Result - Title`, description: `${await resultList[0].getByTestId('title').textContent()}` });
            test.info().annotations.push({ type: `First Result - Score`, description: `${await resultList[0].getByTestId('review-score').textContent()}` });
        }else{
            await expect(this.page.getByText('These properties match your search but are outside'), "Error message visibility").toBeVisible();
            test.info().annotations.push({ type: `Properties`, description:'NOT FOUND' });
        }
    }

    public async popupHandler(): Promise<void> {
        return await this.page.addLocatorHandler(this.page.getByText('Sign in, save money'), async () => {
            const dismissButton = this.page.getByRole('button', { name: 'Dismiss sign-in info.' });
            await dismissButton.click();
            await expect(dismissButton).not.toBeAttached({ timeout: 10000 });
            test.info().annotations.push({ type: 'Popup', description: 'No results found for the query' });
            console.log('Popup was closed.');
        });
    }
}

export default BookingPage;