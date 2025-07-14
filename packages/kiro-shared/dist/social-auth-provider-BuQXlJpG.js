var N = Object.defineProperty;
var E = (s) => {
  throw TypeError(s);
};
var F = (s, e, t) => e in s ? N(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var c = (s, e, t) => F(s, typeof e != "symbol" ? e + "" : e, t), k = (s, e, t) => e.has(s) || E("Cannot " + t);
var T = (s, e, t) => (k(s, e, "read from private field"), t ? t.call(s) : e.get(s)), R = (s, e, t) => e.has(s) ? E("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), b = (s, e, t, r) => (k(s, e, "write to private field"), r ? r.call(s, t) : e.set(s, t), t);
import * as O from "vscode";
import * as L from "os";
import * as f from "fs";
import * as U from "path";
import v from "crypto";
import { a as $, S as C, U as m, C as P, I as z, A as H } from "./sso-oidc-client-CX1pXiIC.js";
import { l as u } from "./errors-ExctlPQy.js";
import "node-machine-id";
import { f as l } from "./initialize-C5s0Hqbz.js";
import { w as d } from "./span-65oB6_0J.js";
import "@opentelemetry/api";
import j from "http";
class x extends Error {
  /** Constructs a new MissingPortError */
  constructor() {
    super("AuthSSOServer: missing auth server port");
  }
}
class B extends Error {
  /** Constructs a new MissingCodeError */
  constructor() {
    super("AuthSSOServer: missing code");
  }
}
class q extends Error {
  /** Constructs a new MissingStateError */
  constructor() {
    super("AuthSSOServer: missing state");
  }
}
class J extends Error {
  /** Constructs a new InvalidStateError */
  constructor() {
    super("AuthSSOServer: invalid state");
  }
}
class V extends Error {
  /** Constructs a new ServerTimeoutError */
  constructor() {
    super("AuthSSOServer: timeout");
  }
}
class W extends Error {
  /**
   * Constructs a new AuthError
   * @param error - The error code
   * @param errorDescription - Description of the error
   */
  constructor(e, t) {
    super(`AuthSSOServer: ${e}: ${t}`);
  }
}
var w;
const S = class S {
  constructor(e) {
    c(this, "baseUrl", "http://127.0.0.1");
    c(this, "oauthCallback", "/oauth/callback");
    c(this, "authenticationFlowTimeoutInMs", 6e5);
    c(this, "authenticationWarningTimeoutInMs", 6e4);
    c(this, "listenTimeoutMs", 1e4);
    c(this, "authenticationPromise");
    c(this, "deferred");
    c(this, "server");
    c(this, "connections");
    c(this, "_closed", !1);
    this.state = e, this.authenticationPromise = new Promise((t, r) => {
      this.deferred = { resolve: t, reject: r };
    }), this.connections = [], this.server = j.createServer((t, r) => {
      if (r.setHeader("Access-Control-Allow-Methods", "GET"), !t.url)
        return;
      const i = new URL(t.url, this.baseUrl);
      switch (i.pathname) {
        case this.oauthCallback: {
          this.handleAuthentication(i.searchParams, r);
          break;
        }
        default:
          u.error("Failed to close already existing auth server in AuthSSOServer.init(): %s");
      }
    }), this.server.on("connection", (t) => {
      this.connections.push(t);
    });
  }
  /** Gets the last initialized instance */
  static get lastInstance() {
    return T(S, w);
  }
  /**
   * Initializes a new AuthSSOServer
   * @param state - The state parameter for validation
   */
  static init(e = "") {
    return d(l.Auth, "auth-server.init", async () => {
      const t = T(S, w);
      if (t !== void 0 && !t.closed)
        try {
          await t.close();
        } catch (i) {
          u.error("Failed to close already existing auth server in AuthSSOServer.init(): %s", i);
        }
      u.debug("AuthSSOServer: Initialized new auth server.");
      const r = new S(e);
      return b(S, w, r), r;
    });
  }
  /** Starts the server */
  start(e) {
    return d(l.Auth, "auth-server.start", async (t) => {
      let r = 0;
      if (this.server.listening)
        throw new Error("AuthSSOServer: Server already started");
      return new Promise((i, a) => {
        this.server.on("close", () => {
          a(new Error("AuthSSOServer: Server has closed"));
        }), this.server.on("error", (o) => {
          o.code === "EADDRINUSE" && e && e.length > r + 1 ? this.listen(e[++r]) : a(new Error(`AuthSSOServer: Server failed: ${o.message}`));
        });
        const n = setTimeout(() => {
          this.server.listening || (this.close(), a(new V()));
        }, this.listenTimeoutMs);
        this.server.on("listening", () => {
          clearTimeout(n), this.server.address() || a(new x()), t.setAttribute("redirectUri", this.redirectUri), i();
        }), this.listen((e == null ? void 0 : e[0]) || 0);
      });
    });
  }
  listen(e) {
    this.server.listen(e, "127.0.0.1");
  }
  /** Closes the server */
  close() {
    return d(l.Auth, "auth-server.close", async (e) => {
      try {
        e.setAttribute("redirectUri", this.redirectUri);
      } catch {
        e.setAttribute("redirectUri", "");
      }
      return new Promise((t, r) => {
        if (this._closed) {
          t();
          return;
        }
        this.server.listening || r(new Error("AuthSSOServer: Server not started")), u.debug("AuthSSOServer: Attempting to close server.");
        for (const i of this.connections)
          i.destroy();
        this.server.close((i) => {
          i && r(i), this._closed = !0, u.debug("AuthSSOServer: Server closed successfully."), t();
        });
      });
    });
  }
  /** Gets the redirect URI */
  get redirectUri() {
    return `${this.baseLocation}${this.oauthCallback}`;
  }
  get baseLocation() {
    return `${this.baseUrl}:${this.getPort()}`;
  }
  /** Gets whether the server is closed */
  get closed() {
    return this._closed;
  }
  /** Gets the server address */
  getAddress() {
    return this.server.address();
  }
  getPort() {
    const e = this.getAddress();
    if (e instanceof Object)
      return e.port;
    if (typeof e == "string")
      return Number.parseInt(e);
    throw new x();
  }
  // TODO: Redirect to a nicer page later with proper UI feedback
  redirect(e, t) {
    e.writeHead(200, { "Content-Type": "text/html" });
    let r = "You can close this window";
    t && (r += `<br>Error: ${t}`), e.write(r), e.end();
  }
  handleAuthentication(e, t) {
    var n;
    const r = e.get("error"), i = e.get("error_description");
    if (r && i) {
      this.handleRequestRejection(t, new W(r, i));
      return;
    }
    const a = e.get("code");
    if (!a) {
      this.handleRequestRejection(t, new B());
      return;
    }
    if (this.state) {
      const o = e.get("state");
      if (!o) {
        this.handleRequestRejection(t, new q());
        return;
      }
      if (o !== this.state) {
        this.handleRequestRejection(t, new J());
        return;
      }
    }
    (n = this.deferred) == null || n.resolve(a), this.redirect(t);
  }
  handleRequestRejection(e, t) {
    var r;
    this.redirect(e, t.message), (r = this.deferred) == null || r.reject(t.message);
  }
  /** Cancels the current authentication flow */
  cancelCurrentFlow() {
    var e;
    u.debug("AuthSSOServer: Canceling current login flow"), (e = this.deferred) == null || e.reject("user cancellation");
  }
  /** Waits for authorization to complete */
  async waitForAuthorization() {
    const e = setTimeout(() => {
      u.warn("AuthSSOServer: Authentication is taking a long time");
    }, this.authenticationWarningTimeoutInMs), t = await Promise.race([
      this.authenticationPromise,
      new Promise((r, i) => {
        setTimeout(() => {
          i(new $("Timed-out waiting for browser login flow to complete"));
        }, this.authenticationFlowTimeoutInMs);
      })
    ]);
    return clearTimeout(e), t;
  }
};
w = new WeakMap(), // Last initialized instance of the Auth Server
R(S, w);
let A = S;
const G = 15 * 60, K = "https://view.awsapps.com/start", Y = "https://amzn.awsapps.com/start";
class Q {
  constructor() {
    c(this, "cacheDirectory", U.join(L.homedir(), ".aws", "sso", "cache"));
  }
  getClientRegistrationPath(e) {
    return U.join(this.cacheDirectory, `${e}.json`);
  }
  ensureCacheDirectory() {
    f.existsSync(this.cacheDirectory) || f.mkdirSync(this.cacheDirectory, { recursive: !0 });
  }
  /**
   * Writes client registration to cache
   */
  writeClientRegistration(e, t) {
    this.ensureCacheDirectory();
    const r = this.getClientRegistrationPath(e);
    f.writeFileSync(r, JSON.stringify(t, void 0, 2));
  }
  /**
   * Reads the currently cached client registration
   */
  readClientRegistration(e) {
    const t = this.getClientRegistrationPath(e);
    if (f.existsSync(t)) {
      const r = f.readFileSync(t, "utf8");
      return JSON.parse(r);
    }
  }
}
class ce {
  constructor() {
    c(this, "storage");
    c(this, "scopes", [
      "codewhisperer:completions",
      "codewhisperer:analysis",
      "codewhisperer:conversations",
      "codewhisperer:transformations",
      "codewhisperer:taskassist"
    ]);
    c(this, "authServer");
    this.storage = new Q();
  }
  getClientIdHash(e) {
    return v.createHash("sha1").update(JSON.stringify({ startUrl: e })).digest("hex");
  }
  tokenResponseToToken(e, t, r, i) {
    const a = /* @__PURE__ */ new Date(), n = new Date(a.getTime() + Number(e.expiresIn) * 1e3);
    return {
      accessToken: e.accessToken,
      refreshToken: e.refreshToken,
      expiresAt: n.toISOString(),
      clientIdHash: t,
      authMethod: "IdC",
      provider: r,
      region: i
    };
  }
  isClientRegistrationExpired(e) {
    if (!e.expiresAt)
      return !0;
    const t = new Date(e.expiresAt), r = /* @__PURE__ */ new Date();
    return t.valueOf() < r.valueOf() + G * 1e3;
  }
  async registerClient(e, t, r = !1) {
    const i = this.getClientIdHash(e), a = this.storage.readClientRegistration(i), n = new C(t);
    if (a && !this.isClientRegistrationExpired(a))
      return a;
    const o = await n.registerClient(
      {
        clientName: "Kiro IDE",
        clientType: "public",
        scopes: this.scopes,
        grantTypes: ["authorization_code", "refresh_token"],
        redirectUris: ["http://127.0.0.1/oauth/callback"],
        issuerUrl: e
      },
      r
    ), h = {
      clientId: o.clientId,
      clientSecret: o.clientSecret,
      expiresAt: new Date(o.clientSecretExpiresAt * 1e3).toISOString()
    };
    return this.storage.writeClientRegistration(i, h), h;
  }
  getStartUrl(e) {
    return e.provider === "Enterprise" ? e.startUrl : e.provider === "BuilderId" ? K : Y;
  }
  /**
   * Authenticates via IDC method using browser-based OAuth flow using start url
   * @returns Promise that resolves to the token data when authentication is complete
   */
  async authenticate(e) {
    return d(l.Auth, "idc-provider.authenticate", async (t) => {
      if (t.setAttribute("authProvider", e.provider), e.authMethod !== "IdC")
        throw new m("IdC auth: invalid auth method");
      const r = this.getStartUrl(e), i = e.region || "us-east-1", a = new C(i), n = await this.registerClient(r, i, e.provider === "Enterprise"), o = v.randomUUID();
      this.authServer = await A.init(o), await this.authServer.start();
      const h = v.randomBytes(32).toString("base64url"), g = v.createHash("sha256").update(h).digest().toString("base64url"), p = this.authServer.redirectUri, D = new URLSearchParams({
        response_type: "code",
        client_id: n.clientId,
        redirect_uri: p,
        scopes: this.scopes.join(","),
        state: o,
        code_challenge: g,
        code_challenge_method: "S256"
      }), _ = `https://oidc.${i}.amazonaws.com/authorize?${D.toString()}`;
      await O.env.openExternal(O.Uri.parse(_));
      let y;
      try {
        y = await this.authServer.waitForAuthorization();
      } catch (I) {
        throw I === "user cancellation" ? new P("Sign-in flow canceled by the user") : I;
      } finally {
        this.authServer = void 0;
      }
      const M = await a.createToken({
        clientId: n.clientId,
        clientSecret: n.clientSecret,
        grantType: "authorization_code",
        redirectUri: p,
        code: y,
        codeVerifier: h
      });
      return this.tokenResponseToToken(M, this.getClientIdHash(r), e.provider, i);
    });
  }
  /**
   * Cancels a currently ongoing sign-in flow
   */
  cancelAuth() {
    this.authServer && this.authServer.cancelCurrentFlow();
  }
  /**
   * Refreshes token granted through IDC auth
   * @returns Promise that resolves to the refreshed token data
   */
  async refreshToken(e) {
    return d(l.Auth, "idc-provider.refreshToken", async (t) => {
      if (t.setAttribute("authProvider", e.provider), e.authMethod !== "IdC")
        throw new m("IdC auth: invalid auth method");
      const { refreshToken: r, clientIdHash: i, provider: a, region: n } = e;
      try {
        const o = this.storage.readClientRegistration(i), h = n || "us-east-1", g = new C(h);
        if (!o || this.isClientRegistrationExpired(o))
          throw new z("IdC auth: No valid client registration found");
        const p = await g.createToken({
          clientId: o.clientId,
          clientSecret: o.clientSecret,
          refreshToken: r,
          grantType: "refresh_token"
        });
        return this.tokenResponseToToken(p, i, a, h);
      } catch (o) {
        throw u.error("Error refreshing token:", o), o;
      }
    });
  }
  /**
   * Logs the user out of a session generated through IDC auth
   * @returns Promise that resolves when logout was complete
   */
  logout(e) {
    return Promise.resolve();
  }
  /**
   * Deletes the user account for IDC auth provider.
   * @param _token - The token cache data (unused for IDC)
   * @throws {Error} Always throws as account deletion is not supported for enterprise auth
   */
  deleteAccount(e) {
    throw new Error("Account deletion not supported for enterprise auth");
  }
}
const X = [3128, 4649, 6588, 8008, 9091];
class he {
  constructor() {
    c(this, "authServiceClient");
    c(this, "authServer");
    this.authServiceClient = new H();
  }
  tokenResponseToToken(e, t) {
    const r = /* @__PURE__ */ new Date(), i = new Date(r.getTime() + Number(e.expiresIn) * 1e3);
    return {
      accessToken: e.accessToken,
      refreshToken: e.refreshToken,
      profileArn: e.profileArn,
      expiresAt: i.toISOString(),
      authMethod: "social",
      provider: t
    };
  }
  /**
   * Authenticates via social auth.
   * @returns Promise that resolves to the token data when authentication is complete
   */
  async authenticate(e) {
    return d(l.Auth, "social-provider.authenticate", async (t) => {
      if (t.setAttribute("authProvider", e.provider), e.authMethod !== "social")
        throw new m("Social auth: invalid auth method");
      const r = v.randomUUID();
      this.authServer = await A.init(r), await this.authServer.start(X);
      const i = v.randomBytes(32).toString("base64url"), a = v.createHash("sha256").update(i).digest().toString("base64url"), n = this.authServer.redirectUri.replace("127.0.0.1", "localhost");
      await this.authServiceClient.login({ provider: e.provider, redirectUri: n, codeChallenge: a, state: r });
      let o;
      try {
        o = await this.authServer.waitForAuthorization();
      } catch (g) {
        throw g === "user cancellation" ? new P("Sign-in flow canceled by the user") : g;
      } finally {
        this.authServer = void 0;
      }
      const h = await this.authServiceClient.createToken({ code: o, codeVerifier: i, redirectUri: n });
      return this.tokenResponseToToken(h, e.provider);
    });
  }
  /**
   * Cancels a currently ongoing sign-in flow
   */
  cancelAuth() {
    this.authServer && this.authServer.cancelCurrentFlow();
  }
  /**
   * Refreshes token granted through social auth
   * @returns Promise that resolves to the refreshed token data
   */
  async refreshToken(e) {
    return d(l.Auth, "social-provider.refreshToken", async (t) => {
      if (t.setAttribute("authProvider", e.provider), e.authMethod !== "social")
        throw new m("Social auth: invalid auth method");
      const { refreshToken: r, profileArn: i, provider: a } = e;
      try {
        const n = await this.authServiceClient.refreshToken({ refreshToken: r });
        return n.profileArn = i, this.tokenResponseToToken(n, a);
      } catch (n) {
        throw u.error("Error refreshing token:", n), n;
      }
    });
  }
  /**
   * Logs the user out of a session generated through social auth
   * @returns Promise that resolves when logout was complete
   */
  async logout(e) {
    return d(l.Auth, "social-provider.logout", async (t) => {
      if (t.setAttribute("authProvider", e.provider), !!e.refreshToken)
        return this.authServiceClient.logout({ refreshToken: e.refreshToken });
    });
  }
  /**
   * Deletes the user account using the social auth provider.
   * @param token - The token cache data containing access token
   */
  async deleteAccount(e) {
    return d(l.Auth, "social-provider.deleteAccount", async (t) => (t.setAttribute("authProvider", e.provider), this.authServiceClient.deleteAccount(e.accessToken)));
  }
}
export {
  Q as C,
  ce as I,
  he as S
};
