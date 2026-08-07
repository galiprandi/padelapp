from playwright.sync_api import sync_playwright
import os

def run():
    print("Starting Playwright for public profile page verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)
    os.makedirs("/app/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # Mobile viewport (iPhone size)
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()

        # Set environment variables in context if possible, or we assumed AUTH_BYPASS is already set
        print("Visiting public profile page for p-01...")
        # Under AUTH_BYPASS, any user should load properly
        page.goto("http://localhost:3000/p/p-01")
        page.wait_for_timeout(3000)  # Wait for the Suspense skeleton to resolve and load content

        # Take screenshot
        page.screenshot(path="/app/verification/screenshots/public_profile_cached.png")
        page.wait_for_timeout(1000)

        context.close()
        browser.close()
        print("Verification completed and screenshot/video generated!")

if __name__ == "__main__":
    run()
