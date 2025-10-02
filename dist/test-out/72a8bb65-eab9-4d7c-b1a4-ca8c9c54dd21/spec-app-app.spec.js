import {
  AuthService,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  init_auth_service,
  init_router
} from "./chunk-2ES4RT3I.js";
import {
  CommonModule,
  init_common
} from "./chunk-AM66TXCI.js";
import {
  Component,
  TestBed,
  VERSION,
  __decorate,
  init_core,
  init_testing,
  init_tslib_es6,
  signal
} from "./chunk-FMEK63YL.js";
import {
  __async,
  __commonJS,
  __esm
} from "./chunk-TTULUY32.js";

// angular:jit:template:src/app/app.html
var app_default;
var init_app = __esm({
  "angular:jit:template:src/app/app.html"() {
    app_default = `<!-- src/app/app.html -->

<div class="app-container">
    <!-- Navigation Header -->
    <header class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div class="container-fluid">
            <!-- Brand/Logo Bereich -->
            <div class="navbar-brand d-flex align-items-center">
                <i class="fas fa-radar-chart me-2 fs-4"></i>
                <span class="fw-bold fs-5">{{ title() }}</span>
            </div>

            <!-- Mobile Menu Toggle -->
            <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
            >
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Hauptnavigation -->
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">

                    <!-- Viewer Bereich - F\xFCr ALLE authentifizierten User -->
                    <li class="nav-item" *ngIf="authService.isAuthenticated()">
                        <a class="nav-link" routerLink="/technology/radar" routerLinkActive="active">
                            <i class="fas fa-eye me-1"></i>
                            Technology Radar
                        </a>
                    </li>

                    <li class="nav-item" *ngIf="authService.isAuthenticated()">
                        <a class="nav-link" routerLink="/technology/list" routerLinkActive="active">
                            <i class="fas fa-list me-1"></i>
                            Technologien
                        </a>
                    </li>

                    <!-- Administration - NUR F\xDCR ADMINS -->
                    <li class="nav-item dropdown" *ngIf="authService.isAdmin()">
                        <a
                                class="nav-link dropdown-toggle"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                        >
                            <i class="fas fa-cogs me-1"></i>
                            Administration
                        </a>
                        <ul class="dropdown-menu">
                            <li>
                                <a class="dropdown-item" routerLink="/technology/new">
                                    <i class="fas fa-plus me-2"></i>
                                    Neue Technologie
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" routerLink="/technology/import">
                                    <i class="fas fa-upload me-2"></i>
                                    Importieren
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" routerLink="/technology/export">
                                    <i class="fas fa-download me-2"></i>
                                    Exportieren
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>

                <!-- Auth Status rechts -->
                <div class="navbar-nav">
                    <!-- Wenn NICHT eingeloggt -->
                    <div class="nav-item" *ngIf="!authService.isAuthenticated()">
                        <a class="btn btn-outline-light" routerLink="/login">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            Anmelden
                        </a>
                    </div>

                    <!-- Wenn eingeloggt -->
                    <div class="nav-item dropdown" *ngIf="authService.isAuthenticated()">
                        <a
                                class="nav-link dropdown-toggle d-flex align-items-center"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                        >
                            <i class="fas fa-user-circle me-2 fs-5"></i>
                            <div class="d-flex flex-column align-items-start">
                                <span class="fw-bold">{{ authService.currentUser()?.username }}</span>
                                <small class="text-light opacity-75">
                                    {{ authService.currentUser()?.role === 'admin' ? 'Administrator' : 'Viewer' }}
                                </small>
                            </div>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li class="px-3 py-2 border-bottom">
                                <small class="text-muted">Angemeldet als</small><br>
                                <strong>{{ authService.currentUser()?.email }}</strong>
                            </li>
                            <li>
                                <a class="dropdown-item" href="#" (click)="logout($event)">
                                    <i class="fas fa-sign-out-alt me-2"></i>
                                    Abmelden
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Hauptinhalt -->
    <main class="main-content">
        <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="footer bg-light border-top mt-auto">
        <div class="container-fluid py-3">
            <div class="row">
                <div class="col-md-6">
                    <small class="text-muted">
                        <i class="fas fa-copyright me-1"></i>
                        2025 Technology Radar System
                    </small>
                </div>
                <div class="col-md-6 text-md-end">
                    <small class="text-muted">
                        <i class="fas fa-code me-1"></i>
                        Powered by Angular {{ getAngularVersion() }}
                    </small>
                </div>
            </div>
        </div>
    </footer>
</div>`;
  }
});

