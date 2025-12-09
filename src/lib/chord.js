

import * as d3 from "d3";
import { SUPABASE_URL, SUPABASE_KEY, PRIVATE_BUCKET, PUBLIC_BUCKET } from "./supabaseConfig.js";

const CFG = {
  WIDTH: 850,
  HEIGHT: 850,
  OUTER_PADDING: 80,
  ARC_THICK: 30,
  TRANSITION_MS: 800
};

// Color palette 
const colors = {
  sexist: "#b07beaff",
  political:"#f1e128ff",
  communal: "#b8e27d",
  casteist: "#4ae2cdff",
  racist: "#f05574ff",
  queerphobic: "#feb744ff",
  ablelist: "#7c7acaff"
};

/* ---------- Module-level data holders for percentages ---------- */
let pctColMatrix = null;
let pctGlobalMatrix = null;

/* ---------- Helpers ---------- */
function safe(str = "") {
  return String(str).replace(/[^a-zA-Z0-9]/g, "_");
}
function clear(node) {
  d3.select(node).selectAll("*").remove();
}
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

async function getSignedUrl(filename) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${PRIVATE_BUCKET}/${filename}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ expiresIn: 3600 })
    }
  );

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Signed URL request failed: ${res.status} ${text}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse Supabase signed URL response.");
  }

  const signed = data.signedURL;
  if (!signed) throw new Error("No signed URL returned by Supabase");

  // If absolute URL return it, else prepend base path
  if (signed.startsWith("http")) return signed;
  return `${SUPABASE_URL}/storage/v1${signed}`;
}

async function loadPublicJSON(filename) {
  const url = `${SUPABASE_URL}/storage/v1/object/public/${PUBLIC_BUCKET}/${filename}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load public JSON: ${filename}`);
  }
  return res.json();
}


export async function loadAllData() {
  // counts.json through signed URL, matching original logic
  const signedCountsUrl = await getSignedUrl("counts.json");
  const countsData = await fetch(signedCountsUrl).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch counts.json via signed URL");
    return r.json();
  });

  const pctColumn = await loadPublicJSON("percentage_column.json");
  const pctGlobal = await loadPublicJSON("percentage_global.json");

  // stash module-level matrices for tooltip logic
  pctColMatrix = pctColumn.data;
  pctGlobalMatrix = pctGlobal.data;

  const labels = countsData.columns;
  const matrix = countsData.data;

  return { labels, matrix, pctColMatrix, pctGlobalMatrix };
}


export function renderChord(containerNode, labels, matrix, step = "grayscale") {
  const container = d3.select(containerNode);
  const width = CFG.WIDTH;
  const height = CFG.HEIGHT;
  const outerRadius = Math.min(width, height) / 2 - CFG.OUTER_PADDING;
  const innerRadius = outerRadius - CFG.ARC_THICK;
  const color = d3.scaleOrdinal().domain(labels).range(labels.map(l => colors[l] || "#999"));

  const chords = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);

  clear(containerNode);

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("class", "chord-svg")
    .attr("style", "overflow: visible;");



  // center text group
  const center = svg
    .append("g")
    .attr("class", "center-text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("opacity", 0);

  center
    .append("text")
    .attr("y", -10)
    .attr("class", "center-main")
    .style("font-size", "22px")
    .style("font-weight", "600")
    .style("fill", "#444")
    .text("Shhor focuses on 8 types of hate");

  center
    .append("text")
    .attr("y", 25)
    .attr("class", "center-sub")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("cursor", "pointer")
    .text("See methodology for definitions");

  // defs & gradients
  const defs = svg.append("defs");
  createGradients(defs, chords, labels, color, innerRadius);

  // groups (arcs)
  const groupsG = svg.append("g").attr("class", "chord-groups");
  const group = groupsG
    .selectAll("g")
    .data(chords.groups)
    .join("g")
    .attr("class", "chord-group");

  group
    .append("path")
    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(outerRadius))
    .attr("fill", (d) => color(labels[d.index]))
    .attr("stroke", "none");

  group
    .append("text")
    .each((d) => {
      d.angle = (d.startAngle + d.endAngle) / 2;
    })
    .attr("dy", "0.35em")
    .attr("transform", (d) => {
      const angle = (d.angle * 180) / Math.PI - 90;
      return `rotate(${angle}) translate(${outerRadius + 8}) ${d.angle > Math.PI ? "rotate(180)" : ""}`;
    })
    .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : "start"))
    .text((d) => labels[d.index])
    .style("font-size", "13px");

  // ribbons
  const ribbonsG = svg.append("g").attr("class", "chord-ribbons").attr("fill-opacity", 0.8);
  const ribbonPaths = ribbonsG
    .selectAll("path")
    .data(chords)
    .join("path")
    .attr("d", d3.ribbon().radius(innerRadius))
    .attr("fill", (d) => {
      if (!d?.source || !d?.target) return "#ccc";
      return `url(#grad-${safe(labels[d.source.index])}-${safe(labels[d.target.index])})`;
    })
    .attr("stroke", "none")
    .attr("class", "chord-ribbon");

  ribbonPaths.append("title").text((d) => {
      if (!d?.source || !d?.target) return "";

      const i = d.source.index;
      const j = d.target.index;

      const A = labels[i];
      const B = labels[j];

      const pctAtoB = pctColMatrix?.[j]?.[i] ?? 0;
      const pctBtoA = pctColMatrix?.[i]?.[j] ?? 0;
      const globalPct = pctGlobalMatrix?.[i]?.[j] ?? 0;

      return `
  ${A} × ${B}
  ${pctAtoB.toFixed(2)}% of ${A} is ${B}
  ${pctBtoA.toFixed(2)}% of ${B} is ${A}
  Intersection: ${globalPct.toFixed(2)}% of total
  `.trim();
  });


  // static tooltip layer
  svg.append("g").attr("class", "static-tooltips");

  // initial styling
  applyStepStyling(svg, labels, color, step, false);
}

