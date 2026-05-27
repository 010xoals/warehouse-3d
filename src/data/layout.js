function createZoneBlocks(zone, zoneOffsetX = 0) {
  return [
    { zone, offsetX: zoneOffsetX, top: `${zone}01`, topStart: 35, topEnd: 68, bottom: `${zone}02`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}02`, topStart: 68, topEnd: 35, bottom: `${zone}03`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}03`, topStart: 68, topEnd: 35, bottom: `${zone}04`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}04`, topStart: 68, topEnd: 35, bottom: `${zone}05`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}05`, topStart: 68, topEnd: 35, bottom: `${zone}06`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}06`, topStart: 68, topEnd: 35, bottom: `${zone}07`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}07`, topStart: 68, topEnd: 35, bottom: `${zone}08`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}08`, topStart: 68, topEnd: 35, bottom: `${zone}09`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}09`, topStart: 68, topEnd: 35, bottom: `${zone}10`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}10`, topStart: 68, topEnd: 35, bottom: `${zone}11`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}11`, topStart: 68, topEnd: 35, bottom: `${zone}12`, bottomStart: 1, bottomEnd: 34 },
    { zone, offsetX: zoneOffsetX, top: `${zone}12`, topStart: 68, topEnd: 35, bottom: `${zone}13`, bottomStart: 1, bottomEnd: 34 },
  ];
}

export const blocks = [
  ...createZoneBlocks("J", 0),
  ...createZoneBlocks("K", 90),
  ...createZoneBlocks("L", 180),
];

export const levels = [
  { no: "01", y: 0.55 },
  { no: "02", y: 1.55 },
  { no: "03", y: 2.55 },
  { no: "04", y: 3.55 },
  { no: "05", y: 4.55 },
  { no: "06", y: 5.55 },
];

export const RACK = {
  width: 1.05,
  depth: 1.2,
  height: 6,
  spacing: 1.18,
  startX: -20,
  blockGap: 9,
  pairGap: 1.55,
};