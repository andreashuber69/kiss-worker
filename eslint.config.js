import generalConfig from "@andreashuber69/eslint-config";

const config = [
    ...generalConfig,
    {
        files: ["src/**/*.ts"],
    },
    {
        ignores: ["code-doc/", "coverage/", "dist/"],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["*.js", "*.ts"],
                },
            },
        },
    },
];

// eslint-disable-next-line import/no-default-export
export default config;