/**
 * updateChord(containerNode, labels, matrix, step)
 * - updates an existing svg in-place when step changes
 * - if svg is missing, calls renderChord to re-create it.
 */
export function updateChord(containerNode, labels, matrix, step) {

  if (step === "grayscale") {
      d3.selectAll(".center-text").attr("display", "none");
    } else {
      d3.selectAll(".center-text").attr("display", null);
    }

  if (step === "full") {
    // remove lingering highlights from previous steps
    d3.selectAll(".arc").classed("active", false);
    d3.selectAll(".chord").classed("fade", false);
    d3.selectAll(".static-tooltips").style("opacity", 0);  // hide tooltips
  }

  const container = d3.select(containerNode);
  const svg = container.select("svg");
  if (svg.empty()) {
    renderChord(containerNode, labels, matrix, step);
    return;
  }

  const color = d3.scaleOrdinal().domain(labels).range(labels.map(l => colors[l] || "#999999ff"));

  // recompute chords & gradients (angles may change)
  const chords = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);
  createGradients(svg.select("defs"), chords, labels, color, Math.min(CFG.WIDTH, CFG.HEIGHT) / 2 - CFG.OUTER_PADDING - CFG.ARC_THICK);

  // apply style transitions and behaviors
  applyStepStyling(svg, labels, color, step, true);
}

/* ---------- Gradients ---------- */
function createGradients(defs, chords, labels, color, innerRadius) {
  defs.selectAll("linearGradient").remove();

  const gradients = defs
    .selectAll("linearGradient")
    .data(chords)
    .join("linearGradient")
    .attr("id", (d) => `grad-${safe(labels[d.source.index])}-${safe(labels[d.target.index])}`)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", (d) => {
      const a = (d.source.startAngle + d.source.endAngle) / 2 - Math.PI / 2;
      return Math.cos(a) * innerRadius;
    })
    .attr("y1", (d) => {
      const a = (d.source.startAngle + d.source.endAngle) / 2 - Math.PI / 2;
      return Math.sin(a) * innerRadius;
    })
    .attr("x2", (d) => {
      const a = (d.target.startAngle + d.target.endAngle) / 2 - Math.PI / 2;
      return Math.cos(a) * innerRadius;
    })
    .attr("y2", (d) => {
      const a = (d.target.startAngle + d.target.endAngle) / 2 - Math.PI / 2;
      return Math.sin(a) * innerRadius;
    });

  gradients.append("stop").attr("offset", "0%").attr("stop-color", (d) => color(labels[d.source.index]));
  gradients.append("stop").attr("offset", "100%").attr("stop-color", (d) => color(labels[d.target.index]));
}

