import os
from playwright.sync_api import sync_playwright

def run():
    os.makedirs("verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
        )
        page = context.new_page()
        page.goto("http://localhost:3000/ranking", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/screenshots/ranking_pending_confirmations.png")
        print("Screenshot saved to verification/screenshots/ranking_pending_confirmations.png")
        browser.close()

if __name__ == "__main__":
    run()
