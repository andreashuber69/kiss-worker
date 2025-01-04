// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

// eslint-disable-next-line import/no-commonjs, import/unambiguous
module.exports = {
    env: {
        node: true,
        browser: true,
    },
    extends: ["@andreashuber69"],
    ignorePatterns: ["/code-doc/", "/coverage/", "/dist/"],
    rules: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "jsdoc/require-template": "off",
    },
};
