// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = {
    ...config,
    resolver: {
        ...config.resolver,
        assetExts: [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif'],
    },
    transformer: {
        ...config.transformer,
        minifierConfig: {
            keep_classnames: true,
            keep_fnames: true,
            mangle: {
                keep_classnames: true,
                keep_fnames: true,
            }
        }
    }
}
