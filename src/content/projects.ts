import { z } from 'zod';
import { projectSchema, validate, type Project } from './schema';

/**
 * Client names are withheld. What is published is the domain, the scale, the
 * architecture and the number — which is the part that tells a reader whether
 * we have built their shape of system before.
 *
 * Mines is the exception: it is our own product, so it keeps its name and is
 * the one thing on this site a stranger can go and use.
 */
export const projects: Project[] = validate(
  z.array(projectSchema).min(4),
  [
    {
      slug: 'fund-administration',
      domain: 'Investment fund administration',
      title: 'End-to-end fundraise platform',
      metric: { value: '$4M+ / mo', caption: 'transaction volume, across tens of thousands of investors' },
      summary:
        'Accreditation, document signing, ACH funding and portfolio reporting in one multi-tenant system, replacing a stack of point SaaS tools.',
      context:
        'Operators run end-to-end fundraises — project setup, investor onboarding, e-signature, ACH funding and portfolio reporting — on one multi-tenant platform that replaces a stack of point SaaS tools. Investors complete accreditation, sign, link a bank account, and fund a commitment without ever leaving the portal.',
      shipped: [
        'ACH payment orchestration over Plaid and Dwolla, with webhook-driven reconciliation.',
        'Batch e-signature envelopes with signature tracking and automated reminders.',
        'Investor accreditation with expiry handling and a reminder cadence.',
        'Multi-tenant organisations with parent/child hierarchy, custom domains and SSL.',
        'Mandatory MFA on every account, and full-text search across investments and investors.',
      ],
      stack: ['React', 'Node.js', 'AWS Serverless', 'Plaid', 'Dwolla', 'DocuSign', 'Cognito', 'OpenSearch'],
      named: false,
    },
    {
      slug: 'workforce-scheduling',
      domain: 'Healthcare workforce scheduling',
      title: 'Native iOS & Android shift platform',
      metric: { value: 'iOS + Android', caption: 'native apps over a real-time GraphQL gateway' },
      summary:
        'Built for a national US staffing operator. Facility managers build and balance schedules; nurses pick up open shifts and swap from native apps.',
      context:
        'Built for a national US staffing operator. Facility managers build and balance schedules from the web; nurses pick up open shifts and swap them from native iOS and Android apps, with changes propagating live through a real-time GraphQL gateway.',
      shipped: [
        'Schedule construction and balancing tools for facility managers.',
        'Open-shift pickup and shift swapping from native mobile, with live state.',
        'A real-time GraphQL gateway fronting the scheduling services.',
        'Two native codebases — Swift and Kotlin — maintained in production, not a wrapper.',
      ],
      stack: ['GraphQL', 'React', 'Swift', 'Kotlin', 'MongoDB', 'Redis'],
      named: false,
    },
    {
      slug: 'provider-scheduling',
      domain: 'Float-pool provider scheduling',
      title: 'Event-driven shift cascade',
      metric: { value: 'Kafka · Kubernetes', caption: 'delivered as an npm-published UI library' },
      summary:
        'Shift offers cascade through configurable provider pools, delivered as an embeddable UI consumed by host applications.',
      context:
        'For a national healthcare staffing business. Shift offers cascade through configurable provider pools on an event-driven backbone, and the interface ships as an embeddable component library that host applications consume directly rather than a standalone app.',
      shipped: [
        'Configurable provider pools with rule-driven offer cascade.',
        'An event-driven core on Kafka, deployed to Kubernetes.',
        'An embeddable UI library, versioned and published to npm for host applications.',
        'Typed contracts between the services and every consuming front end.',
      ],
      stack: ['TypeScript', 'Next.js', 'Fastify', 'Kafka', 'PostgreSQL', 'Kubernetes'],
      named: false,
    },
    {
      slug: 'claims-management',
      domain: 'Insurance claims management',
      title: 'Bilingual multi-location claims portal',
      metric: { value: '$1M / yr', caption: 'saved after deployment' },
      summary:
        'Replaced fragile spreadsheet workflows across every location with RBAC, audit logs, and EN/ES PDF reports for carrier submission.',
      context:
        'A multi-location staffing agency ran employee insurance claims out of fragile Excel spreadsheets — manual, inconsistent, and opaque to leadership. We replaced it with a single portal that standardises intake across every location and gives the executive team live visibility into where each claim stands.',
      shipped: [
        'Multi-role RBAC across owners, managers and supervisors, with per-location permissions.',
        'List and board views, filterable across locations by status, assignee, tag and period.',
        'An append-only activity log on every claim, for audit and compliance review.',
        'Bilingual EN/ES PDF reports — Accident, Injury, Modified Duty — for carrier submission, both languages from one template.',
        'Scheduled email reminders driven by due dates, statuses and custom rules.',
        'Per-company configurable statuses, tags, document types and categories.',
      ],
      stack: ['React', 'Node.js', 'AWS Lambda', 'DynamoDB', 'Cognito', 'S3', 'i18next'],
      outcome:
        'One portal replaced a spreadsheet-and-email workflow across every location — and gave the CEO a live view of where each claim stands.',
      named: false,
    },
    {
      slug: 'mines',
      domain: 'Consumer mobile — iOS & visionOS',
      title: 'Mines — Classic Bomb Puzzle',
      metric: { value: '4.6 ★', caption: 'App Store rating' },
      summary:
        'A clean, ad-free Minesweeper for iPhone, iPad and Apple Vision — and the one thing here you can go and use yourself.',
      context:
        'Enterprise platforms are our core, but we sweat consumer polish too. Mines is a clean, ad-free Minesweeper for iPhone, iPad and Apple Vision, with global rankings, best-time tracking, win streaks and six languages. Everything else on this page is behind a client NDA; this is ours, it is public, and it is the same team.',
      shipped: [
        'Global rankings, best-time tracking and win streaks.',
        'Six languages, and a native visionOS build alongside iPhone and iPad.',
        'No advertising and no tracking, which is why the rating holds.',
      ],
      stack: ['Swift', 'iOS', 'visionOS'],
      named: true,
      externalUrl: 'https://apps.apple.com/us/app/mines-classic-bomb-puzzle/id1541036838',
    },
  ],
  'content/projects.ts',
);

export const clientProjects = projects.filter((project) => !project.named);
export const ownProducts = projects.filter((project) => project.named);

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
