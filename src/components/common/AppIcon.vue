<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 20,
  },
})

const paths = {
  grid: [
    { tag: 'rect', attrs: { x: '3', y: '3', width: '7', height: '7', rx: '1' } },
    { tag: 'rect', attrs: { x: '14', y: '3', width: '7', height: '7', rx: '1' } },
    { tag: 'rect', attrs: { x: '3', y: '14', width: '7', height: '7', rx: '1' } },
    { tag: 'rect', attrs: { x: '14', y: '14', width: '7', height: '7', rx: '1' } },
  ],
  users: [
    { tag: 'path', attrs: { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' } },
    { tag: 'circle', attrs: { cx: '9', cy: '7', r: '4' } },
    { tag: 'path', attrs: { d: 'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' } },
  ],
  file: [
    { tag: 'path', attrs: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' } },
    { tag: 'path', attrs: { d: 'M14 2v6h6M9 13h6M9 17h6' } },
  ],
  message: [
    { tag: 'path', attrs: { d: 'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z' } },
    { tag: 'path', attrs: { d: 'M8 9h8M8 13h5' } },
  ],
  pill: [
    { tag: 'path', attrs: { d: 'm10.5 20.5-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z' } },
    { tag: 'path', attrs: { d: 'm7 10 7 7' } },
  ],
  bed: [
    { tag: 'path', attrs: { d: 'M2 4v16M22 10v10M2 17h20M6 8v5M6 11h12a4 4 0 0 1 4 4v2H2v-4a2 2 0 0 1 2-2z' } },
  ],
  bell: [
    { tag: 'path', attrs: { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4' } },
  ],
  settings: [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } },
    { tag: 'path', attrs: { d: 'M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z' } },
  ],
  user: [
    { tag: 'circle', attrs: { cx: '12', cy: '8', r: '4' } },
    { tag: 'path', attrs: { d: 'M4 22a8 8 0 0 1 16 0' } },
  ],
  logout: [
    { tag: 'path', attrs: { d: 'M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6' } },
  ],
  search: [
    { tag: 'circle', attrs: { cx: '11', cy: '11', r: '7' } },
    { tag: 'path', attrs: { d: 'm20 20-4-4' } },
  ],
  plus: [{ tag: 'path', attrs: { d: 'M12 5v14M5 12h14' } }],
  chevron: [{ tag: 'path', attrs: { d: 'm9 18 6-6-6-6' } }],
  menu: [{ tag: 'path', attrs: { d: 'M4 6h16M4 12h16M4 18h16' } }],
  eye: [
    { tag: 'path', attrs: { d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z' } },
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } },
  ],
  edit: [
    { tag: 'path', attrs: { d: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z' } },
  ],
  check: [{ tag: 'path', attrs: { d: 'm5 12 4 4L19 6' } }],
  clock: [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
    { tag: 'path', attrs: { d: 'M12 7v5l3 2' } },
  ],
  alert: [
    { tag: 'path', attrs: { d: 'M10.3 3.7 2.4 18a2 2 0 0 0 1.75 3h15.7a2 2 0 0 0 1.75-3L13.7 3.7a2 2 0 0 0-3.4 0Z' } },
    { tag: 'path', attrs: { d: 'M12 9v4M12 17h.01' } },
  ],
  calendar: [
    { tag: 'rect', attrs: { x: '3', y: '5', width: '18', height: '16', rx: '2' } },
    { tag: 'path', attrs: { d: 'M16 3v4M8 3v4M3 10h18' } },
  ],
  lock: [
    { tag: 'rect', attrs: { x: '4', y: '10', width: '16', height: '11', rx: '2' } },
    { tag: 'path', attrs: { d: 'M8 10V7a4 4 0 0 1 8 0v3' } },
  ],
  shield: [
    { tag: 'path', attrs: { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z' } },
    { tag: 'path', attrs: { d: 'm9 12 2 2 4-4' } },
  ],
  x: [{ tag: 'path', attrs: { d: 'M6 6l12 12M18 6 6 18' } }],
  arrow: [{ tag: 'path', attrs: { d: 'M5 12h14M13 6l6 6-6 6' } }],
  home: [
    { tag: 'path', attrs: { d: 'M3 12L12 3l9 9' } },
    { tag: 'path', attrs: { d: 'M5 10v10a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1V10' } },
  ],
  stethoscope: [
    { tag: 'path', attrs: { d: 'M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3' } },
    { tag: 'path', attrs: { d: 'M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4' } },
    { tag: 'circle', attrs: { cx: '20', cy: '10', r: '2' } },
  ],
  clipboard: [
    { tag: 'rect', attrs: { x: '8', y: '2', width: '8', height: '4', rx: '1' } },
    { tag: 'path', attrs: { d: 'M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2' } },
    { tag: 'path', attrs: { d: 'M9 12h6M9 16h4' } },
  ],
  activity: [
    { tag: 'path', attrs: { d: 'M22 12h-4l-3 9L9 3l-3 9H2' } },
  ],
  cross: [
    { tag: 'path', attrs: { d: 'M9 3v6H3v6h6v6h6v-6h6V9h-6V3z' } },
  ],
  trash: [
    { tag: 'path', attrs: { d: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' } },
    { tag: 'path', attrs: { d: 'M10 11v6M14 11v6' } },
  ],
  hospital: [
    { tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18', rx: '2' } },
    { tag: 'path', attrs: { d: 'M9 8h6M12 5v6M9 15h2M13 15h2M10 21v-3h4v3' } },
  ],
  female: [
    { tag: 'circle', attrs: { cx: '12', cy: '9', r: '5' } },
    { tag: 'path', attrs: { d: 'M12 14v7M9 18h6' } },
  ],
  male: [
    { tag: 'circle', attrs: { cx: '10', cy: '14', r: '5' } },
    { tag: 'path', attrs: { d: 'M19 5l-5.4 5.4M19 5h-5M19 5v5' } },
  ],
  info: [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
    { tag: 'path', attrs: { d: 'M12 16v-4M12 8h.01' } },
  ],
  exchange: [
    { tag: 'path', attrs: { d: 'M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4' } },
  ],
  'heart-pulse': [
    { tag: 'path', attrs: { d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' } },
    { tag: 'path', attrs: { d: 'M3.2 12h5.3l1.5-3 2.5 7 2-4h5.5' } },
  ],
  'first-aid': [
    { tag: 'rect', attrs: { x: '3', y: '6', width: '18', height: '15', rx: '2' } },
    { tag: 'path', attrs: { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 10v7M8.5 13.5h7' } },
  ],
}
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-for="(el, i) in paths[name]" :key="i">
      <rect v-if="el.tag === 'rect'" v-bind="el.attrs" />
      <circle v-else-if="el.tag === 'circle'" v-bind="el.attrs" />
      <path v-else-if="el.tag === 'path'" v-bind="el.attrs" />
    </template>
  </svg>
</template>
