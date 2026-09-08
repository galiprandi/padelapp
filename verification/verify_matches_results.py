import os
import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to /match page
    page.goto("http://localhost:3000/match")
    page.wait_for_timeout(2000)

    # Scroll down to see match cards
    page.evaluate("window.scrollTo(0, 300)")
    page.wait_for_timeout(1000)

    # Take screenshot of match results cards
    page.screenshot(path="/home/jules/verification/screenshots/matches_results.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
