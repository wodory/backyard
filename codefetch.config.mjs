export default {
    // Output settings
    outputPath: "codefetch", // Directory for output files
    outputFile: "codebase.md", // Output filename
    maxTokens: 100_000, // Token limit
    disableLineNumbers: false, // Toggle line numbers in output

    // Processing options
    verbose: 1, // Logging level (0=none, 1=basic, 2=debug)
    projectTree: 2, // Project tree depth
    defaultIgnore: true, // Use default ignore patterns
    gitignore: true, // Respect .gitignore
    dryRun: false, // Output to console instead of file

    // Token handling
    tokenEncoder: "simple", // Token counting method (simple, p50k, o200k, cl100k)
    tokenLimiter: "truncated", // Token limiting strategy

    // File filtering
    extensions: [".ts", ".js", ".jsx", ".tsx"], // File extensions to include
    // includeFiles: ["/**/*.ts", "/**/*.js", "/**/*.jsx", "src/**/*.tsx"], // Files to include (glob patterns)
    excludeFiles: ["**/*.test.ts", "**/*.md", "**/*.mds", "**/*.db", "**/*.json", "**/*.sh"], // Files to exclude
    // includeDirs: ["src", "lib"], // Directories to include
    excludeDirs: ["test", "dist", ".note", ".cursor", ".vscode", ".vercel", "node_modules"], // Directories to exclude

    // AI/LLM settings
    trackedModels: [
        "chatgpt-4o-latest",
        "claude-3-5-sonnet-20241022",
        "o1",
        "deepseek-v3",
        "gemini-exp-1206",
    ],

    // Prompt handling
    prompt: "dev", // Built-in prompt or custom prompt file
    defaultChat: "https://chat.com", // Default chat URL
    templateVars: {}, // Variables for template substitution
}