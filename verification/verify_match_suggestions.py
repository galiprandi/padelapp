from playwright.sync_api import sync_playwright
import os

def run():
    print("Starting Playwright for match suggestions verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # Mobile viewport (iPhone size)
        )
        page = context.new_page()

        # Step 1: Go to /match/new
        print("Navigating to /match/new...")
        page.goto("http://localhost:3000/match/new")
        page.wait_for_timeout(3000)

        # Take a screenshot of the step 0 (Nuevo Partido) showing the "Sugerir Parejas" block
        screenshot_path = "/app/verification/screenshots/match_suggestions_initial.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot taken at {screenshot_path}")

        context.close()
        browser.close()
        print("Playwright run completed successfully!")

if __name__ == "__main__":
    run()
