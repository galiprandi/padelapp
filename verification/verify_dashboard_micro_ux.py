from playwright.sync_api import sync_playwright
import os

def run():
    print("Starting Playwright for dashboard page micro-UX verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)
    os.makedirs("/app/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set mobile viewport (iPhone size)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()

        # Visit /me page (with mock auth active)
        print("Visiting dashboard page (/me)...")
        page.goto("http://localhost:3000/me")
        page.wait_for_timeout(3000)  # Wait for page data and components to load and render

        # Scroll to stats row to highlight it
        print("Scrolling to stats row...")
        stats_row = page.locator("a[aria-label^='Ranking: posición']").first
        if stats_row.is_visible():
            stats_row.scroll_into_view_if_needed()
            page.wait_for_timeout(500)

        # Take a high-fidelity screenshot
        screenshot_path = "/app/verification/screenshots/dashboard_micro_ux.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot taken and saved to {screenshot_path}")

        # Hover over one of the stats cards (Ranking card) to show hover styling if possible
        print("Hovering over Ranking card...")
        ranking_card = page.locator("a[aria-label^='Ranking: posición']").first
        if ranking_card.is_visible():
            ranking_card.hover()
            page.wait_for_timeout(1000)
            # Take a second screenshot to capture hover state
            page.screenshot(path="/app/verification/screenshots/dashboard_micro_ux_hover.png")

        context.close()
        browser.close()
        print("Playwright dashboard page verification finished successfully!")

if __name__ == "__main__":
    run()
