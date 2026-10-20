import { chapters, pipeline } from "@/content/portfolio";

const PATH = "M150 40C40 90 260 90 150 140C40 190 260 190 150 240C40 290 260 290 150 340C40 390 260 390 150 440";
const MOBILE_PATH = "M95 30C40 48 150 67 95 85C40 103 150 122 95 140C40 158 150 177 95 195C40 213 150 232 95 250";

export function Story() {
  return (
    <div className="scene" id="story">
      <div className="stage sg">
        <p className="skk">Skills, in the order a request meets them</p>
        <div className="txt">
          {chapters.map((c, i) => (
            <div className={`ch${i === 0 ? " on" : ""}`} key={i}>
              <h3>
                {c.title.map((t, j) => (typeof t === "string" ? <span key={j}>{t} </span> : <em key={j}>{t.em} </em>))}
              </h3>
              <p>{c.body}</p>
              {"chips" in c && (
                <ul className="chips">
                  {c.chips.map((x) => <li key={x}>{x}</li>)}
                  {"exposure" in c && c.exposure.map((x) => <li className="x" key={x}>{x}</li>)}
                </ul>
              )}
              {"cta" in c && <a className="btn b1" href={c.cta.href}>{c.cta.label}</a>}
            </div>
          ))}
        </div>
        <svg id="pipe" viewBox="0 0 300 520" role="img" aria-label="A request moving from interface to server, data, integrations and live">
          <path d={PATH} fill="none" stroke="#20212a" strokeWidth="3" />
          <path id="pf" d={PATH} fill="none" stroke="#2ee6c8" strokeWidth="3" />
          <g id="pn">
            {pipeline.map((_, i) => <circle key={i} className={`nd${i === 0 ? " a" : ""}`} cx="150" cy={40 + i * 100} r="14" />)}
            {pipeline.map((label, i) => <text key={label} className={i === 0 ? "a" : undefined} x="175" y={45 + i * 100}>{label}</text>)}
          </g>
          <circle id="pk" r="7" fill="#fff" cx="150" cy="40" />
        </svg>
        <svg id="pipe-mobile" viewBox="76 8 202 260" role="img" aria-label="A request moving from interface to server, data, integrations and live">
          <path d={MOBILE_PATH} fill="none" stroke="#20212a" strokeWidth="3" />
          <path id="pf-mobile" d={MOBILE_PATH} fill="none" stroke="#2ee6c8" strokeWidth="3" />
          <g id="pn-mobile">
            {pipeline.map((_, i) => <circle key={i} className={`nd${i === 0 ? " a" : ""}`} cx="95" cy={30 + i * 55} r="10" />)}
            {pipeline.map((label, i) => <text key={label} className={i === 0 ? "a" : undefined} x="125" y={37 + i * 55}>{label}</text>)}
          </g>
          <circle id="pk-mobile" r="6" fill="#fff" cx="95" cy="30" />
        </svg>
      </div>
    </div>
  );
}
