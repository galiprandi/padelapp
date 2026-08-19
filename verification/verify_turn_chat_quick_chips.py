from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Set viewport to mobile size
    page.set_viewport_size({"width": 390, "height": 844})

    # Navigate to turn public details page
    page.goto("http://localhost:3000/t/t-01")
    page.wait_for_timeout(1000)

    # Scroll down to Chat header
    chat_heading = page.get_by_text("Chat del turno")
    if chat_heading.is_visible():
        chat_heading.scroll_into_view_if_needed()
    page.wait_for_timeout(800)

    # Find quick chip "⏱️ Llego 10 min tarde"
    chip = page.get_by_role("button", name="Usar atajo Llego 10 min tarde")
    if chip.is_visible():
        chip.click()
        page.wait_for_timeout(800)

        # Click send button
        send_btn = page.get_by_role("button", name="Enviar mensaje")
        send_btn.click()
        page.wait_for_timeout(1000)

    # Take screenshot
    page.screenshot(path="/home/jules/verification/screenshots/turn_chat_quick_chips.png")
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
