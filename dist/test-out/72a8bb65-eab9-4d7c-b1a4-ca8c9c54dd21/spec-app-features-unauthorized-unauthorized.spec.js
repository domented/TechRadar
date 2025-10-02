import {
  AuthService,
  Router,
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
  __decorate,
  init_core,
  init_testing,
  init_tslib_es6
} from "./chunk-FMEK63YL.js";
import {
  __async,
  __commonJS,
  __esm
} from "./chunk-TTULUY32.js";

// angular:jit:template:src/app/features/unauthorized/unauthorized.html
var unauthorized_default;
var init_unauthorized = __esm({
  "angular:jit:template:src/app/features/unauthorized/unauthorized.html"() {
    unauthorized_default = `<!-- src/app/features/unauthorized/unauthorized.html -->

<div class="unauthorized-container">
    <div class="unauthorized-card">

        <!-- Icon -->
        <div class="icon-wrapper">
            <i class="fas fa-shield-alt"></i>
        </div>

        <!-- Heading -->
        <h1 class="title">Zugriff verweigert</h1>

        <!-- Message -->
        <p class="message">
            Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.
            <br>
            Diese Seite ist nur f\xFCr Administratoren verf\xFCgbar.
        </p>

        <!-- User Info -->
        <div class="user-info" *ngIf="authService.currentUser()">
            <small class="text-muted">Angemeldet als:</small>
            <p class="user-name">
                <i class="fas fa-user me-2"></i>
                {{ authService.currentUser()?.username }}
                <span class="badge bg-secondary ms-2">
          {{ authService.currentUser()?.role === 'admin' ? 'Admin' : 'Viewer' }}
        </span>
            </p>
        </div>

        <!-- Actions -->
        <div class="actions">
            <button class="btn btn-primary" (click)="goBack()">
                <i class="fas fa-arrow-left me-2"></i>
                Zur\xFCck zum Radar
            </button>

            <a routerLink="/login" class="btn btn-outline-secondary ms-2">
                <i class="fas fa-sign-out-alt me-2"></i>
                Abmelden
            </a>
        </div>

    </div>
</div>`;
  }
});

