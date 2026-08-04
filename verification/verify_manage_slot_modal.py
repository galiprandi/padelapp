from playwright.sync_api import sync_playwright, expect
import os

def run():
    print("Starting Playwright for ManageSlotModal verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # iPhone mobile viewport
        )
        page = context.new_page()

        # Intercept and mock `/api/players`
        def handle_api_players(route):
            url = route.request.url
            if "q=" in url:
                # Return search results for "Gero"
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
            else:
                # Return empty/default contacts list
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    json={"players": []}
                )

        page.route("**/api/players*", handle_api_players)

        # 1. Visit /match/new page
        print("Visiting /match/new...")
        page.goto("http://localhost:3000/match/new")
        page.wait_for_timeout(2000)

        # 2. Click the slot "Jugador 2" to open ManageSlotModal
        print("Opening ManageSlotModal...")
        jugador_2_slot = page.locator("div[role='button']:has-text('Jugador 2')")
        jugador_2_slot.click()
        page.wait_for_timeout(1000)

        # 3. Search for a player name to populate results
        print("Searching for player 'Gero'...")
        page.fill("input#player-input", "Gero")
        page.wait_for_timeout(1000)  # Wait for API mock response
        page.screenshot(path="/app/verification/screenshots/modal_search_results_loaded.png")

        # 4. Let's capture the hover state on the search result!
        print("Hovering on search result...")
        first_result = page.locator("button:has-text('Gero')").first
        first_result.hover()
        page.wait_for_timeout(500)
        page.screenshot(path="/app/verification/screenshots/modal_search_results_hovered.png")

        context.close()
        browser.close()
        print("Verification script finished!")

if __name__ == "__main__":
    run()
