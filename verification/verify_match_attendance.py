from playwright.sync_api import sync_playwright
import os

def run():
    print("Starting Playwright for match attendance verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)
    os.makedirs("/app/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # Mobile viewport (iPhone size)
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()

        # Visit Landing Page
        print("Visiting landing page...")
        page.goto("http://localhost:3000")
        page.wait_for_timeout(1000)
        page.screenshot(path="/app/verification/screenshots/verification.png")

        # Visit Login Page
        print("Visiting login page...")
        page.goto("http://localhost:3000/login")
        page.wait_for_timeout(1000)

        context.close()
        browser.close()
        print("Done!")

if __name__ == "__main__":
    run()
