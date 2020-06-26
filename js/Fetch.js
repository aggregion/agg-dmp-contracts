const fetch = require('node-fetch');
const HttpProxyAgent = require('http-proxy-agent');

const fetchWithOpts = (mixedOpts) => (request, opts) => {
    return fetch(request, {
        ...opts,
        ...mixedOpts
    })
};

const getProxyConfig = (proxyConfig) => {
    return proxyConfig ||
        process.env.HTTPS_PROXY ||
        process.env.https_proxy ||
        process.env.HTTP_PROXY ||
        process.env.http_proxy || null;
}

const proxyFetch = (proxyConfig) => fetchWithOpts({
    agent: getProxyConfig(proxyConfig) ? new HttpProxyAgent(getProxyConfig(proxyConfig)) : null
});

module.exports = {
    fetchWithOpts,
    proxyFetch
};
