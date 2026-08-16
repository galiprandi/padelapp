import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to profile edit page in onboarding mode
    page.goto("http://localhost:3000/me/profile?onboarding=true")
    page.wait_for_timeout(1000)

    # Fill alias field
    alias_input = page.get_by_label("Alias en la cancha")
    alias_input.fill("El Muro")
    page.wait_for_timeout(500)

    # Click away / blur to trigger instant auto-save
    page.get_by_text("Cuenta de Google").click()
    page.wait_for_timeout(500)

    # Scroll down to ensure CTA button is fully above bottom nav
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(500)

    # Take screenshot
    page.screenshot(path="/home/jules/verification/screenshots/profile_onboarding.png")
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
