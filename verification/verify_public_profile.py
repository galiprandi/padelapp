from playwright.sync_api import sync_playwright
import os

def run():
    print("Starting Playwright for Public Profile verification...")
    os.makedirs("verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # Mobile viewport
            record_video_dir="verification/videos"
        )
        page = context.new_page()

        # Direct navigation to a public profile to avoid timing issues
        print("Visiting public profile /p/p-01...")
        page.goto("http://localhost:3000/p/p-01")
        page.wait_for_timeout(3000) # Wait plenty of time for compilation/data loading

        screenshot_path = "verification/screenshots/public_profile.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot taken and saved to {screenshot_path}")

        context.close()
        browser.close()
        print("Done!")

if __name__ == "__main__":
    run()
