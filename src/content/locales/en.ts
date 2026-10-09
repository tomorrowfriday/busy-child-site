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
      { href: '/what-you-get', label: '/what-you-get' },
      { href: '/work', label: '/work' },
      { href: '/method', label: '/method' },
      { href: '/working-with-us', label: '/working-with-us' },
      { href: '/contact', label: '/contact' },
    ],

    common: {
      sendBrief: 'Send a brief',
      seeWork: 'See the work',
      upwork: 'Upwork',
      upworkAlt: 'Or invite us on Upwork',
      sameDay: 'Same-business-day reply',
      skipToContent: 'Skip to content',
      switchLanguage: 'Мова',
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
        metricBig: 'Plug-in',
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
        title: 'Four systems. Four businesses that now run on them.',
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
        title: "Send a brief — you'll hear back the same business day.",
        lead: 'Tell us what you are building, or just what is slowing you down. That is the only thing we need to start a useful conversation.',
      },

      anchors: [
        { href: '#work', label: 'Work' },
        { href: '#results', label: 'Results' },
        { href: '#proof', label: 'Proof' },
        { href: '#contact', label: 'Contact' },
      ],

      headline: 'We build the software your business runs on, and prove it works before you see it.',


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
            title: 'Money that reconciles itself',
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
            title: 'Grows without hiring',
            detail: "Twice the volume doesn't mean twice the admin staff.",
          },
        ],
      },

      proof: {
        title: 'How we keep it from breaking',
        lead: 'Nothing reaches your business until it has passed all four steps — whether a person or AI wrote the code.',
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
        title: 'What you can count on',
        items: [
          'The senior partner who scopes it ships it',
          'You talk to engineers, not account managers',
          'Senior people only — no juniors learning on you',
          "Cost changes flagged before they're spent",
          'Short meetings, written decisions',
          'AI speeds us up, but every line is still reviewed',
        ],
      },

      closing: {
        title: "Tell us what's slowing you down.",
        lead: "One paragraph is enough. You'll hear back the same business day — from the people who'd build it.",
      },

      deck: {
        screens: [
          { label: 'Who we are', hint: '' },
          { label: 'Our work', hint: '4 platforms' },
          { label: 'Fundraise platform', hint: '$4M+/mo' },
          { label: 'Shift scheduling', hint: 'iOS+Android' },
          { label: 'Shift offer cascade', hint: 'plug-in' },
          { label: 'Claims portal', hint: '$1M/yr' },
          { label: 'What you get', hint: '' },
          { label: 'How we test', hint: '' },
          { label: 'How we work', hint: '' },
          { label: 'Start a project →', hint: '' },
        ],
        workCaption: 'Pick one to open it, or keep scrolling',
        methodLabel: 'How we test',
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
        cta: 'Want one like this? Send a brief',
      },

      editor: {
        specHead: 'docs/spec/ — edit me',
        outHead: 'generated — never edited',
        failHead: 'composer validate — failed',
        compiles: 'compiles',
        blocked: 'blocked',
        reset: 'Reset',
        role: 'Role',
        operation: 'Operation',
        assertions: 'Assertions',
        empty: 'No assertions. A scenario that asserts nothing proves nothing.',
        invalidLead:
          "Nothing is generated. The build stops here rather than emitting a test that doesn't match the spec.",
        proves: 'Proves',
        edited: 'Edited',
        editedText:
          'You changed the spec and the test changed with it — that is the only way to change what is verified.',
        specInvalid: '— spec invalid —',
        kinds: {
          excludesItem: 'does not include item',
          includesItem: 'includes item',
          fieldEquals: 'field equals',
          rejectedWith: 'is rejected with',
        },
      },

      runner: {
        run: 'Run the gates',
        runAgain: 'Run again',
        stop: 'Stop',
        breakLabel: 'Break',
        breakNothing: 'nothing — clean run',
        passed: 'build passed',
        failed: 'build failed',
        skipped: 'skipped',
        gatesWord: 'gates',
        neverRan: 'never ran',
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
        lead: "Send a brief and you'll hear back the same business day.",
      },
    },

    methodPage: {
      metaTitle: 'Method',
      metaDescription:
        'How we build software that does what it was promised to do: write it down first in plain English, generate most of it from that, and prove every change before it ships.',
      hero: {
        marker: 'how we build',
        title: 'Most software breaks because nobody wrote down what it was supposed to do.',
        body: [
          'So that is where we start. Before a line of code exists, we write one plain-English document describing exactly what your system does: every rule, every permission, every thing that must never be allowed to happen. You can read it. More usefully, you can disagree with it — while disagreeing still costs an edit rather than a rebuild.',
          'Then most of the system is built straight from that document — about 60% of it, produced the same way every time and edited by nobody, human or AI. Our engineers write the parts that genuinely need judgement. Nothing is improvised, and nothing quietly drifts away from what you agreed to.',
        ],
      },
      stages: [
        {
          title: 'Specification',
          detail:
            'Everything the system must do, written down in plain English: every record it keeps, every action it takes, who is allowed to do what, and what has to be true afterwards. When the document and the code disagree, the document is right.',
        },
        {
          title: 'Validation',
          detail:
            'A check that the document holds together on its own terms: nothing refers to something that does not exist, and no example names an action or a role we never defined. Contradictions surface here, while they are still free to fix.',
        },
        {
          title: 'Compilation',
          detail:
            'The document is turned into working software: the actions, the data, the checks on everything coming in, the permissions, and both sets of tests. Automatically, and identically every time.',
        },
        {
          title: 'Generation',
          detail:
            'Our engineers and their AI tools write what the document could not imply on its own — the real business logic. By this point that is a list of small, separately described jobs, not an open-ended "go build me a system".',
        },
        {
          title: 'Verification',
          detail: 'Every change runs the full set of checks. Nothing gets through because somebody was in a hurry.',
        },
        {
          title: 'Repair',
          detail:
            'When a check fails, the failure goes straight back and gets worked until everything passes. Nobody sits watching the retries.',
        },
        {
          title: 'Judgment',
          detail:
            'Where something raises a question the checks cannot settle, a senior engineer decides. Their time goes to the decisions, not to reading generated code line by line.',
        },
      ],
      pipeline: { marker: 'the pipeline', title: 'One path for a change, and no side door.' },
      whyItWorks: {
        marker: 'the question everyone asks first',
        title: 'Why is your AI-written code better than ours?',
        lead: 'The honest answer is not a better model or a cleverer prompt. It is that every hard decision was already made, in writing, before the AI was asked for anything at all.',
        body: [
          'An agent told to “build an activities service” is being asked to make a hundred coupled decisions at once — naming, structure, validation, error handling, tenancy, tests — with nothing to check itself against until the whole thing exists. That is the hardest possible shape of task to hand a model, and it is what ad-hoc prompting does.',
          "Here the compiler has already made those decisions. What's left isn't a service. It's a set of individual functions, each arriving with:",
        ],
        bullets: [
          { strong: 'A fixed signature,', text: 'because the call site is already generated.' },
          { strong: 'A one-sentence description of its job,', text: 'taken from the spec that declared it.' },
          { strong: 'Types on both sides,', text: 'generated from the same schemas, so a wrong shape is a compile error.' },
          { strong: 'A unit test already written,', text: "asserting it's invoked where the spec said it would be." },
        ],
        caption:
          'Thirteen lines, one responsibility, nothing to get architecturally wrong. Most agent-written units in our services are this size; the largest are well under a hundred lines. Work decomposed this far is close to the easiest thing current models do — and it is verified immediately, not after integration.',
        link: 'Here is a real example, complete. The spec declared a before step reading “Ensures that specified operation has a template,” and this is the entire unit of work the agent was handed:',
      },
      gates: {
        marker: 'verification',
        title: 'Eight checks. Any one of them fails and nothing ships.',
        caption:
          'The last row is worth pausing on. Output schemas are enforced at request time, not only in CI. A service that returns something it never promised fails loudly rather than shipping malformed data downstream.',
      },
      standard: {
        marker: 'the quality standard',
        title: 'Every line tested. Every feature proven end to end.',
        bullets: [
          {
            strong: 'Two suites, two jobs.',
            text: 'Unit tests cover every operation, helper and document method in isolation — operation tests are generated, asserting the security model, tags, mutation schema shape, output schema shape and each before step. Integration tests are compiled from spec scenarios and run end to end against a real database, across multiple roles and tenants.',
          },
          {
            strong: '100% coverage on both.',
            text: "Statements, branches, functions and lines, enforced as a threshold. The number is realistic here precisely because most of the code is generated and its tests are generated with it — full coverage isn't a heroic effort, it's the default state of a compiled service.",
          },
          {
            strong: 'Every operation is exercised by at least one scenario.',
            text: 'The compiler checks both directions. An endpoint that nothing tests end to end is a failed build, not a gap somebody notices six months later.',
          },
        ],
        note: {
          tag: 'Why this matters for procurement',
          text: 'Enterprise engineering standards almost always specify a coverage gate, and it is usually the requirement teams negotiate down — 80%, then 70%, then “new code only”. A generated codebase does not need the negotiation. The gate is set at 100% on day one and stays there as the service grows.',
        },
      },
      review: {
        marker: 'what code review becomes',
        title: 'Attention is the scarcest thing on a project. Most teams spend it in the wrong place.',
        body: [
          'A four-hundred-line pull request contains maybe forty lines that genuinely required a human decision; the rest is wiring, validation, error plumbing and test scaffolding. Reviewers spend their sharpest attention on the mechanical parts, arrive at the consequential part fatigued, and approve it. It is why large diffs get “LGTM” and small ones get argued about.',
        ],
        bullets: [
          {
            strong: "The generated half isn't reviewed, because reviewing it is meaningless.",
            text: "It's a deterministic function of the spec, already checked by validation, the type system and both suites.",
          },
          {
            strong: 'The other half gets the full budget.',
            text: 'The spec diff, and a handful of small agent-written functions.',
          },
          {
            strong: 'Reviewing a spec is design review.',
            text: 'Is this the right operation? Is it scoped to the right tenant? Because it happens before the implementation exists, being wrong costs a document edit instead of a rewrite.',
          },
          {
            strong: 'It widens who can review.',
            text: 'A spec diff is prose and structured English. The operations lead who knows how the domain should behave can read it and object — before the behaviour has been built.',
          },
        ],
      },
      economics: {
        marker: 'the same design makes it cheaper',
        title: 'You pay for what is genuinely new, not for how big the system is.',
        bullets: [
          {
            strong: 'Most of the code costs no tokens.',
            text: 'The generated 60% is emitted by a compiler in milliseconds. An agent never writes it, never reasons about it, never re-reads it for context.',
          },
          {
            strong: 'Regeneration is free.',
            text: 'Change the spec, recompile, and the whole generated surface updates — tests included. An agent-writes-everything workflow re-pays the full bill on every refactor.',
          },
          {
            strong: 'Context stays small.',
            text: "Each task is one function with a fixed signature, so quality doesn't degrade as the codebase outgrows the context window.",
          },
          {
            strong: 'Cheaper models become viable.',
            text: '“Design a multi-tenant service” needs frontier reasoning. “Write this function with this signature” does not — and the gates catch it if they do not.',
          },
        ],
      },
      api: {
        marker: 'what comes with it',
        title: 'Your other systems plug straight in — and stay plugged in.',
        body: [
          'Every service publishes its own OpenAPI description. What matters is that this one is verified three independent ways: it validates against the OpenAPI meta-schema before publishing; its schemas are the same objects the service validates requests and responses against at runtime, so there is no second copy to fall out of date; and the spec-coverage gate means no operation reaches it without an end-to-end test.',
          'Which means the frontend gets its client for free — TypeScript types, TanStack Query hooks, and a typed client that fails at compile time when the backend contract changes. A field renamed in the spec surfaces as a red squiggle in the web app before it ever surfaces as a bug.',
        ],
      },
      fit: {
        marker: 'where it applies',
        title: 'Where this pays off — and where we just build it the usual way.',
        bullets: [
          {
            strong: 'Where it earns its keep.',
            text: 'Systems a business actually runs on: anything with roles and permissions, money moving, an audit trail to defend, or several clients whose data must never meet.',
          },
          {
            strong: 'Replacing something old.',
            text: 'We write down what the replacement must do, then use the tests as proof it behaves like the thing it replaces — before you switch anyone over.',
          },
          {
            strong: 'Everything else.',
            text: 'Websites, mobile apps, integrations, automating something that still lives in a spreadsheet — we build those too, with the same senior people and the same standards, just without this particular machinery. Ask us either way.',
          },
        ],
      },
      start: {
        marker: 'a sensible way to start',
        title: 'Start with one thing. See how it feels to work this way.',
        caption:
          'You end up with something real and running, and a straight answer on whether this suits your team — before anyone commits to doing everything this way.',
      },
      pipelineLabels: {
        spec: 'spec/',
        validate: 'validate',
        build: 'build',
        agent: 'agent',
        gates: 'gates',
        specSub: 'plain English',
        validateSub: 'consistency',
        buildSub: '~60% generated',
        agentSub: '~40% written',
        gatesSub: '8 checks',
        ship: 'ship',
        repair: 'repair loop',
        humanApproved: 'human-approved',
        alt: 'Pipeline: a specification is validated, compiled into roughly 60% generated code, completed by an agent, then verified by eight gates before shipping. A failing gate returns to the agent as a repair loop.',
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
        'Send a brief and you will hear back the same business day. Tell us what you are building and what it has to do.',
      hero: {
        marker: "let's build it",
        title: "Send a brief — you'll hear back the same business day.",
        lead: "Tell us what you're building and what it has to do. That's genuinely all we need to start a useful conversation, and you'll be talking to the person who would do the work.",
      },
      brief: {
        marker: 'what to put in it',
        title: 'A useful brief is about five sentences.',
        lead: "Not a specification — we'll write that with you. Enough for us to tell you honestly whether we're the right team.",
        note: {
          tag: 'What happens next',
          text: "You get a reply the same business day from a senior engineer, not a form response. If we're not the right fit we'll say so in that first reply rather than booking a call to find out.",
        },
      },
      briefItems: [
        { title: 'What you are building', detail: 'The system and the business it serves. One paragraph is plenty.' },
        { title: 'What it has to do', detail: 'The two or three things that would make it a failure if they did not work.' },
        { title: 'What exists today', detail: 'A running system, a prototype, spreadsheets, or nothing yet. All four are normal.' },
        { title: 'Constraints that are real', detail: 'A date, a compliance regime, an incumbent stack you have to live with, a budget shape.' },
        { title: 'Who we would be working with', detail: 'Whether there is an in-house team, and whether they will own it afterwards.' },
      ],
      answers: {
        marker: 'straight answers',
        title: 'Before you write it.',
        bullets: [
          { strong: 'Do you take small projects?', text: 'Yes, if they are real. One service end to end is our preferred way to start.' },
          { strong: 'Can our team own the code afterwards?', text: 'That is the intended outcome. The specification is the handover artefact.' },
          { strong: 'Do you work with an existing in-house team?', text: 'Regularly. We work behind your gates, in your process, on your infrastructure.' },
          { strong: "Why don't you name your clients?", text: 'Most of our work is under NDA and we would rather respect that than trade it for a logo wall.' },
          { strong: 'Is there anything we can actually try?', text: 'Yes — Mines is ours, it is on the App Store, and it is the same team.' },
        ],
      },
      mailSubject: 'Project brief',
    },
  },
  'content/locales/en.ts',
);

export default en;