/* ---------- Styling & Scene Functions (applyStepStyling) ---------- */
function applyStepStyling(svg, labels, color, step, withTransition = false) {
  const duration = withTransition ? CFG.TRANSITION_MS : 0;

  const centerText = svg.select(".center-text");
  const groups = svg.selectAll("g.chord-groups .chord-group");
  const arcPaths = groups.selectAll("path");
  const ribbonsAll = svg.selectAll("g.chord-ribbons .chord-ribbon");
  const ribbons = ribbonsAll.filter((d) => d && d.source && d.target);

  const idxSexist = labels.indexOf("sexist");
  const idxPolitical = labels.indexOf("political");
  const idxCommunal = labels.indexOf("communal");

  const highSexist = [
    labels.indexOf("political"),
    labels.indexOf("communal"),
    labels.indexOf("casteist"),
    labels.indexOf("queerphobic")
  ];

  const lowSexist = [
    labels.indexOf("racist"),
    labels.indexOf("ablelist")
  ];

  if (step === "grayscale") {
    svg.select(".static-tooltips").selectAll("*").remove();

    ribbons.transition().duration(duration)
      .attr("fill", "#f2e463ff")
      .attr("fill-opacity", 0.3)
      .attr("pointer-events", "none");

    groups.selectAll("path").transition().duration(duration)
      .attr("fill", "#ccc")
      .attr("fill-opacity", 0.4);

    groups.selectAll("text").transition().duration(duration)
      .style("fill", "#999");

    centerText.transition().duration(duration).style("opacity", 0);

    return;
  }

  if (step === "intro") {
    svg.select(".static-tooltips").selectAll("*").remove();

    groups.on("mouseover", null);
    groups.on("mouseout", null);
    ribbons.on("mouseover", null);
    ribbons.on("mouseout", null);
    arcPaths.on("mouseover", null);
    arcPaths.on("mouseout", null);


    ribbons.transition().duration(duration)
      .attr("fill-opacity", 0)
      .attr("pointer-events", "none");

    groups.selectAll("path").transition().duration(duration)
      .attr("fill", (d) => color(labels[d.index]))
      .attr("fill-opacity", 0.35);

    groups.selectAll("text").transition().duration(duration)
      .style("fill", "#222");

    centerText.transition().duration(duration).style("opacity", 1);

    return;
  }

  if (step === "explainer") {
  svg.select(".static-tooltips").selectAll("*").remove();
  
  ribbons.transition().duration(duration)
    .attr("fill", (d) => `url(#grad-${safe(labels[d.source.index])}-${safe(labels[d.target.index])})`)
    .attr("fill-opacity", 0.9)
    .attr("pointer-events", "auto");

  groups.selectAll("path").transition().duration(duration)
    .attr("fill", (d) => color(labels[d.index]))
    .attr("fill-opacity", 1);

  groups.selectAll("text").transition().duration(duration)
    .style("fill", "#222");

  // Add arc hover interaction for demonstration
  arcPaths.on("mouseover", function (event, d) {
    ribbons.attr("fill-opacity", (r) =>
      (r.source.index === d.index || r.target.index === d.index) ? 1 : 0.08
    );
  });

  arcPaths.on("mouseout", function () {
    ribbons.attr("fill-opacity", 0.9);
  });

  centerText.transition().duration(duration).style("opacity", 0);
  return;
}

  if (step === "sexist") {
    groups.on("mouseover", null);
    groups.on("mouseout", null);
    ribbons.on("mouseover", null);
    ribbons.on("mouseout", null);
    arcPaths.on("mouseover", null);
    arcPaths.on("mouseout", null);

    ribbons.transition().duration(duration)
      .attr("fill", (d) => `url(#grad-${safe(labels[d.source.index])}-${safe(labels[d.target.index])})`)
      .attr("fill-opacity", (d) => {
        const i = d.source.index;
        const j = d.target.index;
        const touchesSexist = (i === idxSexist || j === idxSexist);
        if (!touchesSexist) return 0.02;
        const otherSide = (i === idxSexist ? j : i);
        if (highSexist.includes(otherSide)) return 1.0;
        if (lowSexist.includes(otherSide)) return 0.4;
        return 0.1;
      })
      .attr("pointer-events", (d) => {
        const i = d.source.index;
        const j = d.target.index;
        return (i === idxSexist || j === idxSexist) ? "auto" : "none";
      });

    groups.selectAll("path").transition().duration(duration)
      .attr("fill", (d) => (d.index === idxSexist ? color(labels[d.index]) : "#ccc"))
      .attr("fill-opacity", (d) => (d.index === idxSexist ? 1 : 0.5));

    groups.selectAll("text").transition().duration(duration)
      .style("fill", (d) => (d.index === idxSexist ? "#222" : "#999"));

    centerText.transition().duration(duration).style("opacity", 0);

    setTimeout(() => {
      drawStaticTooltips(svg, labels, color, step);
    }, CFG.TRANSITION_MS);

    return;
  }

  if (step === "political") {
    groups.on("mouseover", null);
    groups.on("mouseout", null);
    ribbons.on("mouseover", null);
    ribbons.on("mouseout", null);
    arcPaths.on("mouseover", null);
    arcPaths.on("mouseout", null);

    ribbons.transition().duration(duration)
      .attr("fill", (d) => `url(#grad-${safe(labels[d.source.index])}-${safe(labels[d.target.index])})`)
      .attr("fill-opacity", (d) => {
        const i = d.source.index;
        const j = d.target.index;
        const touchesP = (i === idxPolitical || j === idxPolitical);
        const touchesC = (i === idxCommunal || j === idxCommunal);
        if (touchesP && touchesC) return 1.0;
        if (touchesP || touchesC) return 0.4;
        return 0.02;
      })
      .attr("pointer-events", (d) => {
        const i = d.source.index;
        const j = d.target.index;
        return (i === idxPolitical || j === idxPolitical || i === idxCommunal || j === idxCommunal) ? "auto" : "none";
      });

    groups.selectAll("path").transition().duration(duration)
      .attr("fill", (d) => (d.index === idxPolitical || d.index === idxCommunal ? color(labels[d.index]) : "#ccc"))
      .attr("fill-opacity", (d) => (d.index === idxPolitical || d.index === idxCommunal ? 1 : 0.5));

    groups.selectAll("text").transition().duration(duration)
      .style("fill", (d) => (d.index === idxPolitical || d.index === idxCommunal ? "#222" : "#999"));

    centerText.transition().duration(duration).style("opacity", 0);

    setTimeout(() => {
      drawStaticTooltips(svg, labels, color, step);
    }, CFG.TRANSITION_MS);
    return;
  }

    if (step === "full" || step === "end") {
    svg.select(".static-tooltips").selectAll("*").remove();

    ribbons
      .transition().duration(duration)
      .attr("fill", (d) => `url(#grad-${safe(labels[d.source.index])}-${safe(labels[d.target.index])})`)
      .attr("fill-opacity", 0.9)
      .attr("pointer-events", "auto");

    groups.selectAll("path")
      .transition().duration(duration)
      .attr("fill", (d) => color(labels[d.index]))
      .attr("fill-opacity", 1)
      .attr("pointer-events", "auto");

    groups.selectAll("text")
      .transition().duration(duration)
      .style("fill", "#222");

    
    arcPaths.on("mouseover", function (event, d) {
      ribbons
        .attr("fill-opacity", (r) =>
          (r.source.index === d.index || r.target.index === d.index) ? 1 : 0.08
        );
    });

    arcPaths.on("mouseout", function () {
      ribbons.attr("fill-opacity", 0.9);
    });

    centerText.transition().duration(duration).style("opacity", 0);

    return;
  }

}