// angular:jit:style:src/app/app.css
var app_default2;
var init_app2 = __esm({
  "angular:jit:style:src/app/app.css"() {
    app_default2 = '/* src/app/app.css */\n* {\n  box-sizing: border-box;\n}\nhtml,\nbody {\n  height: 100%;\n  margin: 0;\n  padding: 0;\n  font-family:\n    -apple-system,\n    BlinkMacSystemFont,\n    "Segoe UI",\n    Roboto,\n    sans-serif;\n}\n.app-container {\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n.navbar {\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  position: sticky;\n  top: 0;\n  z-index: 1030;\n}\n.navbar-brand {\n  font-weight: 600;\n  letter-spacing: -0.025em;\n  transition: transform 0.2s ease;\n}\n.navbar-brand:hover {\n  transform: scale(1.02);\n}\n.nav-link {\n  font-weight: 500;\n  transition: all 0.3s ease;\n  border-radius: 6px;\n  margin: 0 2px;\n}\n.nav-link:hover {\n  background-color: rgba(255, 255, 255, 0.1);\n  transform: translateY(-1px);\n}\n.nav-link.active {\n  background-color: rgba(255, 255, 255, 0.15);\n  font-weight: 600;\n}\n.dropdown-menu {\n  border: none;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  border-radius: 8px;\n  margin-top: 8px;\n}\n.dropdown-item {\n  padding: 0.75rem 1.25rem;\n  transition: all 0.2s ease;\n}\n.dropdown-item:hover {\n  background-color: #f8f9fa;\n  transform: translateX(4px);\n}\n.main-content {\n  flex: 1;\n  background-color: #f8f9fa;\n  min-height: 0;\n}\n.footer {\n  background-color: #ffffff !important;\n  border-top: 1px solid #e9ecef;\n  margin-top: auto;\n}\n.footer small {\n  color: #6c757d;\n  line-height: 1.5;\n}\n@media (max-width: 768px) {\n  .navbar-brand {\n    font-size: 1.1rem;\n  }\n  .nav-link {\n    padding: 0.75rem 1rem;\n    margin: 2px 0;\n  }\n  .dropdown-item {\n    padding: 1rem 1.25rem;\n  }\n  .footer {\n    text-align: center;\n  }\n  .footer .col-md-6:last-child {\n    margin-top: 0.5rem;\n  }\n}\n@media (max-width: 576px) {\n  .app-container {\n    font-size: 0.9rem;\n  }\n  .navbar-brand .fs-5 {\n    font-size: 1rem !important;\n  }\n  .footer .container-fluid {\n    padding-left: 1rem;\n    padding-right: 1rem;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  * {\n    transition: none !important;\n    animation: none !important;\n  }\n}\n.nav-link:focus,\n.dropdown-item:focus,\n.navbar-brand:focus {\n  outline: 2px solid #0d6efd;\n  outline-offset: 2px;\n}\n@media (prefers-color-scheme: dark) {\n  .main-content {\n    background-color: #212529;\n  }\n  .footer {\n    background-color: #343a40 !important;\n    border-color: #495057;\n  }\n}\n@media print {\n  .navbar,\n  .footer {\n    display: none !important;\n  }\n  .main-content {\n    background-color: white !important;\n  }\n}\n/*# sourceMappingURL=app.css.map */\n';
  }
});

// src/app/app.ts
var App;
var init_app3 = __esm({
  "src/app/app.ts"() {
    "use strict";
    init_tslib_es6();
    init_app();
    init_app2();
    init_core();
    init_router();
    init_common();
    init_core();
    init_auth_service();
    App = class App2 {
      authService;
      title = signal("TechRadar");
      constructor(authService) {
        this.authService = authService;
      }
      /**
       * Logout-Handler
       */
      logout(event) {
        event.preventDefault();
        this.authService.logout();
      }
      /**
       * Angular-Version für Template
       */
      getAngularVersion() {
        return VERSION.full;
      }
      static ctorParameters = () => [
        { type: AuthService }
      ];
    };
    App = __decorate([
      Component({
        selector: "app-root",
        standalone: true,
        imports: [
          RouterOutlet,
          RouterLink,
          RouterLinkActive,
          CommonModule
        ],
        template: app_default,
        styles: [app_default2]
      })
    ], App);
  }
});

// src/app/app.spec.ts
var require_app_spec = __commonJS({
  "src/app/app.spec.ts"(exports) {
    init_testing();
    init_app3();
    describe("App", () => {
      beforeEach(() => __async(null, null, function* () {
        yield TestBed.configureTestingModule({
          imports: [App]
        }).compileComponents();
      }));
      it("should create the app", () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
      });
      it("should render title", () => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector("h1")?.textContent).toContain("Hello, TechRadar");
      });
    });
  }
});
export default require_app_spec();
//# sourceMappingURL=spec-app-app.spec.js.map
