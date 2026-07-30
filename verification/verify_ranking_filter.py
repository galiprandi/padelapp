from playwright.sync_api import sync_playwright

def run_cuj(page):
    print("Navigating to http://localhost:3000/ranking")
    page.goto("http://localhost:3000/ranking")
    page.wait_for_timeout(1500)  # Wait for page data to load

    print("Checking for active vs all tabs")
    activos_button = page.get_by_role("radio", name="Mostrar jugadores activos únicamente")
    todos_button = page.get_by_role("radio", name="Mostrar todos los jugadores registrados")

    # Capture initial screen
    page.screenshot(path="verification/screenshots/initial_ranking.png")
    page.wait_for_timeout(500)

    # Click on "Todos" tab
    if todos_button.is_visible():
        print("Clicking 'Todos' tab")
        todos_button.click()
        page.wait_for_timeout(1000)

    # Capture screen under "Todos" tab
    page.screenshot(path="verification/screenshots/todos_ranking.png")
    page.wait_for_timeout(500)

    # Click back on "Activos" tab
    if activos_button.is_visible():
        print("Clicking 'Activos' tab")
        activos_button.click()
        page.wait_for_timeout(1000)

    # Take final screenshot
    page.screenshot(path="verification/screenshots/verification.png")
    page.wait_for_timeout(1000)  # Hold final state for the video
    print("Finished verification successfully")

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
            context.close()  # MUST close context to save the video
            browser.close()
