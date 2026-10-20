import { Download } from "lucide-react";

export const RESUME_PATH = "/resume/Nishant_Kushwaha_Resume.pdf";
export const RESUME_FILENAME = "Nishant_Kushwaha_Resume.pdf";

/** next.config.ts sets this at build time, only after confirming a real PDF exists at RESUME_PATH. */
export const resumeAvailable = process.env.NEXT_PUBLIC_RESUME_AVAILABLE === "1";

/** Renders nothing until the PDF exists, so the link can never point at a missing file. */
export function ResumeButton({ className = "pill2 ghost" }: { className?: string }) {
  if (!resumeAvailable) return null;
  return (
    <a className={className} href={RESUME_PATH} download={RESUME_FILENAME} type="application/pdf">
      <Download size={18} aria-hidden="true" />
      <span>Download Resume</span>
    </a>
  );
}