// angular:jit:style:src/app/features/unauthorized/unauthorized.css
var unauthorized_default2;
var init_unauthorized2 = __esm({
  "angular:jit:style:src/app/features/unauthorized/unauthorized.css"() {
    unauthorized_default2 = '/* src/app/features/unauthorized/unauthorized.css */\n.unauthorized-container {\n  min-height: calc(100vh - 120px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 40px 20px;\n  background:\n    linear-gradient(\n      135deg,\n      #667eea 0%,\n      #764ba2 100%);\n  position: relative;\n  overflow: hidden;\n}\n.unauthorized-card {\n  background: rgba(255, 255, 255, 0.98);\n  -webkit-backdrop-filter: blur(20px);\n  backdrop-filter: blur(20px);\n  border-radius: 24px;\n  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.3) inset;\n  padding: 70px 50px;\n  max-width: 600px;\n  width: 100%;\n  text-align: center;\n  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n  position: relative;\n  z-index: 10;\n}\n@keyframes fadeInUp {\n  from {\n    opacity: 0;\n    transform: translateY(40px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.icon-wrapper {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 140px;\n  height: 140px;\n  background:\n    linear-gradient(\n      135deg,\n      #f093fb 0%,\n      #f5576c 100%);\n  border-radius: 50%;\n  margin-bottom: 35px;\n  box-shadow: 0 20px 40px rgba(245, 87, 108, 0.3);\n  animation: pulse 2s ease-in-out infinite;\n  position: relative;\n}\n.icon-wrapper::before {\n  content: "";\n  position: absolute;\n  inset: -5px;\n  border-radius: 50%;\n  background:\n    linear-gradient(\n      135deg,\n      #f093fb 0%,\n      #f5576c 100%);\n  opacity: 0.3;\n  animation: pulse 2s ease-in-out infinite;\n  z-index: -1;\n}\n@keyframes pulse {\n  0%, 100% {\n    transform: scale(1);\n  }\n  50% {\n    transform: scale(1.05);\n  }\n}\n.icon-wrapper i {\n  font-size: 5rem;\n  color: white;\n  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));\n}\n.title {\n  font-size: 2.5rem;\n  font-weight: 800;\n  background:\n    linear-gradient(\n      135deg,\n      #667eea 0%,\n      #764ba2 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n  margin-bottom: 20px;\n  letter-spacing: -0.5px;\n}\n.message {\n  font-size: 1.15rem;\n  color: #4a5568;\n  line-height: 1.8;\n  margin-bottom: 40px;\n  font-weight: 400;\n}\n.user-info {\n  background:\n    linear-gradient(\n      135deg,\n      #f7fafc 0%,\n      #edf2f7 100%);\n  border-radius: 16px;\n  padding: 25px;\n  margin-bottom: 35px;\n  border: 1px solid #e2e8f0;\n  transition: all 0.3s ease;\n}\n.user-info:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);\n}\n.user-info small {\n  display: block;\n  margin-bottom: 10px;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: #718096;\n}\n.user-name {\n  font-size: 1.25rem;\n  color: #2d3748;\n  font-weight: 700;\n  margin: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n}\n.user-name i {\n  color: #667eea;\n  font-size: 1.1rem;\n}\n.badge {\n  font-size: 0.75rem;\n  padding: 4px 12px;\n  border-radius: 12px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 15px;\n  justify-content: center;\n  margin-top: 10px;\n}\n.btn {\n  padding: 16px 32px;\n  font-size: 1rem;\n  font-weight: 700;\n  border-radius: 12px;\n  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n  border: none;\n  cursor: pointer;\n  letter-spacing: 0.3px;\n  position: relative;\n  overflow: hidden;\n}\n.btn::before {\n  content: "";\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  width: 0;\n  height: 0;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.3);\n  transform: translate(-50%, -50%);\n  transition: width 0.6s, height 0.6s;\n}\n.btn:hover::before {\n  width: 300px;\n  height: 300px;\n}\n.btn-primary {\n  background:\n    linear-gradient(\n      135deg,\n      #667eea 0%,\n      #764ba2 100%);\n  color: white;\n  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);\n}\n.btn-primary:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);\n}\n.btn-primary:active {\n  transform: translateY(-1px);\n}\n.btn-outline-secondary {\n  border: 2px solid #cbd5e0;\n  color: #4a5568;\n  background: white;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);\n}\n.btn-outline-secondary:hover {\n  background: #f7fafc;\n  border-color: #a0aec0;\n  transform: translateY(-3px);\n  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);\n}\n.btn i {\n  position: relative;\n  z-index: 1;\n}\n.background-decoration {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  z-index: 0;\n}\n.circle {\n  position: absolute;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.1);\n  -webkit-backdrop-filter: blur(2px);\n  backdrop-filter: blur(2px);\n}\n.circle-1 {\n  width: 400px;\n  height: 400px;\n  top: -200px;\n  right: -200px;\n  animation: float 25s infinite ease-in-out;\n}\n.circle-2 {\n  width: 300px;\n  height: 300px;\n  bottom: -150px;\n  left: -150px;\n  animation: float 20s infinite ease-in-out;\n  animation-delay: 5s;\n}\n.circle-3 {\n  width: 200px;\n  height: 200px;\n  top: 50%;\n  left: -100px;\n  animation: float 15s infinite ease-in-out;\n  animation-delay: 10s;\n}\n@keyframes float {\n  0%, 100% {\n    transform: translate(0, 0) rotate(0deg) scale(1);\n  }\n  25% {\n    transform: translate(50px, -50px) rotate(90deg) scale(1.1);\n  }\n  50% {\n    transform: translate(0, -100px) rotate(180deg) scale(0.9);\n  }\n  75% {\n    transform: translate(-50px, -50px) rotate(270deg) scale(1.05);\n  }\n}\n@media (max-width: 576px) {\n  .unauthorized-card {\n    padding: 40px 25px;\n  }\n  .title {\n    font-size: 2rem;\n  }\n  .icon-wrapper {\n    width: 110px;\n    height: 110px;\n  }\n  .icon-wrapper i {\n    font-size: 3.5rem;\n  }\n  .message {\n    font-size: 1rem;\n  }\n  .actions {\n    flex-direction: column;\n  }\n  .actions .btn {\n    width: 100%;\n  }\n  .user-info {\n    padding: 20px 15px;\n  }\n}\n@media (max-width: 768px) {\n  .circle-1 {\n    width: 300px;\n    height: 300px;\n  }\n  .circle-2 {\n    width: 200px;\n    height: 200px;\n  }\n  .circle-3 {\n    width: 150px;\n    height: 150px;\n  }\n}\n/*# sourceMappingURL=unauthorized.css.map */\n';
  }
});

// src/app/features/unauthorized/unauthorized.ts
var UnauthorizedComponent;
var init_unauthorized3 = __esm({
  "src/app/features/unauthorized/unauthorized.ts"() {
    "use strict";
    init_tslib_es6();
    init_unauthorized();
    init_unauthorized2();
    init_core();
    init_common();
    init_router();
    init_auth_service();
    UnauthorizedComponent = class UnauthorizedComponent2 {
      authService;
      router;
      constructor(authService, router) {
        this.authService = authService;
        this.router = router;
      }
      goBack() {
        this.router.navigate(["/technology/radar"]);
      }
      static ctorParameters = () => [
        { type: AuthService },
        { type: Router }
      ];
    };
    UnauthorizedComponent = __decorate([
      Component({
        selector: "app-unauthorized",
        standalone: true,
        imports: [CommonModule],
        template: unauthorized_default,
        styles: [unauthorized_default2]
      })
    ], UnauthorizedComponent);
  }
});

// src/app/features/unauthorized/unauthorized.spec.ts
var require_unauthorized_spec = __commonJS({
  "src/app/features/unauthorized/unauthorized.spec.ts"(exports) {
    init_testing();
    init_unauthorized3();
    describe("Unauthorized", () => {
      let component;
      let fixture;
      beforeEach(() => __async(null, null, function* () {
        yield TestBed.configureTestingModule({
          imports: [UnauthorizedComponent]
        }).compileComponents();
        fixture = TestBed.createComponent(UnauthorizedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      }));
      it("should create", () => {
        expect(component).toBeTruthy();
      });
    });
  }
});
export default require_unauthorized_spec();
//# sourceMappingURL=spec-app-features-unauthorized-unauthorized.spec.js.map
