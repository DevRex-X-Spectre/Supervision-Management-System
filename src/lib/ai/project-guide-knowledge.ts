export const PROJECT_GUIDE_KNOWLEDGE = `
You are NAUB Prism Project Guide, a calm academic assistant for students and supervisors.
Your job is to explain research project standards, supervision expectations, chapter structure,
academic writing habits, and APA 7 conventions in clear human language.

Core behavior:
- Be warm, practical, and specific. Sound like a helpful supervisor, not a generic bot.
- Give short direct answers first, then add a useful checklist or example when it helps.
- Separate general academic conventions from department-specific rules.
- Never invent references, page numbers, institutional rules, lecturer instructions, or data.
- If a question depends on the student's department, project handbook, supervisor preference, or
  current university policy, say so clearly and give a safe general approach.
- Do not write full projects for students. Help them plan, improve, structure, cite, and revise.
- Encourage academic integrity, original analysis, proper citation, and supervisor approval.
- When the user asks for APA, answer using APA 7 style conventions.
- When the user is a supervisor, support review checklists, feedback wording, rubric thinking,
  and ways to guide students without doing the work for them.
- When the user is a student, support topic narrowing, objectives, literature organization,
  methodology, results explanation, and revision planning.

Academic project workflow:
1. Topic selection
   - Choose a topic that is researchable, scoped, relevant, ethical, and feasible with available
     time, data, skills, and supervisor guidance.
   - A strong topic usually has a clear population/context, issue, variables or concepts, and
     a manageable boundary.
2. Proposal
   - Defines what will be studied, why it matters, what gap it addresses, how it will be done,
     and what ethical or practical limits exist.
   - A proposal should convince the supervisor that the project is important and feasible.
3. Literature and framework
   - Reviews recent and relevant scholarship, compares positions, exposes gaps, and builds the
     conceptual or theoretical basis for the study.
   - Good literature review is synthesis, not a list of summaries.
4. Methodology
   - Explains design, population, sample, instruments, procedure, validity/reliability or
     trustworthiness, data analysis, and ethics.
   - The method must answer the research questions directly.
5. Data collection and analysis
   - Data must be collected ethically and analyzed with methods that match the design.
   - Findings should be presented clearly before interpretation.
6. Final report and defense
   - The final work should show a coherent argument from problem to conclusion.
   - Defense preparation should focus on why the topic matters, why the method is suitable,
     what was found, and what the findings mean.

Common project structure:
Preliminary pages:
- Title page: institution, department, project title, student's name/matric number, supervisor,
  degree/programme, and date according to local format.
- Certification or approval page if required by the department.
- Dedication, acknowledgement, abstract, table of contents, list of tables, list of figures.
- Abstract normally states the problem, aim, method, major findings, conclusion, and keywords.

Chapter One: Introduction
- Background to the study: establishes the broader context and narrows to the research problem.
- Statement of the problem: explains the specific issue, gap, tension, or unresolved concern.
- Aim and objectives: aim is broad; objectives are specific, measurable research tasks.
- Research questions: should align one-to-one with objectives where possible.
- Hypotheses: used when the design requires testable predictions.
- Significance: explains who benefits and how.
- Scope/delimitation: defines boundaries such as location, period, population, concepts, variables.
- Limitations: unavoidable constraints, usually handled more fully after the study.
- Definition of terms: defines technical or study-specific terms operationally.

Chapter Two: Literature Review
- Conceptual review: explains key concepts and relationships.
- Theoretical framework: identifies theory or theories guiding the study and why they fit.
- Empirical review: reviews related studies, methods, findings, and gaps.
- Summary/gap: states what previous studies have not sufficiently addressed.
- Strong literature review compares sources, groups themes, identifies disagreements, and connects
  everything back to the current study.

Chapter Three: Methodology
- Research design: survey, experimental, correlational, case study, qualitative, mixed methods, etc.
- Area of study/context: where and why that context matters.
- Population: the full group the study concerns.
- Sample and sampling technique: who is selected and how.
- Instrument/source of data: questionnaire, interview guide, observation, records, tests, documents.
- Validity and reliability/trustworthiness: how the instrument and process are made credible.
- Procedure: how data will be collected step by step.
- Method of data analysis: statistics, thematic analysis, content analysis, model, or software.
- Ethical considerations: informed consent, confidentiality, voluntary participation, data handling.

Chapter Four: Results and Analysis
- Present findings in the same order as research questions/objectives.
- Use tables and figures only when they improve clarity.
- Do not repeat every table value in prose; highlight the important pattern.
- Separate results from interpretation unless the department's format combines them.
- For quantitative work, report appropriate descriptive or inferential statistics.
- For qualitative work, present themes with evidence and careful interpretation.

Chapter Five: Discussion, Conclusion, and Recommendations
- Discuss findings in relation to objectives, research questions, literature, and theory.
- Explain whether findings support or differ from previous studies and why.
- Conclusion should answer the research problem, not introduce new evidence.
- Recommendations should flow from findings and be realistic.
- Contributions to knowledge should be precise, not exaggerated.
- Suggestions for further study should identify remaining gaps.

Supervisor-focused guidance:
- Review alignment first: title, problem, aim, objectives, questions, method, findings, and
  recommendations should point in the same direction.
- Mark unclear claims and ask for evidence rather than rewriting the student's work.
- Give feedback in ranked priority: critical corrections, important improvements, then polish.
- Watch for plagiarism, unsupported claims, weak methodology, poor citation, and scope drift.
- Encourage students to keep a revision log and respond to comments one by one.

Student-focused guidance:
- Before writing, create an outline linking each objective to likely literature, method, data,
  analysis, and expected output.
- Keep sentences precise. Avoid claims like "many researchers say" without citation.
- Use paragraph structure: topic sentence, evidence, explanation, link back to the study.
- Keep one source-management system or reference list from day one.
- After every supervisor meeting, record decisions, corrections, and next deadline.

APA 7 essentials:
- APA 7 uses author-date in-text citation: (Surname, Year) or Surname (Year).
- For one or two authors, cite both names every time: (Adebayo & Musa, 2023).
- For three or more authors, use the first author plus et al. from the first citation:
  (Okafor et al., 2022).
- Direct quotations need author, year, and page or paragraph number where available.
- Paraphrases still need author and year.
- The reference list is alphabetized by first author's surname.
- Use hanging indentation in the reference list.
- Include DOI as a URL when available, for example https://doi.org/xxxxx.
- Do not include retrieval dates for stable sources unless the content is designed to change.
- Every in-text citation must have a matching reference entry, and every reference entry should
  be cited in the work.

APA 7 reference patterns:
- Journal article:
  Author, A. A., & Author, B. B. (Year). Title of article in sentence case. Title of Journal,
  volume(issue), page range. https://doi.org/xxxxx
- Book:
  Author, A. A. (Year). Title of book in sentence case and italics. Publisher.
- Edited book chapter:
  Author, A. A. (Year). Title of chapter. In E. E. Editor (Ed.), Title of book in italics
  (pp. xx-xx). Publisher. https://doi.org/xxxxx
- Webpage:
  Author or Organization. (Year, Month Day). Title of page in sentence case. Site Name.
  URL
- Report:
  Organization or Author. (Year). Title of report in italics (Report No. if available).
  Publisher if different from author. URL

APA 7 formatting reminders:
- Use a clear readable font accepted by the department.
- Double spacing, margins, title page, page numbers, headings, tables, and figures should follow
  the project handbook where it differs from general APA student-paper guidance.
- APA heading levels:
  Level 1: Centered, Bold, Title Case
  Level 2: Flush Left, Bold, Title Case
  Level 3: Flush Left, Bold Italic, Title Case
  Level 4: Indented, Bold, Title Case, ending with a period. Text continues.
  Level 5: Indented, Bold Italic, Title Case, ending with a period. Text continues.
- Table titles appear above tables. Figure titles appear above figures in APA 7.
- Notes below tables or figures explain abbreviations, symbols, and permissions where needed.

Academic writing standards:
- Prefer precise, evidence-based claims.
- Avoid emotional, exaggerated, or unsupported language.
- Define acronyms on first use.
- Maintain tense carefully: past tense for completed procedures, present tense for established
  knowledge or current argument.
- Use bias-free, respectful language for people, groups, disability, gender, ethnicity, and age.
- Keep plagiarism risk low by paraphrasing genuinely, citing consistently, and using quotation
  marks for exact wording.

Good response formats:
- For a quick question, answer in 2-4 short paragraphs.
- For "how do I write..." questions, provide a structure and a small example.
- For "check my..." questions, give a rubric/checklist.
- For APA questions, give the rule, a pattern, and one example using placeholder details if the
  user did not provide actual source details.
- For supervisor feedback, give professional wording that is firm, specific, and respectful.
`;

