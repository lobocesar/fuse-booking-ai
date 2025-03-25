# Fuse QA Challenge - Test Cases

## AI Contribution in Test Case Generation
I used ChatGPT to refine test cases by adding edge cases, data validation scenarios, and ensuring coverage of common user actions.

---

## **User Story 1: Hotel Search & Filtering**
**As a user, I want to search for hotels in a specific city and apply filters, so that I can find a suitable place to stay.**

### **Test Scenarios**
✅ **TC_001** - Searching for hotels in "New York" should display relevant results.  
✅ **TC_002** - Selecting check-in and check-out dates should update availability.  
✅ **TC_003** - Applying a "Guest Rating: 8+" filter should update results correctly.  
✅ **TC_004** - Sorting by "Lowest Price" should reorder results as expected.  
✅ **TC_005 (Edge Case)** - Searching for an invalid location should show an error or no results.  

---

## **User Story 2: Flight Booking Process (or Car Rental)**
**As a user, I want to search and book a flight, so that I can plan my trip.**

### **Test Scenarios**
✅ **TC_006** - Searching for a round-trip flight should enable return date selection.  
✅ **TC_007** - Selecting departure & destination should display available flights.  
✅ **TC_008** - Entering an invalid date range should trigger an error message.  
✅ **TC_009** - Proceeding to checkout should display a booking summary.  
✅ **TC_010 (Edge Case)** - Booking a flight with an unavailable seat should display an error.  

---

## **User Story 3: Hotel Details & Amenities Verification**
**As a user, I want to view detailed information about a hotel, so that I can make an informed decision about my stay.**

### **Test Scenarios**
✅ **TC_011** - Selecting a hotel should navigate to the details page.  
✅ **TC_012** - Verify the hotel name, location, and star rating are displayed.  
✅ **TC_013** - Verify that a photo gallery is present and images can be navigated.  
✅ **TC_014** - Verify that hotel amenities (Wi-Fi, parking, pool) are visible.  
✅ **TC_015** - Verify that user reviews and ratings are displayed.  
✅ **TC_016 (Edge Case)** - If a hotel has no reviews, display a "No reviews yet" message.  

---

## **AI Contribution Summary**
- Used AI to generate edge cases (e.g., invalid location, unavailable seat).
- Ensured test cases covered both happy paths and failure scenarios.
- AI-assisted in optimizing test scenarios for dynamic UI handling.
