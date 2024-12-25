export interface Keyword {
  word: string;
  color?: string;
  bgColor?: string;
  fontWeight?: number;
  fontSize?: string;
  spacingX?: string;
  spacingY?: string;
  paddingX?: string;
  paddingY?: string;
  style?: "background" | "border-bottom";
  borderStyle?: "dashed" | "solid" | "dotted";
  borderWidth?: string;
  borderColor?: string;
  onClick?: (match: string) => void;
}

interface HighlighterOptions {
  caseSensitive?: boolean;
}

class Highlighter {
  private text: string;
  private keywords: Keyword[];
  private caseSensitive: boolean;
  private container: HTMLElement | null = null;
  private clickHandler: ((e: Event) => void) | null = null;

  constructor(props: {
    text: string;
    keywords: Keyword[];
    options?: HighlighterOptions;
  }) {
    this.text = props.text;
    this.keywords = props.keywords;
    this.caseSensitive = props.options?.caseSensitive || false;
  }

  // Escape special regex characters
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Generate the highlighted HTML string
  public highlight(): string {
    let highlightedText = this.text;
    const alreadyHighlighted: Set<string> = new Set();

    this.keywords.forEach(
      ({
        word,
        color,
        bgColor,
        fontWeight,
        fontSize,
        spacingX,
        spacingY,
        paddingX,
        paddingY,
        style,
        borderStyle,
        borderWidth,
        borderColor,
        onClick,
      }) => {
        // Add word boundaries \b to match full words only
        const regex = new RegExp(
          `(?<!<span[^>]*>)\\b(${this.escapeRegExp(word)})\\b(?![^<]*<\/span>)`,
          this.caseSensitive ? "g" : "gi"
        );

        highlightedText = highlightedText.replace(regex, (match) => {
          if (alreadyHighlighted.has(match.toLowerCase())) {
            return match;
          }
          alreadyHighlighted.add(match.toLowerCase());

          const styles = [];
          styles.push(`color:${color}`);

          if (style === "border-bottom") {
            styles.push(
              `border-bottom:${borderWidth || "2px"} ${
                borderStyle || "solid"
              } ${borderColor || color}`
            );
          } else {
            // Default to background style
            styles.push(`background-color:${bgColor}`);
          }

          if (fontSize) styles.push(`font-size:${fontSize}`);
          if (fontWeight) styles.push(`font-weight:${fontWeight}`);
          if (spacingX) {
            styles.push(`margin-left:${spacingX}`);
            styles.push(`margin-right:${spacingX}`);
          }
          if (spacingY) {
            styles.push(`margin-top:${spacingY}`);
            styles.push(`margin-bottom:${spacingY}`);
          }
          if (paddingX) {
            styles.push(`padding-left:${paddingX}`);
            styles.push(`padding-right:${paddingX}`);
          }
          if (paddingY) {
            styles.push(`padding-top:${paddingY}`);
            styles.push(`padding-bottom:${paddingY}`);
          }
          if (onClick) {
            styles.push("cursor:pointer");
          }

          return `<span style="${styles.join("; ")}"${
            onClick ? ` data-keyword="${match}"` : ""
          }>${match}</span>`;
        });
      }
    );

    return highlightedText;
  }

  private setupClickHandlers(): void {
    if (!this.container) return;
    
    // Remove old handler if it exists
    if (this.clickHandler) {
      this.container.removeEventListener('click', this.clickHandler);
    }

    // Create new handler
    this.clickHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute('data-keyword')) {
        const match = target.getAttribute('data-keyword');
        const word = target.textContent;
        const keyword = this.keywords.find(k => k.word === word);
        if (keyword?.onClick && match) {
          keyword.onClick(match);
        }
      }
    };

    // Add new handler
    this.container.addEventListener('click', this.clickHandler);
  }

  // Render the highlighted string into an HTML element
  public render(container: HTMLElement): void {
    if (!container) {
      throw new Error("A valid HTML container must be provided.");
    }
    
    // Clean up old container if it exists
    if (this.container && this.clickHandler) {
      this.container.removeEventListener('click', this.clickHandler);
    }
    
    this.container = container;
    container.innerHTML = this.highlight();
    this.setupClickHandlers();
  }

  // Clean up method to remove event listeners
  public destroy(): void {
    if (this.container && this.clickHandler) {
      this.container.removeEventListener('click', this.clickHandler);
      this.container = null;
      this.clickHandler = null;
    }
  }

  // Add a new keyword
  public addKeyword(keyword: Keyword): void {
    this.keywords.push(keyword);
  }

  // Remove a keyword
  public removeKeyword(word: string): void {
    this.keywords = this.keywords.filter((keyword) => keyword.word !== word);
  }

  // Update the text
  public setText(text: string): void {
    this.text = text;
  }

  // Get the current text
  public getText(): string {
    return this.text;
  }

  // Set case sensitivity
  public setCaseSensitivity(caseSensitive: boolean): void {
    this.caseSensitive = caseSensitive;
  }
}

export default Highlighter;
