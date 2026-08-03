import time
import os
import re
from playwright.sync_api import sync_playwright, expect

def main():
    print("Starting Playwright verification for turn creation and level suggested display...")
    os.makedirs("verification/screenshots", exist_ok=True)
    os.makedirs("verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a mobile device since Padel Red is mobile-first
        iphone = p.devices["iPhone 13"]
        context = browser.new_context(
            **iphone,
            record_video_dir="verification/videos"
        )
        page = context.new_page()

        # Listen to console messages
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: [{msg.type}] {msg.text}"))

        try:
            # Step 1: Navigate to the turn creation page
            print("Navigating to turn creation page...")
            page.goto("http://localhost:3000/turnos/nuevo")
            page.wait_for_timeout(500)

            # Step 2: Fill in the club
            print("Filling in club...")
            page.locator("#club").fill("Padel Club Urquiza")
            page.wait_for_timeout(500)

            # Step 3: Fill in Date and Time
            print("Filling in date and time...")
            page.locator("#date").fill("2026-12-15")
            page.wait_for_timeout(500)
            page.locator("#time").fill("19:00")
            page.wait_for_timeout(500)

            # Step 4: Verify Level Selector is present
            print("Locating suggested level select...")
            select_locator = page.locator("select#suggestedLevel")
            expect(select_locator).to_be_visible(timeout=5000)

            # Step 5: Select a different level to trigger the Level Mismatch Warning card
            # The user's mock level is 6 (Intermedio). Let's select Nivel 4 (Avanzado) so user is weaker (6 > 4)
            print("Selecting level option 4...")
            select_locator.select_option("4")
            page.wait_for_timeout(500)

            # Step 6: Verify Level Mismatch Warning is visible
            print("Waiting for Level Mismatch Warning...")
            warning_locator = page.locator("text=Aviso de nivel")
            expect(warning_locator).to_be_visible(timeout=5000)
            print("Warning is visible!")

            # Take a screenshot of the creation form with the warning card
            page.screenshot(path="verification/screenshots/turn_create_warning.png")
            page.wait_for_timeout(500)

            # Step 7: Submit the form to create the turn
            print("Submitting the form...")
            submit_btn = page.locator("button[type='submit']")
            submit_btn.click()

            # Wait for some time to let action run and observe if there are errors
            print("Waiting after click...")
            page.wait_for_timeout(5000)

            # Take a screenshot in case it did not redirect
            page.screenshot(path="verification/screenshots/after_submit_error.png")

            # Step 8: Verify we are redirected to public turn details page (/t/[id])
            print("Verifying redirection...")
            page.wait_for_url("**/t/*", timeout=5000)
            print(f"Redirected successfully to: {page.url}")
            page.wait_for_timeout(1000)

            # Step 9: Verify Suggested Level is displayed on public details card
            print("Verifying suggested level displayed in public page...")
            # Use specific locator to avoid dropdown option match conflict
            detail_p = page.locator("p.text-sm.font-bold", has_text="Nivel 4 · Avanzado")
            expect(detail_p).to_be_visible(timeout=5000)
            print("Suggested level is displayed!")

            # Take a screenshot of the final public details page
            page.screenshot(path="verification/screenshots/turn_details_suggested_level.png")
            page.wait_for_timeout(1000) # Hold final state

        finally:
            context.close()
            browser.close()
            print("Verification process finished.")

if __name__ == "__main__":
    main()
