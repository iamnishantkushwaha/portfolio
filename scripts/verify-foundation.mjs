import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit", windowsHide: true });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)));
  });
}

const scenarios = [
  { name: "preview", site: "preview", expected: "preview" },
  { name: "production", site: "production", expected: "production" },
  { name: "vercel-preview-veto", site: "production", vercel: "preview", expected: "preview" },
];

for (const [index, scenario] of scenarios.entries()) {
  const port = 3100 + index;
  const base = `http://127.0.0.1:${port}`;
  const env = { ...process.env, SITE_ENV: scenario.site, NEXT_TELEMETRY_DISABLED: "1", TEST_BASE_URL: base, EXPECT_INDEXING: scenario.expected, TEST_SCENARIO: scenario.name };
  delete env.VERCEL;
  delete env.VERCEL_ENV;
  if (scenario.vercel) { env.VERCEL = "1"; env.VERCEL_ENV = scenario.vercel; }
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { env, windowsHide: true, stdio: "pipe" });
  let log = "";
  server.stdout.on("data", (chunk) => { log += chunk; });
  server.stderr.on("data", (chunk) => { log += chunk; });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      if (server.exitCode !== null) throw new Error(log);
      try { if ((await fetch(base)).status === 200) { ready = true; break; } } catch { /* server is still starting */ }
      await delay(250);
    }
    if (!ready) throw new Error(`Server not ready: ${log}`);
    await run(process.execPath, ["scripts/check-routes.mjs"], env);
    if (index === 0 && process.argv.includes("--browser")) {
      await run("python", ["scripts/browser-checks.py"], env);
    }
  } finally {
    server.kill();
    if (server.exitCode === null) await new Promise((resolve) => server.once("exit", resolve));
  }
}
console.log("PASS: all isolated server scenarios; owned servers stopped.");
