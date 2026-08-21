import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to Turnos list page
    page.goto("http://localhost:3000/turnos")
    page.wait_for_timeout(1000)

    # Take screenshot of the turnos listing with missing player badges
    page.screenshot(path="/home/jules/verification/screenshots/turnos_list.png")
    page.wait_for_timeout(1000)

    # Navigate to turn public details page
    page.goto("http://localhost:3000/t/t-01")
    page.wait_for_timeout(1000)

    # Take screenshot of turn public details
    page.screenshot(path="/home/jules/verification/screenshots/turn_details.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 390, "height": 844} # Mobile viewport
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
