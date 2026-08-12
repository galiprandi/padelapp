from playwright.sync_api import sync_playwright, expect
import os

def run():
    print("Starting Playwright for Network Search Diacritics verification...")
    os.makedirs("/app/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # Mobile viewport (iPhone size)
        )
        page = context.new_page()

        # 1. Visit /network
        print("Visiting network page...")
        page.goto("http://localhost:3000/network")
        page.wait_for_timeout(3000)

        # 2. Toggle to Graph Tab
        print("Toggling to graph view...")
        page.get_by_role("button", name="Grafo").click()
        page.wait_for_timeout(2000)

        # 3. Search for 'agustin' (without accent)
        print("Searching for 'agustin' (should match 'Agustín')...")
        search_input = page.get_by_placeholder("Buscar jugador...")
        search_input.fill("agustin")
        page.wait_for_timeout(1000)

        # Verify empty state is NOT visible
        empty_state = page.get_by_text("No se encontraron jugadores que coincidan con")
        expect(empty_state).not_to_be_visible()
        page.screenshot(path="/app/verification/screenshots/search_diacritics_agustin.png")

        # 4. Search for 'belasteguin' (without accent)
        print("Searching for 'belasteguin' (should match 'Belasteguín')...")
        search_input.fill("")
        search_input.fill("belasteguin")
        page.wait_for_timeout(1000)

        # Verify empty state is NOT visible
        expect(empty_state).not_to_be_visible()
        page.screenshot(path="/app/verification/screenshots/search_diacritics_belasteguin.png")

        # 5. Search for a non-existent player
        print("Searching for non-existent player 'inexistente'...")
        search_input.fill("")
        search_input.fill("inexistente")
        page.wait_for_timeout(1000)

        # Verify empty state IS visible
        expect(empty_state).to_be_visible()
        page.screenshot(path="/app/verification/screenshots/search_diacritics_empty_state.png")

        context.close()
        browser.close()
        print("Verification finished successfully!")

if __name__ == "__main__":
    run()
