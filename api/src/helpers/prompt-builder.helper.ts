/**
 * @typedef {Object} PromptComponent
 * @property {string} type - The type of prompt component (e.g., 'raw', 'directive', 'context').
 * @property {string} content - The main content of the prompt component.
 * @property {Record<string, any>} [options] - Additional options for the component (e.g., importance, label, explanation).
 */
type PromptComponent = {
  type:
    | "raw"
    | "table"
    | "instruction"
    | "context"
    | "rule"
    | "illustration"
    | "useCase"
    | "specialCase"
    | "custom";
  content: string;
  options?: Record<string, any>;
};

/**
 * Class for building structured prompts for LLMs (Large Language Models).
 */
export default class LLMPromptBuilder {
  private components: PromptComponent[];
  private globalContext: Record<string, any>;
  private userInputs: Record<string, any>;

  /**
   * Constructs a new LLMPromptBuilder instance.
   * @constructor
   */
  constructor() {
    this.components = [];
    this.globalContext = {};
    this.userInputs = {};
  }

  /**
   * Defines the global context for the prompt.
   * @param {Record<string, any>} context - A key-value pair representing the context.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  defineContext(context: Record<string, any>): LLMPromptBuilder {
    this.globalContext = { ...this.globalContext, ...context };
    return this;
  }

  /**
   * Adds plain text to the prompt.
   * @param {string} content - The plain text content to add.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addPlainText(content: string): LLMPromptBuilder {
    this.components.push({ type: "raw", content });
    return this;
  }

  /**
   * Adds a instructions to the prompt with an optional priority level.
   * @param {string} directive - The instruction to add.
   * @param {'high'|'medium'|'low'} [importance='medium'] - The priority level of the instruction.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addInstruction(
    instruction: string,
    importance: "high" | "medium" | "low" = "medium"
  ): LLMPromptBuilder {
    const instructionExists = this.components.find(
      (comp) => comp.type === "instruction"
    );
    if (instructionExists) {
      instructionExists.content += `\n- ${instruction}`;
      return this;
    }
    this.components.push({
      type: "instruction",
      content: instruction,
      options: { importance },
    });
    return this;
  }

  /**
   * Adds additional context to the prompt.
   * @param {string} context - The additional context to add.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addAdditionalContext(context: string): LLMPromptBuilder {
    this.components.push({ type: "context", content: context });
    return this;
  }

  /**
   * Adds a rule or constraint to the prompt.
   * @param {string} rule - The rule or constraint to add.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addRule(rule: string): LLMPromptBuilder {
    const ruleExists = this.components.find((c) => c.type === "rule");
    if (ruleExists) {
      ruleExists.content += `\n- ${rule}`;
      return this;
    }
    this.components.push({ type: "rule", content: rule });
    return this;
  }

  /**
   * Adds an illustration (example) to the prompt with an optional explanation.
   * @param {string} illustration - The example text to add.
   * @param {string} [explanation] - An optional explanation for the example.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addIllustration(
    illustration: string,
    explanation?: string
  ): LLMPromptBuilder {
    this.components.push({
      type: "illustration",
      content: illustration,
      options: { explanation },
    });
    return this;
  }

  /**
   * Adds a use case scenario to the prompt with an optional expected outcome.
   * @param {string} scenario - The scenario description to add.
   * @param {string} [expectedOutcome] - The optional expected outcome for the scenario.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addUseCase(scenario: string, expectedOutcome?: string): LLMPromptBuilder {
    this.components.push({
      type: "useCase",
      content: scenario,
      options: { expectedOutcome },
    });
    return this;
  }

  /**
   * Adds a special case with handling instructions to the prompt.
   * @param {string} specialCase - The special case description.
   * @param {string} handling - Instructions on how to handle the special case.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addSpecialCase(specialCase: string, handling: string): LLMPromptBuilder {
    this.components.push({
      type: "specialCase",
      content: specialCase,
      options: { handling },
    });
    return this;
  }

  /**
   * Adds a markdown table to the prompt. This enables the LLM to provide structured data for better understanding and processing.
   * @param {string[]} headers - An array of table headers.
   * @param {string[][]} rows - An array of arrays, each representing a row of data.
   * @param {string} [label] - An optional label for the table.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addTable(
    headers: string[],
    rows: string[][],
    label?: string
  ): LLMPromptBuilder {
    let tableContent = "";

    // Add label if provided
    if (label) {
      tableContent += `**${label}**\n\n`;
    }

    // Add headers
    tableContent += "| " + headers.join(" | ") + " |\n";

    // Add separator
    tableContent += "| " + headers.map(() => "---").join(" | ") + " |\n";

    // Add rows
    rows.forEach((row) => {
      tableContent += "| " + row.join(" | ") + " |\n";
    });

    this.components.push({
      type: "table",
      content: tableContent,
      options: { label: "Table" },
    });

    return this;
  }

  /**
   * Adds a custom block of content with a custom label to the prompt.
   * @param {string} label - A custom label for the content.
   * @param {string} content - The custom content.
   * @param {Record<string, any>} [options] - Additional options for the custom content.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  addCustomBlock(
    label: string,
    content: string,
    options?: Record<string, any>
  ): LLMPromptBuilder {
    this.components.push({
      type: "custom",
      content,
      options: { label, ...options },
    });
    return this;
  }

  /**
   * Defines variables to be used in the prompt.
   * @param {Record<string, any>} vars - A key-value pair representing variables.
   * @returns {LLMPromptBuilder} The instance of the prompt builder for chaining.
   */
  defineUserInputs(vars: Record<string, any>): LLMPromptBuilder {
    this.userInputs = { ...this.userInputs, ...vars };
    return this;
  }

