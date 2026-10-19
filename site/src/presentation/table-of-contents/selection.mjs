// Unknown fragments deliberately select nothing; only an empty fragment means Overview.
export function selectedHash(hash, knownHashes) {
  let decoded;
  try { decoded = decodeURIComponent(hash || '#_top'); }
  catch { return null; }
  return knownHashes.find(candidate => {
    try { return decodeURIComponent(candidate) === decoded; }
    catch { return false; }
  }) ?? null;
}
