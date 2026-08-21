from playwright.sync_api import sync_playwright
import os

def run():
    print("Capturing verification screenshot for SlotDisplay...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # iPhone mobile viewport
        )
        page = context.new_page()

        print("Navigating to http://localhost:3000/match/new...")
        page.goto("http://localhost:3000/match/new")
        page.wait_for_timeout(2000)

        # Take screenshot of match creation step 0 with SlotDisplay
        page.screenshot(path="/app/verification/screenshots/slot_display_step0.png")

        # Click on the first slot button to test focus / selection
        slot_btn = page.locator("button[aria-label*='Seleccionar Pareja A']").first
        slot_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="/app/verification/screenshots/slot_display_selected.png")

        context.close()
        browser.close()
        print("Done capturing screenshot!")

if __name__ == "__main__":
    run()
