/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Network, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Server, 
  Globe, 
  Cpu, 
  ChevronRight,
  Terminal,
  Activity,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type OS = 'Linux' | 'Windows';
type Priority = 'High' | 'Medium' | 'Low';

interface HardeningStep {
  id: string;
  os: OS;
  step: string;
  purpose: string;
  priority: Priority;
}

interface ControlReview {
  id: string;
  type: 'Firewall' | 'Permission' | 'Service';
  config: string;
  isMisconfigured: boolean;
  risk: string;
  alternative: string;
}

interface Proposal {
  id: string;
  title: string;
  riskAddressed: string;
  benefit: string;
}

// --- Data ---

const HARDENING_STEPS: HardeningStep[] = [
  { id: '1', os: 'Linux', step: 'Disable Root SSH Login', purpose: 'Prevents brute-force attacks directly on the root account.', priority: 'High' },
  { id: '2', os: 'Linux', step: 'Enable UFW/Iptables', purpose: 'Restricts incoming and outgoing traffic to only necessary ports.', priority: 'High' },
  { id: '3', os: 'Linux', step: 'Configure Automatic Updates', purpose: 'Ensures security patches are applied promptly without manual intervention.', priority: 'Medium' },
  { id: '4', os: 'Linux', step: 'Enforce Strong Password Policy', purpose: 'Mitigates dictionary and brute-force password attacks.', priority: 'High' },
  { id: '5', os: 'Linux', step: 'Disable Unused Services', purpose: 'Reduces the attack surface by closing unnecessary listening ports.', priority: 'Medium' },
  { id: '6', os: 'Windows', step: 'Enable Windows Defender/Firewall', purpose: 'Provides baseline protection against malware and unauthorized access.', priority: 'High' },
  { id: '7', os: 'Windows', step: 'Disable Guest Account', purpose: 'Prevents anonymous access to the system.', priority: 'High' },
  { id: '8', os: 'Windows', step: 'Enable BitLocker Encryption', purpose: 'Protects data at rest in case of physical theft.', priority: 'Medium' },
  { id: '9', os: 'Windows', step: 'Configure Account Lockout Policy', purpose: 'Thwarts brute-force attempts by locking accounts after failed tries.', priority: 'Medium' },
  { id: '10', os: 'Windows', step: 'Disable AutoRun/AutoPlay', purpose: 'Prevents malware from spreading via USB drives automatically.', priority: 'Low' },
  { id: '11', os: 'Linux', step: 'Implement Fail2Ban', purpose: 'Automatically bans IP addresses that show malicious signs.', priority: 'Medium' },
  { id: '12', os: 'Windows', step: 'Rename Administrator Account', purpose: 'Makes it harder for attackers to guess the primary admin username.', priority: 'Low' },
];

const CONTROL_REVIEWS: ControlReview[] = [
  {
    id: 'c1',
    type: 'Firewall',
    config: 'ALLOW ALL FROM ANY TO ANY PORT 22',
    isMisconfigured: true,
    risk: 'Exposes SSH to the entire internet, inviting brute-force and zero-day exploits.',
    alternative: 'ALLOW SSH FROM [OFFICE_IP_RANGE] ONLY.'
  },
  {
    id: 'c2',
    type: 'Permission',
    config: 'chmod 777 /etc/shadow',
    isMisconfigured: true,
    risk: 'Allows any user on the system to read and write password hashes.',
    alternative: 'chmod 600 /etc/shadow (Root only access).'
  },
  {
    id: 'c3',
    type: 'Service',
    config: 'Running Telnet on Port 23',
    isMisconfigured: true,
    risk: 'Telnet transmits data in plain text, including credentials.',
    alternative: 'Use SSH (Port 22) for encrypted remote management.'
  },
  {
    id: 'c4',
    type: 'Firewall',
    config: 'ALLOW HTTP/HTTPS FROM ANY',
    isMisconfigured: false,
    risk: 'Standard web traffic configuration.',
    alternative: 'Keep as is, but ensure WAF is in front.'
  },
  {
    id: 'c5',
    type: 'Permission',
    config: 'Domain Users added to Local Administrators group',
    isMisconfigured: true,
    risk: 'Every employee has full control over their workstation, increasing malware spread risk.',
    alternative: 'Use Standard User accounts; use LAPS for admin tasks.'
  }
];

