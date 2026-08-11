from playwright.sync_api import sync_playwright
import os

def run():
    print("Starting Playwright for AddPlayerButton accessibility & micro-UX verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)
    os.makedirs("/app/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # Mobile viewport (iPhone size)
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()

        # Intercept and mock `/api/players` to return consistent mock data
        def handle_api_players(route):
            route.fulfill(
                status=200,
                content_type="application/json",
                json={
                    "players": [
                        {
                            "id": "p-gero",
                            "displayName": "Gero",
                            "email": "gero@padelred.com",
                            "image": None,
                            "isContact": True
                        },
                        {
                            "id": "p-facu",
                            "displayName": "Facu",
                            "email": "facu@padelred.com",
                            "image": None,
                            "isContact": False
                        }
                    ]
                }
            )

        page.route("**/api/players*", handle_api_players)

        # 1. Visit Turn Public Details page
        print("Visiting /t/t-01...")
        page.goto("http://localhost:3000/t/t-01")
        page.wait_for_timeout(2000)

        # Take screenshot of the base turn details page
        page.screenshot(path="/app/verification/screenshots/add_player_base.png")

        # 2. Click the "Agregar jugador" button
        print("Clicking 'Agregar jugador' button...")
        add_player_btn = page.locator("button[aria-label='Agregar jugador al turno']")
        add_player_btn.click()
        page.wait_for_timeout(1000)

        # Take screenshot of the expanded search input
        page.screenshot(path="/app/verification/screenshots/add_player_expanded.png")

        # 3. Enter search query 'Gero' to trigger results load
        print("Searching for 'Gero'...")
        page.fill("input#player-search-input", "Gero")
        page.wait_for_timeout(1000)

        # Take screenshot of the loaded search results
        page.screenshot(path="/app/verification/screenshots/add_player_results.png")

        # 4. Hover over the search result item to demonstrate branding background & transitions
        print("Hovering on player 'Gero' search result...")
        gero_result = page.locator("button[aria-label='Agregar a Gero']")
        gero_result.hover()
        page.wait_for_timeout(500)
        page.screenshot(path="/app/verification/screenshots/add_player_hover.png")

        # 5. Clear search query using our newly styled 'Limpiar' button
        print("Clicking 'Limpiar' clear button...")
        clear_btn = page.locator("button[aria-label='Limpiar']")
        clear_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="/app/verification/screenshots/add_player_cleared.png")

        context.close()
        browser.close()
        print("AddPlayerButton verification completed successfully!")

if __name__ == "__main__":
    run()
