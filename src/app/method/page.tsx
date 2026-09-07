import type { Metadata } from 'next';
import { Link } from '@/components/Link';
import { Footer, Masthead } from '@/components/Chrome';
import { Section, Specimen, Steps } from '@/components/Primitives';
import { GateRunner } from '@/components/GateRunner';
import { Pipeline } from '@/components/Pipeline';
import { engagement, gates } from '@/content/site';

export const metadata: Metadata = {
  title: 'Method',
  description:
    'DOS: we compile a written specification into a running API service. Roughly 60% of a finished service is generated deterministically and never edited by anyone — human or model.',
};


const AGENT_UNIT = `/** Validates that a template exists for the specified operation ID. */
const validateOperationId = async (context: Context, parameters: unknown): Promise<void> => {
  const operationId = got(parameters, 'mutation.operationId') as string;

  if (!config.has(\`templates.\${operationId}\`)) {
    throw new InvalidParametersError(\`Template for operation ID "\${operationId}" is not found\`);
  }
};`;

const PIPELINE_STAGES = [
  {
    title: 'Specification',
    detail:
      'Work starts as a cross-linked wiki in docs/spec/ describing every document, operation, permission and test scenario in plain English. It is the design source of truth: when spec and code disagree, the spec wins.',
  },
  {
    title: 'Validation',
    detail:
      "composer validate checks the spec's internal consistency — every type reference resolves, every operation's input and output attributes exist on its document, every scenario names a real operation and a real role.",
  },
  {
    title: 'Compilation',
    detail:
      'composer build generates the service: operations, schemas, validation, permission wiring, pagination, CRUD, and both test suites.',
  },
  {
    title: 'Generation',
    detail:
      'Coding agents write what the compiler cannot infer — business helpers, document methods, security policy. By this point that has been reduced to small, isolated, individually described functions.',
  },
  {
    title: 'Verification',
    detail: 'Every change runs the full stack of gates. Nothing merges by being waved through.',
  },
  {
    title: 'Repair',
    detail:
      'When a gate fails, the agent gets the failure and works it until the checks pass. No human babysitting the retry cycle.',
  },
  {
    title: 'Judgment',
    detail:
      "Where a failure raises a question the gates can't settle, an engineer decides. Engineer time goes to specs and judgment calls, not line-by-line review of generated code.",
  },
];

