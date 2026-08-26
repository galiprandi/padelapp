from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/turnos")
    page.wait_for_timeout(2000)

    # Click on an incomplete turn (e.g. turn with open slots or second turn)
    turns = page.locator("a[href^='/t/']").all()
    if len(turns) > 1:
        turns[1].click()
        page.wait_for_timeout(2000)
    elif len(turns) > 0:
        turns[0].click()
        page.wait_for_timeout(2000)

    # Scroll to top to show the header and banner clearly
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)

    page.screenshot(path="/home/jules/verification/screenshots/turn_salvage_banner.png")
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
