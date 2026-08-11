import os
from playwright.sync_api import sync_playwright

def verify_match_transversal_navigation():
    print("Iniciando verificación de navegación transversal de partidos...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context with mock cookie/session if needed, but since MOCK_AUTH=true and AUTH_BYPASS=true are set, it should bypass authentication or accept dummy mock session.
        # We can also inject cookies/localStorage or use the query bypass.
        context = browser.new_context(viewport={"width": 390, "height": 844}, user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/04.1")
        page = context.new_page()

        # Inyectar una cookie de sesión de prueba para pasar el AppLayoutContent auth
        context.add_cookies([{
            "name": "authjs.session-token",
            "value": "mock-session-token",
            "domain": "localhost",
            "path": "/"
        }])

        print("Navegando a la página de partido m-01...")
        page.goto("http://localhost:3000/match/m-01")

        # Esperar a que la página se cargue
        page.wait_for_timeout(3000)

        # Tomar captura de pantalla
        os.makedirs("verification/screenshots", exist_ok=True)
        screenshot_path = "verification/screenshots/match_transversal_navigation.png"
        page.screenshot(path=screenshot_path)
        print(f"Captura de pantalla guardada en: {screenshot_path}")

        # Intentar hacer clic en el nombre del organizador o un avatar para ver si redirige
        print("Buscando enlaces a perfiles de jugadores...")
        links = page.locator("a[href^='/p/']")
        count = links.count()
        print(f"Se encontraron {count} enlaces a perfiles públicos '/p/'.")

        if count > 0:
            for i in range(count):
                href = links.nth(i).get_attribute("href")
                text = links.nth(i).inner_text().strip()
                print(f"Enlace {i+1}: {text} -> {href}")
        else:
            print("ERROR: No se encontraron enlaces a perfiles públicos. La página podría no haberse cargado correctamente o faltar los enlaces.")

        browser.close()

if __name__ == "__main__":
    verify_match_transversal_navigation()
