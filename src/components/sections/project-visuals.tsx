import type { CSSProperties } from "react";
import type { ProjectId } from "@/content/portfolio";

const v = (o: Record<string, string | number>) => o as CSSProperties;

function Head({ label, tag }: { label: string; tag?: string }) {
  return <div className="mkh"><i /><i /><i /><span>{label}</span>{tag && <u>{tag}</u>}</div>;
}

const apiRows = [
  ["p", "POST", "/v1/generate"],
  ["g", "GET", "/users"],
  ["g", "GET", "/orders/:id"],
  ["p", "POST", "/auth/login"],
] as const;

function ApiFlowy() {
  return (
    <div className="mk">
      <Head label="api-flowy · console" tag="Live" />
      {apiRows.map(([c, m, path], i) => (
        <div className="mr" style={v({ "--d": i })} key={path}>
          <span className={`mb ${c}`}>{m}</span><span>{path}</span><span className="ck">✓ 200</span>
        </div>
      ))}
      <div className="mf"><b>Tests passed</b><span className="pb"><i /></span><b>Docs ready</b></div>
    </div>
  );
}

function Invoice() {
  const lines = [["×2", "Chai", 64], ["×1", "Samosa", 48]] as const;
  return (
    <div className="mk">
      <Head label="invoice · voice" tag="Listening" />
      <div className="vm">
        <div className="mic">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
        </div>
        <div className="w3">{Array.from({ length: 22 }, (_, i) => <s key={i} style={v({ "--d": i })} />)}</div>
      </div>
      <p className="tx"><span>“Two chai, one samosa for table four”</span></p>
      {lines.map(([q, n, w], i) => (
        <div className="il" style={v({ "--d": i, "--w": `${w}px` })} key={n}><em>{q}</em><span>{n}</span><s /></div>
      ))}
      <div className="il tt" style={v({ "--d": 2, "--w": "84px" })}><em /><span>Total</span><s /></div>
      <div className="sh"><span>Shop A</span><span>Shop B</span><span>Shop C</span></div>
    </div>
  );
}

function Attendance() {
  return (
    <div className="mk">
      <Head label="esp32-cam · feed" tag="Live" />
      <div className="vf2"><div className="hd" /><div className="bd" /><i className="cn" /><i className="cn" /><i className="cn" /><i className="cn" /><div className="scan" /></div>
      <div className="mf"><span className="pr">Scanning</span><span className="mb g" style={{ marginLeft: "auto" }}>✓ Marked present</span></div>
    </div>
  );
}

function Vistaar() {
  const widths = ["86%", "72%", "90%"];
  return (
    <div className="mk">
      <div className="mkh">
        <i /><i /><i /><span className="ur">store · esim</span>
        <svg className="cartb" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 4h2l2.4 11h10l2-8H7" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>
      </div>
      <div className="pg">
        {widths.map((w, i) => (
          <div className="pc" style={v({ "--d": i })} key={i}>
            <div className="sg2"><s /><s /><s /><s /></div>
            <s className="l" style={v({ "--w": w })} /><s className="l" style={v({ "--w": "55%" })} /><b>Add</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export const visuals: Record<ProjectId, () => React.JSX.Element> = { apiflowy: ApiFlowy, invoice: Invoice, attendance: Attendance, vistaar: Vistaar };
