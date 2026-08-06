import { personalInfo } from "../data/portfolioData";

export default function Footer() {
  return (
    <footer className="relative pb-28 pt-10 sm:pb-32">
      <div className="shell">
        <div className="rule" />
        <div className="mt-7 flex justify-center text-center">
          <p className="whisper !text-[0.75rem]">
            © {new Date().getFullYear()} {personalInfo.name} · {personalInfo.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