export default function MethodPage() {
  return (
    <>
      <Masthead current="/method" />
      <main id="main">
        <Section hero marker="DOS · spec-driven code generation">
          <h1>We compile a written specification into a running service.</h1>
          <p className="sub">
            The spec is a plain-English Markdown document. A compiler turns it into TypeScript
            operations, schemas and both test suites. Coding agents write the functions that remain.
            Roughly <span className="lit">60%</span> of a finished service is generated
            deterministically and never edited by anyone — human or model.
          </p>
          <p className="sub">
            This is not prompt-and-check. The high-volume, error-prone parts of an API service —
            input validation, output schemas, permission wiring, pagination, CRUD, test scaffolding
            — come out of a deterministic compiler, so they cannot drift from the spec.
          </p>
        </Section>

        <Section id="pipeline" marker="the pipeline">
          <h2>One path for a change, and no side door.</h2>
          <Pipeline />
          <Steps items={PIPELINE_STAGES} />
        </Section>

        <Section id="why-it-works" marker="the question everyone asks first">
          <h2>Why is your AI-written code better than ours?</h2>
          <p className="lead">
            The honest answer isn&apos;t a better model or a cleverer prompt. It&apos;s that the
            hard part was settled by a compiler before the model was asked anything.
          </p>
          <p>
            An agent told to &ldquo;build an activities service&rdquo; is being asked to make a
            hundred coupled decisions at once — naming, structure, validation, error handling,
            tenancy, tests — with nothing to check itself against until the whole thing exists.
            That is the hardest possible shape of task to hand a model, and it&apos;s what ad-hoc
            prompting does.
          </p>
          <p>
            Here the compiler has already made those decisions. What&apos;s left isn&apos;t a
            service. It&apos;s a set of individual functions, each arriving with:
          </p>
          <ul className="dash">
            <li>
              A <strong>fixed signature</strong>, because the call site is already generated.
            </li>
            <li>
              A <strong>one-sentence description of its job</strong>, taken from the spec that
              declared it.
            </li>
            <li>
              <strong>Types on both sides</strong>, generated from the same schemas, so a wrong
              shape is a compile error.
            </li>
            <li>
              A <strong>unit test already written</strong>, asserting it&apos;s invoked where the
              spec said it would be.
            </li>
          </ul>
          <p>
            Here is a real example, complete. The spec declared a <code>before</code> step reading
            &ldquo;Ensures that specified operation has a template,&rdquo; and this is the entire
            unit of work the agent was handed:
          </p>
          <Specimen source={AGENT_UNIT} />
          <p className="caption">
            Thirteen lines, one responsibility, nothing to get architecturally wrong. Most
            agent-written units in our services are this size; the largest are well under a hundred
            lines. Work decomposed this far is close to the easiest thing current models do — and
            it&apos;s verified immediately, not after integration.
          </p>
        </Section>

        <Section id="gates" marker="verification">
          <h2>Eight gates. Build failures, not review comments.</h2>
          <GateRunner gates={gates} />
          <p className="caption">
            The last row is worth pausing on. Output schemas are enforced at request time, not only
            in CI. A service that returns something it never promised fails loudly rather than
            shipping malformed data downstream.
          </p>
        </Section>

        <Section id="standard" marker="the quality standard">
          <h2>100% coverage, and a scenario for every operation.</h2>
          <ul className="dash">
            <li>
              <strong>Two suites, two jobs.</strong> Unit tests cover every operation, helper and
              document method in isolation — operation tests are generated, asserting the security
              model, tags, mutation schema shape, output schema shape and each <code>before</code>{' '}
              step. Integration tests are compiled from spec scenarios and run end to end against a
              real database, across multiple roles and tenants.
            </li>
            <li>
              <strong>100% coverage on both.</strong> Statements, branches, functions and lines,
              enforced as a threshold. The number is realistic here precisely because most of the
              code is generated and its tests are generated with it — full coverage isn&apos;t a
              heroic effort, it&apos;s the default state of a compiled service.
            </li>
            <li>
              <strong>Every operation is exercised by at least one scenario.</strong> The compiler
              checks both directions. An endpoint that nothing tests end to end is a failed build,
              not a gap somebody notices six months later.
            </li>
          </ul>
          <div className="note">
            <span className="tag">Why this matters for procurement</span>
            <p>
              Enterprise engineering standards almost always specify a coverage gate, and it is
              usually the requirement teams negotiate down — 80%, then 70%, then &ldquo;new code
              only&rdquo;. A generated codebase doesn&apos;t need the negotiation. The gate is set
              at 100% on day one and stays there as the service grows.
            </p>
          </div>
        </Section>

        <Section id="review" marker="what code review becomes">
          <h2>Review attention is a fixed budget. Most of it is normally spent badly.</h2>
          <p>
            A four-hundred-line pull request contains maybe forty lines that genuinely required a
            human decision; the rest is wiring, validation, error plumbing and test scaffolding.
            Reviewers spend their sharpest attention on the mechanical parts, arrive at the
            consequential part fatigued, and approve it. It is why large diffs get
            &ldquo;LGTM&rdquo; and small ones get argued about.
          </p>
          <ul className="dash">
            <li>
              <strong>The generated half isn&apos;t reviewed, because reviewing it is
              meaningless.</strong> It&apos;s a deterministic function of the spec, already checked
              by validation, the type system and both suites.
            </li>
            <li>
              <strong>The other half gets the full budget.</strong> The spec diff, and a handful of
              small agent-written functions.
            </li>
            <li>
              <strong>Reviewing a spec is design review.</strong> Is this the right operation? Is it
              scoped to the right tenant? Because it happens before the implementation exists, being
              wrong costs a document edit instead of a rewrite.
            </li>
            <li>
              <strong>It widens who can review.</strong> A spec diff is prose and structured
              English. The operations lead who knows how the domain should behave can read it and
              object — before the behaviour has been built.
            </li>
          </ul>
        </Section>

        <Section id="economics" marker="the same design makes it cheaper">
          <h2>Cost scales with the novel part of a service, not with its size.</h2>
          <ul className="dash">
            <li>
              <strong>Most of the code costs no tokens.</strong> The generated 60% is emitted by a
              compiler in milliseconds. An agent never writes it, never reasons about it, never
              re-reads it for context.
            </li>
            <li>
              <strong>Regeneration is free.</strong> Change the spec, recompile, and the whole
              generated surface updates — tests included. An agent-writes-everything workflow
              re-pays the full bill on every refactor.
            </li>
            <li>
              <strong>Context stays small.</strong> Each task is one function with a fixed
              signature, so quality doesn&apos;t degrade as the codebase outgrows the context
              window.
            </li>
            <li>
              <strong>Cheaper models become viable.</strong> &ldquo;Design a multi-tenant
              service&rdquo; needs frontier reasoning. &ldquo;Write this function with this
              signature&rdquo; doesn&apos;t — and the gates catch it if they don&apos;t.
            </li>
          </ul>
        </Section>

        <Section id="api" marker="what comes with it">
          <h2>A verified API description — and a typed client for free.</h2>
          <p>
            Every service publishes its own OpenAPI description. What matters is that this one is
            verified three independent ways: it validates against the OpenAPI meta-schema before
            publishing; its schemas are the same objects the service validates requests and
            responses against at runtime, so there is no second copy to fall out of date; and the
            spec-coverage gate means no operation reaches it without an end-to-end test.
          </p>
          <p>
            Which means the frontend gets its client for free — TypeScript types, TanStack Query
            hooks, and a typed client that fails at compile time when the backend contract changes.
            A field renamed in the spec surfaces as a red squiggle in the web app before it ever
            surfaces as a bug.
          </p>
        </Section>

        <Section id="fit" marker="where it applies">
          <h2>And where it doesn&apos;t.</h2>
          <ul className="dash">
            <li>
              <strong>Good fit.</strong> New API services. Consolidating logic scattered across
              ad-hoc endpoints. Systems where multi-tenant isolation and permission correctness
              matter.
            </li>
            <li>
              <strong>Rewrites, with a caveat.</strong> A legacy migration means specifying the
              target behaviour and using scenario tests as the parity harness. That&apos;s a rewrite
              behind a spec, not an in-place code transformation.
            </li>
            <li>
              <strong>Not a fit.</strong> CMS work, one-off site builds, backlog clearing. Those are
              ordinary engineering, and we do them as ordinary engineering. The platform
              doesn&apos;t build your frontend either — it supplies the typed client the frontend
              consumes.
            </li>
          </ul>
        </Section>

        <Section id="start" marker="a sensible way to start">
          <h2>One service, end to end, in a short fixed window.</h2>
          <Steps items={engagement} />
          <p>
            You end up with a working service and a concrete answer on whether spec-first suits how
            your team wants to work — before committing to retool around it.
          </p>
          <div className="cta">
            <Link className="button" href="/contact">
              Send a brief
            </Link>
            <Link className="button ghost" href="/working-with-us">
              How we work
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
