from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        page = context.new_page()
        page.goto("http://localhost:3000/turnos")
        page.wait_for_selector("main", timeout=10000)
        page.screenshot(path="verification/turnos_list.png")
        browser.close()

if __name__ == "__main__":
    verify()
