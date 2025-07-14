var M = Object.defineProperty;
var L = (s, e, t) => e in s ? M(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var o = (s, e, t) => L(s, typeof e != "symbol" ? e + "" : e, t);
import { i as I, M as k, b as E, c as m, C as P, a as y, d as D, e as _, f as R, I as x, N, U as b, g as F } from "./sso-oidc-client-CX1pXiIC.js";
import { h as we, j as ke } from "./sso-oidc-client-CX1pXiIC.js";
import * as i from "vscode";
import { l as h } from "./errors-ExctlPQy.js";
import { T as Te, i as ve, a as Ie, m as Ae } from "./errors-ExctlPQy.js";
import * as S from "path";
import * as O from "os";
import * as c from "fs";
import "node-machine-id";
import { S as U, I as W } from "./social-auth-provider-BuQXlJpG.js";
import { j as H, f, r as d, a as J } from "./initialize-C5s0Hqbz.js";
import { A as Se, c as Ce, C as Pe, F as ye, J as De, M as Me, h as Le, g as _e, T as Re, b as xe, d as Ne, e as be, i as Fe } from "./initialize-C5s0Hqbz.js";
import { w as T } from "./span-65oB6_0J.js";
import { s as Ue } from "./span-65oB6_0J.js";
import "@opentelemetry/api";
import { exec as K } from "child_process";
import { promisify as $ } from "util";
import { c as He, a as Je, b as Ke, M as $e, d as je, e as qe, f as ze, l as Be } from "./config-B8Lbekw5.js";
import { J as Ve, M as Ye, c as Xe, a as Qe, g as Ze } from "./journey-tracker-BrFi4g23.js";
import { b as tt, g as rt, a as st } from "./paths-CA0scYz8.js";
import { a as it, g as nt, u as at } from "./machine-id-CSHqFXul.js";
const j = "kiro-auth-token.json";
class q {
  constructor() {
    o(this, "tokenCache");
    o(this, "cacheDirectory", S.join(O.homedir(), ".aws", "sso", "cache"));
    o(this, "_onDidChange", new i.EventEmitter());
    o(this, "watchListener");
    this.watchListener = () => {
      this.clearCache(), this._onDidChange.fire();
    }, c.watchFile(this.getAuthTokenPath(), this.watchListener);
  }
  /**
   * Cleans up internal state
   */
  dispose() {
    c.unwatchFile(this.getAuthTokenPath(), this.watchListener);
  }
  /**
   * Event that triggers where there is a change in login status
   */
  get onDidChange() {
    return this._onDidChange.event;
  }
  readTokenFromLocalCache() {
    return this.tokenCache;
  }
  getAuthTokenPath() {
    return S.join(this.cacheDirectory, j);
  }
  ensureCacheDirectory() {
    c.existsSync(this.cacheDirectory) || c.mkdirSync(this.cacheDirectory, { recursive: !0 });
  }
  writeTokenToLocalCache(e) {
    this.tokenCache = e;
  }
  writeTokenToDisk(e) {
    this.ensureCacheDirectory(), c.writeFileSync(this.getAuthTokenPath(), JSON.stringify(e, void 0, 2));
  }
  clearCache() {
    this.tokenCache = void 0;
  }
  readTokenFromDisk() {
    const e = this.getAuthTokenPath();
    if (c.existsSync(e)) {
      const t = c.readFileSync(e, "utf8");
      try {
        return JSON.parse(t);
      } catch (r) {
        h.error("Error trying to parse the token file.", r);
        return;
      }
    }
  }
  /**
   * Retrieves the currently cached auth token
   */
  readToken() {
    const e = this.readTokenFromLocalCache();
    if (e)
      return e;
    const t = this.readTokenFromDisk();
    if (t)
      return this.writeTokenToLocalCache(t), t;
  }
  /**
   * Writes an auth token to cache
   */
  writeToken(e) {
    this.writeTokenToDisk(e), this.clearCache(), this._onDidChange.fire();
  }
  /**
   * Deletes cached auth token
   */
  clearToken() {
    this.clearCache(), c.unlinkSync(this.getAuthTokenPath()), this._onDidChange.fire();
  }
}
const C = 3 * 60, z = 10 * 60, B = 60, g = new H(f.Auth, "auth-provider"), G = (s) => s instanceof P ? {
  abort: 1
} : s instanceof y ? {
  abandon: 1
} : s instanceof D ? {
  badInput: 1
} : I(s) ? {
  unauthorized: 1
} : {
  failure: 1
};
function v(s) {
  return s instanceof F ? s : new b("Auth provider: unexpected issue");
}
function V(s) {
  return s.toString() || "unknown";
}
function l(s, e) {
  return {
    traceName: `${V(e)}.${s}`,
    errorMapper: G,
    metricAliases: [s]
  };
}
class Y {
  constructor() {
    o(this, "storage");
    o(this, "signInDeferred");
    o(this, "signInPromise");
    o(this, "providers");
    o(this, "authErrorMessagePromises", {
      AccessDenied: null,
      NetworkIssue: null,
      Unknown: null
    });
    o(this, "refreshSettled", Promise.resolve());
    o(this, "refreshLoopTimeout");
    o(this, "_onDidChangeLoginStatus", new i.EventEmitter());
    o(this, "_onDidPerformUserInitiatedLogout", new i.EventEmitter());
    o(this, "disposables", []);
    this.storage = new q(), this.providers = {
      IdC: new W(),
      social: new U()
    }, i.window.state.focused && this.startRefreshLoop(), this.disposables.push(
      this.storage,
      {
        dispose: () => {
          this.stopRefreshLoop();
        }
      },
      this.storage.onDidChange(() => {
        this.handleTokenChanges();
      }),
      i.window.onDidChangeWindowState((e) => {
        e.focused ? this.startRefreshLoop() : this.stopRefreshLoop();
      })
    );
  }
  /**
   * Event that triggers where there is a change in login status
   */
  get onDidChangeLoginStatus() {
    return this._onDidChangeLoginStatus.event;
  }
  /**
   * Event that triggers when user initiates a logout
   * We treat this separately from other changes to the login status because a user initiated logout
   * will result in the sign-in page to be rendered again.
   */
  get onDidPerformUserInitiatedLogout() {
    return this._onDidPerformUserInitiatedLogout.event;
  }
  /**
   * Cleans up internal state
   */
  dispose() {
    this.disposables.forEach((e) => {
      e.dispose();
    });
  }
  stopRefreshLoop() {
    this.refreshLoopTimeout && clearInterval(this.refreshLoopTimeout);
  }
  startRefreshLoop() {
    this.stopRefreshLoop(), this.refreshSettled = this.attemptRefreshIfCloseToExpiry(), this.refreshLoopTimeout = setInterval(() => {
      this.refreshSettled = this.attemptRefreshIfCloseToExpiry();
    }, B * 1e3);
  }
  /**
   * Handles changes of the token inside the storage
   * This ensures that changes made to the file system reflect correctly on the UI
   * More importantly, it ensures that an action performed in one IDE window reflect
   * correctly in all other open IDE windows.
   */
  handleTokenChanges() {
    if (this.isLoggedIn()) {
      const e = this.storage.readToken();
      this.signInDeferred && this.signInDeferred.resolve(e), this._onDidChangeLoginStatus.fire({
        isSignedIn: !0,
        token: e
      });
    } else
      this._onDidChangeLoginStatus.fire({
        isSignedIn: !1,
        token: void 0
      });
  }
  async attemptRefreshIfCloseToExpiry() {
    try {
      const e = this.storage.readToken();
      if (!e || !e.expiresAt || !e.accessToken)
        return;
      this.isAuthTokenExpiredWithinSeconds(e, z) && await T(f.Auth, "auth-provider.scheduled-refresh", () => this.refreshToken());
    } catch (e) {
      const t = this.storage.readToken();
      I(e) && t && this.isAuthTokenExpiredWithinSeconds(t, C) && this.logoutAndForget();
    }
  }
  isAuthTokenExpiredWithinSeconds(e, t) {
    if (!e.expiresAt || !e.accessToken)
      return !0;
    const r = new Date(e.expiresAt), n = /* @__PURE__ */ new Date();
    return r.valueOf() < n.valueOf() + t * 1e3;
  }
  isAuthTokenExpired(e) {
    return this.isAuthTokenExpiredWithinSeconds(e, C);
  }
  /**
   * Returns the current auth token if authenticated
   * @returns Promise that resolves to the token (string)
   */
  async getToken() {
    return (await this.getTokenData()).accessToken;
  }
  /**
   * Returns the current auth token if authenticated
   * @returns The token read from cache / disk
   */
  readToken() {
    return this.storage.readToken();
  }
  /**
   * Returns the current profileArn if authenticated
   * @returns Promise that resolves to the profileArn (string)
   */
  async getProfileArn() {
    const e = await this.getTokenData();
    return "profileArn" in e ? e.profileArn : void 0;
  }
  /**
   * Returns the current auth token by trying various methods to read or re-generate it
   * (including attempting to refresh the token if expired)
   * @returns Promise that resolves to the token (LocalTokenCacheData)
   */
  async getTokenData({ attemptRefresh: e } = { attemptRefresh: !0 }) {
    await this.refreshSettled;
    try {
      const t = this.storage.readToken();
      if (!t)
        throw new k("No valid token found");
      if (!this.isAuthTokenExpired(t))
        return t;
      if (t.refreshToken && e)
        return await T(f.Auth, "auth-provider.getTokenData", async () => (await this.refreshToken(), await this.getTokenData({ attemptRefresh: !1 })));
      throw new E("No valid token found");
    } catch (t) {
      throw I(t) && this.logoutAndForget(), h.error("Failed to retrieve auth token:", t), v(t);
    }
  }
  /**
   * Whether the user is currently considered to be logged in
   */
  isLoggedIn() {
    const e = this.storage.readToken();
    return !!(e != null && e.refreshToken);
  }
  /**
   * Logs the user out of the session
   * @returns Promise that resolves when logout is complete
   */
  async logout() {
    if (!this.isLoggedIn())
      return;
    const e = this.storage.readToken();
    if (e)
      return g.withTrace(l("logout", e.provider), async (t) => {
        t.setAttribute("authProvider", e.provider);
        const r = this.providers[e.authMethod];
        this.storage.clearToken();
        try {
          await r.logout(e);
        } catch (n) {
          throw h.error("Failed to logout:", n), v(n);
        }
      });
  }
  async logoutAndForget() {
    try {
      await this.logout();
    } catch {
    }
  }
  /**
   * Deletes the user account
   * @returns Promise that resolves when account deletion is complete
   */
  async deleteAccount() {
    if (!this.isLoggedIn())
      throw new m("Not logged in");
    const e = this.storage.readToken();
    if (!e)
      throw new k("No token available");
    return g.withTrace(l("deleteAccount", e.provider), async (t) => {
      t.setAttribute("authProvider", e.provider);
      const r = this.providers[e.authMethod];
      try {
        await r.deleteAccount(e), this.storage.clearToken(), this._onDidPerformUserInitiatedLogout.fire();
      } catch (n) {
        throw h.error("Failed to delete account:", n), v(n);
      }
    });
  }
  /**
   * Attempts to refresh the auth token
   * @returns Promise that resolves when token refresh is complete
   */
  async refreshToken() {
    const e = this.storage.readToken();
    if (!(e != null && e.refreshToken))
      throw new m("No valid refresh token found");
    return g.withTrace(l("refreshToken", e.provider), async (t) => {
      var r;
      t.setAttribute("authProvider", e.provider);
      try {
        const w = await this.providers[e.authMethod].refreshToken(e);
        ((r = this.storage.readToken()) == null ? void 0 : r.refreshToken) === e.refreshToken && this.storage.writeToken(w);
      } catch (n) {
        throw h.error("Failed to refresh token:", n), n;
      }
    });
  }
  async openInternalLink(e) {
    const t = await i.env.asExternalUri(
      i.Uri.parse(`${i.env.uriScheme}://kiro.kiroAgent${e}`)
    );
    await i.env.openExternal(t);
  }
  /**
   * Authenticates the user with any of the available login options: social (Google, Github),
   * builderId, enterprise or internal login
   */
  async authenticateWithOptions(e) {
    return d("started-login"), g.withTrace(l("authenticate", e.provider), async (t) => {
      t.setAttribute("authProvider", e.provider), this.isLoggedIn() && await this.logout();
      try {
        const n = await this.providers[e.authMethod].authenticate(e);
        this.storage.writeToken(n), await this.openInternalLink("/did-authenticate"), d("finished-login"), J(e);
      } catch (r) {
        throw r instanceof P ? (h.info("Authentication canceled"), d("canceled-login")) : r instanceof y ? (h.info("Authentication timed out"), d("abandoned-login")) : r instanceof D ? (h.error("Authentication failed due to bad user input:", r), d("bad-user-input")) : (h.error("Authentication failed:", r), d("failed-login"), i.window.showErrorMessage("Failed to authenticate with Kiro.")), await this.logout(), r;
      }
    });
  }
  /**
   * Cancels any current ongoing sign-in flow
   */
  cancelSignIn() {
    this.providers.IdC.cancelAuth(), this.providers.social.cancelAuth();
  }
  /**
   * Consumers of the auth provider should call this method when a token issued through this provider
   * was rejected by the invoked service.
   */
  async handleAuthError(e) {
    return e instanceof _ || e instanceof k || e instanceof E || e instanceof m || e instanceof R || e instanceof x ? this.showInvalidSessionErrorMessage() : e instanceof N ? this.showNetworkIssueErrorMessage() : this.showUnknownIssueErrorMessage();
  }
  async showInvalidSessionErrorMessage() {
    return T(f.Auth, "auth-provider.manual-error-resolve", async () => {
      if (this.authErrorMessagePromises.AccessDenied)
        return this.authErrorMessagePromises.AccessDenied;
      const e = i.window.showErrorMessage(
        "Could not complete the request because your session is invalid or expired.",
        "Refresh session",
        "Login"
      );
      this.authErrorMessagePromises.AccessDenied = e;
      let t = await e;
      if (t === "Refresh session")
        try {
          await this.refreshToken(), i.window.showInformationMessage("Your session was successfully refreshed.");
        } catch {
          this.logoutAndForget(), t = await i.window.showErrorMessage("We are unable to refresh your session.", "Login");
        }
      t === "Login" && (await this.logout(), this._onDidPerformUserInitiatedLogout.fire()), this.authErrorMessagePromises.AccessDenied = null;
    });
  }
  async showNetworkIssueErrorMessage() {
    if (this.authErrorMessagePromises.NetworkIssue)
      return this.authErrorMessagePromises.NetworkIssue;
    const e = i.window.showErrorMessage(
      "Could not communicate with the service. Please check your network connection.",
      "Dismiss"
    );
    this.authErrorMessagePromises.NetworkIssue = e, await e, this.authErrorMessagePromises.NetworkIssue = null;
  }
  async showUnknownIssueErrorMessage() {
    if (this.authErrorMessagePromises.Unknown)
      return this.authErrorMessagePromises.Unknown;
    const e = i.window.showErrorMessage("An unexpected issue occurred.", "Dismiss");
    this.authErrorMessagePromises.Unknown = e, await e, this.authErrorMessagePromises.Unknown = null;
  }
  /**
   * Returns a promise that resolves once the user is logged in
   */
  async waitForSignIn() {
    return this.isLoggedIn() ? this.storage.readToken() : (this.signInPromise || (this.signInPromise = new Promise((e) => {
      this.signInDeferred = { resolve: e };
    }).then((e) => (this.signInPromise = void 0, this.signInDeferred = void 0, e))), this.signInPromise);
  }
}
const X = $(K), Q = "mwinit", Z = process.platform == "win32" ? "where.exe" : "which";
async function ee() {
  try {
    return await X(`${Z} ${Q}`), !0;
  } catch {
    return !1;
  }
}
const a = new Y(), p = "kiro", te = {
  BuilderId: "BuilderId",
  Enterprise: "AWS IAM Identity Center",
  Internal: "Amazon internal (Midway)",
  Github: "GitHub",
  Google: "Google"
};
class u {
  constructor(e) {
    o(this, "account");
    o(this, "id", p);
    o(this, "scopes", []);
    o(this, "accessToken", "");
    this.account = { id: p, label: e ? te[e] : "" };
  }
}
class A {
  constructor(e) {
    o(this, "disposables", []);
    o(this, "_onDidChangeSessions", new i.EventEmitter());
    this.controller = e, this.disposables.push(
      a.onDidChangeLoginStatus(({ token: t, isSignedIn: r }) => {
        r ? this._onDidChangeSessions.fire({
          removed: [],
          added: [new u(t.provider)],
          changed: []
        }) : this._onDidChangeSessions.fire({
          removed: [new u()],
          added: [],
          changed: []
        });
      }),
      a.onDidPerformUserInitiatedLogout(() => {
        this.controller.showSignInPage();
      })
    );
  }
  get onDidChangeSessions() {
    return this._onDidChangeSessions.event;
  }
  dispose() {
    this.disposables.forEach((e) => {
      e.dispose();
    });
  }
  async getSessions(e, t) {
    if (a.isLoggedIn()) {
      const r = a.readToken();
      return Promise.resolve([new u(r.provider)]);
    }
    return Promise.resolve([]);
  }
  async createSession(e, t) {
    if (a.isLoggedIn()) {
      const n = a.readToken();
      return new u(n.provider);
    }
    this.controller.showSignInPage();
    const r = await a.waitForSignIn();
    return new u(r.provider);
  }
  async removeSession(e) {
    a.isLoggedIn() && (await a.logout(), this.controller.showSignInPage());
  }
}
o(A, "name", "Kiro");
class re {
  constructor() {
    o(this, "_onDidReceiveSignInRequest", new i.EventEmitter());
  }
  get onDidReceiveSignInRequest() {
    return this._onDidReceiveSignInRequest.event;
  }
  showSignInPage() {
    this._onDidReceiveSignInRequest.fire();
  }
  signIn(e) {
    return a.authenticateWithOptions(e);
  }
  cancelSignIn() {
    a.cancelSignIn();
  }
}
async function le(s) {
  const e = new re(), t = new A(e), r = i.authentication.registerAuthenticationProvider(
    p,
    A.name,
    t
  ), n = await ee(), w = i.authentication.registerSignInController(p, e, {
    isInternalUser: n
  });
  s.subscriptions.push(t, r, w, a);
}
export {
  Se as APPLICATION_NAME,
  Ce as APPLICATION_VERSION,
  y as AbandonedError,
  _ as AccessDeniedError,
  F as AuthError,
  we as AuthErrorType,
  Y as AuthProvider,
  P as CanceledError,
  Pe as ContextPropagation,
  ye as Feature,
  m as InvalidAuthError,
  x as InvalidIdCAuthError,
  R as InvalidSSOAuthError,
  D as InvalidUserInputError,
  De as JourneyId,
  Ve as JourneyTracker,
  He as MCPConnection,
  Je as MCPJsonConfigSchema,
  Ke as MCPManagerSingleton,
  $e as MCPOptionsSchema,
  E as MalformedTokenError,
  Me as MetricNamespace,
  H as MetricReporter,
  Ye as Metrics,
  k as MissingTokenError,
  N as NetworkIssueError,
  ke as ServerIssueError,
  Le as Telemetry,
  _e as TelemetryAttributes,
  f as TelemetryNamespace,
  Re as Tool,
  xe as ToolRecorder,
  Te as TrustedError,
  b as UnexpectedIssueError,
  je as addMCPToolToAutoApproveConfig,
  it as addPrivacyHeadersMiddleware,
  a as authProvider,
  Xe as createCounter,
  Qe as createHistogram,
  qe as findConfigFileForServer,
  ze as formatToolName,
  tt as getActiveMcpConfigLocation,
  rt as getHomeKiroPath,
  Ze as getJourneyTracker,
  nt as getMachineId,
  st as getWorkspaceKiroPath,
  Ne as initializeBaggagePropagation,
  be as initializeTelemetry,
  ve as isAbortError,
  I as isBadAuthIssue,
  Fe as isInitialized,
  Be as loadMcpConfig,
  h as logger,
  Ie as mapUnknownToErrorType,
  Ae as mcpLogger,
  J as recordAuthFromSource,
  d as recordOnboardingStep,
  le as registerAuthProviderExtension,
  Ue as startActiveSpan,
  at as updateResolvedIDESetting,
  T as withSpan
};
