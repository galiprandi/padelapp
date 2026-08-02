import time
from playwright.sync_api import sync_playwright, expect

def main():
    print("Starting Playwright verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a mobile device since Padel Red is mobile-first
        iphone = p.devices["iPhone 13"]
        context = browser.new_context(**iphone)
        page = context.new_page()

        print("Navigating to profile page...")
        page.goto("http://localhost:3000/me/profile")

        # Wait for select to be visible
        print("Waiting for level select...")
        select_locator = page.locator("select#level")
        expect(select_locator).to_be_visible(timeout=5000)

        # Set to "4"
        print("Selecting level option 4...")
        select_locator.select_option("4")

        # Wait for toast
        print("Waiting for Nivel actualizado toast...")
        toast_locator = page.locator("text=Nivel actualizado")
        expect(toast_locator).to_be_visible(timeout=5000)
        print("Toast is visible!")

        # Take screenshot of the toast and level selector
        screenshot_path = "verification/screenshots/verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot successfully saved to {screenshot_path}")

        # Close browser
        browser.close()

if __name__ == "__main__":
    main()
