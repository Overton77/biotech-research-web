import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../biotech-kg/schema.graphql",
  documents: ["src/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "src/gql/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "graphql",
        fragmentMasking: false,
      },
    },
  },
};

export default config;
