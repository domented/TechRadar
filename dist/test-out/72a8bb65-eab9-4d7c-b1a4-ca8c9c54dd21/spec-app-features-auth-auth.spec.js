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

// angular:jit:template:src/app/features/auth/auth.html
var auth_default;
var init_auth = __esm({
  "angular:jit:template:src/app/features/auth/auth.html"() {
    auth_default = "<p>auth works!</p>\n";
  }
});

// angular:jit:style:src/app/features/auth/auth.css
var auth_default2;
var init_auth2 = __esm({
  "angular:jit:style:src/app/features/auth/auth.css"() {
    auth_default2 = "/* src/app/features/auth/auth.css */\n/*# sourceMappingURL=auth.css.map */\n";
  }
});

// src/app/features/auth/auth.ts
var Auth;
var init_auth3 = __esm({
  "src/app/features/auth/auth.ts"() {
    "use strict";
    init_tslib_es6();
    init_auth();
    init_auth2();
    init_core();
    Auth = class Auth2 {
    };
    Auth = __decorate([
      Component({
        selector: "app-auth",
        imports: [],
        template: auth_default,
        styles: [auth_default2]
      })
    ], Auth);
  }
});

// src/app/features/auth/auth.spec.ts
var require_auth_spec = __commonJS({
  "src/app/features/auth/auth.spec.ts"(exports) {
    init_testing();
    init_auth3();
    describe("Auth", () => {
      let component;
      let fixture;
      beforeEach(() => __async(null, null, function* () {
        yield TestBed.configureTestingModule({
          imports: [Auth]
        }).compileComponents();
        fixture = TestBed.createComponent(Auth);
        component = fixture.componentInstance;
        fixture.detectChanges();
      }));
      it("should create", () => {
        expect(component).toBeTruthy();
      });
    });
  }
});
export default require_auth_spec();
//# sourceMappingURL=spec-app-features-auth-auth.spec.js.map
