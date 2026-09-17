export type SolutionIconName =
  | 'bot'
  | 'users'
  | 'graduation-cap'
  | 'video'
  | 'credit-card'
  | 'layout-dashboard'
  | 'gamepad-2'
  | 'palette'
  | 'git-compare-arrows'
  | 'activity'
  | 'clipboard-list'
  | 'calendar-clock'
  | 'bell-ring'
  | 'shield-check'
  | 'messages-square'
  | 'mail'
  | 'smartphone'
  | 'tags'
  | 'megaphone'
  | 'file-badge'
  | 'settings-2'
  | 'user-check'
  | 'globe';

export type SolutionSectionId =
  | 'platform'
  | 'mentoring'
  | 'community'
  | 'operations'
  | 'enterprise';

export interface SolutionCapability {
  title: string;
  detail: string;
}

export interface SolutionItem {
  id: string;
  icon: SolutionIconName;
  title: string;
  pitch: string;
  /** Simple bullet list for standard cards */
  highlights?: string[];
  /** Compact capability tiles (used for dense features like AI Agent) */
  capabilities?: SolutionCapability[];
  featured?: boolean;
  homepage?: boolean;
  section: SolutionSectionId;
}

export const SOLUTION_SECTIONS: Array<{
  id: SolutionSectionId;
  title: string;
  description: string;
}> = [
  {
    id: 'platform',
    title: 'Platform capabilities',
    description:
      'Everything you need to run mentoring, community, and learning programs in one branded space.',
  },
  {
    id: 'mentoring',
    title: 'Mentoring programs',
    description:
      'From application to matching, sessions, health scoring, and certificates. Built for serious program operations.',
  },
  {
    id: 'community',
    title: 'Community & engagement',
    description:
      'Private social tools that keep members active without ads, noise, or third-party chat sprawl.',
  },
  {
    id: 'operations',
    title: 'Operations & admin',
    description:
      'A full control panel for members, campaigns, moderation, support, and auditability.',
  },
  {
    id: 'enterprise',
    title: 'Enterprise readiness',
    description:
      'White-label delivery, SSO, privacy controls, and the integrations teams already rely on.',
  },
];

/**
 * Product solution cards for homepage + /solutions.
 * Written for Plademy; do not reference third-party product brands in copy.
 */
