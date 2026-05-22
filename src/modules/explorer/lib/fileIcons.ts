// Minimal monochrome file icons — single-character symbols
export function getFileIcon(name: string, isDir: boolean): string {
  if (isDir) {
    return "▸";
  }

  const ext = name.split(".").pop()?.toLowerCase() ?? "";

  const iconMap: Record<string, string> = {
    // Config
    json: "⚙",
    toml: "⚙",
    yaml: "⚙",
    yml: "⚙",
    ini: "⚙",
    conf: "⚙",
    config: "⚙",
    env: "⚙",
    lock: "⚙",

    // Web
    ts: "{}",
    tsx: "{}",
    js: "{}",
    jsx: "{}",
    mjs: "{}",
    css: "◎",
    scss: "◎",
    html: "◈",
    htm: "◈",
    svg: "◈",

    // Systems
    rs: "⚙",
    go: "⚙",
    py: "🐍",
    pyc: "🐍",
    rb: "◆",
    java: "◆",
    kt: "◆",
    scala: "◆",
    cpp: "◆",
    c: "◆",
    h: "◆",
    hpp: "◆",
    cs: "◆",
    swift: "◆",
    dart: "◆",

    // Shell
    sh: "$",
    bash: "$",
    zsh: "$",
    fish: "$",
    ps1: "$",
    bat: "$",
    cmd: "$",

    // Markup / Doc
    md: "◈",
    mdx: "◈",
    rst: "◈",
    txt: "▤",
    rtf: "▤",
    pdf: "▤",

    // Data
    sql: "▦",
    csv: "▦",
    xml: "▦",
    graphql: "▦",
    gql: "▦",

    // Images
    png: "▣",
    jpg: "▣",
    jpeg: "▣",
    gif: "▣",
    webp: "▣",
    ico: "▣",
    bmp: "▣",

    // Fonts
    ttf: "▢",
    otf: "▢",
    woff: "▢",
    woff2: "▢",

    // Git
    gitignore: "◊",
    gitattributes: "◊",
    gitmodules: "◊",

    // Docker
    dockerfile: "◉",
    dockerignore: "◉",
  };

  // Check full name for special files
  const nameLower = name.toLowerCase();
  if (nameLower === "dockerfile" || nameLower === "makefile" || nameLower === "cmakelists.txt") {
    return "◉";
  }
  if (nameLower.startsWith(".git")) return "◊";

  return iconMap[ext] ?? "▤";
}
