import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, Shield, Zap, ArrowRight, CheckCircle, ListTodo } from 'lucide-react'

const features = [
  {
    icon: ListTodo,
    title: 'Smart Task Management',
    desc: 'Create, organise, and track tasks across multiple views — board, list, and more.'
  },
  {
    icon: BarChart2,
    title: 'Productivity Analytics',
    desc: 'Weekly and monthly dashboards to visualise completion rates, scores, and trends.'
  },
  {
    icon: Shield,
    title: 'Risk Scoring',
    desc: 'Automatic overrun risk scoring based on priority, deadlines, and your history.'
  },
  {
    icon: Zap,
    title: 'Actionable Suggestions',
    desc: 'Inline tips on how to reduce risk and stay ahead of your workload.'
  }
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ST</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">SmartTask</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <CheckCircle size={14} /> Smart Task Management
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          Stop missing deadlines.<br />
          <span className="text-blue-600">Stay ahead of your workload.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          SmartTask helps you track tasks, spot overrun risks early, and understand your productivity — so you always know what needs your attention.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            Start for free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-6 py-3">Log in</Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Everything you need to work smarter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex gap-4 items-start">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-14 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to take control of your tasks?</h2>
        <p className="text-blue-100 mb-6 text-sm">Join professionals managing their work smarter with SmartTask.</p>
        <Link to="/register" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
          Create free account
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} SmartTask. Simple, focused task management.
      </footer>
    </div>
  )
}
