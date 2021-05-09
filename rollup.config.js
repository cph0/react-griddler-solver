import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
    input: pkg.source,
    output: [
        { file: pkg.main }
    ],
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
                exclude: ['**/*.stories.*'],
            },
        }),
        postcss({
            extract: true,
            modules: false,
            use: ['sass'],
        }),
        nodeResolve({
            // use "jsnext:main" if possible
            // see https://github.com/rollup/rollup/wiki/jsnext:main
            jsnext: true
        }),
        commonjs({ include: 'node_modules/**' }),
        babel({
            exclude: 'node_modules/**'
        }),
        del({ targets: ['dist/*'] }),
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
};