from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/t/t-01")
    page.wait_for_timeout(1000)

    page.screenshot(path="verification/screenshots/quick_join_button.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
