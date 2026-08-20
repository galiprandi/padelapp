import os
from playwright.sync_api import sync_playwright

def run():
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 390, "height": 844} # iPhone 12/13 mobile viewport
        )
        page = context.new_page()

        # Navigate to match page under bypass
        page.goto("http://localhost:3000/match/m-01")
        page.wait_for_timeout(1000)

        # Scroll to view Attendance and Match Details
        page.evaluate("window.scrollTo(0, 500)")
        page.wait_for_timeout(500)

        # Take screenshot
        screenshot_path = "/home/jules/verification/screenshots/attendance_mds_solid.png"
        page.screenshot(path=screenshot_path)
        page.wait_for_timeout(1000)

        context.close()
        browser.close()

if __name__ == "__main__":
    run()
