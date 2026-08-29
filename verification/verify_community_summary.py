import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 412, "height": 915})
        page = context.new_page()

        # Set bypass cookies
        context.add_cookies([
            {"name": "auth_bypass", "value": "true", "domain": "localhost", "path": "/"}
        ])

        page.goto("http://localhost:3000/network", wait_until="networkidle")
        time.sleep(1)

        # Click on "Grafo" tab button
        grafo_tab = page.get_by_role("button", name="Grafo")
        if grafo_tab.is_visible():
            grafo_tab.click()
            time.sleep(1.5)

        # Click on "Grupo 1" filter chip
        grupo_chip = page.get_by_role("button", name="Grupo 1")
        if grupo_chip.is_visible():
            grupo_chip.click()
            time.sleep(0.5)

        page.screenshot(path="verification/community_summary.png")
        print("Screenshot saved to verification/community_summary.png")

        browser.close()

if __name__ == "__main__":
    run()
