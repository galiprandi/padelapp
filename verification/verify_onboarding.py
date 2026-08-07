from playwright.sync_api import sync_playwright
import os

def run_verification():
    print("Starting Playwright for Onboarding Verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)
    os.makedirs("/app/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Record video of the journey
        context = browser.new_context(
            record_video_dir="/app/verification/videos",
            viewport={"width": 375, "height": 667}  # mobile viewport (iPhone SE standard)
        )
        page = context.new_page()
        try:
            # 1. Navigate to profile page with onboarding=true
            print("Navigating to profile page with onboarding=true...")
            page.goto("http://localhost:3000/me/profile?onboarding=true")
            page.wait_for_timeout(2000) # Wait for page load and suspense hydration

            # 2. Check if the onboarding banner is visible
            print("Checking for onboarding welcome banner...")
            banner = page.locator("text=¡Te damos la bienvenida a Padel Red!")
            if banner.is_visible():
                print("Onboarding welcome banner is successfully visible!")
            else:
                print("WARNING: Onboarding welcome banner not found!")

            # 3. Take a screenshot of the profile page with the onboarding banner
            screenshot_path = "/app/verification/screenshots/onboarding_banner.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot taken and saved to {screenshot_path}")

            # 4. Hold the state for video capture
            page.wait_for_timeout(2000)

        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    run_verification()
