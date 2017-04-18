(() => {
'use strict';
const request = require('request');
const mirrors = require('./mirrors.json');

let mirrors_info = mirrors.mirrors;
let repo_info = mirrors.repo;

function checkSite(result, url) {
  request({
    url: url,
    timeout: 5000,
    headers: {
      'User-Agent': 'AOSC Mirrors Monitor'
    }
  }, (err, res, data) => {
    result.lack = Date.now();
    if (err) {
      result.lupd = 0;
      result.status_desc = err;
      result.status = 0;
      return;
    }
    result.status = res.statusCode;
    result.lupd = parseInt(data.trim()) * 1000;
  });
}

function visitRepo() {
  checkSite(repo_info, repo_info.url + 'last_update');
}

function visitMirrors() {
  for (let i = 0; i < mirrors_info.length; i++) {
    mirrors_info[i].id = i + 1;
    checkSite(mirrors_info[i], mirrors_info[i].url + 'last_update');
  }
}

function refreshStatus() {
  return visitRepo() || visitMirrors();
}

function getMirrorsInfo() {
  if (mirrors_info && repo_info) return {
    mirrors: mirrors_info,
    repo_info: repo_info
  };
}

refreshStatus();
setInterval(refreshStatus, 300000);

module.exports.getMirrorsInfo = getMirrorsInfo;

})();