export const SOLUTIONS: SolutionItem[] = [
  {
    id: 'ai-agent',
    icon: 'bot',
    title: 'AI Agent',
    pitch:
      'Not a chatbot. An operational agent that co-runs your community and mentoring programs with your admin.',
    featured: true,
    homepage: true,
    section: 'platform',
    capabilities: [
      {
        title: 'Proposal-first actions',
        detail: 'Write operations start as suggestions until an admin approves. Low-risk work can run on its own.',
      },
      {
        title: 'Daily & weekly briefings',
        detail: 'Engagement, pending approvals, risks, and recommended next steps in one digest.',
      },
      {
        title: 'Content drafting',
        detail: 'Posts, surveys, and announcements that keep the agenda moving.',
      },
      {
        title: 'Quiet-member recovery',
        detail: 'Personalized re-engagement ideas and campaign drafts for inactive members.',
      },
      {
        title: 'New-member orientation',
        detail: 'Routes people into the right channels, topics, and first interactions.',
      },
      {
        title: 'Moderation assist',
        detail: 'Prioritizes report queues and recommends warn, hide, or block.',
      },
      {
        title: 'Mentoring support',
        detail: 'Application screening, match suggestions, stalled-pair alerts, session reminders, health reports.',
      },
      {
        title: 'Campaign assist',
        detail: 'Email and push copy, audience targeting, and send timing.',
      },
      {
        title: 'Scheduled jobs',
        detail: 'One-off or recurring tasks, such as a Monday program health report.',
      },
      {
        title: 'Analytics & insight',
        detail: 'Trends, low-engagement areas, and member segments.',
      },
      {
        title: 'Policy-aware',
        detail: 'Respects opt-outs. Destructive actions like bans stay as suggestions only.',
      },
    ],
  },
  {
    id: 'private-social',
    icon: 'users',
    title: 'Private social network',
    pitch: 'A branded, invite-only, ad-free member space for posts, discussions, and belonging.',
    homepage: true,
    section: 'platform',
    highlights: [
      'Closed social feed with posts, comments, reactions, and polls. Invite-gated entry.',
      'Topics and tags for discovery by interest',
      'Rich member profiles with roles, skills, and custom questions',
      'Pages for companies, teams, and projects',
      'Long-form open letters for thoughtful community storytelling',
      'Invite system with controlled growth and delivery tracking',
      'Guided onboarding tour for new members',
      'Targeted banners for announcements and campaigns',
      'Timely notifications for replies, events, and mentions',
    ],
  },
  {
    id: 'mentoring-programs',
    icon: 'graduation-cap',
    title: 'Academy-grade mentoring',
    pitch: 'End-to-end mentoring from application to report, with AI support where it helps most.',
    homepage: true,
    section: 'platform',
    highlights: [
      'Program models: 1:1, group, grouped-individual, mentor pools / office hours, and self-selection',
      'Flexible naming for mentor and mentee roles (coach, advisor, alumni, and more)',
      'Freestyle feedback or structured Session 1…N curricula',
      'Application intake, matching, sessions, tasks, notes, and reporting in one flow',
      'Pair home, mentor directories, group directories, and clear next-meeting views',
    ],
  },
  {
    id: 'events-video-rooms',
    icon: 'video',
    title: 'Events, video & rooms',
    pitch: 'Replace fragmented Zoom, Slack, and Calendly stacks with one coordinated experience.',
    homepage: true,
    section: 'platform',
    highlights: [
      'Text rooms with pin-able channels',
      'Audio rooms for AMAs, coffee chats, and live conversation',
      'Built-in video meetings without forcing an external conference tool',
      'Meet scheduling with availability and one-to-one intros or mentor sessions',
      'Realtime chat alongside events and programs',
      'One-off and recurring events with registration, capacity, and reminders',
      'Ticketed events with Stripe when you need paid attendance',
    ],
  },
  {
    id: 'membership-revenue',
    icon: 'credit-card',
    title: 'Membership & revenue',
    pitch: 'Free and paid tiers with plan-gated access. Payments go to your Stripe Connect account at 0% platform commission.',
    homepage: true,
    section: 'platform',
    highlights: [
      'Membership plans with permissioned content and features',
      'Stripe Connect payouts directly to the organization owner',
      'No platform take-rate on connected payments',
      'Plan-locked experiences for premium communities and programs',
    ],
  },
  {
    id: 'admin-console',
    icon: 'layout-dashboard',
    title: '19+ module admin console',
    pitch: 'One operations panel from members and campaigns to complaints, support, and audit logs.',
    homepage: true,
    section: 'platform',
    highlights: [
      'Dashboard with high-level stats and summaries',
      'Profiles, pages, invites, meetings, events, categories, and tour editor',
      'Rooms, games, mentoring programs, campaigns, and membership center',
      'Reports, support tickets, complaint review, and activity logs',
      'Settings for language, branding, and policy controls',
    ],
  },
  {
    id: 'games-meetups',
    icon: 'gamepad-2',
    title: 'Games & Meet',
    pitch: 'Icebreakers and one-to-one scheduling that turn members into real connections.',
    homepage: true,
    section: 'platform',
    highlights: [
      'Social games such as shared-mind challenges, checkers, and kanban races',
      'Meet flows for availability-based introductions and mentor sessions',
      'Lightweight engagement tools that reduce cold-start friction',
    ],
  },
  {
    id: 'white-label',
    icon: 'palette',
    title: 'White-label',
    pitch: 'Your domain, logo, colors, and branded email. The platform disappears into your brand.',
    homepage: true,
    section: 'platform',
    highlights: [
      'Custom domain and visual identity',
      'Brand-consistent member and admin experiences',
      'Branded transactional email',
      'Legal pages and policy surfaces under your brand',
    ],
  },
  {
    id: 'matching-engine',
    icon: 'git-compare-arrows',
    title: 'Matching engine',
    pitch: 'Rule-based matching with weights, hard filters, scored recommendations, and an auditable approval trail.',
    section: 'mentoring',
    highlights: [
      'Field-to-field rules: same, different, similar, and numeric comparisons',
      'Weights from 0.1–100 plus mandatory filters that eliminate failed candidates',
      'Custom rules that pin either side to fixed values',
      '0–100 scoring with scarcity-aware tie-breaks and multi-pass reassignment',
      'Side-by-side comparison modal with approve-all for operators',
      'Mentor windows for one mentor versus all mentees or groups',
      'Manual match, rematch, time limits, action audit notes, and feedback reminders',
    ],
  },
  {
    id: 'program-health',
    icon: 'activity',
    title: 'Program Health',
    pitch: 'Eleven health dimensions rolled into one score, plus plain-language interventions your team can act on.',
    section: 'mentoring',
    highlights: [
      'Dimensions spanning activation, login, coverage, kickoff, momentum, stalled pairs, forward motion, pipeline, supply, curriculum, and reliability',
      'A single score with readable next-step guidance',
      'Model-aware: dimensions that do not apply stay hidden',
    ],
  },
  {
    id: 'structured-curriculum',
    icon: 'clipboard-list',
    title: 'Structured programs & content',
    pitch: 'Sessions, goals, forms, shared notes, and task checklists in one content hub, including templates you can clone.',
    section: 'mentoring',
    highlights: [
      'Sessions and meeting goals with topics, date windows, role briefs, and attachments',
      'Pre- and post-meeting forms',
      'Shared meeting notes with private admin visibility where needed',
      'Task checklists with role targets, due dates, publishing, and progress states',
      'Announcements, forms, and agreements in a single hub',
      'Create from template with clone, export, and import',
    ],
  },
  {
    id: 'scheduling-meetings',
    icon: 'calendar-clock',
    title: 'Scheduling & meetings',
    pitch: 'Availability, calendars, video providers, sync, and admin-assisted booking without spreadsheet chaos.',
    section: 'mentoring',
    highlights: [
      'One-off and weekly recurring availability with blocked slots',
      'Program calendar views for admins across day, week, and month',
      'Automatic meeting links for major providers plus built-in video options',
      'Two-way Google and Outlook sync with conflict awareness',
      'Weekly limits, minimum notice, and cancel/update rules',
      'Admins can create or restore meetings on behalf of members',
    ],
  },
  {
    id: 'registration-identity',
    icon: 'user-check',
    title: 'Registration & identity',
    pitch: 'Bulk import, public applications, tracked invites, agreements, and custom profile fields for matching.',
    section: 'mentoring',
    highlights: [
      'Excel/CSV bulk import with column mapping and preview',
      'Public mentor/mentee application forms with auto-accept or manual review',
      'Invite delivery tracking across sent, delivered, and opened',
      'Program agreements with roles, versions, and acceptance gates',
      'Custom profile fields used in matching and directories',
      'Renameable role terminology across the program',
    ],
  },
  {
    id: 'engagement-ops',
    icon: 'bell-ring',
    title: 'Engagement operations',
    pitch: 'Super reminders, announcements, push, email preferences, and activity streams that keep programs moving.',
    section: 'operations',
    highlights: [
      'Reminders for login, overdue sessions, empty forms, and matching feedback',
      'Announcements with comment moderation',
      'Web push plus email preference and unsubscribe controls',
      'Activity stream visibility for operators and members',
    ],
  },
  {
    id: 'oversight',
    icon: 'settings-2',
    title: 'Oversight & coordination',
    pitch: 'Setup checklists, coordination centers, member dossiers, and field-level admin action logs.',
    section: 'operations',
    highlights: [
      'Guide and dashboard with setup checklist plus health overview',
      'Coordination center with coordinator assignment',
      'Member profiles covering meetings, matches, tags/rules, and availability',
      'Admin action log with before/after field history',
      'Guided demos for admin and member walkthroughs',
    ],
  },
  {
    id: 'support-desk',
    icon: 'messages-square',
    title: 'Support desk',
    pitch: 'Role-based guidebooks and a ticket Kanban so member issues stay visible and resolvable.',
    section: 'operations',
    highlights: [
      'Role-aware guidebooks',
      'Support ticket Kanban with masked program-context replies',
      'In-product feedback capture for continuous improvement',
    ],
  },
  {
    id: 'certificates-reports',
    icon: 'file-badge',
    title: 'Certificates & reports',
    pitch: 'Rule-based certificates with public verification, plus exportable operational reports.',
    section: 'operations',
    highlights: [
      'Certificate rules, branding, public verify links, and LinkedIn-ready sharing',
      'Meeting dashboards and lists, guest meeting/messaging views, metadata summaries',
      'Success rates, users without meetings, and match-pair meeting tables',
      'CSV, Excel, and PDF exports',
    ],
  },
  {
    id: 'messaging-notifications',
    icon: 'mail',
    title: 'Messaging & notifications',
    pitch: 'In-program messaging with attachments and localized transactional email across major languages.',
    section: 'community',
    highlights: [
      'Program messaging with file attachments',
      '35+ email types delivered in the recipient’s language',
      'Admin “What’s New” surfaces for product updates',
    ],
  },
  {
    id: 'topics-profiles',
    icon: 'tags',
    title: 'Topics, tags & profiles',
    pitch: 'Organize content and people so members find the right conversations and collaborators quickly.',
    section: 'community',
    highlights: [
      'Topic and tag taxonomy for discovery',
      'Categorized profiles with skills and custom fields',
      'Company, team, and project pages',
    ],
  },
  {
    id: 'campaigns',
    icon: 'megaphone',
    title: 'Campaigns',
    pitch: 'Targeted email and push campaigns with audience and timing controls.',
    section: 'operations',
    highlights: [
      'Audience targeting for members and segments',
      'Email and push delivery',
      'Scheduling aligned with program rhythms',
    ],
  },
  {
    id: 'enterprise-security',
    icon: 'shield-check',
    title: 'Enterprise security & integrations',
    pitch: 'SAML SSO, GDPR erasure, and the calendar/video integrations enterprises expect.',
    section: 'enterprise',
    highlights: [
      'SAML SSO with forced-SSO options for identity providers such as Azure AD and OneLogin',
      'GDPR erasure workflows',
      'Integrations for Zoom, Google, and Microsoft',
      'White-label legal and policy pages',
    ],
  },
  {
    id: 'mobile-pwa',
    icon: 'smartphone',
    title: 'Mobile-ready PWA',
    pitch: 'A mobile-first web experience members can use anywhere without a separate app install.',
    section: 'enterprise',
    highlights: [
      'Responsive member and admin surfaces',
      'Progressive web app patterns for modern browsers',
    ],
  },
  {
    id: 'bilingual',
    icon: 'globe',
    title: 'Multilingual interface',
    pitch: 'Ship programs to international audiences with a bilingual-ready product experience.',
    section: 'enterprise',
    highlights: [
      'Interface support for multiple languages',
      'Localized transactional messaging where configured',
    ],
  },
];

export function getHomepageSolutions(): SolutionItem[] {
  return SOLUTIONS.filter((item) => item.homepage);
}

export function getSolutionsBySection(section: SolutionSectionId): SolutionItem[] {
  return SOLUTIONS.filter((item) => item.section === section);
}
