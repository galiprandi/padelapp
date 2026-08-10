from playwright.sync_api import sync_playwright
import os

def run():
    print("Starting Playwright for matches page verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)
    os.makedirs("/app/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set mobile viewport
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()

        # Visit /match page (AUTH_BYPASS and MOCK_AUTH should be enabled in dev server)
        print("Visiting matches list page...")
        page.goto("http://localhost:3000/match")
        page.wait_for_timeout(2000)  # Wait for page data to load

        # Take screenshot of the summary card and historical list
        screenshot_path = "/app/verification/screenshots/matches_summary_nemesis.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot taken and saved to {screenshot_path}")

        context.close()
        browser.close()
        print("Playwright matches page verification finished successfully!")

if __name__ == "__main__":
    run()
