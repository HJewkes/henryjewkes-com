import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail, Trophy } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        <h1 className="font-heading text-5xl font-bold text-text-primary mb-4">
          Henry Jewkes
        </h1>
        <p className="font-body text-xl text-text-secondary mb-8">
          Software Engineer
        </p>

        <Link
          to="/bracket"
          className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-brand-primary text-on-brand-primary font-bold rounded-lg hover:bg-brand-primary-hover transition-colors duration-normal shadow-glow-primary"
        >
          <Trophy size={20} />
          March Madness 2026 Bracket
        </Link>

        <div className="flex items-center justify-center gap-6">
          <a
            href="https://github.com/HJewkes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-tertiary hover:text-brand-primary transition-colors duration-normal"
            aria-label="GitHub"
          >
            <Github size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/hjewkes/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-tertiary hover:text-brand-primary transition-colors duration-normal"
            aria-label="LinkedIn"
          >
            <Linkedin size={24} />
          </a>
          <a
            href="mailto:hjewkes@gmail.com"
            className="text-text-tertiary hover:text-brand-primary transition-colors duration-normal"
            aria-label="Email"
          >
            <Mail size={24} />
          </a>
        </div>
      </div>
    </div>
  )
}
