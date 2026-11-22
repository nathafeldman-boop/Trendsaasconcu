export type BlogCategory = "idees" | "creer" | "lancer" | "vendre" | "argent";

export type BlogPost = {
  slug: string;
  title: string;
  /** Meta description: 140-160 characters, says what the reader gets. */
  description: string;
  category: BlogCategory;
  /** Publication day (YYYY-MM-DD, Paris). A post is hidden until that day. */
  date: string;
  /**
   * Light Markdown: "## " and "### " headings, paragraphs, "- " and "1. "
   * lists, "> " callouts, **bold** and [links](/path).
   */
  body: string;
  faq?: { q: string; a: string }[];
};
