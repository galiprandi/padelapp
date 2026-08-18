import time
from playwright.sync_api import sync_playwright

def verify_open_to_network():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        # Navigate to turnos page
        page.goto("http://localhost:3000/turnos")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Take screenshot of turnos page showing OpenToNetworkButton in TurnCard
        page.screenshot(path="verification/screenshots/turnos_open_network.png")

        # Navigate to public detail page /t/turn-01
        page.goto("http://localhost:3000/t/turn-01")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        page.screenshot(path="verification/screenshots/turn_detail_open_network.png")

        browser.close()

if __name__ == "__main__":
    verify_open_to_network()
