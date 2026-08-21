from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Navigate to network page with AUTH_BYPASS active
    page.goto("http://localhost:3000/network")
    page.wait_for_timeout(1000)

    # Click on 'Grafo' tab to switch to force graph view
    page.get_by_role("button", name="Grafo").click()
    page.wait_for_timeout(1500)

    # Take screenshot of the graph view
    page.screenshot(path="/home/jules/verification/screenshots/network_graph_view.png")

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