const PROPOSALS: Proposal[] = [
  {
    id: 'p1',
    title: 'Multi-Factor Authentication (MFA) Rollout',
    riskAddressed: 'Compromised credentials due to phishing or credential stuffing.',
    benefit: 'Adds a critical layer of security that stops 99% of bulk password attacks.'
  },
  {
    id: 'p2',
    title: 'Endpoint Detection and Response (EDR)',
    riskAddressed: 'Advanced persistent threats (APTs) and fileless malware.',
    benefit: 'Provides deep visibility and automated response to suspicious host behavior.'
  },
  {
    id: 'p3',
    title: 'Regular Vulnerability Scanning',
    riskAddressed: 'Unpatched software and known vulnerabilities in the network.',
    benefit: 'Proactively identifies weaknesses before attackers can exploit them.'
  }
];

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
    )}
  >
    <Icon size={18} className={cn(active ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300")} />
    <span className="font-medium text-sm">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
      />
    )}
  </button>
);

const ModuleHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-2">{title}</h1>
    <p className="text-zinc-400 text-sm max-w-2xl">{subtitle}</p>
  </div>
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", className)}>
    {children}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ModuleHeader 
              title="Project Overview" 
              subtitle="Security Engineer Toolkit for Small Organizations (OJT1 Internship Project)" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                  <Info size={18} /> Objective
                </h3>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  This project serves as a comprehensive toolkit designed to demonstrate the core responsibilities of a Security Engineer Intern. It focuses on practical security implementations for small organizations where resources are limited but security is paramount.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                  <Zap size={18} /> Use Case
                </h3>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  A small startup with 20 employees needs to establish a security baseline. As an intern, you are tasked with reviewing their current controls, hardening their systems, and proposing a scalable, secure network architecture.
                </p>
              </Card>
              <Card className="p-6 md:col-span-2">
                <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                  <Terminal size={18} /> Implementation Steps
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    "Phase 1: Asset Discovery & Control Audit",
                    "Phase 2: System Hardening & Patching",
                    "Phase 3: Network Perimeter Defense Setup",
                    "Phase 4: Monitoring & Incident Response Prep",
                    "Phase 5: Policy Documentation & Training",
                    "Phase 6: Final Security Assessment"
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                      <span className="text-emerald-500 font-mono text-xs font-bold">0{i+1}</span>
                      <span className="text-zinc-300 text-xs font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ModuleHeader 
              title="Security Control Review" 
              subtitle="Analyzing existing configurations to identify vulnerabilities and misconfigurations." 
            />
            <div className="space-y-4">
              {CONTROL_REVIEWS.map((review) => (
                <Card key={review.id} className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className={cn(
                      "sm:w-48 p-4 flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-zinc-800",
                      review.isMisconfigured ? "bg-red-500/5" : "bg-emerald-500/5"
                    )}>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">{review.type}</span>
                      {review.isMisconfigured ? (
                        <AlertTriangle className="text-red-400 mb-2" size={24} />
                      ) : (
                        <CheckCircle2 className="text-emerald-400 mb-2" size={24} />
                      )}
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        review.isMisconfigured ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {review.isMisconfigured ? "VULNERABLE" : "SECURE"}
                      </span>
                    </div>
                    <div className="flex-1 p-5">
                      <div className="mb-4">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Configuration</label>
                        <code className="block bg-black/40 p-3 rounded border border-zinc-800 text-emerald-300 text-xs font-mono">
                          {review.config}
                        </code>
                      </div>
                      {review.isMisconfigured && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase text-red-400 font-bold mb-1 block">Risk</label>
                            <p className="text-zinc-400 text-xs leading-relaxed">{review.risk}</p>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-emerald-400 font-bold mb-1 block">Secure Alternative</label>
                            <p className="text-zinc-300 text-xs leading-relaxed font-medium">{review.alternative}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case 'hardening':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ModuleHeader 
              title="System Hardening Checklist" 
              subtitle="Step-by-step guide to securing operating systems and reducing attack surface." 
            />
            <Card>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/30">
                    <th className="p-4 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">OS</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Hardening Step</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider text-zinc-500 font-bold hidden md:table-cell">Purpose</th>
                    <th className="p-4 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {HARDENING_STEPS.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {item.os === 'Linux' ? <Cpu size={14} className="text-orange-400" /> : <Globe size={14} className="text-blue-400" />}
                          <span className="text-xs font-medium text-zinc-300">{item.os}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-zinc-100 font-medium">{item.step}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-xs text-zinc-400 leading-relaxed">{item.purpose}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          item.priority === 'High' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          item.priority === 'Medium' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                          "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </motion.div>
        );

      case 'network':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ModuleHeader 
              title="Secure Network Architecture" 
              subtitle="Designing a resilient network topology for a small organization." 
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="p-8 bg-zinc-950 relative overflow-hidden">
                  {/* Network Diagram Visualization */}
                  <div className="relative z-10 flex flex-col items-center gap-12 py-8">
                    {/* Internet */}
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500">
                        <Globe size={32} />
                      </div>
                      <span className="mt-2 text-[10px] font-bold text-zinc-500 uppercase">Internet</span>
                    </div>

                    <div className="w-0.5 h-12 bg-gradient-to-b from-zinc-700 to-red-500"></div>

                    {/* Firewall + IDS/IPS */}
                    <div className="flex flex-col items-center relative">
                      <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-red-500/10 border border-red-500/30 p-2 rounded text-[10px] text-red-400 font-bold">
                        <Activity size={14} /> IDS/IPS SENSOR
                      </div>
                      <div className="w-48 h-16 bg-red-900/20 border-2 border-red-500/50 rounded-lg flex items-center justify-center gap-3">
                        <Shield className="text-red-400" size={24} />
                        <span className="text-red-100 font-bold text-sm">MAIN FIREWALL</span>
                      </div>
                    </div>

                    <div className="flex gap-24 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-zinc-700"></div>
                      
                      {/* DMZ */}
                      <div className="flex flex-col items-center mt-12">
                        <div className="w-40 h-24 bg-orange-900/10 border-2 border-orange-500/30 rounded-lg flex flex-col items-center justify-center p-3">
                          <Server className="text-orange-400 mb-2" size={20} />
                          <span className="text-orange-100 font-bold text-xs">DMZ</span>
                          <span className="text-[9px] text-orange-400/70 mt-1">Web, Mail, DNS</span>
                        </div>
                      </div>

                      {/* Internal */}
                      <div className="flex flex-col items-center mt-12">
                        <div className="w-40 h-24 bg-emerald-900/10 border-2 border-emerald-500/30 rounded-lg flex flex-col items-center justify-center p-3">
                          <Network className="text-emerald-400 mb-2" size={20} />
                          <span className="text-emerald-100 font-bold text-xs">INTERNAL LAN</span>
                          <span className="text-[9px] text-emerald-400/70 mt-1">Workstations, DB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Grid */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" 
                       style={{ backgroundImage: 'radial-gradient(#34d399 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-5">
                  <h4 className="text-zinc-100 font-bold text-sm mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-emerald-400" /> Security Benefits
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "Isolation of public services in the DMZ prevents direct internal network access.",
                      "IDS/IPS placement at the perimeter detects threats before they enter.",
                      "Strict firewall rules enforce the Principle of Least Privilege.",
                      "Segmentation limits the 'blast radius' of a potential compromise."
                    ].map((benefit, i) => (
                      <li key={i} className="flex gap-3 text-xs text-zinc-400">
                        <ChevronRight size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
                  <h4 className="text-emerald-400 font-bold text-sm mb-2">Pro Tip</h4>
                  <p className="text-zinc-300 text-xs leading-relaxed">
                    Always place your database in the most restricted internal segment. Never allow direct internet access to database ports (e.g., 3306, 5432).
                  </p>
                </Card>
              </div>
            </div>
          </motion.div>
        );

      case 'proposals':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ModuleHeader 
              title="Security Improvement Proposals" 
              subtitle="Strategic recommendations to enhance the organization's long-term security posture." 
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROPOSALS.map((p) => (
                <Card key={p.id} className="p-6 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                    <Zap size={20} />
                  </div>
                  <h3 className="text-zinc-100 font-bold mb-4">{p.title}</h3>
                  <div className="space-y-4 mt-auto">
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">Risk Addressed</span>
                      <p className="text-zinc-400 text-xs leading-relaxed">{p.riskAddressed}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Expected Benefit</span>
                      <p className="text-zinc-300 text-xs leading-relaxed font-medium">{p.benefit}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case 'conclusion':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ModuleHeader 
              title="Conclusion & Recommendations" 
              subtitle="Final thoughts and the path forward for the organization's security journey." 
            />
            <div className="max-w-3xl space-y-8">
              <section>
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Summary of Findings</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  The security audit revealed several critical misconfigurations, most notably the exposure of administrative services to the public internet and overly permissive file permissions on sensitive system files. However, by implementing the hardening steps and network architecture proposed in this toolkit, the organization can significantly reduce its risk profile.
                </p>
              </section>
              
              <section>
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Final Recommendations</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900 border-l-4 border-emerald-500 rounded-r-lg">
                    <h4 className="text-emerald-400 font-bold text-sm mb-1">Continuous Monitoring</h4>
                    <p className="text-zinc-400 text-xs">Security is not a one-time event. Implement logging and alerting to stay aware of new threats.</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border-l-4 border-emerald-500 rounded-r-lg">
                    <h4 className="text-emerald-400 font-bold text-sm mb-1">User Education</h4>
                    <p className="text-zinc-400 text-xs">The human element is often the weakest link. Conduct regular security awareness training.</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border-l-4 border-emerald-500 rounded-r-lg">
                    <h4 className="text-emerald-400 font-bold text-sm mb-1">Incident Response Plan</h4>
                    <p className="text-zinc-400 text-xs">Prepare for the inevitable. Have a clear plan for when a security incident occurs.</p>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Internship Report</p>
                  <p className="text-zinc-300 text-xs">Computer Science & Engineering (OJT1)</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Prepared By</p>
                  <p className="text-zinc-300 text-xs">Security Engineer Intern</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Shield className="text-zinc-950" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100 tracking-tight">SEC-ENG TOOLKIT</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Small Org Edition v1.0</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">System Secure</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 h-[calc(100vh-64px)] p-4 sticky top-16 hidden lg:block">
          <div className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Overview" 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
            />
            <SidebarItem 
              icon={FileText} 
              label="Control Review" 
              active={activeTab === 'review'} 
              onClick={() => setActiveTab('review')} 
            />
            <SidebarItem 
              icon={Lock} 
              label="Hardening Checklist" 
              active={activeTab === 'hardening'} 
              onClick={() => setActiveTab('hardening')} 
            />
            <SidebarItem 
              icon={Network} 
              label="Network Architecture" 
              active={activeTab === 'network'} 
              onClick={() => setActiveTab('network')} 
            />
            <SidebarItem 
              icon={Zap} 
              label="Security Proposals" 
              active={activeTab === 'proposals'} 
              onClick={() => setActiveTab('proposals')} 
            />
            <SidebarItem 
              icon={CheckCircle2} 
              label="Conclusion" 
              active={activeTab === 'conclusion'} 
              onClick={() => setActiveTab('conclusion')} 
            />
          </div>

          <div className="mt-auto pt-8">
            <Card className="p-4 bg-zinc-900/30">
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Security Status</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Compliance</span>
                  <span className="text-xs font-bold text-emerald-400">84%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[84%]" />
                </div>
              </div>
            </Card>
          </div>
        </aside>

        {/* Mobile Navigation (Bottom) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-800 z-50 flex items-center justify-around px-2">
          <button onClick={() => setActiveTab('overview')} className={cn("p-2", activeTab === 'overview' ? "text-emerald-400" : "text-zinc-500")}>
            <LayoutDashboard size={20} />
          </button>
          <button onClick={() => setActiveTab('review')} className={cn("p-2", activeTab === 'review' ? "text-emerald-400" : "text-zinc-500")}>
            <FileText size={20} />
          </button>
          <button onClick={() => setActiveTab('hardening')} className={cn("p-2", activeTab === 'hardening' ? "text-emerald-400" : "text-zinc-500")}>
            <Lock size={20} />
          </button>
          <button onClick={() => setActiveTab('network')} className={cn("p-2", activeTab === 'network' ? "text-emerald-400" : "text-zinc-500")}>
            <Network size={20} />
          </button>
          <button onClick={() => setActiveTab('conclusion')} className={cn("p-2", activeTab === 'conclusion' ? "text-emerald-400" : "text-zinc-500")}>
            <CheckCircle2 size={20} />
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 pb-24 lg:pb-10">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