/* ---------- Static tooltip drawing  ---------- */
function drawStaticTooltips(svg, labels, color, step) {
  const tooltipLayer = svg.select(".static-tooltips");
  tooltipLayer.selectAll("*").remove();

  // select ribbons that are visually opaque enough
  const ribbons = svg
    .selectAll("g.chord-ribbons .chord-ribbon")
    .filter(function () {
      const comp = window.getComputedStyle(this).getPropertyValue("fill-opacity");
      const op = parseFloat(comp || 0);
      return op >= 0.9;
    })
    .data();

  if (!ribbons.length) return;

  // unique unordered pairs
  const seen = new Set();
  const pairs = [];
  ribbons.forEach((d) => {
    const i = d.source.index;
    const j = d.target.index;
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (!seen.has(key)) {
      seen.add(key);
      pairs.push([i, j, d]);
    }
  });

  // geometry
  const outerRadius = Math.min(CFG.WIDTH, CFG.HEIGHT) / 2 - CFG.OUTER_PADDING;

  // measure label extents (best-effort)
  const labelNodes = svg.selectAll(".group text").nodes();
  let maxLabelY = -Infinity;
  labelNodes.forEach((n) => {
    try {
      const box = n.getBoundingClientRect();
      const svgBox = svg.node().getBoundingClientRect();
      const relativeY = box.y - svgBox.y - box.height / 2;
      if (relativeY > maxLabelY) maxLabelY = relativeY;
    } catch (e) {
      // ignore
    }
  });

  const bottomSafe = outerRadius + 70;
  const topSafe = -outerRadius - 60;
  const baseRadius = outerRadius + 90;

  // initial radial points
  const points = pairs.map(([i, j, d]) => {
    const angle = (d.source.startAngle + d.source.endAngle) / 2;
    return {
      i,
      j,
      d,
      angle,
      x: Math.cos(angle - Math.PI / 2) * baseRadius,
      y: Math.sin(angle - Math.PI / 2) * baseRadius,
      side: Math.cos(angle - Math.PI / 2) > 0 ? "right" : "left"
    };
  });

  // vertical collision resolve
  points.sort((a, b) => a.y - b.y);
  const minGap = 26;
  for (let k = 1; k < points.length; k++) {
    if (Math.abs(points[k].y - points[k - 1].y) < minGap) {
      points[k].y = points[k - 1].y + minGap;
    }
  }

  // constrain top/bottom
  points.forEach((p) => {
    if (p.y > bottomSafe) p.y = bottomSafe;
    if (p.y < topSafe) p.y = topSafe;
  });

  // gentle outward shift for bottom tooltips
  const bottomLift = 50;
  const sideShift = 250;

  points.forEach((p) => {
    if (p.y > 0) {
      p.y -= bottomLift;
      if (p.side === "right") p.x += sideShift;
      else p.x -= sideShift;
    }
  });

  // draw connectors & boxes
  points.forEach((p) => {
    const { i, j } = p;
    const A = labels[i];
    const B = labels[j];
    const pctAtoB = (pctColMatrix && pctColMatrix[j] && pctColMatrix[j][i])
      ? pctColMatrix[j][i]    // swapped
      : 0;

    const pctBtoA = (pctColMatrix && pctColMatrix[i] && pctColMatrix[i][j])
      ? pctColMatrix[i][j]    // swapped
      : 0;


    const sx = Math.cos(p.angle - Math.PI / 2) * outerRadius;
    const sy = Math.sin(p.angle - Math.PI / 2) * outerRadius;
    const cx = (sx + p.x) / 2;
    const cy = (sy + p.y) / 2 - 35;

    tooltipLayer
      .append("path")
      .attr("d", `M${sx},${sy} Q${cx},${cy} ${p.x},${p.y}`)
      .attr("stroke", color(labels[i]))
      .attr("stroke-width", 1.4)
      .attr("fill", "none")
      .attr("opacity", 0.85);

    const g = tooltipLayer.append("g").attr("transform", `translate(${p.x}, ${p.y})`);

    const title = g.append("text").attr("x", 6).attr("y", -10).attr("font-size", 12).attr("font-weight", 600).text(`${A} × ${B}`);
    const line1 = g.append("text").attr("x", 6).attr("y", 6).attr("font-size", 11).text(`${pctAtoB.toFixed(2)}% of ${A} is ${B}`);
    const line2 = g.append("text").attr("x", 6).attr("y", 22).attr("font-size", 11).text(`${pctBtoA.toFixed(2)}% of ${B} is ${A}`);

    const boxWidth = Math.max(title.node().getComputedTextLength(), line1.node().getComputedTextLength(), line2.node().getComputedTextLength()) + 14;
    const boxHeight = 56;

    g.insert("rect", "text")
      .attr("x", 0)
      .attr("y", -24)
      .attr("rx", 4)
      .attr("width", boxWidth)
      .attr("height", boxHeight)
      .attr("fill", "white")
      .attr("stroke", color(labels[i]))
      .attr("stroke-width", 1)
      .attr("opacity", 0.97);
  });
}
