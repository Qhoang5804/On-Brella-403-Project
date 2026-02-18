module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" }, modules: "commonjs" }]],
  plugins: [
    // Replace import.meta.env with process.env so Jest can load config (Vite uses import.meta.env at build time).
    function replaceImportMetaEnv() {
      return {
        visitor: {
          MetaProperty(path) {
            if (path.node.meta.name === "import" && path.node.property.name === "meta") {
              const parent = path.parentPath;
              if (
                parent.isMemberExpression() &&
                parent.node.property.name === "env" &&
                parent.parentPath.isMemberExpression()
              ) {
                const envRef = parent.parentPath.node;
                parent.replaceWithSourceString("process.env");
              }
            }
          },
        },
      };
    },
  ],
};
