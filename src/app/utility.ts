// Taken from https://stackoverflow.com/a/36234242
export function cartesianProduct(arr: any[]) {
  return arr.reduce(function(a, b) {
      return a.map(function(x: any) {
          return b.map(function(y: any) {
              return x.concat([y]);
          })
      }).reduce(function(a: any, b: any) { return a.concat(b); }, [])
  }, [[]])
}

// Taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type: any) {
  let storage: any;
  try {
    storage = window[type];
    const x: string = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

export function localStoragaAvailable(): boolean {
  return storageAvailable("localStorage") === true;
}

export function compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}