from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/ranking")
    page.wait_for_timeout(1000)

    # Click the "Todos" tab to see all users (including those with 0 matches)
    page.get_by_role("radio", name="Mostrar todos los jugadores registrados").click()
    page.wait_for_timeout(1000)

    # Take screenshot of the ranking list highlighting hot streak (Flame icons) and podium
    page.screenshot(path="/home/jules/verification/screenshots/ranking_hot_streaks.png")
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
