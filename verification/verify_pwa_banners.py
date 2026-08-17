import os
import subprocess
import time
from playwright.sync_api import sync_playwright

def verify_frontend():
    env = os.environ.copy()
    env["AUTH_BYPASS"] = "true"
    env["MOCK_AUTH"] = "true"
    env["PORT"] = "3100"

    # Start dev server
    proc = subprocess.Popen(["pnpm", "dev", "-p", "3100"], env=env)
    time.sleep(5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 390, "height": 844})
            page = context.new_page()

            # Set mock session or navigate to /me
            page.goto("http://localhost:3100/me")
            page.wait_for_selector("text=Ranking", timeout=10000)

            page.screenshot(path="/app/verification/dashboard_banners.png")
            print("Screenshot saved to /app/verification/dashboard_banners.png")
    finally:
        proc.terminate()

if __name__ == "__main__":
    verify_frontend()
