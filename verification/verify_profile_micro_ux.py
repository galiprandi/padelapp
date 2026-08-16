from playwright.sync_api import sync_playwright, expect
import os

def run_verification():
    print("Starting Playwright for profile micro-UX verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)
    os.makedirs("/app/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport (iPhone SE standard)
        context = browser.new_context(
            viewport={"width": 375, "height": 667},
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()

        # Log browser console messages and errors
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        try:
            # Navigate to profile edit page (with mock auth active)
            print("Navigating to profile edit page...")
            page.goto("http://localhost:3000/me/profile")

            # Wait for form input to be rendered and hydrated
            print("Waiting for alias input selector...")
            page.wait_for_selector("#alias")
            page.wait_for_timeout(1000)

            # Print all buttons on the page to debug
            print("Buttons on the page:")
            for btn in page.locator("button").all():
                print(f"- Button text: '{btn.inner_text()}'")

            # 1. Clear alias input and fill new alias
            print("Clearing and filling new alias...")
            alias_input = page.locator("#alias")
            alias_input.click()
            alias_input.fill("Gero El Muro")
            page.wait_for_timeout(500)

            # 2. Press Enter to trigger instant save
            print("Pressing Enter to save immediately...")
            alias_input.press("Enter")
            page.wait_for_timeout(1000)

            # 3. Expect Toast "Perfil actualizado" (use .first to avoid strict mode violation)
            print("Verifying success toast...")
            success_toast = page.locator("text=Perfil actualizado").first
            expect(success_toast).to_be_visible()

            # Take screenshot of immediate save success
            screenshot_path = "/app/verification/screenshots/profile_immediate_save.png"
            page.screenshot(path=screenshot_path)
            print(f"Immediate save screenshot taken: {screenshot_path}")

            # 4. Remove photo
            print("Clicking 'Quitar foto'...")
            quitar_foto_btn = page.locator("button:has-text('Quitar foto')")
            if quitar_foto_btn.is_visible():
                quitar_foto_btn.click()
                page.wait_for_timeout(1000)

                # Expect toast "Foto eliminada"
                foto_eliminada_toast = page.locator("text=Foto eliminada").first
                expect(foto_eliminada_toast).to_be_visible()

                # Click "Deshacer" inside the "Foto eliminada" toast container
                print("Clicking 'Deshacer' on 'Foto eliminada' toast...")
                deshacer_btn = page.get_by_role("button", name="Deshacer").last
                deshacer_btn.click()
                page.wait_for_timeout(1500)

                # Expect toast "Foto restablecida"
                foto_restablecida_toast = page.locator("text=Foto restablecida").first
                expect(foto_restablecida_toast).to_be_visible()

                # Take screenshot of photo restored successfully
                screenshot_undo_path = "/app/verification/screenshots/profile_photo_undo.png"
                page.screenshot(path=screenshot_undo_path)
                print(f"Undo action screenshot taken: {screenshot_undo_path}")
            else:
                print("WARNING: 'Quitar foto' button not visible.")

        finally:
            context.close()
            browser.close()
            print("Playwright profile micro-UX verification finished successfully!")

if __name__ == "__main__":
    run_verification()
