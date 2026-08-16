from playwright.sync_api import sync_playwright

def run_verification(page):
    page.goto("http://localhost:3000/m/m-01")
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/match_invitation.png")

    page.goto("http://localhost:3000/j/slot-1")
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/match_join_slot.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
