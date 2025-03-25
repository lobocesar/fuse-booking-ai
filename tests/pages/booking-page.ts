import { Locator, Page, test, expect } from "@playwright/test";

// Resilient locator strategy using multiple fallback selectors
export class BookingPage {

    public logo: Locator;
    public searchInput: Locator;
    public firstResultOption: Locator;
    public submitBtn: Locator;
    public displayDate: Locator;
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

    public async checkRelevantResults(city: string): Promise<void> {
        const propertyCounter = this.page.getByText(/.+?: \d{1,3}(?:,\d{3})* (property|properties)? found/);
        await expect(propertyCounter, "City counter visibility").toBeVisible();
        expect(await propertyCounter.textContent()).toContain(city);
        const results = this.page.getByRole('list').filter({ hasText: `Browse the results for ${city}` });
        const resultList = await results.getByRole('listitem').all();
        expect(resultList.length, "Result List greater than 0").toBeGreaterThan(0);
        await expect(resultList[0], "First Result visibility").toBeVisible();
        test.info().annotations.push({ type: `Properties`, description: (await propertyCounter.textContent())?.toString() });
        test.info().annotations.push({ type: `First Result - Title`, description: `${await resultList[0].getByTestId('title').textContent()}` });
        test.info().annotations.push({ type: `First Result - Score`, description: `${await resultList[0].getByTestId('review-score').textContent()}` });
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