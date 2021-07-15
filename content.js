const inject = async (branch) => {
  console.log('[GooseMod for Web] Injecting...');

  /* // Re-define localStorage as Discord removes it
  function getLocalStoragePropertyDescriptor() {
    const frame = document.createElement('frame');
    frame.src = 'about:blank';
  
    document.body.appendChild(frame);
  
    let r = Object.getOwnPropertyDescriptor(frame.contentWindow, 'localStorage');
  
    frame.remove();
  
    return r;
  }
  
  Object.defineProperty(window, 'localStorage', getLocalStoragePropertyDescriptor());
  
  console.log('[GooseMod for Web] Redefined localStorage'); */

  const branchURLs = {
    release: 'https://api.goosemod.com/inject.js',
    dev: 'https://updates.goosemod.com/guapi/goosemod/dev',
    local: 'http://localhost:1234/index.js'
  };
  
  // const branch = storageCache['goosemodUntetheredBranch'] || 'local'; // 'release';

  console.log('[GooseMod for Web] Branch =', branch);
  console.log('[GooseMod for Web] JS Url =', branchURLs[branch]);
  
  const js = await (await fetch(branchURLs[branch])).text(); // JSON.parse(localStorage.getItem('goosemodCoreJSCache'));

  const el = document.createElement('script');
  
  el.appendChild(document.createTextNode(js));
  
  document.body.appendChild(el);

  console.log('[GooseMod for Web] Injected fetched JS');
};


// Extension Storage (v10)
let storageCache = {};

chrome.runtime.sendMessage({ storage: { type: 'get' } }, (response) => {
  storageCache = response; // Set storageCache

  // Delay actual injection to fix FF issues

  const el = document.createElement('script');

  el.appendChild(document.createTextNode(`(${inject.toString()})(${JSON.stringify(storageCache['goosemodUntetheredBranch'] || 'release')})`));

  document.body.appendChild(el);
});


document.addEventListener('gmes_get', ({ }) => {
  document.dispatchEvent(new CustomEvent('gmes_get_return', storageCache));
});

document.addEventListener('gmes_set', ({ key, value }) => {
  storageCache[key] = value; // Repopulate cache with updated value
  chrome.runtime.sendMessage({ storage: { type: 'set', key, value } }); // Actually store change
});

document.addEventListener('gmes_remove', ({ key }) => {
  delete storageCache[key]; // Repopulate cache with updated value
  chrome.runtime.sendMessage({ storage: { type: 'remove', key } }); // Actually store change
});