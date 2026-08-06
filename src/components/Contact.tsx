import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Github, Linkedin, Mail, Send } from "lucide-react";
import { narrative, personalInfo } from "../data/portfolioData";
import { EASE, useReducedMotion } from "../lib/motion";
import { Rise } from "./ui/Reveal";
import {
  EmailNotConfiguredError,
  sendEmail,
} from "../utils/emailService";

type Status = "idle" | "sending" | "sent" | "error";

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  const shared = {
    id,
    value,
    required,
    autoComplete,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    className:
      "peer w-full bg-transparent px-5 text-[0.95rem] text-white/90 outline-none placeholder:text-transparent",
  };

  return (
    <div className="relative">
      <div
        className="glass-faint relative overflow-hidden rounded-2xl transition-all duration-500 ease-glass"
        style={{
          boxShadow: focused
            ? "inset 0 0 0 1px rgba(95,212,232,0.45), 0 0 34px -8px rgba(95,212,232,0.5)"
            : "inset 0 0 0 1px rgba(255,255,255,0.09)",
        }}
      >
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-5 z-[1] origin-left text-white/40 transition-all duration-400 ease-glass"
          style={{
            top: lifted ? "0.65rem" : textarea ? "1.15rem" : "50%",
            transform: lifted
              ? "translateY(0) scale(0.76)"
              : textarea
                ? "translateY(0)"
                : "translateY(-50%)",
            color: focused ? "rgba(165,233,245,0.85)" : undefined,
            letterSpacing: lifted ? "0.12em" : "0",
            textTransform: lifted ? "uppercase" : "none",
            fontSize: "0.9rem",
          }}
        >
          {label}
        </label>

        {textarea ? (
          <textarea {...shared} rows={4} className={`${shared.className} resize-none pb-5 pt-9`} />
        ) : (
          <input {...shared} type={type} className={`${shared.className} h-16 pb-1 pt-6`} />
        )}
      </div>
    </div>
  );
}

export default function Contact() {
  const reduced = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending" || status === "sent") return;

    setStatus("sending");
    setError(null);

    try {
      await sendEmail(name, email, message);
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof EmailNotConfiguredError
          ? `The form isn't hooked up to a mailbox yet — reach me directly at ${personalInfo.email}.`
          : "That didn't go through. Please try again, or email me directly."
      );
    }
  };

  const sent = status === "sent";

  return (
    <section id="contact" className="relative py-[clamp(6rem,15vh,11rem)]">
      {/* Room brightens the moment the message lands */}
      <AnimatePresence>
        {sent && (
          <motion.div
            key="flash"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: EASE }}
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 42%, rgba(95,212,232,0.16), rgba(77,124,255,0.07) 45%, transparent 72%)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="shell flex flex-col items-center text-center">
        <Rise>
          <h2
            className="beat !max-w-[16ch] text-center"
            dangerouslySetInnerHTML={{ __html: narrative.contact.beat }}
          />
        </Rise>
        <Rise delay={0.14}>
          <p className="lede mt-6 max-w-[40ch]">{narrative.contact.body}</p>
        </Rise>

        <Rise delay={0.24} className="mt-12 w-full max-w-[38rem]">
          <div className="glass edge relative overflow-hidden rounded-[1.9rem] p-6 text-left sm:p-9">
            {/* Ripple that expands out of the button on success */}
            <AnimatePresence>
              {sent && !reduced && (
                <motion.span
                  key="ripple"
                  aria-hidden
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 4.5, opacity: 0 }}
                  transition={{ duration: 1.5, ease: EASE }}
                  className="pointer-events-none absolute bottom-12 left-1/2 h-40 w-40 rounded-full"
                  /* Centred via Framer's own x so it composes with scale. */
                  style={{ x: "-50%", border: "1px solid rgba(95,212,232,0.55)" }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="grid h-14 w-14 place-items-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(95,212,232,0.35), rgba(77,124,255,0.2))",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 40px -6px rgba(95,212,232,0.8)",
                    }}
                  >
                    <Check size={22} strokeWidth={2.2} className="text-white" />
                  </motion.span>
                  <p className="mt-6 font-display text-[1.3rem] font-normal tracking-supertight text-white">
                    Message Delivered Successfully.
                  </p>
                  <p className="whisper mt-2">I'll get back to you shortly.</p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-7 text-[0.78rem] text-white/40 underline-offset-4 transition-colors hover:text-white/75 hover:underline"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Your name"
                      value={name}
                      onChange={setName}
                      required
                      autoComplete="name"
                    />
                    <Field
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <Field
                    label="What are you building?"
                    value={message}
                    onChange={setMessage}
                    textarea
                    required
                  />

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="text-[0.78rem] leading-relaxed text-white/55"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="mt-2 flex justify-center">
                    <motion.button
                      type="submit"
                      disabled={status === "sending"}
                      aria-label="Send message"
                      animate={{ width: status === "sending" ? 56 : 172 }}
                      transition={{ duration: 0.55, ease: EASE }}
                      className="edge relative grid h-14 place-items-center overflow-hidden rounded-full text-[0.9rem] font-medium text-white/95 backdrop-blur-xl disabled:cursor-wait"
                      style={{
                        background: "rgba(255,255,255,0.13)",
                        boxShadow:
                          "0 10px 28px -12px rgba(77,124,255,0.7), inset 0 1px 0 rgba(255,255,255,0.28)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-0 opacity-75"
                        style={{
                          background:
                            "linear-gradient(120deg, rgba(95,212,232,0.32), rgba(77,124,255,0.36) 50%, rgba(155,123,255,0.32))",
                        }}
                      />
                      <AnimatePresence mode="wait" initial={false}>
                        {status === "sending" ? (
                          <motion.span
                            key="spin"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`relative z-[2] block h-4 w-4 rounded-full border border-white/30 border-t-white ${
                              reduced ? "" : "animate-spin"
                            }`}
                          />
                        ) : (
                          <motion.span
                            key="label"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative z-[2] flex items-center gap-2.5 whitespace-nowrap"
                          >
                            Send Message
                            <Send size={14} strokeWidth={1.9} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Rise>

        <Rise delay={0.34} className="mt-12 w-full">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <a
              href={`mailto:${personalInfo.email}`}
              className="group inline-flex items-center gap-2.5 text-[0.85rem] text-white/55 transition-colors duration-300 hover:text-white"
            >
              <Mail size={15} strokeWidth={1.7} />
              <span className="relative">
                {personalInfo.email}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white/50 transition-all duration-500 ease-glass group-hover:w-full" />
              </span>
            </a>
            <a
              href={personalInfo.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 text-[0.85rem] text-white/55 transition-colors duration-300 hover:text-white"
            >
              <Linkedin size={15} strokeWidth={1.7} />
              LinkedIn
              <ArrowUpRight
                size={13}
                className="opacity-0 transition-all duration-400 group-hover:-translate-y-0.5 group-hover:opacity-70"
              />
            </a>
            <a
              href={personalInfo.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 text-[0.85rem] text-white/55 transition-colors duration-300 hover:text-white"
            >
              <Github size={15} strokeWidth={1.7} />
              GitHub
              <ArrowUpRight
                size={13}
                className="opacity-0 transition-all duration-400 group-hover:-translate-y-0.5 group-hover:opacity-70"
              />
            </a>
          </div>
        </Rise>
      </div>
    </section>
  );
}
