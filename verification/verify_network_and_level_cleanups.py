from playwright.sync_api import sync_playwright
import os

def run():
    print("Starting Playwright...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)
    os.makedirs("/app/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # We set some headers/cookies/storage if needed, but AUTH_BYPASS=true handles sessions
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # Mobile viewport (iPhone size)
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()

        # 1. Visit /network (Metrics Tab)
        print("Visiting network page (metrics)...")
        page.goto("http://localhost:3000/network")
        page.wait_for_timeout(2000)
        page.screenshot(path="/app/verification/screenshots/network_metrics.png")

        # 2. Toggle to Graph Tab
        print("Toggling to graph view...")
        # Let's find the button labeled "Grafo"
        page.get_by_role("button", name="Grafo").click()
        page.wait_for_timeout(2000)
        page.screenshot(path="/app/verification/screenshots/network_graph.png")

        # 3. Visit /ranking
        print("Visiting ranking page...")
        page.goto("http://localhost:3000/ranking")
        page.wait_for_timeout(2000)
        page.screenshot(path="/app/verification/screenshots/ranking_no_level.png")

        # 4. Visit public profile of p-01
        print("Visiting public profile...")
        page.goto("http://localhost:3000/p/p-01")
        page.wait_for_timeout(2000)
        page.screenshot(path="/app/verification/screenshots/profile_no_level.png")

        context.close()
        browser.close()
        print("Verification complete!")

if __name__ == "__main__":
    run()