  /**
   * Composes the final structured prompt for LLMs.
   * @returns {string} The fully composed prompt as a string.
   */
  compose(): string {
    let prompt = "";

    // Add global context if available
    if (Object.entries(this.globalContext).length > 0) {
      prompt +=
        "<global_context>\n" +
        Object.entries(this.globalContext)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n") +
        "\n</global_context>\n\n";
    }

    // Add components
    prompt += this.components
      .map((component) => this.renderComponent(component))
      .join("\n\n");

    // Add user inputs if available
    if (Object.keys(this.userInputs).length > 0) {
      prompt +=
        "\n\n<user_inputs>\n" +
        Object.entries(this.userInputs)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n") +
        "\n</user_inputs>";
    }

    return prompt;
  }

  /**
   * Renders a single component into a string based on its type.
   * @private
   * @param {PromptComponent} component - The prompt component to render.
   * @returns {string} The rendered component as a string.
   */
  private renderComponent(component: PromptComponent): string {
    switch (component.type) {
      case "raw":
        return component.content;
      case "instruction":
        const prefix =
          component.options?.importance === "high"
            ? "❗️"
            : component.options?.importance === "low"
            ? "💡"
            : "✅";
        return `<instruction>\n${prefix} ${component.content}\n</instruction>`;
      case "context":
        return component.content.length > 0
          ? `<context>\n${component.content}\n</context>`
          : "N/A";
      case "rule":
        return `<rule>\n${component.content}\n</rule>`;
      case "illustration":
        let illustrationText = `<illustration>\n${component.content}`;
        if (component.options?.explanation) {
          illustrationText += `\n*${component.options.explanation}*`;
        }
        return `${illustrationText}\n</illustration>`;
      case "useCase":
        let useCaseText = `<use_case>\n${component.content}`;
        if (component.options?.expectedOutcome) {
          useCaseText += `\n**Expected:** ${component.options.expectedOutcome}`;
        }
        return `${useCaseText}\n</use_case>`;
      case "specialCase":
        return `<special_case>\n${component.content}\n**Handling:** ${component.options?.handling}\n</special_case>`;
      case "custom":
        const label = component.options?.label
          .toLowerCase()
          .replace(/\s+/g, "_");
        return `<${label}>\n${component.content}\n</${label}>`;
      case "table":
        return `<table>\n${component.content}\n</table>`;
      default:
        return "";
    }
  }
}
