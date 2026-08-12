from playwright.sync_api import sync_playwright
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport (iPhone SE standard)
        context = browser.new_context(
            viewport={"width": 375, "height": 667}
        )
        page = context.new_page()
        try:
            # First, set localStorage dismissed items to verify the "Avisos de la aplicación" section
            print("Navigating to setup localStorage dismissed preferences...")
            page.goto("http://localhost:3000/me/profile?onboarding=true")
            page.evaluate("() => { localStorage.setItem('push-prompt-dismissed', 'true'); localStorage.setItem('pwa-banner-dismissed', 'true'); }")
            page.reload()
            page.wait_for_timeout(2000)

            # 1. Verify Onboarding welcome banner
            print("Verifying onboarding welcome banner...")
            banner = page.locator("text=¡Te damos la bienvenida a Padel Red!")
            if banner.is_visible():
                print("SUCCESS: Onboarding welcome banner is visible!")
            else:
                print("WARNING: Onboarding welcome banner NOT visible!")

            # 2. Verify "Continuar al inicio" CTA button
            print("Verifying 'Continuar al inicio' CTA button...")
            cta_button = page.locator("text=Continuar al inicio")
            if cta_button.is_visible():
                print("SUCCESS: 'Continuar al inicio' CTA button is visible!")
            else:
                print("WARNING: 'Continuar al inicio' CTA button NOT visible!")

            # 3. Verify "Avisos de la aplicación" restoration section
            print("Verifying 'Avisos de la aplicación' restoration panel...")
            restoration_header = page.locator("text=Avisos de la aplicación")
            if restoration_header.is_visible():
                print("SUCCESS: 'Avisos de la aplicación' restoration section is visible!")
            else:
                print("WARNING: 'Avisos de la aplicación' restoration section NOT visible!")

            # 4. Take a screenshot
            screenshot_path = "/app/verification/screenshots/roby_onboarding_polish_verification.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot taken and saved to {screenshot_path}")

        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    run_verification()
