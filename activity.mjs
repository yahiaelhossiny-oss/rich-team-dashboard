const rules = [
  ['Creative direction', /creative direct/],
  ['Motion design and animation', /\bmotion\b|animat/],
  ['Copywriting', /copywrit|\bcopy\b|scriptwrit|voice.?over script/],
  ['Videography and production', /videograph|video edit|video production|episode production|\bfilming\b/],
  ['Social media management', /social media|community manag|content strategist|content calendar/],
  ['Performance marketing', /performance|paid media|paid search|paid social|media buy|\bppc\b/],
  ['Marketing management', /marketing manag|account manag|overall management/],
  ['Project management', /project manag|traffic manag|operations director/],
  ['Strategy', /\bstrategy\b|founder|\bceo\b/],
  ['CRM', /\bcrm\b|hubspot/],
  ['Web development', /web develop|development|\bcoding\b/],
  ['Design', /\bdesign\b|designers?\b|artwork|\bgraphic\b|\bui[ /-]ux\b/],
];

export const activities = [...rules.map(([name]) => name), 'Unclassified'];

function classify(value) {
  return rules.find(([, pattern]) => pattern.test(String(value || '').toLowerCase()))?.[0];
}

export function activityFor(entry, task, list, role) {
  const explicit = [entry.tags, task?.tags, entry.task?.tags].flatMap(tags => tags ?? [])
    .map(tag => String(tag?.name ?? tag).match(/^\s*(?:work type|activity)\s*:\s*(.+)/i)?.[1])
    .find(Boolean);
  if (explicit) return classify(explicit) || 'Unclassified';
  // Report the task discipline where the title is clear, then use the contributor’s role.
  const title = (task?.name || entry.task?.name || '').split('|').at(-1);
  return classify(title) || classify(role) || classify(list) || 'Unclassified';
}
