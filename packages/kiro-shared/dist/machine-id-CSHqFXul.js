import * as a from "vscode";
import { l as s } from "./errors-ExctlPQy.js";
import { machineIdSync as c } from "node-machine-id";
function m(i, e = "CodeWhisperer") {
  if (!a.env.isTelemetryEnabled) {
    s.debug(`${e}: telemetry is disabled, setting x-amzn-codewhisperer-opt-out to true`);
    const o = (t) => async (r) => {
      const d = r;
      return d.request.headers = {
        ...d.request.headers,
        "x-amzn-codewhisperer-opt-out": "true"
      }, t(r);
    };
    i.middlewareStack.add(o, { step: "build" });
  }
}
async function g(i, e, o, n) {
  var r;
  const t = a.workspace.getConfiguration(i, n);
  ((r = t.inspect(e)) == null ? void 0 : r.workspaceValue) !== void 0 ? await t.update(e, o, a.ConfigurationTarget.Workspace) : await t.update(e, o, a.ConfigurationTarget.Global);
}
const u = "UNDETERMINED_MACHINE_ID";
function f() {
  try {
    return c();
  } catch {
    return a.env.machineId || u;
  }
}
export {
  m as a,
  f as g,
  g as u
};