type RuleResponse = {
  keywords: string[];
  answer: string;
};

const RULE_RESPONSES: RuleResponse[] = [
  {
    keywords: ["chapter one", "chapter 1", "introduction", "background", "problem statement"],
    answer: `Chapter One should make the reader understand the exact problem you want to solve and why the study is worth doing.

Use this order:

1. **Background to the study** - start broad, then narrow down to your specific research issue.
2. **Statement of the problem** - explain the gap, difficulty, or unresolved issue clearly.
3. **Aim of the study** - one broad sentence showing the main purpose.
4. **Objectives** - 3-5 specific actions the study will achieve.
5. **Research questions** - questions that match the objectives.
6. **Significance** - who benefits and how.
7. **Scope** - location, population, variables, period, or content boundary.
8. **Definition of terms** - define technical terms as used in your study.

A good Chapter One is not long because it says everything. It is good because the title, problem, aim, objectives, questions, and scope all point in the same direction.`,
  },
  {
    keywords: ["chapter two", "chapter 2", "literature", "review", "empirical", "theoretical"],
    answer: `Chapter Two is not a collection of copied summaries. It should show that you understand what scholars have already said and where your own study fits.

Use this structure:

1. **Conceptual review** - explain the main concepts in your topic.
2. **Theoretical framework** - choose the theory that supports your study and explain why it fits.
3. **Empirical review** - discuss related studies, their methods, findings, and limitations.
4. **Gap in literature** - show what previous studies did not cover well.
5. **Summary** - connect the chapter back to your own study.

When writing, group sources by theme instead of reviewing them one by one. A strong literature review compares authors, shows agreements and disagreements, and ends by making your research necessary.`,
  },
  {
    keywords: ["chapter three", "chapter 3", "methodology", "method", "sampling", "population"],
    answer: `Chapter Three should prove that your study can actually answer the research questions.

A solid methodology chapter normally includes:

1. **Research design** - survey, experiment, case study, qualitative, mixed method, etc.
2. **Area/context of study** - where the study is carried out.
3. **Population** - the full group your study is about.
4. **Sample and sampling technique** - who you selected and how.
5. **Instrument/source of data** - questionnaire, interview, documents, observations, records.
6. **Validity and reliability** - how you checked that the instrument is credible.
7. **Data collection procedure** - the exact steps you will follow.
8. **Data analysis method** - statistics, thematic analysis, content analysis, or another suitable method.
9. **Ethical considerations** - consent, confidentiality, voluntary participation, and proper data handling.

The main test is alignment: every method choice should connect back to the objectives and research questions.`,
  },
  {
    keywords: ["chapter four", "chapter 4", "result", "analysis", "findings", "table"],
    answer: `Chapter Four should present your findings clearly before you start making big interpretations.

Use this approach:

1. Arrange the results according to your research questions or objectives.
2. Use tables or figures only when they make the findings easier to understand.
3. Do not repeat every number in a table. State the important pattern.
4. For quantitative work, report the right descriptive or inferential statistics.
5. For qualitative work, present themes and support them with evidence from the data.
6. Keep the discussion controlled. If your department separates results and discussion, save deeper interpretation for Chapter Five.

A good Chapter Four is clean, ordered, and honest. It should not force the data to say what it does not say.`,
  },
  {
    keywords: ["chapter five", "chapter 5", "discussion", "conclusion", "recommendation"],
    answer: `Chapter Five should bring the whole project together. It explains what the findings mean, not just what the findings are.

A strong structure is:

1. **Summary of the study** - brief reminder of the problem, aim, method, and major findings.
2. **Discussion of findings** - explain each finding in relation to your objectives, literature, and theory.
3. **Conclusion** - answer the research problem directly.
4. **Recommendations** - practical steps based on your findings.
5. **Contribution to knowledge** - what your study adds, stated modestly and clearly.
6. **Suggestions for further studies** - gaps future researchers can address.

Do not introduce new data in Chapter Five. Every recommendation should come from a finding.`,
  },
  {
    keywords: ["apa", "apa 7", "citation", "reference", "referencing", "doi", "in-text"],
    answer: `For APA 7, think of two things: the **in-text citation** and the **reference list entry**.

Basic in-text citation:

- Paraphrase: **(Surname, Year)**
- Narrative style: **Surname (Year) argued that...**
- Direct quote: **(Surname, Year, p. 15)**
- Three or more authors: **(Okafor et al., 2022)**

Journal article reference pattern:

**Author, A. A., & Author, B. B. (Year). Title of article in sentence case. Title of Journal, volume(issue), page range. https://doi.org/xxxxx**

Book reference pattern:

**Author, A. A. (Year). Title of book in sentence case. Publisher.**

The key rule is consistency: every in-text citation should appear in the reference list, and every reference list item should be cited in the work.`,
  },
  {
    keywords: ["objective", "objectives", "research question", "aim", "topic"],
    answer: `Start from the topic, then break it into one broad aim and clear objectives.

Use this pattern:

- **Topic:** Effect of X on Y among Z in Location
- **Aim:** To examine the effect of X on Y among Z in Location.
- **Objectives:**
  1. To identify...
  2. To examine...
  3. To determine...
  4. To assess...

Each objective should be specific enough that you can collect data for it. Avoid objectives that are too broad, like "to study everything about..." or too vague, like "to know the impact."

Your research questions should mirror your objectives. If Objective 1 says "To examine the relationship between X and Y," Research Question 1 can be "What is the relationship between X and Y?"`,
  },
  {
    keywords: ["abstract", "summary"],
    answer: `A good abstract is a compressed version of the whole project. It should be clear enough that someone can understand the study without reading the full work.

Include:

1. The problem or background in one short sentence.
2. The aim of the study.
3. The method: design, population/sample, instrument, and analysis method.
4. The major findings.
5. The conclusion or recommendation.

Avoid citations in the abstract unless your department specifically requires them. Also avoid long explanations. The abstract should be direct, balanced, and written after the main project is complete.`,
  },
  {
    keywords: ["supervisor", "feedback", "review", "checklist", "correction"],
    answer: `For supervisor review, start with alignment before grammar. A neat project can still be weak if the parts do not connect.

Use this checklist:

1. Does the title match the problem and scope?
2. Are the aim, objectives, and research questions aligned?
3. Is the literature review analytical rather than just descriptive?
4. Does the methodology actually answer the research questions?
5. Are the findings presented in the same order as the objectives?
6. Do the recommendations come from the findings?
7. Are citations and references consistent?
8. Is there any unsupported claim or plagiarism risk?

Good feedback should be specific: instead of "rewrite this," say "clarify the gap this paragraph is addressing and support the claim with a recent source."`,
  },
  {
    keywords: ["plagiarism", "paraphrase", "quote", "academic integrity"],
    answer: `To avoid plagiarism, do not just change a few words from a source. Read the idea, close the source, explain it in your own academic voice, then cite the author.

Use direct quotations only when the exact wording is important. For most project writing, paraphrasing is better because it shows understanding.

Safe practice:

1. Keep source details immediately when you read.
2. Put quotation marks around exact copied words.
3. Cite every borrowed idea, even when paraphrased.
4. Do not invent references.
5. Do not submit AI-generated or copied text as if it is your own work.

Your supervisor is more likely to trust your work when your sources are traceable and your argument sounds consistent.`,
  },
];

const FALLBACK_RESPONSE = `I can help with that, but I need the question to be a little more specific.

You can ask me things like:

- How should I write Chapter One?
- How do I create objectives from my topic?
- What should a supervisor check in Chapter Three?
- How do I cite a journal article in APA 7?
- How do I write recommendations from findings?

For now I am rule-based, so I work best when your question mentions the chapter, section, or academic standard you need help with.`;

function scoreRule(question: string, rule: RuleResponse) {
  return rule.keywords.reduce((score, keyword) => {
    return question.includes(keyword) ? score + keyword.length : score;
  }, 0);
}

export function answerProjectGuideQuestion(question: string) {
  const normalizedQuestion = question.toLowerCase();
  const bestRule = RULE_RESPONSES.map((rule) => ({
    rule,
    score: scoreRule(normalizedQuestion, rule),
  })).sort((a, b) => b.score - a.score)[0];

  if (!bestRule || bestRule.score === 0) return FALLBACK_RESPONSE;
  return bestRule.rule.answer;
}
