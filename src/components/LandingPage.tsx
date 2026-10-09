import React from 'react';
import {
  MessageSquareText,
  Search,
  PlusCircle,
  ShieldCheck,
  Zap,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Building,
} from 'lucide-react';
import { CategoryIcon } from './common/CategoryIcon.tsx';

interface LandingPageProps {
  onOpenSubmit: () => void;
  onOpenTrack: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSelectCategory?: (categoryName: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenSubmit,
  onOpenTrack,
  onOpenAuth,
}) => {
  const categoriesList = [
    { name: 'Academics', icon: 'GraduationCap', desc: 'Faculty, lectures, syllabus, lab schedules' },
    { name: 'Infrastructure', icon: 'Building2', desc: 'Classrooms, benches, projectors, audio' },
    { name: 'Hostel', icon: 'Home', desc: 'Rooms, amenities, mess, cleanliness, warden' },
    { name: 'Library', icon: 'BookOpen', desc: 'Book availability, reading halls, silence' },
    { name: 'Laboratory', icon: 'FlaskConical', desc: 'Equipments, chemicals, licenses, setups' },
    { name: 'Canteen & Food', icon: 'UtensilsCrossed', desc: 'Hygiene, food quality, pricing, seating' },
    { name: 'Transport', icon: 'Bus', desc: 'Bus punctuality, routes, drivers, fleet' },
    { name: 'Electricity', icon: 'Zap', desc: 'Power cuts, ceiling fans, ACs, switchboards' },
    { name: 'Water & Sanitation', icon: 'Droplets', desc: 'RO water coolers, washrooms, plumbing' },
    { name: 'Internet/Wi-Fi', icon: 'Wifi', desc: 'Campus network, latency, hostel routers' },
    { name: 'Security', icon: 'ShieldCheck', desc: 'Campus safety, entry gates, CCTV cameras' },
    { name: 'Administration', icon: 'FileText', desc: 'Fee receipts, transcripts, ID cards, hall tickets' },
  ];

  const faqs = [
    {
      q: 'Can other students see my complaints?',
      a: 'Never. CampusVoice strictly enforces Row-Level Data Privacy. Only you and authorized college administrators can view the details and evidence of your submitted complaint.',
    },
    {
      q: 'How long does it typically take for a complaint to be resolved?',
      a: 'Urgent grievances (e.g. water leakage, security hazards) are reviewed within 4 hours. Standard infrastructure or academic complaints are acknowledged within 24 hours with status updates.',
    },
    {
      q: 'What if my complaint is marked "Resolved" but the problem is not fixed?',
      a: 'CampusVoice includes a "Reopen Complaint" guarantee. If an issue is not actually fixed, you can reopen it with a reason, triggering an immediate alert to the Principal.',
    },
    {
      q: 'Can I attach photos or documents to my complaint?',
      a: 'Yes. You can upload JPG, PNG, and PDF evidence directly from your phone or laptop while filling out the complaint form.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle radial background decorative element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Official College Grievance & Complaint Redressal Portal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Your Voice.{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-700">
              Our Responsibility.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Report campus issues, track resolution progress in real time, and collaborate directly
            with the administration to build a better college.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onOpenSubmit}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <PlusCircle size={17} />
              <span>Submit a Complaint</span>
            </button>

            <button
              onClick={onOpenTrack}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-xs transition-all hover:border-slate-300 flex items-center justify-center gap-2"
            >
              <Search size={17} className="text-slate-500" />
              <span>Track Complaint Status</span>
            </button>
          </div>

          {/* Tasteful Dashboard Preview Mockup */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl p-2 sm:p-3 bg-linear-to-b from-slate-200/60 to-slate-300/40 border border-slate-200 shadow-2xl shadow-indigo-900/10 backdrop-blur-sm">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden text-left">
              {/* Fake Window bar */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="font-mono text-[11px] text-slate-400 ml-2">
                    campusvoice.edu/track/CMP-2026-00001
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Live Audit Trail
                </span>
              </div>

              {/* Mockup Content */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        CMP-2026-00001
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">
                        Wi-Fi not working in Library 2nd Floor reading room
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Filed by Aarav Sharma (3rd Year IT) • Assigned to IT & Campus Network
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      In Progress
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    "Access points have been dropping DNS packets during evening research hours.
                    Students unable to access academic journal repositories."
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Assigned Engineer:</span>
                    <span>Suresh Kumar (Network Admin)</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600 font-medium">ETA: Within 24 Hours</span>
                  </div>
                </div>

                {/* Vertical Timeline preview */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center justify-between">
                    <span>Progress Timeline</span>
                    <span className="text-[10px] text-slate-400">Step 3 of 4</span>
                  </h4>
                  <div className="space-y-3 relative pl-4 border-l-2 border-indigo-200">
                    <div>
                      <div className="absolute -left-[5px] mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                      <p className="font-semibold text-slate-800">Submitted</p>
                      <p className="text-[10px] text-slate-400">Oct 04, 10:30 AM</p>
                    </div>
                    <div>
                      <div className="absolute -left-[5px] mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                      <p className="font-semibold text-slate-800">Under Review</p>
                      <p className="text-[10px] text-slate-400">Oct 05, 02:15 PM</p>
                    </div>
                    <div>
                      <div className="absolute -left-[5px] mt-1 w-2 h-2 rounded-full bg-amber-500"></div>
                      <p className="font-semibold text-amber-800 font-bold">In Progress</p>
                      <p className="text-[10px] text-slate-500">Router firmware update deployed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
              Simple 3-Step Process
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How CampusVoice Works
            </p>
            <p className="text-sm text-slate-500 mt-2">
              From submission to resolution, every step is logged and trackable in the open.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left relative hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Submit Your Complaint</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose the relevant campus category, pin the physical location, add details, and
                optionally upload photo or document evidence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left relative hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Transparent Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Watch status updates live as the Principal's office assigns the responsible
                department, dispatches technicians, and logs timeline notes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left relative hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Guaranteed Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive instant notifications when resolved. If the problem is not fixed to your
                satisfaction, simply tap "Reopen Complaint" with 1-click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why CampusVoice Section */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
              Why CampusVoice?
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built for Student Empowerment & Administrative Efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <PlusCircle size={18} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Easy Complaint Submission</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Streamlined form with smart category auto-routing and instant ticket generation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Clock size={18} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Transparent Tracking</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full chronological audit trail with department assignment and technician details.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Zap size={18} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Faster Resolution</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatic escalation alerts for urgent water, electrical, or security hazards.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Lock size={18} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Secure & Private</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Row-Level security ensures other students cannot view your personal complaints.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Building size={18} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Direct Administration Link</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct oversight by the Principal & Department Heads with official responses.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <ShieldCheck size={18} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Reopen Guarantee</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Students hold the ultimate validation: reopen any issue that isn't truly resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint Categories Section */}
      <section id="categories" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
              Campus Coverage
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Complaint Categories
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Every area of campus life has dedicated departmental accountability.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesList.map((cat) => (
              <div
                key={cat.name}
                onClick={onOpenSubmit}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-white group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <CategoryIcon iconName={cat.icon} size={18} />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
              Questions & Answers
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs text-left"
              >
                <h4 className="text-sm font-bold text-slate-900 flex items-start gap-2.5 mb-2">
                  <HelpCircle size={17} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <MessageSquareText size={18} />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  CampusVoice
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                CampusVoice: Your Voice. Our Responsibility. The centralized, secure grievance
                management system powering student feedback and prompt administrative resolutions.
              </p>
              <p className="text-[11px] text-slate-500">
                Official College IT & Principal Grievance Cell
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Quick Links
              </h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={onOpenSubmit} className="hover:text-white transition-colors">
                    Submit Complaint
                  </button>
                </li>
                <li>
                  <button onClick={onOpenTrack} className="hover:text-white transition-colors">
                    Track by Ticket Number
                  </button>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Resolution Workflow
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Emergency Contact
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>Campus Security Desk: ext. 101</li>
                <li>Medical First-Aid: ext. 108</li>
                <li>grievance@campusvoice.edu</li>
                <li className="text-[11px] text-slate-500 pt-2">
                  Operating Hours: 24/7 Portal Support
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} CampusVoice. All rights reserved.</p>
            <p className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Secure PostgreSQL Cloud Instance Asia-Southeast1
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
