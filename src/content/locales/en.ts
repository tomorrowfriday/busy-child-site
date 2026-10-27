import { contentSchema, validate, type Content } from '../schema';

const en: Content = validate(
  contentSchema,
  {
    locale: 'en',
    localeLabel: 'EN',
    localeName: 'English',

    site: {
      tagline: 'Custom software & automation',
      statement: 'We build the platforms your business runs on — and ship them ourselves.',
      description:
        'A senior engineering team that designs, builds, and maintains production web and mobile software for enterprises. Spec-driven, serverless-first, 100% test coverage. The partner who scopes your project is the one who ships it.',
      sectors: ['Fund administration', 'Healthcare', 'Insurance', 'Consumer mobile'],
    },

    nav: [
      { href: '/what-you-get', label: 'What you get' },
      { href: '/work', label: 'Work' },
      { href: '/working-with-us', label: 'Working with us' },
      { href: '/contact', label: 'Contact' },
    ],

    common: {
      sendBrief: 'Send a brief',
      seeWork: 'See the work',
      upwork: 'Upwork',
      upworkAlt: 'Or invite us on Upwork',
      skipToContent: 'Skip to content',
      switchLanguage: 'Мова',
      more: 'Read more',
      foldHint: 'Every line opens. Unfold the ones that matter to you.',
      liveBadge: 'live',
    },

    literals: [
      { value: '15+', caption: 'years building software businesses depend on' },
      { value: '$4M+', caption: 'moves through one system we built, every month' },
      { value: '100%', caption: 'of our code is tested — we do not ship it otherwise' },
      { value: 'Senior', caption: 'engineers only — nobody learns on your project' },
    ],

    gates: [
      { gate: 'composer validate', isCommand: true, catches: 'Broken spec — before any code exists' },
      { gate: 'Spec coverage', isCommand: false, catches: 'An operation no scenario exercises end to end' },
      { gate: 'tsc', isCommand: true, catches: 'Drift between operation I/O and document shape' },
      { gate: 'ESLint', isCommand: false, catches: 'Style, documentation, complexity' },
      { gate: 'Generated unit tests', isCommand: false, catches: 'Per-operation security, schema shape, before logic' },
      { gate: 'Generated scenario tests', isCommand: false, catches: 'End-to-end behaviour against a real database, multi-role, multi-tenant' },
      { gate: 'Coverage threshold', isCommand: false, catches: 'Any untested line, branch, or function — set at 100%' },
      { gate: 'Runtime output validation', isCommand: false, catches: "A response that doesn't match its declared schema — in production" },
    ],

    promises: [
      {
        refusal: 'No pitch-and-switch.',
        detail:
          'The senior partner who scopes your project is on it until it ships. You will not meet one team in the sales conversation and a different one on Monday.',
      },
      {
        refusal: 'No account managers.',
        detail:
          'You talk directly to the people building your software. Nothing gets relayed, summarised, or lost between you and the person writing the code.',
      },
      {
        refusal: 'No juniors learning on you.',
        detail:
          "We stay small on purpose. Senior people, or we don't take the work. Your project is not anybody's training exercise.",
      },
      {
        refusal: 'No surprise invoices.',
        detail:
          "We'd rather lose a margin than lose your trust. If something is going to cost more, you hear it before it's spent, not after.",
      },
      {
        refusal: 'No theater.',
        detail:
          'Short meetings, written decisions, working software. No status decks, no ceremony that exists to look like progress.',
      },
      {
        refusal: 'No vibecoding.',
        detail:
          'AI is a tool to ship faster — never a shortcut past review. Everything is verified by the same gates whether a person or a model wrote it.',
      },
    ],

    engagement: [
      {
        title: 'We write the spec with your team',
        detail:
          'One or two working sessions. Your domain expert talks, we write it down precisely, and the result is a document both sides can read.',
      },
      {
        title: 'You review the spec',
        detail:
          "This is the decision point, and it's a document rather than a pull request. Being wrong here costs an edit, not a rewrite.",
      },
      {
        title: 'We generate, implement and ship it',
        detail: 'Behind your existing gates, on your infrastructure, in your process.',
      },
      {
        title: 'Your engineers own it afterwards',
        detail:
          'The spec is the handover artefact. New people ramp on a readable document instead of reverse-engineering intent from handlers.',
      },
    ],

    scenarios: [
      {
        index: 4,
        label: 'Tenant isolation',
        title: 'Platform activity is not returned to another organization user',
        role: 'USER2',
        operation: 'IndexActivities',
        assertions: [{ kind: 'excludesItem', field: 'id', equals: 'activityId' }],
        proves: 'Tenant isolation — one organisation cannot read another’s records.',
      },
      {
        index: 7,
        label: 'Permission scope',
        title: 'A supervisor cannot approve a claim outside their location',
        role: 'SUPERVISOR',
        operation: 'ApproveClaim',
        mutation: { claimId: 'otherLocationClaimId' },
        assertions: [{ kind: 'rejectedWith', error: 'ForbiddenError' }],
        proves: 'Permission scope — role checks are enforced per location, not per account.',
      },
      {
        index: 12,
        label: 'Positive path',
        title: 'An investor sees their own commitment after funding',
        role: 'INVESTOR',
        operation: 'IndexCommitments',
        assertions: [
          { kind: 'includesItem', field: 'id', equals: 'commitmentId' },
          { kind: 'fieldEquals', path: '0.status', value: 'funded' },
        ],
        proves: 'Positive path — the record exists, and its state is what the spec promised.',
      },
    ],

    projects: [
      {
        slug: 'fund-administration',
        domain: 'Investment fund administration',
        title: 'End-to-end fundraise platform',
        sector: 'Fund administration',
        short: 'Fundraise platform',
        oneLiner: 'Investors onboard, sign and fund a commitment without leaving one portal.',
        metric: { value: '$4M+ / mo', caption: 'transaction volume, across tens of thousands of investors' },
        metricBig: '$4M+',
        metricShort: 'moves through it every month',
        facts: [
          { k: 'Volume', v: '$4M+ a month' },
          { k: 'Scale', v: 'Tens of thousands of investors' },
          { k: 'Type', v: 'Multi-tenant web platform' },
        ],
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
        sector: 'Healthcare',
        short: 'Shift scheduling app',
        oneLiner: 'Managers balance schedules on the web. Nurses pick up and swap shifts from their phones, live.',
        metric: { value: 'iOS + Android', caption: 'native apps over a real-time GraphQL gateway' },
        metricBig: 'iOS + Android',
        metricShort: 'two native apps, one live schedule',
        facts: [
          { k: 'Client', v: 'National US staffing operator' },
          { k: 'Users', v: 'Facility managers and nurses' },
          { k: 'Apps', v: 'Web, native iOS, native Android' },
        ],
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
        sector: 'Healthcare',
        short: 'Shift offer cascade',
        oneLiner: 'Open shifts are offered pool by pool, automatically, until someone takes them.',
        metric: { value: 'Kafka · Kubernetes', caption: 'delivered as an npm-published UI library' },
        metricBig: 'Kafka · Kubernetes',
        metricShort: 'ships as a library that drops into existing apps',
        facts: [
          { k: 'Client', v: 'National healthcare staffing business' },
          { k: 'Core', v: 'Event-driven, Kafka on Kubernetes' },
          { k: 'Ships as', v: 'UI library published to npm' },
        ],
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
        sector: 'Insurance',
        short: 'Claims portal',
        oneLiner: 'Employee insurance claims moved from spreadsheets to one bilingual portal.',
        metric: { value: '$1M / yr', caption: 'saved after deployment' },
        metricBig: '$1M / yr',
        metricShort: 'saved after deployment',
        facts: [
          { k: 'Saved', v: '$1M a year' },
          { k: 'Client', v: 'Multi-location staffing agency' },
          { k: 'Languages', v: 'English and Spanish' },
        ],
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
        sector: 'Consumer mobile',
        short: 'Mines',
        oneLiner: 'A clean, ad-free Minesweeper you can download and play today.',
        metric: { value: '4.6 ★', caption: 'App Store rating' },
        metricBig: '4.6 ★',
        metricShort: 'on the App Store',
        facts: [
          { k: 'Platforms', v: 'iPhone, iPad, Apple Vision' },
          { k: 'Languages', v: 'Six' },
          { k: 'Advertising', v: 'None, and no tracking' },
        ],
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
        externalLabel: 'Find Mines on the App Store',
      },
    ],

    home: {
      outcomes: {
        marker: 'what you get',
        title: 'Software that does the work your people are doing by hand.',
        lead: 'Most businesses we meet are running on spreadsheets, email threads and someone who remembers how it all fits together. That works until it does not. Here is what changes.',
        items: [
          {
            title: 'The repetitive work stops being work.',
            detail:
              'Re-typing the same details into three different places. Chasing the same signature every week. Sending the same reminder. The system does all of it, on time, without being asked.',
          },
          {
            title: 'You can see everything, right now.',
            detail:
              'One screen showing where every order, claim, client or job actually stands. No ringing round for an update, no waiting until Friday for a report that is already out of date.',
            proof: '$1M / yr',
            proofCaption: 'saved by one client after we replaced their spreadsheets',
          },
          {
            title: 'Money moves without anyone chasing it.',
            detail:
              'Invoices, payments, payouts and the paperwork around them run on their own, and reconcile themselves. You find out when something needs you — not when it has already gone wrong.',
            proof: '$4M+ / mo',
            proofCaption: 'moves through one platform we built',
          },
          {
            title: 'Mistakes stop being expensive.',
            detail:
              'Your rules are built into the system, so the wrong thing cannot quietly be filed, approved or paid. Every change is recorded, so when someone asks what happened, there is an answer.',
          },
          {
            title: 'It fits how you already work.',
            detail:
              'Not an off-the-shelf tool your team has to bend around. We build what your business actually does, and connect it to the things you already use — your bank, your accounting, your email, your documents.',
          },
          {
            title: 'It grows without needing more people.',
            detail:
              'Twice the volume should not mean twice the admin staff. The system takes the extra load, and your team stays on the work that needs a person.',
          },
        ],
        note: {
          tag: 'In plain terms',
          text: 'People often call this "a CRM" or "an internal system". What it really is: the part of your business that currently lives in people\'s heads and spreadsheets, turned into something that runs itself and tells you the truth.',
        },
        link: 'What this looks like in practice →',
      },

      specimen: {
        marker: 'how we know it works',
        title: 'The test assertions live in the specification.',
        lead: 'A scenario is written the way a product owner would state it — in a document a non-engineer can read and check. The compiler turns it into an executable test that runs against a real database on every change.',
        caption:
          'That editor is live. Change the role, rename the operation, edit an assertion — the test on the right is recompiled in your browser by the same pure function the pipeline uses. Take the last assertion away and nothing is generated at all, because a scenario that asserts nothing proves nothing.',
        link: 'How the whole pipeline works →',
      },

      work: {
        marker: 'selected work',
        title: 'Our products:',
        lead: 'Client names are withheld. What we can publish is the domain, the architecture, and the numbers.',
        link: 'Read the work in detail →',
      },

      gates: {
        marker: 'what stops it shipping broken',
        title: 'Every change runs the same stack of gates.',
        lead: 'These are build failures, not review comments. Run them, then pick a gate to break and watch the build stop there — everything after a failure is skipped, not reported at the end.',
        caption:
          'That last row is the unusual one. Output schemas are enforced at request time, not only in CI — a service that returns something it never promised fails loudly rather than shipping malformed data downstream.',
      },

      promises: {
        marker: 'how we work',
        title: 'Six promises that keep clients with us.',
        link: 'What an engagement looks like →',
      },

      contact: {
        marker: "let's build it",
        title: 'Tell us what you are building.',
        lead: 'Or just what is slowing you down. That is the only thing we need to start a useful conversation.',
      },

      anchors: [
        { href: '#work', label: 'Work' },
        { href: '#results', label: 'Results' },
        { href: '#proof', label: 'Proof' },
        { href: '#contact', label: 'Contact' },
      ],

      headline: 'We take care of the code.\nYou take care of the business.',


      results: {
        title: 'What changes for you',
        lead: 'The spreadsheets, email threads and "ask Maria, she knows" become one system that runs itself.',
        items: [
          {
            title: 'No more re-typing',
            detail: 'Reminders, signatures and data entry happen on their own.',
          },
          {
            title: 'Everything on one screen',
            detail: 'See where every order, claim or job stands, right now.',
          },
          {
            title: 'Money moves on its own',
            detail: 'Invoices, payments and payouts run without chasing.',
          },
          {
            title: 'Mistakes get blocked',
            detail: 'Your rules are built in, and every change is recorded.',
          },
          {
            title: 'Works with your tools',
            detail: 'Connected to your bank, accounting, email and documents.',
          },
          {
            title: 'Growth without hiring',
            detail: "Twice the volume doesn't mean twice the admin staff.",
          },
        ],
      },

      proof: {
        title: 'No mistakes',
        lead: 'We always take these four steps:',
        steps: [
          {
            title: 'Write it down',
            detail: 'What the software must do, in plain English you can read and check.',
            label: 'The requirement, and the test it becomes — edit either side',
          },
          {
            title: 'Turn it into tests',
            detail: 'Every requirement becomes an automatic test. Nobody writes them by hand.',
            label: 'Change the spec and watch the test recompile',
          },
          {
            title: 'Check every change',
            detail: '8 automatic checks run on every change. One failure stops everything.',
            label: 'The 8 checks, in order — run them, then break one',
          },
          {
            title: 'Ship it',
            detail: 'Only code that passes every check goes live — and it keeps being checked.',
            label: 'What "passed" means',
          },
        ],
        gatesNote:
          'These are build failures, not review comments. The first failure stops the build — nothing after it runs.',
        ship: [
          {
            value: '100%',
            detail: 'of the code is covered by tests. 99% fails the build.',
          },
          {
            value: 'Live',
            detail:
              'checks keep running after launch. A service that returns something it never promised fails loudly instead of passing bad data on.',
          },
        ],
      },

      working: {
        title: 'Our working principles:',
        items: [
          'The engineer who scoped it ships it',
          'You talk to engineers, not account managers',
          'Experienced engineers only — we do not learn on you',
          "Cost changes flagged before they're spent",
          'Short meetings, written decisions',
          'AI speeds us up, but every line is still reviewed',
        ],
      },

      closing: {
        title: "Tell us what's on your mind.",
        lead: "One paragraph is enough, and it reaches the people who would build it."
      },

      deck: {
        screens: [
          { label: 'Who we are', hint: '' },
          { label: 'Work', hint: '4 platforms' },
          { label: 'Fundraise platform', hint: '$4M+/mo' },
          { label: 'Shift scheduling', hint: 'iOS+Android' },
          { label: 'Shift offer cascade', hint: 'plug-in' },
          { label: 'Claims portal', hint: '$1M/yr' },
          { label: 'Results', hint: '' },
          { label: 'Quality', hint: '' },
          { label: 'Principles', hint: '' },
          { label: 'Start a project →', hint: '' },
        ],
        caseLabel: 'Case',
        next: 'Next screen',
        prev: 'Previous screen',
        openCase: 'Open the case +',
        seeExample: 'See a real example +',
        methodKicker: 'Steps 01 → 02',
        methodTitle: 'A requirement becomes a test',
        methodLead: 'A scenario is written the way a product owner would state it. The compiler turns it into an executable test that runs against a real database on every change.',
        specLabel: 'written by a person',
        testLabel: 'generated automatically — never edited',
        gatesKicker: 'Step 03 — the 8 checks, in order',
        stepFourKicker: 'Step 04 — after launch',
        menuLabel: 'Sections',
      },

      sheet: {
        of: 'of',
        prev: 'Previous project',
        next: 'Next project',
        close: 'Close',
        shipped: 'What we shipped',
        builtWith: 'Built with',
        outcome: 'Outcome',
        proves: 'Proves',
        cta: 'Want one like this? Send a brief',
      },


    },

    workPage: {
      metaTitle: 'Work',
      metaDescription:
        'Four production platforms in fund administration, healthcare scheduling and insurance claims — plus a consumer iOS product. Client names withheld; architecture and numbers published.',
      hero: {
        marker: 'selected work',
        title: 'Four platforms in production, and one product of our own.',
        lead: "We don't publish client names. What we can publish is the domain, the architecture, what shipped, and the numbers — which is most of what tells you whether we've built your shape of system before.",
      },
      shippedHeading: 'What we shipped',
      outcomeTag: 'Outcome',
      next: {
        marker: 'next',
        title: 'Building something in this territory?',
        lead: 'Tell us what you are building and what it has to do.',
      },
    },


    workingPage: {
      metaTitle: 'Working with us',
      metaDescription:
        'Six promises that keep clients with us, what an engagement looks like, and the quality bar every service ships against.',
      hero: {
        marker: 'how we work',
        title: 'Six promises that keep clients with us.',
        lead: "Every one of them is a refusal. That's deliberate — a promise about what we won't do is harder to fake than a claim about what we will.",
      },
      engagement: {
        marker: 'a sensible way to start',
        title: 'One service, end to end, in a short fixed window.',
        lead: 'Rather than a long discovery phase or an open-ended retainer, the first engagement is scoped so you get a real answer quickly — and a working system either way.',
      },
      bar: {
        marker: 'the quality bar',
        title: 'These are build failures, not review comments.',
        bullets: [
          { text: 'Two test suites: unit, and end-to-end integration against a real database.' },
          { text: '100% coverage enforced on both — statements, branches, functions and lines.' },
          { text: 'Every operation must be exercised by at least one end-to-end scenario, checked by the compiler.' },
          { text: "Response schemas enforced at runtime, so the published API description can't drift from what the service actually returns." },
        ],
        note: {
          tag: 'Why we can hold the line at 100%',
          text: "Because most of the code is generated and its tests are generated with it. Full coverage isn't a heroic effort by the team — it's the default state of a compiled service, and it stays there as the service grows.",
        },
        link: 'The method in full →',
      },
      team: {
        marker: 'what it means for your team',
        title: 'Leverage, not headcount reduction.',
        body: [
          "Backend teams usually grow because volume outpaces the people who can absorb it — more endpoints, more validation, more tests, more review, more knowledge stuck in one person's head.",
        ],
        bullets: [
          {
            strong: 'Engineers work at the level they were hired for.',
            text: 'Specs and judgment calls, rather than writing a fifth CRUD endpoint by hand and reviewing a sixth.',
          },
          {
            strong: 'Standards stop depending on seniority.',
            text: 'Conventions, security rules and quality bars are encoded in a generator applied to every service.',
          },
          {
            strong: 'New hires ramp on the spec, not the codebase.',
            text: 'A readable document instead of reconstructing intent from five thousand lines of handlers.',
          },
          {
            strong: 'Agent capacity turns into parallel work, not review burden.',
            text: 'Which is the usual failure mode of adding AI to a team.',
          },
        ],
      },
    },

    contactPage: {
      metaTitle: 'Contact',
      metaDescription:
        "Write, and we'll reply. Send a description of the system, how the work runs today, and anything you'd like it to do.",
      hero: {
        marker: "let's build it",
        title: "Write, and we'll reply.",
        lead: 'From then on your thoughts are busy with your priorities. So are ours.',
      },
      includeLabel: 'You can add:',
      include: [
        'A description of the system',
        'A description of your processes',
        "Anything you'd like",
      ],
      back: 'Back to the start',
      mailSubject: 'Project brief',
    },
  },
  'content/locales/en.ts',
);

export default en;
