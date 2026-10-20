import Image from "next/image";
import { marquee } from "@/content/portfolio";
import { ResumeButton } from "@/components/ui/resume-button";

export function Hero() {
  return (
    <>
      <div className="hero2">
        <div className="mono hmeta">
          <p className="tl1"><i className="dot" />Full stack developer &middot; MERN</p>
          <p className="tr1">Jabalpur, India &middot; Open to work</p>
        </div>
        <div className="hl">
          <h1 aria-label="Nishant Kushwaha">
            <span className="w" style={{ ["--i" as string]: 0 }}><span aria-hidden="true">Nishant</span></span>
            <span className="w" style={{ ["--i" as string]: 1 }}><span aria-hidden="true"><em>Kushwaha</em></span></span>
          </h1>
          <p className="sub2">I build the interface, the API and the data behind it, then ship it.</p>
          <div className="cta2">
            <a className="pill2" href="#story">Explore my work <span aria-hidden="true">&darr;</span></a>
            <ResumeButton />
            <a className="lk" href="#contact-form">Start a conversation <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="fig" style={{ ["--ph" as string]: 'url("/images/portrait.webp")' }}>
          <div className="glow" /><div className="orbit" /><div className="orbit r2" /><div className="dots" />
          <div className="tilt">
            <Image className="ph" src="/images/portrait.webp" alt="Portrait of Nishant Kushwaha" fill sizes="(max-width: 860px) 380px, (max-width: 1200px) 44vw, 560px" preload />
            <div className="sw" aria-hidden="true" />
          </div>
          <span className="chip c1" aria-hidden="true">React</span>
          <span className="chip c2" aria-hidden="true">Node.js</span>
          <span className="chip c3" aria-hidden="true">MongoDB</span>
        </div>
        <div className="mono brow">
          <a href="#story"><i className="bar2" />Scroll to discover &darr;</a>
          <span>React &middot; Node &middot; MongoDB &middot; PostgreSQL</span>
        </div>
      </div>
      <div className="mq" aria-hidden="true">
        <div>{[...marquee, ...marquee].map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>
    </>
  );
}
